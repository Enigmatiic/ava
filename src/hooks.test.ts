import { describe, expect, test } from "bun:test";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const SCRIPTS = join(import.meta.dir, "../skill/ava/scripts");
const INSTALLED = ".claude/skills/ava/scripts";

function hook(path: string, stdin: string, cwd = tmpdir()) {
  const result = Bun.spawnSync(["bash", path], { stdin: Buffer.from(stdin), cwd });
  return { code: result.exitCode, err: result.stderr.toString() };
}

const blocks = (command: string) =>
  hook(join(SCRIPTS, "block-rm-rf.sh"), JSON.stringify({ tool_name: "Bash", tool_input: { command } })).code === 2;

/** A git repository with the scripts installed where the installer puts them. */
function project(verify?: string) {
  const dir = mkdtempSync(join(tmpdir(), "ava-hook-"));
  Bun.spawnSync(["git", "init", "-q"], { cwd: dir });
  cpSync(SCRIPTS, join(dir, INSTALLED), { recursive: true });
  if (verify !== undefined) {
    mkdirSync(join(dir, ".ava"));
    writeFileSync(join(dir, ".ava/verify.sh"), verify);
  }
  // Run from a sub-directory: the hook must find the project root by itself.
  mkdirSync(join(dir, "src"));
  return { dir, stop: (stdin = "{}") => hook(join(dir, INSTALLED, "verify-on-stop.sh"), stdin, join(dir, "src")) };
}

describe("block-rm-rf.sh", () => {
  test("blocks recursive force deletes", () => {
    for (const command of ["rm -rf build", "rm -fr build", "rm -r -f build", "rm --recursive --force build"]) {
      expect(blocks(command)).toBe(true);
    }
  });

  test("lets everything else through", () => {
    for (const command of ["rm notes.txt", "trash build", "git rm -r --cached build", "ls -rf"]) {
      expect(blocks(command)).toBe(false);
    }
  });
});

describe("verify-on-stop.sh", () => {
  test("does nothing before /ava init has written the checks", () => {
    expect(project().stop().code).toBe(0);
  });

  test("blocks the stop and shows the output when a check fails", () => {
    const result = project("echo 3 tests failed; exit 1").stop();
    expect(result.code).toBe(2);
    expect(result.err).toContain("3 tests failed");
  });

  test("lets the stop through when the checks pass", () => {
    expect(project("exit 0").stop().code).toBe(0);
  });

  test("never blocks a stop it already continued", () => {
    expect(project("exit 1").stop('{"stop_hook_active": true}').code).toBe(0);
  });

  test("does not run the checks again when nothing changed since they passed", () => {
    const counter = join(mkdtempSync(join(tmpdir(), "ava-count-")), "runs");
    const { dir, stop } = project(`echo run >> "${counter}"`);
    const runs = () => (existsSync(counter) ? readFileSync(counter, "utf8").trim().split("\n").length : 0);

    stop();
    stop();
    expect(runs()).toBe(1);

    writeFileSync(join(dir, "src/new.ts"), "export {};\n");
    stop();
    expect(runs()).toBe(2);
  });

  test("runs the checks again after a failure, even with nothing changed", () => {
    const { stop } = project("exit 1");
    expect(stop().code).toBe(2);
    expect(stop().code).toBe(2);
  });
});
