import assert from "node:assert/strict";
import { test } from "node:test";
import { RULEBOOK, resolveCitations } from "./oracle.js";

test("rule IDs are unique and belong to their article", () => {
  const ids = RULEBOOK.flatMap((article) =>
    article.rules.map((rule) => {
      assert.ok(rule.id.startsWith(`${article.id}.`), rule.id);
      return rule.id;
    }),
  );
  assert.equal(new Set(ids).size, ids.length);
});

test("resolves cited IDs to verbatim rules", () => {
  const [rule] = resolveCitations(["IV.4"]);
  assert.equal(rule.id, "IV.4");
  assert.match(rule.text, /Orange/);
});

test("drops unknown IDs and duplicates", () => {
  const ids = resolveCitations(["II.1", "IX.9", "II.1", "made up"]).map(
    (r) => r.id,
  );
  assert.deepEqual(ids, ["II.1"]);
});

test("tolerates section signs and whitespace", () => {
  const ids = resolveCitations(["§III.1", " § IV.2 "]).map((r) => r.id);
  assert.deepEqual(ids, ["III.1", "IV.2"]);
});

test("returns nothing when citations are missing or malformed", () => {
  assert.deepEqual(resolveCitations(undefined), []);
  assert.deepEqual(resolveCitations("II.1"), []);
});
