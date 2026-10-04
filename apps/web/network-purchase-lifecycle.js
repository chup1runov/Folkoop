/* Shared-purchase lifecycle presentation domain for the network UI.
   RPC execution, authorization, draft mutation and state ownership stay in network-ui.js. */
(() => {
'use strict';

function create({
  escape,
  getData,
  getProfile,
  getDrafts,
  lifecycleText,
  chatText,
  cooperationText,
  formatWhen,
  localDateTime,
  button
}){
  if(
    typeof escape!=='function'||
    typeof getData!=='function'||
    typeof getProfile!=='function'||
    typeof getDrafts!=='function'||
    typeof lifecycleText!=='function'||
    typeof chatText!=='function'||
    typeof cooperationText!=='function'||
    typeof formatWhen!=='function'||
    typeof localDateTime!=='function'||
    typeof button!=='function'
  ) throw new Error('FOLKOOP_NETWORK_PURCHASE_LIFECYCLE_DEPENDENCIES');

  function render(user,coop,owner){
    const data=getData()||{};
    const drafts=getDrafts()||{};
    const purchaseProcess=Array.isArray(data.purchaseProcess)?data.purchaseProcess:[];
    const purchaseChoice=Array.isArray(data.purchaseChoice)?data.purchaseChoice:[];
    const confirmations=Array.isArray(data.purchaseConfirmations)?data.purchaseConfirmations:[];
    const process=purchaseProcess[0]||{stage:purchaseChoice.length?'offer_selected':'collecting'};
    const stage=process.stage||'collecting';
    const mine=confirmations.find(item=>item.user_id===user.id);
    const pending=confirmations.filter(item=>item.decision==='pending').length;
    const confirmed=confirmations.filter(item=>item.decision==='confirmed');
    const declined=confirmations.filter(item=>item.decision==='declined').length;
    const confirmedTotal=confirmed.reduce((sum,item)=>sum+Number(item.quantity||0),0);
    const profileName=id=>id===user.id
      ?chatText('you')
      :(getProfile(id)?.name||cooperationText('noProfile'));

    let html=`<section class="card"><div class="row"><h3>${escape(lifecycleText('lifecycle'))}</h3><span class="badge">${escape(lifecycleText(stage))}</span></div><p class="meta">${escape(lifecycleText('selfReported'))}</p>`;
    if(process.confirmation_deadline)html+=`<p><strong>${escape(lifecycleText('confirmationDeadline'))}:</strong> ${escape(formatWhen(process.confirmation_deadline))}</p>`;
    if(process.external_order_reference)html+=`<p><strong>${escape(lifecycleText('externalReference'))}:</strong> ${escape(process.external_order_reference)}</p>`;
    if(process.expected_delivery_at)html+=`<p><strong>${escape(lifecycleText('expectedDelivery'))}:</strong> ${escape(formatWhen(process.expected_delivery_at))}</p>`;
    if(process.pickup_place)html+=`<p><strong>${escape(lifecycleText('pickupPlace'))}:</strong> ${escape(process.pickup_place)}</p>`;
    if(process.pickup_start)html+=`<p><strong>${escape(lifecycleText('pickupStart'))}:</strong> ${escape(formatWhen(process.pickup_start))}${process.pickup_end?' – '+escape(formatWhen(process.pickup_end)):''}</p>`;
    if(process.delivery_note)html+=`<p style="white-space:pre-wrap">${escape(process.delivery_note)}</p>`;
    if(process.result_note)html+=`<p style="white-space:pre-wrap"><strong>${escape(lifecycleText('resultNote'))}:</strong> ${escape(process.result_note)}</p>`;
    html+='</section>';

    if(stage==='offer_selected'&&owner){
      const draft=drafts.netPurchaseStart||{};
      html+=`<form id="netPurchaseStart" class="editor card"><h3>${escape(lifecycleText('startConfirmation'))}</h3><p class="meta">${escape(lifecycleText('frozen'))}</p><label>${escape(lifecycleText('confirmationDeadline'))}<input name="deadline" type="datetime-local" required value="${escape(draft.deadline||'')}"></label><button class="button">${escape(lifecycleText('startConfirmation'))}</button></form>`;
    }

    if(stage==='confirming'){
      html+=`<h3>${escape(lifecycleText('confirmations'))}</h3><div class="draft-grid">${confirmations.map(item=>`<article class="card"><strong>${escape(profileName(item.user_id))}</strong><p>${escape(String(item.quantity))} ${escape(coop.unit)}</p><span class="badge">${escape(lifecycleText(item.decision))}</span>${item.note?`<p class="meta">${escape(item.note)}</p>`:''}</article>`).join('')||`<div class="empty"><p>${escape(lifecycleText('noSnapshot'))}</p></div>`}</div><p><strong>${escape(lifecycleText('confirmedTotal'))}: ${escape(String(confirmedTotal))} ${escape(coop.unit)}</strong> · ${escape(lifecycleText('pending'))}: ${pending} · ${escape(lifecycleText('declined'))}: ${declined}</p>`;
      if(mine){
        const draft=drafts.netPurchaseConfirm||{};
        html+=`<form id="netPurchaseConfirm" class="editor card"><label>${escape(lifecycleText('responseNote'))}<input name="note" maxlength="500" value="${escape(draft.note||mine.note||'')}"></label><div class="actions"><button name="operation" value="yes" class="button">${escape(lifecycleText('confirmYes'))}</button><button name="operation" value="no" class="button secondary">${escape(lifecycleText('confirmNo'))}</button></div></form>`;
      }else{
        html+=`<aside class="notice"><p>${escape(lifecycleText('noSnapshot'))}</p></aside>`;
      }
      if(owner){
        html+=`<div class="actions">${button('resetConfirmation','resetConfirmation',coop.id)}</div>`;
        if(pending===0&&confirmed.length>0){
          const draft=drafts.netPurchaseOrdered||{};
          html+=`<form id="netPurchaseOrdered" class="editor card"><h3>${escape(lifecycleText('markOrdered'))}</h3><p class="meta">${escape(lifecycleText('externalOrderNotice'))}</p><label>${escape(lifecycleText('externalReference'))}<input name="reference" maxlength="120" value="${escape(draft.reference||'')}"></label><label>${escape(lifecycleText('expectedDelivery'))}<input name="expectedDelivery" type="datetime-local" value="${escape(draft.expectedDelivery||'')}"></label><label>${escape(lifecycleText('pickupPlace'))}<input name="pickupPlace" maxlength="200" value="${escape(draft.pickupPlace||'')}"></label><label>${escape(lifecycleText('pickupStart'))}<input name="pickupStart" type="datetime-local" value="${escape(draft.pickupStart||'')}"></label><label>${escape(lifecycleText('pickupEnd'))}<input name="pickupEnd" type="datetime-local" value="${escape(draft.pickupEnd||'')}"></label><label>${escape(lifecycleText('deliveryNote'))}<textarea name="note" maxlength="1000" rows="3">${escape(draft.note||'')}</textarea></label><button class="button">${escape(lifecycleText('markOrdered'))}</button></form>`;
        }else{
          html+=`<p class="meta">${escape(lifecycleText('allResponsesNeeded'))}</p>`;
        }
      }
    }

    if(['ordered','delivered','distributing'].includes(stage)){
      if(owner){
        const draft=drafts.netPurchaseDeliveryPlan||{
          expectedDelivery:localDateTime(process.expected_delivery_at),
          pickupPlace:process.pickup_place||'',
          pickupStart:localDateTime(process.pickup_start),
          pickupEnd:localDateTime(process.pickup_end),
          note:process.delivery_note||''
        };
        html+=`<form id="netPurchaseDeliveryPlan" class="editor card"><h3>${escape(lifecycleText('saveDeliveryPlan'))}</h3><label>${escape(lifecycleText('expectedDelivery'))}<input name="expectedDelivery" type="datetime-local" value="${escape(draft.expectedDelivery||'')}"></label><label>${escape(lifecycleText('pickupPlace'))}<input name="pickupPlace" maxlength="200" value="${escape(draft.pickupPlace||'')}"></label><label>${escape(lifecycleText('pickupStart'))}<input name="pickupStart" type="datetime-local" value="${escape(draft.pickupStart||'')}"></label><label>${escape(lifecycleText('pickupEnd'))}<input name="pickupEnd" type="datetime-local" value="${escape(draft.pickupEnd||'')}"></label><label>${escape(lifecycleText('deliveryNote'))}<textarea name="note" maxlength="1000" rows="3">${escape(draft.note||'')}</textarea></label><button class="button secondary">${escape(lifecycleText('saveDeliveryPlan'))}</button></form>`;
      }
      if(stage==='ordered'&&owner){
        const draft=drafts.netPurchaseDelivered||{};
        html+=`<form id="netPurchaseDelivered" class="editor card"><p class="meta">${escape(lifecycleText('deliverySelfReport'))}</p><label>${escape(lifecycleText('deliveryNote'))}<input name="note" maxlength="1000" value="${escape(draft.note||'')}"></label><button class="button">${escape(lifecycleText('markDelivered'))}</button></form>`;
      }
    }

    if(['delivered','distributing'].includes(stage)){
      if(mine?.decision==='confirmed'){
        const draft=drafts.netPurchaseCollected||{};
        html+=`<form id="netPurchaseCollected" class="editor card"><label>${escape(lifecycleText('collectionNote'))}<input name="note" maxlength="500" value="${escape(draft.note||mine.collected_note||'')}"></label><div class="actions"><button name="operation" value="yes" class="button">${escape(lifecycleText('markCollected'))}</button>${mine.collected_at?`<button name="operation" value="no" class="button secondary">${escape(lifecycleText('undoCollected'))}</button>`:''}</div></form>`;
      }
      if(owner){
        const draft=drafts.netPurchaseFinish||{};
        html+=`<form id="netPurchaseFinish" class="editor card"><p class="meta">${escape(lifecycleText('resultSelfReport'))}</p><label>${escape(lifecycleText('resultNote'))}<textarea name="note" maxlength="2000" rows="3">${escape(draft.note||'')}</textarea></label><button class="button">${escape(lifecycleText('finishPurchase'))}</button></form>`;
      }
    }

    if(owner&&!['done','cancelled'].includes(stage)){
      const draft=drafts.netPurchaseCancel||{};
      html+=`<form id="netPurchaseCancel" class="editor card"><label>${escape(lifecycleText('cancelReason'))}<input name="reason" maxlength="2000" minlength="3" required value="${escape(draft.reason||'')}"></label><button class="button secondary">${escape(lifecycleText('cancelPurchase'))}</button></form>`;
    }
    return html;
  }

  return Object.freeze({render});
}

globalThis.FolkoopNetworkPurchaseLifecycle=Object.freeze({create});
})();

