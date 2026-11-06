# FK-STAB-002 — аудит 6–10
Дата 2026-11-06. Локальная работа, без публикации и hosted DB.
Предыдущий FK-STAB-001 сохранён; baseline изменяемых файлов вне репозитория FOLKOOP_STAB002_BASELINE.

Критерии: C06 публикация ожидает SQL job того же SHA; отдельно проверить Cloudflare gate.
C07 восстановленный набор тестов остаётся зелёным.
C08 отдельные SQL сценарии новых документов/бюджета/помещения, не только применение миграций.
C09 безопасное восстановление входа без хранения токенов в localStorage; архитектура HttpOnly/server одобрена владельцем 2026-11-06, проверяется локально.
C10 отказ необязательных данных не блокирует текущий раздел; ошибки не выдаются за полный успешный результат; Auth/STale ошибки остаются фатальными.

План: reusable database CI; проверка прежних исправлений; изоляция загрузок; SQL сценарии; согласованная архитектура сессии; проверки и wiki.
Саморевью: нельзя объявлять Cloudflare защищённым только изменением GitHub YAML; нельзя считать новые workflows удалённо проверенными. Не ослаблять авторизацию и не подменять ошибку обязательного членства пустым успехом.

FK-STAB-002-R06 / FK-STAB-002-T06: выполнить и проверить C06.
FK-STAB-002-R07 / FK-STAB-002-T07: выполнить и проверить C07.
FK-STAB-002-R08 / FK-STAB-002-T08: выполнить и проверить C08.
FK-STAB-002-R09 / FK-STAB-002-T09: выполнить и проверить C09.
FK-STAB-002-R10 / FK-STAB-002-T10: выполнить и проверить C10.

## Accepted session design, 2026-11-06
Owner explicitly approved Pages Functions + HttpOnly-cookie. Opaque 256-bit cookie;
D1 stores SHA-256 identifier and AES-GCM encrypted Supabase token pair. No service
role key. Same-origin BFF retains RLS; strict Origin on writes; no-store responses.
Refresh uses an atomic lease, preserving parallel requests without token reuse.
Local validation must cover restore, logout, expiry, CSRF and isolation; production
bindings/secret provisioning and publication remain outside this task. Static
GitHub builds keep memory-only compatibility; server mode is explicit opt-in.
Plan self-review: D1 adds an activation dependency, recorded rather than silently
provisioned. Expired rows are purged on session creation. No credentials in logs.

## Result
Local acceptance C06–C10 checked; see [results](../evidence/FK-STAB-002/results.md).
Activation/deployment are separate and were not performed.
