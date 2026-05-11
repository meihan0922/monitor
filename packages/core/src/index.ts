import type { Transport } from './types.js'
import type { MonitorOptions } from './types.js'

export let getTransport: () => Transport | null = () => null

/**
 * 使用示例：
 * const monitoring = new Monitor({
 *   dsn: 'http://localhost:8080/api/v1/monitoring/reactRqL9vG',
 *   integrations: [new Errors(), new Metrics()],
 * })
 * 初始化監控實例，比如瀏覽器端用 fetch 實現 Transport
 * const transport = new BrowserTransport(options.dsn)
 * monitoring.init(transport)
 * monitoring.reportMessage("test message")
 */
export class Monitor {
  private transport: Transport | null = null // 會在對應的宿主環境初始化
  private options: MonitorOptions | null = null

  constructor(options: MonitorOptions) {
    this.options = options
  }

  init(transport: Transport) {
    this.transport = transport
    getTransport = () => transport
    this.options!.integrations.forEach(integration => {
      integration.init(transport)
    })
  }

  reportMessage(message: Record<string, unknown>): void {
    this.transport?.send({
      type: 'message',
      message,
    })
  }

  reportEvent(event: Record<string, unknown>): void {
    this.transport?.send({
      type: 'event',
      event,
    })
  }
}
