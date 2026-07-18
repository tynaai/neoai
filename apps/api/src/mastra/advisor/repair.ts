// Rule-based, runs before the LLM. Patterns require the message to reference the bot's
// understanding directly ("ý em là", "hiểu sai"...), not bare "không phải X mà Y" — that's often
// just a preference contrast ("cần máy không phải êm mà cần mạnh"), not a correction.
//
// JS `\b` treats Vietnamese diacritics as non-word characters, so it silently fails right next to
// one (`/\bý/` never matches "ý em là"). Use Unicode-aware lookaround instead.
const NB = String.raw`(?<![\p{L}\p{N}])`
const NA = String.raw`(?![\p{L}\p{N}])`

const REPAIR_PATTERNS: RegExp[] = [
  new RegExp(`${NB}ý (em|tôi|mình) (là|muốn nói)${NA}`, 'iu'),
  new RegExp(`${NB}(hiểu sai|hiểu lầm|hiểu nhầm)${NA}`, 'iu'),
  new RegExp(`${NB}sai rồi${NA}`, 'iu'),
  new RegExp(`${NB}không (đúng|phải) ý (em|tôi|mình)${NA}`, 'iu'),
  new RegExp(`${NB}em (nói|hỏi) lại${NA}`, 'iu'),
  new RegExp(`${NB}không phải (như )?(vậy|thế|z)( đâu)?${NA}`, 'iu'),
  new RegExp(`${NB}(để|cho) (em|tôi|mình) (nói|nhắc) lại${NA}`, 'iu'),
]

export function detectRepair(message: string): boolean {
  return REPAIR_PATTERNS.some((re) => re.test(message))
}
