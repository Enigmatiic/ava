#!/usr/bin/env bun
import { existsSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { EXTRAS, doctor, install, installedProviders, type Provider, type Run } from "./install";

const USAGE = `ava — install the Ava workflow in the current project

  ava install [--provider claude-code|codex|both] [--extras ${Object.keys(EXTRAS).join(",")}] [--yes]
  ava doctor

install   Adds the skill, hooks and instructions for the chosen provider. Run it again to update.
doctor    Checks an installation.
--yes     Ask nothing: no optional skills unless --extras names them.`;

const { values, positionals } = parseArgs({
  args: Bun.argv.slice(2),
  options: { provider: { type: "string" }, extras: { type: "string" }, yes: { type: "boolean" } },
  allowPositionals: true,
});
const dir = process.cwd();
const interactive = process.stdin.isTTY && !values.yes;

const run: Run = (cmd, cwd) => {
  try {
    return Bun.spawnSync(cmd, { cwd, stdio: ["inherit", "inherit", "inherit"] }).exitCode === 0;
  } catch {
    return false; // the binary is not installed
  }
};

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

function providers(): Provider[] {
  const all: Provider[] = ["claude-code", "codex"];
  let choice = values.provider;
  if (!choice) {
    const previous = installedProviders(dir);
    if (previous.length) return previous;
    if (!interactive) fail("Which provider? Pass --provider claude-code, codex or both.");
    choice = prompt("Provider — claude-code, codex or both?", "claude-code") ?? "";
  }
  if (choice === "both") return all;
  if (!all.includes(choice as Provider)) fail(`Unknown provider "${choice}". Use claude-code, codex or both.`);
  return [choice as Provider];
}

function extras(): string[] {
  if (values.extras !== undefined) return values.extras.split(",").filter(Boolean);
  // Offered once, at the first install; an update does not ask again.
  if (!interactive || existsSync(join(dir, ".ava/install.json"))) return [];
  console.log("\nOptional skills. Ava works without them; its playbooks use them when present.");
  return Object.keys(EXTRAS).filter((name) => confirm(`Install ${name}?`));
}

const [command] = positionals;
if (command === "install") {
  try {
    const chosen = providers();
    const notes = install(dir, { providers: chosen, extras: extras() }, run);
    console.log(`\nAva is installed for ${chosen.join(" and ")}.`);
    if (!existsSync(join(dir, ".git"))) notes.push("This is not a git repository yet; /ava init will create one.");
    if (!Bun.which("gh")) notes.push("gh is not installed: issues will be kept in docs/issues/ until it is.");
    for (const note of notes) console.log(`  ! ${note}`);
    console.log(
      existsSync(join(dir, "docs/PROGRESS.md"))
        ? "\nUpdated. Nothing else to do."
        : "\nNext: open the project in your agent and run  /ava init  (Codex: $ava init).",
    );
  } catch (error) {
    fail((error as Error).message);
  }
} else if (command === "doctor") {
  const checks = doctor(dir);
  for (const check of checks) console.log(`${check.ok ? "ok  " : "FAIL"}  ${check.label}`);
  if (checks.some((check) => !check.ok)) process.exit(1);
} else {
  console.log(USAGE);
  if (command) process.exit(1);
}
