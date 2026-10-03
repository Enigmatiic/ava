import { describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { doctor, install, mergeHooks, upsertBlock, type Run } from "./install";

const BLOCK = "<!-- ava:start -->\nrules\n<!-- ava:end -->";
const tmp = () => mkdtempSync(join(tmpdir(), "ava-"));
const read = (dir: string, path: string) => readFileSync(join(dir, path), "utf8");

function recorder(ok = true) {
  const calls: string[] = [];
  const run: Run = (cmd) => (calls.push(cmd.join(" ")), ok);
  return { calls, run };
}

/** Every file under dir, path → content, to compare two states of a project. */
function snapshot(dir: string, prefix = ""): Record<string, string> {
  const files: Record<string, string> = {};
  for (const name of readdirSync(join(dir, prefix))) {
    const path = join(prefix, name);
    if (statSync(join(dir, path)).isDirectory()) Object.assign(files, snapshot(dir, path));
    else files[path] = read(dir, path);
  }
  return files;
}

describe("upsertBlock", () => {
  test("empty file becomes the block", () => {
    expect(upsertBlock("", BLOCK)).toBe(BLOCK + "\n");
  });

  test("appends after existing text", () => {
    expect(upsertBlock("# Mine\n\nkeep me\n", BLOCK)).toBe("# Mine\n\nkeep me\n\n" + BLOCK + "\n");
  });

  test("replaces an existing block and keeps the text around it", () => {
    const before = "# Mine\n\n<!-- ava:start -->\nold\n<!-- ava:end -->\n\n## After\n";
    expect(upsertBlock(before, BLOCK)).toBe("# Mine\n\n" + BLOCK + "\n\n## After\n");
  });

  test("applying twice equals applying once", () => {
    const once = upsertBlock("# Mine\n", BLOCK);
    expect(upsertBlock(once, BLOCK)).toBe(once);
  });
});

describe("mergeHooks", () => {
  test("adds both hooks to empty settings", () => {
    const { hooks } = mergeHooks({}, ".claude/skills/ava");
    expect(hooks.PreToolUse[0].matcher).toBe("Bash");
    expect(hooks.PreToolUse[0].hooks[0].command).toContain(".claude/skills/ava/scripts/block-rm-rf.sh");
    expect(hooks.Stop[0].hooks[0].command).toContain(".claude/skills/ava/scripts/verify-on-stop.sh");
  });

  test("keeps unrelated keys and hooks", () => {
    const mine = { type: "command", command: "bash mine.sh" };
    const merged = mergeHooks({ env: { A: "1" }, hooks: { Stop: [{ hooks: [mine] }] } }, ".claude/skills/ava");
    expect(merged.env).toEqual({ A: "1" });
    expect(merged.hooks.Stop[0].hooks[0]).toEqual(mine);
    expect(merged.hooks.Stop).toHaveLength(2);
  });

  test("applying twice adds nothing", () => {
    const once = mergeHooks({}, ".claude/skills/ava");
    expect(mergeHooks(structuredClone(once), ".claude/skills/ava")).toEqual(once);
  });
});

describe("install", () => {
  test("claude-code into an empty directory", () => {
    const dir = tmp();
    const { calls, run } = recorder();
    install(dir, { providers: ["claude-code"], extras: [] }, run, tmp());

    expect(read(dir, ".claude/skills/ava/SKILL.md")).toContain("name: ava");
    for (const name of ["requirements", "slop", "compliance"]) {
      expect(read(dir, `.claude/agents/ava-${name}-reviewer.md`)).toStartWith(`---\nname: ava-${name}-reviewer\n`);
    }
    expect(read(dir, ".claude/settings.json")).toContain("verify-on-stop.sh");
    expect(read(dir, "CLAUDE.md")).toContain("<!-- ava:start");
    expect(JSON.parse(read(dir, ".ava/install.json")).providers).toEqual(["claude-code"]);
    for (const absent of [".agents", ".codex", "AGENTS.md"]) expect(existsSync(join(dir, absent))).toBe(false);
    expect(calls).toEqual(["bunx impeccable install --yes --project --providers=claude"]);
  });

  test("codex into an empty directory", () => {
    const dir = tmp();
    const { calls, run } = recorder();
    install(dir, { providers: ["codex"], extras: [] }, run, tmp());

    expect(read(dir, ".agents/skills/ava/SKILL.md")).toContain("name: ava");
    expect(read(dir, ".codex/hooks.json")).toContain(".agents/skills/ava/scripts/verify-on-stop.sh");
    expect(read(dir, "AGENTS.md")).toContain("<!-- ava:start");
    for (const absent of [".claude", "CLAUDE.md"]) expect(existsSync(join(dir, absent))).toBe(false);
    expect(calls).toEqual(["bunx impeccable install --yes --project --providers=codex"]);
  });

  test("existing instructions and settings survive", () => {
    const dir = tmp();
    mkdirSync(join(dir, ".claude"));
    writeFileSync(join(dir, "CLAUDE.md"), "# My project\n\nMy rules.\n");
    writeFileSync(join(dir, ".claude/settings.json"), JSON.stringify({ env: { KEEP: "1" } }));
    install(dir, { providers: ["claude-code"], extras: [] }, recorder().run, tmp());

    expect(read(dir, "CLAUDE.md")).toStartWith("# My project\n\nMy rules.\n\n<!-- ava:start");
    expect(JSON.parse(read(dir, ".claude/settings.json")).env).toEqual({ KEEP: "1" });
  });

  test("a second install changes nothing", () => {
    const dir = tmp();
    const home = tmp();
    const opts = { providers: ["claude-code", "codex"] as const, extras: [] };
    install(dir, { ...opts, providers: [...opts.providers] }, recorder().run, home);
    const first = snapshot(dir);
    install(dir, { ...opts, providers: [...opts.providers] }, recorder().run, home);
    expect(snapshot(dir)).toEqual(first);
  });

  test("Impeccable is left alone when the project or the user already has it", () => {
    for (const where of ["project", "home"]) {
      const dir = tmp();
      const home = tmp();
      mkdirSync(join(where === "project" ? dir : home, ".claude/skills/impeccable"), { recursive: true });
      writeFileSync(join(where === "project" ? dir : home, ".claude/skills/impeccable/SKILL.md"), "");
      const { calls, run } = recorder();
      install(dir, { providers: ["claude-code"], extras: [] }, run, home);
      expect(calls).toEqual([]);
    }
  });

  test("an extra that fails to install leaves the command to run by hand", () => {
    const dir = tmp();
    const notes = install(dir, { providers: ["claude-code"], extras: ["ponytail"] }, recorder(false).run, tmp());
    expect(notes.join("\n")).toContain("claude plugin install ponytail@ponytail");
  });

  test("an unknown extra is refused", () => {
    expect(() => install(tmp(), { providers: ["codex"], extras: ["nope"] }, recorder().run, tmp())).toThrow("nope");
  });

  test("an unparseable settings file is refused and left as it was", () => {
    const dir = tmp();
    mkdirSync(join(dir, ".claude"));
    writeFileSync(join(dir, ".claude/settings.json"), "{ not json");
    expect(() => install(dir, { providers: ["claude-code"], extras: [] }, recorder().run, tmp())).toThrow(
      ".claude/settings.json",
    );
    expect(read(dir, ".claude/settings.json")).toBe("{ not json");
  });
});

describe("doctor", () => {
  test("fails on a directory without Ava", () => {
    expect(doctor(tmp(), tmp()).some((check) => !check.ok)).toBe(true);
  });

  test("passes once installed, initialised and Impeccable is present", () => {
    const dir = tmp();
    const home = tmp();
    install(dir, { providers: ["claude-code", "codex"], extras: [] }, recorder().run, home);
    for (const path of [".git", "docs", ".claude/skills/impeccable", ".agents/skills/impeccable"]) {
      mkdirSync(join(dir, path), { recursive: true });
    }
    for (const path of ["docs/PROGRESS.md", ".claude/skills/impeccable/SKILL.md", ".agents/skills/impeccable/SKILL.md"]) {
      writeFileSync(join(dir, path), "");
    }
    expect(doctor(dir, home).filter((check) => !check.ok)).toEqual([]);
  });
});
