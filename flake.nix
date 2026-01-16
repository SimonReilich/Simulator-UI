{
  description = "UI for PopProtoSim-Neo";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs =
    { self, nixpkgs }:
    let
      supportedSystems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];
      forAllSystems = nixpkgs.lib.genAttrs supportedSystems;
      pkgsFor = system: import nixpkgs { inherit system; };
    in
    {
      packages = forAllSystems (
        system:
        let
          pkgs = pkgsFor system;

          frontend = pkgs.buildNpmPackage {
            pname = "protosim-ui-frontend";
            version = "0.1.0";
            src = ./frontend;

            npmDepsHash = "sha256-QLbdGXLhXw/C++UBIx1PN9MdFwYYoTGN5tK0wbgr7Ds=";

            NG_CLI_ANALYTICS = "false";
            npmBuildScript = "build";

            installPhase = ''
              mkdir -p $out
              cp -r dist/frontend/browser/* $out/
            '';
          };

        in
        {
          default = pkgs.rustPlatform.buildRustPackage {
            pname = "protosim-ui";
            version = "0.1.0";
            src = ./backend;

            cargoHash = "sha256-Q2RHYxiFqCgvimpYmdwuYZPuvH3ES0Sa1HXuaIXkfy0=";

            FRONTEND_DIST = "${frontend}";

            nativeBuildInputs = [ pkgs.pkg-config ];
            buildInputs = [ pkgs.openssl ];
          };

          frontend = frontend;
        }
      );

      apps = forAllSystems (
        system:
        let
          pkgs = pkgsFor system;
          binary = "${self.packages.${system}.default}/bin/backend";

          runScript = pkgs.writeShellScriptBin "run-simulation" ''
            ${pkgs.lsof}/bin/lsof -ti:4444 | xargs kill -9 2>/dev/null || true

            case "$(uname)" in
              Linux)  OPEN_CMD="zen-browser" ;; # Try Zen directly if on path
              Darwin) OPEN_CMD="open" ;;
              *)      OPEN_CMD="" ;;
            esac

            if ! command -v $OPEN_CMD &> /dev/null; then
              OPEN_CMD="${pkgs.xdg-utils}/bin/xdg-open"
            fi

            ${binary} &
            BACKEND_PID=$!

            sleep 1

            if [ -n "$OPEN_CMD" ]; then
              $OPEN_CMD "http://127.0.0.1:4444" >/dev/null 2>&1 &
            fi

            trap "kill $BACKEND_PID" EXIT
            wait $BACKEND_PID
          '';
        in
        {
          default = {
            type = "app";
            program = "${runScript}/bin/run-simulation";
            meta = {
              description = "protosim-ui is a ui wrapper for popprotosim-neo";
            };
          };
        }
      );

      checks = forAllSystems (system: {
        backend = self.packages.${system}.default;
        frontend = self.packages.${system}.frontend;
      });

      devShells = forAllSystems (
        system:
        let
          pkgs = pkgsFor system;
        in
        {
          default = pkgs.mkShell {
            buildInputs = with pkgs; [
              cargo
              rustc
              nodejs_20
              nodePackages.npm
              nodePackages."@angular/cli"
              pkg-config
              openssl
            ];
          };
        }
      );
    };
}
