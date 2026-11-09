# Рабочая вики FOLKOOP

## 2026-11-09 — «Для меня»: от желания к небольшому вкладу
[FK-FOR-YOU-001](../workflow/tasks/FK-FOR-YOU-001.md): до трёх открытых
возможностей по выбранному желанию; если совпадений меньше, список не дополняется.
После просмотра условий — явное вступление и предложение темы/помощи через
существующее обновление проекта. Результат — сохранённый текст с датой, а не
подтверждение посещения, согласия или выполненной задачи. Продолжение приходит
из существующей ленты непрочитанных событий; отправки push/email не добавлены.
В профиле Муры есть компактное «Для меня» с локальным примером, без запросов записи.
Выбор и черновик живут в текущей странице; реальные записи остаются в проекте.
Сбой отправки сохраняет черновик; успешная запись с неудачным чтением предлагает
обновить данные и не открывает повторную форму. Недоступные данные не выдаются
за пустой каталог. Другие разделы, экскурсия и задачи сохранены.
Источники: [подбор и маршрут](../../apps/web/network-for-you.js),
[интеграция](../../apps/web/network-ui.js), [API](../../apps/web/network-client.js),
[браузерный сценарий](../../tests/e2e/for-you-browser.py),
[проверки логики](../../tests/unit/for-you.test.mjs).
Локально: 503 теста кода; Chromium/WebKit 390/1366; прежний Home и 18 историй Муры
прошли. Это изолированные API-данные, не прогон записи в живой базе. Тексты добавлены
для 11 языков, проверка носителями не выполнена. Опубликовано `67eeac3`, живой мобильный пример проверен. Chromium CI прошёл;
WebKit выявил гонку прежнего теста при автоматическом продолжении экскурсии
после перезагрузки. Тест уточнён, локально прошёл; повторный удалённый CI ожидается.

