{
  description: "IronForge RPG - Modern Nix Development Environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config.allowUnfree = true;
        };
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # Runtime & Package Managers
            nodejs_22
            pnpm
            bun
            
            # Database
            postgresql_16
            
            # Tools
            ripgrep
            fd
            gh
            jq
          ];

          shellHook = ''
            echo "🛡️ IronForge Development Environment Loaded"
            echo "Node.js: $(node --version)"
            echo "pnpm: $(pnpm --version)"
            echo "PostgreSQL: $(psql --version)"
            
            # Set up local environment variables if needed
            export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ironforge?schema=public"
          '';
        };
      }
    );
}
