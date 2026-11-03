(function (root) {
  'use strict';

  function create(options) {
    const data = options.data;
    const ids = new Set(data.words.map(word => word.id));
    const storage = options.storage || root.localStorage;
    const fetcher = options.fetch || root.fetch.bind(root);
    const now = options.now || Date.now;
    const key = data.appId + (options.demo ? ':demo' : '') + ':recall-v1';
    const endpoint = 'https://marco-round1-missed-mastery.alexsoton.chatgpt.site/api/shared/progress?appId=' + encodeURIComponent(data.appId);
    const copy = value => JSON.parse(JSON.stringify(value));
    const object = value => value && typeof value === 'object' && !Array.isArray(value);
    const empty = () => ({ kind: 'vocabulary-reveal', version: 1, poolId: data.poolId, opened: {}, position: null });
    const uuid = () => root.crypto?.randomUUID?.() || Math.random().toString(36).slice(2) + '-' + now().toString(36);

    function stamp(value) {
      if (!object(value) || !Number.isSafeInteger(value.at) || value.at < 1 || typeof value.op !== 'string' || !/^[a-zA-Z0-9-]{1,120}$/.test(value.op)) {
        throw Error('Invalid saved review entry.');
      }
      return { at: value.at, op: value.op };
    }

    function normalize(raw) {
      if (raw == null) return empty();
      if (!object(raw) || raw.kind !== 'vocabulary-reveal' || raw.version !== 1 || raw.poolId !== data.poolId || !object(raw.opened)) {
        throw Error('Unexpected saved review format.');
      }
      const result = empty();
      for (const id of Object.keys(raw.opened).sort()) {
        if (!ids.has(id)) throw Error('Invalid saved word.');
        result.opened[id] = stamp(raw.opened[id]);
      }
      if (raw.position != null) {
        if (!ids.has(raw.position.id)) throw Error('Invalid saved position.');
        result.position = { id: raw.position.id, ...stamp(raw.position) };
      }
      return result;
    }

    function latest(left, right) {
      if (!left) return right;
      if (!right) return left;
      if (left.at !== right.at) return left.at > right.at ? left : right;
      return left.op >= right.op ? left : right;
    }

    function merge(left, right) {
      left = normalize(left);
      right = normalize(right);
      const result = empty();
      for (const id of [...new Set([...Object.keys(left.opened), ...Object.keys(right.opened)])].sort()) {
        result.opened[id] = latest(left.opened[id], right.opened[id]);
      }
      result.position = latest(left.position, right.position);
      return result;
    }

    const stable = value => JSON.stringify(normalize(value));
    let state = empty();
    let storageOK = true;
    let device;
    try {
      state = normalize(JSON.parse(storage.getItem(key) || 'null'));
      device = storage.getItem(key + ':device');
    } catch {
      storageOK = false;
    }
    if (typeof device !== 'string' || !/^[a-zA-Z0-9-]{12,100}$/.test(device)) device = 'recall-' + uuid();

    function persist() {
      try {
        storage.setItem(key, JSON.stringify(state));
        storage.setItem(key + ':device', device);
      } catch {
        storageOK = false;
      }
    }

    function status(text) {
      options.onStatus?.(text + (storageOK ? '' : ' Browser backup unavailable.'));
    }

    function changed() {
      persist();
      options.onChange?.(copy(state));
    }

    function receive(raw) {
      const next = merge(state, raw);
      if (stable(next) !== stable(state)) {
        state = next;
        changed();
      }
    }

    let timer = null;
    let busy = null;
    let again = false;
    let stopped = false;
    function queue() {
      if (options.demo || stopped) return;
      root.clearTimeout(timer);
      timer = root.setTimeout(() => { timer = null; void flush(); }, 450);
    }

    function update(id, openMeaning) {
      if (!ids.has(id)) return;
      let at = Math.max(1, now(), (state.position?.at || 0) + 1);
      for (const entry of Object.values(state.opened)) at = Math.max(at, entry.at + 1);
      const entry = { at, op: 'review-' + uuid() };
      state.position = { id, ...entry };
      if (openMeaning) state.opened[id] = entry;
      state = normalize(state);
      changed();
      status(options.demo ? 'Preview · Saved on this device.' : 'Saved on this device · Saving online…');
      queue();
    }

    async function request(init = {}) {
      const result = await fetcher(endpoint, {
        cache: 'no-store',
        ...init,
        ...(root.AbortSignal?.timeout ? { signal: root.AbortSignal.timeout(12000) } : {})
      });
      if (!result.ok) throw Error('Online save unavailable.');
      return result.json();
    }

    async function flush() {
      if (options.demo) { status('Preview · Saved on this device.'); return true; }
      if (stopped) return false;
      root.clearTimeout(timer);
      timer = null;
      if (busy) { again = true; return busy; }
      busy = (async () => {
        try {
          let remote = (await request()).progress;
          for (let attempt = 0; attempt < 5; attempt++) {
            if (stopped) return false;
            receive(remote?.state);
            if (stable(state) === stable(remote?.state)) {
              status(remote ? 'Saved online · Your review is up to date.' : 'Online saving ready.');
              return true;
            }
            const result = await request({
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({
                appId: data.appId, studentName: 'Marco', deviceId: device,
                state: copy(state), baseVersion: remote?.version ?? null,
                progressScore: Object.keys(state.opened).length,
                clientUpdatedAt: new Date(now()).toISOString()
              })
            });
            if (!result.progress) throw Error('Save unconfirmed.');
            remote = result.progress;
            receive(remote.state);
            if (result.accepted && stable(state) === stable(remote.state)) {
              status('Saved online · Your review is up to date.');
              return true;
            }
          }
          throw Error('Concurrent save in progress.');
        } catch {
          status('Online save unavailable · Saved on this device. Tap Save online to retry.');
          return false;
        }
      })();
      try {
        return await busy;
      } finally {
        busy = null;
        if (again) { again = false; queue(); }
      }
    }

    persist();
    return {
      key, endpoint, normalize, merge,
      snapshot: () => copy(state),
      open: id => update(id, true),
      move: id => update(id, false),
      flush,
      receiveLocal(text) {
        try { receive(JSON.parse(text)); queue(); } catch { /* Keep the current valid record. */ }
      },
      stop() { stopped = true; root.clearTimeout(timer); }
    };
  }

  root.VocabularyRevealSync = { create };
})(typeof window === 'object' ? window : globalThis);
