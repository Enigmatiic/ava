import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

export type Provider = "claude-code" | "codex";
/** Runs a command in cwd; true when it exits 0. The only side effect tests replace. */
export type Run = (cmd: string[], cwd: string) => boolean;
export interface Options {
  providers: Provider[];
  extras: string[];
}

const PKG = join(import.meta.dir, "..");
const START = "<!-- ava:start";
const END = "<!-- ava:end -->";

const LAYOUT = {
  "claude-code": { skills: ".claude/skills", hooks: ".claude/settings.json", instructions: "CLAUDE.md", impeccable: "claude" },
  codex: { skills: ".agents/skills", hooks: ".codex/hooks.json", instructions: "AGENTS.md", impeccable: "codex" },
} as const;

const REVIEWERS = {
  requirements:
    'Checks a diff against the requirement IDs, the milestone\'s "Done when" list and the product rules. Use after implementing a milestone or a large task, before ticking checklist items.',
  slop: "Finds AI slop in a diff: code nobody needed, generic interface, filler prose, claims without evidence. Use on every change before it is called done.",
  compliance:
    "Audits a diff against docs/COMPLIANCE.md and the privacy rules. Use after any change touching auth, personal data, AI calls, deletion, payments, external links, permissions or release config. Only when docs/COMPLIANCE.md exists.",
};

/** Optional upstream skills. An empty list means the provider has no command for it. */
export const EXTRAS: Record<string, Record<Provider, { cmds: string[][]; manual?: string }>> = {
  superpowers: {
    "claude-code": { cmds: [["claude", "plugin", "install", "superpowers@claude-plugins-official"]] },
    codex: { cmds: [], manual: 'in Codex, open /plugins, search "superpowers" and install it' },
  },
  ponytail: {
    "claude-code": {
      cmds: [
        ["claude", "plugin", "marketplace", "add", "DietrichGebert/ponytail"],
        ["claude", "plugin", "install", "ponytail@ponytail"],
      ],
    },
    codex: {
      cmds: [
        ["codex", "plugin", "marketplace", "add", "DietrichGebert/ponytail"],
        ["codex", "plugin", "add", "ponytail@ponytail"],
      ],
    },
  },
  graphify: {
    "claude-code": {
      cmds: [["graphify", "install", "--platform", "claude"]],
      manual: "uv tool install graphifyy && graphify install --platform claude",
    },
    codex: {
      cmds: [["graphify", "install", "--platform", "codex"]],
      manual: "uv tool install graphifyy && graphify install --platform codex",
    },
  },
};

export function upsertBlock(existing: string, block: string): string {
  const start = existing.indexOf(START);
  const end = existing.indexOf(END);
  if (start !== -1 && end > start) return existing.slice(0, start) + block + existing.slice(end + END.length);
  return existing.trim() ? `${existing.trimEnd()}\n\n${block}\n` : `${block}\n`;
}

export function mergeHooks(settings: Record<string, any>, skillDir: string): Record<string, any> {
  // Resolved from the repository root: an agent that has cd'ed elsewhere still finds the script.
  const command = (script: string) =>
    `bash "$(git rev-parse --show-toplevel 2>/dev/null || pwd)/${skillDir}/scripts/${script}"`;
  const hooks = (settings.hooks ??= {});
  const add = (event: string, entry: { matcher?: string; hooks: { type: string; command: string; timeout?: number }[] }) => {
    const list: any[] = (hooks[event] ??= []);
    const present = list.some((e) => e.hooks?.some((h: any) => h.command === entry.hooks[0].command));
    if (!present) list.push(entry);
  };
  add("PreToolUse", { matcher: "Bash", hooks: [{ type: "command", command: command("block-rm-rf.sh") }] });
  add("Stop", { hooks: [{ type: "command", command: command("verify-on-stop.sh"), timeout: 600 }] });
  return settings;
}

function readJson(path: string, shown: string): Record<string, any> {
  if (!existsSync(path)) return {};
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    throw new Error(`Cannot parse ${shown}. Fix or move it, then run the install again; it was left untouched.`);
  }
}

function write(path: string, content: string) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

const hasImpeccable = (base: string, skills: string) => existsSync(join(base, skills, "impeccable/SKILL.md"));

