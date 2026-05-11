# monitor

## @monitor/core

core 屬於抽象層，定義資料離開 SDK 的這段流程。不具體實作如何傳送。
傳輸的接口 `Transport`，讓監控資料與傳送兩段解耦，以適配不同的客戶端。

- 在瀏覽器端時，發送數據會使用 fetch、XMLHttpRequest、WebSocket。
- 在服務器端時，發送數據使用 HTTP、TCP、UDP request。

### 提供 Monitor

在 init 時儲存 transport，保留他的唯一性，並做 integrations （插件）初始化。

integrations 視為容器，處理各類監控的實例。執行初始化時，會將 transport 傳入，搜集數據。

使用示例：

```typescript
const monitoring = new Monitor({
  dsn: 'http://localhost:8080/api/v1/monitoring/reactRqL9vG',
  integrations: [new Errors(), new Metrics()],
})
// 初始化『傳送』，比如瀏覽器端用 fetch 實現 Transport
const transport = new BrowserTransport(options.dsn)
monitoring.init(transport)
monitoring.reportMessage('test message')
```

### 定義 integration

所有的插件，都繼承自 IntegrationManager 類，會將 transport 存進插件內部

```typescript
export class IntegrationManager implements Integration {
  protected transport: Transport | null = null

  init(transport: Transport): void {
    this.transport = transport
  }
}
```

依照用戶環境客製化時，必須繼承 IntegrationManager
比方 定義在 browser-utils 的 Metrics

```typescript
export class MetricsIntegration extends IntegrationManager {
  init(transport: Transport): void {
    super.init(transport)
    const report = (metric: Metric) => {
      this.transport?.send(metricToRecord(metric))
    }
    onCLS(report)
    onFCP(report)
    onLCP(report)
    onTTFB(report)

    onPageLoadComplete(() => {
      const record = buildPageLoadRecord()
      if (record) {
        this.transport?.send(record)
      }
    })
  }
}
```

## @monitor/browser

定義 browser 環境中的 transport 與監測

- Integration
  - ErrorsIntegration：處理錯誤的監測
  - MetricsIntegration：處理 web-vitals, onLoad 監測
- getUserInfo：在 `fetch` 後，每個請求都附上用戶信息 `getUserInfo`

最後 export `init` 給 apps 調用。
