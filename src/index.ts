#!/usr/bin/env node

import { ModeID } from "./core/base_mode.js";
import { ModeManager } from "./core/mode_manager.js";
import * as Modes from "./modes/init.js";

const mode_manager: ModeManager = new ModeManager();

mode_manager.register(ModeID.MainMenu, new Modes.MainMenu(mode_manager));
mode_manager.register(
  ModeID.SaveManager,
  new Modes.SaveManagerMode(mode_manager),
);

await mode_manager.start();
