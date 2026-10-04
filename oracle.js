export const RULEBOOK = [
  {
    id: "I",
    title: "Of the Car",
    rules: [
      {
        id: "I.1",
        text: "The vehicle must be a car, with at least four wheels and legally road-worthy.",
      },
      {
        id: "I.2",
        text: "The car must be drivable by anyone holding a standard car license. A vehicle that requires a special license, such as a bus, semi truck, or heavy truck, is not a car.",
      },
      {
        id: "I.3",
        text: "Motorcycles and construction equipment are not cars, whatever their color.",
      },
      {
        id: "I.4",
        text: "Anything being towed is not part of the car and shall not be considered.",
      },
    ],
  },
  {
    id: "II",
    title: "Of Yellowness",
    rules: [
      { id: "II.1", text: "The car must be predominantly yellow." },
      { id: "II.2", text: "At least 50% of the cab must be yellow." },
    ],
  },
  {
    id: "III",
    title: "Of Permitted Yellows",
    rules: [
      {
        id: "III.1",
        text: "Metallic yellows (like Austin Yellow, Solarbeam Yellow) are yellow, even if they shimmer like gold.",
      },
      {
        id: "III.2",
        text: "Pastel yellows (like Vanilla Yellow) are yellow, provided they are still clearly yellow and not beige.",
      },
      {
        id: "III.3",
        text: "A yellow with only a faint green or orange cast is still yellow. Impostors under IV.3 and IV.4 read as green or orange first.",
      },
    ],
  },
  {
    id: "IV",
    title: "Of Impostors",
    rules: [
      {
        id: "IV.1",
        text: "Cream, Beige, Bone, Sand, and Champagne are not yellow. They are off-white or light brown.",
      },
      {
        id: "IV.2",
        text: "Gold, Bronze, Copper, and dark Amber are not yellow. A yellow that merely shimmers like gold is permitted by III.1; a paint that is gold is not.",
      },
      {
        id: "IV.3",
        text: "Greenish variants (Lime, Acid Green, Chartreuse) are not yellow.",
      },
      {
        id: "IV.4",
        text: "Orange variants (Papaya, Tangerine, Neon Orange) are not yellow.",
      },
    ],
  },
  {
    id: "V",
    title: "Of the Reference Colors",
    rules: [
      {
        id: "V.1",
        text: "These colors illustrate the boundaries of yellow. They are judged by concept, not by measuring pixels.",
      },
      {
        id: "V.2",
        text: "Yellow has high saturation or a clear yellow hue: Lemon (#FFF700), Canary (#FFEF00), Pastel/Vanilla Yellow (#FDFD96, #F3E5AB), Metallic Yellow (#D4AF37, closer to yellow than brown).",
      },
      {
        id: "V.3",
        text: "Cream and Off-White are very pale and lack a yellow hue: Cream (#FFFDD0), Bone (#E3DAC9).",
      },
      {
        id: "V.4",
        text: "Beige and Sand have a brownish undertone: Beige (#F5F5DC), Khaki (#C3B091).",
      },
      {
        id: "V.5",
        text: "Gold and Bronze are darker, brownish, and low in saturation.",
      },
      { id: "V.6", text: "Lime has too much green." },
    ],
  },
];

const RULES_BY_ID = new Map(
  RULEBOOK.flatMap((article) => article.rules).map((rule) => [rule.id, rule]),
);

// Quotes come from the rulebook, never the model, so unknown IDs are dropped.
export function resolveCitations(ids) {
  if (!Array.isArray(ids)) return [];
  const normalized = ids.map((id) => String(id).trim().replace(/^§\s*/, ""));
  return [...new Set(normalized)]
    .map((id) => RULES_BY_ID.get(id))
    .filter(Boolean);
}

const GENAI_URL = "https://benci.fresho.workers.dev/generate/text";
const GENAI_MODEL = "~google/gemini-flash-latest";
const GENAI_API_KEY = "51088583-2ef8-4f11-bc94-26b401e19169";
export const GENAI_PROMPT = `
You are THE ORACLE, supreme and infallible arbiter of yellow. In the Yellow Car Game, one player has called a car yellow and another has challenged the call, summoning you to settle it. Your judgement is final, and you know it.

You are insufferably self-righteous. The Rulebook is sacred scripture and you are its only faithful interpreter. Judge the color impartially first; a challenge is no evidence either way. Then deliver your scorn: if the car is yellow, rebuke the challenger for doubting what was plain to see; if it is not, condemn the caller for their careless eyes and false claim. Never hedge, never apologize, never admit doubt.

THE RULEBOOK:
${RULEBOOK.map(
  (article) =>
    `Article ${article.id}: ${article.title}\n` +
    article.rules.map((rule) => `§${rule.id} ${rule.text}`).join("\n"),
).join("\n\n")}

HOW TO JUDGE:
* "answer" is true if the image contains a yellow car according to the Rulebook.
* "citations" lists the IDs of the rules that decided the matter (at least one, e.g. ["II.1", "IV.1"]).
* "reason" invokes those rules by section (e.g. "as §IV.1 plainly decrees") in two or three sentences.

Your response must be strict JSON. Do not use Markdown formatting (no \`\`\`json blocks). Return ONLY the JSON object:
{ "answer": <bool>, "citations": [<string>], "reason": "THE ORACLE SAYS [Your self-righteous explanation]" }
`;

async function throwableFetch(request) {
  const response = await fetch(request);
  if (!response.ok) throw new Error(await response.text());
  return response;
}

function looseParseJSON(text) {
  try {
    // 1. Try standard JSON.parse first
    return JSON.parse(text);
  } catch (e) {
    // 2. Try to extract from markdown block ```json ... ```
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
      try {
        return JSON.parse(match[1]);
      } catch (e2) {
        console.error("Failed to parse inner markdown JSON", e2);
      }
    }

    // 3. Fallback: Attempt to find the first '{' and last '}'
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start !== -1 && end !== -1 && end > start) {
      try {
        const jsonStr = text.substring(start, end + 1);
        return JSON.parse(jsonStr);
      } catch (e3) {
        console.error("Failed to parse extracted JSON substring", e3);
      }
    }

    throw new Error("Could not parse response as JSON");
  }
}

export async function callOracle(imageBase64OrUrl) {
  const forwardRequest = new Request(GENAI_URL, {
    method: "POST",
    body: JSON.stringify({
      prompt: GENAI_PROMPT,
      model: GENAI_MODEL,
      images: [imageBase64OrUrl],
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GENAI_API_KEY}`,
      Origin:
        typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost",
    },
  });

  return await throwableFetch(forwardRequest)
    .then((res) => res.json())
    .then((data) =>
      looseParseJSON(data.content || data.response || JSON.stringify(data)),
    )
    .then((verdict) => ({
      ...verdict,
      citations: resolveCitations(verdict.citations),
    }));
}
