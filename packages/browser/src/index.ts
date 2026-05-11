import { Monitor, type Transport } from '@monitor/core'

import { ErrorsIntegration } from './intergrations/errors.js'
import { MetricsIntegration } from './intergrations/metrics.js'

function getUserInfo(): Record<string, unknown> {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    referrer: document.referrer,
    path: window.location.pathname,
  }
}

class BrowserTransport implements Transport {
  private dsn: string

  constructor(dsn: string) {
    this.dsn = dsn
  }

  send(data: Record<string, unknown>): void {
    fetch(this.dsn, {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        // 每個請求都附上用戶信息
        userInfo: getUserInfo(),
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch(error => {
      console.error('Failed to send data to server', error)
    })
  }
}

export function init(options: { dsn: string }) {
  const monitoring = new Monitor({
    dsn: options.dsn,
    integrations: [new ErrorsIntegration(), new MetricsIntegration()],
  })
  const transport = new BrowserTransport(options.dsn)
  monitoring.init(transport)

  return monitoring
}
