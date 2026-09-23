/* A finite daily dashboard; no infinite feed or unsupported all-clear status. */
(() => {
  'use strict';
  const KEYS=['today','weather','next','wind','precip','warnings','region','none','error','refresh','area','areaNote','open','trip','tickets','ticketNote','water','waterNote','plans','decisions','received','forecast','official','help'];
  const COPY={
    sv:['Idag','Väder','Nästa timmar','Vind','Nederbördsrisk','Varningar och meddelanden','Västra Götalands län · inte en adresskontroll','Inga aktuella meddelanden för länet i det hämtade svaret.','Kunde inte kontrollera källan. Kontrollera originalet.','Uppdatera','Välj väderområde','Ungefärligt område sparas här och skickas till SMHI. Ingen GPS används.','Öppna källan','Min resa','Biljetter · Västtrafik To Go','Sverinav säljer eller visar inga giltiga biljetter. Använd Västtrafiks officiella tjänst.','Vatten','Kontrollera vattenavstängningar hos Göteborgs Stad. Status hämtas inte automatiskt här.','Påverka i Göteborg','Från riksdagen','Hämtat','Prognos från','Officiell tjänst','Hitta ansvarig eller rapportera ett fel'],
    en:['Today','Weather','Next hours','Wind','Precipitation chance','Warnings and notices','Västra Götaland County · not an address check','No current county notices in the retrieved response.','Could not check this source. Check the original.','Refresh','Choose weather area','The approximate area is saved here and sent to SMHI. No GPS is used.','Open source','My journey','Tickets · Västtrafik To Go','Sverinav does not sell or display valid tickets. Use the official Västtrafik service.','Water','Check water interruptions at the City of Gothenburg. Their status is not fetched here.','Have your say in Gothenburg','From the Riksdag','Retrieved','Forecast issued','Official service','Find responsibility or report a problem'],
    ru:['Сегодня','Погода','Ближайшие часы','Ветер','Вероятность осадков','Предупреждения и сообщения','Лен Västra Götaland · не проверка конкретного адреса','В полученном ответе нет действующих сообщений для лена.','Источник проверить не удалось. Открой оригинал.','Обновить','Район прогноза','Примерный район сохраняется здесь и передаётся SMHI. GPS не используется.','Открыть источник','Моя поездка','Билеты · Västtrafik To Go','Sverinav не продаёт и не показывает действительные билеты. Используй официальный сервис Västtrafik.','Вода','Отключения воды — на сайте Göteborgs Stad. Их статус здесь автоматически не проверяется.','Повлиять на планы Гётеборга','Из Риксдага','Получено','Прогноз выпущен','Официальный сервис','Найти ответственного или сообщить о проблеме'],
    uk:['Сьогодні','Погода','Найближчі години','Вітер','Імовірність опадів','Попередження та повідомлення','Лен Västra Götaland · не перевірка конкретної адреси','В отриманій відповіді немає чинних повідомлень для лену.','Не вдалося перевірити джерело. Відкрийте оригінал.','Оновити','Район прогнозу','Приблизний район зберігається тут і передається SMHI. GPS не використовується.','Відкрити джерело','Моя поїздка','Квитки · Västtrafik To Go','Sverinav не продає і не показує чинні квитки. Скористайтеся офіційним сервісом Västtrafik.','Вода','Відключення води — на сайті Göteborgs Stad. Їхній статус тут автоматично не перевіряється.','Вплинути на плани Гетеборга','Із Риксдагу','Отримано','Прогноз видано','Офіційний сервіс','Знайти відповідального або повідомити про проблему'],
    fi:['Tänään','Sää','Seuraavat tunnit','Tuuli','Sateen todennäköisyys','Varoitukset ja tiedotteet','Västra Götalandin lääni · ei osoitekohtaista tarkistusta','Haetussa vastauksessa ei ole voimassa olevia läänin tiedotteita.','Lähdettä ei voitu tarkistaa. Katso alkuperäinen.','Päivitä','Valitse sääalue','Likimääräinen alue tallennetaan tähän ja lähetetään SMHI:lle. GPS:ää ei käytetä.','Avaa lähde','Matkani','Liput · Västtrafik To Go','Sverinav ei myy tai näytä voimassa olevia lippuja. Käytä Västtrafikin virallista palvelua.','Vesi','Tarkista vesikatkot Göteborgin kaupungilta. Tilaa ei haeta tähän automaattisesti.','Vaikuta Göteborgissa','Valtiopäiviltä','Haettu','Ennuste julkaistu','Virallinen palvelu','Etsi vastuullinen taho tai ilmoita viasta'],
    es:['Hoy','Tiempo','Próximas horas','Viento','Probabilidad de precipitación','Avisos y advertencias','Provincia de Västra Götaland · no verifica tu dirección','No hay avisos vigentes de la provincia en la respuesta obtenida.','No se pudo comprobar la fuente. Consulta el original.','Actualizar','Elige zona del pronóstico','La zona aproximada se guarda aquí y se envía a SMHI. No se usa GPS.','Abrir fuente','Mi viaje','Billetes · Västtrafik To Go','Sverinav no vende ni muestra billetes válidos. Usa el servicio oficial de Västtrafik.','Agua','Consulta cortes de agua en el Ayuntamiento de Gotemburgo. Aquí no se consulta su estado automáticamente.','Participa en Gotemburgo','Del Parlamento','Consultado','Pronóstico publicado','Servicio oficial','Encuentra al responsable o comunica un problema'],
    bs:['Danas','Vrijeme','Sljedeći sati','Vjetar','Vjerovatnoća padavina','Upozorenja i obavijesti','Västra Götaland · nije provjera adrese','Nema važećih obavijesti za okrug u preuzetom odgovoru.','Izvor nije moguće provjeriti. Otvori original.','Osvježi','Izaberi područje prognoze','Približno područje se čuva ovdje i šalje SMHI-ju. GPS se ne koristi.','Otvori izvor','Moje putovanje','Karte · Västtrafik To Go','Sverinav ne prodaje niti prikazuje važeće karte. Koristi službenu uslugu Västtrafika.','Voda','Provjeri prekide vode kod Grada Göteborga. Stanje se ovdje ne provjerava automatski.','Uključi se u Göteborgu','Iz parlamenta','Preuzeto','Prognoza objavljena','Službena usluga','Pronađi odgovornog ili prijavi problem'],
    ar:['اليوم','الطقس','الساعات القادمة','الرياح','احتمال هطول الأمطار','التحذيرات والإشعارات','مقاطعة Västra Götaland · ليس فحصاً للعنوان','لا توجد إشعارات سارية للمقاطعة في الرد المسترجع.','تعذر التحقق من المصدر. راجع الأصل.','تحديث','اختر منطقة الطقس','تُحفظ المنطقة التقريبية هنا وتُرسل إلى SMHI. لا يُستخدم GPS.','افتح المصدر','رحلتي','التذاكر · Västtrafik To Go','لا يبيع Sverinav تذاكر صالحة ولا يعرضها. استخدم خدمة Västtrafik الرسمية.','المياه','تحقق من انقطاع المياه لدى بلدية غوتنبرغ. لا تُجلب الحالة هنا تلقائياً.','شارك في غوتنبرغ','من البرلمان','تم الاسترجاع','صدرت التوقعات','خدمة رسمية','ابحث عن المسؤول أو أبلغ عن مشكلة'],
    fa:['امروز','هوا','ساعات آینده','باد','احتمال بارش','هشدارها و پیام‌ها','استان Västra Götaland · نه بررسی یک نشانی','در پاسخ دریافت‌شده پیام فعالی برای استان وجود ندارد.','بررسی منبع ممکن نبود. اصل را ببینید.','به‌روزرسانی','منطقه پیش‌بینی را انتخاب کنید','منطقه تقریبی اینجا ذخیره و به SMHI ارسال می‌شود. GPS استفاده نمی‌شود.','باز کردن منبع','سفر من','بلیت‌ها · Västtrafik To Go','Sverinav بلیت معتبر نمی‌فروشد یا نمایش نمی‌دهد. از سرویس رسمی Västtrafik استفاده کنید.','آب','قطعی آب را در شهرداری یوتبری بررسی کنید. وضعیت اینجا خودکار دریافت نمی‌شود.','در یوتبری نظر بدهید','از پارلمان','دریافت‌شده','صدور پیش‌بینی','سرویس رسمی','مسئول را پیدا کنید یا مشکل را گزارش کنید'],
    so:['Maanta','Cimilada','Saacadaha soo socda','Dabayl','Fursadda roobka','Digniino iyo ogeysiisyo','Gobolka Västra Götaland · ma aha hubin cinwaan','Jawaabta la helay kuma jiraan ogeysiisyo gobolka oo hadda shaqaynaya.','Isha lama hubin karin. Eeg asalka.','Cusboonaysii','Dooro aagga cimilada','Aagga qiyaasta ah halkan ayaa lagu kaydiyaa waxaana loo diraa SMHI. GPS lama isticmaalo.','Fur isha','Safarkayga','Tigidhada · Västtrafik To Go','Sverinav ma iibiyo ama muujiyaa tigidh sax ah. Adeegso adeegga rasmiga ah ee Västtrafik.','Biyo','Ka hubi Göteborgs Stad biyo-joojinta. Xaaladdeeda halkan si toos ah looma hubiyo.','Ka qayb qaado Göteborg','Baarlamaanka','La helay','Saadaasha la soo saaray','Adeeg rasmi ah','Hel masuulka ama soo sheeg dhibaatada'],
    ku:['Îro','Hewa','Saetên pêş','Ba','Îhtîmala baranê','Hişyarî û agahdarî','Herêma Västra Götaland · ne kontrola navnîşanê','Di bersiva hatî de ji bo herêmê agahdariya çalak tune.','Çavkanî nehat kontrolkirin. Orîjînalê veke.','Nû bike','Herêma hewayê hilbijêre','Herêma nêzîk li vir tê hilanîn û ji SMHI re tê şandin. GPS nayê bikaranîn.','Çavkaniyê veke','Rêwîtiya min','Bilêt · Västtrafik To Go','Sverinav bilêtên derbasdar nafiroşe û nîşan nade. Xizmeta fermî ya Västtrafik bi kar bîne.','Av','Birîna avê li Göteborgs Stad kontrol bike. Rewş li vir bixweber nayê kontrolkirin.','Li Göteborg beşdar bibe','Ji parlamentoyê','Hate wergirtin','Pêşbînî hate weşandin','Xizmeta fermî','Berpirsiyarê bibîne an pirsgirêkê rapor bike']
  };
  const LINKS={weather:'https://www.smhi.se/vader/prognoser-och-varningar',warnings:'https://www.smhi.se/vader/prognoser-och-varningar/varningar-och-meddelanden',trip:'https://www.vasttrafik.se/reseplanering/',tickets:'https://www.vasttrafik.se/biljetter/mer-om-biljetter/vasttrafik-to-go/',water:'https://goteborg.se/wps/portal/start/bygga-bo-och-leva-hallbart/vatten-och-avlopp/vattenavstangningar-och-andra-storningar/vattenavstangningar'};
  // All disclosure preferences are in memory only; no new tracking or location storage.
  const COMPACT_KEYS=['details','quiet','deadline','more','choose','forecast','unverified'];
  const COMPACT_COPY={
    sv:['Detaljer','Inga meddelanden för länet','Nästa deadline','Fler tjänster','Byt område','Prognos','Status visas inte här'],
    en:['Details','No county notices','Next deadline','More services','Change area','Forecast','Status is not shown here'],
    ru:['Подробнее','Нет сообщений для лена','Ближайший срок','Другие сервисы','Сменить район','Прогноз','Статус здесь не проверяется'],
    uk:['Докладніше','Немає повідомлень для лену','Найближчий термін','Інші сервіси','Змінити район','Прогноз','Статус тут не перевіряється'],
    fi:['Lisätiedot','Ei läänin tiedotteita','Seuraava määräaika','Lisää palveluja','Vaihda aluetta','Ennuste','Tilaa ei näytetä tässä'],
    es:['Detalles','Sin avisos en la provincia','Próxima fecha límite','Más servicios','Cambiar zona','Pronóstico','El estado no se muestra aquí'],
    bs:['Detalji','Nema obavijesti za okrug','Sljedeći rok','Više usluga','Promijeni područje','Prognoza','Stanje se ovdje ne prikazuje'],
    ar:['التفاصيل','لا توجد إشعارات للمقاطعة','الموعد النهائي التالي','خدمات أخرى','تغيير المنطقة','التوقعات','لا تُعرض الحالة هنا'],
    fa:['جزئیات','پیامی برای استان نیست','مهلت بعدی','خدمات بیشتر','تغییر منطقه','پیش‌بینی','وضعیت اینجا نمایش داده نمی‌شود'],
    so:['Faahfaahin','Ogeysiis gobolka ma jiro','Wakhtiga kama dambaysta ah','Adeegyo kale','Beddel aagga','Saadaasha','Xaaladda halkan laguma muujiyo'],
    ku:['Hûrgilî','Agahdariya herêmê tune','Dema dawî ya pêş','Xizmetên din','Herêmê biguherîne','Pêşbînî','Rewş li vir nayê nîşandan']
  };
  const opened=new Set();
  let controller=null,timer=null;
  function stop(){controller?.abort();controller=null;clearInterval(timer);timer=null;}
  function render(container,language,helpers){
    stop();
    const C=SverinavCore,D=SverinavDaily,E=C.escape,I=C.icon;
    const values=COPY[language]||COPY.en,L=Object.fromEntries(KEYS.map((key,i)=>[key,values[i]]));
    const short=COMPACT_COPY[language]||COMPACT_COPY.en,S=Object.fromEntries(COMPACT_KEYS.map((key,i)=>[key,short[i]]));
    let area=C.storage.get('sverinav-weather-area');if(!Object.hasOwn(D.AREAS,area))area='centrum';
    const fmt=(value,timeOnly=false)=>new Intl.DateTimeFormat(language,{timeZone:'Europe/Stockholm',...(timeOnly?{hour:'2-digit',minute:'2-digit'}:{dateStyle:'medium',timeStyle:'short'})}).format(new Date(value));
    const chevron='<span class="compact-chevron" aria-hidden="true">›</span>';
    const link=(name,label)=>`<a class="daily-link" href="${LINKS[name]}" target="_blank" rel="noopener noreferrer">${E(label||L.open)} <span aria-hidden="true">↗</span></a>`;
    const externalRow=(name,iconName,title,subtitle)=>`<a class="compact-row" href="${LINKS[name]}" target="_blank" rel="noopener noreferrer"><span class="compact-icon">${I(iconName)}</span><span class="compact-row-copy"><strong>${E(title)}</strong><small>${E(subtitle)}</small></span><span class="compact-external" aria-hidden="true">↗</span></a>`;
    const openAttribute=id=>opened.has(id)?' open':'';
    const installMarkup=helpers.install();
    container.innerHTML=`<div class="today compact-today" id="todayScreen">
      <header class="today-heading"><div><p class="today-date">${E(new Intl.DateTimeFormat(language,{timeZone:'Europe/Stockholm',weekday:'long',day:'numeric',month:'long'}).format(Date.now()))}</p><h1 tabindex="-1">${E(L.today)}</h1></div><button id="dailyRefresh" class="icon-button" type="button" aria-label="${E(L.refresh)}">${I('refresh')}</button></header>
      <details class="compact-area" id="areaDetails"${openAttribute('areaDetails')}><summary aria-label="${E(L.area)}"><span class="compact-icon">${I('pin')}</span><strong id="currentWeatherArea">${E(D.AREAS[area].name)}</strong><span class="compact-summary-hint">${E(S.choose)}</span>${chevron}</summary><div class="compact-detail-body"><label class="field-label" for="weatherArea">${E(L.area)}</label><p class="daily-note" id="areaNotice">${E(L.areaNote)}</p><select class="input" id="weatherArea" aria-describedby="areaNotice">${Object.entries(D.AREAS).map(([key,a])=>`<option value="${key}" ${key===area?'selected':''}>${E(a.name)}</option>`).join('')}</select></div></details>
      <details class="compact-weather" id="weatherDetails"${openAttribute('weatherDetails')}><summary><span class="compact-section-label">${I('weather')}<strong>${E(L.weather)}</strong><span class="compact-summary-hint">${E(S.details)}</span>${chevron}</span><span id="dailyWeather" aria-live="polite" aria-busy="true"><span class="compact-loading">SMHI…</span></span></summary><div class="compact-detail-body" id="weatherDetailContent"><p class="daily-note">SMHI…</p></div></details>
      <section class="compact-warning" aria-label="${E(L.warnings)}"><div id="dailyWarnings" aria-live="polite" aria-busy="true"><p class="daily-note">${E(L.warnings)} · SMHI…</p></div></section>
      <div class="compact-row-group" id="compactJourney">${externalRow('trip','bus',L.trip,'Västtrafik · '+L.official)}</div>
      <section class="compact-deadline" aria-labelledby="compactDeadlineTitle"><div class="section-head"><h2 id="compactDeadlineTitle">${I('calendar')}${E(S.deadline)}</h2><button type="button" data-screen="nara" class="text-button">${E(helpers.t('navNear'))} <span aria-hidden="true">→</span></button></div><div id="homeOpenPlans" class="plan-list"></div></section>
      <div class="compact-row-group"><button class="compact-row" type="button" data-screen="ansvar"><span class="compact-icon">${I('route')}</span><span class="compact-row-copy"><strong>${E(helpers.t('findResponsible'))}</strong></span>${chevron}</button>
      <details id="serviceDetails" class="compact-services"${openAttribute('serviceDetails')}><summary class="compact-row"><span class="compact-icon">${I('info')}</span><strong class="compact-row-copy">${E(S.more)}</strong>${chevron}</summary><div class="compact-service-body">${externalRow('water','water',L.water,'Göteborgs Stad · '+S.unverified)}<p class="daily-note">${E(L.waterNote)}</p>${externalRow('tickets','ticket',L.tickets,L.official)}<p class="daily-note">${E(L.ticketNote)}</p></div></details></div>
      ${installMarkup?`<details class="compact-install"><summary>${E(helpers.t('installTitle'))}${chevron}</summary><div class="compact-detail-body">${installMarkup}</div></details>`:''}
    </div>`;
    const w=container.querySelector('#dailyWeather'),a=container.querySelector('#dailyWarnings'),refresh=container.querySelector('#dailyRefresh'),weatherBody=container.querySelector('#weatherDetailContent');
    for(const id of ['areaDetails','weatherDetails','serviceDetails']){
      const detail=container.querySelector('#'+id);
      detail.addEventListener('toggle',()=>{if(detail.open)opened.add(id);else opened.delete(id);});
    }
    function error(target,inline=false){
      if(!target.isConnected)return;
      const tag=inline?'span':'div';
      target.innerHTML=`<${tag} class="source-unavailable" role="status">${E(L.error)}</${tag}>`;
      if(!inline)target.insertAdjacentHTML('beforeend',`<p class="compact-meta">${E(L.region)}</p>${link('warnings')}`);
    }
    async function update(force=false){
      controller?.abort();const current=new AbortController();controller=current;
      refresh.disabled=true;w.setAttribute('aria-busy','true');a.setAttribute('aria-busy','true');
      w.innerHTML='<span class="compact-loading">SMHI…</span>';weatherBody.innerHTML='<p class="daily-note">SMHI…</p>';
      // Pending/failed checks must never leave a previously reassuring status on screen.
      a.innerHTML=`<p class="daily-note">${E(L.warnings)} · SMHI…</p>`;
      const active=()=>!current.signal.aborted&&container.querySelector('#todayScreen')?.isConnected&&w.isConnected;
      await Promise.allSettled([
        D.loadForecast(area,{signal:current.signal,force}).then(r=>{
          if(!active())return;const rows=r.payload.rows,first=rows[0],data=first.data;
          const number=n=>D.finite(n)?new Intl.NumberFormat(language,{maximumFractionDigits:1}).format(n):'—';
          const probability=n=>D.finite(n)&&n>=0&&n<=100?number(n)+'%':'—';
          w.innerHTML=`<span class="weather-main"><strong>${number(data.air_temperature)}<span>°C</span></strong><span class="compact-forecast-metrics"><span>${E(L.precip)} <b>${probability(data.probability_of_precipitation)}</b></span><span>${E(L.wind)} <b>${number(data.wind_speed)} m/s</b></span></span></span><span class="compact-meta">SMHI · ${E(S.forecast)} ${E(fmt(first.time,true))} · ${E(L.received)} ${E(fmt(r.fetchedAt,true))}</span>`;
          weatherBody.innerHTML=`<table class="weather-hours"><caption>${E(L.next)}</caption><tbody>${rows.slice(0,6).map(row=>`<tr><th scope="row"><time datetime="${E(row.time)}">${E(fmt(row.time,true))}</time></th><td>${number(row.data.air_temperature)} °C</td><td><span class="visually-hidden">${E(L.precip)}: </span>${probability(row.data.probability_of_precipitation)}</td></tr>`).join('')}</tbody></table><p class="daily-note">${E(L.forecast)}: ${E(fmt(r.payload.referenceTime))}<br>${E(L.received)}: ${E(fmt(r.fetchedAt))}</p>${link('weather')}`;
        }).catch(()=>{if(active()){error(w,true);weatherBody.innerHTML=link('weather');}}),
        D.loadWarnings({signal:current.signal,force}).then(r=>{
          if(!active())return;
          const meta=`<span class="compact-meta">SMHI · Västra Götaland · ${E(L.received)} ${E(fmt(r.fetchedAt,true))}</span>`;
          if(r.payload.length){
            // Active notices are fully visible. Compactness must not hide safety information.
            a.innerHTML=`<div class="compact-active-warnings"><h2>${I('warning')}${E(L.warnings)} (${r.payload.length})</h2><p class="daily-note">${E(L.region)}</p>${r.payload.slice(0,6).map(item=>`<article class="warning-item"><span class="warning-level" lang="sv">${E(item.levelLabel)}</span><h3 lang="sv">${E(item.title)}</h3><p lang="sv">${E(item.area)}</p>${item.end?`<time datetime="${E(item.end)}">→ ${E(fmt(item.end))}</time>`:''}</article>`).join('')}${meta}${link('warnings')}</div>`;
          }else{
            a.innerHTML=`<details id="warningDetails"><summary><span class="compact-icon">${I('warning')}</span><span class="compact-row-copy"><strong>${E(S.quiet)}</strong>${meta}</span>${chevron}</summary><div class="compact-detail-body"><p class="daily-note">${E(L.none)}</p><p class="daily-note">${E(L.region)}</p>${link('warnings')}</div></details>`;
          }
        }).catch(()=>{if(active())error(a);})
      ]);
      if(active()){refresh.disabled=false;w.removeAttribute('aria-busy');a.removeAttribute('aria-busy');}
    }
    container.querySelector('#weatherArea').addEventListener('change',e=>{
      area=e.target.value;C.storage.set('sverinav-weather-area',area);
      container.querySelector('#currentWeatherArea').textContent=D.AREAS[area].name;
      update();
    });
    refresh.addEventListener('click',()=>update(true));
    helpers.plans(container.querySelector('#homeOpenPlans'),{limit:1});
    // Riksdag belongs in Beslut; no hidden request or repeated document list on Idag.
    update();timer=setInterval(()=>{if(document.visibilityState==='visible'&&w.isConnected)update();},15*60000);
  }
  globalThis.SverinavToday={render,stop,COPY,KEYS,COMPACT_COPY,COMPACT_KEYS,label:language=>(COPY[language]||COPY.en)[0]};
})();
