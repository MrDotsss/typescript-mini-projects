# TypeScript Mini Projects CLI

A collection of 17 command-line mini projects written in TypeScript.

This project is a TypeScript remake of my original [Python Mini Projects CLI](https://github.com/MrDotsss/python_mini_projects). Its purpose is to learn TypeScript through practical coding while preparing for full-stack web development by exploring core language features, Node.js, and modern development tools.

## 📦 Packages Used

### Dependencies

| Package           | Description                                                                |
| ----------------- | -------------------------------------------------------------------------- |
| `@clack/prompts`  | Creates interactive and user-friendly command-line prompts.                |
| `axios`           | Performs HTTP requests to external APIs.                                   |
| `bcrypt`          | Securely hashes and verifies user passwords.                               |
| `chalk`           | Adds colors and styling to terminal output.                                |
| `date-fns`        | Provides modern utilities for parsing, formatting, and manipulating dates. |
| `figlet`          | Generates ASCII art text for terminal banners and headings.                |
| `gradient-string` | Applies colorful gradient effects to terminal text.                        |

### Development Dependencies

| Package         | Description                                                                        |
| --------------- | ---------------------------------------------------------------------------------- |
| `@types/bcrypt` | TypeScript type definitions for bcrypt.                                            |
| `@types/node`   | TypeScript type definitions for Node.js APIs.                                      |
| `tsx`           | Runs TypeScript files directly without manual compilation and supports watch mode. |
| `typescript`    | The TypeScript compiler and language tooling.                                      |

## 📂 Directories

## 📁 `core/`

The `core/` directory contains the foundation of the CLI application. Instead of placing all project logic in a single file, the application is organized around a **mode-based architecture**, where each mini project behaves as an independent mode with a shared lifecycle.

### `ModeID`

`ModeID` is an enumeration that defines every available mode in the application. Rather than using hardcoded strings throughout the project, the enum provides a centralized, type-safe way to identify and transition between modes.

### `BaseMode`

[`BaseMode`](src/core/base_mode.ts) is an abstract class that serves as the blueprint for every mini project.

Each mode inherits from `BaseMode` and implements its own behavior while sharing common functionality such as:

- Entering and exiting the mode through lifecycle methods (`onEnter()` and `onExit()`).
- Displaying consistent ASCII-art titles.
- Accessing the current player's information.
- Saving mode-specific data using a shared save system.
- Reusing a common loading spinner for asynchronous operations.

### `ModeManager`

[`ModeManager`](src/core/mode_manager.ts) is responsible for controlling the application's navigation and overall execution flow. It acts as the central controller that registers available modes, switches between them, and maintains shared state throughout the application's lifetime.

When the application starts, the manager checks whether a user save already exists. Returning players have their information loaded automatically, while new players are prompted to enter a name, which is then saved for future sessions.

Mode transitions are handled through a single `transitionTo()` method. Before entering a new mode, the current mode's `onExit()` lifecycle method is called to perform any necessary cleanup. The target mode is then initialized by invoking its `onEnter()` method. This ensures every mode follows the same predictable lifecycle.

In addition to navigation, the `ModeManager` stores shared data—such as the player's name—allowing every mode to access common information without duplicating logic.

### Responsibilities

- Registers all available application modes.
- Controls application startup and initialization.
- Loads and persists player information.
- Manages transitions between modes.
- Executes each mode's lifecycle (`onEnter()` → `onExit()`).
- Maintains shared state across the entire application.

### `SaveManager`

[`SaveManager`](src/core/save_manager.ts) provides a centralized system for handling all save data used throughout the application. Rather than allowing each mode to perform its own file operations, this class abstracts the underlying file system into a simple API for creating, loading, updating, and deleting save files.

Each save is stored as a JSON file containing the mode name, a timestamp, and mode-specific data. Before performing any operation, the manager ensures that the save directory exists and automatically resolves the correct file path, reducing duplicate logic across the project.

By centralizing persistence, every mode can focus on its own gameplay or functionality while relying on a consistent and reusable save mechanism.

### Responsibilities

- Creates the save directory when needed.
- Resolves save file paths automatically.
- Checks whether save files exist.
- Saves application data as formatted JSON.
- Loads previously saved data.
- Deletes individual save files.
- Clears all application save data.
- Provides a shared persistence API for every mode.

### 🔑 JWT Authentication

The [JWT Authentication](src/core/jwt-service.ts) module provides persistent login functionality by issuing and storing refresh tokens. Instead of requiring users to log in every time the application starts, the CLI can restore authenticated sessions from a previously saved token.

### Features

- Generates JWT refresh tokens after successful authentication.
- Configures token expiration for automatic session expiry.
- Verifies token authenticity and validity.
- Stores refresh tokens securely in a local session file.
- Automatically loads existing sessions on application startup.
- Clears saved sessions during logout.
- Separates authentication data from session management.

## MODES 🔥

## 🔐 Mode: Authentication

[The Authentication mode](src/modes//authentication.ts) is the application's entry point, requiring users to register or log in before accessing the mini projects. User credentials are securely stored using password hashing with **bcrypt** and persisted as JSON.

### Features

- Register a new user account with a unique username.
- Securely hash passwords before saving them.
- Log in using existing credentials.
- Verify passwords using bcrypt comparison.
- Prevent duplicate usernames during registration.
- Enforce a minimum password length.
- Persist user accounts across application sessions.
- Maintain the authenticated user's session for the current runtime.
- Support logging out and returning to the authentication screen.

## 🎮 Mode: Madlibs Game

[The Madlibs Game](src/modes//madlibs-game.ts) is a word-based storytelling game that combines interactive CLI prompts, API validation, and template generation to create randomized, humorous stories.

### Features

- Loads reusable prompts and story templates from JSON files.
- Prompts the player for nouns, verbs, adjectives, and adverbs.
- Validates each word using the Datamuse API to ensure it is a real word with the correct part of speech.
- Prevents invalid inputs by requiring the player to retry until a valid word is entered.
- Randomly selects one of several story templates.
- Replaces placeholders with the player's validated words to generate a unique story.
- Highlights player-provided words in the final output.
- Allows replaying with a new randomized story without restarting the application.
