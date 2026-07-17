import { intro, select } from "@clack/prompts";
import { BaseMode, ModeID } from "../core/base_mode.js";
import ModeManager from "../core/mode_manager.js";
import { sleep } from "../core/tools.js";
import chalk from "chalk";

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
    if (!this.modeManager.authentication.auth) {
      this.modeManager.transitionTo(ModeID.Authentication);
      return;
    }

    console.clear();

    const modes = [...this.modeManager.modeList.keys(), ModeID.LOGOUT];

    await this.displayTitle("TS Mini Projects");
    console.log(
      `Hello! ${chalk.green(this.modeManager.authentication.auth?.username)}`,
    );
    intro("MODE SELECTION");
    const mode: symbol | ModeID = await select({
      message: "Pick a mode:",
      options: modes
        .filter(
          (mode) => mode !== ModeID.MainMenu && mode !== ModeID.Authentication,
        )
        .map((mode: ModeID) => ({
          value: mode,
          label: mode.toString(),
        })),
    });

    if (mode !== ModeID.LOGOUT) {
      this.loader.start("Launching...");
      await sleep(1000);
      this.loader.stop();
    }

    console.clear();
    await this.modeManager.transitionTo(mode as ModeID);
  }
  async onExit(): Promise<void> {}
}
