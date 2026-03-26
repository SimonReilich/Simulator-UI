# Proto-Sim-GUI

A graphical user interface wrapper for [proto-sim](https://github.com/SimonReilich/proto-sim), a simulator for population protocols with snipers. 

This application provides a visual frontend to the underlying Haskell command-line engine. It allows users to intuitively configure and simulate single executions of different protocols and manage random or manual snipers without needing to memorize CLI arguments. It exposes the core engine's capabilities.

Like the core simulator, this tool was built to support research for the TUMKolleg-programm.

# Features

The GUI visually maps to all functionalities and options of the `proto-sim` CLI:

- **Protocol Selection:** Dropdowns and toggles to select between different protocols (`maj`, `pbl`, `cut`, `mod`, `cmb`, `p`).
- **Parameter Input:** Dedicated input fields for initial states, replacing positional command-line arguments.
- **Sniper Control:** Toggles to enable the sniper, sliders/inputs for the rate `<rt>`, and a switch to enable the manual/interactive sniper mode.
- **Execution Options:** Controls to adjust execution step delay `<dl>` and set custom seeds `<sd>`.

# Usage

*Note: The GUI requires the `proto-sim` executable to be installed and accessible on your system.*

Once launched, the interface (opened in your web-browser) is divided into configuration and execution:

1. Select the desired operation mode (Single Execution vs. Statistics).
2. Choose the specific protocol.
3. Fill in the required parameters that appear for the chosen protocol.
4. Adjust optional settings (Sniper settings, Delay, Seed, Output File).
5. Run the simulation. The GUI will interface with the `proto-sim` binary, execute the command and present the output.
