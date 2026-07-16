import { saveManager, SaveState } from "./save_manager.js";
import { text, spinner } from "@clack/prompts";
import chalk from "chalk";
import { sleep } from "./tools.js";
import { BaseMode, ModeID } from "./base_mode.js";

class ModeManager {
  public playerName: string = "";
  public modeList: Map<ModeID, BaseMode> = new Map();
  private currentMode: BaseMode | null = null;

  public static USER_SAVE_PATH: string = "user-save";

  public async register(id: ModeID, mode: BaseMode) {
    this.modeList.set(id, mode);
  }

  public async start(): Promise<void> {
    const loading = spinner();

    loading.start("Checking saves...");

    const saveExists: boolean = await saveManager.isSaveExists(
      ModeManager.USER_SAVE_PATH,
    );
    await sleep(500);

    if (!saveExists) {
      loading.stop("New User, no saves yet");

      await this.askName();
      console.log(`Hello! ${chalk.bold.underline(this.playerName)}`);
    } else {
      loading.stop("Save found!");
      loading.start("Loading save...");

      const load = await saveManager.loadData(ModeManager.USER_SAVE_PATH);

      await sleep(500);
      if (load) {
        this.playerName = load.data as string;
      }

      loading.stop(`Welcome back! ${chalk.bold.underline(this.playerName)}`);
    }

    await this.transitionTo(ModeID.MainMenu);
  }

  public async transitionTo(mode: ModeID) {
    await this.currentMode?.onExit();

    if (mode === ModeID.Exit) {
      process.exit(0);
    }

    this.currentMode = this.modeList.get(mode) ?? null;
    await this.currentMode?.onEnter();
  }

  private async askName(): Promise<void> {
    const playerName = await text({
      message: "What is your name?",
      placeholder: "Player",
      validate(value: string | undefined) {
        if (value && value.length === 0) return `Value is required!`;
      },
    });

    this.playerName = playerName.toString();

    const toSave: SaveState = {
      mode_name: ModeManager.USER_SAVE_PATH,
      timestamp: Date.now(),
      data: this.playerName,
    };

    saveManager.saveData(ModeManager.USER_SAVE_PATH, toSave);
  }
}

export { ModeManager, BaseMode };
