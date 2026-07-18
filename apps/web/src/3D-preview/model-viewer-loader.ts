const MODEL_VIEWER_SRC =
  'https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js'

let modelViewerLoadPromise: Promise<void> | null = null

export const loadModelViewer = () => {
  if (typeof window === 'undefined') return Promise.resolve()

  if (customElements.get('model-viewer')) {
    return Promise.resolve()
  }

  if (modelViewerLoadPromise) {
    return modelViewerLoadPromise
  }

  modelViewerLoadPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${MODEL_VIEWER_SRC}"]`,
    )

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true })
      existingScript.addEventListener('error', reject, { once: true })
      return
    }

    const script = document.createElement('script')
    script.type = 'module'
    script.src = MODEL_VIEWER_SRC
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Không tải được model-viewer.'))
    document.head.appendChild(script)
  })

  return modelViewerLoadPromise
}
