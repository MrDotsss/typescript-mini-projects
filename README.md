# TypeScript Mini Projects CLI

A collection of 17 command-line mini projects written in TypeScript.

This project is a TypeScript remake of my original [Python Mini Projects CLI](https://github.com/MrDotsss/python_mini_projects). Its purpose is to learn TypeScript through practical coding while preparing for full-stack web development by exploring core language features, Node.js, and modern development tools.

## 📦 Packages Used

### Dependencies

| Package           | Description                                                                |
| ----------------- | -------------------------------------------------------------------------- |
| `@clack/prompts`  | Creates interactive and user-friendly command-line prompts.                |
| `chalk`           | Adds colors and styling to terminal output.                                |
| `date-fns`        | Provides modern utilities for parsing, formatting, and manipulating dates. |
| `figlet`          | Generates ASCII art text for terminal banners and headings.                |
| `gradient-string` | Applies colorful gradient effects to terminal text.                        |

### Development Dependencies

| Package       | Description                                                                        |
| ------------- | ---------------------------------------------------------------------------------- |
| `@types/node` | TypeScript type definitions for Node.js APIs.                                      |
| `tsx`         | Runs TypeScript files directly without manual compilation and supports watch mode. |
| `typescript`  | The TypeScript compiler and language tooling.                                      |

# MODES 🔥

## 🎮 Mode: Madlibs Game

The Madlibs Game demonstrates working with user input, file handling, API integration, and template processing in a CLI application.

When the mode starts, it loads a collection of word prompts and story templates from a JSON file. Players are then prompted to enter words matching specific parts of speech (such as nouns, verbs, adjectives, and adverbs). Each submitted word is validated against the [Datamuse API](https://www.datamuse.com/api/) to ensure it is both a real English word and matches the expected grammatical category. Invalid entries are rejected, requiring the player to try again before continuing.

After all prompts are completed, a random story template is selected. Placeholder tokens within the template are replaced with the player's validated answers, producing a unique and often humorous story. The completed story is displayed with highlighted user inputs, and the player is given the option to generate another randomized story without restarting the application.

### Concepts Demonstrated

- Interactive CLI prompts with validation
- Reading and parsing JSON files
- HTTP API requests using Axios
- Validating user input with an external service
- String templating using placeholder replacement
- Random story selection
- State management between game sessions
- Mode transitions within the CLI application
