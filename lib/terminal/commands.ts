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
 */

export type CommandResult = string[];

const HELP: CommandResult = [
  "Available commands:",
  "",
  "  whoami        who is driving",
  "  ls projects   list the race history",
  "  cat resume    the short version",
  "  skills        everything in the garage",
  "  contact       how to reach the pit wall",
  "  clear         wipe the scrollback",
  "  exit          close the terminal",
];

const COMMANDS: Record<string, () => CommandResult> = {
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

  "cat resume": () => [
    profile.name,
    profile.role,
    "",
    profile.summary,
    "",
    `${education.degree}`,
    `${education.school} · ${education.period} · ${education.gpa}`,
    "",
    ...certifications.map((line) => `· ${line}`),
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

export function runCommand(input: string): CommandResult {
  // Collapse internal whitespace so "ls   projects" behaves like "ls projects".
  const command = input.trim().toLowerCase().replace(/\s+/g, " ");
  if (!command) return [];

  const handler = COMMANDS[command];
  if (handler) return handler();

  // A bare `ls` is the obvious thing to type first; point it somewhere useful
  // rather than treating it as a typo.
  if (command === "ls") return ["projects", "", "Try: ls projects"];

  return [
    `Command not found: ${input.trim()}`,
    "Type `help` for the list.",
  ];
}
