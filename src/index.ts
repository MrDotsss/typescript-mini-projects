#!/usr/bin/env node

import { ModeID } from "./core/base_mode.js";
import ModeManager from "./core/mode_manager.js";
import * as Modes from "./modes/modes.js";

const mode_manager: ModeManager = new ModeManager();

mode_manager.register(ModeID.MadlibsGame, new Modes.MadlibsGame(mode_manager));

await mode_manager.start();
