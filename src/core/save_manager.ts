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
import { writeLine } from "./tools.js";

const save_path: string = path.join(process.cwd(), "saves");

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
      await writeLine(chalk.bgRed(`Could not load save for ${mode_name}`));
      return null;
    }
  }

  async saveData(mode_name: string, data: SaveState): Promise<boolean> {
    try {
      const savePath: string = await this.verifyPath(mode_name);

      await writeFile(savePath, JSON.stringify(data, null, 4), "utf-8");

      return true;
    } catch (error) {
      await writeLine(chalk.bgRed(`Could not save data for ${mode_name}`));
      return false;
    }
  }

  async clearData(mode_name: string): Promise<boolean> {
    try {
      const savePath: string = await this.verifyPath(mode_name);

      await unlink(savePath);
      return true;
    } catch (error: any) {
      return false;
    }
  }

  async clearAllData(): Promise<boolean> {
    try {
      await rm(save_path, { recursive: true, force: true });

      await this.checkDirectory();

      return true;
    } catch (error) {
      return false;
    }
  }
}

const saveManager = new SaveManager();

export { SaveState, saveManager };
