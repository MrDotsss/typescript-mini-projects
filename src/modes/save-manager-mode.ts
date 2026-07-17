import { ModeID } from "../core/base_mode.js";
import { select, confirm } from "@clack/prompts";
import ModeManager from "../core/mode_manager.js";
import { BaseMode } from "../core/base_mode.js";
import { saveManager, SaveState } from "../core/save_manager.js";
import { handleInput, sleep } from "../core/tools.js";
import { format } from "date-fns";
import Authentication from "./authentication.js";

export default class SaveManagerMode extends BaseMode {
  private saves: SaveState[] = [];

  readonly exitOption: string = "exit";
  readonly clearAllOption: string = "clearAll";

  constructor(modeManager: ModeManager) {
    super(modeManager);
  }

  get savePath(): string {
    return "";
  }

  get modeID(): ModeID {
    return ModeID.SaveManager;
  }

  modes: BaseMode[] = [...this.modeManager.modeList.values()].filter(
    (mode: BaseMode) =>
      mode.modeID !== ModeID.Authentication &&
      mode.modeID !== ModeID.MainMenu &&
      mode.modeID !== ModeID.SaveManager &&
      mode.modeID !== ModeID.LOGOUT,
  );

  async fetchSaves(): Promise<void> {
    for (const mode of this.modes) {
      const isExist = await saveManager.isSaveExists(mode.savePath);
      if (isExist) {
        const save = await saveManager.loadData(mode.savePath);
        if (save) {
          this.saves.push(save);
        }
      }
    }
  }

  async onEnter(): Promise<void> {
    console.clear();

    this.loader.start("Fetching saves...");
    await this.fetchSaves();
    this.loader.stop();

    const saveOptions = this.saves.map((info, index) => ({
      value: info.mode_name,
      label: `${this.modes[index].modeID} | ${format(info.timestamp, "MMMM dd, yyyy")}`,
    }));

    const toDelete: string = await handleInput<string>(() =>
      select({
        message: "Select Save to delete",
        options: [
          ...saveOptions,
          { value: this.clearAllOption, label: "Delete All Saves" },
          { value: this.exitOption, label: "Return to main menu" },
        ],
      }),
    );

    if (toDelete === this.exitOption) {
      this.modeManager.transitionTo(ModeID.MainMenu);
      return;
    }

    if (toDelete === this.clearAllOption) {
      const shouldClear = await handleInput<boolean>(() =>
        confirm({
          message: "Confirm clear all saves?",
        }),
      );

      if (shouldClear) {
        this.loader.start("Clearing saves...");
        await saveManager.clearAllData();
        await this.modeManager.authentication.logout();
        await sleep(1000);
        this.loader.stop("All saves cleared");
      }
    } else {
      const shouldDelete = await handleInput<boolean>(() =>
        confirm({
          message: `Confirm Delete? ${toDelete as string}`,
        }),
      );

      if (shouldDelete) {
        this.loader.start("Deleting data...");
        await saveManager.clearData(toDelete as string);
        await sleep(1000);
        this.loader.stop("Save succesfully deleted");
      }
    }

    this.modeManager.transitionTo(this.modeID);
  }

  async onExit(): Promise<void> {
    this.saves.length = 0;
  }
}
