const CACHE_NAME = "sw";
const GENAI_PROVIDER = "vertexai";
const GENAI_URL = "https://functions.fresho.workers.dev/genai/completion.txt";
const GENAI_API_KEY = "eaee5f98-1e95-46e3-aa52-936da273c24d";
const GENAI_PROMPT = `
We are playing a game of "spot the yellow car". As as AI-powered judge, your
role is to determine whether the picture contains a yellow car and the
rationale for your determination. You should use a very ominous tone, refer
to yourself as "THE ORACLE" in the third person and start the rationale with
"THE ORACLE SAYS". The rules are:

* The color must be predominantly yellow, not a variant like yellowish lime green or even beige.
* At least 50% of the cab must be yellow, excluding anything being towed.
* The vehicle must have at least 4 wheels and be legally road-worthy.
* Non-car vehicles such as buses or construction equipment are not considered yellow cars.

Your response should be in JSON. It will be parsed as JSON as-is, so do not
include anything other than the JSON portion. Here's the expected format:

{ "answer": <bool>, "reason": "THE ORACLE SAYS [...]" }

Response:

`;

async function throwableFetch(request) {
  const response = await fetch(request);
  if (!response.ok) throw new Error(await response.text());
  return response;
}

async function fetchAndCache(request) {
  const response = await caches.match(request);
  if (response) return response;
  const fetchedResponse = await throwableFetch(request);
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, fetchedResponse.clone());
  return fetchedResponse;
}

function handleOracleError(error) {
  console.error(error);
  return new Response(
    JSON.stringify({
      answer: Math.random() > 0.5,
      reason: "THE ORACLE has chosen not to explain itself.",
    })
  );
}

function looseParseJSON(text) {
  try {
    return JSON.parse(
      text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1)
    );
  } catch (e) {
    return null;
  }
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/api/oracle")) {
    event.respondWith(
      new Promise(async (resolve) => {
        const forwardUrl = new URL(GENAI_URL);
        forwardUrl.searchParams.set("provider", GENAI_PROVIDER);
        const forwardRequest = new Request(forwardUrl, {
          method: "POST",
          body: JSON.stringify({
            text: GENAI_PROMPT,
            media: await event.request.text(),
          }),
          headers: {
            "Content-Type": "application/json",
            "X-Fresho-Token": GENAI_API_KEY,
          },
        });
        return resolve(
          throwableFetch(forwardRequest)
            .then((res) =>
              res
                .text()
                .then(looseParseJSON)
                .then((data) => new Response(JSON.stringify(data)))
            )
            .catch(handleOracleError)
        );
      })
    );
  } else {
    event.respondWith(fetchAndCache(event.request.url));
  }
});
