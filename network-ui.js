/* Accounts and shared communities. Inactive until a dedicated backend is configured. */
(() => {
'use strict';
const host=document.getElementById('networkPanel');if(!host)return;
const esc=globalThis.FolkoopCore.escape;
const en={title:'Network account',off:'The server is not connected yet. Local drafts below remain on your device.',login:'Pilot sign-in',invite:'Free pilot. For the first bootstrap, Supabase’s built-in mail can deliver only to a project-team email address. Your local drafts are never uploaded automatically. Sign-in lasts for this tab; after reload or expiry, enter a new code.',email:'Email',code:'Code from email',send:'Request code',verify:'Sign in',sent:'If this address is authorized by the current free mail setup, check its inbox. Sending a request does not guarantee delivery.',out:'Sign out',profile:'Network profile',private:'Visible only to you unless you enable the directory. Group publications are visible to that group’s members.',name:'Name or nickname',skills:'Skills',about:'About me',listed:'Show this profile to other pilot participants',save:'Save on server',saved:'Saved on server.',groups:'Communities',desc:'Any pilot participant can discover and join these communities. Publications are visible to current members. This is not a private encrypted chat.',newGroup:'Create community',description:'Description',create:'Create',join:'Join',leave:'Leave',open:'Open',back:'All communities',refresh:'Refresh',post:'New publication',publish:'Publish to members',empty:'Nothing here yet.',delete:'Delete',confirm:'Delete? This cannot be undone.',ownerDelete:'Delete my community and all its publications',report:'Report',reason:'Reason for the report (do not include sensitive personal information)',reported:'Report stored for operator review. No automatic verdict has been made.',block:'Hide this participant',ban:'Ban from my community',unblock:'Unhide',blocks:'Hidden participants',deleteProfile:'Delete my network profile',profileDeleted:'Network profile deleted. This does not delete the Auth account or past publications.',accountDelete:'Full account deletion is handled by the pilot operator until the account-deletion endpoint is implemented.',export:'Export visible records',exportNote:'Export can be limited by server row limits and access permissions; request a complete export from the operator.',loading:'Loading…',members:'Members’ publications',by:'Participant',own:'You',directory:'People who opted into discovery',banned:'Access to this community is unavailable.',busy:'Working…',auth:'Sign in again.',error:'Request failed. No successful change is confirmed. Check the connection and try again.',denied:'Access denied. Pilot access or membership may be missing.',limit:'Too many requests. Try again later.',invalid:'Check the entered values.',stale:'Session changed. Reload the section.',localTitle:'Local workspace below — separate from your network account.'};
const ru={...en,title:'Сетевой аккаунт',off:'Сервер ещё не подключён. Личные черновики ниже остаются на твоём устройстве.',login:'Вход в пилот',invite:'Бесплатный пилот. Для первого запуска встроенная почта Supabase доставляет код только на адрес участника команды проекта. Личные черновики не загружаются автоматически. Вход действует в этой вкладке; после перезагрузки или истечения сессии потребуется новый код.',email:'Электронная почта',code:'Код из письма',send:'Получить код',verify:'Войти',sent:'Если адрес разрешён текущей бесплатной почтовой настройкой, проверь почту. Принятый запрос ещё не подтверждает доставку письма.',out:'Выйти',profile:'Сетевой профиль',private:'Профиль виден только тебе, пока ты не включишь показ в каталоге. Публикации в группе видят её участники.',name:'Имя или псевдоним',skills:'Навыки',about:'О себе',listed:'Показывать профиль другим участникам пилота',save:'Сохранить на сервере',saved:'Сохранено на сервере.',groups:'Сообщества',desc:'Любой участник пилота может найти сообщество и вступить. Публикации видны действующим участникам группы. Это не закрытый зашифрованный чат.',newGroup:'Создать сообщество',description:'Описание',create:'Создать',join:'Вступить',leave:'Выйти из группы',open:'Открыть',back:'Все сообщества',refresh:'Обновить',post:'Новая публикация',publish:'Опубликовать для участников',empty:'Здесь пока пусто.',delete:'Удалить',confirm:'Удалить? Отменить это действие нельзя.',ownerDelete:'Удалить моё сообщество со всеми публикациями',report:'Пожаловаться',reason:'Причина жалобы (без чувствительных персональных данных)',reported:'Жалоба сохранена для проверки оператором. Автоматический вердикт не вынесен.',block:'Скрыть участника',ban:'Запретить доступ в мою группу',unblock:'Снять скрытие',blocks:'Скрытые участники',deleteProfile:'Удалить сетевой профиль',profileDeleted:'Сетевой профиль удалён. Аккаунт входа и прежние публикации этим не удаляются.',accountDelete:'Полное удаление аккаунта пока выполняет оператор пилота: отдельный сервис удаления ещё не подключён.',export:'Выгрузить доступные записи',exportNote:'Выгрузка ограничена правами доступа и лимитами сервера; полную копию можно запросить у оператора.',loading:'Загрузка…',members:'Публикации участников',by:'Участник',own:'Ты',directory:'Люди, включившие показ профиля',banned:'Доступ в это сообщество недоступен.',busy:'Выполняется…',auth:'Войди заново.',error:'Запрос не выполнен. Успешное изменение не подтверждено. Проверь связь и повтори.',denied:'Нет доступа. Возможно, не выдано приглашение в пилот или нет членства в группе.',limit:'Слишком много запросов. Повтори позже.',invalid:'Проверь введённые данные.',stale:'Сессия изменилась. Обнови раздел.',localTitle:'Ниже — локальная рабочая область, отдельно от сетевого аккаунта.'};
const sv={...en,title:'Nätverkskonto',off:'Servern är inte ansluten ännu. Dina lokala utkast nedan stannar på enheten.',login:'Logga in i piloten',invite:'Gratis pilot. Vid första uppstarten kan Supabase inbyggda e-post bara leverera kod till en projektmedlems e-postadress. Lokala utkast laddas aldrig upp automatiskt. Inloggningen gäller denna flik; ny kod behövs efter omladdning eller utgången session.',email:'E-post',code:'Kod från e-post',send:'Begär kod',verify:'Logga in',sent:'Om adressen är godkänd av den aktuella kostnadsfria e-postinställningen, kontrollera inkorgen. En godkänd begäran bekräftar inte leverans.',out:'Logga ut',profile:'Nätverksprofil',private:'Endast du ser profilen tills du aktiverar katalogen. Gruppinlägg visas för gruppens medlemmar.',name:'Namn eller smeknamn',skills:'Färdigheter',about:'Om mig',listed:'Visa profilen för andra pilotdeltagare',save:'Spara på servern',saved:'Sparat på servern.',groups:'Gemenskaper',desc:'Alla pilotdeltagare kan hitta och gå med i grupperna. Inlägg visas för aktuella medlemmar. Detta är inte en privat krypterad chatt.',newGroup:'Skapa grupp',description:'Beskrivning',create:'Skapa',join:'Gå med',leave:'Lämna gruppen',open:'Öppna',back:'Alla grupper',refresh:'Uppdatera',post:'Nytt inlägg',publish:'Publicera för medlemmar',empty:'Här är det tomt ännu.',delete:'Ta bort',confirm:'Ta bort? Detta går inte att ångra.',ownerDelete:'Radera min grupp och alla dess inlägg',report:'Rapportera',reason:'Orsak till rapporten (inga känsliga personuppgifter)',reported:'Rapporten sparades för granskning. Inget automatiskt beslut har fattats.',block:'Dölj deltagaren',ban:'Stäng av från min grupp',unblock:'Visa igen',blocks:'Dolda deltagare',deleteProfile:'Radera nätverksprofilen',profileDeleted:'Nätverksprofilen raderades. Inloggningskontot och tidigare inlägg raderas inte av detta.',accountDelete:'Pilotoperatören hanterar fullständig kontoradering tills en separat raderingstjänst finns.',export:'Exportera synliga poster',exportNote:'Export begränsas av behörighet och servergränser; begär en fullständig kopia från operatören.',loading:'Laddar…',members:'Medlemmarnas inlägg',by:'Deltagare',own:'Du',directory:'Personer som valt synlighet',banned:'Denna grupp är inte tillgänglig.',busy:'Arbetar…',auth:'Logga in igen.',error:'Begäran misslyckades. Ingen lyckad ändring är bekräftad. Kontrollera anslutningen och försök igen.',denied:'Åtkomst nekad. Pilotbehörighet eller medlemskap kan saknas.',limit:'För många förfrågningar. Försök senare.',invalid:'Kontrollera värdena.',stale:'Sessionen ändrades. Uppdatera delen.',localTitle:'Lokal arbetsyta nedan — separat från nätverkskontot.'};
let api,configError=false;try{api=FolkoopNetwork.client(globalThis.FolkoopNetworkConfig);}catch{configError=true;}
const chatCopy={
 en:{messagesTitle:'Messages',messagesDesc:'Direct and group conversations for pilot participants. Messages are stored on the server, use manual refresh and are not end-to-end encrypted.',direct:'Direct conversation',startDirect:'Start conversation',choosePerson:'Choose a person',groupChat:'Group conversation',newGroupChat:'Create group conversation',groupTitle:'Conversation name',chooseMembers:'Invite people',invitations:'Invitations',accept:'Accept',decline:'Decline',conversation:'Conversation',sendMessage:'Send',message:'Message',noChats:'No conversations yet.',backChats:'All conversations',invite:'Invite',leaveChat:'Leave conversation',deleteChat:'Delete group conversation',removeMember:'Remove',membersList:'Participants',manual:'Refresh',notEncrypted:'Manual refresh · not end-to-end encrypted',you:'You',reportMessage:'Report message',deletedMessage:'Message deleted.',invitePending:'Invitation pending',noPeople:'No discoverable pilot profiles are available yet.'},
 ru:{messagesTitle:'Сообщения',messagesDesc:'Личные и групповые разговоры участников пилота. Сообщения хранятся на сервере, обновляются вручную и пока не имеют сквозного шифрования.',direct:'Личный разговор',startDirect:'Начать разговор',choosePerson:'Выбери человека',groupChat:'Групповой разговор',newGroupChat:'Создать групповой разговор',groupTitle:'Название разговора',chooseMembers:'Пригласить людей',invitations:'Приглашения',accept:'Принять',decline:'Отклонить',conversation:'Разговор',sendMessage:'Отправить',message:'Сообщение',noChats:'Разговоров пока нет.',backChats:'Все разговоры',invite:'Пригласить',leaveChat:'Выйти из разговора',deleteChat:'Удалить групповой разговор',removeMember:'Удалить',membersList:'Участники',manual:'Обновить',notEncrypted:'Ручное обновление · без сквозного шифрования',you:'Ты',reportMessage:'Пожаловаться на сообщение',deletedMessage:'Сообщение удалено.',invitePending:'Ожидает ответа',noPeople:'Пока нет доступных для поиска участников пилота.'},
 sv:{messagesTitle:'Meddelanden',messagesDesc:'Direkta och gruppsamtal för pilotdeltagare. Meddelanden lagras på servern, uppdateras manuellt och är ännu inte end-to-end-krypterade.',direct:'Direktsamtal',startDirect:'Starta samtal',choosePerson:'Välj en person',groupChat:'Gruppsamtal',newGroupChat:'Skapa gruppsamtal',groupTitle:'Samtalets namn',chooseMembers:'Bjud in personer',invitations:'Inbjudningar',accept:'Acceptera',decline:'Avböj',conversation:'Samtal',sendMessage:'Skicka',message:'Meddelande',noChats:'Inga samtal ännu.',backChats:'Alla samtal',invite:'Bjud in',leaveChat:'Lämna samtalet',deleteChat:'Radera gruppsamtalet',removeMember:'Ta bort',membersList:'Deltagare',manual:'Uppdatera',notEncrypted:'Manuell uppdatering · inte end-to-end-krypterat',you:'Du',reportMessage:'Rapportera meddelande',deletedMessage:'Meddelandet raderades.',invitePending:'Väntar på svar',noPeople:'Det finns ännu inga sökbara pilotprofiler.'}
};
const coopCopy={
 en:{togetherTitle:'Cooperate',projectsTitle:'Projects',networkDesc:'Shared cooperation objects are visible to pilot participants. Joining reveals the participant workspace. Local drafts below stay private.',projectDesc:'Projects have participants, updates and tasks. Local project drafts below stay private until you choose to recreate them on the network.',newCoop:'Create cooperation',kind:'Type',need:'Need',offer:'Offer',purchase:'Joint purchase',resource:'Shared resource',project:'Project',title:'Title',description:'Description',location:'Area / place',target:'Target quantity',unit:'Unit',status:'Status',openStatus:'Open',activeStatus:'Active',doneStatus:'Done',cancelledStatus:'Cancelled',join:'Join',leave:'Leave',delete:'Delete cooperation',edit:'Edit cooperation',members:'Participants',updates:'Updates',newUpdate:'Add update',publishUpdate:'Post update',back:'All',progress:'Progress',commitment:'My quantity',commitNote:'Note',saveCommit:'Save quantity',removeCommit:'Remove quantity',tasks:'Tasks',newTask:'Add task',taskTitle:'Task',taskDetails:'Details',assignee:'Assignee',unassigned:'Unassigned',todo:'To do',doing:'Doing',done:'Done',saveTask:'Save task',assign:'Assign',remove:'Remove',owner:'Owner',member:'Member',empty:'Nothing here yet.',created:'Created',localBelow:'Private local drafts remain below.',quantityNeeded:'Joint purchases require a positive target and unit.',memberOnly:'Join to see participants, updates and project work.',deleteUpdate:'Delete update',deleteTask:'Delete task',editSaved:'Updated.',purchaseHelp:'Quantity is a physical amount, not a payment. No checkout or money transfer is performed.',noProfile:'Participant',open:'Open'},
 ru:{togetherTitle:'Кооперация',projectsTitle:'Проекты',networkDesc:'Сетевые объекты видят участники пилота. После вступления открывается рабочая область участников. Локальные черновики ниже остаются приватными.',projectDesc:'У проектов есть участники, обновления и задачи. Локальные черновики проектов ниже остаются приватными, пока ты сам не создашь сетевой проект.',newCoop:'Создать',kind:'Тип',need:'Мне нужно',offer:'Я предлагаю',purchase:'Совместная покупка',resource:'Общий ресурс',project:'Проект',title:'Название',description:'Описание',location:'Район / место',target:'Целевое количество',unit:'Единица',status:'Статус',openStatus:'Открыто',activeStatus:'В работе',doneStatus:'Завершено',cancelledStatus:'Отменено',join:'Присоединиться',leave:'Выйти',delete:'Удалить',edit:'Редактировать',members:'Участники',updates:'Обновления',newUpdate:'Добавить обновление',publishUpdate:'Опубликовать обновление',back:'Все',progress:'Прогресс',commitment:'Моё количество',commitNote:'Комментарий',saveCommit:'Сохранить количество',removeCommit:'Убрать количество',tasks:'Задачи',newTask:'Добавить задачу',taskTitle:'Задача',taskDetails:'Подробности',assignee:'Исполнитель',unassigned:'Не назначен',todo:'Нужно сделать',doing:'В работе',done:'Готово',saveTask:'Сохранить задачу',assign:'Назначить',remove:'Удалить',owner:'Владелец',member:'Участник',empty:'Здесь пока пусто.',created:'Создано',localBelow:'Ниже остаются приватные локальные черновики.',quantityNeeded:'Для совместной покупки нужны положительное целевое количество и единица измерения.',memberOnly:'Вступи, чтобы видеть участников, обновления и рабочие данные.',deleteUpdate:'Удалить обновление',deleteTask:'Удалить задачу',editSaved:'Обновлено.',purchaseHelp:'Количество — это физический объём, не платёж. Оплата и перевод денег здесь не выполняются.',noProfile:'Участник',open:'Открыть'},
 sv:{togetherTitle:'Samarbeta',projectsTitle:'Projekt',networkDesc:'Gemensamma samarbetsobjekt visas för pilotdeltagare. Efter anslutning öppnas deltagarnas arbetsyta. Lokala utkast nedan förblir privata.',projectDesc:'Projekt har deltagare, uppdateringar och uppgifter. Lokala projektutkast nedan är privata tills du själv skapar ett nätverksprojekt.',newCoop:'Skapa',kind:'Typ',need:'Jag behöver',offer:'Jag erbjuder',purchase:'Gemensamt köp',resource:'Delad resurs',project:'Projekt',title:'Rubrik',description:'Beskrivning',location:'Område / plats',target:'Målkvantitet',unit:'Enhet',status:'Status',openStatus:'Öppet',activeStatus:'Pågår',doneStatus:'Klart',cancelledStatus:'Avbrutet',join:'Gå med',leave:'Lämna',delete:'Radera',edit:'Redigera',members:'Deltagare',updates:'Uppdateringar',newUpdate:'Lägg till uppdatering',publishUpdate:'Publicera uppdatering',back:'Alla',progress:'Framsteg',commitment:'Min kvantitet',commitNote:'Kommentar',saveCommit:'Spara kvantitet',removeCommit:'Ta bort kvantitet',tasks:'Uppgifter',newTask:'Lägg till uppgift',taskTitle:'Uppgift',taskDetails:'Detaljer',assignee:'Ansvarig',unassigned:'Ej tilldelad',todo:'Att göra',doing:'Pågår',done:'Klar',saveTask:'Spara uppgift',assign:'Tilldela',remove:'Ta bort',owner:'Ägare',member:'Deltagare',empty:'Här är det tomt ännu.',created:'Skapad',localBelow:'Privata lokala utkast finns kvar nedan.',quantityNeeded:'Gemensamma köp kräver en positiv målkvantitet och enhet.',memberOnly:'Gå med för att se deltagare, uppdateringar och arbetsdata.',deleteUpdate:'Radera uppdatering',deleteTask:'Radera uppgift',editSaved:'Uppdaterat.',purchaseHelp:'Kvantiteten är en fysisk mängd, inte en betalning. Ingen checkout eller penningöverföring görs här.',noProfile:'Deltagare',open:'Öppna'}
};
const offerCopy={
 en:{offers:'Supplier offers',offerHelp:'Pilot participants with a discoverable profile can propose terms for this joint purchase. These are coordination offers, not checkout or binding orders.',makeOffer:'Make or update offer',unitPrice:'Unit price',currency:'Currency',minQuantity:'Minimum quantity',availableQuantity:'Available quantity',delivery:'Delivery',pickup:'Pickup',deliveryOnly:'Delivery',both:'Pickup or delivery',deliveryFee:'Delivery fee',leadTime:'Lead time, days',validUntil:'Valid until',offerNote:'Terms / note',saveOffer:'Save offer',withdrawOffer:'Withdraw my offer',selected:'Selected',selectOffer:'Select offer',clearSelection:'Clear selection',provider:'Provider',messageProvider:'Message provider',reportOffer:'Report offer',profileRequired:'Enable your profile in the pilot directory on My page before making a supplier offer.',noOffers:'No active supplier offers yet.',notOrder:'Selecting an offer only marks a preferred option for this pilot. No payment, order submission or contract is created.',availability:'Available',minimum:'Minimum',days:'days'},
 ru:{offers:'Предложения поставщиков',offerHelp:'Участник пилота с видимым профилем может предложить условия для этой совместной закупки. Это координация, а не оплата и не юридически подтверждённый заказ.',makeOffer:'Предложить или изменить условия',unitPrice:'Цена за единицу',currency:'Валюта',minQuantity:'Минимальное количество',availableQuantity:'Доступное количество',delivery:'Получение',pickup:'Самовывоз',deliveryOnly:'Доставка',both:'Самовывоз или доставка',deliveryFee:'Стоимость доставки',leadTime:'Срок, дней',validUntil:'Действует до',offerNote:'Условия / комментарий',saveOffer:'Сохранить предложение',withdrawOffer:'Отозвать моё предложение',selected:'Выбрано',selectOffer:'Выбрать предложение',clearSelection:'Снять выбор',provider:'Поставщик',messageProvider:'Написать поставщику',reportOffer:'Пожаловаться на предложение',profileRequired:'Чтобы предложить условия, включи видимость сетевого профиля в «Моей странице».',noOffers:'Активных предложений поставщиков пока нет.',notOrder:'Выбор предложения только отмечает предпочтительный вариант в пилоте. Платёж, отправка заказа и договор автоматически не создаются.',availability:'Доступно',minimum:'Минимум',days:'дн.'},
 sv:{offers:'Leverantörserbjudanden',offerHelp:'Pilotdeltagare med synlig profil kan föreslå villkor för det gemensamma köpet. Detta är samordning, inte checkout eller bindande beställning.',makeOffer:'Skapa eller uppdatera erbjudande',unitPrice:'Pris per enhet',currency:'Valuta',minQuantity:'Minsta kvantitet',availableQuantity:'Tillgänglig kvantitet',delivery:'Leveranssätt',pickup:'Hämtning',deliveryOnly:'Leverans',both:'Hämtning eller leverans',deliveryFee:'Leveransavgift',leadTime:'Ledtid, dagar',validUntil:'Giltigt till',offerNote:'Villkor / kommentar',saveOffer:'Spara erbjudande',withdrawOffer:'Dra tillbaka mitt erbjudande',selected:'Valt',selectOffer:'Välj erbjudande',clearSelection:'Ta bort val',provider:'Leverantör',messageProvider:'Skriv till leverantör',reportOffer:'Rapportera erbjudande',profileRequired:'Aktivera synlighet för nätverksprofilen på Min sida innan du lämnar ett leverantörserbjudande.',noOffers:'Inga aktiva leverantörserbjudanden ännu.',notOrder:'Ett valt erbjudande markerar bara ett föredraget alternativ i piloten. Ingen betalning, beställning eller avtal skapas automatiskt.',availability:'Tillgängligt',minimum:'Minimum',days:'dagar'}
};
const lifecycleCopy={
 en:{lifecycle:'Purchase lifecycle',collecting:'Collecting quantities',offer_selected:'Offer selected',confirming:'Final confirmation',ordered:'Marked ordered externally',delivered:'Marked delivered',distributing:'Distribution / pickup',done:'Completed',cancelled:'Cancelled',confirmationDeadline:'Confirmation deadline',startConfirmation:'Start final confirmation',confirmations:'Participant confirmations',pending:'Pending',confirmed:'Confirmed',declined:'Declined',confirmYes:'Confirm my quantity',confirmNo:'Decline participation',responseNote:'Confirmation note',resetConfirmation:'Reset confirmation',markOrdered:'Mark external order as placed',externalReference:'External order reference',externalOrderNotice:'This is your own record that an order was placed outside FOLKOOP. FOLKOOP does not send the order or verify it.',expectedDelivery:'Expected delivery',pickupPlace:'Pickup place',pickupStart:'Pickup starts',pickupEnd:'Pickup ends',deliveryNote:'Delivery / organizer note',saveDeliveryPlan:'Save delivery plan',markDelivered:'Mark delivered',deliverySelfReport:'This delivery status is reported by the organizer and is not independently verified.',collectionNote:'Pickup note',markCollected:'Mark my share collected',undoCollected:'Undo collected mark',finishPurchase:'Finish purchase',resultNote:'Result note',cancelPurchase:'Cancel purchase process',cancelReason:'Cancellation reason',allResponsesNeeded:'All snapshotted participants must answer before the organizer can mark an external order.',confirmedTotal:'Confirmed total',collected:'Collected',notCollected:'Not collected',noSnapshot:'You do not have a snapshotted quantity in this confirmation round.',frozen:'Quantities, membership and supplier terms are frozen after confirmation starts.',selfReported:'Self-reported status',resultSelfReport:'Completion is an organizer record, not independent verification.'},
 ru:{lifecycle:'Этапы закупки',collecting:'Сбор количества',offer_selected:'Предложение выбрано',confirming:'Финальное подтверждение',ordered:'Отмечено: заказ оформлен вне FOLKOOP',delivered:'Отмечено: доставлено',distributing:'Выдача участникам',done:'Завершено',cancelled:'Отменено',confirmationDeadline:'Срок подтверждения',startConfirmation:'Начать финальное подтверждение',confirmations:'Подтверждения участников',pending:'Ожидается',confirmed:'Подтверждено',declined:'Отказ',confirmYes:'Подтверждаю своё количество',confirmNo:'Отказываюсь от участия',responseNote:'Комментарий к подтверждению',resetConfirmation:'Сбросить подтверждение',markOrdered:'Отметить, что внешний заказ оформлен',externalReference:'Номер / ссылка внешнего заказа',externalOrderNotice:'Это твоя собственная отметка, что заказ оформлен вне FOLKOOP. FOLKOOP не отправляет заказ поставщику и не проверяет факт заказа.',expectedDelivery:'Ожидаемая доставка',pickupPlace:'Место выдачи',pickupStart:'Начало выдачи',pickupEnd:'Конец выдачи',deliveryNote:'Комментарий по доставке / организатора',saveDeliveryPlan:'Сохранить план доставки',markDelivered:'Отметить как доставленное',deliverySelfReport:'Статус доставки указывает организатор; FOLKOOP его независимо не проверяет.',collectionNote:'Комментарий к получению',markCollected:'Я получил свою долю',undoCollected:'Снять отметку о получении',finishPurchase:'Завершить закупку',resultNote:'Итоговый комментарий',cancelPurchase:'Отменить закупку',cancelReason:'Причина отмены',allResponsesNeeded:'Перед отметкой внешнего заказа должны ответить все участники, попавшие в снимок количества.',confirmedTotal:'Подтверждённый объём',collected:'Получено',notCollected:'Не получено',noSnapshot:'В этом раунде подтверждения для тебя нет зафиксированного количества.',frozen:'После начала подтверждения количество, состав участников и условия поставщика замораживаются.',selfReported:'Статус со слов пользователя',resultSelfReport:'Завершение — отметка организатора, а не независимая проверка.'},
 sv:{lifecycle:'Köpets steg',collecting:'Samlar kvantiteter',offer_selected:'Erbjudande valt',confirming:'Slutlig bekräftelse',ordered:'Markerat beställt externt',delivered:'Markerat levererat',distributing:'Utdelning / hämtning',done:'Slutfört',cancelled:'Avbrutet',confirmationDeadline:'Sista bekräftelsetid',startConfirmation:'Starta slutlig bekräftelse',confirmations:'Deltagarnas bekräftelser',pending:'Väntar',confirmed:'Bekräftat',declined:'Avböjt',confirmYes:'Bekräfta min kvantitet',confirmNo:'Avstå deltagande',responseNote:'Kommentar till bekräftelsen',resetConfirmation:'Återställ bekräftelsen',markOrdered:'Markera extern beställning som lagd',externalReference:'Extern orderreferens',externalOrderNotice:'Detta är din egen notering om att en beställning gjorts utanför FOLKOOP. FOLKOOP skickar eller verifierar inte beställningen.',expectedDelivery:'Förväntad leverans',pickupPlace:'Utlämningsplats',pickupStart:'Utlämning börjar',pickupEnd:'Utlämning slutar',deliveryNote:'Leverans-/organisatörsnotering',saveDeliveryPlan:'Spara leveransplan',markDelivered:'Markera levererat',deliverySelfReport:'Leveransstatus rapporteras av organisatören och verifieras inte oberoende.',collectionNote:'Kommentar till hämtning',markCollected:'Markera min andel hämtad',undoCollected:'Ångra hämtmarkering',finishPurchase:'Slutför köpet',resultNote:'Resultatnotering',cancelPurchase:'Avbryt köpprocessen',cancelReason:'Orsak till avbrott',allResponsesNeeded:'Alla deltagare i kvantitetssnapshoten måste svara innan extern beställning kan markeras.',confirmedTotal:'Bekräftad mängd',collected:'Hämtat',notCollected:'Inte hämtat',noSnapshot:'Du har ingen låst kvantitet i denna bekräftelserunda.',frozen:'Efter bekräftelsestart fryses kvantiteter, medlemskap och leverantörsvillkor.',selfReported:'Självrapporterad status',resultSelfReport:'Slutförandet är organisatörens notering, inte en oberoende verifiering.'}
};
const activityCopy={
 en:{activity:'Activity',notifications:'Activity notifications',workChat:'Work chat',linkedChat:'Linked to this cooperation',managedChat:'Membership is managed by the cooperation.',unread:'unread',noActivity:'No activity yet.',recentActivity:'Recent activity',created:'created the cooperation',member_joined:'joined',member_left:'left',cooperation_status:'changed status',update_posted:'posted an update',task_created:'created a task',task_updated:'updated a task',task_deleted:'deleted a task',purchase_stage:'changed purchase stage',offer_changed:'changed a supplier offer',confirmation_changed:'updated purchase confirmation',collection_changed:'updated pickup status',openActivity:'Open',messagesUnread:'Unread messages'},
 ru:{activity:'Активность',notifications:'Уведомления об активности',workChat:'Рабочий чат',linkedChat:'Связан с этой кооперацией',managedChat:'Состав чата управляется участниками кооперации.',unread:'непрочитано',noActivity:'Активности пока нет.',recentActivity:'Последняя активность',created:'создал кооперацию',member_joined:'присоединился',member_left:'вышел',cooperation_status:'изменил статус',update_posted:'добавил обновление',task_created:'создал задачу',task_updated:'изменил задачу',task_deleted:'удалил задачу',purchase_stage:'изменил этап закупки',offer_changed:'изменил предложение поставщика',confirmation_changed:'изменил подтверждение закупки',collection_changed:'изменил статус получения',openActivity:'Открыть',messagesUnread:'Непрочитанные сообщения'},
 sv:{activity:'Aktivitet',notifications:'Aktivitetsnotiser',workChat:'Arbetschatt',linkedChat:'Kopplad till detta samarbete',managedChat:'Chattmedlemskapet styrs av samarbetets deltagare.',unread:'oläst',noActivity:'Ingen aktivitet ännu.',recentActivity:'Senaste aktivitet',created:'skapade samarbetet',member_joined:'gick med',member_left:'lämnade',cooperation_status:'ändrade status',update_posted:'lade till en uppdatering',task_created:'skapade en uppgift',task_updated:'ändrade en uppgift',task_deleted:'raderade en uppgift',purchase_stage:'ändrade köpsteget',offer_changed:'ändrade ett leverantörserbjudande',confirmation_changed:'ändrade köpbekräftelsen',collection_changed:'ändrade hämtningsstatus',openActivity:'Öppna',messagesUnread:'Olästa meddelanden'}
};
const lang=()=>['sv','en','ru'].includes(document.documentElement.lang)?document.documentElement.lang:'en';
const t=k=>({sv,en,ru}[lang()][k]||en[k]);
let selected=null,selectedChat=null,selectedCoop=null,data={profile:{},groups:[],memberships:[],posts:[],directory:[],blocks:[],chats:[],chatMembers:[],chatInvites:[],chatProfiles:[],chatMessages:[],chatInbox:[],cooperations:[],coopMembers:[],coopChats:[],coopActivity:[],activityInbox:[],coopUpdates:[],projectTasks:[],commitments:[],purchaseOffers:[],purchaseChoice:[],purchaseProcess:[],purchaseConfirmations:[]},notice='',busy=false,version=0,email='',profileDraft=null,groupDraft={},postDrafts={},chatDraft={title:'',members:[]},directTarget='',inviteTarget='',messageDrafts={},coopDraft={kind:'need',title:'',description:'',location:'',targetQuantity:'',unit:''},coopEditDraft=null,coopUpdateDraft='',taskDraft={title:'',details:'',assignee:''},commitDraft={quantity:'',note:''},offerDraft=null,lifecycleDrafts={};
let internalHash='';
const route=()=>FolkoopCore.route(location.hash);
function navigateNetwork(hash){internalHash=hash;location.hash=hash;}
const btn=(action,label,id='')=>`<button class="button secondary" type="button" data-net="${action}" data-id="${esc(id)}">${esc(t(label))}</button>`;
const field=(name,label,value='',max=100,area=false)=>`<label>${esc(t(label))}${area?`<textarea name="${name}" maxlength="${max}" rows="3">${esc(value)}</textarea>`:`<input name="${name}" maxlength="${max}" value="${esc(value)}"${name==='name'?' required':''}>`}</label>`;
const mt=k=>chatCopy[lang()][k]||chatCopy.en[k]||k;
const ct=k=>coopCopy[lang()][k]||coopCopy.en[k]||k;
const ot=k=>offerCopy[lang()][k]||offerCopy.en[k]||k;
const lt=k=>lifecycleCopy[lang()][k]||lifecycleCopy.en[k]||k;
const at=k=>activityCopy[lang()][k]||activityCopy.en[k]||k;
const abtn=(action,key,id='')=>`<button class="button secondary" type="button" data-coop="${action}" data-id="${esc(id)}">${esc(at(key))}</button>`;

function localDateTime(value){
 if(!value)return '';
 const d=new Date(value);if(!Number.isFinite(d.getTime()))return '';
 const pad=n=>String(n).padStart(2,'0');
 return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'T'+pad(d.getHours())+':'+pad(d.getMinutes());
}

const cbtn=(action,key,id='')=>`<button class="button secondary" type="button" data-coop="${action}" data-id="${esc(id)}">${esc(ct(key))}</button>`;
const obtn=(action,key,id='')=>`<button class="button secondary" type="button" data-coop="${action}" data-id="${esc(id)}">${esc(ot(key))}</button>`;
const coopProfile=id=>data.chatProfiles.find(p=>p.id===id)||data.directory.find(p=>p.id===id);
const kindLabel=k=>ct(k);
const statusLabel=s=>ct(({open:'openStatus',active:'activeStatus',done:'doneStatus',cancelled:'cancelledStatus'})[s]||s);
function activityLabel(e,u){
 const actor=e?.actor_id===u?.id?mt('you'):(coopProfile(e?.actor_id)?.name||ct('noProfile'));
 let label=e?.label||'';
 if(e?.event_type==='purchase_stage')label=lt(label);
 if(e?.event_type==='confirmation_changed')label=lt(label);
 if(e?.event_type==='collection_changed')label=label==='collected'?lt('collected'):lt('notCollected');
 return actor+' '+at(e?.event_type||'activity')+(label?' · '+label:'');
}
function setCountBadge(el,count){
 if(!el)return;
 el.querySelectorAll(':scope > .net-count').forEach(x=>x.remove());
 const n=Number(count||0);
 if(n>0){const b=document.createElement('span');b.className='net-count';b.textContent=n>99?'99+':String(n);b.setAttribute('aria-label',n+' '+at('unread'));el.append(b);}
}
function syncBadges(){
 const u=api?.user?.();
 const messageCount=data.chatInbox.reduce((a,x)=>a+Number(x.unread_count||0),0)+data.chatInvites.filter(x=>x.user_id===u?.id).length;
 const togetherCount=data.activityInbox.filter(x=>x.cooperation_kind!=='project').reduce((a,x)=>a+Number(x.unread_count||0),0);
 const projectCount=data.activityInbox.filter(x=>x.cooperation_kind==='project').reduce((a,x)=>a+Number(x.unread_count||0),0);
 setCountBadge(document.getElementById('messageLink'),messageCount);
 setCountBadge(document.querySelector('#nav a[href="#/together"]'),togetherCount);
 setCountBadge(document.querySelector('#nav a[href="#/projects"]'),projectCount);
}
function renderActivityNotifications(u){
 const rows=data.activityInbox.filter(x=>x.last_activity_at).slice(0,12);
 return `<section class="network-activity"><div class="row"><h3>${esc(at('notifications'))}</h3><span class="meta">${esc(at('recentActivity'))}</span></div><div class="draft-grid">${rows.map(x=>{const n=Number(x.unread_count||0),actor=x.last_actor_id===u.id?mt('you'):(coopProfile(x.last_actor_id)?.name||ct('noProfile'));let label=x.last_label||'';if(x.last_event_type==='purchase_stage')label=lt(label);return `<article class="card"><div class="row"><span class="badge">${esc(kindLabel(x.cooperation_kind))}</span>${n?`<span class="net-count">${esc(String(n))}</span>`:''}</div><h3>${esc(x.cooperation_title)}</h3><p class="meta">${esc(actor+' '+at(x.last_event_type||'activity')+(label?' · '+label:''))}</p>${abtn('openNotify','openActivity',x.cooperation_id)}</article>`;}).join('')||`<div class="empty"><p>${esc(at('noActivity'))}</p></div>`}</div></section>`;
}

const profileFor=id=>data.chatProfiles.find(p=>p.id===id)||data.directory.find(p=>p.id===id);
function chatLabel(chat,u){
 if(!chat)return mt('conversation');
 if(chat.kind==='group')return chat.title;
 const other=data.chatMembers.find(m=>m.conversation_id===chat.id&&m.user_id!==u.id);
 return profileFor(other?.user_id)?.name||mt('direct');
}
function renderMessages(u){
 const chat=data.chats.find(x=>x.id===selectedChat);
 const ownMember=chat&&data.chatMembers.find(m=>m.conversation_id===chat.id&&m.user_id===u.id);
 const ownInvite=chat&&data.chatInvites.find(i=>i.conversation_id===chat.id&&i.user_id===u.id);
 const linked=chat&&data.coopChats.find(x=>x.conversation_id===chat.id);
 const discoverable=data.directory.filter(p=>p.id!==u.id);
 let html=`<div class="row"><div><h2>${esc(mt('messagesTitle'))}</h2><p class="meta">${esc(mt('messagesDesc'))}</p></div><div>${btn('refresh','refresh')}${btn('logout','out')}</div></div>`;
 if(chat){
  html+=`${btn('backChats','back','')}<article class="card"><div class="row"><h2>${esc(chatLabel(chat,u))}</h2>${linked?`<span class="badge">${esc(at('workChat'))}</span>`:''}</div><p class="meta">${esc(mt('notEncrypted'))}</p>`;
  if(linked)html+=`<p class="meta">${esc(at('managedChat'))}</p><div class="actions">${abtn('openNotify','openActivity',linked.cooperation_id)}</div>`;
  if(ownInvite&&!ownMember){
   html+=`<div class="actions">${btn('acceptChat','accept',chat.id)}${btn('declineChat','decline',chat.id)}</div></article>`;
   return html;
  }
  if(!ownMember){html+=`<p>${esc(t('denied'))}</p></article>`;return html;}
  const members=data.chatMembers.filter(m=>m.conversation_id===chat.id);
  html+=`<h3>${esc(mt('membersList'))}</h3><div class="stack">${members.map(m=>{const p=profileFor(m.user_id);const name=m.user_id===u.id?mt('you'):(p?.name||m.user_id.slice(0,8));const remove=!linked&&chat.kind==='group'&&chat.owner_id===u.id&&m.user_id!==u.id?btn('removeChatMember','removeMember',m.user_id):'';return `<div class="row"><span>${esc(name)}</span>${remove}</div>`;}).join('')}</div></article>`;
  if(!linked&&chat.kind==='group'&&chat.owner_id===u.id){
   const existing=new Set(members.map(m=>m.user_id).concat(data.chatInvites.filter(i=>i.conversation_id===chat.id).map(i=>i.user_id)));
   const candidates=discoverable.filter(p=>!existing.has(p.id));
   html+=`<form id="netChatInvite" class="editor card"><label>${esc(mt('choosePerson'))}<select name="user" required><option value="">—</option>${candidates.map(p=>`<option value="${esc(p.id)}"${p.id===inviteTarget?' selected':''}>${esc(p.name)}</option>`).join('')}</select></label><button class="button">${esc(mt('invite'))}</button></form>`;
  }
  html+=`<section class="chat-messages">${data.chatMessages.map(m=>{const p=profileFor(m.author_id);const mine=m.author_id===u.id;const canDelete=mine||(chat.kind==='group'&&chat.owner_id===u.id);return `<article class="card"><small>${esc(mine?mt('you'):(p?.name||m.author_id.slice(0,8)))}</small><p style="white-space:pre-wrap">${esc(m.body)}</p><p class="meta">${esc(m.created_at||'')}</p><div class="actions">${canDelete?btn('deleteMessage','delete',m.id):''}${!mine?btn('reportMessage','report',m.id)+btn('block','block',m.author_id):''}</div></article>`;}).join('')||`<div class="empty"><p>${esc(t('empty'))}</p></div>`}</section>`;
  html+=`<form id="netMessage" class="editor card"><label>${esc(mt('message'))}<textarea name="body" maxlength="4000" rows="3" required>${esc(messageDrafts[chat.id]||'')}</textarea></label><button class="button">${esc(mt('sendMessage'))}</button></form>`;
  if(!linked&&chat.kind==='group')html+=`<div class="actions">${chat.owner_id===u.id?btn('deleteChat','deleteChat',chat.id):btn('leaveChat','leaveChat',chat.id)}</div>`;
  return html;
 }
 const invitations=data.chatInvites.filter(i=>i.user_id===u.id).map(i=>data.chats.find(c=>c.id===i.conversation_id)).filter(Boolean);
 html+=`<div class="profile-grid"><form id="netDirect" class="editor card"><h3>${esc(mt('direct'))}</h3><label>${esc(mt('choosePerson'))}<select name="other" required><option value="">—</option>${discoverable.map(p=>`<option value="${esc(p.id)}"${p.id===directTarget?' selected':''}>${esc(p.name)}</option>`).join('')}</select></label><button class="button">${esc(mt('startDirect'))}</button><p class="meta">${discoverable.length?'':esc(mt('noPeople'))}</p></form><form id="netNewChat" class="editor card"><h3>${esc(mt('newGroupChat'))}</h3><label>${esc(mt('groupTitle'))}<input name="title" maxlength="80" required value="${esc(chatDraft.title||'')}"></label><fieldset><legend>${esc(mt('chooseMembers'))}</legend>${discoverable.map(p=>`<label class="checkbox"><input type="checkbox" name="members" value="${esc(p.id)}"${chatDraft.members.includes(p.id)?' checked':''}> <span>${esc(p.name)}</span></label>`).join('')||`<p class="meta">${esc(mt('noPeople'))}</p>`}</fieldset><button class="button" ${discoverable.length?'':'disabled'}>${esc(t('create'))}</button></form></div>`;
 if(invitations.length)html+=`<h3>${esc(mt('invitations'))}</h3><div class="draft-grid">${invitations.map(ch=>`<article class="card"><h3>${esc(chatLabel(ch,u))}</h3><span class="badge">${esc(mt('invitePending'))}</span><div class="actions">${btn('openChat','open',ch.id)}${btn('acceptChat','accept',ch.id)}${btn('declineChat','decline',ch.id)}</div></article>`).join('')}</div>`;
 const joined=data.chats.filter(ch=>data.chatMembers.some(m=>m.conversation_id===ch.id&&m.user_id===u.id));
 html+=`<h3>${esc(mt('conversation'))}</h3><div class="draft-grid">${joined.map(ch=>{const unread=Number(data.chatInbox.find(x=>x.conversation_id===ch.id)?.unread_count||0),link=data.coopChats.find(x=>x.conversation_id===ch.id);return `<article class="card"><div class="row"><h3>${esc(chatLabel(ch,u))}</h3>${unread?`<span class="net-count">${esc(String(unread))}</span>`:''}</div><p class="meta">${esc(link?at('linkedChat'):(ch.kind==='group'?mt('groupChat'):mt('direct')))}</p>${btn('openChat','open',ch.id)}</article>`;}).join('')||`<div class="empty"><p>${esc(mt('noChats'))}</p></div>`}</div>`;
 return html;
}

function renderPurchaseLifecycle(u,coop,owner){
 const process=data.purchaseProcess[0]||{stage:data.purchaseChoice.length?'offer_selected':'collecting'};
 const stage=process.stage||'collecting';
 const confirmations=data.purchaseConfirmations||[];
 const mine=confirmations.find(x=>x.user_id===u.id);
 const pending=confirmations.filter(x=>x.decision==='pending').length;
 const confirmed=confirmations.filter(x=>x.decision==='confirmed');
 const declined=confirmations.filter(x=>x.decision==='declined').length;
 const confirmedTotal=confirmed.reduce((a,x)=>a+Number(x.quantity||0),0);
 const profileName=id=>id===u.id?mt('you'):(coopProfile(id)?.name||ct('noProfile'));
 let html=`<section class="card"><div class="row"><h3>${esc(lt('lifecycle'))}</h3><span class="badge">${esc(lt(stage))}</span></div><p class="meta">${esc(lt('selfReported'))}</p>`;
 if(process.confirmation_deadline)html+=`<p><strong>${esc(lt('confirmationDeadline'))}:</strong> ${esc(new Date(process.confirmation_deadline).toLocaleString())}</p>`;
 if(process.external_order_reference)html+=`<p><strong>${esc(lt('externalReference'))}:</strong> ${esc(process.external_order_reference)}</p>`;
 if(process.expected_delivery_at)html+=`<p><strong>${esc(lt('expectedDelivery'))}:</strong> ${esc(new Date(process.expected_delivery_at).toLocaleString())}</p>`;
 if(process.pickup_place)html+=`<p><strong>${esc(lt('pickupPlace'))}:</strong> ${esc(process.pickup_place)}</p>`;
 if(process.pickup_start)html+=`<p><strong>${esc(lt('pickupStart'))}:</strong> ${esc(new Date(process.pickup_start).toLocaleString())}${process.pickup_end?' – '+esc(new Date(process.pickup_end).toLocaleString()):''}</p>`;
 if(process.delivery_note)html+=`<p style="white-space:pre-wrap">${esc(process.delivery_note)}</p>`;
 if(process.result_note)html+=`<p style="white-space:pre-wrap"><strong>${esc(lt('resultNote'))}:</strong> ${esc(process.result_note)}</p>`;
 html+='</section>';

 if(stage==='offer_selected'&&owner){
  const d=lifecycleDrafts.netPurchaseStart||{};
  html+=`<form id="netPurchaseStart" class="editor card"><h3>${esc(lt('startConfirmation'))}</h3><p class="meta">${esc(lt('frozen'))}</p><label>${esc(lt('confirmationDeadline'))}<input name="deadline" type="datetime-local" required value="${esc(d.deadline||'')}"></label><button class="button">${esc(lt('startConfirmation'))}</button></form>`;
 }

 if(stage==='confirming'){
  html+=`<h3>${esc(lt('confirmations'))}</h3><div class="draft-grid">${confirmations.map(x=>`<article class="card"><strong>${esc(profileName(x.user_id))}</strong><p>${esc(String(x.quantity))} ${esc(coop.unit)}</p><span class="badge">${esc(lt(x.decision))}</span>${x.note?`<p class="meta">${esc(x.note)}</p>`:''}</article>`).join('')||`<div class="empty"><p>${esc(lt('noSnapshot'))}</p></div>`}</div><p><strong>${esc(lt('confirmedTotal'))}: ${esc(String(confirmedTotal))} ${esc(coop.unit)}</strong> · ${esc(lt('pending'))}: ${pending} · ${esc(lt('declined'))}: ${declined}</p>`;
  if(mine){
   const d=lifecycleDrafts.netPurchaseConfirm||{};
   html+=`<form id="netPurchaseConfirm" class="editor card"><label>${esc(lt('responseNote'))}<input name="note" maxlength="500" value="${esc(d.note||mine.note||'')}"></label><div class="actions"><button name="operation" value="yes" class="button">${esc(lt('confirmYes'))}</button><button name="operation" value="no" class="button secondary">${esc(lt('confirmNo'))}</button></div></form>`;
  }else{
   html+=`<aside class="notice"><p>${esc(lt('noSnapshot'))}</p></aside>`;
  }
  if(owner){
   html+=`<div class="actions">${cbtn('resetConfirmation','resetConfirmation',coop.id)}</div>`;
   if(pending===0&&confirmed.length>0){
    const d=lifecycleDrafts.netPurchaseOrdered||{};
    html+=`<form id="netPurchaseOrdered" class="editor card"><h3>${esc(lt('markOrdered'))}</h3><p class="meta">${esc(lt('externalOrderNotice'))}</p><label>${esc(lt('externalReference'))}<input name="reference" maxlength="120" value="${esc(d.reference||'')}"></label><label>${esc(lt('expectedDelivery'))}<input name="expectedDelivery" type="datetime-local" value="${esc(d.expectedDelivery||'')}"></label><label>${esc(lt('pickupPlace'))}<input name="pickupPlace" maxlength="200" value="${esc(d.pickupPlace||'')}"></label><label>${esc(lt('pickupStart'))}<input name="pickupStart" type="datetime-local" value="${esc(d.pickupStart||'')}"></label><label>${esc(lt('pickupEnd'))}<input name="pickupEnd" type="datetime-local" value="${esc(d.pickupEnd||'')}"></label><label>${esc(lt('deliveryNote'))}<textarea name="note" maxlength="1000" rows="3">${esc(d.note||'')}</textarea></label><button class="button">${esc(lt('markOrdered'))}</button></form>`;
   }else{
    html+=`<p class="meta">${esc(lt('allResponsesNeeded'))}</p>`;
   }
  }
 }

 if(['ordered','delivered','distributing'].includes(stage)){
  if(owner){
   const d=lifecycleDrafts.netPurchaseDeliveryPlan||{
    expectedDelivery:localDateTime(process.expected_delivery_at),
    pickupPlace:process.pickup_place||'',
    pickupStart:localDateTime(process.pickup_start),
    pickupEnd:localDateTime(process.pickup_end),
    note:process.delivery_note||''
   };
   html+=`<form id="netPurchaseDeliveryPlan" class="editor card"><h3>${esc(lt('saveDeliveryPlan'))}</h3><label>${esc(lt('expectedDelivery'))}<input name="expectedDelivery" type="datetime-local" value="${esc(d.expectedDelivery||'')}"></label><label>${esc(lt('pickupPlace'))}<input name="pickupPlace" maxlength="200" value="${esc(d.pickupPlace||'')}"></label><label>${esc(lt('pickupStart'))}<input name="pickupStart" type="datetime-local" value="${esc(d.pickupStart||'')}"></label><label>${esc(lt('pickupEnd'))}<input name="pickupEnd" type="datetime-local" value="${esc(d.pickupEnd||'')}"></label><label>${esc(lt('deliveryNote'))}<textarea name="note" maxlength="1000" rows="3">${esc(d.note||'')}</textarea></label><button class="button secondary">${esc(lt('saveDeliveryPlan'))}</button></form>`;
  }
  if(stage==='ordered'&&owner){
   const d=lifecycleDrafts.netPurchaseDelivered||{};
   html+=`<form id="netPurchaseDelivered" class="editor card"><p class="meta">${esc(lt('deliverySelfReport'))}</p><label>${esc(lt('deliveryNote'))}<input name="note" maxlength="1000" value="${esc(d.note||'')}"></label><button class="button">${esc(lt('markDelivered'))}</button></form>`;
  }
 }

 if(['delivered','distributing'].includes(stage)){
  if(mine?.decision==='confirmed'){
   const d=lifecycleDrafts.netPurchaseCollected||{};
   html+=`<form id="netPurchaseCollected" class="editor card"><label>${esc(lt('collectionNote'))}<input name="note" maxlength="500" value="${esc(d.note||mine.collected_note||'')}"></label><div class="actions"><button name="operation" value="yes" class="button">${esc(lt('markCollected'))}</button>${mine.collected_at?`<button name="operation" value="no" class="button secondary">${esc(lt('undoCollected'))}</button>`:''}</div></form>`;
  }
  if(owner){
   const d=lifecycleDrafts.netPurchaseFinish||{};
   html+=`<form id="netPurchaseFinish" class="editor card"><p class="meta">${esc(lt('resultSelfReport'))}</p><label>${esc(lt('resultNote'))}<textarea name="note" maxlength="2000" rows="3">${esc(d.note||'')}</textarea></label><button class="button">${esc(lt('finishPurchase'))}</button></form>`;
  }
 }

 if(owner&&!['done','cancelled'].includes(stage)){
  const d=lifecycleDrafts.netPurchaseCancel||{};
  html+=`<form id="netPurchaseCancel" class="editor card"><label>${esc(lt('cancelReason'))}<input name="reason" maxlength="2000" minlength="3" required value="${esc(d.reason||'')}"></label><button class="button secondary">${esc(lt('cancelPurchase'))}</button></form>`;
 }
 return html;
}

function renderCooperation(u,r){
 const projectMode=r==='projects',allowed=projectMode?['project']:['need','offer','purchase','resource'];
 const list=data.cooperations.filter(x=>allowed.includes(x.kind));
 const coop=list.find(x=>x.id===selectedCoop);
 let html=`<div class="row"><div><h2>${esc(ct(projectMode?'projectsTitle':'togetherTitle'))}</h2><p class="meta">${esc(ct(projectMode?'projectDesc':'networkDesc'))}</p></div><div>${btn('refresh','refresh')}${btn('logout','out')}</div></div>`;
 if(coop){
  const membership=data.coopMembers.find(m=>m.cooperation_id===coop.id&&m.user_id===u.id);
  const member=!!membership,owner=coop.owner_id===u.id;
  const members=data.coopMembers.filter(m=>m.cooperation_id===coop.id);
  const linkedChat=data.coopChats.find(x=>x.cooperation_id===coop.id);
  const sum=data.commitments.reduce((a,x)=>a+Number(x.quantity||0),0);
  html+=cbtn('back','back');
  html+=`<article class="card"><div class="row"><div><span class="badge">${esc(kindLabel(coop.kind))}</span> <span class="badge muted-badge">${esc(statusLabel(coop.status))}</span></div><span class="meta">${esc(coop.location_text||'')}</span></div><h2>${esc(coop.title)}</h2><p style="white-space:pre-wrap">${esc(coop.description)}</p>`;
  if(coop.kind==='purchase')html+=`<p><strong>${esc(ct('progress'))}: ${esc(String(sum))} / ${esc(String(coop.target_quantity))} ${esc(coop.unit)}</strong></p><p class="meta">${esc(ct('purchaseHelp'))}</p>`;
  html+=`<div class="actions">${owner?'':member?cbtn('leave','leave',coop.id):((['open','active'].includes(coop.status))?cbtn('join','join',coop.id):'')}${owner?cbtn('delete','delete',coop.id):''}</div></article>`;
  if(member&&linkedChat)html+=`<div class="actions">${abtn('openLinkedChat','workChat',linkedChat.conversation_id)}<span class="meta">${esc(at('managedChat'))}</span></div>`;
  if(owner){
   const d=coopEditDraft||{title:coop.title,description:coop.description,location:coop.location_text,status:coop.status,targetQuantity:coop.target_quantity??'',unit:coop.unit||''};
   html+=`<form id="netCoopEdit" class="editor card"><h3>${esc(ct('edit'))}</h3><label>${esc(ct('title'))}<input name="title" maxlength="120" required value="${esc(d.title)}"></label><label>${esc(ct('description'))}<textarea name="description" maxlength="3000" rows="3">${esc(d.description)}</textarea></label><label>${esc(ct('location'))}<input name="location" maxlength="120" value="${esc(d.location)}"></label><label>${esc(ct('status'))}<select name="status">${['open','active','done','cancelled'].map(s=>`<option value="${s}"${d.status===s?' selected':''}>${esc(statusLabel(s))}</option>`).join('')}</select></label>${coop.kind==='purchase'?`<label>${esc(ct('target'))}<input name="targetQuantity" type="number" min="0.001" step="0.001" required value="${esc(d.targetQuantity)}"></label><label>${esc(ct('unit'))}<input name="unit" maxlength="30" required value="${esc(d.unit)}"></label>`:''}<button class="button">${esc(t('save'))}</button></form>`;
  }
  if(coop.kind==='purchase'){
   const myOffer=data.purchaseOffers.find(x=>x.provider_id===u.id);
   const chosen=data.purchaseChoice[0];
   const od=offerDraft?.cooperationId===coop.id?offerDraft:(myOffer?{cooperationId:coop.id,unitPrice:myOffer.unit_price,currency:myOffer.currency,minQuantity:myOffer.min_quantity,availableQuantity:myOffer.available_quantity??'',deliveryMode:myOffer.delivery_mode,deliveryFee:myOffer.delivery_fee,leadTimeDays:myOffer.lead_time_days,validUntil:myOffer.valid_until||'',note:myOffer.note||''}:{cooperationId:coop.id,unitPrice:'',currency:'SEK',minQuantity:'',availableQuantity:'',deliveryMode:'pickup',deliveryFee:'0',leadTimeDays:'0',validUntil:'',note:''});
   html+=`<h3>${esc(ot('offers'))}</h3><p class="meta">${esc(ot('offerHelp'))}</p><div class="draft-grid">${data.purchaseOffers.map(o=>{const p=coopProfile(o.provider_id),isChosen=chosen?.offer_id===o.id;return `<article class="card">${isChosen?`<span class="badge">${esc(ot('selected'))}</span>`:''}<h3>${esc(p?.name||ot('provider'))}</h3><p><strong>${esc(String(o.unit_price))} ${esc(o.currency)} / ${esc(coop.unit)}</strong></p><p class="meta">${esc(ot('minimum'))}: ${esc(String(o.min_quantity))} ${esc(coop.unit)}${o.available_quantity!==null?` · ${esc(ot('availability'))}: ${esc(String(o.available_quantity))} ${esc(coop.unit)}`:''}</p><p class="meta">${esc(ot('delivery'))}: ${esc(ot(o.delivery_mode==='delivery'?'deliveryOnly':o.delivery_mode))}${Number(o.delivery_fee)>0?` · ${esc(String(o.delivery_fee))} ${esc(o.currency)}`:''} · ${esc(String(o.lead_time_days))} ${esc(ot('days'))}</p>${o.valid_until?`<p class="meta">${esc(ot('validUntil'))}: ${esc(o.valid_until)}</p>`:''}<p style="white-space:pre-wrap">${esc(o.note||'')}</p><div class="actions">${owner?(isChosen?obtn('clearOffer','clearSelection',o.id):obtn('selectOffer','selectOffer',o.id)):''}${o.provider_id!==u.id?obtn('messageProvider','messageProvider',o.provider_id)+obtn('reportOffer','reportOffer',o.id)+btn('block','block',o.provider_id):''}</div></article>`;}).join('')||`<div class="empty"><p>${esc(ot('noOffers'))}</p></div>`}</div><p class="meta">${esc(ot('notOrder'))}</p>`;
   if(data.profile.listed){
    html+=`<form id="netPurchaseOffer" class="editor card"><h3>${esc(ot('makeOffer'))}</h3><label>${esc(ot('unitPrice'))}<input name="unitPrice" type="number" min="0.01" step="0.01" required value="${esc(od.unitPrice)}"></label><label>${esc(ot('currency'))}<input name="currency" maxlength="3" required value="${esc(od.currency)}"></label><label>${esc(ot('minQuantity'))}<input name="minQuantity" type="number" min="0.001" step="0.001" required value="${esc(od.minQuantity)}"></label><label>${esc(ot('availableQuantity'))}<input name="availableQuantity" type="number" min="0.001" step="0.001" value="${esc(od.availableQuantity)}"></label><label>${esc(ot('delivery'))}<select name="deliveryMode">${['pickup','delivery','both'].map(m=>`<option value="${m}"${od.deliveryMode===m?' selected':''}>${esc(ot(m==='delivery'?'deliveryOnly':m))}</option>`).join('')}</select></label><label>${esc(ot('deliveryFee'))}<input name="deliveryFee" type="number" min="0" step="0.01" value="${esc(od.deliveryFee)}"></label><label>${esc(ot('leadTime'))}<input name="leadTimeDays" type="number" min="0" max="365" step="1" value="${esc(od.leadTimeDays)}"></label><label>${esc(ot('validUntil'))}<input name="validUntil" type="date" value="${esc(od.validUntil)}"></label><label>${esc(ot('offerNote'))}<textarea name="note" maxlength="1000" rows="3">${esc(od.note)}</textarea></label><div class="actions"><button class="button">${esc(ot('saveOffer'))}</button>${myOffer?obtn('withdrawOffer','withdrawOffer',coop.id):''}</div></form>`;
   }else{
    html+=`<aside class="notice"><p>${esc(ot('profileRequired'))} <a class="text-link" href="#/me">${esc(t('profile'))}</a></p></aside>`;
   }
  }
  if(!member){
   html+=`<aside class="notice"><p>${esc(ct('memberOnly'))}</p></aside>`;
   return html;
  }
  html+=`<section class="network-activity"><div class="row"><h3>${esc(at('activity'))}</h3><span class="meta">${esc(at('recentActivity'))}</span></div><div class="activity-list">${data.coopActivity.map(e=>`<article class="activity-item"><span class="activity-dot" aria-hidden="true"></span><div><strong>${esc(activityLabel(e,u))}</strong><p class="meta">${esc(e.created_at||'')}</p></div></article>`).join('')||`<div class="empty"><p>${esc(at('noActivity'))}</p></div>`}</div></section>`;
  html+=`<h3>${esc(ct('members'))}</h3><div class="draft-grid">${members.map(m=>{const p=coopProfile(m.user_id),name=m.user_id===u.id?mt('you'):(p?.name||ct('noProfile'));const remove=owner&&m.user_id!==u.id?cbtn('removeMember','remove',m.user_id):'';return `<article class="card"><div class="row"><strong>${esc(name)}</strong>${remove}</div><span class="meta">${esc(ct(m.role==='owner'?'owner':'member'))}</span></article>`;}).join('')}</div>`;
  if(coop.kind==='purchase'){
   const mine=data.commitments.find(x=>x.user_id===u.id),cd=commitDraft.quantity!==''?commitDraft:{quantity:mine?.quantity??'',note:mine?.note||''};
   html+=`<h3>${esc(ct('progress'))}</h3><div class="draft-grid">${data.commitments.map(x=>{const p=coopProfile(x.user_id);return `<article class="card"><strong>${esc(x.user_id===u.id?mt('you'):(p?.name||ct('noProfile')))}</strong><p>${esc(String(x.quantity))} ${esc(coop.unit)}</p><p class="meta">${esc(x.note||'')}</p></article>`;}).join('')||`<div class="empty"><p>${esc(ct('empty'))}</p></div>`}</div><form id="netCommitment" class="editor card"><label>${esc(ct('commitment'))}<input name="quantity" type="number" min="0" step="0.001" required value="${esc(cd.quantity)}"></label><label>${esc(ct('commitNote'))}<input name="note" maxlength="500" value="${esc(cd.note)}"></label><div class="actions"><button class="button">${esc(ct('saveCommit'))}</button>${mine?cbtn('removeCommit','removeCommit',coop.id):''}</div></form>`;
   html+=renderPurchaseLifecycle(u,coop,owner);
  }
  if(coop.kind==='project'){
   html+=`<h3>${esc(ct('tasks'))}</h3><div class="draft-grid">${data.projectTasks.map(task=>{const p=coopProfile(task.assignee_id);const canManage=owner||task.creator_id===u.id;return `<article class="card"><span class="badge">${esc(ct(task.status))}</span><h3>${esc(task.title)}</h3><p>${esc(task.details)}</p><p class="meta">${esc(ct('assignee'))}: ${esc(task.assignee_id?(task.assignee_id===u.id?mt('you'):(p?.name||ct('noProfile'))):ct('unassigned'))}</p><form class="netTaskStatus"><input type="hidden" name="task" value="${esc(task.id)}"><label>${esc(ct('status'))}<select name="status">${['todo','doing','done'].map(s=>`<option value="${s}"${task.status===s?' selected':''}>${esc(ct(s))}</option>`).join('')}</select></label><button class="button secondary">${esc(t('save'))}</button></form>${canManage?`<form class="netTaskAssign"><input type="hidden" name="task" value="${esc(task.id)}"><label>${esc(ct('assignee'))}<select name="assignee"><option value="">${esc(ct('unassigned'))}</option>${members.map(m=>{const mp=coopProfile(m.user_id);return `<option value="${esc(m.user_id)}"${task.assignee_id===m.user_id?' selected':''}>${esc(m.user_id===u.id?mt('you'):(mp?.name||ct('noProfile')))}</option>`;}).join('')}</select></label><button class="button secondary">${esc(ct('assign'))}</button></form>${cbtn('deleteTask','deleteTask',task.id)}`:''}</article>`;}).join('')||`<div class="empty"><p>${esc(ct('empty'))}</p></div>`}</div><form id="netTaskCreate" class="editor card"><h3>${esc(ct('newTask'))}</h3><label>${esc(ct('taskTitle'))}<input name="title" maxlength="160" required value="${esc(taskDraft.title||'')}"></label><label>${esc(ct('taskDetails'))}<textarea name="details" maxlength="2000" rows="3">${esc(taskDraft.details||'')}</textarea></label><label>${esc(ct('assignee'))}<select name="assignee"><option value="">${esc(ct('unassigned'))}</option>${members.map(m=>{const p=coopProfile(m.user_id);return `<option value="${esc(m.user_id)}"${taskDraft.assignee===m.user_id?' selected':''}>${esc(m.user_id===u.id?mt('you'):(p?.name||ct('noProfile')))}</option>`;}).join('')}</select></label><button class="button">${esc(ct('saveTask'))}</button></form>`;
  }
  html+=`<h3>${esc(ct('updates'))}</h3><div class="draft-grid">${data.coopUpdates.map(x=>{const p=coopProfile(x.author_id),canDelete=owner||x.author_id===u.id;return `<article class="card"><strong>${esc(x.author_id===u.id?mt('you'):(p?.name||ct('noProfile')))}</strong><p style="white-space:pre-wrap">${esc(x.body)}</p><p class="meta">${esc(x.created_at||'')}</p>${canDelete?cbtn('deleteUpdate','deleteUpdate',x.id):''}</article>`;}).join('')||`<div class="empty"><p>${esc(ct('empty'))}</p></div>`}</div><form id="netCoopUpdate" class="editor card"><label>${esc(ct('newUpdate'))}<textarea name="body" maxlength="3000" rows="3" required>${esc(coopUpdateDraft)}</textarea></label><button class="button">${esc(ct('publishUpdate'))}</button></form>`;
  return html;
 }
 const kind=projectMode?'project':coopDraft.kind;
 html+=`<form id="netCoopCreate" class="editor card"><h3>${esc(ct('newCoop'))}</h3>${projectMode?`<input type="hidden" name="kind" value="project">`:`<label>${esc(ct('kind'))}<select name="kind">${['need','offer','purchase','resource'].map(k=>`<option value="${k}"${kind===k?' selected':''}>${esc(kindLabel(k))}</option>`).join('')}</select></label>`}<label>${esc(ct('title'))}<input name="title" maxlength="120" required value="${esc(coopDraft.title||'')}"></label><label>${esc(ct('description'))}<textarea name="description" maxlength="3000" rows="3">${esc(coopDraft.description||'')}</textarea></label><label>${esc(ct('location'))}<input name="location" maxlength="120" value="${esc(coopDraft.location||'')}"></label><div data-purchase-fields ${kind==='purchase'?'':'hidden'}><label>${esc(ct('target'))}<input name="targetQuantity" type="number" min="0.001" step="0.001" value="${esc(coopDraft.targetQuantity||'')}"></label><label>${esc(ct('unit'))}<input name="unit" maxlength="30" value="${esc(coopDraft.unit||'')}"></label><p class="meta">${esc(ct('purchaseHelp'))}</p></div><button class="button">${esc(ct('newCoop'))}</button></form><h3>${esc(projectMode?ct('projectsTitle'):ct('togetherTitle'))}</h3><div class="draft-grid">${list.map(x=>{const unread=Number(data.activityInbox.find(a=>a.cooperation_id===x.id)?.unread_count||0);return `<article class="card"><div class="row"><span><span class="badge">${esc(kindLabel(x.kind))}</span> <span class="badge muted-badge">${esc(statusLabel(x.status))}</span></span>${unread?`<span class="net-count">${esc(String(unread))}</span>`:''}</div><h3>${esc(x.title)}</h3><p>${esc(x.description)}</p><p class="meta">${esc(x.location_text||'')}</p>${cbtn('open','open',x.id)}</article>`;}).join('')||`<div class="empty"><p>${esc(ct('empty'))}</p></div>`}</div><p class="meta">${esc(ct('localBelow'))}</p>`;
 return html;
}

function render(){
 const r=route(),relevant=['me','people','messages','together','projects'].includes(r);host.hidden=!relevant;
 document.getElementById('workspace').hidden=!!(api?.enabled&&['people','messages'].includes(r));
 syncBadges();
 if(!relevant)return;host.lang=lang();host.dir='ltr';
 if(!api?.enabled){host.innerHTML=`<aside class="notice"><strong>${esc(t('title'))}</strong><p>${esc(configError?t('error'):t('off'))}</p></aside>`;return;}
 let html='';const u=api.user();
 if(!u){html=`<h2>${esc(t('login'))}</h2><p>${esc(t('invite'))}</p><form id="netLogin" class="editor card"><label>${esc(t('email'))}<input type="email" name="email" maxlength="254" autocomplete="email" required value="${esc(email)}"></label><button name="operation" value="code" class="button">${esc(t('send'))}</button><label>${esc(t('code'))}<input name="code" inputmode="numeric" autocomplete="one-time-code" minlength="6" maxlength="10"></label><button name="operation" value="verify" class="button secondary">${esc(t('verify'))}</button></form>`;}
 else if(r==='messages'){html=renderMessages(u);}
 else if(r==='together'||r==='projects'){html=renderCooperation(u,r);}
 else if(r==='me'){
  const p=profileDraft||data.profile;
  html=`<div class="row"><h2>${esc(t('profile'))}</h2>${btn('logout','out')}</div><p>${esc(t('private'))}</p><form id="netProfile" class="editor card">${field('name','name',p.name||'',60)}${field('skills','skills',p.skills||'',200)}${field('about','about',p.about||'',600,true)}<label class="checkbox"><input type="checkbox" name="listed"${p.listed?' checked':''}>${esc(t('listed'))}</label><button class="button">${esc(t('save'))}</button></form><div class="actions">${btn('deleteProfile','deleteProfile')}${btn('export','export')}${btn('refresh','refresh')}</div><p class="meta">${esc(t('accountDelete'))} ${esc(t('exportNote'))}</p><h3>${esc(t('blocks'))}</h3>${data.blocks.map(b=>`<p>${esc(b.target_id)} ${btn('unblock','unblock',b.target_id)}</p>`).join('')}${renderActivityNotifications(u)}<h3>${esc(t('localTitle'))}</h3>`;
 }else{
  const group=data.groups.find(g=>g.id===selected),membership=data.memberships.find(m=>m.community_id===selected),member=membership&&!membership.banned;
  html=`<div class="row"><h2>${esc(t('groups'))}</h2><div>${btn('refresh','refresh')}${btn('logout','out')}</div></div><p>${esc(t('desc'))}</p>`;
  if(group){
   html+=`${btn('back','back')}<article class="card"><h2>${esc(group.name)}</h2><p>${esc(group.description)}</p><div class="actions">${membership?.banned?esc(t('banned')):member?(group.owner_id===u.id?btn('deleteGroup','ownerDelete',group.id):btn('leave','leave',group.id)):btn('join','join',group.id)}</div></article>`;
   if(member){html+=`<form id="netPost" class="editor card">${field('body','post',postDrafts[selected]||'',3000,true)}<button class="button">${esc(t('publish'))}</button></form><h3>${esc(t('members'))}</h3>`+data.posts.map(p=>`<article class="card"><small>${esc(p.author_id===u.id?t('own'):t('by')+' '+p.author_id.slice(0,8))}</small><p style="white-space:pre-wrap">${esc(p.body)}</p><div class="actions">${p.author_id===u.id||group.owner_id===u.id?btn('deletePost','delete',p.id):''}${p.author_id!==u.id?btn('report','report',p.id)+btn('block','block',p.author_id)+(group.owner_id===u.id?btn('ban','ban',p.author_id):''):''}</div></article>`).join('');}
  }else{
   html+=`<form id="netGroup" class="editor card"><h3>${esc(t('newGroup'))}</h3>${field('name','name',groupDraft.name||'',80)}${field('description','description',groupDraft.description||'',1000,true)}<button class="button">${esc(t('create'))}</button></form><div class="draft-grid">${data.groups.map(g=>`<article class="card"><h3>${esc(g.name)}</h3><p>${esc(g.description)}</p>${btn('open','open',g.id)}</article>`).join('')||esc(t('empty'))}</div><h3>${esc(t('directory'))}</h3><div class="draft-grid">${data.directory.map(p=>`<article class="card"><h3>${esc(p.name)}</h3><p>${esc(p.skills)}</p><p>${esc(p.about)}</p>${p.id!==u.id?btn('block','block',p.id):''}</article>`).join('')}</div>`;
  }
 }
 host.innerHTML=html+`<p id="netStatus" role="status" aria-live="polite">${esc(notice)}</p>`;
 host.querySelectorAll('button').forEach(b=>b.disabled=busy);
 syncBadges();
}
async function load(){
 const v=version,u=api.user();if(!u)return;
 const [profile,groups,memberships,directory,blocks,chats,chatMembers,chatInvites,chatProfiles,cooperations,coopMembers,coopChats,chatInbox,activityInbox]=await Promise.all([
  api.profile(),api.communities(),api.memberships(),api.directory(),api.blocks(),api.chats(),api.chatMembers(),api.chatInvites(),api.visibleProfiles(),api.cooperations(),api.cooperationMembers(),api.cooperationChats(),api.chatInbox(),api.activityInbox()
 ]);
 const posts=selected&&memberships.some(m=>m.community_id===selected&&!m.banned)?await api.posts(selected):[];
 const ownChatMember=selectedChat&&chatMembers.find(m=>m.conversation_id===selectedChat&&m.user_id===u.id);
 const chatMessages=ownChatMember?await api.chatMessages(selectedChat):[];
 if(v!==version)throw Object.assign(new Error('STALE'),{code:'STALE'});
 if(ownChatMember&&chatMessages.length){
  const newest=chatMessages.at(-1)?.created_at;
  if(newest&&(!ownChatMember.last_read_at||Date.parse(newest)>Date.parse(ownChatMember.last_read_at))){
   await api.markChatRead(selectedChat);ownChatMember.last_read_at=new Date().toISOString();
   const inbox=chatInbox.find(x=>x.conversation_id===selectedChat);if(inbox)inbox.unread_count=0;
  }
 }
 const ownCoopMember=selectedCoop&&coopMembers.find(m=>m.cooperation_id===selectedCoop&&m.user_id===u.id);
 const selectedCooperation=selectedCoop&&cooperations.find(x=>x.id===selectedCoop);
 const [coopUpdates,projectTasks,commitments,coopActivity]=ownCoopMember?await Promise.all([
  api.cooperationUpdates(selectedCoop),
  selectedCooperation?.kind==='project'?api.projectTasks(selectedCoop):Promise.resolve([]),
  selectedCooperation?.kind==='purchase'?api.purchaseCommitments(selectedCoop):Promise.resolve([]),
  api.cooperationActivity(selectedCoop)
 ]):[[],[],[],[]];
 if(ownCoopMember){
  const inbox=activityInbox.find(x=>x.cooperation_id===selectedCoop);
  if(Number(inbox?.unread_count||0)>0){await api.markCooperationRead(selectedCoop);inbox.unread_count=0;}
 }
 const [purchaseOffers,purchaseChoice,purchaseProcess]=selectedCooperation?.kind==='purchase'?await Promise.all([
  api.purchaseOffers(selectedCoop),api.purchaseChoice(selectedCoop),api.purchaseProcess(selectedCoop)
 ]):[[],[],[]];
 const purchaseConfirmations=selectedCooperation?.kind==='purchase'&&ownCoopMember?await api.purchaseConfirmations(selectedCoop):[];
 data={profile:profile[0]||{},groups,memberships,directory,blocks,posts,chats,chatMembers,chatInvites,chatProfiles,chatMessages,chatInbox,cooperations,coopMembers,coopChats,coopActivity,activityInbox,coopUpdates,projectTasks,commitments,purchaseOffers,purchaseChoice,purchaseProcess,purchaseConfirmations};
}
async function run(fn){
 if(busy)return;busy=true;host.querySelectorAll('button').forEach(b=>b.disabled=true);
 notice=t('busy');const status=host.querySelector('#netStatus');if(status)status.textContent=notice;
 try{await fn();}catch(e){notice=t(({AUTH_REQUIRED:'auth',DENIED:'denied',RATE_LIMIT:'limit',INVALID_INPUT:'invalid',STALE:'stale'})[e.code]||'error');}
 finally{busy=false;render();}
}
host.addEventListener('input',e=>{
 const f=e.target.form;if(!f)return;const v=Object.fromEntries(new FormData(f));
 if(f.id==='netProfile')profileDraft={...v,listed:v.listed==='on'};
 if(f.id==='netGroup')groupDraft=v;
 if(f.id==='netPost')postDrafts[selected]=v.body;
 if(f.id==='netLogin')email=v.email;
 if(f.id==='netDirect')directTarget=v.other||'';
 if(f.id==='netNewChat'){const fd=new FormData(f);chatDraft={title:String(fd.get('title')||''),members:fd.getAll('members').map(String)};}
 if(f.id==='netChatInvite')inviteTarget=v.user||'';
 if(f.id==='netMessage')messageDrafts[selectedChat]=v.body||'';
 if(f.id==='netCoopCreate'){coopDraft={kind:v.kind||'project',title:v.title||'',description:v.description||'',location:v.location||'',targetQuantity:v.targetQuantity||'',unit:v.unit||''};if(e.target.name==='kind')render();}
 if(f.id==='netCoopEdit')coopEditDraft={title:v.title||'',description:v.description||'',location:v.location||'',status:v.status||'open',targetQuantity:v.targetQuantity||'',unit:v.unit||''};
 if(f.id==='netCoopUpdate')coopUpdateDraft=v.body||'';
 if(f.id==='netTaskCreate')taskDraft={title:v.title||'',details:v.details||'',assignee:v.assignee||''};
 if(f.id==='netCommitment')commitDraft={quantity:v.quantity||'',note:v.note||''};
 if(f.id==='netPurchaseOffer')offerDraft={cooperationId:selectedCoop,unitPrice:v.unitPrice||'',currency:(v.currency||'').toUpperCase(),minQuantity:v.minQuantity||'',availableQuantity:v.availableQuantity||'',deliveryMode:v.deliveryMode||'pickup',deliveryFee:v.deliveryFee||'0',leadTimeDays:v.leadTimeDays||'0',validUntil:v.validUntil||'',note:v.note||''};
 if(f.id?.startsWith('netPurchase')&&f.id!=='netPurchaseOffer')lifecycleDrafts[f.id]=v;
});
host.addEventListener('submit',e=>{e.preventDefault();const f=e.target,values=Object.fromEntries(new FormData(f)),op=e.submitter?.value;
 run(async()=>{
  if(f.id==='netLogin'){email=values.email;if(op==='code'){await api.requestCode(email);notice=t('sent');return;}await api.verify(email,values.code);email='';await load();notice='';return;}
  if(f.id==='netDirect'){selectedChat=await api.startDirect(values.other);directTarget='';}
  if(f.id==='netNewChat'){const fd=new FormData(f);selectedChat=await api.createGroupChat(String(fd.get('title')||''),fd.getAll('members').map(String));chatDraft={title:'',members:[]};}
  if(f.id==='netChatInvite'){await api.inviteChat(selectedChat,values.user);inviteTarget='';}
  if(f.id==='netMessage'){await api.sendMessage(selectedChat,values.body);delete messageDrafts[selectedChat];}
  if(f.id==='netCoopCreate'){const fd=new FormData(f),kind=String(fd.get('kind')||'project');selectedCoop=await api.createCooperation({kind,title:String(fd.get('title')||''),description:String(fd.get('description')||''),location:String(fd.get('location')||''),targetQuantity:String(fd.get('targetQuantity')||''),unit:String(fd.get('unit')||'')});coopDraft={kind:kind==='project'?'project':'need',title:'',description:'',location:'',targetQuantity:'',unit:''};}
  if(f.id==='netCoopEdit'){const coop=data.cooperations.find(x=>x.id===selectedCoop);await api.updateCooperation(selectedCoop,{kind:coop.kind,title:values.title,description:values.description,location:values.location,status:values.status,targetQuantity:values.targetQuantity,unit:values.unit});coopEditDraft=null;}
  if(f.id==='netCoopUpdate'){await api.addCooperationUpdate(selectedCoop,values.body);coopUpdateDraft='';}
  if(f.id==='netCommitment'){await api.setPurchaseCommitment(selectedCoop,values.quantity,values.note);commitDraft={quantity:'',note:''};}
  if(f.id==='netPurchaseOffer'){await api.savePurchaseOffer(selectedCoop,{unitPrice:values.unitPrice,currency:values.currency,minQuantity:values.minQuantity,availableQuantity:values.availableQuantity,deliveryMode:values.deliveryMode,deliveryFee:values.deliveryFee,leadTimeDays:values.leadTimeDays,validUntil:values.validUntil,note:values.note});offerDraft=null;}
  if(f.id==='netPurchaseStart'){await api.startPurchaseConfirmation(selectedCoop,values.deadline);delete lifecycleDrafts.netPurchaseStart;}
  if(f.id==='netPurchaseConfirm'){await api.confirmPurchaseParticipation(selectedCoop,op==='yes',values.note||'');delete lifecycleDrafts.netPurchaseConfirm;}
  if(f.id==='netPurchaseOrdered'){await api.markPurchaseOrdered(selectedCoop,{reference:values.reference,expectedDelivery:values.expectedDelivery,note:values.note,pickupPlace:values.pickupPlace,pickupStart:values.pickupStart,pickupEnd:values.pickupEnd});delete lifecycleDrafts.netPurchaseOrdered;}
  if(f.id==='netPurchaseDeliveryPlan'){await api.setPurchaseDeliveryPlan(selectedCoop,{expectedDelivery:values.expectedDelivery,note:values.note,pickupPlace:values.pickupPlace,pickupStart:values.pickupStart,pickupEnd:values.pickupEnd});delete lifecycleDrafts.netPurchaseDeliveryPlan;}
  if(f.id==='netPurchaseDelivered'){await api.markPurchaseDelivered(selectedCoop,values.note||'');delete lifecycleDrafts.netPurchaseDelivered;}
  if(f.id==='netPurchaseCollected'){await api.markPurchaseCollected(selectedCoop,op==='yes',values.note||'');delete lifecycleDrafts.netPurchaseCollected;}
  if(f.id==='netPurchaseFinish'){await api.finishPurchase(selectedCoop,values.note||'');delete lifecycleDrafts.netPurchaseFinish;}
  if(f.id==='netPurchaseCancel'){await api.cancelPurchase(selectedCoop,values.reason);delete lifecycleDrafts.netPurchaseCancel;}
  if(f.id==='netTaskCreate'){await api.createProjectTask(selectedCoop,{title:values.title,details:values.details,assignee:values.assignee});taskDraft={title:'',details:'',assignee:''};}
  if(f.classList.contains('netTaskStatus'))await api.setProjectTaskStatus(values.task,values.status);
  if(f.classList.contains('netTaskAssign'))await api.assignProjectTask(values.task,values.assignee||null);
  if(f.id==='netProfile'){await api.saveProfile({name:values.name,skills:values.skills,about:values.about,listed:values.listed==='on'});profileDraft=null;}
  if(f.id==='netGroup'){selected=await api.createCommunity(values.name,values.description);groupDraft={};}
  if(f.id==='netPost'){await api.publish(selected,values.body);delete postDrafts[selected];}
  await load();notice=t('saved');
 });
});
host.addEventListener('click',e=>{const cb=e.target.closest('[data-coop]');if(cb){const a=cb.dataset.coop,id=cb.dataset.id;run(async()=>{
  if(a==='back'){selectedCoop=null;coopEditDraft=null;coopUpdateDraft='';taskDraft={title:'',details:'',assignee:''};commitDraft={quantity:'',note:''};offerDraft=null;lifecycleDrafts={};}
  if(a==='open')selectedCoop=id;
  if(a==='join')await api.joinCooperation(id);
  if(a==='leave'){if(!confirm(t('confirm')))return;await api.leaveCooperation(id);selectedCoop=null;}
  if(a==='delete'){if(!confirm(t('confirm')))return;await api.deleteCooperation(id);selectedCoop=null;}
  if(a==='removeMember'){if(!confirm(t('confirm')))return;await api.removeCooperationMember(selectedCoop,id);}
  if(a==='deleteUpdate'){if(!confirm(t('confirm')))return;await api.deleteCooperationUpdate(id);}
  if(a==='deleteTask'){if(!confirm(t('confirm')))return;await api.deleteProjectTask(id);}
  if(a==='removeCommit')await api.setPurchaseCommitment(selectedCoop,0,'');
  if(a==='resetConfirmation'){if(!confirm(t('confirm')))return;await api.resetPurchaseConfirmation(selectedCoop);lifecycleDrafts={};}
  if(a==='withdrawOffer'){if(!confirm(t('confirm')))return;await api.withdrawPurchaseOffer(selectedCoop);offerDraft=null;}
  if(a==='selectOffer')await api.choosePurchaseOffer(selectedCoop,id);
  if(a==='clearOffer')await api.choosePurchaseOffer(selectedCoop,null);
  if(a==='reportOffer'){const reason=prompt(t('reason'));if(reason===null)return;await api.reportPurchaseOffer(id,reason);notice=t('reported');}
  if(a==='blockProvider')await api.block(id);
  if(a==='messageProvider'){selectedChat=await api.startDirect(id);navigateNetwork('#/messages');}
  if(a==='openLinkedChat'){selectedChat=id;navigateNetwork('#/messages');}
  if(a==='openNotify'){selectedCoop=id;const target=data.cooperations.find(x=>x.id===id);navigateNetwork(target?.kind==='project'?'#/projects':'#/together');}
  await load();notice='';
 });return;}const b=e.target.closest('[data-net]');if(!b)return;const a=b.dataset.net,id=b.dataset.id;
 run(async()=>{
  if(a==='logout'){await api.logout();notice='';return;}
  if(a==='back')selected=null;if(a==='open')selected=id;
  if(a==='backChats')selectedChat=null;if(a==='openChat')selectedChat=id;
  if(a==='acceptChat')await api.acceptChat(id);
  if(a==='declineChat'){await api.declineChat(id);if(selectedChat===id)selectedChat=null;}
  if(a==='leaveChat'){if(!confirm(t('confirm')))return;await api.leaveChat(id);selectedChat=null;}
  if(a==='deleteChat'){if(!confirm(t('confirm')))return;await api.deleteChat(id);selectedChat=null;}
  if(a==='removeChatMember'){if(!confirm(t('confirm')))return;await api.removeChatMember(selectedChat,id);}
  if(a==='deleteMessage'){if(!confirm(t('confirm')))return;await api.deleteMessage(id);notice=mt('deletedMessage');}
  if(a==='reportMessage'){const reason=prompt(t('reason'));if(reason===null)return;await api.reportMessage(id,reason);notice=t('reported');}

  if(a==='join')await api.join(id);if(a==='leave')await api.leave(id);
  if(a==='deletePost'||a==='deleteGroup'||a==='deleteProfile'){
   if(!confirm(t('confirm'))){notice='';return;}
   if(a==='deletePost')await api.deletePost(id);
   if(a==='deleteGroup'){await api.deleteCommunity(id);selected=null;}
   if(a==='deleteProfile'){await api.deleteProfile();profileDraft=null;}
  }
  if(a==='block')await api.block(id);if(a==='unblock')await api.block(id,false);
  if(a==='ban'){if(!confirm(t('ban')+'?'))return;await api.ban(selected,id);}
  if(a==='report'){const reason=prompt(t('reason'));if(reason===null)return;await api.report(id,reason);notice=t('reported');return;}
  if(a==='export'){
   const result=await api.exportOwn(),url=URL.createObjectURL(new Blob([JSON.stringify(result,null,2)],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download='folkoop-network-export.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notice=t('exportNote');return;
  }
  await load();notice=a==='deleteProfile'?t('profileDeleted'):'';
 });
});
api?.onChange(()=>{version++;selected=null;selectedChat=null;selectedCoop=null;profileDraft=null;groupDraft={};postDrafts={};chatDraft={title:'',members:[]};directTarget='';inviteTarget='';messageDrafts={};coopDraft={kind:'need',title:'',description:'',location:'',targetQuantity:'',unit:''};coopEditDraft=null;coopUpdateDraft='';taskDraft={title:'',details:'',assignee:''};commitDraft={quantity:'',note:''};offerDraft=null;lifecycleDrafts={};data={profile:{},groups:[],memberships:[],posts:[],directory:[],blocks:[],chats:[],chatMembers:[],chatInvites:[],chatProfiles:[],chatMessages:[],chatInbox:[],cooperations:[],coopMembers:[],coopChats:[],coopActivity:[],activityInbox:[],coopUpdates:[],projectTasks:[],commitments:[],purchaseOffers:[],purchaseChoice:[],purchaseProcess:[],purchaseConfirmations:[]};render();});
window.addEventListener('hashchange',()=>{if(internalHash&&location.hash===internalHash){internalHash='';return;}internalHash='';version++;if(api?.user())run(async()=>{await load();notice='';});else render();});
new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
render();
})();