## 2026-11-09 — Непрерывные истории Муры
Принято и реализовано по запросу владельца: все 18 историй остаются в маленьком
немодальном чате. `mountMuraStory` переносит существующую локализованную практику
в окно, а реальная иллюстративная карточка открывается на фоне. После выбора видны
реплика пользователя, ответ Муры и следующий шаг. Заметки и пробные сообщения
остаются только в текущей странице; ничего не отправляется. Пропуск возвращает
панель на страницу. Карта, назад/далее, восстановление истории и финал сохранены.
Приветствие: confident вместо please; в разговоре — confident/inspect/idea/searching/wink
по контексту. Старые изображения сохранены. Вечное покачивание отключено, смена
позы мягкая и короткая; учитываются системное и пользовательское уменьшение движения.
Источники: [задача](../workflow/tasks/FK-MURA-CHAT-002.md),
[оболочка](../../apps/web/folkoop.js), [практика](../../apps/web/network-ui.js),
[позы](../../apps/web/folkoop-guide.js), [проверка](../../tests/e2e/mura-chat-browser.py).
Локально: все истории/пробные ответы, восстановление и финал Chromium/WebKit;
497 тестов кода, прежний гостевой сценарий и аудит геометрии прошли. Расширенный тёмный WebKit и RU/AR/FA × четыре размера прошли. Опубликовано `aae03d5`; [весь CI прошёл](https://github.com/chup1runov/Folkoop/actions/runs/42610408681). На живом сайте проверены ответ по закупке и переход в проект без закрытия чата. Новые ответы на
заметку/пробное сообщение: RU/EN/SV, английский fallback для остальных языков;
это не подтверждение проверки носителями языка или физическим iPhone.

## 2026-11-09 - Mura companion chat
Tour is a bounded nonmodal companion window, without overlay, inert page or focus
trap. Typing dots last 420ms; reduced motion shows text immediately. Independent
route changes pause the tour instead of pulling the user back. Finale is nonmodal.
All 18 map replies, reload progress, chapter jump and stay after finale passed
in Chromium/WebKit at 390x844. Geometry audit passed at four sizes; 497 tests
passed. Guest demo and replay checks passed locally. Physical iPhone not tested.
Previous CI c0323b0 validate failed on the former long chapter text; the assertion
now checks the short question AND the original detail disclosure. Old modal-focus
audit updated to assert page focus remains accessible, per explicit user request.
Published runtime: `1f34966`. Cloudflare and all CI jobs passed; [run 42605776469](https://github.com/chup1runov/Folkoop/actions/runs/42605776469). Live 390x844 chat/purchase transition checked after update. Full acceptance appended to the journal.

## 2026-11-09 - Compact theme and Mura dialogue
User iPhone screenshots revealed inherited light text on hard-coded white
backgrounds: source cards, Center hero, people shortcut and tour finale.
Replaced those surfaces with theme tokens, compacted source cards/Center/Together.
Mura chapter introduction now asks a short question with action-backed replies.
Full chapter detail is expandable; map, skip/resume and existing stories retained.
New chapter copy RU/EN/SV; other locales retain existing localized narrative.
Checks: shell build, 12 tour/story unit tests, City theme regression; new
Chromium/WebKit 390/1366 test covers late source-card fixture contrast, Center,
people shortcut, dialogue choice opening purchase, and synthetic finale contrast.
Not a full physical iPhone or human language acceptance. Published c0323b0;
Cloudflare success. All 497 unit/integration tests passed locally; hosted full CI pending.

## 2026-11-08 - City service/report handoff
Implemented local preparation from Services to Reports, carrying the description.
Manual official-channel selection works without GPS; unknown recipient leads to
Gothenburg contact centre, never claims verified responsibility. Existing NVDB
path preserved. Preview and explicit copy; no external submission or automatic
text/address transfer. Edits invalidate prepared results. RU/EN/SV new copy,
English fallback for other locales; human language approval remains pending.
Chromium/WebKit 390/1366: handoff, unknown/municipal route, empty input, escaping,
result invalidation passed. Shell build and 14 City unit tests passed.
Published 7d8965f, Cloudflare success; full hosted validate/WebKit pending.
Source checked: https://goteborg.se/wps/portal/kontakta-oss (official contact hub).
Transport and other City integrations are outside this patch.

## 2026-11-08 - P0-B purchase keyboard focus
Previous release 1e83eeb: all hosted checks passed, including validate, WebKit
and deployment. Next bounded task selected from MASTER_PLAN P0-B accessibility:
purchase next-action transfers focus to its opened summary or visible enabled
form control. Hidden/disabled controls are skipped. Existing permissions unchanged.
Regression reproduced before the fix, then passed in Chromium and WebKit at
390/1366; two focused unit tests and shell build passed. Self-review only;
physical iPhone/VoiceOver acceptance remains open. Published 53b2ded; Cloudflare success.
New full hosted validate/WebKit still running at release.

## 2026-11-08 - purchase polish
Themed stat chips replace the fixed light background. Mura illustrative purchase
deadline is 72 hours after page load, stable during that page session. Historical
records and real participant deadlines remain unchanged. Shell build, two focused
unit tests and Chromium/WebKit 390/1366 passed; dark stat text contrast 12.36:1.
No real orders or consent writes. Published 1e83eeb; Cloudflare success.
Hosted database/sources passed; full validate/WebKit still running at release.


## 2026-11-08 — понятный маршрут закупки
[FK-PURCHASE-JOURNEY-001](../workflow/tasks/FK-PURCHASE-JOURNEY-001.md):
условия → количество → согласие → получение. Сводка фактов и один переход
к существующему действию; без выдуманной экономии, оплаты или подтверждения
площадки. Проверено локально и на сайте в аккаунте Муры; опубликовано 000eea9, Cloudflare success.

## 2026-11-08 — настройки, место и компактная навигация
[FK-NAV-SETTINGS-001](../workflow/tasks/FK-NAV-SETTINGS-001.md): язык только в
настройках; страна → регион → город, сохранение в браузере и город в шапке.
Три режима кнопок, бейджи у значков, четыре вкладки «Вместе», единая панель
«Города» с «Рядом», плотный список чатов. Проверено локально и опубликовано: 35522fd, Cloudflare success.
Настоящий поиск Гётеборга, сохранение города и панели проверены в браузере. Выбор места не подключает новые городские службы.

## 2026-11-08 — единая тема и прокрутка Города
[FK-CITY-THEME-001](../workflow/tasks/FK-CITY-THEME-001.md): встроенный Город
следует теме приложения, высота подстраивается под содержимое, прокрутка общая.
Тёмная тема использует чёрный фон и светлый контрастный текст. Проверены размеры
390/1366 в Chromium/WebKit и контраст текста на выбранных экранах. Опубликовано
на folkoop.pages.dev: код dbf8563, Cloudflare deployment успешно завершён.

## 2026-11-08 — Город сразу внутри приложения
Убраны большой вводный блок, ссылка на отдельное окно и рамка встроенного
Города. Инструменты открываются сразу под общей навигацией; городские функции
и прежний прямой URL сохранены. 495 тестов и браузерная проверка навигации
прошли локально. Код выпуска: df2698f.

## 2026-11-08 — принято: компактная личная страница и публичный доступ
[FK-MURA-ENTRY-001, расширение R04–R06](../workflow/tasks/FK-MURA-ENTRY-001.md):
обзор объединяется с профилем; опубликованную страницу можно читать без входа,
создавать и редактировать — только зарегистрированному владельцу. Видимые поля
выбирает владелец. Прежнее включение в каталог участников не публикует профиль
в интернете. Переписки, настройки и личные черновики не входят в публичную страницу.
**Реализовано, проверено и опубликовано на Cloudflare (1dd9f80).**
[Результаты и границы](../workflow/evidence/FK-MURA-ENTRY-001/verification.json):
495 тестов, 21 SQL-набор, браузерные сценарии, 121 языковой переход. Настройки темы,
компактные разделы, история закупки Муры и выбор публичных полей реализованы.
Полный CI и оба сайта обновлены: [выпуск](../workflow/evidence/FK-MURA-ENTRY-001/release.json).


## 2026-11-07 — правила и сметы в личной выгрузке
[FK-EXPORT-003](../workflow/tasks/FK-EXPORT-003.md): личное согласие теперь включает
текст точной редакции правил/сметы, в том числе прежней и с отозванным согласием.
483 теста, Chromium 390/1366, WebKit и весь CI прошли. Выпуск b1a39da опубликован.
Два настоящих архива подтвердили старую редакцию правил и сохранение сметы после
отзыва согласия — [результат](../workflow/evidence/FK-EXPORT-003/release.json).


## 2026-11-07 — условия в личной выгрузке
[FK-EXPORT-002](../workflow/tasks/FK-EXPORT-002.md): у собственных ответов встречи
теперь выгружаются условия конкретной версии; недоступные условия отмечаются
явно. 479 тестов, Chromium 390/1366 и WebKit прошли. Выпуск e9a1cb1 опубликован;
настоящая выгрузка содержит 12 личных ответов с условиями версий 1–4.
[Публикация и проверка](../workflow/evidence/FK-EXPORT-002/release.json);
[состояние](../workflow/tasks/FK-EXPORT-002.state.json).
Это узкое дополнение C04, не завершение полного экспорта/закрытия аккаунта.


## 2026-11-07 — Meeting inbox B02 released and accepted
Published code e7ecd84; Cloudflare deployment 19e15217-d249-4961-8b30-6d3e56ac3a85 succeeded. GitHub CI (including WebKit, SQL, validation and deploy) passed. Two real isolated Brave sessions verified proposed role, personal answers, v4 changed terms, new required responses, and disappearance of the action after response. Opening a card never created consent. Existing v3 responses remained historical. No room binding was needed. No paid service or deletion. Details: [release evidence](../workflow/evidence/FK-LIVE-002/action-inbox-release.json).

7 ноября: [путь нового участника](../workflow/tasks/FK-JOIN-001.md) проверен в UI 1366/390 и отдельно в настоящей базе с откатом тестовых данных. [Границы проверки](../workflow/evidence/FK-JOIN-001/results.json).

7 ноября: [синхронный выход между вкладками](../workflow/tasks/FK-AUTH-TABS-001.md) опубликован: 482 локальных теста, Chromium 1366/390, CI и настоящий вход с выходом из двух вкладок в Brave прошли. [Результат публикации](../workflow/evidence/FK-AUTH-TABS-001/deployment.json).

[Восстановление входа](../workflow/tasks/FK-AUTH-RECOVERY-001.md): локальные проверки и публикация завершены; [настоящий вход и выход](../workflow/evidence/FK-REL-001/real-auth-acceptance.json) проверены 6 ноября в Brave.

Текущий выпуск: [FK-REL-001](../workflow/tasks/FK-REL-001.md) — база и сайты обновлены; серверные сессии включены; настоящий вход, перезагрузка, новая вкладка и выход проверены. [Проверенное и ограничения](../workflow/evidence/FK-REL-001/session-activation.json).

## Аудит 11–15 — локально проверено 6 ноября 2026

[FK-STAB-003: результат и ограничения](../workflow/evidence/FK-STAB-003/results.md).
Добавлены осторожное автообновление реального аккаунта, постраничные списки с
индикацией неполноты, серверный поиск по восьми типам доступных сущностей,
открытие найденного старого сообщения, идемпотентная повторная отправка и
постраничная выгрузка 43 разделов. Исправлен сбой поиска при отсутствии
`localDrafts` в настоящем аккаунте. Мура и ручное обновление сохранены.

462 Node-теста; 43 миграции с нуля и 19 SQL-наборов в локальной PostgreSQL;
Chromium 1366/390, включая поиск, повтор после потерянного ответа и сохранение
черновика при возвращении во вкладку; static smoke и QA-shell/asset audit — PASS.
**Ничего не опубликовано**, hosted DB не менялась. Нужны две новые SQL-миграции
перед будущим обновлением клиента. Серверная HttpOnly-сессия остаётся выключенной
до отдельной настройки. Push/email, физический iPhone и носители языков не проверены.

Выгрузка не является полной копией провайдерских/приватных записей: сохраняются
явные исключения, неизвестная полнота без count и неатомарность. Операторский
процесс дополнен в [runbook](../ACCOUNT_CLOSURE_RUNBOOK.md); реальное закрытие
аккаунта не выполнялось. Исторические статусы ниже сохранены.


## Аудит 6–10: локальные исправления проверены — 6 ноября 2026

[FK-STAB-002: результаты](../workflow/evidence/FK-STAB-002/results.md): SQL-gate
для GitHub и стандартной Cloudflare-сборки, восстановление входа через серверную
HttpOnly-сессию, отдельные SQL-сценарии документов/бюджета/помещений/решений и
изоляция вспомогательных ошибок загрузки. 453 теста, 18 SQL suites, static smoke,
сборка QA-shell и browser-сценарии 1366/390 прошли локально.

**Ничего не опубликовано.** Серверный режим пока выключен в конфигурации сайта:
позже нужны приватные D1 binding/ключ и отдельная разрешённая публикация.
[Архитектура и ограничения](../architecture/SERVER_SESSION.md). Браузер проверял
настоящую cookie и локальный сервер с синтетическим Auth; реальный Supabase,
Cloudflare runtime, WebKit и iPhone в этом этапе не проверялись. Ниже сохранён
исторический промежуточный статус; ожидание решения о сессии уже снято.


## Продолжение аудита 6–10 — 6 ноября 2026

FK-STAB-002 выполняется, **не завершён**. GitHub deploy теперь зависит от
reusable SQL job того же запуска. Cloudflare direct-build этим ещё не защищён.
Пункт 7 подтверждён: 443/443 тестов прошли, включая новые проверки изоляции
обязательных/вспомогательных данных. В network-ui вспомогательные ошибки не
блокируют текущий раздел, сохраняется предупреждение; ошибки Auth и обязательного
членства остаются фатальными. Нужна дальнейшая проверка выбранных доменов.
Пункт 8: прежние 41 миграция/17 suites не заменяют отдельные сценарии документов,
бюджета и помещений — работа остаётся. По пункту 9 ожидается решение владельца
о серверной HttpOnly-сессии; токены в browser storage не сохранялись.
Ничего не опубликовано, production DB не менялась.
[Текущий план](../workflow/tasks/FK-STAB-002.md).


## Актуальная рабочая версия — 6 ноября 2026

[FK-STAB-001](../workflow/tasks/FK-STAB-001.md): первые пять замечаний аудита
исправлены локально в `reconciled-20261106`, ветка
`codex/reconcile-audit-top5-20261106`, на main `5ce4a9b` с сохранением накопленных
локальных функций. Прежняя `meeting-outcome-repeat` — резервная копия, не место
дальнейшего параллельного развития.

Сохранение результатов при выходе/исключении, последние сообщения + дозагрузка,
точные отметки показа и единая сборка городских JSON проверены локально.
**439/439 тестов, 41 миграция и 17 SQL suites на изолированном PostgreSQL 17,
девять browser scripts Chromium**. [Подробные результаты и ограничения](../workflow/evidence/FK-STAB-001/results.md).
Полная сборка с контролируемыми синтетическими источниками прошла; настоящая
попытка получить городские данные завершилась сетевой ошибкой и корректно
остановила production build. Реальная свежая загрузка остаётся непроверенной.
**Ничего не опубликовано, production DB не менялась.** Исторические записи ниже
сохранены; утверждение о хешах QA 29 октября не является проверкой новой версии.
Исправления CI/PWA/Cloudflare из main теперь включены в рабочую версию; старый
статус «только отдельный патч» больше не описывает эту локальную ветку.

[FK-CF-002: вход из письма](../workflow/tasks/FK-CF-002.md) — 29 октября: явный возврат на Pages опубликован (266fdfe), 379 тестов и сборка прошли. Site URL и точные redirect URLs сохранены. Настоящий вход пока не подтверждён: два mail.send в Supabase, письмо в Proton не найдено.

## Cloudflare — 29 октября 2026

[FK-CF-001](../workflow/tasks/FK-CF-001.md): исправление обновления страницы и City
опубликовано на https://folkoop.pages.dev/ (958645e). Проверены 375 тестов и
браузерная навигация. Это отдельный патч main; локальные новые функции и FK-CI-001
в публикацию не включены. Старому клиенту может понадобиться обычное обновление.

## Следующая подготовленная задача — 29 октября 2026

[FK-CI-001: WebKit CI](../workflow/tasks/FK-CI-001.md), связь с планом R02 → N08.
Причина проверена по свежему чтению CI: ubuntu-latest выбрал Ubuntu 26.04,
которую WebKit Playwright 1.57.0 не поддерживает. Локальный патч закрепляет
ubuntu-24.04 только для WebKit. Изолированная сборка и два smoke на macOS прошли;
полный Linux CI и 13-script smoke ещё не проверены.
[Состояние и продолжение](../workflow/tasks/FK-CI-001.state.json). R01/#281 остаётся
отдельным P0-пунктом. Приложение не изменено; CI-патч только локальный, удалённых запусков и публикации нет.

## Текущая карта — 29 октября 2026

Статус: локальная производная вики; инфраструктурный пилот
[FK-WF-001](../workflow/tasks/FK-WF-001.md) и его [место продолжения](../workflow/tasks/FK-WF-001.state.json).
Полный замысел проекта не сокращён. Ни эта карта, ни наличие файлов не доказывают
готовность приложения. Существенные источники и объём чтения — в [реестре](sources.json).

| Нужно узнать | Куда идти |
|---|---|
| Назначение, люди, цели, границы | [Концепция](concept.md), затем [Charter](../FOUNDATION_CHARTER.md) |
| Архитектура, связанные сценарии | [SDCF](../architecture/SDCF_INTEGRATION.md), [карта объектов](../architecture/unified-domain-map-v1.json), Charter §§8–12 |
| Требования и сохранение замысла | [Канонический реестр](../NO_LOSS_REQUIREMENTS_REGISTER.md); число IDs не равно числу готовых функций |
| Принятые решения | [ADR-002](../architecture/adr/ADR-002-four-origin-foundation.md), [ADR-003](../architecture/adr/ADR-003-sdcf-web3-web4-layers.md) |
| Проверки и рабочие инструкции | [Пилот оператора](../GOTEBORG_PILOT_OPERATOR_RUNBOOK.md), [приватность](../PRIVACY_RIGHTS_AND_INCIDENT_RUNBOOK.md); даты/предусловия перепроверять перед применением |
| Что сделано, проблемы и неизвестное | [Состояние разработки](development-status.md), [карта Токаренко](tokarenko-map.md) |
| Как агент ведёт и продолжает задачу | [Процесс и вызовы skills](../workflow/README.md), spec/state в tasks/ |
| Проверенный опыт и источники | [Уроки](lessons.md), [реестр](sources.json), [журнал](log.md) |

### Экскурсия Муры: что подтверждено

Источник SRC-MURA-QA — [отчёт 28 октября](../MURA_TOUR_QA_20261028.md):
18 интерактивных историй, пять глав, браузерные размеры 1366×900 и 390×844,
локальная сборка и 19 целевых тестов. 29 октября повторно сопоставлены записанные
SHA-256 с folkoop.js/network-ui.js/folkoop.css — совпадают. Это проверка идентичности
трёх файлов, не новый браузерный обход и не проверка всех зависимостей.

29 октября: [19/19 существующих тестов](../workflow/evidence/FK-WF-001/mura-tests.raw.json),
[9/9 проверок workflow после исправлений](../workflow/evidence/FK-WF-001/workflow-recheck.json),
[3/3 валидаций skills](../workflow/evidence/FK-WF-001/skills.raw.json).
[Отдельная поведенческая проба](../workflow/evidence/FK-WF-001/behavior-response.md)
восстановила контекст; [независимое ревью](../workflow/evidence/FK-WF-001/review.md)
нашло две ошибки инструмента, исправления подтверждены. Итог и границы — в
[состоянии пилота](../workflow/tasks/FK-WF-001.state.json). Физический iPhone, все языки, полная регрессия,
реальная БД и текущая публикация этим пилотом не подтверждаются.
«18 открытых историй» не означает выполнение заданий или доказанный интерес людей.

Ниже сохранён прежний индекс. Его «не проверено» относится к моменту написания
черновика; для экскурсии действует последующее свидетельство строго в объёме QA.
Для бюджета/решений и иных модулей проверка Муры не меняет старый статус.

## Исторический индекс до внедрения workflow

Актуализация: 28 октября 2026. Статус: минимальная локальная база знаний.
Не опубликована; не является свидетельством готовности приложения.

Проверено 28 октября: [локальный обход экскурсии Муры](../MURA_TOUR_QA_20261028.md).
Все 18 историй и пять глав на размерах 1366×900 и 390×844, карта, продолжение,
пауза и финал; исправления, успешная сборка и 19 целевых тестов.
Это заменяет статус «не проверено» ниже только в пределах отчёта. Старые записи
о создании сохранены; реальный iPhone, остальные языки и публикация не проверены.

Новое: [завершение экскурсии](../MURA_TOUR_FINALE_DRAFT_20261028.md):
реплика Муры, остаться в аккаунте или повторить любую историю.
Локальный непроверенный код, без публикации.

Новое: [предыдущая история и прогресс](../MURA_STORY_PROGRESS_DRAFT_20261028.md):
позиция, название и количество ещё не открытых историй рядом с навигацией.
Локальный непроверенный код; публикации нет.

Новое: [«Следующая история»](../MURA_NEXT_STORY_DRAFT_20261027.md) —
переход к ещё не открытой истории без карты, включая пропуски.
Локальный непроверенный код; публикации нет.

Новое: [карта экскурсии Муры](../MURA_TOUR_MAP_DRAFT_20261027.md):
5 глав, 18 историй, открытые/оставшиеся и последняя позиция; локальное продолжение.
Код не проверен и не опубликован.

Новое: [истории профиля](../MURA_PROFILE_STORIES_DRAFT_20261027.md):
интересы, навыки, связи, личные идеи и локальная пробная заметка.
Компактная реализация не проверена и не опубликована.

Новое: [истории сообщений](../MURA_MESSAGE_STORIES_DRAFT_20261027.md):
личная переписка, группа и чат проекта, локальный редактируемый черновик
и компактная компоновка сообщений. Не проверено и не опубликовано.

Новое: [истории «Города»](../MURA_CITY_STORIES_DRAFT_20261027.md):
услуги, транспорт и события, самостоятельные переходы и локальный план следующего
шага. Код не проверен и не опубликован.

Новое: [истории «Центра»](../MURA_CENTER_STORIES_DRAFT_20261026.md):
сообщества, люди и пример события Муры, самостоятельный просмотр и локальная
проба. Не проверено и не опубликовано.

Продолжение: [истории «Вместе»](../MURA_TOGETHER_STORIES_DRAFT_20261026.md):
пять существующих примеров, свободное исследование и локальная проба с ответом
Муры. Написано локально, не проверено, не опубликовано.

Новое: [пять глав знакомства с Мурой](../MURA_CHAPTER_TOUR_DRAFT_20261026.md):
профиль → вместе → центр → город → сообщения, пауза, продолжение и повтор.
Локальный непроверенный код; публикации нет.

Последнее продолжение: [уведомления об изменении условий вкладов встречи](../MEETING_BUDGET_NOTIFICATIONS_DRAFT_20261026.md).
Участники видят «было → стало» и свои ответы по текущей версии. Локальный код,
проверки не запускались, миграция не применена, публикации нет.

Новое продолжение: [вклады → готовность встречи](../MEETING_BUDGET_READINESS_DRAFT_20261025.md).
Организатор выбирает потребности и правило «обещание» / «получение до начала»;
условия связаны с версией встречи. Локальный непроверенный код, миграция не применена.

Последнее дополнение: [вклады и бюджет проекта](../PROJECT_BUDGET_DRAFT_20261025.md) —
личное обещание, отдельное подтверждение получения, деньги отдельно от вещей и часов.
Добавлены [уведомления по вкладам](../CONTRIBUTION_NOTIFICATIONS_DRAFT_20261025.md):
организатору об обещании/передаче, автору о подтверждении/уточнении; отзыв и отмена
подтверждения также видимы. Это локальный код, не внешняя рассылка.
Локальный непроверенный код от 25 октября; миграция не применена, публикации нет.
Правила решений и ответы на возражения от 23 октября также не проверены.
«Следующий шаг проекта» также остаётся непроверенным; подробности в состоянии разработки.

| Тема | Что здесь искать |
|---|---|
| [Концепция FOLKOOP](concept.md) | Назначение, четыре истока, принятые границы и архитектурные направления |
| [Токаренко → наша реализация](tokarenko-map.md) | Что взято из сохранённого разбора, что написано и какие пробелы остаются |
| [Состояние разработки](development-status.md) | Локальная ревизия, исторические проверки, непроверенные черновики и уточнения старых ограничений |

[Правила ведения](AGENTS.md) · [Журнал](log.md)

## Как пользоваться

«Что такое проект?» → концепция. «Что ещё нужно от коопсети?» → карта Токаренко.
«Что работает и что делать следующим?» → состояние разработки, затем первичные
свидетельства. Старую дату страницы нельзя принимать за актуальный статус.

Скилл `folkoop-knowledge` установлен локально в Codex отдельно от репозитория.
Вызовы: «Используй $folkoop-knowledge: ответь по проекту», «добавь этот источник»,
«найди устаревшие статусы». Он не является функцией пользовательской соцсети.

Основа организации — идея [LLM Wiki Карпаты](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f):
производные связанные страницы поверх сохранённых источников. Здесь сознательно
нет новой копии архива, векторной базы, автоматического импорта и внешней публикации.

