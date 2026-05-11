/**
 * Transport 定義傳輸接口，用於發送數據，可以適配不同的客戶端
 * 是一個抽象層，不會定義具體的實現，只會定義接口
 * 瀏覽器端：fetch、XMLHttpRequest、WebSocket
 * 服務端：HTTP、TCP、UDP request
 */
export interface Transport {
  send(data: Record<string, unknown>): void
}

// 通過插件體系，把不同的採集插件化藉由 Transport 接入
// 比方 error 採集插件，需要實現 ErrorIntegration 接口、web-vitals 採集插件，需要實現 WebVitalsIntegration 接口
// 他們都必須要有 init 方法，用於初始化插件
export interface Integration {
  init(transport: Transport): void
}

export interface MonitorOptions {
  // 上報的服務位置
  dsn: string
  // 採集插件有哪些
  integrations: Integration[]
}
