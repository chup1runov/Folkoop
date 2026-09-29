'use strict';

(function initMuraWebModel(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.MuraWebModel = api;
})(typeof window !== 'undefined' ? window : globalThis, function createMuraWebModel() {
  const DAY_MS = 86_400_000;

  const FIRST_SEVEN_ACTIVE_DAYS = Object.freeze([
    Object.freeze({ id:'continuity:return-hello', minSessions:2, minActiveDays:1, action:'wave', message:'Ты вернулся.' }),
    Object.freeze({ id:'continuity:remembered-gift', minSessions:2, minActiveDays:2, requireTrusted:true, action:'inspect', message:'Я помню, что ты мне кое-что оставил.' }),
    Object.freeze({ id:'continuity:called-ritual', minSessions:3, minActiveDays:2, requireCalls:2, action:'lean-in', message:'Кажется, я уже узнаю твой способ меня звать.' }),
    Object.freeze({ id:'continuity:focus-memory', minSessions:3, minActiveDays:3, requireFocus:true, action:'confident', message:'Мы уже умеем работать рядом. Если захочешь — снова устроим фокус.' }),
    Object.freeze({ id:'continuity:home-changed', minSessions:3, minActiveDays:4, requireEpisode:true, action:'idea', message:'Загляни домой. Там уже кое-что изменилось.' }),
    Object.freeze({ id:'continuity:shared-history', minSessions:4, minActiveDays:5, requireMeaningfulMoments:2, action:'hands-behind', message:'У нас уже есть несколько своих маленьких историй.' }),
    Object.freeze({ id:'continuity:week-settled', minSessions:5, minActiveDays:7, action:'wink', message:'Кажется, я тут уже освоилась.' })
  ]);

  const STAGES = Object.freeze([
    { id:'meeting', min:0, label:'Знакомство', description:'Ксюша ещё привыкает к твоему ритму.' },
    { id:'familiar', min:0.18, label:'Освоились', description:'Уже появились повторяющиеся совместные действия.' },
    { id:'presence', min:0.4, label:'Привычное присутствие', description:'Ксюша становится частью повседневной цифровой среды.' },
    { id:'shared-history', min:0.66, label:'Своя история', description:'У вас накопились вещи, события и маленькие ритуалы.' },
    { id:'long-term', min:0.86, label:'Долгое знакомство', description:'История уже заметно отражается в поведении и доме.' }
  ]);

  const PLANT_STAGES = Object.freeze([
    { id:'seed', minActiveDays:2, label:'Семечко', note:'Ксюша нашла маленькое семечко и решила его не выбрасывать.', emoji:'•' },
    { id:'planted', minActiveDays:3, label:'Посажено', note:'На подоконнике появился крошечный горшок.', emoji:'🪴' },
    { id:'sprout', minActiveDays:5, label:'Росток', note:'Показался первый зелёный росток.', emoji:'🌱' },
    { id:'leaves', minActiveDays:8, label:'Листья', note:'Растение уже выглядит как постоянная часть комнаты.', emoji:'🌿' },
    { id:'bloom', minActiveDays:14, label:'Цветение', note:'Растение расцвело. Оно останется в комнате как часть вашей истории.', emoji:'🌸' }
  ]);

  function iso(value = Date.now()) { return new Date(value).toISOString(); }
  function dayKey(value = Date.now()) { return iso(value).slice(0,10); }
  function uid(prefix='web') { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,9)}`; }
  function clamp01(value) { return Math.max(0, Math.min(1, Number(value) || 0)); }

  function createState(now = Date.now()) {
    const at = iso(now);
    return {
      schemaVersion:1,
      identity:{ metAt:at, lastSeenAt:at, sessions:1, activeDays:[dayKey(now)] },
      stats:{ interactionCount:0 },
      preferences:{ onboardingCompleted:false, quietUntil:null },
      files:[], objects:[], moments:[], keepsakes:[], timers:[], episodes:[], discoveries:[]
    };
  }

  function normalizeState(value, now = Date.now()) {
    const base = createState(now);
    if (!value || typeof value !== 'object') return base;

    if (!value.identity && ('activeDay' in value || 'focusCompleted' in value)) {
      const migrated = createState(now);
      const days = Math.max(1, Math.min(30, Number(value.activeDay || 1)));
      const today = new Date(now);
      migrated.identity.sessions = Math.max(1, Number(value.sessions || 1));
      migrated.identity.activeDays = Array.from({length:days},(_,i)=>dayKey(today.getTime()-(days-1-i)*DAY_MS));
      migrated.preferences.onboardingCompleted = value.onboardingCompleted === true;
      migrated.stats.interactionCount = Number(value.calls || 0);
      for (const file of value.remembered || []) rememberFileMeta(migrated,file,Number(file.rememberedAt)||now);
      if (value.focusCompleted) {
        const t=startFocus(migrated,25,now-1500);
        completeFocus(migrated,t.id,now);
      }
      for (let i=0;i<Number(value.calls||0);i++) recordMoment(migrated,'called-to-cursor',{salience:.25,at:now});
      for (const oldId of value.firstWeekSeen || []) {
        const mapped = oldId.startsWith('continuity:') ? oldId : `continuity:${oldId==='return'?'return-hello':oldId==='gift'?'remembered-gift':oldId==='call'?'called-ritual':oldId==='focus'?'focus-memory':oldId==='home'?'home-changed':oldId==='history'?'shared-history':oldId==='settled'?'week-settled':oldId}`;
        migrated.discoveries.push({id:mapped,count:1,firstSeenAt:iso(now),lastSeenAt:iso(now),metadata:{source:'legacy-web'}});
      }
      syncEpisode(migrated,now);
      return migrated;
    }

    const state = {
      ...base,
      ...value,
      identity:{...base.identity,...(value.identity||{})},
      stats:{...base.stats,...(value.stats||{})},
      preferences:{...base.preferences,...(value.preferences||{})}
    };
    for (const key of ['files','objects','moments','keepsakes','timers','episodes','discoveries']) {
      state[key]=Array.isArray(value[key])?value[key]:[];
    }
    state.identity.activeDays=[...new Set((state.identity.activeDays||[]).map(dayKey))];
    if (!state.identity.activeDays.length) state.identity.activeDays=[dayKey(now)];
    return state;
  }

  function recordMoment(state, kind, options={}) {
    const item={id:uid('moment'),kind,at:iso(options.at||Date.now()),salience:Math.max(0,Math.min(1,Number(options.salience??.2))),data:options.data||{}};
    state.moments.push(item); state.moments=state.moments.slice(-400); return item;
  }
  function incrementInteraction(state, kind='generic', data={}, now=Date.now()) {
    state.stats.interactionCount=Number(state.stats.interactionCount||0)+1;
    state.identity.lastSeenAt=iso(now); markActiveDay(state,now);
    return recordMoment(state,kind,{salience:.25,data,at:now});
  }
  function markActiveDay(state,value=Date.now()) {
    const key=dayKey(value);
    if(!state.identity.activeDays.includes(key)) state.identity.activeDays.push(key);
    state.identity.activeDays=state.identity.activeDays.slice(-3650);
    return key;
  }
  function activeDayCount(state={}) { return new Set((state.identity?.activeDays||[]).filter(Boolean)).size; }
  function momentCount(state={},kind) { return (state.moments||[]).filter(x=>x.kind===kind).length; }
  function completedFocusCount(state={}) { return (state.timers||[]).filter(x=>x.status==='done'&&x.meta?.focus).length; }
  function trustedCount(state={}) { return Number((state.files||[]).length+(state.objects||[]).length); }
  function meaningfulCount(state={}) { return (state.moments||[]).filter(x=>Number(x.salience||0)>=.45).length; }
  function hasDiscovery(state={},id) { return (state.discoveries||[]).some(x=>x.id===id); }
  function discover(state,id,metadata={},now=Date.now()) {
    const found=(state.discoveries||[]).find(x=>x.id===id);
    if(found){found.count=Number(found.count||0)+1;found.lastSeenAt=iso(now);found.metadata={...(found.metadata||{}),...metadata};return found;}
    const item={id,count:1,firstSeenAt:iso(now),lastSeenAt:iso(now),metadata:{...metadata}};
    state.discoveries.unshift(item); return item;
  }

  function eligibleBeat(beat,state={}) {
    if(Number(state.identity?.sessions||0)<beat.minSessions||activeDayCount(state)<beat.minActiveDays)return false;
    if(beat.requireTrusted&&trustedCount(state)<1)return false;
    if(beat.requireCalls&&momentCount(state,'called-to-cursor')<beat.requireCalls)return false;
    if(beat.requireFocus&&completedFocusCount(state)<1)return false;
    if(beat.requireEpisode&&!(state.episodes||[])[0])return false;
    if(beat.requireMeaningfulMoments&&meaningfulCount(state)<beat.requireMeaningfulMoments)return false;
    return !hasDiscovery(state,beat.id);
  }
  function chooseFirstWeekMoment(state={}) {
    const days=activeDayCount(state);
    if(days<1||days>7)return null;
    return FIRST_SEVEN_ACTIVE_DAYS.find(x=>eligibleBeat(x,state))||null;
  }

  function deriveRelationship(state={}, now=Date.now()) {
    const metAt=new Date(state.identity?.metAt||now).getTime();
    const elapsedDays=Math.max(1,Math.ceil((now-metAt)/DAY_MS));
    const activeDays=activeDayCount(state);
    const sessions=Number(state.identity?.sessions||0);
    const interactions=Number(state.stats?.interactionCount||0);
    const trustedItems=trustedCount(state);
    const timersDone=(state.timers||[]).filter(x=>x.status==='done').length;
    const meaningful=meaningfulCount(state);
    const score=clamp01(
      .24*(1-Math.exp(-activeDays/9))+
      .18*(1-Math.exp(-sessions/16))+
      .18*(1-Math.exp(-interactions/34))+
      .15*(1-Math.exp(-trustedItems/7))+
      .12*(1-Math.exp(-timersDone/8))+
      .13*(1-Math.exp(-meaningful/12))
    );
    let stage=STAGES[0]; for(const candidate of STAGES) if(score>=candidate.min) stage=candidate;
    return {score,stage,next:STAGES[STAGES.indexOf(stage)+1]||null,elapsedDays,activeDays,sessions,interactions,trustedItems,timersDone,meaningfulMoments:meaningful};
  }

  function rememberFileMeta(state,file,now=Date.now()) {
    const name=String(file?.name||'Файл').slice(0,240);
    const existing=(state.files||[]).find(x=>x.name===name&&Number(x.size||0)===Number(file?.size||0));
    const item={id:existing?.id||uid('file'),name,size:Number(file?.size||0),type:String(file?.type||'file').slice(0,120),rememberedAt:existing?.rememberedAt||iso(now),lastGivenAt:iso(now)};
    state.files=[item,...state.files.filter(x=>x.id!==item.id)].slice(0,80);
    incrementInteraction(state,'file-given',{fileId:item.id,name:item.name},now);
    if(!state.keepsakes.some(x=>x.kind==='first-gift')) state.keepsakes.unshift({id:uid('keep'),kind:'first-gift',title:'Первая вещь, которую ты доверил Ксюше',emoji:'📎',sourceId:item.id,createdAt:iso(now)});
    return item;
  }

  function startFocus(state,minutes=25,now=Date.now()) {
    const m=Math.max(1,Math.min(120,Number(minutes)||25));
    const timer={id:uid('timer'),label:`Фокус ${m} мин`,createdAt:iso(now),dueAt:iso(now+m*60_000),durationMs:m*60_000,status:'active',meta:{focus:true}};
    state.timers.unshift(timer); incrementInteraction(state,'focus-started',{timerId:timer.id,durationMs:timer.durationMs},now); return timer;
  }
  function activeFocus(state={},now=Date.now()) {
    return (state.timers||[]).find(x=>x.status==='active'&&x.meta?.focus===true&&new Date(x.dueAt).getTime()>now)||null;
  }
  function completeFocus(state,id,now=Date.now()) {
    const timer=(state.timers||[]).find(x=>x.id===id&&x.status==='active'&&x.meta?.focus===true);
    if(!timer)return null;
    timer.status='done';timer.completedAt=iso(now);
    recordMoment(state,'focus-completed',{salience:.7,data:{timerId:id,label:timer.label},at:now});
    if(!state.keepsakes.some(x=>x.kind==='first-focus')) state.keepsakes.unshift({id:uid('keep'),kind:'first-focus',title:'Первая совместная фокус-сессия',emoji:'🎯',sourceId:id,createdAt:iso(now)});
    return timer;
  }
  function completeDueTimers(state,now=Date.now()) {
    const completed=[];
    for(const timer of state.timers||[]) if(timer.status==='active'&&new Date(timer.dueAt).getTime()<=now&&timer.meta?.focus===true){const done=completeFocus(state,timer.id,now);if(done)completed.push(done);}
    return completed;
  }
  function setQuiet(state,durationMs,now=Date.now()) { state.preferences.quietUntil=iso(now+Math.min(Math.max(Number(durationMs)||60_000,60_000),8*60*60_000)); }
  function clearQuiet(state){ state.preferences.quietUntil=null; }
  function isQuiet(state={},now=Date.now()){const t=new Date(state.preferences?.quietUntil||0).getTime();return Number.isFinite(t)&&t>now;}

  function syncEpisode(state,now=Date.now()) {
    const days=activeDayCount(state);
    let episode=(state.episodes||[]).find(x=>x.id==='windowsill-plant');
    const eligibleIndex=PLANT_STAGES.reduce((best,s,i)=>days>=s.minActiveDays?i:best,-1);
    if(eligibleIndex<0)return null;
    const today=dayKey(now);
    if(!episode){
      episode={id:'windowsill-plant',title:'Растение на подоконнике',emoji:'🌱',stageIndex:0,stageId:PLANT_STAGES[0].id,startedAt:iso(now),updatedAt:iso(now),lastAdvancedDay:today,complete:false};
      state.episodes.unshift(episode);
      recordMoment(state,'episode-start',{salience:.62,data:{episodeId:episode.id,stageId:episode.stageId,title:episode.title,stageLabel:PLANT_STAGES[0].label},at:now});
      return episode;
    }
    if(episode.complete||episode.lastAdvancedDay===today)return episode;
    const targetIndex=Math.min(eligibleIndex,Number(episode.stageIndex||0)+1);
    if(targetIndex<=episode.stageIndex)return episode;
    const stage=PLANT_STAGES[targetIndex];
    episode.stageIndex=targetIndex;episode.stageId=stage.id;episode.updatedAt=iso(now);episode.lastAdvancedDay=today;episode.complete=targetIndex===PLANT_STAGES.length-1;
    recordMoment(state,episode.complete?'episode-complete':'episode-advance',{salience:episode.complete ? .85 : .62,data:{episodeId:episode.id,stageId:stage.id,title:episode.title,stageLabel:stage.label},at:now});
    return episode;
  }
  function describeEpisodes(state={}) {
    return (state.episodes||[]).map(item=>{const s=PLANT_STAGES[item.stageIndex]||PLANT_STAGES.find(x=>x.id===item.stageId)||null;return {...item,stageLabel:s?.label||item.stageId,stageNote:s?.note||'',stageEmoji:s?.emoji||item.emoji||'✦',totalStages:PLANT_STAGES.length};});
  }

  function roomProps(state={}) {
    const props=[];const keepsakes=state.keepsakes||[];
    const gift=keepsakes.find(x=>x.kind==='first-gift');
    const focus=keepsakes.find(x=>x.kind==='first-focus');
    const timer=keepsakes.find(x=>x.kind==='first-timer');
    if(gift)props.push({id:'first-gift',slot:'shelf-left',emoji:gift.emoji||'📎',label:'Первая доверенная вещь',sourceId:gift.sourceId||null});
    if(focus)props.push({id:'first-focus',slot:'desk-left',emoji:'🎯',label:'Первая совместная фокус-сессия',sourceId:focus.sourceId||null});
    else if(timer)props.push({id:'first-timer',slot:'desk-left',emoji:'⏱️',label:'Первый совместный таймер',sourceId:timer.sourceId||null});
    const rel=(state.relationship||deriveRelationship(state)).stage.id;
    if(['shared-history','long-term'].includes(rel))props.push({id:'history-star',slot:'shelf-right',emoji:'✦',label:'У вас уже есть своя история'});
    return props;
  }
  function deriveHomeScene(state={},now=Date.now()) {
    const focus=activeFocus(state,now);const episodes=state.episodesDetailed||describeEpisodes(state);const episode=episodes[0]||null;
    if(focus)return{id:'focus',spot:'desk',pose:'thinking',note:'Ксюша устроилась за столом и старается не отвлекать тебя.'};
    if(isQuiet(state,now))return{id:'quiet',spot:'rug',pose:'rest',note:'Сейчас тихий период. Ксюша просто остаётся рядом.'};
    if(episode)return{id:'episode',spot:'window',pose:'hands-behind',note:episode.stageNote||'Дома что-то понемногу меняется.'};
    if(trustedCount(state)>0)return{id:'memory',spot:'shelf',pose:'inspect',note:'На полках уже есть следы вашей общей истории.'};
    return{id:'settling',spot:'center',pose:'idle',note:'Ксюша пока осваивается. Комната будет меняться из того, что вы проживёте вместе.'};
  }

  return {
    DAY_MS,FIRST_SEVEN_ACTIVE_DAYS,STAGES,PLANT_STAGES,createState,normalizeState,iso,dayKey,
    recordMoment,incrementInteraction,markActiveDay,activeDayCount,momentCount,completedFocusCount,trustedCount,
    meaningfulCount,hasDiscovery,discover,eligibleBeat,chooseFirstWeekMoment,deriveRelationship,rememberFileMeta,
    startFocus,activeFocus,completeFocus,completeDueTimers,setQuiet,clearQuiet,isQuiet,syncEpisode,describeEpisodes,
    roomProps,deriveHomeScene
  };
});