/** Installs or updates Ava in dir. Returns the things the user still has to do by hand. */
export function install(dir: string, opts: Options, run: Run, home = homedir()): string[] {
  const unknown = opts.extras.filter((extra) => !(extra in EXTRAS));
  if (unknown.length) throw new Error(`Unknown extra: ${unknown.join(", ")}. Known: ${Object.keys(EXTRAS).join(", ")}.`);

  const notes: string[] = [];
  const block = readFileSync(join(PKG, "src/block.md"), "utf8").trim();

  for (const provider of opts.providers) {
    const layout = LAYOUT[provider];
    const skillDir = `${layout.skills}/ava`;

    // Parsed before anything is written, so a broken settings file aborts a clean project.
    const settings = mergeHooks(readJson(join(dir, layout.hooks), layout.hooks), skillDir);
    write(join(dir, layout.hooks), `${JSON.stringify(settings, null, 2)}\n`);

    cpSync(join(PKG, "skill/ava"), join(dir, skillDir), { recursive: true });

    const instructions = join(dir, layout.instructions);
    write(instructions, upsertBlock(existsSync(instructions) ? readFileSync(instructions, "utf8") : "", block));

    if (provider === "claude-code") {
      for (const [name, description] of Object.entries(REVIEWERS)) {
        const body = readFileSync(join(PKG, `skill/ava/reviewers/${name}.md`), "utf8");
        write(
          join(dir, `.claude/agents/ava-${name}-reviewer.md`),
          `---\nname: ava-${name}-reviewer\ndescription: ${description}\ntools: Read, Grep, Glob, Bash\nmodel: opus\n---\n${body}`,
        );
      }
    } else {
      notes.push("Codex: open /hooks and trust the two Ava hooks, or they will not run.");
    }

    if (!hasImpeccable(dir, layout.skills) && !hasImpeccable(home, layout.skills)) {
      const cmd = ["bunx", "impeccable", "install", "--yes", "--project", `--providers=${layout.impeccable}`];
      if (!run(cmd, dir)) notes.push(`Impeccable did not install; /ava init needs it. Run: ${cmd.join(" ")}`);
    }

    for (const extra of opts.extras) {
      const { cmds, manual } = EXTRAS[extra][provider];
      const byHand = manual ?? cmds.map((cmd) => cmd.join(" ")).join(" && ");
      if (!cmds.length || !cmds.every((cmd) => run(cmd, dir))) notes.push(`${extra} (${provider}) is not installed. To add it: ${byHand}`);
    }
  }

  const version = JSON.parse(readFileSync(join(PKG, "package.json"), "utf8")).version;
  write(join(dir, ".ava/install.json"), `${JSON.stringify({ version, providers: opts.providers }, null, 2)}\n`);
  return notes;
}

/** The providers recorded by a previous install, so an update does not ask again. */
export function installedProviders(dir: string): Provider[] {
  return readJson(join(dir, ".ava/install.json"), ".ava/install.json").providers ?? [];
}

export function doctor(dir: string, home = homedir()): { ok: boolean; label: string }[] {
  const has = (path: string) => existsSync(join(dir, path));
  const contains = (path: string, text: string) => has(path) && readFileSync(join(dir, path), "utf8").includes(text);
  const providers = has(".ava/install.json") ? installedProviders(dir) : [];

  const checks = [{ ok: providers.length > 0, label: "Ava is installed (.ava/install.json)" }];
  for (const provider of providers) {
    const layout = LAYOUT[provider];
    checks.push(
      { ok: has(`${layout.skills}/ava/SKILL.md`), label: `${provider}: skill in ${layout.skills}/ava` },
      { ok: contains(layout.hooks, "ava/scripts/verify-on-stop.sh"), label: `${provider}: hooks in ${layout.hooks}` },
      { ok: contains(layout.instructions, START), label: `${provider}: workflow block in ${layout.instructions}` },
      {
        ok: hasImpeccable(dir, layout.skills) || hasImpeccable(home, layout.skills),
        label: `${provider}: Impeccable (bunx impeccable install --project --providers=${layout.impeccable})`,
      },
    );
    if (provider === "claude-code") {
      checks.push({ ok: has(".claude/agents/ava-slop-reviewer.md"), label: "claude-code: reviewers in .claude/agents" });
    }
  }
  checks.push(
    { ok: has(".git"), label: "git repository at this level" },
    { ok: has("docs/PROGRESS.md"), label: "/ava init has run (docs/PROGRESS.md)" },
  );
  return checks;
}
