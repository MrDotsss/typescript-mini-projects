import { intro, select, text, password, confirm } from "@clack/prompts";
import { BaseMode, ModeID } from "../core/base_mode.js";
import ModeManager from "../core/mode_manager.js";
import { handleInput, sleep } from "../core/tools.js";
import chalk from "chalk";
import { saveManager, SaveState } from "../core/save_manager.js";
import bcrypt from "bcrypt";

enum AuthMode {
  LOGIN,
  REGISTER,
  EXIT,
}

interface AuthData {
  username: string;
  password: string;
  createdAt: number;
}

export default class Authentication extends BaseMode {
  private _auth: AuthData | null = null;

  readonly userPath: string = "user-save";

  get auth(): AuthData | null {
    return this._auth;
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
    const saveExists: boolean = await saveManager.isSaveExists(this.userPath);

    if (saveExists) {
      const load = await saveManager.loadData(this.userPath);

      if (load) {
        this.users = load.data as AuthData[];
      }
    }

    await sleep(1000);
    this.loader.stop();
    console.clear();
    await this.displayTitle("TS Mini Projects");

    console.log("\n");
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
  async onExit(): Promise<void> {}

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

      const userExists = this.isUserNameExists(username);

      if (userExists) {
        const passwordValid = await bcrypt.compare(pass, userExists.password);

        if (passwordValid) {
          console.log(
            chalk.green(
              `Logged in as ${chalk.bold.underline.yellow(userExists.username)}`,
            ),
          );
          this._auth = userExists;
          this.modeManager.transitionTo(ModeID.MainMenu);
          break;
        }
      }

      console.log(`${chalk.red.bold("Invalid username or password")}`);

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

      const isInvalid = this.isUserNameExists(username);

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
          username: username,
          password: hash,
          createdAt: Date.now(),
        };
        this.saveInfo(authData);

        this._auth = authData;
        console.log(
          chalk.green(
            `Logged in as ${chalk.bold.underline.yellow(authData.username)}`,
          ),
        );
        this.modeManager.transitionTo(ModeID.MainMenu);
        break;
      }

      console.log(`${chalk.yellow(`Username ${username} already exists`)}`);
    }
  }

  public logout() {
    console.log(`${chalk.red.bold(this._auth?.username)} logged out`);
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

  private isUserNameExists(username: string): AuthData | undefined {
    return this.users.find((user) => user.username === username);
  }
}
