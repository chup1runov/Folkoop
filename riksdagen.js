(() => {
  const DATA_URL = './data/riksdagen-decisions.json';
  let cache = null;
  let pending = null;

  function validItem(item) {
    return item &&
      typeof item.title === 'string' &&
      typeof item.sourceUrl === 'string' &&
      item.sourceUrl.startsWith('https://data.riksdagen.se/');
  }

  async function loadLatestDecisions({ force = false } = {}) {
    if (!force && cache) return cache;
    if (!force && pending) return pending;

    pending = fetch(DATA_URL, {
      headers: { accept: 'application/json' },
      cache: 'no-cache'
    })
      .then(response => {
        if (!response.ok) throw new Error(`Decision feed unavailable (${response.status})`);
        return response.json();
      })
      .then(payload => {
        if (payload?.error) throw new Error(`Decision feed unavailable (${payload.error})`);
        if (Number.isNaN(new Date(payload?.fetchedAt).getTime())) throw new Error('Decision feed has no valid fetchedAt timestamp');
        const items = Array.isArray(payload?.items) ? payload.items.filter(validItem) : [];
        if (!items.length) throw new Error('Decision feed contains no valid items');
        cache = { ...payload, items };
        return cache;
      })
      .finally(() => {
        pending = null;
      });

    return pending;
  }

  window.SverinavRiksdagen = {
    loadLatestDecisions
  };
})();
