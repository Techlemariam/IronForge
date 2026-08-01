# ADR 001: Standardiserad Panopticon CI/CD Runner

## Status
Godkänd (Accepted)

## Sammanhang (Context)
Panopticon-plattformen orkestrerar flera olika tjänster och applikationer (t.ex. `IronForge`, `Taktpinne`, `Matlogistik` och `369-cykelservice`). Dessa applikationer har varierande och ibland tunga bygg- och testberoenden:
- **IronForge**: Next.js, PostgreSQL (Prisma), Cypress, Playwright, Doppler CLI, Docker, jq.
- **Taktpinne**: React, Tauri (Rust toolchain, cargo/rustc, systembibliotek som Webkit2GTK och GTK3), Biome.
- **Matlogistik**: React, Express-server, Playwright (systemwebbläsare).
- **369-cykelservice**: Vue 3, Vitest, npm.

Tidigare användes en standard-image (`myoung34/github-runner:latest`) för de själv-hostade runner-instanserna på **VM200**. Det ledde till att körningar misslyckades på grund av saknade binärer och bibliotek (såsom `docker`, `jq` och browser engines) när jobben kördes direkt i runner-kontexten.

## Beslut (Decision)
Vi beslutar att standardisera alla Panopticon CI/CD-runners genom att bygga en skräddarsydd Docker-image baserad på `myoung34/github-runner:latest`. Denna image paketerar alla gemensamma och specifika byggverktyg:

1. **Pakethanterare**: Installera och konfigurera både `npm` och `pnpm` (specifikt låst till version `10.4.1` för att matcha Taktpinnes krav).
2. **Kompileringsverktyg**: Installera Rust-toolchain (`rustup`, `rustc`, `cargo`) samt nödvändiga Linux-bibliotek (`libwebkit2gtk-4.1-dev`, `libgtk-3-dev` m.fl.) för att stödja Tauri-byggen för Taktpinne.
3. **Integrationstester & Webbläsare**: Förinstallera systembibliotek för Playwright och Cypress genom `npx playwright install-deps`.
4. **Verktyg & Säkerhet**: Installera `doppler` CLI (för secrets-injektion) och `jq` (för JSON-manipulering och metrics). Dependency audit körs genom respektive repos pakethanterare och kräver ingen separat scanner-CLI i runner-imagen.
5. **Docker CLI**: Integrera Docker CLI och exponera `/var/run/docker.sock` i compose-filen för Docker-in-Docker / Docker-out-of-Docker-operationer.

## Konsekvenser (Consequences)
- **Fördelar**:
  - Högre stabilitet och färre "missing dependency"-fel under CI/CD-jobb.
  - Extremt reducerad byggtid för Tauri/Rust-applikationer då toolchains är förinstallerade.
  - Konsistent beteende över alla Panopticon-anslutna applikationer.
  - Mindre runner-image och färre externa tokenberoenden.
- **Nackdelar**:
  - Större storlek på runner-imagen (ökat lagringsutrymme på VM200).
  - Kräver centralt underhåll och periodiska uppdateringar av bas-imagen vid nya verktygskrav.
