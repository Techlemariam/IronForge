{ pkgs, ... }: {
  # Kanal för stabila paket
  channel = "stable-23.11";

  # 1. Verktygslådan: Optimerad för snabbhet och AI-autonomi
  packages = [
    # Runtime & Package Managers
    pkgs.nodejs_22
    pkgs.pnpm            # Snabbare än npm, sparar diskutrymme
    pkgs.bun             # För blixtsnabb exekvering av scripts
    
    # Databasverktyg
    pkgs.postgresql      # Inkluderar psql för DB-inspektion
    
    # AI-hjälpmedel (Ger dina agenter "händer" och "ögon")
    pkgs.ripgrep         # Blixtsnabb sökning för agentisk analys
    pkgs.fd              # Enkel filhitta för scripts
    pkgs.gh              # GitHub CLI för automatiserade PRs
    pkgs.jq              # För att manipulera JSON i terminal-pipelines
    
  ];

  # 2. Miljövariabler
  env = {
    # Standard DB-sträng för lokal utveckling (anpassa efter din provider)
    DATABASE_URL = "postgresql://user:password@localhost:5432/mydb?schema=public";
    NODE_ENV = "development";
  };

  # 3. VS Code Extensions (Installeras automatiskt i Antigravity)
  idx.extensions = [
    "steoates.autoimport"          # Sparar tid vid refaktorer
    "dbaeumer.vscode-eslint"       # Håll koden ren för agenterna
    "esbenp.prettier-vscode"       # Formatering
    "prisma.prisma"                # Om du använder Prisma (rekommenderas)
    "bradlc.vscode-tailwindcss"    # För snabb UI-styling
    "mechatroner.lucid-architecture" # För visuell arkitekturöversikt
  ];

  # 4. Automatisering (Hooks) - Din "Nap-time" räddare
  idx.hooks = {
    # Körs när containern skapas (engångsjobb)
    onCreate = {
      pnpm-install = "pnpm install";
      # Generera Prisma-klienten så agenterna ser typerna direkt
      prisma-gen = "npx prisma generate";
    };
    
    # Körs varje gång du öppnar projektet
    onStart = {
      # Synka DB asynkront så du kan börja koda direkt
      db-sync = "npx prisma db push --skip-generate";
      # Kör audit för att hitta sårbarheter i bakgrunden
      security-check = "pnpm audit";
    };
  };

  # 5. Previews & Port-forwarding
  idx.previews = {
    enable = true;
    previews = {
      web = {
        command = [
          "pnpm"
          "run"
          "dev"
          "--"
          "--port"
          "$PORT"
          "--host"
          "0.0.0.0"
        ];
        manager = "web";
      };
    };
  };

  # 6. Fördefinierade Workflows (Commands)
  # Dessa kan dina agenter anropa eller du själv via Command Palette
  idx.commands = {
    "prod-build" = "pnpm build";
    "test-all" = "pnpm vitest run && npx playwright test";
    "db-studio" = "npx prisma studio";
  };
}