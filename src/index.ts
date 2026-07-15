#!/usr/bin/env node

import { BaseMode, ModeManager } from "./core/mode_manager.js";

const mode_manager: ModeManager = new ModeManager();

const mode_list: Array<BaseMode> = [];

mode_list.forEach((mode) => {
  mode_manager.addMode(mode);
});

await mode_manager.showMenu();
