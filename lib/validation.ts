import defaults from "@/data/content.json";
export function validateContent(
  value: unknown,
  template: unknown = defaults,
  key = "",
): boolean {
  if (typeof template === "string") {
    if (typeof value !== "string" || value.length > 5000) return false;
    if (["image", "logo"].includes(key))
      return /^\/(images\/[a-z0-9-]+\.(svg|png|jpg|webp)|api\/media\/[a-f0-9-]+\.(png|jpg|webp))$/.test(
        value,
      );
    if (/Url$/.test(key) || ["instagram", "whatsapp"].includes(key)) {
      if (value === "")
        return ["iosUrl", "androidUrl", "instagram", "whatsapp"].includes(key);
      try {
        return new URL(value).protocol === "https:";
      } catch {
        return false;
      }
    }
    return ["phone", "email"].includes(key) || value.trim().length > 0;
  }
  if (Array.isArray(template))
    return (
      Array.isArray(value) &&
      value.length >= 1 &&
      value.length <= 30 &&
      value.every((v) => validateContent(v, template[0]))
    );
  if (template && typeof template === "object") {
    if (!value || typeof value !== "object" || Array.isArray(value))
      return false;
    const t = template as Record<string, unknown>,
      v = value as Record<string, unknown>;
    return (
      Object.keys(v).length === Object.keys(t).length &&
      Object.keys(t).every((k) => validateContent(v[k], t[k], k))
    );
  }
  return false;
}
