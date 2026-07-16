import ModeManager from "./mode_manager.js";
import { spinner, SpinnerResult } from "@clack/prompts";
import { saveManager, SaveState } from "./save_manager.js";
import figlet from "figlet";
import chalk from "chalk";
import { pastel } from "gradient-string";

enum ModeID {
  MainMenu = "Main Menu",
  SaveManager = "Save Manager",
  MadlibsGame = "Madlibs Game",
  Exit = "Exit",
}

abstract class BaseMode {
  protected loader: SpinnerResult = spinner();
  constructor(protected modeManager: ModeManager) {}

  abstract get modeID(): ModeID;
  abstract get savePath(): string;

  abstract onEnter(): Promise<void>;
  abstract onExit(): Promise<void>;

  get playerName(): string {
    return this.modeManager.playerName;
  }

  protected toSave(data: any) {
    const save: SaveState = {
      mode_name: this.savePath,
      timestamp: Date.now(),
      data: data,
    };

    saveManager.saveData(this.savePath, save);
  }

  async displayTitle(title: string, font: string = "Doom"): Promise<void> {
    const toPrint = await figlet.text(title, { font: font });

    console.log(pastel.multiline(toPrint));
  }
}

export { BaseMode, ModeID };
