/* Accounts and shared communities. Inactive until a dedicated backend is configured. */
(() => {
'use strict';
const host=document.getElementById('networkPanel');if(!host)return;
const esc=globalThis.FolkoopCore.escape;
const en={title:'Network account',off:'The server is not connected yet. Local drafts below remain on your device.',login:'Pilot sign-in',invite:'Invite-only pilot · 18+ · free. New participants need an invitation code. Local drafts stay on this device.',email:'Email',code:'Code from email',inviteCode:'Pilot invitation code',inviteCodeHint:'Only needed on first admission; returning pilot members may leave it blank.',inviteRequired:'A valid unused pilot invitation code is required for first admission.',localContinue:'Use locally without signing in',policyAccept:'I accept the Pilot Terms and confirm that I have read the Privacy Notice.',termsLink:'Pilot Terms',privacyLink:'Privacy Notice',policyRequired:'Accept the current Pilot Terms and acknowledge the Privacy Notice before entering the pilot.',google:'Continue with Google',oauthWaiting:'Complete Google sign-in in the popup.',oauthFailed:'Google sign-in was not completed.',popupBlocked:'The sign-in popup was blocked by the browser.',send:'Request code',resend:'Send code again',verify:'Sign in',sent:'If this email is enabled for the current pilot, the one-time code is on its way. Check your inbox.',out:'Sign out',profile:'Network profile',private:'Visible only to you unless you enable the directory. Group publications are visible to that group’s members.',name:'Name or nickname',skills:'Skills',about:'About me',listed:'Show this profile to other pilot participants',save:'Save on server',saved:'Saved on server.',groups:'Communities',desc:'Any pilot participant can discover and join these communities. Publications are visible to current members. This is not a private encrypted chat.',newGroup:'Create community',description:'Description',create:'Create',join:'Join',leave:'Leave',open:'Open',back:'All communities',refresh:'Refresh',post:'New publication',publish:'Publish to members',empty:'Nothing here yet.',delete:'Delete',confirm:'Delete? This cannot be undone.',ownerDelete:'Delete my community and all its publications',report:'Report',reason:'Reason for the report (do not include sensitive personal information)',reported:'Report stored for operator review. No automatic verdict has been made.',block:'Hide this participant',ban:'Ban from my community',unblock:'Unhide',blocks:'Hidden participants',deleteProfile:'Delete my network profile',profileDeleted:'Network profile deleted. This does not delete the Auth account or past publications.',accountDelete:'Full account deletion is handled by the pilot operator until the account-deletion endpoint is implemented.',export:'Export visible records',exportNote:'Export can be limited by server row limits and access permissions; request a complete export from the operator.',loading:'Loading…',members:'Members’ publications',by:'Participant',own:'You',directory:'People who opted into discovery',banned:'Access to this community is unavailable.',busy:'Working…',auth:'Sign in again.',error:'Request failed. No successful change is confirmed. Check the connection and try again.',denied:'Access denied. Pilot access or membership may be missing.',limit:'Too many requests. Try again later.',invalid:'Check the entered values.',stale:'Session changed. Reload the section.',localTitle:'Local workspace below — separate from your network account.'};
const ru={...en,title:'Сетевой аккаунт',off:'Сервер ещё не подключён. Личные черновики ниже остаются на твоём устройстве.',login:'Вход в пилот',invite:'Пилот по приглашению · 18+ · бесплатно. При первом входе нужен код приглашения. Локальные черновики остаются на этом устройстве.',email:'Электронная почта',code:'Код из письма',inviteCode:'Код приглашения в пилот',inviteCodeHint:'Нужен только при первом входе; затем поле можно оставить пустым.',inviteRequired:'Для первого допуска нужен действующий неиспользованный код приглашения.',localContinue:'Использовать локально без входа',policyAccept:'Я принимаю условия пилота и подтверждаю, что прочитал уведомление о конфиденциальности.',termsLink:'Условия пилота',privacyLink:'Уведомление о конфиденциальности',policyRequired:'Перед входом в пилот прими текущие условия и подтверди ознакомление с уведомлением о конфиденциальности.',google:'Продолжить с Google',oauthWaiting:'Заверши вход Google во всплывающем окне.',oauthFailed:'Вход через Google не завершён.',popupBlocked:'Браузер заблокировал окно входа.',send:'Получить код',resend:'Отправить код ещё раз',verify:'Войти',sent:'Если этот e-mail допущен к текущему пилоту, одноразовый код отправлен. Проверь почту.',out:'Выйти',profile:'Сетевой профиль',private:'Профиль виден только тебе, пока ты не включишь показ в каталоге. Публикации в группе видят её участники.',name:'Имя или псевдоним',skills:'Навыки',about:'О себе',listed:'Показывать профиль другим участникам пилота',save:'Сохранить на сервере',saved:'Сохранено на сервере.',groups:'Сообщества',desc:'Любой участник пилота может найти сообщество и вступить. Публикации видны действующим участникам группы. Это не закрытый зашифрованный чат.',newGroup:'Создать сообщество',description:'Описание',create:'Создать',join:'Вступить',leave:'Выйти из группы',open:'Открыть',back:'Все сообщества',refresh:'Обновить',post:'Новая публикация',publish:'Опубликовать для участников',empty:'Здесь пока пусто.',delete:'Удалить',confirm:'Удалить? Отменить это действие нельзя.',ownerDelete:'Удалить моё сообщество со всеми публикациями',report:'Пожаловаться',reason:'Причина жалобы (без чувствительных персональных данных)',reported:'Жалоба сохранена для проверки оператором. Автоматический вердикт не вынесен.',block:'Скрыть участника',ban:'Запретить доступ в мою группу',unblock:'Снять скрытие',blocks:'Скрытые участники',deleteProfile:'Удалить сетевой профиль',profileDeleted:'Сетевой профиль удалён. Аккаунт входа и прежние публикации этим не удаляются.',accountDelete:'Полное удаление аккаунта пока выполняет оператор пилота: отдельный сервис удаления ещё не подключён.',export:'Выгрузить доступные записи',exportNote:'Выгрузка ограничена правами доступа и лимитами сервера; полную копию можно запросить у оператора.',loading:'Загрузка…',members:'Публикации участников',by:'Участник',own:'Ты',directory:'Люди, включившие показ профиля',banned:'Доступ в это сообщество недоступен.',busy:'Выполняется…',auth:'Войди заново.',error:'Запрос не выполнен. Успешное изменение не подтверждено. Проверь связь и повтори.',denied:'Нет доступа. Возможно, не выдано приглашение в пилот или нет членства в группе.',limit:'Слишком много запросов. Повтори позже.',invalid:'Проверь введённые данные.',stale:'Сессия изменилась. Обнови раздел.',localTitle:'Ниже — локальная рабочая область, отдельно от сетевого аккаунта.'};
const sv={...en,title:'Nätverkskonto',off:'Servern är inte ansluten ännu. Dina lokala utkast nedan stannar på enheten.',login:'Logga in i piloten',invite:'Piloten är endast för inbjudna · 18+ · kostnadsfri. Vid första inloggningen behövs en inbjudningskod. Lokala utkast stannar på den här enheten.',email:'E-post',code:'Kod från e-post',inviteCode:'Inbjudningskod till piloten',inviteCodeHint:'Behövs bara vid första inloggningen; därefter kan fältet lämnas tomt.',inviteRequired:'En giltig oanvänd pilotkod krävs för första tillträdet.',localContinue:'Använd lokalt utan att logga in',policyAccept:'Jag godkänner pilotvillkoren och bekräftar att jag har läst integritetsinformationen.',termsLink:'Pilotvillkor',privacyLink:'Integritetsinformation',policyRequired:'Godkänn de aktuella pilotvillkoren och bekräfta integritetsinformationen innan du går in i piloten.',google:'Fortsätt med Google',oauthWaiting:'Slutför Google-inloggningen i popup-fönstret.',oauthFailed:'Google-inloggningen slutfördes inte.',popupBlocked:'Webbläsaren blockerade inloggningsfönstret.',send:'Begär kod',resend:'Skicka koden igen',verify:'Logga in',sent:'Om e-postadressen är aktiverad för piloten skickas engångskoden nu. Kontrollera inkorgen.',out:'Logga ut',profile:'Nätverksprofil',private:'Endast du ser profilen tills du aktiverar katalogen. Gruppinlägg visas för gruppens medlemmar.',name:'Namn eller smeknamn',skills:'Färdigheter',about:'Om mig',listed:'Visa profilen för andra pilotdeltagare',save:'Spara på servern',saved:'Sparat på servern.',groups:'Gemenskaper',desc:'Alla pilotdeltagare kan hitta och gå med i grupperna. Inlägg visas för aktuella medlemmar. Detta är inte en privat krypterad chatt.',newGroup:'Skapa grupp',description:'Beskrivning',create:'Skapa',join:'Gå med',leave:'Lämna gruppen',open:'Öppna',back:'Alla grupper',refresh:'Uppdatera',post:'Nytt inlägg',publish:'Publicera för medlemmar',empty:'Här är det tomt ännu.',delete:'Ta bort',confirm:'Ta bort? Detta går inte att ångra.',ownerDelete:'Radera min grupp och alla dess inlägg',report:'Rapportera',reason:'Orsak till rapporten (inga känsliga personuppgifter)',reported:'Rapporten sparades för granskning. Inget automatiskt beslut har fattats.',block:'Dölj deltagaren',ban:'Stäng av från min grupp',unblock:'Visa igen',blocks:'Dolda deltagare',deleteProfile:'Radera nätverksprofilen',profileDeleted:'Nätverksprofilen raderades. Inloggningskontot och tidigare inlägg raderas inte av detta.',accountDelete:'Pilotoperatören hanterar fullständig kontoradering tills en separat raderingstjänst finns.',export:'Exportera synliga poster',exportNote:'Export begränsas av behörighet och servergränser; begär en fullständig kopia från operatören.',loading:'Laddar…',members:'Medlemmarnas inlägg',by:'Deltagare',own:'Du',directory:'Personer som valt synlighet',banned:'Denna grupp är inte tillgänglig.',busy:'Arbetar…',auth:'Logga in igen.',error:'Begäran misslyckades. Ingen lyckad ändring är bekräftad. Kontrollera anslutningen och försök igen.',denied:'Åtkomst nekad. Pilotbehörighet eller medlemskap kan saknas.',limit:'För många förfrågningar. Försök senare.',invalid:'Kontrollera värdena.',stale:'Sessionen ändrades. Uppdatera delen.',localTitle:'Lokal arbetsyta nedan — separat från nätverkskontot.'};
const muraGuestCopy={
 en:{base:{profile:'Mura',listed:'Open to discovery',groups:"Mura's communities",desc:"Places I return to because people, interests and practical things keep connecting there.",directory:"People around Mura",own:'Mura',out:"Leave Mura's account",by:'From',empty:'Nothing here right now.'},chat:{messagesTitle:"Mura's conversations",messagesDesc:"Personal conversations, groups and work chats — each tied to something happening in my life.",conversation:'My conversations',direct:'Direct',groupChat:'Group chat',membersList:'People in this conversation',notEncrypted:'',you:'Mura',noPeople:'No new conversation here right now.'},coop:{togetherTitle:'Together',projectsTitle:"Mura's projects",networkDesc:"What I need, what I can offer, shared resources and things we are doing together.",projectDesc:"Ideas that already have people, tasks, updates and a work chat around them.",localBelow:'',memberOnly:"I'm not part of this one yet."},offer:{offerHelp:"We compare terms and coordinate here. Payment and the actual order stay outside FOLKOOP.",notOrder:"The selected option is a shared reference for the group; payment and ordering stay outside FOLKOOP."},home:{demoBadge:'Mura · Göteborg',demoText:"This is Mura's account. Explore freely; changes are simply turned off.",demoExit:"Leave Mura's account"}},
 ru:{base:{profile:'Мура',listed:'Меня можно найти в «Людях»',groups:'Сообщества Муры',desc:'Места, куда я возвращаюсь, потому что там пересекаются люди, интересы и реальные дела.',directory:'Люди вокруг Муры',own:'Мура',out:'Выйти из аккаунта Муры',by:'От',empty:'Сейчас здесь ничего нет.'},chat:{messagesTitle:'Переписки Муры',messagesDesc:'Личные разговоры, группы и рабочие чаты — каждый связан с чем-то, что происходит в моей жизни.',conversation:'Мои разговоры',direct:'Личная переписка',groupChat:'Групповой чат',membersList:'Кто в этом разговоре',notEncrypted:'',you:'Мура',noPeople:'Сейчас здесь нет нового разговора.'},coop:{togetherTitle:'Вместе',projectsTitle:'Проекты Муры',networkDesc:'Что мне нужно, чем я могу помочь, чем мы делимся и что делаем вместе.',projectDesc:'Идеи, которые уже обросли людьми, задачами, обновлениями и рабочими чатами.',localBelow:'',memberOnly:'Я пока не участвую в этом деле.'},offer:{offerHelp:'Здесь мы сравниваем условия и договариваемся. Оплата и сам заказ происходят вне FOLKOOP.',notOrder:'Выбранный вариант — общий ориентир для группы; оплата и оформление заказа остаются вне FOLKOOP.'},home:{demoBadge:'Мура · Göteborg',demoText:'Это аккаунт Муры. Здесь можно всё исследовать; изменения просто отключены.',demoExit:'Выйти из аккаунта Муры'}},
 sv:{base:{profile:'Mura',listed:'Jag går att hitta under Människor',groups:'Muras gemenskaper',desc:'Platser jag återkommer till eftersom människor, intressen och praktiska saker möts där.',directory:'Människor runt Mura',own:'Mura',out:'Lämna Muras konto',by:'Från',empty:'Här finns inget just nu.'},chat:{messagesTitle:'Muras samtal',messagesDesc:'Personliga samtal, grupper och arbetschattar — alla kopplade till något som händer i mitt liv.',conversation:'Mina samtal',direct:'Direkt',groupChat:'Gruppchatt',membersList:'Personer i samtalet',notEncrypted:'',you:'Mura',noPeople:'Ingen ny konversation här just nu.'},coop:{togetherTitle:'Tillsammans',projectsTitle:'Muras projekt',networkDesc:'Det jag behöver, kan erbjuda, delar med andra och gör tillsammans.',projectDesc:'Idéer som redan har människor, uppgifter, uppdateringar och en arbetschatt omkring sig.',localBelow:'',memberOnly:'Jag är inte med i den här ännu.'},offer:{offerHelp:'Här jämför vi villkor och samordnar. Betalning och själva beställningen sker utanför FOLKOOP.',notOrder:'Det valda alternativet är gruppens gemensamma referens; betalning och beställning sker utanför FOLKOOP.'},home:{demoBadge:'Mura · Göteborg',demoText:'Det här är Muras konto. Utforska fritt; ändringar är bara avstängda.',demoExit:'Lämna Muras konto'}}
};
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
const homeCopy={
 en:{title:'Home',subtitle:'Start with what you need, can offer or want to do. FOLKOOP helps you find relevant people or resources and a next step — before there is even a group chat.',attention:'Needs your attention',nothingUrgent:'Nothing urgent right now.',messages:'Unread messages',invitations:'Chat invitations',task:'Task assigned to you',confirmation:'Confirm your purchase quantity',activity:'Unread cooperation activity',deadline:'Deadline',open:'Open',feed:'What is happening',communityPost:'Community publication',quick:'Do something together',need:'I need something',offer:'I can help',purchase:'Buy together',project:'Start a project',community:'Create a community',city:'Open my city',myWork:'My active cooperation',noFeed:'No shared activity yet. Start with a real need or project.',from:'from',assigned:'Assigned',pending:'Pending',why:'Home is intentionally action-first, not an endless engagement feed.',daily:'Today',nextStep:'One useful next step',caughtUp:'You’re caught up. Nothing needs your attention right now.',feedEnd:'You’re caught up · this feed ends here.',demoBadge:"Mura's place · learning example",demoText:"You're visiting Mura's guided place.",demoCta:'Create my own place',demoLocked:"You're visiting Mura. Sign in to do this in your own place.",demoExit:"Leave Mura's account"},
 ru:{title:'Главная',subtitle:'Начни с того, что тебе нужно, что можешь предложить или что хочешь сделать. FOLKOOP помогает найти людей или ресурсы и следующий шаг — ещё до того, как появился групповой чат.',attention:'Требует внимания',nothingUrgent:'Сейчас ничего срочного.',messages:'Непрочитанные сообщения',invitations:'Приглашения в чаты',task:'Задача назначена тебе',confirmation:'Подтверди количество в закупке',activity:'Непрочитанная активность',deadline:'Срок',open:'Открыть',feed:'Что происходит',communityPost:'Публикация сообщества',quick:'Сделать вместе',need:'Мне нужно',offer:'Я могу помочь',purchase:'Купить вместе',project:'Создать проект',community:'Создать сообщество',city:'Открыть мой город',myWork:'Мои активные дела',noFeed:'Общей активности пока нет. Начни с реальной потребности или проекта.',from:'от',assigned:'Назначено',pending:'Ожидается',why:'Главная специально построена вокруг действий, а не бесконечной ленты ради вовлечения.',daily:'Сегодня',nextStep:'Один полезный следующий шаг',caughtUp:'Всё просмотрено. Сейчас ничего не требует твоего внимания.',feedEnd:'Всё просмотрено · лента заканчивается здесь.',demoBadge:'Место Муры · учебный пример',demoText:'Ты в гостях в учебном пространстве Муры.',demoCta:'Создать своё место',demoLocked:'Сейчас ты в гостях у Муры. Войди, чтобы сделать это в своём месте.',demoExit:'Выйти из аккаунта Муры'},
 sv:{title:'Hem',subtitle:'Börja med det du behöver, kan erbjuda eller vill göra. FOLKOOP hjälper dig hitta människor eller resurser och nästa steg — innan det ens finns en gruppchatt.',attention:'Behöver din uppmärksamhet',nothingUrgent:'Inget brådskande just nu.',messages:'Olästa meddelanden',invitations:'Chattinbjudningar',task:'Uppgift tilldelad dig',confirmation:'Bekräfta din köpvolym',activity:'Oläst samarbetsaktivitet',deadline:'Sista tid',open:'Öppna',feed:'Vad händer',communityPost:'Publikation i gemenskap',quick:'Gör något tillsammans',need:'Jag behöver',offer:'Jag kan hjälpa',purchase:'Köp tillsammans',project:'Starta projekt',community:'Skapa gemenskap',city:'Öppna min stad',myWork:'Mina aktiva samarbeten',noFeed:'Ingen gemensam aktivitet ännu. Börja med ett verkligt behov eller projekt.',from:'från',assigned:'Tilldelad',pending:'Väntar',why:'Hem är medvetet handlingsorienterat, inte en oändlig engagemangsfeed.',daily:'Idag',nextStep:'Ett användbart nästa steg',caughtUp:'Du är ikapp. Inget behöver din uppmärksamhet just nu.',feedEnd:'Du är ikapp · flödet slutar här.',demoBadge:'Muras plats · lärexempel',demoText:'Du hälsar på i Muras guidade plats.',demoCta:'Skapa min egen plats',demoLocked:'Du hälsar på hos Mura. Logga in för att göra detta på din egen plats.',demoExit:'Lämna Muras konto'}
};
const baseCopy={sv,en,ru};
const extraCopy=globalThis.FolkoopExtraCopy?.languages||{};
for(const code of (globalThis.FolkoopCore?.LANGS||Object.keys(extraCopy))){
 const n=extraCopy[code]?.network;
 if(!n)continue;
 if(n.base)baseCopy[code]=n.base;
 if(n.chat)chatCopy[code]=n.chat;
 if(n.coop)coopCopy[code]=n.coop;
 if(n.offer)offerCopy[code]=n.offer;
 if(n.lifecycle)lifecycleCopy[code]=n.lifecycle;
 if(n.activity)activityCopy[code]=n.activity;
 if(n.home)homeCopy[code]=n.home;
}
const lang=()=>globalThis.FolkoopCore?.LANGS?.includes(document.documentElement.lang)?document.documentElement.lang:'en';
const muraText=(section,key)=>{
 const pack=muraGuestCopy[lang()]||muraGuestCopy.en;
 return guestDemo?pack?.[section]?.[key]:undefined;
};
const SUBSECTION_KEY='folkoop-subsection-v1';
function currentSubsection(parent){
 let key=document.documentElement.dataset.folkoopSubsection||'';
 if(!key){try{key=sessionStorage.getItem(SUBSECTION_KEY)||'';}catch{}}
 if(parent==='home'&&key.startsWith('home-'))return key;
 if(parent==='projects'&&key.startsWith('projects-'))return key;
 if(parent==='messages'&&key.startsWith('messages-'))return key;
 return parent==='home'?'home-overview':parent==='projects'?'projects-overview':'messages-chats';
}

const t=k=>muraText('base',k)??(baseCopy[lang()]?.[k]||en[k]||k);
let selected=null,selectedChat=null,selectedCoop=null,data={profile:{},localDrafts:[],groups:[],memberships:[],posts:[],homePosts:[],directory:[],blocks:[],chats:[],chatMembers:[],chatInvites:[],chatProfiles:[],chatMessages:[],chatInbox:[],cooperations:[],coopMembers:[],coopChats:[],coopActivity:[],activityInbox:[],assignedTasks:[],myConfirmations:[],allProcesses:[],coopUpdates:[],projectTasks:[],commitments:[],purchaseOffers:[],purchaseChoice:[],purchaseProcess:[],purchaseConfirmations:[]},notice='',busy=false,version=0,email='',otpCode='',pilotInvite='',policyAccepted=false,codeRequested=false,showLocalGuest=false,guestDemo=false,oauthPopup=null,profileDraft=null,groupDraft={},postDrafts={},chatDraft={title:'',members:[]},directTarget='',inviteTarget='',messageDrafts={},coopDraft={kind:'need',title:'',description:'',location:'',targetQuantity:'',unit:''},coopEditDraft=null,coopUpdateDraft='',taskDraft={title:'',details:'',assignee:''},commitDraft={quantity:'',note:''},offerDraft=null,lifecycleDrafts={};
let internalHash='';
const DEMO_UID='00000000-0000-4000-8000-000000000001';
try{guestDemo=sessionStorage.getItem('folkoop-entry-mode-v1')==='guest';}catch{}
const route=()=>FolkoopCore.route(location.hash);
const currentUser=()=>guestDemo?{id:DEMO_UID}:api?.user?.();
const demoLocaleCopy={
 ru:{
  'Photography · neighbourhood help':'Фотография · помощь по соседству',
  'FOLKOOP guide. Illustrative profile and examples for learning how cooperation works.':'Помощница FOLKOOP. Учебный профиль и примеры, показывающие, как работает кооперация.',
  'FOLKOOP guide. Welcome to my place — I use it to show how cooperation works.':'Помощница FOLKOOP. Добро пожаловать ко мне — здесь я показываю, как работает кооперация.',
  'Plant and seed exchange':'Обмен растениями и семенами по соседству',
  'Organize a small neighbourhood exchange of plants and seeds with roles, tasks and a work chat.':'Организовать небольшой обмен растениями и семенами с ролями, задачами и рабочим чатом.',
  'Borrow a tile cutter for the weekend':'Одолжить плиткорез на выходные',
  'Need a tile cutter for a small room repair over one weekend.':'Нужен плиткорез для небольшого ремонта комнаты на выходные.',
  'I can help with photography':'Могу помочь с фотографией',
  'Can help photograph an item, a small event or a neighbourhood project.':'Могу помочь сфотографировать вещь, небольшое мероприятие или местный проект.',
  'Alex · Example':'Alex · Пример',
  'Repair · coordination':'Ремонт · координация',
  'Learning-space profile. Example data only.':'Учебный профиль. Только пример данных.',
  'Carpentry · reuse':'Столярные работы · повторное использование',
  'Interested in neighbourhood repair and shared tools.':'Интересуется ремонтом по соседству и общими инструментами.',
  'Logistics · Swedish/Arabic':'Логистика · шведский/арабский',
  'Can help with delivery planning and language exchange.':'Может помочь с доставкой и языковым обменом.',
  'Design · facilitation':'Дизайн · организация групп',
  'Runs small community workshops.':'Организует небольшие общественные мастерские.',
  'Olofstorp neighbours':'Соседи Olofstorp',
  'Local neighbours sharing help, tools and practical coordination.':'Соседи, которые делятся помощью, инструментами и решают практические вопросы вместе.',
  'Göteborg language exchange':'Языковой обмен Göteborg',
  'Informal language practice, conversation tables and meetups.':'Неформальная языковая практика, разговорные столы и встречи.',
  'Repair café this Saturday — bring one small item and we will try to fix it together.':'В субботу ремонтное кафе — принеси одну небольшую вещь, попробуем починить её вместе.',
  'Looking for two people for a Swedish–Russian conversation table next week.':'Ищем двух человек для шведско-русского разговорного стола на следующей неделе.',
  'Neighbourhood repair café':'Ремонтное кафе по соседству',
  'Organize a small repair afternoon with tools, tasks and a work chat.':'Организовать небольшую встречу по ремонту с инструментами, задачами и рабочим чатом.',
  'Dry firewood together':'Купить сухие дрова вместе',
  'Combine a small group order and coordinate pickup.':'Объединить небольшой групповой заказ и договориться о получении.',
  'Borrow a drill for one evening':'Одолжить дрель на вечер',
  'Need a normal drill for two wall plugs.':'Нужна обычная дрель для двух креплений.',
  'I can review a CV':'Могу проверить резюме',
  'Can give one round of feedback in Swedish or English.':'Могу дать один раунд обратной связи на шведском или английском.',
  'Shared cargo bike':'Общий грузовой велосипед',
  'Available for short local borrowing by arrangement.':'Можно ненадолго взять поблизости по договорённости.',
  'Repair café · work chat':'Ремонтное кафе · рабочий чат',
  'Plant exchange · work chat':'Обмен растениями · рабочий чат',
  'Confirm the exchange table':'Подтвердить место для обмена',
  'Check that the exchange table is available on Saturday 13:00–16:00.':'Проверить, что место для обмена доступно в субботу с 13:00 до 16:00.',
  'todo · Confirm the exchange table':'Нужно сделать · Подтвердить место для обмена',
  'I can bring hand tools and a folding table.':'Я могу принести ручные инструменты и складной стол.',
  'I made a simple sign for the entrance. We still need someone for coffee.':'Я подготовила простую табличку для входа. Ещё нужен кто-то для кофе.',
  'I can help collect the firewood if the pickup is after 17:00.':'Могу помочь забрать дрова, если получение будет после 17:00.',
  'Confirm the room':'Подтвердить помещение',
  'Ask whether the community room is free on Saturday 13:00–16:00.':'Уточнить, свободно ли общественное помещение в субботу с 13:00 до 16:00.',
  'Prepare a small sign':'Подготовить небольшую табличку',
  'Simple A4 entrance sign.':'Простая табличка A4 для входа.',
  'Can collect after work':'Могу забрать после работы',
  'Need delivery help':'Нужна помощь с доставкой',
  'Delivery after 17:00 works for our group.':'Доставка после 17:00 подходит нашей группе.',
  'todo · Confirm the room':'Нужно сделать · Подтвердить помещение',
  'Entrance sign ready':'Табличка для входа готова',
  'Entrance sign is ready. I will bring tape and markers.':'Табличка для входа готова. Я принесу скотч и маркеры.',
  'Bikes · practical repair':'Велосипеды · практический ремонт',
  'We met at the repair café; he usually knows who has the right tool nearby.':'Познакомились на ремонтном кафе; он обычно знает, у кого поблизости найдётся нужный инструмент.',
  'Gardening · seed saving':'Сад · сохранение семян',
  'She came to the first plant exchange and now helps me think one season ahead.':'Она пришла на первый обмен растениями и теперь помогает мне думать на сезон вперёд.',
  'Cooking · neighbourhood events':'Еда · соседские встречи',
  'We met through Olofstorp neighbours; she volunteered coffee for the repair café.':'Мы познакомились через «Соседи Olofstorp»; она взяла на себя кофе для ремонтного кафе.',
  'Repair and reuse circle':'Ремонт и повторное использование',
  'People who repair small things, share tools and teach each other.':'Люди, которые чинят небольшие вещи, делятся инструментами и учат друг друга.',
  'Sunday walk and litter pick':'Воскресная прогулка и уборка',
  'A low-key walk where we also collect litter along the path.':'Спокойная прогулка, во время которой мы заодно собираем мусор вдоль тропы.',
  'The kettle is fixed. Next time I can bring a multimeter and spare plugs.':'Чайник починен. В следующий раз могу принести мультиметр и запасные вилки.',
  'Anyone up for a short walk around Delsjön on Sunday morning?':'Кто хочет короткую прогулку вокруг Delsjön в воскресенье утром?',
  'Repair café afternoon':'Соседское ремонтное кафе',
  'A small repair afternoon that ended with 11 items fixed, 3 diagnosed and a list of tools to share next time.':'Небольшое ремонтное кафе: 11 вещей починили, 3 продиагностировали и составили список инструментов на следующий раз.',
  'Neighbourhood tool shelf':'Полка общих инструментов',
  'Turn a messy pile of rarely used tools into a labelled shelf people can actually borrow from.':'Превратить хаотичную стопку редко используемых инструментов в подписанную полку, откуда их реально можно брать.',
  'Borrowed a folding ladder':'Одолжила складную лестницу',
  'Needed it for one afternoon; Johan lent one and I returned it the same evening.':'Она понадобилась на один день; Johan одолжил свою, и вечером я её вернула.',
  'Label the first ten tools':'Подписать первые десять инструментов',
  'Start with the tools people already said they are willing to share.':'Начать с инструментов, которыми люди уже готовы делиться.',
  'Write borrowing rules in plain language':'Написать простые правила пользования',
  'Keep it short: who has the key, how long, and what to do if something breaks.':'Коротко: у кого ключ, на какой срок можно брать и что делать, если что-то сломалось.',
  'Tool shelf · work chat':'Полка инструментов · рабочий чат',
  'I can bring the repaired kettle photos for the recap.':'Я могу принести фотографии починенного чайника для итогового поста.',
  'I have a spare label maker we can use for the shelf.':'У меня есть запасной принтер этикеток — можем использовать для полки.',
  'The shelf can fit by the entrance if we keep it under 90 cm wide.':'Полка поместится у входа, если сделать её уже 90 см.',
  'Repair café result: 11 fixed, 3 diagnosed.':'Итог ремонтного кафе: 11 вещей починили, 3 продиагностировали.',
  'First shelf sketch ready':'Первый эскиз полки готов',
  'I drew a simple shelf layout and marked the first tool categories.':'Я набросала простую схему полки и первые категории инструментов.',
  'Map a quiet walking route':'Набросать спокойный маршрут прогулки',
  'A route with one easy meeting point and no need for a car.':'Маршрут с простой точкой встречи и без необходимости ехать на машине.',
  'Ask Sara about seed envelopes':'Спросить Sara про конверты для семян',
  'She had a neat system at the last exchange.':'На прошлом обмене у неё была удобная система.',
  'Photograph the repaired items':'Сфотографировать починенные вещи',
  'Could become a small before/after story for the community.':'Можно сделать небольшую историю «до/после» для сообщества.',
  'Try a monthly skill swap':'Попробовать ежемесячный обмен навыками',
  'One evening where everyone brings one thing they can teach or need help with.':'Один вечер, где каждый приносит один навык, которому может научить, или задачу, с которой нужна помощь.',
  'I left the ladder by your gate. No rush — tonight is fine.':'Я оставил лестницу у твоих ворот. Не спеши — вечером нормально.',
  'Got it, thanks. I will return it after I clean the gutter.':'Забрала, спасибо. Верну после того, как прочищу желоб.',
  'Sunday 10:30 works for me. I can bring two grabbers for litter.':'Воскресенье 10:30 мне подходит. Могу взять два захвата для мусора.',
  'Great. I will bring bags and coffee.':'Отлично. Я возьму пакеты и кофе.',
  'We should keep the first shelf tiny and learn from actual borrowing.':'Я бы сделал первую полку маленькой и посмотрел, чем люди реально пользуются.',
  'Agreed. Ten tools first, then we expand only if people use them.':'Согласна. Сначала десять инструментов, а расширяться будем только если ими пользуются.',
  'Can you save me a few tomato seed envelopes?':'Можешь отложить мне несколько конвертов с семенами томатов?',
  'Yes, and I will bring labels too.':'Да, и ещё принесу этикетки.'
,
  'Photography, neighbourhood projects, repair cafés and too many unfinished ideas.':'Фотография, соседские проекты, ремонтные кафе и слишком много незаконченных идей.',
  'A local place for neighbours to exchange practical help, tools and small ideas.':'Место, где соседи обмениваются практической помощью, инструментами и небольшими идеями.',
  'Informal language practice, conversation tables and small meetups.':'Неформальная языковая практика, разговорные столы и небольшие встречи.',
  'We met through the firewood purchase; Omar makes pickup logistics feel simple.':'Мы познакомились через совместную закупку дров; с Omar логистика получения становится простой.',
  'Photographed the repair café':'Сфотографировала ремонтное кафе',
  'Made a small photo story from the repair café so the community could see what was fixed and who helped.':'Сделала небольшую фотоисторию о ремонтном кафе, чтобы сообщество увидело, что починили и кто помог.',
  'Set up the repair tables':'Подготовить столы для ремонта',
  'Create three simple stations for electrical, textile and general repair.':'Сделать три простые зоны: электрика, текстиль и общий ремонт.',
  'Photograph the repaired items for the recap':'Сфотографировать починенные вещи для итогов',
  'Take a few before/after pictures without photographing people unless they ask.':'Сделать несколько кадров до/после, не фотографируя людей без их просьбы.',
  'Coffee table was ready':'Стол с кофе был готов',
  'Fatima set up coffee and cups before the first visitors arrived.':'Fatima подготовила кофе и чашки до прихода первых посетителей.',
  'Photo recap published':'Фотоотчёт опубликован',
  'I selected six before/after pictures and shared them with the repair circle.':'Я выбрала шесть фотографий до/после и поделилась ими с ремонтным сообществом.',
  'Dry birch. Delivery works once the group reaches 5 m³.':'Сухая берёза. Доставка возможна, когда группа набирает 5 м³.'

 },
 sv:{
  'Photography · neighbourhood help':'Fotografering · hjälp i grannskapet',
  'FOLKOOP guide. Illustrative profile and examples for learning how cooperation works.':'FOLKOOP-guide. Ett lärande exempel som visar hur samarbete fungerar.',
  'FOLKOOP guide. Welcome to my place — I use it to show how cooperation works.':'FOLKOOP-guide. Välkommen hem till mig — här visar jag hur samarbete fungerar.',
  'Plant and seed exchange':'Växt- och fröbyte i grannskapet',
  'Organize a small neighbourhood exchange of plants and seeds with roles, tasks and a work chat.':'Ordna ett litet växt- och fröbyte med roller, uppgifter och en arbetschatt.',
  'Borrow a tile cutter for the weekend':'Låna en kakelskärare över helgen',
  'Need a tile cutter for a small room repair over one weekend.':'Behöver en kakelskärare för en liten rumsrenovering över helgen.',
  'I can help with photography':'Jag kan hjälpa till med fotografering',
  'Can help photograph an item, a small event or a neighbourhood project.':'Kan hjälpa till att fotografera en sak, ett litet evenemang eller ett lokalt projekt.',
  'Alex · Example':'Alex · Exempel',
  'Repair · coordination':'Reparation · samordning',
  'Learning-space profile. Example data only.':'Lärprofil. Endast exempeldata.',
  'Carpentry · reuse':'Snickeri · återbruk',
  'Interested in neighbourhood repair and shared tools.':'Intresserad av lokal reparation och delade verktyg.',
  'Logistics · Swedish/Arabic':'Logistik · svenska/arabiska',
  'Can help with delivery planning and language exchange.':'Kan hjälpa med leveransplanering och språkutbyte.',
  'Design · facilitation':'Design · facilitering',
  'Runs small community workshops.':'Ordnar små lokala workshops.',
  'Olofstorp neighbours':'Grannar i Olofstorp',
  'Local neighbours sharing help, tools and practical coordination.':'Grannar som delar hjälp, verktyg och praktisk samordning.',
  'Göteborg language exchange':'Språkutbyte Göteborg',
  'Informal language practice, conversation tables and meetups.':'Informell språkträning, samtalsbord och träffar.',
  'Repair café this Saturday — bring one small item and we will try to fix it together.':'Reparationscafé på lördag — ta med en liten sak så försöker vi laga den tillsammans.',
  'Looking for two people for a Swedish–Russian conversation table next week.':'Söker två personer till ett svensk-ryskt samtalsbord nästa vecka.',
  'Neighbourhood repair café':'Lokalt reparationscafé',
  'Organize a small repair afternoon with tools, tasks and a work chat.':'Ordna en liten reparationseftermiddag med verktyg, uppgifter och arbetschatt.',
  'Dry firewood together':'Köp torr ved tillsammans',
  'Combine a small group order and coordinate pickup.':'Samla en mindre gruppbeställning och samordna hämtning.',
  'Borrow a drill for one evening':'Låna en borrmaskin en kväll',
  'Need a normal drill for two wall plugs.':'Behöver en vanlig borrmaskin för två fästen.',
  'I can review a CV':'Jag kan granska ett CV',
  'Can give one round of feedback in Swedish or English.':'Kan ge en omgång återkoppling på svenska eller engelska.',
  'Shared cargo bike':'Delad lastcykel',
  'Available for short local borrowing by arrangement.':'Kan lånas kort lokalt efter överenskommelse.',
  'Repair café · work chat':'Reparationscafé · arbetschatt',
  'Plant exchange · work chat':'Växtbyte · arbetschatt',
  'Confirm the exchange table':'Bekräfta bytesbordet',
  'Check that the exchange table is available on Saturday 13:00–16:00.':'Kontrollera att bytesbordet är tillgängligt på lördag 13:00–16:00.',
  'todo · Confirm the exchange table':'Att göra · Bekräfta bytesbordet',
  'I can bring hand tools and a folding table.':'Jag kan ta med handverktyg och ett fällbord.',
  'I made a simple sign for the entrance. We still need someone for coffee.':'Jag gjorde en enkel skylt till entrén. Vi behöver fortfarande någon som ordnar kaffe.',
  'I can help collect the firewood if the pickup is after 17:00.':'Jag kan hjälpa till att hämta veden om det blir efter 17:00.',
  'Confirm the room':'Bekräfta lokalen',
  'Ask whether the community room is free on Saturday 13:00–16:00.':'Fråga om lokalen är ledig på lördag 13:00–16:00.',
  'Prepare a small sign':'Gör en liten skylt',
  'Simple A4 entrance sign.':'Enkel A4-skylt till entrén.',
  'Can collect after work':'Kan hämta efter jobbet',
  'Need delivery help':'Behöver hjälp med leverans',
  'Delivery after 17:00 works for our group.':'Leverans efter 17:00 passar vår grupp.',
  'todo · Confirm the room':'Att göra · Bekräfta lokalen',
  'Entrance sign ready':'Entréskylten är klar',
  'Entrance sign is ready. I will bring tape and markers.':'Entréskylten är klar. Jag tar med tejp och pennor.',
  'Bikes · practical repair':'Cyklar · praktisk reparation',
  'We met at the repair café; he usually knows who has the right tool nearby.':'Vi träffades på reparationscafét; han vet ofta vem som har rätt verktyg i närheten.',
  'Gardening · seed saving':'Odling · fröer',
  'She came to the first plant exchange and now helps me think one season ahead.':'Hon kom till första växtbytet och hjälper mig nu att tänka en säsong framåt.',
  'Cooking · neighbourhood events':'Mat · grannträffar',
  'We met through Olofstorp neighbours; she volunteered coffee for the repair café.':'Vi träffades genom Olofstorp-grannarna; hon tog hand om kaffet till reparationscafét.',
  'Repair and reuse circle':'Reparation och återbruk',
  'People who repair small things, share tools and teach each other.':'Människor som lagar småsaker, delar verktyg och lär av varandra.',
  'Sunday walk and litter pick':'Söndagspromenad och skräpplock',
  'A low-key walk where we also collect litter along the path.':'En lugn promenad där vi samtidigt plockar skräp längs vägen.',
  'The kettle is fixed. Next time I can bring a multimeter and spare plugs.':'Vattenkokaren är lagad. Nästa gång kan jag ta med multimeter och extra kontakter.',
  'Anyone up for a short walk around Delsjön on Sunday morning?':'Någon som vill ta en kort promenad runt Delsjön på söndag morgon?',
  'Repair café afternoon':'Grannskapets reparationscafé',
  'A small repair afternoon that ended with 11 items fixed, 3 diagnosed and a list of tools to share next time.':'En liten reparationsdag som slutade med 11 lagade saker, 3 diagnostiserade och en lista på verktyg att dela nästa gång.',
  'Neighbourhood tool shelf':'Gemensam verktygshylla',
  'Turn a messy pile of rarely used tools into a labelled shelf people can actually borrow from.':'Gör en rörig hög sällan använda verktyg till en märkt hylla som folk faktiskt kan låna från.',
  'Borrowed a folding ladder':'Lånade en hopfällbar stege',
  'Needed it for one afternoon; Johan lent one and I returned it the same evening.':'Behövde den en eftermiddag; Johan lånade ut sin och jag lämnade tillbaka den samma kväll.',
  'Label the first ten tools':'Märk de första tio verktygen',
  'Start with the tools people already said they are willing to share.':'Börja med verktygen som folk redan sagt att de vill dela.',
  'Write borrowing rules in plain language':'Skriv enkla låneregler',
  'Keep it short: who has the key, how long, and what to do if something breaks.':'Kort: vem har nyckeln, hur länge och vad gör vi om något går sönder.',
  'Tool shelf · work chat':'Verktygshylla · arbetschatt',
  'I can bring the repaired kettle photos for the recap.':'Jag kan ta med bilder på den lagade vattenkokaren till sammanfattningen.',
  'I have a spare label maker we can use for the shelf.':'Jag har en extra etikettskrivare vi kan använda till hyllan.',
  'The shelf can fit by the entrance if we keep it under 90 cm wide.':'Hyllan får plats vid entrén om vi håller den under 90 cm bred.',
  'Repair café result: 11 fixed, 3 diagnosed.':'Resultat från reparationscafét: 11 lagade, 3 diagnostiserade.',
  'First shelf sketch ready':'Första skissen till hyllan är klar',
  'I drew a simple shelf layout and marked the first tool categories.':'Jag ritade en enkel hyllskiss och markerade de första verktygskategorierna.',
  'Map a quiet walking route':'Skissa en lugn promenadrutt',
  'A route with one easy meeting point and no need for a car.':'En rutt med en enkel mötesplats och inget behov av bil.',
  'Ask Sara about seed envelopes':'Fråga Sara om frökuvert',
  'She had a neat system at the last exchange.':'Hon hade ett smart system vid förra bytet.',
  'Photograph the repaired items':'Fotografera de lagade sakerna',
  'Could become a small before/after story for the community.':'Kan bli en liten före/efter-berättelse för gemenskapen.',
  'Try a monthly skill swap':'Testa ett månatligt kunskapsbyte',
  'One evening where everyone brings one thing they can teach or need help with.':'En kväll där alla tar med något de kan lära ut eller behöver hjälp med.',
  'I left the ladder by your gate. No rush — tonight is fine.':'Jag ställde stegen vid din grind. Ingen brådska — ikväll går bra.',
  'Got it, thanks. I will return it after I clean the gutter.':'Tack, jag har den. Jag lämnar tillbaka den efter att jag rensat rännan.',
  'Sunday 10:30 works for me. I can bring two grabbers for litter.':'Söndag 10:30 passar mig. Jag kan ta med två skräpplockare.',
  'Great. I will bring bags and coffee.':'Bra. Jag tar med påsar och kaffe.',
  'We should keep the first shelf tiny and learn from actual borrowing.':'Vi borde hålla första hyllan liten och lära oss av verkliga lån.',
  'Agreed. Ten tools first, then we expand only if people use them.':'Håller med. Tio verktyg först, sedan bygger vi ut om folk använder dem.',
  'Can you save me a few tomato seed envelopes?':'Kan du lägga undan några tomatfrökuvert åt mig?',
  'Yes, and I will bring labels too.':'Ja, och jag tar med etiketter också.'
,
  'Photography, neighbourhood projects, repair cafés and too many unfinished ideas.':'Fotografering, grannskapsprojekt, reparationscaféer och alldeles för många ofärdiga idéer.',
  'A local place for neighbours to exchange practical help, tools and small ideas.':'En lokal plats där grannar byter praktisk hjälp, verktyg och små idéer.',
  'Informal language practice, conversation tables and small meetups.':'Informell språkträning, samtalsbord och små träffar.',
  'We met through the firewood purchase; Omar makes pickup logistics feel simple.':'Vi lärde känna varandra genom vedköpet; Omar gör hämtningslogistiken enkel.',
  'Photographed the repair café':'Fotograferade reparationscafét',
  'Made a small photo story from the repair café so the community could see what was fixed and who helped.':'Gjorde en liten fotoberättelse från reparationscafét så gemenskapen kunde se vad som lagades och vem som hjälpte till.',
  'Set up the repair tables':'Ställ i ordning reparationsborden',
  'Create three simple stations for electrical, textile and general repair.':'Skapa tre enkla stationer för el, textil och allmän reparation.',
  'Photograph the repaired items for the recap':'Fotografera de lagade sakerna till sammanfattningen',
  'Take a few before/after pictures without photographing people unless they ask.':'Ta några före/efter-bilder utan att fotografera människor om de inte ber om det.',
  'Coffee table was ready':'Kaffebordet var klart',
  'Fatima set up coffee and cups before the first visitors arrived.':'Fatima ordnade kaffe och koppar innan de första besökarna kom.',
  'Photo recap published':'Fotosammanfattningen publicerad',
  'I selected six before/after pictures and shared them with the repair circle.':'Jag valde sex före/efter-bilder och delade dem med reparationsgruppen.',
  'Dry birch. Delivery works once the group reaches 5 m³.':'Torr björk. Leverans fungerar när gruppen når 5 m³.'

 }
};
const demoText=value=>demoLocaleCopy[lang()]?.[value]||value;

function demoSnapshot(){
 const A='00000000-0000-4000-8000-000000000002',B='00000000-0000-4000-8000-000000000003',C='00000000-0000-4000-8000-000000000004',D='00000000-0000-4000-8000-000000000005',E='00000000-0000-4000-8000-000000000006',F='00000000-0000-4000-8000-000000000007';
 const G='00000000-0000-4000-8000-000000000101',G2='00000000-0000-4000-8000-000000000102',G3='00000000-0000-4000-8000-000000000103',G4='00000000-0000-4000-8000-000000000104';
 const CHAT='00000000-0000-4000-8000-000000000201',DIRECT='00000000-0000-4000-8000-000000000202',DIRECT_A='00000000-0000-4000-8000-000000000203',WALK_CHAT='00000000-0000-4000-8000-000000000204',TOOL_CHAT='00000000-0000-4000-8000-000000000205';
 const PROJECT='00000000-0000-4000-8000-000000000301',PURCHASE='00000000-0000-4000-8000-000000000302',NEED='00000000-0000-4000-8000-000000000303',OFFER='00000000-0000-4000-8000-000000000304',RESOURCE='00000000-0000-4000-8000-000000000305',REPAIR='00000000-0000-4000-8000-000000000306',TOOLS='00000000-0000-4000-8000-000000000307',LADDER='00000000-0000-4000-8000-000000000308';
 const TASK='00000000-0000-4000-8000-000000000401',POFFER='00000000-0000-4000-8000-000000000501';
 const profiles=[
  {id:DEMO_UID,name:'Мура',city:'Göteborg',skills:demoText('Photography · neighbourhood help'),about:demoText('I like turning small neighbourhood ideas into things people can actually do together.'),connection:'',listed:true},
  {id:A,name:'Anna',skills:demoText('Carpentry · reuse'),about:demoText('Interested in neighbourhood repair and shared tools.'),connection:demoText('She came to the first plant exchange and now helps me think one season ahead.'),listed:true},
  {id:B,name:'Omar',skills:demoText('Logistics · Swedish/Arabic'),about:demoText('Can help with delivery planning and language exchange.'),connection:demoText('We met through the firewood purchase and a language exchange; Omar is good at making logistics simple.'),listed:true},
  {id:C,name:'Linnea',skills:demoText('Design · facilitation'),about:demoText('Runs small community workshops.'),connection:demoText('She came to the first plant exchange and now helps me think one season ahead.'),listed:true},
  {id:D,name:'Johan',skills:demoText('Bikes · practical repair'),about:demoText('We met at the repair café; he usually knows who has the right tool nearby.'),connection:demoText('We met at the repair café; he usually knows who has the right tool nearby.'),listed:true},
  {id:E,name:'Sara',skills:demoText('Gardening · seed saving'),about:demoText('She came to the first plant exchange and now helps me think one season ahead.'),connection:demoText('She came to the first plant exchange and now helps me think one season ahead.'),listed:true},
  {id:F,name:'Fatima',skills:demoText('Cooking · neighbourhood events'),about:demoText('We met through Olofstorp neighbours; she volunteered coffee for the repair café.'),connection:demoText('We met through Olofstorp neighbours; she volunteered coffee for the repair café.'),listed:true}
 ];
 const groups=[
  {id:G,owner_id:A,name:demoText('Olofstorp neighbours'),description:demoText('Local neighbours sharing help, tools and practical coordination.')},
  {id:G2,owner_id:C,name:demoText('Göteborg language exchange'),description:demoText('Informal language practice, conversation tables and meetups.')},
  {id:G3,owner_id:D,name:demoText('Repair and reuse circle'),description:demoText('People who repair small things, share tools and teach each other.')},
  {id:G4,owner_id:E,name:demoText('Sunday walk and litter pick'),description:demoText('A low-key walk where we also collect litter along the path.')}
 ];
 const allPosts=[
  {id:'00000000-0000-4000-8000-000000000601',community_id:G,author_id:A,body:demoText('Repair café this Saturday — bring one small item and we will try to fix it together.'),created_at:'2026-09-30T07:30:00Z'},
  {id:'00000000-0000-4000-8000-000000000602',community_id:G2,author_id:C,body:demoText('Looking for two people for a Swedish–Russian conversation table next week.'),created_at:'2026-09-29T18:20:00Z'},
  {id:'00000000-0000-4000-8000-000000000603',community_id:G3,author_id:D,body:demoText('The kettle is fixed. Next time I can bring a multimeter and spare plugs.'),created_at:'2026-09-30T19:10:00Z'},
  {id:'00000000-0000-4000-8000-000000000604',community_id:G4,author_id:E,body:demoText('Anyone up for a short walk around Delsjön on Sunday morning?'),created_at:'2026-10-01T07:40:00Z'}
 ];
 const cooperations=[
  {id:PROJECT,owner_id:DEMO_UID,kind:'project',title:demoText('Plant and seed exchange'),description:demoText('Organize a small neighbourhood exchange of plants and seeds with roles, tasks and a work chat.'),location_text:'Olofstorp',status:'active',target_quantity:null,unit:'',created_at:'2026-09-28T10:00:00Z',updated_at:'2026-09-30T08:30:00Z'},
  {id:PURCHASE,owner_id:A,kind:'purchase',title:demoText('Dry firewood together'),description:demoText('Combine a small group order and coordinate pickup.'),location_text:'Göteborg',status:'active',target_quantity:10,unit:'m³',created_at:'2026-09-27T09:00:00Z',updated_at:'2026-09-30T08:15:00Z'},
  {id:NEED,owner_id:DEMO_UID,kind:'need',title:demoText('Borrow a tile cutter for the weekend'),description:demoText('Need a tile cutter for a small room repair over one weekend.'),location_text:'Olofstorp',status:'open',target_quantity:null,unit:'',created_at:'2026-09-29T15:00:00Z',updated_at:'2026-09-29T15:00:00Z'},
  {id:OFFER,owner_id:DEMO_UID,kind:'offer',title:demoText('I can help with photography'),description:demoText('Can help photograph an item, a small event or a neighbourhood project.'),location_text:'Göteborg',status:'open',target_quantity:null,unit:'',created_at:'2026-09-29T12:00:00Z',updated_at:'2026-09-29T12:00:00Z'},
  {id:RESOURCE,owner_id:A,kind:'resource',title:demoText('Shared cargo bike'),description:demoText('Available for short local borrowing by arrangement.'),location_text:'Olofstorp',status:'open',target_quantity:null,unit:'',created_at:'2026-09-28T16:00:00Z',updated_at:'2026-09-29T11:00:00Z'},
  {id:REPAIR,owner_id:D,kind:'project',title:demoText('Repair café afternoon'),description:demoText('A small repair afternoon that ended with 11 items fixed, 3 diagnosed and a list of tools to share next time.'),location_text:'Olofstorp',status:'done',target_quantity:null,unit:'',created_at:'2026-09-20T10:00:00Z',updated_at:'2026-09-27T17:30:00Z'},
  {id:TOOLS,owner_id:DEMO_UID,kind:'project',title:demoText('Neighbourhood tool shelf'),description:demoText('Turn a messy pile of rarely used tools into a labelled shelf people can actually borrow from.'),location_text:'Olofstorp',status:'active',target_quantity:null,unit:'',created_at:'2026-09-30T16:00:00Z',updated_at:'2026-10-01T07:20:00Z'},
  {id:LADDER,owner_id:DEMO_UID,kind:'need',title:demoText('Borrowed a folding ladder'),description:demoText('Needed it for one afternoon; Johan lent one and I returned it the same evening.'),location_text:'Olofstorp',status:'done',target_quantity:null,unit:'',created_at:'2026-09-22T09:00:00Z',updated_at:'2026-09-22T19:00:00Z'}
 ];
 const coopMembers=[
  {cooperation_id:PROJECT,user_id:DEMO_UID,role:'owner',joined_at:'2026-09-28T10:00:00Z'},
  {cooperation_id:PROJECT,user_id:A,role:'member',joined_at:'2026-09-28T11:00:00Z'},
  {cooperation_id:PROJECT,user_id:C,role:'member',joined_at:'2026-09-28T12:00:00Z'},
  {cooperation_id:PROJECT,user_id:E,role:'member',joined_at:'2026-09-29T09:00:00Z'},
  {cooperation_id:PURCHASE,user_id:A,role:'owner',joined_at:'2026-09-27T09:00:00Z'},
  {cooperation_id:PURCHASE,user_id:DEMO_UID,role:'member',joined_at:'2026-09-27T10:00:00Z'},
  {cooperation_id:PURCHASE,user_id:B,role:'member',joined_at:'2026-09-27T10:30:00Z'},
  {cooperation_id:REPAIR,user_id:D,role:'owner',joined_at:'2026-09-20T10:00:00Z'},
  {cooperation_id:REPAIR,user_id:DEMO_UID,role:'member',joined_at:'2026-09-20T10:20:00Z'},
  {cooperation_id:REPAIR,user_id:F,role:'member',joined_at:'2026-09-20T10:30:00Z'},
  {cooperation_id:TOOLS,user_id:DEMO_UID,role:'owner',joined_at:'2026-09-30T16:00:00Z'},
  {cooperation_id:TOOLS,user_id:D,role:'member',joined_at:'2026-09-30T16:30:00Z'},
  {cooperation_id:TOOLS,user_id:A,role:'member',joined_at:'2026-09-30T17:00:00Z'},
  {cooperation_id:LADDER,user_id:DEMO_UID,role:'owner',joined_at:'2026-09-22T09:00:00Z'},
  {cooperation_id:LADDER,user_id:D,role:'member',joined_at:'2026-09-22T09:10:00Z'}
 ];
 const chats=[
  {id:CHAT,kind:'group',owner_id:DEMO_UID,title:demoText('Plant exchange · work chat'),created_at:'2026-09-28T10:00:00Z'},
  {id:DIRECT,kind:'direct',owner_id:DEMO_UID,title:'',created_at:'2026-09-29T14:00:00Z'},
  {id:DIRECT_A,kind:'direct',owner_id:DEMO_UID,title:'',created_at:'2026-09-22T08:50:00Z'},
  {id:WALK_CHAT,kind:'group',owner_id:E,title:demoText('Sunday walk and litter pick'),created_at:'2026-10-01T07:45:00Z'},
  {id:TOOL_CHAT,kind:'group',owner_id:DEMO_UID,title:demoText('Tool shelf · work chat'),created_at:'2026-09-30T16:00:00Z'}
 ];
 const chatMembers=[
  {conversation_id:CHAT,user_id:DEMO_UID,role:'owner',joined_at:'2026-09-28T10:00:00Z',last_read_at:'2026-09-30T07:00:00Z'},
  {conversation_id:CHAT,user_id:A,role:'member',joined_at:'2026-09-28T11:00:00Z',last_read_at:'2026-09-30T07:20:00Z'},
  {conversation_id:CHAT,user_id:C,role:'member',joined_at:'2026-09-28T12:00:00Z',last_read_at:'2026-09-30T07:10:00Z'},
  {conversation_id:DIRECT,user_id:DEMO_UID,role:'member',joined_at:'2026-09-29T14:00:00Z',last_read_at:'2026-09-29T14:10:00Z'},
  {conversation_id:DIRECT,user_id:B,role:'member',joined_at:'2026-09-29T14:00:00Z',last_read_at:'2026-09-29T14:10:00Z'},
  {conversation_id:DIRECT_A,user_id:DEMO_UID,role:'member',joined_at:'2026-09-22T08:50:00Z',last_read_at:'2026-09-22T18:40:00Z'},
  {conversation_id:DIRECT_A,user_id:D,role:'member',joined_at:'2026-09-22T08:50:00Z',last_read_at:'2026-09-22T18:40:00Z'},
  {conversation_id:WALK_CHAT,user_id:DEMO_UID,role:'member',joined_at:'2026-10-01T07:45:00Z',last_read_at:'2026-10-01T08:10:00Z'},
  {conversation_id:WALK_CHAT,user_id:E,role:'owner',joined_at:'2026-10-01T07:45:00Z',last_read_at:'2026-10-01T08:10:00Z'},
  {conversation_id:WALK_CHAT,user_id:F,role:'member',joined_at:'2026-10-01T07:50:00Z',last_read_at:'2026-10-01T08:10:00Z'},
  {conversation_id:TOOL_CHAT,user_id:DEMO_UID,role:'owner',joined_at:'2026-09-30T16:00:00Z',last_read_at:'2026-10-01T07:10:00Z'},
  {conversation_id:TOOL_CHAT,user_id:D,role:'member',joined_at:'2026-09-30T16:30:00Z',last_read_at:'2026-10-01T07:10:00Z'},
  {conversation_id:TOOL_CHAT,user_id:A,role:'member',joined_at:'2026-09-30T17:00:00Z',last_read_at:'2026-10-01T07:10:00Z'}
 ];
 const allMessages=[
  {id:'00000000-0000-4000-8000-000000000701',conversation_id:CHAT,author_id:A,body:demoText('I can bring hand tools and a folding table.'),created_at:'2026-09-30T07:20:00Z'},
  {id:'00000000-0000-4000-8000-000000000702',conversation_id:CHAT,author_id:C,body:demoText('I made a simple sign for the entrance. We still need someone for coffee.'),created_at:'2026-09-30T07:45:00Z'},
  {id:'00000000-0000-4000-8000-000000000703',conversation_id:DIRECT,author_id:B,body:demoText('I can help collect the firewood if the pickup is after 17:00.'),created_at:'2026-09-29T14:12:00Z'},
  {id:'00000000-0000-4000-8000-000000000704',conversation_id:DIRECT_A,author_id:D,body:demoText('I left the ladder by your gate. No rush — tonight is fine.'),created_at:'2026-09-22T09:05:00Z'},
  {id:'00000000-0000-4000-8000-000000000705',conversation_id:DIRECT_A,author_id:DEMO_UID,body:demoText('Got it, thanks. I will return it after I clean the gutter.'),created_at:'2026-09-22T09:12:00Z'},
  {id:'00000000-0000-4000-8000-000000000706',conversation_id:WALK_CHAT,author_id:E,body:demoText('Sunday 10:30 works for me. I can bring two grabbers for litter.'),created_at:'2026-10-01T07:50:00Z'},
  {id:'00000000-0000-4000-8000-000000000707',conversation_id:WALK_CHAT,author_id:DEMO_UID,body:demoText('Great. I will bring bags and coffee.'),created_at:'2026-10-01T08:00:00Z'},
  {id:'00000000-0000-4000-8000-000000000708',conversation_id:TOOL_CHAT,author_id:D,body:demoText('We should keep the first shelf tiny and learn from actual borrowing.'),created_at:'2026-09-30T17:20:00Z'},
  {id:'00000000-0000-4000-8000-000000000709',conversation_id:TOOL_CHAT,author_id:DEMO_UID,body:demoText('Agreed. Ten tools first, then we expand only if people use them.'),created_at:'2026-09-30T17:28:00Z'},
  {id:'00000000-0000-4000-8000-000000000710',conversation_id:CHAT,author_id:E,body:demoText('Can you save me a few tomato seed envelopes?'),created_at:'2026-09-30T08:05:00Z'},
  {id:'00000000-0000-4000-8000-000000000711',conversation_id:CHAT,author_id:DEMO_UID,body:demoText('Yes, and I will bring labels too.'),created_at:'2026-09-30T08:12:00Z'}
 ];
 const tasks=[
  {id:TASK,cooperation_id:PROJECT,creator_id:A,assignee_id:DEMO_UID,title:demoText('Confirm the exchange table'),details:demoText('Check that the exchange table is available on Saturday 13:00–16:00.'),status:'todo',created_at:'2026-09-29T08:00:00Z',updated_at:'2026-09-30T08:00:00Z'},
  {id:'00000000-0000-4000-8000-000000000402',cooperation_id:PROJECT,creator_id:DEMO_UID,assignee_id:C,title:demoText('Prepare a small sign'),details:demoText('Simple A4 entrance sign.'),status:'done',created_at:'2026-09-28T14:00:00Z',updated_at:'2026-09-29T18:00:00Z'},
  {id:'00000000-0000-4000-8000-000000000403',cooperation_id:TOOLS,creator_id:DEMO_UID,assignee_id:D,title:demoText('Label the first ten tools'),details:demoText('Start with the tools people already said they are willing to share.'),status:'doing',created_at:'2026-09-30T17:00:00Z',updated_at:'2026-10-01T07:10:00Z'},
  {id:'00000000-0000-4000-8000-000000000404',cooperation_id:TOOLS,creator_id:DEMO_UID,assignee_id:A,title:demoText('Write borrowing rules in plain language'),details:demoText('Keep it short: who has the key, how long, and what to do if something breaks.'),status:'todo',created_at:'2026-09-30T17:05:00Z',updated_at:'2026-10-01T07:00:00Z'}
 ];
 const commitments=[
  {cooperation_id:PURCHASE,user_id:DEMO_UID,quantity:2,note:demoText('Can collect after work')},
  {cooperation_id:PURCHASE,user_id:A,quantity:4,note:''},
  {cooperation_id:PURCHASE,user_id:B,quantity:2,note:demoText('Need delivery help')}
 ];
 const purchaseOffers=[{id:POFFER,cooperation_id:PURCHASE,provider_id:B,unit_price:820,currency:'SEK',min_quantity:5,available_quantity:12,delivery_mode:'delivery',delivery_fee:450,lead_time_days:3,valid_until:'2026-10-04',note:demoText('Delivery after 17:00 works for our group.')}];
 const activity=[
  {cooperation_id:PROJECT,cooperation_kind:'project',cooperation_title:demoText('Plant and seed exchange'),unread_count:2,last_activity_at:'2026-09-30T08:30:00Z',last_event_type:'task_updated',last_actor_id:A,last_label:demoText('todo · Confirm the exchange table')},
  {cooperation_id:PURCHASE,cooperation_kind:'purchase',cooperation_title:demoText('Dry firewood together'),unread_count:1,last_activity_at:'2026-09-30T08:15:00Z',last_event_type:'confirmation_changed',last_actor_id:A,last_label:'confirmed'},
  {cooperation_id:TOOLS,cooperation_kind:'project',cooperation_title:demoText('Neighbourhood tool shelf'),unread_count:1,last_activity_at:'2026-10-01T07:20:00Z',last_event_type:'update_posted',last_actor_id:DEMO_UID,last_label:demoText('First shelf sketch ready')},
  {cooperation_id:REPAIR,cooperation_kind:'project',cooperation_title:demoText('Repair café afternoon'),unread_count:0,last_activity_at:'2026-09-27T17:30:00Z',last_event_type:'update_posted',last_actor_id:D,last_label:demoText('Repair café result: 11 fixed, 3 diagnosed.')}
 ];
 const coopActivity=[
  {cooperation_id:PROJECT,event_type:'task_updated',actor_id:A,label:demoText('todo · Confirm the exchange table'),created_at:'2026-09-30T08:30:00Z'},
  {cooperation_id:PROJECT,event_type:'update_posted',actor_id:C,label:demoText('Entrance sign ready'),created_at:'2026-09-29T18:00:00Z'},
  {cooperation_id:PURCHASE,event_type:'confirmation_changed',actor_id:A,label:'confirmed',created_at:'2026-09-30T08:15:00Z'},
  {cooperation_id:TOOLS,event_type:'update_posted',actor_id:DEMO_UID,label:demoText('First shelf sketch ready'),created_at:'2026-10-01T07:20:00Z'},
  {cooperation_id:REPAIR,event_type:'update_posted',actor_id:D,label:demoText('Repair café result: 11 fixed, 3 diagnosed.'),created_at:'2026-09-27T17:30:00Z'}
 ];
 const updates=[
  {id:'00000000-0000-4000-8000-000000000801',cooperation_id:PROJECT,author_id:C,body:demoText('Entrance sign is ready. I will bring tape and markers.'),created_at:'2026-09-29T18:00:00Z'},
  {id:'00000000-0000-4000-8000-000000000802',cooperation_id:TOOLS,author_id:DEMO_UID,body:demoText('I drew a simple shelf layout and marked the first tool categories.'),created_at:'2026-10-01T07:20:00Z'},
  {id:'00000000-0000-4000-8000-000000000803',cooperation_id:REPAIR,author_id:D,body:demoText('Repair café result: 11 fixed, 3 diagnosed.'),created_at:'2026-09-27T17:30:00Z'}
 ];
  const localDrafts=[
   {id:'mura-draft-need',kind:'need',title:demoText('Borrow a drill for one evening'),body:demoText('Need a normal drill for two wall plugs.'),done:false},
   {id:'mura-draft-offer',kind:'offer',title:demoText('I can review a CV'),body:demoText('Can give one round of feedback in Swedish or English.'),done:false},
   {id:'mura-draft-walk',kind:'project',title:demoText('Map a quiet walking route'),body:demoText('A route with one easy meeting point and no need for a car.'),done:false},
   {id:'mura-draft-seeds',kind:'need',title:demoText('Ask Sara about seed envelopes'),body:demoText('She had a neat system at the last exchange.'),done:false},
   {id:'mura-draft-photo',kind:'offer',title:demoText('Photograph the repaired items'),body:demoText('Could become a small before/after story for the community.'),done:false},
   {id:'mura-draft-skill',kind:'project',title:demoText('Try a monthly skill swap'),body:demoText('One evening where everyone brings one thing they can teach or need help with.'),done:false}
  ];
 const base={
  profile:profiles[0],localDrafts,directory:profiles,chatProfiles:profiles,groups,memberships:[{community_id:G,user_id:DEMO_UID,banned:false},{community_id:G2,user_id:DEMO_UID,banned:false},{community_id:G3,user_id:DEMO_UID,banned:false},{community_id:G4,user_id:DEMO_UID,banned:false}],blocks:[],
  chats,chatMembers,chatInvites:[],chatInbox:[{conversation_id:CHAT,unread_count:2,last_message_at:'2026-09-30T08:12:00Z',linked_cooperation_id:PROJECT},{conversation_id:DIRECT,unread_count:1,last_message_at:'2026-09-29T14:12:00Z',linked_cooperation_id:null},{conversation_id:DIRECT_A,unread_count:0,last_message_at:'2026-09-22T09:12:00Z',linked_cooperation_id:null},{conversation_id:WALK_CHAT,unread_count:1,last_message_at:'2026-10-01T08:00:00Z',linked_cooperation_id:null},{conversation_id:TOOL_CHAT,unread_count:1,last_message_at:'2026-09-30T17:28:00Z',linked_cooperation_id:TOOLS}],
  cooperations,coopMembers,coopChats:[{cooperation_id:PROJECT,conversation_id:CHAT,created_at:'2026-09-28T10:00:00Z'},{cooperation_id:TOOLS,conversation_id:TOOL_CHAT,created_at:'2026-09-30T16:00:00Z'}],activityInbox:activity,
  homePosts:allPosts,assignedTasks:tasks.filter(x=>x.assignee_id===DEMO_UID&&x.status!=='done'),
  myConfirmations:[{cooperation_id:PURCHASE,user_id:DEMO_UID,quantity:2,decision:'pending',note:'',decided_at:null,collected_at:null,collected_note:'',updated_at:'2026-09-30T08:10:00Z'}],
  allProcesses:[{cooperation_id:PURCHASE,stage:'confirming',confirmation_deadline:'2026-10-01T18:00:00Z',external_order_reference:'',ordered_at:null,expected_delivery_at:null,delivery_note:'',delivered_at:null,pickup_place:'',pickup_start:null,pickup_end:null,result_note:'',finished_at:null,updated_at:'2026-09-30T08:10:00Z'}]
 };
 const chosen=selectedCoop;
 return {...base,
  posts:allPosts.filter(x=>!selected||x.community_id===selected),
  chatMessages:allMessages.filter(x=>!selectedChat||x.conversation_id===selectedChat),
  coopUpdates:updates.filter(x=>!chosen||x.cooperation_id===chosen),
  projectTasks:tasks.filter(x=>!chosen||x.cooperation_id===chosen),
  commitments:commitments.filter(x=>!chosen||x.cooperation_id===chosen),
  purchaseOffers:chosen===PURCHASE?purchaseOffers:[],
  purchaseChoice:chosen===PURCHASE?[{cooperation_id:PURCHASE,offer_id:POFFER,selected_by:A,selected_at:'2026-09-30T07:50:00Z'}]:[],
  purchaseProcess:chosen===PURCHASE?[base.allProcesses[0]]:[],
  purchaseConfirmations:chosen===PURCHASE?[{cooperation_id:PURCHASE,user_id:DEMO_UID,quantity:2,decision:'pending',note:'',decided_at:null,collected_at:null,collected_note:'',updated_at:'2026-09-30T08:10:00Z'},{cooperation_id:PURCHASE,user_id:A,quantity:4,decision:'confirmed',note:'',decided_at:'2026-09-30T08:05:00Z',collected_at:null,collected_note:'',updated_at:'2026-09-30T08:05:00Z'}]:[],
  coopActivity:coopActivity.filter(x=>!chosen||x.cooperation_id===chosen)
 };
}
function guestRequireAccount(){
 notice=ht('demoText');
 render();
}

function navigateNetwork(hash){internalHash=hash;location.hash=hash;}
const btn=(action,label,id='')=>`<button class="button secondary" type="button" data-net="${action}" data-id="${esc(id)}">${esc(t(label))}</button>`;
const field=(name,label,value='',max=100,area=false)=>`<label>${esc(t(label))}${area?`<textarea name="${name}" maxlength="${max}" rows="3">${esc(value)}</textarea>`:`<input name="${name}" maxlength="${max}" value="${esc(value)}"${name==='name'?' required':''}>`}</label>`;
const mt=k=>muraText('chat',k)??(chatCopy[lang()][k]||chatCopy.en[k]||k);
const ct=k=>muraText('coop',k)??(coopCopy[lang()][k]||coopCopy.en[k]||k);
const ot=k=>muraText('offer',k)??(offerCopy[lang()][k]||offerCopy.en[k]||k);
const lt=k=>lifecycleCopy[lang()][k]||lifecycleCopy.en[k]||k;
const at=k=>activityCopy[lang()][k]||activityCopy.en[k]||k;
const ht=k=>muraText('home',k)??(homeCopy[lang()][k]||homeCopy.en[k]||k);
const st=k=>globalThis.FolkoopCopy?.COPY?.[lang()]?.[k]||globalThis.FolkoopCopy?.COPY?.en?.[k]||k;
const abtn=(action,key,id='')=>`<button class="button secondary" type="button" data-coop="${action}" data-id="${esc(id)}">${esc(at(key))}</button>`;

function localDateTime(value){
 if(!value)return '';
 const d=new Date(value);if(!Number.isFinite(d.getTime()))return '';
 const pad=n=>String(n).padStart(2,'0');
 return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'T'+pad(d.getHours())+':'+pad(d.getMinutes());
}

function formatWhen(value){
 if(!value)return '';
 const d=new Date(value);if(!Number.isFinite(d.getTime()))return '';
 try{return new Intl.DateTimeFormat(lang(),{dateStyle:'medium',timeStyle:'short'}).format(d);}
 catch{return d.toISOString().slice(0,16).replace('T',' ');}
}

const cbtn=(action,key,id='')=>`<button class="button secondary" type="button" data-coop="${action}" data-id="${esc(id)}">${esc(ct(key))}</button>`;
const obtn=(action,key,id='')=>`<button class="button secondary" type="button" data-coop="${action}" data-id="${esc(id)}">${esc(ot(key))}</button>`;
const coopProfile=id=>data.chatProfiles.find(p=>p.id===id)||data.directory.find(p=>p.id===id);
const kindLabel=k=>ct(k);
const statusLabel=s=>ct(({open:'openStatus',active:'activeStatus',done:'doneStatus',cancelled:'cancelledStatus'})[s]||s);
const activityDomain=globalThis.FolkoopNetworkActivity.create({
 escape:esc,
 getData:()=>data,
 getCurrentUser:currentUser,
 getProfile:coopProfile,
 activityText:at,
 lifecycleText:lt,
 chatText:mt,
 cooperationText:ct,
 kindLabel,
 formatWhen,
 button:abtn,
 documentRef:document
});
const {activityLabel,syncBadges,renderNotifications:renderActivityNotifications}=activityDomain;

const profileFor=id=>data.chatProfiles.find(p=>p.id===id)||data.directory.find(p=>p.id===id);
const messagingDomain=globalThis.FolkoopNetworkMessaging.create({
 escape:esc,
 getData:()=>data,
 getProfile:profileFor,
 generalText:t,
 chatText:mt,
 activityText:at,
 formatWhen,
 networkButton:btn,
 activityButton:abtn
});

const profileDomain=globalThis.FolkoopNetworkProfile.create({
 escape:esc,
 getData:()=>data,
 text:t,
 homeText:ht,
 shellText:st,
 field,
 button:btn,
 renderActivityNotifications
});

const communitiesDomain=globalThis.FolkoopNetworkCommunities.create({
 escape:esc,
 getData:()=>data,
 getProfile:profileFor,
 text:t,
 field,
 button:btn
});

const muraHomeDomain=globalThis.FolkoopMuraHome.create({
 escape:esc,
 getData:()=>data,
 getProfile:profileFor,
 kindLabel,
 statusLabel,
 formatWhen
});

function renderMuraPeople(u){
 const people=data.directory.filter(p=>p.id!==u.id);
 const card=p=>{
  const coopTitles=data.coopMembers.filter(m=>m.user_id===p.id).map(m=>data.cooperations.find(x=>x.id===m.cooperation_id)?.title).filter(Boolean).slice(0,2);
  const chatTitles=data.chatMembers.filter(m=>m.user_id===p.id).map(m=>data.chats.find(x=>x.id===m.conversation_id)).filter(Boolean).map(chat=>chat.kind==='direct'?mt('direct'):chat.title).slice(0,1);
  return `<article class="card mura-person-page-card" data-demo-story="person"><div class="mura-person-page-head"><span class="mura-avatar" aria-hidden="true">${esc((p.name||'?').slice(0,1))}</span><div><h3>${esc(p.name)}</h3><p class="meta">${esc(p.skills||'')}</p></div></div><p>${esc(p.connection||p.about||'')}</p><div class="mura-connection-chips">${coopTitles.map(x=>`<span>${esc(x)}</span>`).join('')}${chatTitles.map(x=>`<span>${esc(x)}</span>`).join('')}</div></article>`;
 };
 const intro=lang()==='ru'?'Не список контактов, а люди, с которыми меня уже связывает дело, место или разговор.':lang()==='sv'?'Inte en kontaktlista, utan människor jag redan delar ett projekt, en plats eller ett samtal med.':'Not a contact list: people I already share a project, place or conversation with.';
 return `<section class="mura-people-page"><div class="mura-section-head"><div><p class="eyebrow">MURA / PEOPLE</p><h2>${esc(t('directory'))}</h2></div><p>${esc(intro)}</p></div><div class="mura-people-page-grid">${people.map(card).join('')}</div></section>`;
}

function renderHome(u){
 const unreadMessages=data.chatInbox.reduce((a,x)=>a+Number(x.unread_count||0),0);
 const invites=data.chatInvites.filter(x=>x.user_id===u.id).length;
 const pendingConfirmations=data.myConfirmations.filter(x=>x.decision==='pending').map(x=>({confirmation:x,process:data.allProcesses.find(p=>p.cooperation_id===x.cooperation_id),coop:data.cooperations.find(c=>c.id===x.cooperation_id)})).filter(x=>x.process?.stage==='confirming'&&x.coop);
 const assigned=data.assignedTasks.filter(x=>x.status!=='done').map(x=>({...x,coop:data.cooperations.find(c=>c.id===x.cooperation_id)})).filter(x=>x.coop);
 const unreadActivity=data.activityInbox.filter(x=>Number(x.unread_count||0)>0);
 const attention=[];
 pendingConfirmations.forEach(x=>attention.push({type:'confirmation',title:x.coop.title,meta:(x.process.confirmation_deadline?ht('deadline')+': '+formatWhen(x.process.confirmation_deadline):'')+' · '+x.confirmation.quantity+' '+(x.coop.unit||''),coop:x.coop}));
 assigned.slice(0,5).forEach(x=>attention.push({type:'task',title:x.title,meta:x.coop.title+' · '+ct(x.status),coop:x.coop}));
 if(unreadMessages)attention.push({type:'messages',title:ht('messages')+' · '+unreadMessages,meta:'',route:'messages'});
 if(invites)attention.push({type:'invitations',title:ht('invitations')+' · '+invites,meta:'',route:'messages'});
 unreadActivity.slice(0,4).forEach(x=>attention.push({type:'activity',title:x.cooperation_title,meta:ht('activity')+' · '+x.unread_count,coop:data.cooperations.find(c=>c.id===x.cooperation_id)}));

 const memberIds=new Set(data.coopMembers.filter(m=>m.user_id===u.id).map(m=>m.cooperation_id));
 const unreadByCoop=new Map(data.activityInbox.map(x=>[x.cooperation_id,Number(x.unread_count||0)]));
 const active=data.cooperations
  .filter(x=>memberIds.has(x.id)&&['open','active'].includes(x.status))
  .sort((a,b)=>(unreadByCoop.get(b.id)||0)-(unreadByCoop.get(a.id)||0)||Date.parse(b.updated_at||b.created_at||0)-Date.parse(a.updated_at||a.created_at||0))
  .slice(0,8);

 const feed=[];
 data.activityInbox.filter(x=>x.last_activity_at).forEach(x=>feed.push({kind:'activity',time:x.last_activity_at,coop:data.cooperations.find(c=>c.id===x.cooperation_id),title:x.cooperation_title,event:x}));
 data.homePosts.forEach(p=>feed.push({kind:'post',time:p.created_at,post:p,group:data.groups.find(g=>g.id===p.community_id)}));
 feed.sort((a,b)=>Date.parse(b.time||0)-Date.parse(a.time||0));

 const actionCard=item=>{
  if(item.route)return `<article class="card home-attention-card"><span class="badge">${esc(ht(item.type))}</span><h3>${esc(item.title)}</h3>${item.meta?`<p class="meta">${esc(item.meta)}</p>`:''}<a class="button secondary" href="#/${item.route}">${esc(ht('open'))}</a></article>`;
  const coop=item.coop;
  if(!coop)return '';
  return `<article class="card home-attention-card"><span class="badge">${esc(ht(item.type))}</span><h3>${esc(item.title)}</h3>${item.meta?`<p class="meta">${esc(item.meta)}</p>`:''}<button class="button secondary" type="button" data-home="openCoop" data-id="${esc(coop.id)}">${esc(ht('open'))}</button></article>`;
 };
 const focusCard=item=>{
  if(!item)return `<article class="card home-daily-focus home-daily-clear"><span class="badge">${esc(ht('daily'))}</span><h2>${esc(ht('caughtUp'))}</h2><p class="meta">${esc(ht('why'))}</p></article>`;
  if(item.route)return `<article class="card home-daily-focus"><div class="row"><span class="badge">${esc(ht('daily'))}</span><span class="meta">${esc(ht('nextStep'))}</span></div><h2>${esc(item.title)}</h2>${item.meta?`<p class="meta">${esc(item.meta)}</p>`:''}<a class="button" href="#/${item.route}">${esc(ht('open'))}</a></article>`;
  const coop=item.coop;
  if(!coop)return '';
  return `<article class="card home-daily-focus"><div class="row"><span class="badge">${esc(ht('daily'))}</span><span class="meta">${esc(ht('nextStep'))}</span></div><h2>${esc(item.title)}</h2>${item.meta?`<p class="meta">${esc(item.meta)}</p>`:''}<button class="button" type="button" data-home="openCoop" data-id="${esc(coop.id)}">${esc(ht('open'))}</button></article>`;
 };
 const feedCard=item=>{
  if(item.kind==='post'){
   const author=profileFor(item.post.author_id)?.name||t('by');
   return `<article class="card home-feed-card"><span class="badge">${esc(ht('communityPost'))}</span><h3>${esc(item.group?.name||t('groups'))}</h3><p style="white-space:pre-wrap">${esc(item.post.body)}</p><p class="meta">${esc(ht('from'))} ${esc(author)} · ${esc(formatWhen(item.post.created_at))}</p>${item.group?`<button class="text-button" type="button" data-home="openCommunity" data-id="${esc(item.group.id)}">${esc(ht('open'))}</button>`:''}</article>`;
  }
  const e=item.event,coop=item.coop;
  const line=activityLabel({actor_id:e.last_actor_id,event_type:e.last_event_type,label:e.last_label},u);
  return `<article class="card home-feed-card"><span class="badge">${esc(coop?kindLabel(coop.kind):ht('activity'))}</span><h3>${esc(item.title)}</h3><p>${esc(line)}</p><p class="meta">${esc(formatWhen(e.last_activity_at))}</p>${coop?`<button class="text-button" type="button" data-home="openCoop" data-id="${esc(coop.id)}">${esc(ht('open'))}</button>`:''}</article>`;
 };

 const primary=attention[0]||(active[0]?{type:'activity',title:active[0].title,meta:statusLabel(active[0].status),coop:active[0]}:null);
 const remainingAttention=attention.slice(primary&&attention[0]===primary?1:0);
 const feedItems=feed.slice(0,12);

 const view=currentSubsection('home');
 const header=`<div class="row"><div><p class="eyebrow">FOLKOOP</p><h1>${esc(ht('title'))}</h1><p class="home-subtitle">${esc(ht('subtitle'))}</p></div>${btn('refresh','refresh')}</div>`;
 const overview=`<section class="home-daily">${focusCard(primary)}</section><section class="home-section"><h2>${esc(ht('myWork'))}</h2><div class="draft-grid">${active.map(x=>`<article class="card"><span class="badge">${esc(kindLabel(x.kind))}</span><h3>${esc(x.title)}</h3><p class="meta">${esc(statusLabel(x.status))} · ${esc(x.location_text||'')}</p><button class="text-button" type="button" data-home="openCoop" data-id="${esc(x.id)}">${esc(ht('open'))}</button></article>`).join('')||`<div class="empty"><p>${esc(ht('noFeed'))}</p></div>`}</div></section>`;
 const attentionItems=attention.length?attention:[];
 const attentionView=`<section class="home-section"><div class="row"><h2>${esc(ht('attention'))}</h2><span class="meta">${esc(ht('why'))}</span></div><div class="home-attention-grid">${attentionItems.map(actionCard).join('')||`<div class="empty"><p>${esc(ht('nothingUrgent'))}</p></div>`}</div></section>`;
 const actionsView=`<section class="home-section"><h2>${esc(ht('quick'))}</h2><div class="quick-grid home-quick"><button class="quick" type="button" data-home="createCoop" data-kind="need">${esc(ht('need'))}<span aria-hidden="true">＋</span></button><button class="quick" type="button" data-home="createCoop" data-kind="offer">${esc(ht('offer'))}<span aria-hidden="true">＋</span></button><button class="quick" type="button" data-home="createCoop" data-kind="purchase">${esc(ht('purchase'))}<span aria-hidden="true">＋</span></button><button class="quick" type="button" data-home="createCoop" data-kind="project">${esc(ht('project'))}<span aria-hidden="true">＋</span></button><a class="quick" href="#/communities">${esc(ht('community'))}<span aria-hidden="true">→</span></a><a class="quick" href="#/city">${esc(ht('city'))}<span aria-hidden="true">→</span></a></div></section>`;
 const feedView=`<section class="home-section"><h2>${esc(ht('feed'))}</h2><div class="home-feed">${feedItems.map(feedCard).join('')||`<div class="empty"><p>${esc(ht('noFeed'))}</p></div>`}</div>${feedItems.length?`<p class="home-feed-end">${esc(ht('feedEnd'))}</p>`:''}</section>`;
 const body=view==='home-attention'?attentionView:view==='home-feed'?feedView:view==='home-actions'?actionsView:overview;
 return `<section class="home-dashboard" data-home-view="${esc(view)}">${header}${body}</section>`;
}

function renderMessages(u){
 const rawView=currentSubsection('messages');
 const view=guestDemo&&rawView==='messages-invites'?'messages-chats':rawView;
 return messagingDomain.render(u,{
  selectedChat,
  directTarget,
  chatDraft,
  inviteTarget,
  messageDrafts,
  guestDemo,
  view
 });
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
 if(process.confirmation_deadline)html+=`<p><strong>${esc(lt('confirmationDeadline'))}:</strong> ${esc(formatWhen(process.confirmation_deadline))}</p>`;
 if(process.external_order_reference)html+=`<p><strong>${esc(lt('externalReference'))}:</strong> ${esc(process.external_order_reference)}</p>`;
 if(process.expected_delivery_at)html+=`<p><strong>${esc(lt('expectedDelivery'))}:</strong> ${esc(formatWhen(process.expected_delivery_at))}</p>`;
 if(process.pickup_place)html+=`<p><strong>${esc(lt('pickupPlace'))}:</strong> ${esc(process.pickup_place)}</p>`;
 if(process.pickup_start)html+=`<p><strong>${esc(lt('pickupStart'))}:</strong> ${esc(formatWhen(process.pickup_start))}${process.pickup_end?' – '+esc(formatWhen(process.pickup_end)):''}</p>`;
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

function coopDisclosure(key,title,count,body,open=false){
 return `<details class="coop-disclosure" data-coop-section="${esc(key)}"${open?' open':''}><summary><span>${esc(title)}</span>${count!==''?`<span class="coop-section-count">${esc(String(count))}</span>`:''}</summary><div class="coop-disclosure-body">${body}</div></details>`;
}

function renderCooperation(u,r){
 const projectMode=r==='projects',allowed=projectMode?['project']:['need','offer','purchase','resource'];
 const list=data.cooperations.filter(x=>allowed.includes(x.kind));
 const coop=list.find(x=>x.id===selectedCoop);
 let html=`<div class="row"><div><h2>${esc(ct(projectMode?'projectsTitle':'togetherTitle'))}</h2><p class="meta">${esc(ct(projectMode?'projectDesc':'networkDesc'))}</p></div>${guestDemo?'':`<div>${btn('refresh','refresh')}${btn('logout','out')}</div>`}</div>`;
 if(coop){
  const membership=data.coopMembers.find(m=>m.cooperation_id===coop.id&&m.user_id===u.id);
  const member=!!membership,owner=coop.owner_id===u.id;
  const members=data.coopMembers.filter(m=>m.cooperation_id===coop.id);
  const linkedChat=data.coopChats.find(x=>x.cooperation_id===coop.id);
  const sum=data.commitments.reduce((a,x)=>a+Number(x.quantity||0),0);
  const openTasks=data.projectTasks.filter(x=>x.status!=='done');
  const doneTasks=data.projectTasks.filter(x=>x.status==='done');
  const myNextTask=coop.kind==='project'?openTasks.find(x=>x.assignee_id===u.id)||openTasks[0]:null;
  const myPendingConfirmation=coop.kind==='purchase'?data.purchaseConfirmations.find(x=>x.user_id===u.id&&x.decision==='pending'):null;
  const unreadActivity=Number(data.activityInbox.find(x=>x.cooperation_id===coop.id)?.unread_count||0);
  html+=cbtn('back','back');
  html+=`<article class="card coop-summary"><div class="row"><div><span class="badge">${esc(kindLabel(coop.kind))}</span> <span class="badge muted-badge">${esc(statusLabel(coop.status))}</span></div><span class="meta">${esc(coop.location_text||'')}</span></div><h2>${esc(coop.title)}</h2><p class="coop-summary-description" style="white-space:pre-wrap">${esc(coop.description)}</p><div class="coop-summary-stats"><span><strong>${esc(String(members.length))}</strong><small>${esc(ct('members'))}</small></span>${coop.kind==='project'?`<span><strong>${esc(String(openTasks.length))}</strong><small>${esc(ct('todo'))}</small></span><span><strong>${esc(String(doneTasks.length))}</strong><small>${esc(ct('done'))}</small></span>`:coop.kind==='purchase'?`<span><strong>${esc(String(sum))} / ${esc(String(coop.target_quantity))}</strong><small>${esc(ct('progress'))} · ${esc(coop.unit)}</small></span>`:`<span><strong>${esc(String(data.coopUpdates.length))}</strong><small>${esc(ct('updates'))}</small></span>`}${unreadActivity?`<span><strong>${esc(String(unreadActivity))}</strong><small>${esc(at('unread'))}</small></span>`:''}</div>${!member&&['open','active'].includes(coop.status)?`<div class="actions">${cbtn('join','join',coop.id)}</div>`:''}</article>`;
  if(myNextTask)html+=`<aside class="coop-next-step"><span class="eyebrow">${esc(ht('nextStep'))}</span><strong>${esc(myNextTask.title)}</strong>${myNextTask.details?`<p>${esc(myNextTask.details)}</p>`:''}</aside>`;
  if(myPendingConfirmation)html+=`<aside class="coop-next-step"><span class="eyebrow">${esc(ht('nextStep'))}</span><strong>${esc(ht('confirmation'))}</strong><p>${esc(String(myPendingConfirmation.quantity||0))} ${esc(coop.unit||'')}</p></aside>`;
  if(member&&linkedChat)html+=`<div class="actions">${abtn('openLinkedChat','workChat',linkedChat.conversation_id)}<span class="meta">${esc(at('managedChat'))}</span></div>`;
  if(owner){
   const d=coopEditDraft||{title:coop.title,description:coop.description,location:coop.location_text,status:coop.status,targetQuantity:coop.target_quantity??'',unit:coop.unit||''};
   const editBody=`<form id="netCoopEdit" class="editor card"><label>${esc(ct('title'))}<input name="title" maxlength="120" required value="${esc(d.title)}"></label><label>${esc(ct('description'))}<textarea name="description" maxlength="3000" rows="3">${esc(d.description)}</textarea></label><label>${esc(ct('location'))}<input name="location" maxlength="120" value="${esc(d.location)}"></label><label>${esc(ct('status'))}<select name="status">${['open','active','done','cancelled'].map(s=>`<option value="${s}"${d.status===s?' selected':''}>${esc(statusLabel(s))}</option>`).join('')}</select></label>${coop.kind==='purchase'?`<label>${esc(ct('target'))}<input name="targetQuantity" type="number" min="0.001" step="0.001" required value="${esc(d.targetQuantity)}"></label><label>${esc(ct('unit'))}<input name="unit" maxlength="30" required value="${esc(d.unit)}"></label>`:''}<div class="actions"><button class="button">${esc(t('save'))}</button>${cbtn('delete','delete',coop.id)}</div></form>`;
   html+=coopDisclosure('manage',ct('edit'),'',editBody);
  }
  if(coop.kind==='purchase'){
   const myOffer=data.purchaseOffers.find(x=>x.provider_id===u.id);
   const chosen=data.purchaseChoice[0];
   const od=offerDraft?.cooperationId===coop.id?offerDraft:(myOffer?{cooperationId:coop.id,unitPrice:myOffer.unit_price,currency:myOffer.currency,minQuantity:myOffer.min_quantity,availableQuantity:myOffer.available_quantity??'',deliveryMode:myOffer.delivery_mode,deliveryFee:myOffer.delivery_fee,leadTimeDays:myOffer.lead_time_days,validUntil:myOffer.valid_until||'',note:myOffer.note||''}:{cooperationId:coop.id,unitPrice:'',currency:'SEK',minQuantity:'',availableQuantity:'',deliveryMode:'pickup',deliveryFee:'0',leadTimeDays:'0',validUntil:'',note:''});
   let offerBody=`<p class="meta">${esc(ot('offerHelp'))}</p><div class="draft-grid">${data.purchaseOffers.map(o=>{const p=coopProfile(o.provider_id),isChosen=chosen?.offer_id===o.id;return `<article class="card">${isChosen?`<span class="badge">${esc(ot('selected'))}</span>`:''}<h3>${esc(p?.name||ot('provider'))}</h3><p><strong>${esc(String(o.unit_price))} ${esc(o.currency)} / ${esc(coop.unit)}</strong></p><p class="meta">${esc(ot('minimum'))}: ${esc(String(o.min_quantity))} ${esc(coop.unit)}${o.available_quantity!==null?` · ${esc(ot('availability'))}: ${esc(String(o.available_quantity))} ${esc(coop.unit)}`:''}</p><p class="meta">${esc(ot('delivery'))}: ${esc(ot(o.delivery_mode==='delivery'?'deliveryOnly':o.delivery_mode))}${Number(o.delivery_fee)>0?` · ${esc(String(o.delivery_fee))} ${esc(o.currency)}`:''} · ${esc(String(o.lead_time_days))} ${esc(ot('days'))}</p>${o.valid_until?`<p class="meta">${esc(ot('validUntil'))}: ${esc(o.valid_until)}</p>`:''}<p style="white-space:pre-wrap">${esc(o.note||'')}</p><div class="actions">${owner?(isChosen?obtn('clearOffer','clearSelection',o.id):obtn('selectOffer','selectOffer',o.id)):''}${o.provider_id!==u.id?obtn('messageProvider','messageProvider',o.provider_id)+obtn('reportOffer','reportOffer',o.id)+btn('block','block',o.provider_id):''}</div></article>`;}).join('')||`<div class="empty"><p>${esc(ot('noOffers'))}</p></div>`}</div><p class="meta">${esc(ot('notOrder'))}</p>`;
   if(data.profile.listed){
    offerBody+=`<form id="netPurchaseOffer" class="editor card"><h3>${esc(ot('makeOffer'))}</h3><label>${esc(ot('unitPrice'))}<input name="unitPrice" type="number" min="0.01" step="0.01" required value="${esc(od.unitPrice)}"></label><label>${esc(ot('currency'))}<input name="currency" maxlength="3" required value="${esc(od.currency)}"></label><label>${esc(ot('minQuantity'))}<input name="minQuantity" type="number" min="0.001" step="0.001" required value="${esc(od.minQuantity)}"></label><label>${esc(ot('availableQuantity'))}<input name="availableQuantity" type="number" min="0.001" step="0.001" value="${esc(od.availableQuantity)}"></label><label>${esc(ot('delivery'))}<select name="deliveryMode">${['pickup','delivery','both'].map(m=>`<option value="${m}"${od.deliveryMode===m?' selected':''}>${esc(ot(m==='delivery'?'deliveryOnly':m))}</option>`).join('')}</select></label><label>${esc(ot('deliveryFee'))}<input name="deliveryFee" type="number" min="0" step="0.01" value="${esc(od.deliveryFee)}"></label><label>${esc(ot('leadTime'))}<input name="leadTimeDays" type="number" min="0" max="365" step="1" value="${esc(od.leadTimeDays)}"></label><label>${esc(ot('validUntil'))}<input name="validUntil" type="date" value="${esc(od.validUntil)}"></label><label>${esc(ot('offerNote'))}<textarea name="note" maxlength="1000" rows="3">${esc(od.note)}</textarea></label><div class="actions"><button class="button">${esc(ot('saveOffer'))}</button>${myOffer?obtn('withdrawOffer','withdrawOffer',coop.id):''}</div></form>`;
   }else{
    offerBody+=`<aside class="notice"><p>${esc(ot('profileRequired'))} <a class="text-link" href="#/me">${esc(t('profile'))}</a></p></aside>`;
   }
   html+=coopDisclosure('offers',ot('offers'),data.purchaseOffers.length,offerBody);
  }
  if(!member){
   html+=`<aside class="notice"><p>${esc(ct('memberOnly'))}</p></aside>`;
   return html;
  }
  const activityBody=`<div class="activity-list">${data.coopActivity.map(e=>`<article class="activity-item"><span class="activity-dot" aria-hidden="true"></span><div><strong>${esc(activityLabel(e,u))}</strong><p class="meta">${esc(formatWhen(e.created_at))}</p></div></article>`).join('')||`<div class="empty"><p>${esc(at('noActivity'))}</p></div>`}</div>`;
  html+=coopDisclosure('activity',at('activity'),data.coopActivity.length,activityBody);
  const membersBody=`<div class="coop-compact-list">${members.map(m=>{const p=coopProfile(m.user_id),name=m.user_id===u.id?mt('you'):(p?.name||ct('noProfile'));const remove=owner&&m.user_id!==u.id?cbtn('removeMember','remove',m.user_id):'';return `<article class="coop-compact-row"><div><strong>${esc(name)}</strong><span class="meta">${esc(ct(m.role==='owner'?'owner':'member'))}</span></div>${remove}</article>`;}).join('')}</div>${member&&!owner?`<div class="actions">${cbtn('leave','leave',coop.id)}</div>`:''}`;
  html+=coopDisclosure('members',ct('members'),members.length,membersBody);
  if(coop.kind==='purchase'){
   const mine=data.commitments.find(x=>x.user_id===u.id),cd=commitDraft.quantity!==''?commitDraft:{quantity:mine?.quantity??'',note:mine?.note||''};
   const progressBody=`<div class="coop-compact-list">${data.commitments.map(x=>{const p=coopProfile(x.user_id);return `<article class="coop-compact-row"><div><strong>${esc(x.user_id===u.id?mt('you'):(p?.name||ct('noProfile')))}</strong><span class="meta">${esc(String(x.quantity))} ${esc(coop.unit)}${x.note?' · '+esc(x.note):''}</span></div></article>`;}).join('')||`<div class="empty"><p>${esc(ct('empty'))}</p></div>`}</div><form id="netCommitment" class="editor card"><label>${esc(ct('commitment'))}<input name="quantity" type="number" min="0" step="0.001" required value="${esc(cd.quantity)}"></label><label>${esc(ct('commitNote'))}<input name="note" maxlength="500" value="${esc(cd.note)}"></label><div class="actions"><button class="button">${esc(ct('saveCommit'))}</button>${mine?cbtn('removeCommit','removeCommit',coop.id):''}</div></form>${renderPurchaseLifecycle(u,coop,owner)}`;
   html+=coopDisclosure('purchase-progress',ct('progress'),String(sum)+' '+coop.unit,progressBody);
  }
  if(coop.kind==='project'){
   const tasksBody=`<div class="coop-compact-list">${data.projectTasks.map(task=>{const p=coopProfile(task.assignee_id);const canManage=owner||task.creator_id===u.id;return `<article class="coop-task-row"><div class="coop-task-main"><span class="badge">${esc(ct(task.status))}</span><strong>${esc(task.title)}</strong><span class="meta">${esc(ct('assignee'))}: ${esc(task.assignee_id?(task.assignee_id===u.id?mt('you'):(p?.name||ct('noProfile'))):ct('unassigned'))}</span></div>${task.details?`<p>${esc(task.details)}</p>`:''}<form class="netTaskStatus"><input type="hidden" name="task" value="${esc(task.id)}"><label>${esc(ct('status'))}<select name="status">${['todo','doing','done'].map(s=>`<option value="${s}"${task.status===s?' selected':''}>${esc(ct(s))}</option>`).join('')}</select></label><button class="button secondary">${esc(t('save'))}</button></form>${canManage?`<form class="netTaskAssign"><input type="hidden" name="task" value="${esc(task.id)}"><label>${esc(ct('assignee'))}<select name="assignee"><option value="">${esc(ct('unassigned'))}</option>${members.map(m=>{const mp=coopProfile(m.user_id);return `<option value="${esc(m.user_id)}"${task.assignee_id===m.user_id?' selected':''}>${esc(m.user_id===u.id?mt('you'):(mp?.name||ct('noProfile')))}</option>`;}).join('')}</select></label><button class="button secondary">${esc(ct('assign'))}</button></form>${cbtn('deleteTask','deleteTask',task.id)}`:''}</article>`;}).join('')||`<div class="empty"><p>${esc(ct('empty'))}</p></div>`}</div><form id="netTaskCreate" class="editor card"><h3>${esc(ct('newTask'))}</h3><label>${esc(ct('taskTitle'))}<input name="title" maxlength="160" required value="${esc(taskDraft.title||'')}"></label><label>${esc(ct('taskDetails'))}<textarea name="details" maxlength="2000" rows="3">${esc(taskDraft.details||'')}</textarea></label><label>${esc(ct('assignee'))}<select name="assignee"><option value="">${esc(ct('unassigned'))}</option>${members.map(m=>{const p=coopProfile(m.user_id);return `<option value="${esc(m.user_id)}"${taskDraft.assignee===m.user_id?' selected':''}>${esc(m.user_id===u.id?mt('you'):(p?.name||ct('noProfile')))}</option>`;}).join('')}</select></label><button class="button">${esc(ct('saveTask'))}</button></form>`;
   html+=coopDisclosure('tasks',ct('tasks'),openTasks.length,tasksBody);
  }
  const updatesBody=`<div class="coop-compact-list">${data.coopUpdates.map(x=>{const p=coopProfile(x.author_id),canDelete=owner||x.author_id===u.id;return `<article class="coop-compact-row"><div><strong>${esc(x.author_id===u.id?mt('you'):(p?.name||ct('noProfile')))}</strong><span class="meta">${esc(formatWhen(x.created_at))}</span><p style="white-space:pre-wrap">${esc(x.body)}</p></div>${canDelete?cbtn('deleteUpdate','deleteUpdate',x.id):''}</article>`;}).join('')||`<div class="empty"><p>${esc(ct('empty'))}</p></div>`}</div><form id="netCoopUpdate" class="editor card"><label>${esc(ct('newUpdate'))}<textarea name="body" maxlength="3000" rows="3" required>${esc(coopUpdateDraft)}</textarea></label><button class="button">${esc(ct('publishUpdate'))}</button></form>`;
  html+=coopDisclosure('updates',ct('updates'),data.coopUpdates.length,updatesBody);
  return html;
 }
 if(projectMode){
   const rawView=currentSubsection('projects'),view=guestDemo&&rawView==='projects-mine'?'projects-overview':rawView;
  if(view==='projects-tasks'){
   const tasks=data.assignedTasks.filter(x=>x.status!=='done');
   html+=`<h3>${esc(ct('tasks'))}</h3><div class="draft-grid">${tasks.map(task=>{const project=data.cooperations.find(x=>x.id===task.cooperation_id);return `<article class="card"><span class="badge">${esc(ct(task.status))}</span><h3>${esc(task.title)}</h3><p>${esc(task.details||'')}</p><p class="meta">${esc(project?.title||ct('projectsTitle'))}</p>${project?cbtn('open','open',project.id):''}</article>`;}).join('')||`<div class="empty"><p>${esc(ct('empty'))}</p></div>`}</div>`;
   return html;
  }
  if(view==='projects-updates'){
   const updates=data.activityInbox.filter(x=>x.cooperation_kind==='project'&&x.last_activity_at);
   html+=`<h3>${esc(ct('updates'))}</h3><div class="draft-grid">${updates.map(x=>{const line=activityLabel({actor_id:x.last_actor_id,event_type:x.last_event_type,label:x.last_label},u);return `<article class="card"><div class="row"><h3>${esc(x.cooperation_title)}</h3>${Number(x.unread_count||0)?`<span class="net-count">${esc(String(x.unread_count))}</span>`:''}</div><p class="meta">${esc(line)} · ${esc(formatWhen(x.last_activity_at))}</p>${abtn('openNotify','openActivity',x.cooperation_id)}</article>`;}).join('')||`<div class="empty"><p>${esc(at('noActivity'))}</p></div>`}</div>`;
   return html;
  }
 }
 const kind=projectMode?'project':coopDraft.kind;
 const rawListView=projectMode?currentSubsection('projects'):'',view=guestDemo&&rawListView==='projects-mine'?'projects-overview':rawListView;
 const memberIds=projectMode?new Set(data.coopMembers.filter(m=>m.user_id===u.id).map(m=>m.cooperation_id)) : new Set();
 const displayList=projectMode&&view==='projects-mine'?list.filter(x=>x.owner_id===u.id||memberIds.has(x.id)):list;
 const createForm=guestDemo?'':`<form id="netCoopCreate" class="editor card"><h3>${esc(ct('newCoop'))}</h3>${projectMode?`<input type="hidden" name="kind" value="project">`:`<label>${esc(ct('kind'))}<select name="kind">${['need','offer','purchase','resource'].map(k=>`<option value="${k}"${kind===k?' selected':''}>${esc(kindLabel(k))}</option>`).join('')}</select></label>`}<label>${esc(ct('title'))}<input name="title" maxlength="120" required value="${esc(coopDraft.title||'')}"></label><label>${esc(ct('description'))}<textarea name="description" maxlength="3000" rows="3">${esc(coopDraft.description||'')}</textarea></label><label>${esc(ct('location'))}<input name="location" maxlength="120" value="${esc(coopDraft.location||'')}"></label><div data-purchase-fields ${kind==='purchase'?'':'hidden'}><label>${esc(ct('target'))}<input name="targetQuantity" type="number" min="0.001" step="0.001" value="${esc(coopDraft.targetQuantity||'')}"></label><label>${esc(ct('unit'))}<input name="unit" maxlength="30" value="${esc(coopDraft.unit||'')}"></label><p class="meta">${esc(ct('purchaseHelp'))}</p></div><button class="button">${esc(ct('newCoop'))}</button></form>`;
 html+=createForm+`<h3>${esc(projectMode?ct('projectsTitle'):ct('togetherTitle'))}</h3><div class="draft-grid">${displayList.map(x=>{const unread=Number(data.activityInbox.find(a=>a.cooperation_id===x.id)?.unread_count||0);return `<article class="card"${guestDemo&&['need','offer','project'].includes(x.kind)?` data-demo-story="${esc(x.kind)}"`:''}><div class="row"><span><span class="badge">${esc(kindLabel(x.kind))}</span> <span class="badge muted-badge">${esc(statusLabel(x.status))}</span></span>${unread?`<span class="net-count">${esc(String(unread))}</span>`:''}</div><h3>${esc(x.title)}</h3><p>${esc(x.description)}</p><p class="meta">${esc(x.location_text||'')}</p>${cbtn('open','open',x.id)}</article>`;}).join('')||`<div class="empty"><p>${esc(ct('empty'))}</p></div>`}</div>`+(guestDemo?'':`<p class="meta">${esc(ct('localBelow'))}</p>`);
 return html;
}

function render(){
 const r=route(),hasUser=!!currentUser(),relevant=['me','people','communities','messages','together','projects'].includes(r)||(r==='home'&&hasUser),localMyPlace=r==='me'&&!hasUser&&!guestDemo&&showLocalGuest;host.hidden=!relevant||localMyPlace;
 document.body.classList.toggle('network-login-open',!!(api?.enabled&&r==='me'&&!hasUser&&!guestDemo&&!showLocalGuest));
 document.body.classList.toggle('guest-preview-open',!!(guestDemo&&relevant));
 const guestNetworkRoute=guestDemo&&['home','me','people','communities','messages','together','projects'].includes(r);
 document.getElementById('workspace').hidden=!!(guestNetworkRoute||((api?.enabled||guestDemo)&&(['people','communities','messages'].includes(r)||(r==='home'&&hasUser)||(r==='me'&&guestDemo)||(r==='me'&&!hasUser&&!showLocalGuest))));
 syncBadges();
 if(!relevant||localMyPlace)return;host.lang=lang();host.dir='ltr';
 if(!api?.enabled&&!guestDemo){host.innerHTML=`<aside class="notice"><strong>${esc(t('title'))}</strong><p>${esc(configError?t('error'):t('off'))}</p></aside>`;return;}
 let html='';const u=currentUser();
 if(!u){
  const termsUrl=lang()==='sv'?api.policy.termsUrlSv:api.policy.termsUrlEn;
  const policyBlock=`<div class="pilot-policy"><label class="checkbox policy-consent"><input type="checkbox" name="policyAccepted"${policyAccepted?' checked':''}><span>${esc(t('policyAccept'))}</span></label><p class="pilot-policy-links"><a class="text-link" target="_blank" rel="noopener noreferrer" href="${esc(termsUrl)}">${esc(t('termsLink'))}</a><span aria-hidden="true">·</span><a class="text-link" target="_blank" rel="noopener noreferrer" href="${esc(api.policy.privacyUrl)}">${esc(t('privacyLink'))}</a><span class="policy-version">v1 · 29.09.2026</span></p></div>`;
  const inviteField=`<label>${esc(t('inviteCode'))}<input name="inviteCode" autocomplete="off" minlength="0" maxlength="120" value="${esc(pilotInvite)}" aria-describedby="pilotInviteHint"></label><p id="pilotInviteHint" class="meta pilot-field-hint">${esc(t('inviteCodeHint'))}</p>`;
  const emailStart=`<label>${esc(t('email'))}<input type="email" name="email" maxlength="254" autocomplete="email" required value="${esc(email)}"></label><button name="operation" value="code" class="${codeRequested?'button secondary':'button'}">${esc(t(codeRequested?'resend':'send'))}</button>`;
  const emailCodeOnly=`<div class="pilot-login-step"><label>${esc(t('code'))}<input name="code" inputmode="numeric" autocomplete="one-time-code" minlength="6" maxlength="10" value="${esc(otpCode)}"></label><button name="operation" value="verify" class="button">${esc(t('verify'))}</button></div>`;
  const emailFinish=`<div class="pilot-login-step"><label>${esc(t('code'))}<input name="code" inputmode="numeric" autocomplete="one-time-code" minlength="6" maxlength="10" value="${esc(otpCode)}"></label>${inviteField}${policyBlock}<button name="operation" value="verify" class="button">${esc(t('verify'))}</button></div>`;
  if(api.googleOAuthEnabled){
   html=`<section class="pilot-login-shell"><h2>${esc(t('login'))}</h2><p class="pilot-login-intro">${esc(t('invite'))}</p><form id="netLogin" class="editor card pilot-login-card">${inviteField}${policyBlock}<button type="button" class="button pilot-google" data-auth="google">${esc(t('google'))}</button><details class="pilot-alt-auth"${codeRequested?' open':''}><summary>${esc(t('email'))}</summary><div class="pilot-alt-auth-body">${emailStart}${codeRequested?emailCodeOnly:''}</div></details></form></section>`;
  }else{
   html=`<section class="pilot-login-shell"><h2>${esc(t('login'))}</h2><p class="pilot-login-intro">${esc(t('invite'))}</p><form id="netLogin" class="editor card pilot-login-card">${emailStart}${codeRequested?emailFinish:''}</form><button type="button" class="text-button pilot-local-toggle" data-net="localGuest">${esc(t('localContinue'))}</button></section>`;
  }
 }
 else if(r==='home'){html=guestDemo?muraHomeDomain.render(u):renderHome(u);}
 else if(r==='messages'){html=renderMessages(u);}
 else if(r==='together'||r==='projects'){html=renderCooperation(u,r);}
 else if(r==='me'){
  html=profileDomain.render(u,{profileDraft,guestDemo});
 }else if(r==='people'){
  html=guestDemo?renderMuraPeople(u):`<div class="row"><h2>${esc(t('directory'))}</h2><div>${btn('refresh','refresh')}${btn('logout','out')}</div></div><div class="draft-grid">${data.directory.map(p=>`<article class="card"><h3>${esc(p.name)}</h3><p>${esc(p.skills)}</p><p>${esc(p.about)}</p>${p.id!==u.id?btn('block','block',p.id):''}</article>`).join('')||esc(t('empty'))}</div>`;
 }else if(r==='communities'){
  html=communitiesDomain.render(u,{selected,groupDraft,postDrafts,guestDemo});
 }
  const demoBanner='';
 host.innerHTML=demoBanner+html+`<p id="netStatus" role="status" aria-live="polite">${esc(notice)}</p>`;
 host.classList.toggle('guest-demo',guestDemo);
 if(guestDemo){
  host.querySelectorAll('form').forEach(form=>{form.hidden=true;form.setAttribute('aria-hidden','true');});
  host.querySelectorAll('[data-coop-section="manage"]').forEach(x=>x.hidden=true);
  host.querySelectorAll('[data-net="refresh"]').forEach(b=>b.hidden=true);
  host.querySelectorAll('[data-net="logout"]').forEach(b=>{b.textContent=ht('demoExit');b.hidden=r!=='me';b.disabled=false;b.removeAttribute('aria-disabled');});
  const keep='[data-home="openCoop"],[data-home="openCommunity"],[data-net="open"],[data-net="back"],[data-net="openChat"],[data-net="backChats"],[data-net="logout"],[data-coop="open"],[data-coop="back"],[data-coop="openLinkedChat"],[data-coop="openNotify"]';
  host.querySelectorAll('button').forEach(b=>{if(!b.matches(keep))b.hidden=true;});
 }
 host.querySelectorAll('button').forEach(b=>{if(!guestDemo)b.disabled=busy;});
 syncBadges();
 queueMicrotask(()=>window.dispatchEvent(new CustomEvent('folkoop:network-rendered',{detail:{route:r,guestDemo}})));
}
async function load(){
 const v=version,u=currentUser();if(!u)return;
 if(guestDemo){data=demoSnapshot();return;}
 const [profile,groups,memberships,directory,blocks,chats,chatMembers,chatInvites,chatProfiles,cooperations,coopMembers,coopChats,chatInbox,activityInbox,homePosts,assignedTasks,myConfirmations,allProcesses]=await Promise.all([
  api.profile(),api.communities(),api.memberships(),api.directory(),api.blocks(),api.chats(),api.chatMembers(),api.chatInvites(),api.visibleProfiles(),api.cooperations(),api.cooperationMembers(),api.cooperationChats(),api.chatInbox(),api.activityInbox(),api.homePosts(),api.assignedTasks(),api.myPurchaseConfirmations(),api.purchaseProcesses()
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
 data={profile:profile[0]||{},groups,memberships,directory,blocks,posts,homePosts,chats,chatMembers,chatInvites,chatProfiles,chatMessages,chatInbox,cooperations,coopMembers,coopChats,coopActivity,activityInbox,assignedTasks,myConfirmations,allProcesses,coopUpdates,projectTasks,commitments,purchaseOffers,purchaseChoice,purchaseProcess,purchaseConfirmations};
}
async function run(fn){
 if(busy)return;busy=true;host.querySelectorAll('button').forEach(b=>b.disabled=true);
 if(!guestDemo){notice=t('busy');const status=host.querySelector('#netStatus');if(status)status.textContent=notice;}
 else notice='';
 try{await fn();}catch(e){notice=t(({AUTH_REQUIRED:'auth',INVITE_REQUIRED:'inviteRequired',POLICY_REQUIRED:'policyRequired',DENIED:'denied',RATE_LIMIT:'limit',INVALID_INPUT:'invalid',STALE:'stale'})[e.code]||'error');}
 finally{busy=false;render();}
}
host.addEventListener('input',e=>{
 const f=e.target.form;if(!f)return;const v=Object.fromEntries(new FormData(f));
 if(f.id==='netProfile')profileDraft={...v,listed:v.listed==='on'};
 if(f.id==='netGroup')groupDraft=v;
 if(f.id==='netPost')postDrafts[selected]=v.body;
 if(f.id==='netLogin'){email=v.email||'';otpCode=v.code||'';pilotInvite=v.inviteCode||'';policyAccepted=v.policyAccepted==='on';}
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
host.addEventListener('submit',e=>{e.preventDefault();if(guestDemo){guestRequireAccount();return;}const f=e.target,values=Object.fromEntries(new FormData(f)),op=e.submitter?.value;
 run(async()=>{
  if(f.id==='netLogin'){email=values.email;otpCode=values.code||'';pilotInvite=values.inviteCode||'';if(op==='code'){await api.requestCode(email);codeRequested=true;notice=t('sent');return;}await api.verify(email,otpCode,pilotInvite,{termsAccepted:policyAccepted,privacyAcknowledged:policyAccepted});email='';otpCode='';pilotInvite='';policyAccepted=false;codeRequested=false;await load();notice='';return;}
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
host.addEventListener('click',e=>{const db=e.target.closest('[data-demo]');if(db){window.dispatchEvent(new CustomEvent('folkoop:open-entry',{detail:{source:'guest-banner'}}));return;}const ab=e.target.closest('[data-auth]');if(ab){run(async()=>{
  if(ab.dataset.auth!=='google'||!api.googleOAuthEnabled)return;
  if(!policyAccepted)throw Object.assign(new Error('POLICY_REQUIRED'),{code:'POLICY_REQUIRED'});
  const popup=window.open(api.googleOAuthUrl(),'folkoop-google-auth','popup,width=520,height=700');
  if(!popup){notice=t('popupBlocked');return;}
  oauthPopup=popup;notice=t('oauthWaiting');
 });return;}const hb=e.target.closest('[data-home]');if(hb){const a=hb.dataset.home,id=hb.dataset.id;if(guestDemo&&a==='createCoop'){guestRequireAccount();return;}run(async()=>{
  if(a==='openCoop'){selectedCoop=id;const target=data.cooperations.find(x=>x.id===id);navigateNetwork(target?.kind==='project'?'#/projects':'#/together');}
  if(a==='openCommunity'){selected=id;navigateNetwork('#/communities');}
  if(a==='createCoop'){const kind=hb.dataset.kind;coopDraft={kind,title:'',description:'',location:'',targetQuantity:'',unit:''};selectedCoop=null;navigateNetwork(kind==='project'?'#/projects':'#/together');}
  await load();notice='';
 });return;}const cb=e.target.closest('[data-coop]');if(cb){const a=cb.dataset.coop,id=cb.dataset.id;const guestAllowed=new Set(['back','open','openLinkedChat','openNotify']);if(guestDemo&&!guestAllowed.has(a)){guestRequireAccount();return;}run(async()=>{
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
 });return;}const b=e.target.closest('[data-net]');if(!b)return;const a=b.dataset.net,id=b.dataset.id;const guestAllowedNet=new Set(['back','open','backChats','openChat','refresh','logout']);if(guestDemo&&!guestAllowedNet.has(a)){guestRequireAccount();return;}
 run(async()=>{
  if(a==='localGuest'){showLocalGuest=true;render();return;}
  if(a==='logout'&&guestDemo){window.dispatchEvent(new CustomEvent('folkoop:open-entry',{detail:{source:'guest-exit'}}));notice='';return;}
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
api?.onChange(()=>{if(api?.user?.()){guestDemo=false;try{sessionStorage.setItem('folkoop-entry-mode-v1','account');}catch{}window.dispatchEvent(new CustomEvent('folkoop:account-ready'));}version++;selected=null;selectedChat=null;selectedCoop=null;if(oauthPopup&&!oauthPopup.closed)oauthPopup.close();oauthPopup=null;otpCode='';pilotInvite='';policyAccepted=false;codeRequested=false;showLocalGuest=false;profileDraft=null;groupDraft={};postDrafts={};chatDraft={title:'',members:[]};directTarget='';inviteTarget='';messageDrafts={};coopDraft={kind:'need',title:'',description:'',location:'',targetQuantity:'',unit:''};coopEditDraft=null;coopUpdateDraft='';taskDraft={title:'',details:'',assignee:''};commitDraft={quantity:'',note:''};offerDraft=null;lifecycleDrafts={};data={profile:{},localDrafts:[],groups:[],memberships:[],posts:[],homePosts:[],directory:[],blocks:[],chats:[],chatMembers:[],chatInvites:[],chatProfiles:[],chatMessages:[],chatInbox:[],cooperations:[],coopMembers:[],coopChats:[],coopActivity:[],activityInbox:[],assignedTasks:[],myConfirmations:[],allProcesses:[],coopUpdates:[],projectTasks:[],commitments:[],purchaseOffers:[],purchaseChoice:[],purchaseProcess:[],purchaseConfirmations:[]};render();});
window.addEventListener('message',e=>{
 if(e.origin!==location.origin||!oauthPopup||e.source!==oauthPopup||e.data?.type!=='folkoop-oauth')return;
 const payload=e.data;oauthPopup=null;
 if(payload.ok!==true){notice=t('oauthFailed');render();return;}
 run(async()=>{await api.completeOAuth(payload.accessToken,payload.expiresIn,pilotInvite,{termsAccepted:policyAccepted,privacyAcknowledged:policyAccepted});pilotInvite='';policyAccepted=false;await load();notice='';});
});
window.addEventListener('hashchange',()=>{if(internalHash&&location.hash===internalHash){internalHash='';return;}internalHash='';version++;if(currentUser())run(async()=>{await load();notice='';});else render();});
window.addEventListener('folkoop:subsection',()=>{render();});
window.addEventListener('folkoop:guest-demo',e=>{
 const detail=e.detail||{},temporary=detail.temporary===true;
 guestDemo=detail.enabled!==false;
 if(!guestDemo){showLocalGuest=detail.target==='local';document.body.classList.remove('guest-preview-open','network-login-open');}
 try{
  if(guestDemo&&!temporary)sessionStorage.setItem('folkoop-entry-mode-v1','guest');
  else if(!guestDemo&&detail.target==='account')sessionStorage.setItem('folkoop-entry-mode-v1','account');
  else if(!guestDemo&&sessionStorage.getItem('folkoop-entry-mode-v1')==='guest')sessionStorage.removeItem('folkoop-entry-mode-v1');
 }catch{}
 version++;selected=null;selectedChat=null;selectedCoop=null;notice='';
 if(guestDemo){showLocalGuest=false;const target=detail.target==='tour'?'#/me':'#/home';load().then(()=>{navigateNetwork(target);render();}).catch(()=>render());}else render();
});
new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
if(guestDemo)load().then(render).catch(render);else render();
})();
