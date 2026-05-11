export function getDataSource(): "local" | "supabase" {
  const override = localStorage.getItem("nihongo-data-source")
  if (override) return override === "local" ? "local" : "supabase"
  return import.meta.env.VITE_DATA_SOURCE === "local" ? "local" : "supabase"
}

export function setDataSource(mode: "local" | "supabase") {
  localStorage.setItem("nihongo-data-source", mode)
}

export function isLocal(): boolean {
  return getDataSource() === "local"
}
