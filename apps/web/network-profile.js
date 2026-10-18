/* Network profile presentation domain.
   Profile persistence, account deletion, export and authorization remain owned by network-ui.js. */
(() => {
'use strict';
const logoutAllCopy={en:'Sign out on all devices',ru:'Выйти на всех устройствах',sv:'Logga ut på alla enheter',uk:'Вийти на всіх пристроях',es:'Cerrar sesión en todos los dispositivos',fi:'Kirjaudu ulos kaikilta laitteilta',bs:'Odjavi se sa svih uređaja',ar:'تسجيل الخروج من جميع الأجهزة',fa:'خروج از همهٔ دستگاه‌ها',so:'Ka bax dhammaan qalabka',ku:'Ji hemû amûran derkeve'};
const exportCopy={
 en:['Export report','Records in file','Sections with omitted rows','Sections with unknown completeness','This is not a complete account copy. Keep the file private. For a full copy or account closure, contact the pilot operator.'],
 ru:['Отчёт о выгрузке','Записей в файле','Разделов с пропущенными записями','Разделов с неизвестной полнотой','Это не полная копия аккаунта. Храни файл приватно. За полной копией или закрытием аккаунта обратись к оператору пилота.'],
 sv:['Exportrapport','Poster i filen','Delar med utelämnade poster','Delar med okänd fullständighet','Detta är inte en fullständig kontokopia. Förvara filen privat. Kontakta pilotoperatören för en fullständig kopia eller kontostängning.'],
 uk:['Звіт про вивантаження','Записів у файлі','Розділів із пропущеними записами','Розділів із невідомою повнотою','Це не повна копія акаунта. Зберігай файл приватно. За повною копією або закриттям акаунта звернися до оператора пілоту.'],
 es:['Informe de exportación','Registros en el archivo','Secciones con registros omitidos','Secciones de integridad desconocida','No es una copia completa de la cuenta. Guarda el archivo de forma privada. Contacta con el operador del piloto para una copia completa o el cierre de la cuenta.'],
 fi:['Vientiraportti','Tietueita tiedostossa','Osioita, joista puuttuu tietueita','Osioita, joiden kattavuus on tuntematon','Tämä ei ole täydellinen tilikopio. Säilytä tiedosto yksityisesti. Pyydä täydellinen kopio tai tilin sulkeminen pilotin ylläpitäjältä.'],
 bs:['Izvještaj o izvozu','Zapisi u datoteci','Odjeljci s izostavljenim zapisima','Odjeljci nepoznate potpunosti','Ovo nije potpuna kopija računa. Čuvaj datoteku privatno. Za potpunu kopiju ili zatvaranje računa obrati se operateru pilota.'],
 ar:['تقرير التصدير','السجلات في الملف','الأقسام التي تحتوي على سجلات محذوفة من التصدير','الأقسام غير المعروفة الاكتمال','هذه ليست نسخة كاملة من الحساب. احتفظ بالملف بشكل خاص. لنسخة كاملة أو إغلاق الحساب، اتصل بمشغّل التجربة.'],
 fa:['گزارش خروجی','رکوردهای فایل','بخش‌های دارای رکوردهای جاافتاده','بخش‌هایی با کامل‌بودن نامشخص','این نسخهٔ کامل حساب نیست. فایل را خصوصی نگه دار. برای نسخهٔ کامل یا بستن حساب با مسئول پایلوت تماس بگیر.'],
 so:['Warbixinta dhoofinta','Diiwaannada faylka','Qaybaha ay diiwaanno ka maqan yihiin','Qaybaha aan dhammaystirkooda la aqoon','Tani ma aha nuqul buuxa oo akoonka ah. Faylka si gaar ah u hay. Nuqul buuxa ama xiritaanka akoonka kala xiriir maamulaha tijaabada.'],
 ku:['Rapora derxistinê','Tomarên di pelê de','Beşên bi tomarên kêm','Beşên ku temambûna wan nayê zanîn','Ev ne kopiyeke temam a hesabê ye. Pelê taybet bihêle. Ji bo kopiyeke temam an girtina hesabê bi berpirsiyarê pilotê re têkilî dayne.']
};

function create({
  escape,
  getData,
  text,
  homeText,
  shellText=key=>key,
  field,
  button,
  renderActivityNotifications
}){
  if(typeof escape!=='function'||typeof getData!=='function'||typeof text!=='function'){
    throw new Error('FOLKOOP_NETWORK_PROFILE_DEPENDENCIES');
  }

  function render(user,{profileDraft=null,guestDemo=false}={}){
    const data=getData()||{};
    const profile=profileDraft||data.profile||{};
    const blocks=Array.isArray(data.blocks)?data.blocks:[];
    const localDrafts=Array.isArray(data.localDrafts)?data.localDrafts:[];

    if(guestDemo){
      const city=profile.city||'';
      const lang=globalThis.document?.documentElement?.lang||'en';
      const privateDraft=lang==='ru'?'Личный черновик':lang==='sv'?'Privat utkast':lang==='en'?'Private draft':shellText('local');
      const lifeTitle=lang==='ru'?'Что у меня здесь живёт':lang==='sv'?'Det som händer hos mig':lang==='en'?'What lives here':shellText('myActivity');
      const projectLabel=lang==='ru'?'дел и проектов':lang==='sv'?'saker och projekt':lang==='en'?'things and projects':shellText('projects');
      const chatLabel=lang==='ru'?'разговоров':lang==='sv'?'samtal':lang==='en'?'conversations':shellText('messages');
      const groupLabel=lang==='ru'?'сообществ':lang==='sv'?'gemenskaper':lang==='en'?'communities':text('groups');
      const projects=(data.cooperations||[]).filter(item=>item.owner_id===user.id||['project','need','offer'].includes(item.kind)).length;
      const chats=(data.chats||[]).length;
      const groups=(data.memberships||[]).filter(item=>!item.banned).length;
      const draftCards=localDrafts.map(draft=>`<article class="card mura-draft-card"><div class="row"><span class="badge">${escape(shellText(draft.kind))}</span><span class="meta">${escape(privateDraft)}</span></div><h3>${escape(draft.title||'')}</h3><p>${escape(draft.body||'')}</p></article>`).join('');
      const drafts=`<section class="mura-drafts"><div class="row"><h3>${escape(shellText('drafts'))}</h3><span class="meta">${escape(String(localDrafts.length))}</span></div><div class="draft-grid">${draftCards}</div></section>`;
      return `<div class="row mura-profile-toolbar"><div><p class="eyebrow">MURA / FOLKOOP</p><h2>${escape(text('profile'))}</h2></div>${button('logout','out')}</div><article class="card demo-profile-card"><span class="badge">${escape(homeText('demoBadge'))}</span><div class="mura-profile-head"><div><h2>${escape(profile.name||'')}</h2>${city?`<p class="meta"><strong>${escape(shellText('cityProfile'))}:</strong> ${escape(city)}</p>`:''}</div></div><p><strong>${escape(text('skills'))}:</strong> ${escape(profile.skills||'')}</p><p>${escape(profile.about||'')}</p><p class="meta">${escape(text('listed'))}</p><div class="mura-profile-stats" aria-label="${escape(lifeTitle)}"><span><strong>${projects}</strong>${escape(projectLabel)}</span><span><strong>${chats}</strong>${escape(chatLabel)}</span><span><strong>${groups}</strong>${escape(groupLabel)}</span></div></article>${drafts}${renderActivityNotifications(user)}`;
    }

    const logoutAll=`<button class="button secondary" type="button" data-net="logoutAll">${escape(logoutAllCopy[globalThis.document?.documentElement?.lang]||logoutAllCopy.en)}</button>`;
    const blockRows=blocks
      .map(block=>`<p>${escape(block.target_id)} ${button('unblock','unblock',block.target_id)}</p>`)
      .join('');

    return `<div class="row"><h2>${escape(text('profile'))}</h2>${button('logout','out')}${logoutAll}</div><p>${escape(text('private'))}</p><form id="netProfile" class="editor card">${field('name','name',profile.name||'',60)}${field('skills','skills',profile.skills||'',200)}${field('about','about',profile.about||'',600,true)}<label class="checkbox"><input type="checkbox" name="listed"${profile.listed?' checked':''}>${escape(text('listed'))}</label><button class="button">${escape(text('save'))}</button></form><div class="actions">${button('deleteProfile','deleteProfile')}${button('export','export')}${button('refresh','refresh')}</div><p class="meta">${escape(text('accountDelete'))} ${escape(text('exportNote'))}</p><h3>${escape(text('blocks'))}</h3>${blockRows}${renderActivityNotifications(user)}<h3>${escape(text('localTitle'))}</h3>`;
  }

  function renderExportReport(manifest){
    if(!manifest||!Array.isArray(manifest.sections))return '';
    const copy=exportCopy[globalThis.document?.documentElement?.lang]||exportCopy.en;
    const values=[manifest.sections.reduce((n,s)=>n+s.returned,0),manifest.sections.filter(s=>s.coverage==='truncated').length,manifest.sections.filter(s=>s.coverage==='unknown').length];
    return `<section class="card" id="networkExportReport" role="status" aria-live="polite"><h3>${escape(copy[0])}</h3><dl>${values.map((n,i)=>`<dt>${escape(copy[i+1])}</dt><dd>${escape(String(n))}</dd>`).join('')}</dl><p>${escape(copy[4])}</p><a href="mailto:Chup1runov@gmail.com">Chup1runov@gmail.com</a></section>`;
  }
  return Object.freeze({render,renderExportReport});
}

globalThis.FolkoopNetworkProfile=Object.freeze({create,exportCopy});
})();
