import { isCancel, cancel } from "@clack/prompts";

const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms));

async function handleInput<T>(
  promptFn: () => Promise<T | symbol>,
  cancelMessage: string = "Operation cancelled.",
): Promise<T> {
  const result = await promptFn();

  if (isCancel(result)) {
    cancel(cancelMessage);
    process.exit(0); // Stops execution immediately so you don't have to handle undefined later
  }

  return result as T;
}

async function writeLine(message: string, delay: number = 2000): Promise<void> {
  console.log(message);
  await sleep(delay);
}

export { sleep, handleInput, writeLine };
