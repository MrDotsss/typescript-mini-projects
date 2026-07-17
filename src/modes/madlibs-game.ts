import axios from "axios";
import { BaseMode, ModeID } from "../core/base_mode.js";
import ModeManager from "../core/mode_manager.js";
import { confirm, text } from "@clack/prompts";
import chalk from "chalk";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { handleInput, sleep, writeLine } from "../core/tools.js";
import { start } from "node:repl";

interface WordResult {
  word: string;
  score: number;
  tags: string[];
}

interface WordPrompt {
  id: string;
  message: string;
  hint: string;
}

interface UserAnswers {
  [id: string]: string;
}

interface Story {
  title: string;
  storyTemplate: string[];
}

export default class MadlibsGame extends BaseMode {
  readonly wordCheckApi: string =
    "https://api.datamuse.com/words?md=p&max=1&sp=";

  readonly storyPath: string = path.join("public", "madlibs-stories.json");

  readonly wordHints: Map<string, string> = new Map([
    ["noun", "n"],
    ["verb", "v"],
    ["adjective", "adj"],
    ["adverb", "adv"],
  ]);

  wordPrompts: WordPrompt[] = [];
  stories: Story[] = [];
  userAnswers: UserAnswers = {};

  constructor(modeManager: ModeManager) {
    super(modeManager);
  }

  get modeID(): ModeID {
    return ModeID.MadlibsGame;
  }

  get savePath(): string {
    return "madlibs-game";
  }

  async onEnter(): Promise<void> {
    await this.displayTitle("Madlibs Game");
    await sleep(500);
    this.loader.start("Fetching stories...");
    await sleep(500);
    const storyLoaded = await this.loadStories();

    if (storyLoaded) {
      this.loader.stop("Story loaded");
      await sleep(1000);
    } else {
      this.loader.stop("Error fetching stories");

      this.modeManager.transitionTo(ModeID.MainMenu);
      return;
    }

    console.clear();
    await this.startPrompt();
    await this.buildStory();
    await this.playAgain();
  }

  async startPrompt(): Promise<void> {
    for (const prompt of this.wordPrompts) {
      while (true) {
        const answer = await handleInput<string>(() =>
          text({
            message: `${prompt.message} [${chalk.bold(prompt.hint)}]`,
            placeholder: prompt.hint,
            validate(value) {
              if (value && !value.trim()) {
                return "Value is required!";
              }
            },
          }),
        );

        const isValid = await this.validateWord(answer, prompt.hint);

        if (isValid) {
          this.userAnswers[prompt.id] = answer;
          break; // proceed to next prompt
        }

        await writeLine(
          `${chalk.underline.red(answer)} is not a valid word or ${chalk.underline.bold(prompt.hint)}`,
        );
      }
    }
  }

  private async buildStory(): Promise<void> {
    console.clear();
    this.loader.start("Building Story...");
    const randomIndex: number = Math.floor(Math.random() * this.stories.length);
    const story: Story = this.stories[randomIndex];
    await sleep();
    this.loader.stop();

    console.clear();
    await this.displayTitle(story.title);
    console.log(
      this.fillStoryTemplate(story.storyTemplate.join("\n"), this.userAnswers),
    );

    await sleep();
  }

  private async playAgain(): Promise<void> {
    const willPlay = await handleInput<boolean>(() =>
      confirm({
        message: "Play again?",
      }),
    );

    this.modeManager.transitionTo(willPlay ? this.modeID : ModeID.MainMenu);
  }

  async onExit(): Promise<void> {
    this.wordPrompts.length = 0;
    this.stories.length = 0;
  }

  async validateWord(word: string, tag: string): Promise<boolean> {
    try {
      const response = await axios.get<WordResult[]>(
        `${this.wordCheckApi}${word.toLowerCase()}`,
      );

      const data = response.data[0];
      const targetTag = this.wordHints.get(tag);

      return !!(
        data &&
        data.word === word.toLowerCase() &&
        targetTag &&
        data.tags.includes(targetTag)
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.message);
      }

      return false;
    }
  }

  private fillStoryTemplate(templateStr: string, answers: UserAnswers): string {
    return templateStr.replace(/{(\w+)}/g, (match, key) => {
      return chalk.underline.bold.green(key in answers ? answers[key] : match);
    });
  }

  async loadStories(): Promise<boolean> {
    try {
      const load = await readFile(this.storyPath, "utf-8");
      const json = JSON.parse(load);

      if (json) {
        this.wordPrompts = json.prompts as WordPrompt[];
        this.stories = json.stories as Story[];
      }

      return this.wordPrompts.length > 0 && this.stories.length > 0;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
