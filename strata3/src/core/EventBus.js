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

    off(event, callback) {
      if (!listeners[event]) return;
      listeners[event] = listeners[event].filter(l => l.callback !== callback);
      return this;
    },

    emit(event, ...args) {
      if (!listeners[event]) return;
      listeners[event].forEach(l => l.callback.apply(l.context || null, args));
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
