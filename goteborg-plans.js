(() => {
  const DATA_URL = './data/goteborg-open-plans.json';
  let cache = null;
  let pending = null;

  function validSourceUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' &&
        (url.hostname === 'goteborg.se' || url.hostname.endsWith('.goteborg.se'));
    } catch {
      return false;
    }
  }

  function validItem(item) {
    return item &&
      typeof item.title === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(item.deadline || '') &&
      validSourceUrl(item.sourceUrl);
  }

  async function loadOpenPlans({ force = false } = {}) {
    if (!force && cache) return cache;
    if (!force && pending) return pending;

    pending = fetch(DATA_URL, {
      headers: { accept: 'application/json' },
      cache: 'no-cache'
    })
      .then(response => {
        if (!response.ok) throw new Error(`Göteborg plans feed unavailable (${response.status})`);
        return response.json();
      })
      .then(payload => {
        const items = Array.isArray(payload?.items) ? payload.items.filter(validItem) : [];
        cache = { ...payload, items };
        return cache;
      })
      .finally(() => {
        pending = null;
      });

    return pending;
  }

  window.SverinavGoteborgPlans = { loadOpenPlans };
})();
