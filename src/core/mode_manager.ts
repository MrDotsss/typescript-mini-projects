import chalk from "chalk";
import { sleep } from "./tools.js";

abstract class BaseMode {
  constructor(protected modeManager: ModeManager) {}

  abstract ModeName(): string;

  playerName(): string {
    return this.modeManager.playerName;
  }
}

class ModeManager {
  private currentMode: BaseMode | null = null;
  public playerName: string = "";
  private modeList: Array<BaseMode> = [];

  addMode(newMode: BaseMode) {
    if (this.modeList.find((mode) => mode.ModeName != newMode.ModeName)) {
      this.modeList.push(newMode);
    }
  }

  async showMenu(): Promise<void> {
    console.log("Running...");
    await sleep(1000);
    console.log(`
      ${chalk.green("Hello World!")}

      `);

    return;
  }
}

export { ModeManager, BaseMode };
