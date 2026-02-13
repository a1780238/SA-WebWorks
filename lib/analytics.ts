export function analyticsEnabled() {
  return process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true";
}

export function trackServerEvent(event: string, payload: Record<string, unknown>) {
  console.log("[analytics]", event, payload);
}
