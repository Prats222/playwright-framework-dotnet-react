/// <reference types="vite/client" />

import type { DetailedHTMLProps, HTMLAttributes } from 'react'

type CustomElementProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & Record<string, unknown>

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'nb-card': CustomElementProps
      'nb-radio': CustomElementProps
      'nb-select': CustomElementProps
      'nb-option': CustomElementProps
      'nb-tooltip': CustomElementProps
      'ngx-header': CustomElementProps
      'ngx-temperature-dragger': CustomElementProps
      'input-editor': CustomElementProps
      'input-filter': CustomElementProps
    }
  }
}
