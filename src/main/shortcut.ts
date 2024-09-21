import {
  GlobalKeyboardListener,
  IGlobalKeyEvent,
  IGlobalKeyDownMap
} from 'node-global-key-listener'
import microtime from 'microtime'

export type ShortcutEvent = {
  keys: string[]
  eventAt: number
}
export type OnShortcutHandler = (event: ShortcutEvent) => void

export class ShortcutWatcher {
  listener: GlobalKeyboardListener | null
  onShortcutHandler: OnShortcutHandler | null
  requiredKeys: Readonly<string[]>
  previousEventAt: number | null
  constructor(requiredKeys: Readonly<string[]>) {
    this.requiredKeys = requiredKeys
    this.onShortcutHandler = null
    this.previousEventAt = null
    this.listener = null
  }

  start(onShortcutHandler: OnShortcutHandler): void {
    this.listener = new GlobalKeyboardListener()
    this.onShortcutHandler = onShortcutHandler
    this.listener.addListener(this.handler.bind(this))
    this.previousEventAt = null
  }

  dispose(): void {
    if (this.listener == null) return
    this.listener.kill()
    this.listener = null
    this.onShortcutHandler = null
    this.previousEventAt = null
  }

  private handler(event: IGlobalKeyEvent, isDown: IGlobalKeyDownMap): void {
    // まず時刻を求める
    const now = microtime.now()
    if (event.state !== 'UP') {
      // DOWNの場合
      this.previousEventAt = now
      return
    }
    // 前回イベント時刻が不明な場合はskip
    if (this.previousEventAt == null) return
    if (event.name == null || !this.requiredKeys.some((k) => isDown[k] === true)) return

    const currentKeys = Object.entries(isDown)
      .filter((o) => o[1] === true)
      .map((o) => o[0])
    currentKeys.push(event.name)

    try {
      if (this.onShortcutHandler == null) return
      this.onShortcutHandler({ keys: currentKeys, eventAt: this.previousEventAt })
    } finally {
      // 以降の一連のUPイベントをSKIPさせる
      this.previousEventAt = null
    }
    return
  }
}
