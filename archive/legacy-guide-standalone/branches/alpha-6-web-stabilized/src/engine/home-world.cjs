'use strict';

function activeFocus(state = {}) {
  return (state.timers || []).find(item => item.status === 'active' && item.meta?.focus === true) || null;
}

function trustedCount(state = {}) {
  return Number((state.files || []).length + (state.objects || []).length);
}

function deriveHomeScene(state = {}) {
  const runtime = state.runtime || {};
  const focus = activeFocus(state);
  const episode = state.episodesDetailed?.[0] || null;
  const trusted = trustedCount(state);

  if (focus) {
    return {
      id: 'focus',
      spot: 'desk',
      pose: 'thinking',
      note: 'Ксюша устроилась за столом и старается не отвлекать тебя.'
    };
  }

  if (runtime.quiet) {
    return {
      id: 'quiet',
      spot: 'rug',
      pose: 'rest',
      note: 'Сейчас тихий период. Ксюша просто остаётся рядом.'
    };
  }

  if (episode) {
    return {
      id: 'episode',
      spot: 'window',
      pose: 'hands-behind',
      note: episode.stageNote || 'Дома что-то понемногу меняется.'
    };
  }

  if (trusted > 0) {
    return {
      id: 'memory',
      spot: 'shelf',
      pose: 'inspect',
      note: 'На полках уже есть следы вашей общей истории.'
    };
  }

  return {
    id: 'settling',
    spot: 'center',
    pose: 'idle',
    note: 'Ксюша пока осваивается. Комната будет меняться из того, что вы проживёте вместе.'
  };
}

module.exports = { activeFocus, trustedCount, deriveHomeScene };
