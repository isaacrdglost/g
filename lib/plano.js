export function isPro(profile) {
  if (!profile) return false;
  return profile.plano === "pro" || profile.plano === "anual";
}
