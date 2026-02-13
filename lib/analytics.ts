export function analyticsEnabled() {
  return Boolean(process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true");
}

export function trackServerEvent(event: string, payload: Record<string, unknown>) {
  if (!analyticsEnabled()) return;
  console.log("[analytics]", event, payload);
}
