const dateFormatter = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

// UTC keeps server and browser output identical, so hydration matches.
export function formatDate(iso: string) {
  return dateFormatter.format(new Date(iso));
}
