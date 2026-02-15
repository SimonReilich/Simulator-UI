{
  description = "UI for PopProtoSim-Neo";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    popprotosim.url = "github:SimonReilich/PopProtoSim-Neo";
  };

  outputs = { self, nixpkgs, popprotosim }:
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
      packages = forAllSystems (system:
        let
          pkgs = pkgsFor system;
          simulator = popprotosim.packages.${system}.default;

          frontend = pkgs.buildNpmPackage {
            pname = "protosim-ui-frontend";
            version = "0.1.0";
            src = ./frontend;

            npmDepsHash = "sha256-OAt1ODCRxerWdbYlsaZrNl6b48zKe8r0n9fQ9TzGQwU=";

            NG_CLI_ANALYTICS = "false";

            npmBuildScript = "build";
            
            installPhase = ''
              mkdir -p $out/share/www
              cp -r dist/protosim-ui-frontend/browser/* $out/share/www
              
              mkdir -p $out/bin
              cat <<EOF > $out/bin/protosim-ui-frontend
              #!/bin/sh
              echo "Starting server at http://localhost:8080"
              ${pkgs.python3}/bin/python3 -m http.server 8080 --directory $out/share/www
              EOF
              chmod +x $out/bin/protosim-ui-frontend
            '';
          };
        in
        {
          default = pkgs.rustPlatform.buildRustPackage {
            pname = "protosim-ui";
            version = "0.1.0";
            src = ./backend;
            cargoHash = "sha256-p2OMDyr/URGBEyDeEYCWBDRBN0jUKy0SlvX+BQ4cbBU=";
            FRONTEND_DIST = "${frontend}";

            nativeBuildInputs = [ pkgs.pkg-config ];
            buildInputs = [ pkgs.openssl ];
            
            propagateBuildInputs = [ simulator ];
          };

          frontend = frontend;
        }
      );

      apps = forAllSystems (system:
        let
          pkgs = pkgsFor system;
          binary = "${self.packages.${system}.default}/bin/backend";
          simulatorBin = "${popprotosim.packages.${system}.default}/bin";

          runScript = pkgs.writeShellScriptBin "run-simulation" ''
            ${pkgs.lsof}/bin/lsof -ti:4444 | xargs kill -9 2>/dev/null || true
            
            # Add the simulator to the PATH so the Rust backend can find it
            export PATH="${simulatorBin}:$PATH"

            case "$(uname)" in
              Linux)  OPEN_CMD="zen-browser" ;;
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

      devShells = forAllSystems (system:
        let
          pkgs = pkgsFor system;
        in
        {
          default = pkgs.mkShell {
            buildInputs = with pkgs; [
              cargo
              rustc
              nodejs_24
              nodePackages.npm
              pkg-config
              openssl
              popprotosim.packages.${system}.default
            ];
          };
        }
      );
    };
}
