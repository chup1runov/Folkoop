# FK-CI-001 — причина и минимальное исправление

Проверено 29 октября 2026. Только GET-запросы, без запуска Actions.
Свежий список последних пяти запусков main вернул последним run 40679481253
от 28 октября, SHA 800a1fe3127b76ae20b8dda753a7199fe553a359.
[Сохранённая выборка API](fresh-ci-runs.json).

Полностью прочитан журнал [job 122786215046](https://github.com/chup1runov/Folkoop/actions/runs/40679481253/job/122786215046),
attempt 1. Runner 2.338.0, Ubuntu 26.04.1, image ubuntu-26.04,
image version 20261012.163.1. Python 3.12.15, Node 22.23.3.
pip успешно установил playwright 1.57.0. Следующая команда
`python -m playwright install --with-deps webkit` завершилась exit 1:

```text
Error: ERROR: Playwright does not support webkit on ubuntu26.04-x64
```

Корневая причина: плавающий ubuntu-latest выбрал неподдерживаемую платформу
для закреплённого Playwright. Это не ошибка загрузки pip и не падение приложения.
WebKit build/smoke steps были skipped; validate/sources success, deploy skipped.

Проверен первичный [hostPlatform.ts версии v1.57.0](https://github.com/microsoft/playwright/blob/v1.57.0/packages/playwright-core/src/server/utils/hostPlatform.ts),
Git blob 635d65d3d98ce67741cb7eb20b455751c990f0db: Ubuntu 24.04 поддерживается,
26.04 не относится к поддерживаемым платформам этой версии.

Исправление: только jobs.webkit.runs-on → ubuntu-24.04 в
[pages.yml](../../../../.github/workflows/pages.yml), с поясняющим комментарием.
Обновление Playwright затронуло бы браузерную версию и регрессию; оно не требуется
для устранения выявленного несовпадения. Retry не исправляет несовместимость ОС.
Остальные jobs, 13 smoke scripts, Playwright 1.57.0 и dependency deploy сохранены.
[Проверка структуры до/после](runner-contract-check.json).

Ubuntu 24.04 — закреплённая версия ОС, не неизменный digest образа: последующие
обновления пакетов runner по-прежнему возможны. Linux execution этим выводом
не доказан. Локальные проверки на macOS и непроверенное указаны отдельно.
Патч не отправлен в GitHub. Никакой rerun/dispatch не выполнялся.
