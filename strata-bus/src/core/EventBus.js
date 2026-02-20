/**
 * EventBus — lightweight pub/sub for cross-scene communication
 * Scenes and systems talk through here, never directly to each other.
 */
const EventBus = (function () {
  const listeners = {};

  return {
    on(event, callback, context) {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push({ callback, context });
      return this;
    },

    /**
     * off(event)           — removes ALL listeners for the event
     * off(event, callback) — removes only listeners with that exact callback
     * off(event, null, context) — removes all listeners with that context
     */
    off(event, callback, context) {
      if (!listeners[event]) return;
      if (!callback && !context) {
        // No callback or context given — clear everything for this event
        delete listeners[event];
      } else if (context && !callback) {
        listeners[event] = listeners[event].filter(l => l.context !== context);
      } else {
        listeners[event] = listeners[event].filter(l => l.callback !== callback);
      }
      return this;
    },

    emit(event, ...args) {
      if (!listeners[event]) return;
      // Snapshot the array before iterating so mid-emit off() calls don't skip entries
      const snapshot = listeners[event].slice();
      snapshot.forEach(l => {
        try {
          l.callback.apply(l.context || null, args);
        } catch (err) {
          console.error(`[EventBus] Error in listener for "${event}":`, err);
        }
      });
      return this;
    },

    once(event, callback, context) {
      const wrapper = (...args) => {
        callback.apply(context || null, args);
        this.off(event, wrapper);
      };
      return this.on(event, wrapper, context);
    },

    clear(event) {
      if (event) delete listeners[event];
      else Object.keys(listeners).forEach(k => delete listeners[k]);
    }
  };
})();
