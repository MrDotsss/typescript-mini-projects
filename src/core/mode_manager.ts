import Authentication from "../modes/authentication.js";
import { MainMenu, SaveManagerMode } from "../modes/modes.js";
import { BaseMode, ModeID } from "./base_mode.js";

export default class ModeManager {
  public modeList: Map<ModeID, BaseMode> = new Map();
  private currentMode: BaseMode | null = null;

  public authentication: Authentication;
  private saveManager: SaveManagerMode;
  private mainMenu: MainMenu;

  constructor() {
    this.authentication = new Authentication(this);
    this.saveManager = new SaveManagerMode(this);
    this.mainMenu = new MainMenu(this);

    this.register(ModeID.Authentication, this.authentication);
    this.register(ModeID.SaveManager, this.saveManager);
    this.register(ModeID.MainMenu, this.mainMenu);
  }

  public async register(id: ModeID, mode: BaseMode) {
    this.modeList.set(id, mode);
  }

  public async start(): Promise<void> {
    await this.transitionTo(ModeID.Authentication);
  }

  public async transitionTo(mode: ModeID) {
    await this.currentMode?.onExit();

    if (mode === ModeID.LOGOUT) {
      await this.authentication.logout();
      mode = ModeID.Authentication;
    } else if (mode === ModeID.EXIT) {
      process.exit(0);
    }

    let modeToTransition = this.modeList.get(mode) ?? null;

    if (modeToTransition && modeToTransition.requiresAuth) {
      const isAuthenticated = await this.authentication.ensureAuthenticated();

      if (!isAuthenticated) {
        modeToTransition = this.authentication;
      }
    }

    this.currentMode = modeToTransition;
    await this.currentMode?.onEnter();
  }
}
