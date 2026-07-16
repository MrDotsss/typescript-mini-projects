import { intro, select } from "@clack/prompts";
import { BaseMode, ModeID } from "../core/base_mode.js";
import ModeManager from "../core/mode_manager.js";
import { sleep } from "../core/tools.js";

export default class MainMenu extends BaseMode {
  constructor(modeManager: ModeManager) {
    super(modeManager);
  }

  get modeID(): ModeID {
    return ModeID.MainMenu;
  }

  get savePath(): string {
    return "main-menu";
  }

  async onEnter(): Promise<void> {
    console.clear();

    const modes = [...this.modeManager.modeList.keys(), ModeID.Exit];

    await this.displayTitle("TS Mini Projects");

    intro("MODE SELECTION");
    const mode: symbol | ModeID = await select({
      message: "Pick a mode:",
      options: modes
        .filter((mode) => mode !== ModeID.MainMenu)
        .map((mode: ModeID) => ({
          value: mode,
          label: mode.toString(),
        })),
    });

    if (mode !== ModeID.Exit) {
      this.loader.start("Launching...");
      await sleep(1000);
      this.loader.stop();
    }

    console.clear();
    await this.modeManager.transitionTo(mode as ModeID);
  }
  async onExit(): Promise<void> {}
}
