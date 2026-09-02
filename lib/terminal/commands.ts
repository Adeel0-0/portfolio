import {
  certifications,
  education,
  profile,
  projects,
  skills,
} from "@/data";

/**
 * Commands for the backtick terminal.
 *
 * Pure functions over @/data — no side effects, no fetching, no DOM. That keeps
 * them trivially testable and means the terminal component owns nothing but
 * input handling and scrollback.
 *
 * The resume PDF arrives as an argument rather than an import, which is the
 * only reason this file is still pure: lib/resume.ts is `server-only`, and it
 * decides whether a resume exists by looking at the filesystem. Importing it
 * here would drag node:fs into a client bundle. Passing the href down instead
 * keeps the same guarantee the buttons have — no file, no link, never a 404 —
 * and keeps these functions testable without a filesystem.
 */

export type CommandResult = string[];

export type CommandContext = {
  /** The resume's public path, or null when no PDF is deployed. */
  resumeHref: string | null;
};

const HELP: CommandResult = [
  "Available commands:",
  "",
  "  whoami        who is driving",
  "  ls projects   list the race history",
  "  cat resume    the short version, and where the PDF lives",
  "  skills        everything in the garage",
  "  contact       how to reach the pit wall",
  "  clear         wipe the scrollback",
  "  exit          close the terminal",
];

const COMMANDS: Record<string, (context: CommandContext) => CommandResult> = {
  help: () => HELP,

  whoami: () => [
    profile.name,
    profile.role,
    profile.location,
    "",
    profile.tagline,
  ],

  "ls projects": () =>
    projects.flatMap((project) => [
      `${project.index}  ${project.title}`,
      `    ${project.subtitle}`,
      `    ${project.stack.join(" · ")}`,
      `    ${project.metric ? `${project.metric.value} ${project.metric.label}` : "— no time set"}`,
      "",
    ]),

  // Prints the summary either way. The PDF is the thing a recruiter actually
  // wants, but a terminal cannot hand over a file, so the text stands on its
  // own and the path is offered underneath it rather than instead of it.
  "cat resume": ({ resumeHref }) => [
    profile.name,
    profile.role,
    "",
    profile.summary,
    "",
    `${education.degree}`,
    `${education.school} · ${education.period} · ${education.gpa}`,
    "",
    ...certifications.map((line) => `· ${line}`),
    ...(resumeHref
      ? ["", `Full PDF: ${resumeHref}`]
      : []),
  ],

  skills: () =>
    skills.flatMap((group) => [
      group.group,
      `  ${group.items.map((item) => item.name).join(", ")}`,
      "",
    ]),

  contact: () => [
    `email     ${profile.email}`,
    `phone     ${profile.phone}`,
    `github    ${profile.github}`,
    `linkedin  ${profile.linkedin}`,
  ],
};

export const COMMAND_NAMES = [...Object.keys(COMMANDS), "clear", "exit"];

export function runCommand(
  input: string,
  context: CommandContext = { resumeHref: null }
): CommandResult {
  // Collapse internal whitespace so "ls   projects" behaves like "ls projects".
  const command = input.trim().toLowerCase().replace(/\s+/g, " ");
  if (!command) return [];

  const handler = COMMANDS[command];
  if (handler) return handler(context);

  // A bare `ls` is the obvious thing to type first; point it somewhere useful
  // rather than treating it as a typo.
  if (command === "ls") return ["projects", "", "Try: ls projects"];

  return [
    `Command not found: ${input.trim()}`,
    "Type `help` for the list.",
  ];
}
