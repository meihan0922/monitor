import type { Integration, Transport } from './types.js'

// 所有的插件，都繼承自 IntegrationManager 類，將 transport 存進插件內
export class IntegrationManager implements Integration {
  protected transport: Transport | null = null

  init(transport: Transport): void {
    this.transport = transport
  }
}
