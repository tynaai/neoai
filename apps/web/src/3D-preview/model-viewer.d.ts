import type { DetailedHTMLProps, HTMLAttributes } from 'react'

declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          src?: string
          poster?: string
          alt?: string
          ar?: boolean | string
          'ar-modes'?: string
          'camera-controls'?: boolean | string
          'auto-rotate'?: boolean | string
          'shadow-intensity'?: string
          exposure?: string
          'environment-image'?: string
          'interaction-prompt'?: string
        },
        HTMLElement
      >
    }
  }
}
