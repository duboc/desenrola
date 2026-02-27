import type { DesenrolaAPI } from '../../electron/preload'

declare global {
  interface Window {
    api: DesenrolaAPI
  }
}

export type { DesenrolaAPI }
