// Used by the compare endpoint: one JSON object per newline as the response body streams in.
export async function readNdjsonLines(
  res: Response,
  onLine: (parsed: { type: string; [key: string]: unknown }) => void,
): Promise<void> {
  if (!res.body) throw new Error('Response has no body to stream')

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    let newlineIndex = buffer.indexOf('\n')
    while (newlineIndex !== -1) {
      const line = buffer.slice(0, newlineIndex)
      buffer = buffer.slice(newlineIndex + 1)
      newlineIndex = buffer.indexOf('\n')
      if (line.trim()) onLine(JSON.parse(line))
    }
  }
}
