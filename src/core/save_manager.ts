import chalk from "chalk";
import {
  mkdir,
  readFile,
  writeFile,
  access,
  constants,
  unlink,
  rm,
} from "node:fs/promises";
import path from "node:path";

const save_path: string = "saves";

interface SaveState {
  mode_name: string;
  timestamp: number;
  data: any;
}

class SaveManager {
  async checkDirectory(): Promise<void> {
    await mkdir(save_path, { recursive: true });
  }

  async verifyPath(fileName: string): Promise<string> {
    await this.checkDirectory();

    if (fileName.endsWith(".json")) {
      return path.join(save_path, fileName);
    } else return path.join(save_path, `${fileName}.json`);
  }

  async isSaveExists(mode_name: string): Promise<boolean> {
    try {
      const savePath: string = await this.verifyPath(mode_name);

      await access(savePath, constants.F_OK);
      return true;
    } catch (error) {
      return false;
    }
  }

  async loadData(mode_name: string): Promise<SaveState | null> {
    try {
      const savePath: string = await this.verifyPath(mode_name);
      const load = await readFile(savePath, "utf-8");

      return JSON.parse(load) as SaveState;
    } catch (error) {
      console.log(chalk.bgRed(`SAVE FOR ${mode_name} not found!`));
      console.error(error);
      return null;
    }
  }

  async saveData(mode_name: string, data: SaveState): Promise<boolean> {
    try {
      const savePath: string = await this.verifyPath(mode_name);

      await writeFile(savePath, JSON.stringify(data, null, 4), "utf-8");

      return true;
    } catch (error) {
      console.log(chalk.bgRed(`CAN'T SAVE: ${mode_name}`));
      console.error(error);
      return false;
    }
  }

  async clearData(mode_name: string): Promise<boolean> {
    try {
      const savePath: string = await this.verifyPath(mode_name);

      await unlink(savePath);
      return true;
    } catch (error: any) {
      if (error.code === "ENOENT") {
        console.error(`File does not exist: ${mode_name}`);
      } else {
        console.error(`Error deleting file: ${error.message}`);
      }
      return false;
    }
  }

  async clearAllData(): Promise<boolean> {
    try {
      await rm(save_path, { recursive: true, force: true });

      await this.checkDirectory();

      return true;
    } catch (error) {
      console.log("Error Clearing data");
      return false;
    }
  }
}

const saveManager = new SaveManager();

export { SaveState, saveManager };
