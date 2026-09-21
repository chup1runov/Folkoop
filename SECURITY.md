# Security

Sverinav är i tidig prototypfas och ska inte hantera känsliga personuppgifter eller autentiserade myndighetsärenden ännu.

## Rapportera en sårbarhet

Publicera inte autentiseringsuppgifter, personuppgifter eller detaljer som gör en aktiv sårbarhet lätt att utnyttja i en offentlig issue.

Kontakta projektägaren privat via GitHub-profilens tillgängliga kontaktväg och beskriv:
- vad som är påverkat,
- hur problemet kan reproduceras,
- möjlig konsekvens,
- föreslagen åtgärd om sådan finns.

## Secrets

API-nycklar, tokens och andra hemligheter ska lagras i hostingplattformens secret/environment-variable-system och aldrig committas till repositoryt.
