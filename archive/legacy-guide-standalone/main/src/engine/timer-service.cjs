'use strict';

class TimerService {
  constructor(store, onFire, options = {}) {
    this.store = store;
    this.onFire = onFire;
    this.setTimeoutFn = options.setTimeoutFn ?? setTimeout;
    this.clearTimeoutFn = options.clearTimeoutFn ?? clearTimeout;
    this.handles = new Map();
  }

  create(durationMs, label = 'Таймер', meta = {}) {
    const safeDuration = Math.max(1_000, Math.min(durationMs, 7 * 24 * 60 * 60 * 1000));
    const timer = this.store.addTimer(safeDuration, label, meta);
    this.#schedule(timer);
    return timer;
  }

  restore() {
    for (const timer of this.store.activeTimers()) this.#schedule(timer);
  }

  cancel(id) {
    const handle = this.handles.get(id);
    if (handle) this.clearTimeoutFn(handle);
    this.handles.delete(id);
    return this.store.cancelTimer(id);
  }

  dispose() {
    for (const handle of this.handles.values()) this.clearTimeoutFn(handle);
    this.handles.clear();
  }

  #schedule(timer) {
    const remaining = Math.max(0, new Date(timer.dueAt).getTime() - Date.now());
    const handle = this.setTimeoutFn(() => {
      this.handles.delete(timer.id);
      const completed = this.store.completeTimer(timer.id);
      if (completed) this.onFire?.(completed);
    }, Math.min(remaining, 2_147_000_000));
    this.handles.set(timer.id, handle);
  }
}

module.exports = { TimerService };
