// Parses normalized numeric facts out of the raw `specs` jsonb column at query time — `products`
// schema has no dedicated columns for these, and the candidate pool (1692 rows) is small enough
// that parsing in JS on every query is cheap.

export interface TuLanhFacts {
  capacityLiters: number | null
  householdSize: number | null
  powerKwhYear: number | null
  isInverter: boolean
}

function firstNumber(raw: unknown): number | null {
  if (typeof raw !== 'string') return null
  const match = raw.match(/\d+(?:[.,]\d+)?/)
  if (!match) return null
  return Number.parseFloat(match[0].replace(',', '.'))
}

function maxNumber(raw: string): number | null {
  const numbers = Array.from(raw.matchAll(/\d+(?:[.,]\d+)?/g), (m) => Number.parseFloat(m[0].replace(',', '.')))
  return numbers.length ? Math.max(...numbers) : null
}

// Only trust digits immediately before "người" — "Dung tích sử dụng" often reads "307 lít - 3 - 4
// người" (capacity AND people in one string); taking the overall max would return 307, not 4.
function extractHouseholdSize(raw: unknown): number | null {
  if (typeof raw !== 'string') return null
  const match = raw.match(/([\d\s-]+)\s*người/)
  return match ? maxNumber(match[1]) : null
}

// This field mixes units across brands under the same key ("kWh/năm", "W", "Wh", "kW/ngày", even
// a star-rating string) — comparing them directly would silently corrupt WSUM ranking. Only trust
// "kWh/năm"; treat everything else as missing rather than guess a conversion.
function extractAnnualKwh(raw: unknown): number | null {
  if (typeof raw !== 'string') return null
  if (!/kwh\s*\/\s*năm/i.test(raw)) return null
  return firstNumber(raw)
}

export function parseTuLanhFacts(specs: unknown): TuLanhFacts {
  const s = (specs ?? {}) as Record<string, unknown>

  const capacityLiters = firstNumber(s['Dung tích tổng']) ?? firstNumber(s['Dung tích sử dụng'])
  const householdSize = extractHouseholdSize(s['Số người sử dụng']) ?? extractHouseholdSize(s['Dung tích sử dụng'])
  const powerKwhYear = extractAnnualKwh(s['Công suất tiêu thụ công bố theo TCVN'])
  const techText = String(s['Công nghệ tiết kiệm điện'] ?? '')
  const isInverter = /inverter/i.test(techText)

  return { capacityLiters, householdSize, powerKwhYear, isInverter }
}
