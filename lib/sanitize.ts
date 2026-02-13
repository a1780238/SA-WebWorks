export function sanitizeText(value: string | undefined | null) {
  return (value ?? "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
