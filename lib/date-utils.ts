import { format } from "date-fns"

export function parseLocalDate(dateString?: string | null) {
  if (!dateString) return null

  const [year, month, day] = dateString.split("-").map(Number)
  if (!year || !month || !day) return null

  return new Date(year, month - 1, day)
}

export function formatLocalDate(dateString?: string | null, pattern = "MM/dd/yyyy") {
  const parsedDate = parseLocalDate(dateString)
  return parsedDate ? format(parsedDate, pattern) : ""
}
