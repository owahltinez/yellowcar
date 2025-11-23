export const RULES = [
  "The color must be predominantly yellow.",
  "Metallic yellows (like Austin Yellow, Solarbeam Yellow) ARE acceptable, even if they shimmer like gold.",
  "Pastel yellows (like Vanilla Yellow) ARE acceptable, but must still be clearly YELLOW, not Beige.",
  "Cream, Beige, Bone, Sand, and Champagne are NOT yellow. They are off-white or light brown.",
  "However, actual Gold, Bronze, Copper, and dark Amber are impostors.",
  "Greenish variants (Lime, Acid Green, Chartreuse) are NOT yellow.",
  "At least 50% of the cab must be yellow, excluding anything being towed.",
  "The vehicle must have at least 4 wheels and be legally road-worthy.",
  "The vehicle must be a car.",
];

const GENAI_URL = "https://benci.fresho.workers.dev/generate/text";
const GENAI_API_KEY = "51088583-2ef8-4f11-bc94-26b401e19169";
export const GENAI_PROMPT = `
You are THE ORACLE, an ancient and ominous judge of color. Your sole purpose is to determine if the image contains a "Yellow Car".

THE LAWS OF THE ORACLE:
${RULES.map((x) => "* " + x).join("\n")}
* You must distinguish true yellow and its acceptable variants from its deceivers (Cream, Beige, Gold).
* Use these HEX color concepts as a guide (do not calculate exact pixels, but use the concept):
  - ACCEPTABLE YELLOWS: High Saturation or clear Yellow Hue. Examples:
    - Lemon (#FFF700)
    - Canary (#FFEF00)
    - Pastel/Vanilla Yellow (#FDFD96, #F3E5AB)
    - Metallic Yellow (#D4AF37 - closer to yellow than brown)
  - IMPOSTORS (NOT YELLOW):
    - Cream / Off-White: Very pale, lacking yellow hue. Examples: Cream (#FFFDD0), Bone (#E3DAC9).
    - Beige / Sand: Brownish undertone. Example: Beige (#F5F5DC), Khaki (#C3B091).
    - Gold / Bronze: Darker, brownish, low saturation.
    - Lime: Too much green.

Your response must be strict JSON. Do not use Markdown formatting (no \`\`\`json blocks). Return ONLY the JSON object:
{ "answer": <bool>, "reason": "THE ORACLE SAYS [Your ominous explanation]" }
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
    );
}
