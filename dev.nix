[pkgs]
javascript.enable = true
nodejs.version = "20"
terminal.enable = true

[previews]
web = {
    command = ["npm", "run", "dev"],
    port = 5173
}

[languages]
javascript = {
    typescript.enable = true
}

[nix]
repo = "github:jetpack-io/devbox"
version = "0.10.2"
