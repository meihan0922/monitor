import { IntegrationManager, type Transport } from '@monitor/core'

export class ErrorsIntegration extends IntegrationManager {
  init(transport: Transport): void {
    super.init(transport)
    window.addEventListener('error', event => {
      this.transport?.send({
        type: 'error',
        name: event.error.name,
        message: event.error.message,
        stack: event.error.stack,
        path: window.location.pathname,
      })
    })
    window.addEventListener('unhandledrejection', event => {
      this.transport?.send({
        type: 'error',
        name: 'Unhandled Promise Rejection',
        message: event.reason.message,
        stack: event.reason.stack,
        path: window.location.pathname,
      })
    })
  }
}
