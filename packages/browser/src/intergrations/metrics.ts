import type { Transport } from '@monitor/core'
import { IntegrationManager } from '@monitor/core'
import type { Metric } from 'web-vitals'
import { onCLS, onFCP, onLCP, onTTFB } from 'web-vitals'

function metricToRecord(metric: Metric): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    type: 'web-vital',
    name: metric.name,
    value: metric.value,
    delta: metric.delta,
    id: metric.id,
    rating: metric.rating,
    path: window.location.pathname,
  }
  if (metric.navigationType !== undefined) {
    payload.navigationType = metric.navigationType
  }
  return payload
}

/**
 * 從首次發起文檔請求到 window `load` 完成（loadEventEnd）的耗時（毫秒）
 * 第一次進入／整頁導覽的時間；SPA 內只靠前端路由換頁時，瀏覽器不會再跑一次完整 navigation，就不會自動再送一筆新的 page-load
 */
function buildPageLoadRecord(): Record<string, unknown> | null {
  // 得到所有導航資料，取第一筆
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
  if (!nav || nav.loadEventEnd <= 0) {
    return null
  }
  const t0 = nav.fetchStart
  const payload: Record<string, unknown> = {
    type: 'page-load',
    path: window.location.pathname,
    loadDurationMs: Math.round(nav.loadEventEnd - t0),
    navigationType: nav.type,
  }
  if (nav.domContentLoadedEventEnd > 0) {
    payload.domContentLoadedMs = Math.round(nav.domContentLoadedEventEnd - t0)
  }
  return payload
}

function onPageLoadComplete(callback: () => void): void {
  if (document.readyState === 'complete') {
    queueMicrotask(callback)
    return
  }
  window.addEventListener(
    'load',
    () => {
      callback()
    },
    { once: true },
  )
}

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
