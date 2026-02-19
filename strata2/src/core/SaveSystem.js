/**
 * SaveSystem — localStorage persistence for STRATA.
 * Keys are namespaced to avoid collision with other apps.
 */
const SaveSystem = (function () {
  const KEY = 'strata_v1_save';
  const META_KEY = 'strata_v1_meta';

  return {
    save(state) {
      try {
        const serialized = JSON.stringify(state);
        localStorage.setItem(KEY, serialized);
        localStorage.setItem(META_KEY, JSON.stringify({
          savedAt: Date.now(),
          version: 1
        }));
      } catch (e) {
        console.warn('[SaveSystem] Could not save:', e);
      }
    },

    load() {
      try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return null;
        return JSON.parse(raw);
      } catch (e) {
        console.warn('[SaveSystem] Could not load save:', e);
        return null;
      }
    },

    exists() {
      return !!localStorage.getItem(KEY);
    },

    getMeta() {
      try {
        const raw = localStorage.getItem(META_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (e) { return null; }
    },

    wipe() {
      localStorage.removeItem(KEY);
      localStorage.removeItem(META_KEY);
    }
  };
})();
