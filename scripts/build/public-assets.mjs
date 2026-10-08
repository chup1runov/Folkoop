// Canonical public asset contract for build output and service-worker precache.
// Keep product behavior in apps/web; this module only defines which files belong
// to the public artifact and which of those are core offline shell assets.

export const BUILD_FILES=Object.freeze([
  'city-source.html','folkoop.html','styles.css','compact.css','about-project.css',
  'civic-core.js','daily-data.js','today.js','riksdagen.js','nvdb.js',
  'goteborg-plans.js','app.js','about-copy.js','about-project.js',
  'manifest.webmanifest','sw.js','sw-register.js','icon.svg','icon-180.png','icon-192.png',
  'icon-512.png','LICENSE','LICENSING.md','THIRD_PARTY_NOTICES.md',
  'folkoop-core.js','folkoop-i18n-extra.js','folkoop-copy.js','first-contact-preview.js','folkoop-guide.js',
  'folkoop-guide.css','folkoop.js','folkoop.css','folkoop-guide-please.webp',
  'folkoop-guide-confident.webp','folkoop-guide-inspect.webp','folkoop-guide-idea.webp','folkoop-guide-searching.webp','folkoop-guide-lean-in.webp','folkoop-guide-wink.webp',
  
  
  'folkoop-city.js','folkoop-mark.png',
  'folkoop-icon-512.png','network-config.js','analytics.js','network-client.js',
  'network-form-focus.js','network-activity.js','network-messaging.js','network-profile.js','network-communities.js','network-mura-life.js','network-mura-home.js','mura-presentation.js','mura-presentation.css','network-purchase-lifecycle.js','network-ui.js','auth-callback.html',
  'auth-callback-core.mjs','auth-callback.mjs','home-welcome.js'
]);

export const PRECACHE_PATHS=Object.freeze([
  '','index.html','styles.css','compact.css','about-project.css','civic-core.js',
  'daily-data.js','today.js','riksdagen.js','nvdb.js','goteborg-plans.js','app.js',
  'about-copy.js','about-project.js','manifest.webmanifest','sw-register.js','icon.svg',
  'icon-180.png','icon-192.png','icon-512.png','city.html','folkoop-core.js',
  'folkoop-i18n-extra.js','folkoop-copy.js','first-contact-preview.js','folkoop-guide.js','folkoop-guide.css',
  'folkoop.js','folkoop.css','folkoop-guide-please.webp','folkoop-guide-confident.webp',
  'folkoop-guide-inspect.webp','folkoop-guide-idea.webp','folkoop-guide-searching.webp',
  'folkoop-guide-lean-in.webp','folkoop-guide-wink.webp',
  
  'folkoop-city.js',
  'folkoop-mark.png','folkoop-icon-512.png','network-config.js','analytics.js','network-client.js',
  'network-form-focus.js','network-activity.js','network-messaging.js','network-profile.js','network-communities.js','network-mura-life.js','network-mura-home.js','mura-presentation.js','mura-presentation.css','network-purchase-lifecycle.js','network-ui.js','home-welcome.js'
]);
