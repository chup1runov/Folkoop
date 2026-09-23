# Third-party rights boundary

The root LICENSE applies only to original protected material whose relevant rights are held by Pavel Chuprunov. It does not relicense outside software, official data, contributors' work or public-domain facts. Specific upstream terms prevail for the material they cover, including any mandatory attribution or redistribution conditions.

## Identified categories, not a complete bill of materials

- `package.json` declares `serve` (`^14.2.4`) for local serving. It and its transitive packages are third-party software under their own distributed notices and licences. They are not made proprietary by the root LICENSE. `scripts/build-site.mjs` copies an explicit allowlist and does not copy `node_modules` into the static site.
- Node, Python, the browser test driver/browser and GitHub Actions are external development or execution tools. Their own licences and terms apply; the project's notice does not change them.
- Data and links from SMHI, Trafikverket/NVDB, Sveriges riksdag and Göteborgs Stad retain their respective source terms and applicable public-information rules. Generated feeds are not made exclusively owned data by this notice. Existing source names, original links and timestamps remain present.
- User-created descriptions, feedback and other user output are not transferred to the project owner by these terms.
- Code, illustrations, text or other materials contributed or licensed by another author retain that author's applicable rights and notices. Inclusion alone is not proof of title or originality.

## Maintainer rule

Before incorporating another dependency, copied excerpt, media asset or substantive outside contribution, record its source, version, licence and required notices. Do not remove an existing licence, grant, attribution or copyright notice. Verify compatibility with the intended distribution separately. If bundled software requires inclusion of its licence text, ship that actual upstream text; this boundary note is not a replacement.

This document is a limited inventory and preservation rule, not certification that every existing line and transitive dependency has been audited. Report a missing attribution through the contact in LICENSING.md, without disclosing confidential case information.
