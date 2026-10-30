const categorySchema = {
  type: "object", additionalProperties: false,
  properties: { score: { type: "number" }, label: { type: "string" }, strengths: { type: "array", items: { type: "string" } }, improvements: { type: "array", items: { type: "string" } }, tip: { type: "string" } },
  required: ["score", "label", "strengths", "improvements", "tip"],
};
export function evaluationSchema(phone: boolean) {
  const categoryKeys = phone ? ["name", "information", "engaging", "cta"] : ["rapport", "infoGathering", "needsIdentification", "cnaCompletion"];
  const properties: Record<string, unknown> = {
    overallScore: { type: "number" }, overallTip: { type: "string" },
    categories: { type: "object", additionalProperties: false, properties: Object.fromEntries(categoryKeys.map(key => [key, categorySchema])), required: categoryKeys },
  };
  if (phone) {
    properties.personalityType = { type: "object", additionalProperties: false, properties: {
      type: { type: "string" }, label: { type: "string" }, cue: { type: "string" }, adapted: { type: "boolean" }, adaptationNote: { type: "string" },
    }, required: ["type", "label", "cue", "adapted", "adaptationNote"] };
    properties.moments = { type: "array", items: { type: "object", additionalProperties: false, properties: {
      salespersonTurnIndex: { type: "integer" }, element: { type: "string" }, sentiment: { type: "string" }, note: { type: "string" },
    }, required: ["salespersonTurnIndex", "element", "sentiment", "note"] } };
  }
  return { type: "object", additionalProperties: false, properties, required: Object.keys(properties) };
}

export function parseEvaluation(content: string, phone: boolean): Record<string, unknown> {
  const result: unknown = JSON.parse(content);
  if (!result || typeof result !== "object" || !("overallScore" in result) || typeof result.overallScore !== "number" || !Number.isFinite(result.overallScore)
    || !("overallTip" in result) || typeof result.overallTip !== "string" || !("categories" in result) || !result.categories || typeof result.categories !== "object") throw new Error("Invalid evaluation");
  const categories = result.categories as Record<string, unknown>;
  for (const key of phone ? ["name", "information", "engaging", "cta"] : ["rapport", "infoGathering", "needsIdentification", "cnaCompletion"]) {
    const category = categories[key];
    if (!category || typeof category !== "object") throw new Error("Missing evaluation category");
    const c = category as Record<string, unknown>;
    if (typeof c.score !== "number" || !Number.isFinite(c.score) || typeof c.label !== "string" || typeof c.tip !== "string"
      || !Array.isArray(c.strengths) || !c.strengths.every(s => typeof s === "string") || !Array.isArray(c.improvements) || !c.improvements.every(s => typeof s === "string")) throw new Error("Invalid evaluation category");
  }
  if (phone) {
    const p = "personalityType" in result ? result.personalityType : null;
    if (!p || typeof p !== "object") throw new Error("Missing personality evaluation");
    const personality = p as Record<string, unknown>;
    if (typeof personality.adapted !== "boolean" || ["type", "label", "cue", "adaptationNote"].some(key => typeof personality[key] !== "string")) throw new Error("Invalid personality evaluation");
    if (!("moments" in result) || !Array.isArray(result.moments)) throw new Error("Missing evaluation moments");
    for (const m of result.moments) {
      if (!m || typeof m !== "object" || !Number.isInteger(m.salespersonTurnIndex) || m.salespersonTurnIndex < 0 || typeof m.element !== "string" || !["positive", "negative"].includes(m.sentiment) || typeof m.note !== "string") throw new Error("Invalid evaluation moment");
    }
  }
  return result as Record<string, unknown>;
}