/* Economic Flow v0 presentation only. Authorization stays in Supabase RLS/RPCs. */
(() => {
'use strict';

const COPY={
 en:{section:'Economic coordination',intro:'Shows what economic coordination is happening inside this Project or Shared Purchase. It is not a second project system.',truth:'Flow stage is coordination state only. Closed does not mean paid, delivered or independently verified.',create:'Add economic flow',kind:'Flow kind',role:'Role',summary:'Purpose summary',stage:'Stage',roles:'Coordination roles',addRole:'Add role',save:'Save flow',delete:'Delete planning flow',empty:'No economic flow yet.',planning:'Planning',active:'Active',closed:'Closed',cancelled:'Cancelled',procurement:'Procurement',production:'Production',sale:'Sale',service:'Service',distribution:'Distribution',coordinator:'Coordinator',contributor:'Contributor',producer:'Producer',buyer:'Buyer',seller:'Seller',logistics:'Logistics',roleNote:'Roles describe coordination only; they are not employment, qualification or legal authority.',terminal:'Terminal flows stay as history and cannot reopen.',purchaseBoundary:'For Shared Purchase this does not replace supplier offers, confirmation, external order, delivery or pickup.',you:'You',removeRole:'Remove role'},
 ru:{section:'Экономическая координация',intro:'Показывает, какая экономическая координация происходит внутри проекта или совместной закупки. Это не вторая система проектов.',truth:'Этап потока — только состояние координации. «Закрыт» не означает оплату, доставку или независимо подтверждённый результат.',create:'Добавить экономический поток',kind:'Тип потока',role:'Роль',summary:'Краткая цель',stage:'Этап',roles:'Роли координации',addRole:'Добавить роль',save:'Сохранить поток',delete:'Удалить поток в планировании',empty:'Экономических потоков пока нет.',planning:'Планирование',active:'В работе',closed:'Закрыт',cancelled:'Отменён',procurement:'Закупка',production:'Производство',sale:'Продажа',service:'Услуга',distribution:'Распределение',coordinator:'Координатор',contributor:'Участник',producer:'Производитель',buyer:'Покупатель',seller:'Продавец',logistics:'Логистика',roleNote:'Роли описывают только координацию; это не трудовые отношения, квалификация и не юридические полномочия.',terminal:'Терминальный поток сохраняется как история и не может быть снова открыт.',purchaseBoundary:'Для совместной закупки этот слой не заменяет предложения поставщиков, подтверждение, внешний заказ, доставку и выдачу.',you:'Вы',removeRole:'Удалить роль'},
 sv:{section:'Ekonomisk samordning',intro:'Visar vilken ekonomisk samordning som sker inom projektet eller det gemensamma köpet. Det är inte ett andra projektsystem.',truth:'Flödets steg är bara samordningsstatus. Stängt betyder inte betalt, levererat eller oberoende verifierat.',create:'Lägg till ekonomiskt flöde',kind:'Flödestyp',role:'Roll',summary:'Kort syfte',stage:'Steg',roles:'Samordningsroller',addRole:'Lägg till roll',save:'Spara flöde',delete:'Radera planeringsflöde',empty:'Inget ekonomiskt flöde ännu.',planning:'Planering',active:'Aktivt',closed:'Stängt',cancelled:'Avbrutet',procurement:'Inköp',production:'Produktion',sale:'Försäljning',service:'Tjänst',distribution:'Distribution',coordinator:'Samordnare',contributor:'Deltagare',producer:'Producent',buyer:'Köpare',seller:'Säljare',logistics:'Logistik',roleNote:'Rollerna beskriver bara samordning; de är inte anställning, kvalifikation eller juridisk behörighet.',terminal:'Terminala flöden sparas som historik och kan inte öppnas igen.',purchaseBoundary:'För gemensamt köp ersätter lagret inte leverantörserbjudanden, bekräftelse, extern beställning, leverans eller hämtning.',you:'Du',removeRole:'Ta bort roll'},
 es:{section:'Coordinación económica',intro:'Muestra qué coordinación económica ocurre dentro de este Proyecto o Compra compartida. No es un segundo sistema de proyectos.',truth:'La etapa del flujo solo describe la coordinación. Cerrado no significa pagado, entregado ni verificado de forma independiente.',create:'Añadir flujo económico',kind:'Tipo de flujo',role:'Rol',summary:'Resumen del propósito',stage:'Etapa',roles:'Roles de coordinación',addRole:'Añadir rol',save:'Guardar flujo',delete:'Eliminar flujo en planificación',empty:'Aún no hay flujo económico.',planning:'Planificación',active:'Activo',closed:'Cerrado',cancelled:'Cancelado',procurement:'Adquisición',production:'Producción',sale:'Venta',service:'Servicio',distribution:'Distribución',coordinator:'Coordinador',contributor:'Colaborador',producer:'Productor',buyer:'Comprador',seller:'Vendedor',logistics:'Logística',roleNote:'Los roles describen solo la coordinación; no implican empleo, cualificación ni autoridad legal.',terminal:'Los flujos terminales quedan como historial y no pueden reabrirse.',purchaseBoundary:'En una Compra compartida esto no sustituye ofertas de proveedores, confirmación, pedido externo, entrega ni recogida.',you:'Tú',removeRole:'Quitar rol'},
 uk:{section:'Економічна координація',intro:'Показує, яка економічна координація відбувається в межах Проєкту або Спільної закупівлі. Це не друга система проєктів.',truth:'Етап потоку — лише стан координації. «Закрито» не означає оплату, доставку чи незалежно підтверджений результат.',create:'Додати економічний потік',kind:'Тип потоку',role:'Роль',summary:'Коротка мета',stage:'Етап',roles:'Ролі координації',addRole:'Додати роль',save:'Зберегти потік',delete:'Видалити потік у плануванні',empty:'Економічних потоків ще немає.',planning:'Планування',active:'Активний',closed:'Закритий',cancelled:'Скасований',procurement:'Закупівля',production:'Виробництво',sale:'Продаж',service:'Послуга',distribution:'Розподіл',coordinator:'Координатор',contributor:'Учасник',producer:'Виробник',buyer:'Покупець',seller:'Продавець',logistics:'Логістика',roleNote:'Ролі описують лише координацію; це не трудові відносини, кваліфікація чи юридичні повноваження.',terminal:'Термінальні потоки зберігаються як історія і не можуть бути знову відкриті.',purchaseBoundary:'Для Спільної закупівлі цей шар не замінює пропозиції постачальників, підтвердження, зовнішнє замовлення, доставку чи видачу.',you:'Ви',removeRole:'Видалити роль'},
 fi:{section:'Taloudellinen koordinointi',intro:'Näyttää, mitä taloudellista koordinointia tapahtuu tämän projektin tai yhteisoston sisällä. Se ei ole toinen projektijärjestelmä.',truth:'Virran vaihe kuvaa vain koordinoinnin tilaa. Suljettu ei tarkoita maksettua, toimitettua tai riippumattomasti varmennettua.',create:'Lisää taloudellinen virta',kind:'Virran tyyppi',role:'Rooli',summary:'Tarkoituksen yhteenveto',stage:'Vaihe',roles:'Koordinointiroolit',addRole:'Lisää rooli',save:'Tallenna virta',delete:'Poista suunnitteluvaiheen virta',empty:'Taloudellisia virtoja ei vielä ole.',planning:'Suunnittelu',active:'Aktiivinen',closed:'Suljettu',cancelled:'Peruttu',procurement:'Hankinta',production:'Tuotanto',sale:'Myynti',service:'Palvelu',distribution:'Jakelu',coordinator:'Koordinaattori',contributor:'Osallistuja',producer:'Tuottaja',buyer:'Ostaja',seller:'Myyjä',logistics:'Logistiikka',roleNote:'Roolit kuvaavat vain koordinointia; ne eivät tarkoita työsuhdetta, pätevyyttä tai oikeudellista toimivaltaa.',terminal:'Päättyneet virrat säilyvät historiassa eikä niitä voi avata uudelleen.',purchaseBoundary:'Yhteisostossa tämä ei korvaa toimittajatarjouksia, vahvistusta, ulkoista tilausta, toimitusta tai noutoa.',you:'Sinä',removeRole:'Poista rooli'},
 bs:{section:'Ekonomska koordinacija',intro:'Prikazuje kakva se ekonomska koordinacija odvija unutar ovog Projekta ili Zajedničke kupovine. To nije drugi sistem projekata.',truth:'Faza toka opisuje samo stanje koordinacije. Zatvoreno ne znači plaćeno, isporučeno ili nezavisno potvrđeno.',create:'Dodaj ekonomski tok',kind:'Vrsta toka',role:'Uloga',summary:'Sažetak svrhe',stage:'Faza',roles:'Koordinacijske uloge',addRole:'Dodaj ulogu',save:'Sačuvaj tok',delete:'Izbriši tok u planiranju',empty:'Još nema ekonomskog toka.',planning:'Planiranje',active:'Aktivan',closed:'Zatvoren',cancelled:'Otkazan',procurement:'Nabavka',production:'Proizvodnja',sale:'Prodaja',service:'Usluga',distribution:'Distribucija',coordinator:'Koordinator',contributor:'Učesnik',producer:'Proizvođač',buyer:'Kupac',seller:'Prodavac',logistics:'Logistika',roleNote:'Uloge opisuju samo koordinaciju; nisu zaposlenje, kvalifikacija niti pravno ovlaštenje.',terminal:'Završeni tokovi ostaju u historiji i ne mogu se ponovo otvoriti.',purchaseBoundary:'Kod Zajedničke kupovine ovo ne zamjenjuje ponude dobavljača, potvrdu, vanjsku narudžbu, dostavu ili preuzimanje.',you:'Vi',removeRole:'Ukloni ulogu'},
 ar:{section:'التنسيق الاقتصادي',intro:'يوضح نوع التنسيق الاقتصادي داخل هذا المشروع أو الشراء المشترك. وهو ليس نظام مشاريع ثانياً.',truth:'مرحلة التدفق تصف حالة التنسيق فقط. الإغلاق لا يعني الدفع أو التسليم أو التحقق المستقل.',create:'إضافة تدفق اقتصادي',kind:'نوع التدفق',role:'الدور',summary:'ملخص الغرض',stage:'المرحلة',roles:'أدوار التنسيق',addRole:'إضافة دور',save:'حفظ التدفق',delete:'حذف تدفق التخطيط',empty:'لا يوجد تدفق اقتصادي بعد.',planning:'تخطيط',active:'نشط',closed:'مغلق',cancelled:'ملغى',procurement:'مشتريات',production:'إنتاج',sale:'بيع',service:'خدمة',distribution:'توزيع',coordinator:'منسق',contributor:'مساهم',producer:'منتج',buyer:'مشتري',seller:'بائع',logistics:'لوجستيات',roleNote:'الأدوار تصف التنسيق فقط؛ ولا تعني التوظيف أو التأهيل أو السلطة القانونية.',terminal:'تبقى التدفقات المنتهية كسجل ولا يمكن إعادة فتحها.',purchaseBoundary:'في الشراء المشترك لا يحل هذا محل عروض الموردين أو التأكيد أو الطلب الخارجي أو التسليم أو الاستلام.',you:'أنت',removeRole:'إزالة الدور'},
 fa:{section:'هماهنگی اقتصادی',intro:'نشان می‌دهد چه هماهنگی اقتصادی درون این پروژه یا خرید مشترک انجام می‌شود. این یک سامانهٔ دوم پروژه نیست.',truth:'مرحلهٔ جریان فقط وضعیت هماهنگی است. بسته شدن به معنی پرداخت، تحویل یا تأیید مستقل نیست.',create:'افزودن جریان اقتصادی',kind:'نوع جریان',role:'نقش',summary:'خلاصهٔ هدف',stage:'مرحله',roles:'نقش‌های هماهنگی',addRole:'افزودن نقش',save:'ذخیرهٔ جریان',delete:'حذف جریان در حال برنامه‌ریزی',empty:'هنوز جریان اقتصادی وجود ندارد.',planning:'برنامه‌ریزی',active:'فعال',closed:'بسته',cancelled:'لغوشده',procurement:'تدارکات',production:'تولید',sale:'فروش',service:'خدمت',distribution:'توزیع',coordinator:'هماهنگ‌کننده',contributor:'مشارکت‌کننده',producer:'تولیدکننده',buyer:'خریدار',seller:'فروشنده',logistics:'لجستیک',roleNote:'نقش‌ها فقط هماهنگی را توصیف می‌کنند؛ به معنی استخدام، صلاحیت یا اختیار قانونی نیستند.',terminal:'جریان‌های پایان‌یافته به‌عنوان سابقه باقی می‌مانند و دوباره باز نمی‌شوند.',purchaseBoundary:'در خرید مشترک این لایه جایگزین پیشنهادهای تأمین‌کننده، تأیید، سفارش خارجی، تحویل یا دریافت نمی‌شود.',you:'شما',removeRole:'حذف نقش'},
 so:{section:'Isku-duwid dhaqaale',intro:'Waxay muujinaysaa isku-duwidda dhaqaale ee ka dhex dhacaysa Mashruucan ama Iibsiga Wadajirka ah. Ma aha nidaam mashruuc labaad.',truth:'Marxaladda qulqulku waa xaaladda isku-duwidda oo keliya. Xirnaansho macnaheedu ma aha in la bixiyey, la geeyey ama si madax-bannaan loo xaqiijiyey.',create:'Ku dar qulqul dhaqaale',kind:'Nooca qulqulka',role:'Door',summary:'Soo koobid ujeeddo',stage:'Marxalad',roles:'Doorarka isku-duwidda',addRole:'Ku dar door',save:'Kaydi qulqulka',delete:'Tirtir qulqulka qorshaynta',empty:'Weli ma jiro qulqul dhaqaale.',planning:'Qorshayn',active:'Firfircoon',closed:'Xiran',cancelled:'La joojiyey',procurement:'Soo-iibin',production:'Wax-soo-saar',sale:'Iib',service:'Adeeg',distribution:'Qaybin',coordinator:'Isku-duwe',contributor:'Ka-qaybgale',producer:'Soo-saare',buyer:'Iibsade',seller:'Iibiye',logistics:'Saadka',roleNote:'Doorarku waxay tilmaamayaan isku-duwid keliya; ma aha shaqaalayn, aqoon-xirfadeed ama awood sharci.',terminal:'Qulqulka dhammaaday wuxuu ahaanayaa taariikh mana dib loo furi karo.',purchaseBoundary:'Iibsiga Wadajirka ah tani ma beddelayso dalabyada alaab-qeybiyeyaasha, xaqiijinta, dalabka dibadda, gaarsiinta ama qaadashada.',you:'Adiga',removeRole:'Ka saar door'},
 ku:{section:'Hevkariya aborî',intro:'Nîşan dide ka di vê Projeyê an Kirîna Hevbeş de çi hevkariya aborî tê kirin. Ev pergala projeyek duyemîn nîne.',truth:'Qonaxa herikînê tenê rewşa hevkariyê ye. Girtî nayê wateya dayîn, radestkirin an piştrastkirina serbixwe.',create:'Herikîna aborî lê zêde bike',kind:'Cureyê herikînê',role:'Rol',summary:'Kurteya armancê',stage:'Qonax',roles:'Rolên hevkariyê',addRole:'Rol lê zêde bike',save:'Herikînê tomar bike',delete:'Herikîna planê jê bibe',empty:'Hîn herikîna aborî tune.',planning:'Plan',active:'Çalak',closed:'Girtî',cancelled:'Betalkirî',procurement:'Dabînkirin',production:'Hilberîn',sale:'Firotin',service:'Xizmet',distribution:'Belavkirin',coordinator:'Hevrêvebir',contributor:'Beşdar',producer:'Hilberîner',buyer:'Kiryar',seller:'Firoşkar',logistics:'Lojîstîk',roleNote:'Rol tenê hevkariyê diyar dikin; ew ne kar, ne jêhatîbûn û ne desthilata qanûnî ne.',terminal:'Herikînên dawî wek dîrok dimînin û nayên vekirin.',purchaseBoundary:'Di Kirîna Hevbeş de ev ne cihê pêşniyarên dabînker, pejirandin, sipariya derve, radestkirin an standinê digire.',you:'Tu',removeRole:'Rolê rake'}
};

function create({escape,getLanguage,getProfile}){
 if(typeof escape!=='function'||typeof getLanguage!=='function'||typeof getProfile!=='function')throw new Error('FOLKOOP_ECONOMIC_FLOW_DEPENDENCIES');
 const text=k=>COPY[getLanguage()]?.[k]||COPY.en[k]||k;
 const name=(uid,user)=>uid===user.id?text('you'):(getProfile(uid)?.name||text('roles'));
 const stageOptions=stage=>stage==='planning'?['planning','active','cancelled']:stage==='active'?['active','closed','cancelled']:[stage];
 const kinds=coop=>coop.kind==='purchase'?['procurement','distribution']:['procurement','production','sale','service','distribution'];
 const roles=['coordinator','contributor','producer','buyer','seller','logistics'];

 function render({user,coop,owner,members,flows,flowRoles,createDraft,editDrafts,roleDrafts,readOnly=false}){
  const cards=(flows||[]).map(flow=>{
   const terminal=['closed','cancelled'].includes(flow.stage);
   const assigned=(flowRoles||[]).filter(r=>r.flow_id===flow.id);
   const roleHtml=assigned.map(r=>{
    const protectedCoordinator=r.user_id===coop.owner_id&&r.role==='coordinator';
    const remove=owner&&!readOnly&&!terminal&&!protectedCoordinator
      ?`<button type="button" class="text-button" data-economic="removeRole" data-flow="${escape(flow.id)}" data-user="${escape(r.user_id)}" data-role="${escape(r.role)}" aria-label="${escape(text('removeRole')+': '+name(r.user_id,user)+' · '+text(r.role))}">×</button>`
      :'';
    return `<span class="badge economic-role">${escape(name(r.user_id,user))} · ${escape(text(r.role))}${remove}</span>`;
   }).join('')||`<span class="meta">${escape(text('empty'))}</span>`;
   const edit=editDrafts?.[flow.id]||{stage:flow.stage,summary:flow.summary};
   const manage=owner&&!readOnly&&!terminal?`<form class="netEconomicFlowEdit editor card" data-flow="${escape(flow.id)}">
    <label>${escape(text('stage'))}<select name="stage">${stageOptions(flow.stage).map(v=>`<option value="${v}"${edit.stage===v?' selected':''}>${escape(text(v))}</option>`).join('')}</select></label>
    <label>${escape(text('summary'))}<textarea name="summary" maxlength="500" required rows="2">${escape(edit.summary||'')}</textarea></label>
    <div class="actions"><button class="button">${escape(text('save'))}</button>${flow.stage==='planning'?`<button type="button" class="button secondary" data-economic="deleteFlow" data-flow="${escape(flow.id)}">${escape(text('delete'))}</button>`:''}</div>
   </form>`:'';
   const roleDraft=roleDrafts?.[flow.id]||{user:'',role:'contributor'};
   const roleForm=owner&&!readOnly&&!terminal?`<form class="netEconomicRoleAdd editor card" data-flow="${escape(flow.id)}">
    <h4>${escape(text('addRole'))}</h4>
    <label>${escape(text('roles'))}<select name="user" required><option value=""></option>${members.map(m=>`<option value="${escape(m.user_id)}"${roleDraft.user===m.user_id?' selected':''}>${escape(name(m.user_id,user))}</option>`).join('')}</select></label>
    <label>${escape(text('role'))}<select name="role">${roles.map(r=>`<option value="${r}"${roleDraft.role===r?' selected':''}>${escape(text(r))}</option>`).join('')}</select></label>
    <button class="button secondary">${escape(text('addRole'))}</button>
   </form>`:'';
   return `<article class="card economic-flow-card" data-economic-flow="${escape(flow.id)}"><div class="row"><span class="badge">${escape(text(flow.kind))}</span><span class="badge muted-badge">${escape(text(flow.stage))}</span></div><p style="white-space:pre-wrap">${escape(flow.summary)}</p><h4>${escape(text('roles'))}</h4><div class="economic-role-list">${roleHtml}</div><p class="meta">${escape(text('roleNote'))}</p>${terminal?`<p class="meta">${escape(text('terminal'))}</p>`:''}${manage}${roleForm}</article>`;
  }).join('');
  const draft=createDraft||{kind:coop.kind==='purchase'?'procurement':'service',summary:''};
  const createForm=owner&&!readOnly&&['open','active'].includes(coop.status)?`<form id="netEconomicFlowCreate" class="editor card"><h3>${escape(text('create'))}</h3><label>${escape(text('kind'))}<select name="kind">${kinds(coop).map(k=>`<option value="${k}"${draft.kind===k?' selected':''}>${escape(text(k))}</option>`).join('')}</select></label><label>${escape(text('summary'))}<textarea name="summary" maxlength="500" required rows="2">${escape(draft.summary||'')}</textarea></label><button class="button">${escape(text('create'))}</button></form>`:'';
  return `<div class="economic-flow-zone"><p>${escape(text('intro'))}</p><aside class="notice"><p>${escape(text('truth'))}</p>${coop.kind==='purchase'?`<p>${escape(text('purchaseBoundary'))}</p>`:''}</aside><div class="draft-grid">${cards||`<div class="empty"><p>${escape(text('empty'))}</p></div>`}</div>${createForm}</div>`;
 }

 return Object.freeze({render,text});
}

globalThis.FolkoopNetworkEconomicFlow=Object.freeze({create});
})();
