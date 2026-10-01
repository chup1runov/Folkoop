'use strict';

const EPISODES = Object.freeze({
  'windowsill-plant': Object.freeze({
    id: 'windowsill-plant',
    title: 'Растение на подоконнике',
    emoji: '🌱',
    stages: Object.freeze([
      { id: 'seed', minActiveDays: 2, label: 'Семечко', note: 'Mura нашла маленькое семечко и решила его не выбрасывать.', emoji: '•' },
      { id: 'planted', minActiveDays: 3, label: 'Посажено', note: 'На подоконнике появился крошечный горшок.', emoji: '🪴' },
      { id: 'sprout', minActiveDays: 5, label: 'Росток', note: 'Показался первый зелёный росток.', emoji: '🌱' },
      { id: 'leaves', minActiveDays: 8, label: 'Листья', note: 'Растение уже выглядит как постоянная часть комнаты.', emoji: '🌿' },
      { id: 'bloom', minActiveDays: 14, label: 'Цветение', note: 'Растение расцвело. Оно останется в комнате как часть вашей истории.', emoji: '🌸' }
    ])
  })
});

function dateKey(value = Date.now()) {
  const date = new Date(value);
  return date.toISOString().slice(0, 10);
}

function findEpisode(state, id) {
  return (state.episodes || []).find(item => item.id === id) || null;
}

function activeDaysCount(state) {
  return new Set((state.identity?.activeDays || []).map(dateKey)).size;
}

function evaluateEpisode(state, definition, now = Date.now()) {
  const count = activeDaysCount(state);
  const existing = findEpisode(state, definition.id);
  const eligibleIndex = definition.stages.reduce((best, stage, index) => count >= stage.minActiveDays ? index : best, -1);
  if (eligibleIndex < 0) return null;

  if (!existing) {
    return {
      type: 'start',
      episode: {
        id: definition.id,
        title: definition.title,
        emoji: definition.emoji,
        stageIndex: 0,
        stageId: definition.stages[0].id,
        startedAt: new Date(now).toISOString(),
        updatedAt: new Date(now).toISOString(),
        lastAdvancedDay: dateKey(now),
        complete: definition.stages.length === 1
      },
      stage: definition.stages[0]
    };
  }

  if (existing.complete) return null;
  const targetIndex = Math.min(eligibleIndex, existing.stageIndex + 1);
  if (targetIndex <= existing.stageIndex) return null;
  if (existing.lastAdvancedDay === dateKey(now)) return null;

  const target = definition.stages[targetIndex];
  return {
    type: targetIndex === definition.stages.length - 1 ? 'complete' : 'advance',
    episode: {
      ...existing,
      stageIndex: targetIndex,
      stageId: target.id,
      updatedAt: new Date(now).toISOString(),
      lastAdvancedDay: dateKey(now),
      complete: targetIndex === definition.stages.length - 1
    },
    stage: target
  };
}

class EpisodeEngine {
  constructor(store) {
    this.store = store;
  }

  evaluate(now = Date.now()) {
    const changes = [];
    let state = this.store.snapshot();
    for (const definition of Object.values(EPISODES)) {
      const change = evaluateEpisode(state, definition, now);
      if (!change) continue;
      this.store.upsertEpisode(change.episode);
      this.store.recordMoment(`episode-${change.type}`, {
        salience: change.type === 'complete' ? 0.85 : 0.62,
        data: {
          episodeId: change.episode.id,
          stageId: change.stage.id,
          title: change.episode.title,
          stageLabel: change.stage.label
        }
      });
      if (change.type === 'complete') {
        this.store.addKeepsake({
          kind: `episode:${change.episode.id}`,
          title: `${change.episode.title}: ${change.stage.label}`,
          emoji: change.stage.emoji || change.episode.emoji,
          sourceId: change.episode.id
        });
      }
      changes.push(change);
      state = this.store.snapshot();
    }
    return changes;
  }

  describe(state = this.store.snapshot()) {
    return (state.episodes || []).map(item => {
      const definition = EPISODES[item.id];
      const stage = definition?.stages?.[item.stageIndex] || null;
      return {
        ...item,
        stageLabel: stage?.label || item.stageId,
        stageNote: stage?.note || '',
        stageEmoji: stage?.emoji || item.emoji || '✦',
        totalStages: definition?.stages?.length || 1
      };
    });
  }
}

module.exports = { EPISODES, dateKey, activeDaysCount, evaluateEpisode, EpisodeEngine };
