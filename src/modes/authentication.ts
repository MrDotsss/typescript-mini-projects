import { intro, select, text, password, confirm } from "@clack/prompts";
import { BaseMode, ModeID } from "../core/base_mode.js";
import ModeManager from "../core/mode_manager.js";
import { handleInput, sleep, writeLine } from "../core/tools.js";
import chalk from "chalk";
import { saveManager, SaveState } from "../core/save_manager.js";
import bcrypt from "bcrypt";
import { randomUUID } from "node:crypto";
import {
  jwtService,
  AccessPayload,
  RefreshPayload,
} from "../core/jwt-service.js";

enum AuthMode {
  LOGIN,
  REGISTER,
  EXIT,
}

interface AuthData {
  id: string;
  username: string;
  password: string;
  createdAt: number;
}

export default class Authentication extends BaseMode {
  private _auth: AuthData | null = null;
  private _refreshToken: string | null = null;

  readonly userPath: string = "user-save";

  override get requiresAuth(): boolean {
    return false;
  }

  get auth(): AuthData | null {
    return this._auth;
  }

  get refreshToken(): string | null {
    return this._refreshToken;
  }

  private users: AuthData[] = [];

  constructor(modeManager: ModeManager) {
    super(modeManager);
  }

  get modeID(): ModeID {
    return ModeID.Authentication;
  }
  get savePath(): string {
    return "user-save";
  }

  async onEnter(): Promise<void> {
    console.clear();
    this.loader.start("Initializing");

    const authenticated = await this.ensureAuthenticated();

    if (authenticated) {
      this.loader.stop(
        chalk.green(
          `Welcome back! ${chalk.bold.yellow.underline(this._auth?.username)}`,
        ),
      );
      await sleep(1000);
      this.modeManager.transitionTo(ModeID.MainMenu);
      return;
    }

    await sleep(1000);
    this.loader.stop();
    console.clear();
    await this.displayTitle("TS Mini Projects");

    intro("Authentication");
    const mode = await handleInput<AuthMode>(() =>
      select({
        message: "Login or Register",
        options: [
          { value: AuthMode.LOGIN, label: "Login" },
          { value: AuthMode.REGISTER, label: "Register" },
          { value: AuthMode.EXIT, label: "Exit" },
        ],
      }),
    );

    if (mode === AuthMode.EXIT) {
      process.exit(0);
    }

    if (mode === AuthMode.LOGIN) {
      await this.login();
    } else {
      await this.register();
    }
  }

  async onExit(): Promise<void> {
    this.users.length = 0;
  }

  private async loadUsers(): Promise<void> {
    const saveExists: boolean = await saveManager.isSaveExists(this.userPath);

    if (saveExists) {
      const load = await saveManager.loadData(this.userPath);

      if (load) {
        this.users = load.data as AuthData[];
      }
    }
  }

  private async login(): Promise<void> {
    while (true) {
      const username = await handleInput<string>(() =>
        text({
          message: "Username",
          validate(value) {
            if (value && !value.trim()) {
              return chalk.red("Username is required!");
            }
          },
        }),
      );
      const pass = await handleInput<string>(() =>
        password({
          message: "Password",
          mask: "*",
          validate(value) {
            if (!value || value.length < 8)
              return "Password must be at least 8 characters.";
          },
        }),
      );

      const userExists = this.findUserByUsername(username);

      if (userExists) {
        const passwordValid = await bcrypt.compare(pass, userExists.password);

        if (passwordValid) {
          await writeLine(
            chalk.green(
              `Logged in as ${chalk.bold.underline.yellow(userExists.username)}`,
            ),
          );
          this._auth = userExists;
          this._refreshToken = jwtService.createRefreshToken(userExists);

          jwtService.saveSession(this._refreshToken);

          this.modeManager.transitionTo(ModeID.MainMenu);
          break;
        }
      }

      await writeLine(`${chalk.red.bold("Invalid username or password")}`);

      const tryAgain = await handleInput<boolean>(() =>
        confirm({
          message: "Try again?",
        }),
      );

      if (!tryAgain) {
        this.modeManager.transitionTo(ModeID.Authentication);
        break;
      }
    }
  }

  private async register(): Promise<void> {
    while (true) {
      const username = await handleInput<string>(() =>
        text({
          message: "Username",
          validate(value) {
            if (value && !value.trim()) {
              return chalk.red("Username is required!");
            }
          },
        }),
      );

      const isInvalid = this.findUserByUsername(username);

      if (!isInvalid) {
        const pass = await handleInput<string>(() =>
          password({
            message: "Password",
            mask: "*",
            validate(value) {
              if (!value || value.length < 8)
                return "Password must be at least 8 characters.";
            },
          }),
        );
        const hash = await bcrypt.hash(pass, 10);

        const authData: AuthData = {
          id: randomUUID(),
          username: username,
          password: hash,
          createdAt: Date.now(),
        };
        this.saveInfo(authData);

        this._auth = authData;

        this._refreshToken = jwtService.createRefreshToken(authData);

        jwtService.saveSession(this._refreshToken);

        await writeLine(
          chalk.green(
            `Logged in as ${chalk.bold.underline.yellow(authData.username)}`,
          ),
        );
        this.modeManager.transitionTo(ModeID.MainMenu);
        break;
      }

      await writeLine(`${chalk.yellow(`Username ${username} already exists`)}`);
      console.clear();
    }
  }

  public async ensureAuthenticated(): Promise<boolean> {
    await this.loadUsers();

    const refreshToken = await jwtService.loadSession();

    if (refreshToken) {
      try {
        const payload: RefreshPayload = jwtService.verifyRefresh(refreshToken);

        const user: AuthData | undefined = this.findUserById(payload.id);

        if (user) {
          this._auth = user;
          return true;
        } else {
          await writeLine(chalk.bgRed("User no longer exists."));
          return false;
        }
      } catch (error) {
        await jwtService.clearSession();

        await writeLine(chalk.bgRed("Session expired. Please log in again."));
        return false;
      }
    }

    return false;
  }

  public async logout() {
    jwtService.clearSession();
    this.users.length = 0;
    await writeLine(`${chalk.red.bold(this._auth?.username)} logged out`);
    this._auth = null;
  }

  private saveInfo(data: AuthData): void {
    const toSave: SaveState = {
      mode_name: this.savePath,
      timestamp: Date.now(),
      data: [...this.users, data],
    };

    saveManager.saveData(this.savePath, toSave);
  }

  private findUserByUsername(username: string): AuthData | undefined {
    return this.users.find((user) => user.username === username);
  }

  private findUserById(id: string): AuthData | undefined {
    return this.users.find((user) => user.id === id);
  }
}

export { AuthData };
