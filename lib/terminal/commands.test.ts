import { describe, expect, it } from "vitest";

import { profile, projects } from "@legacy/data";
import { COMMAND_NAMES, runCommand } from "./commands";

describe("runCommand", () => {
  it("returns nothing for empty or whitespace-only input", () => {
    expect(runCommand("")).toEqual([]);
    expect(runCommand("   ")).toEqual([]);
  });

  it("is case-insensitive", () => {
    expect(runCommand("WHOAMI")).toEqual(runCommand("whoami"));
  });

  it("collapses internal whitespace so `ls   projects` resolves", () => {
    expect(runCommand("ls   projects")).toEqual(runCommand("ls projects"));
  });

  it("trims surrounding whitespace", () => {
    expect(runCommand("  skills  ")).toEqual(runCommand("skills"));
  });

  it("points a bare `ls` somewhere useful instead of erroring", () => {
    const out = runCommand("ls");
    expect(out).toContain("projects");
    expect(out.join("\n")).toContain("ls projects");
    // Specifically not the not-found path.
    expect(out.join("\n")).not.toContain("Command not found");
  });

  it("reports unknown commands with the original casing preserved", () => {
    const out = runCommand("  Sudo Rm  ");
    expect(out[0]).toBe("Command not found: Sudo Rm");
    expect(out.join("\n")).toContain("help");
  });

  describe("output is actually wired to @/data", () => {
    it("whoami prints the real profile", () => {
      const out = runCommand("whoami").join("\n");
      expect(out).toContain(profile.name);
      expect(out).toContain(profile.role);
      expect(out).toContain(profile.tagline);
    });

    it("ls projects lists every project", () => {
      const out = runCommand("ls projects").join("\n");
      for (const project of projects) {
        expect(out).toContain(project.title);
        expect(out).toContain(project.subtitle);
      }
    });

    it("renders an em dash for a project with no metric", () => {
      // The drone project ships without a benchmark by design; the terminal
      // must show that rather than inventing a number.
      const hasUntimed = projects.some((project) => !project.metric);
      expect(hasUntimed).toBe(true);
      expect(runCommand("ls projects").join("\n")).toContain("— no time set");
    });

    it("contact prints every channel", () => {
      const out = runCommand("contact").join("\n");
      expect(out).toContain(profile.email);
      expect(out).toContain(profile.github);
      expect(out).toContain(profile.linkedin);
    });
  });

  describe("cat resume", () => {
    it("prints the summary whether or not a PDF is deployed", () => {
      const contexts = [{ resumeHref: null }, { resumeHref: "/resume.pdf" }];
      for (const context of contexts) {
        const out = runCommand("cat resume", context).join("\n");
        expect(out).toContain(profile.name);
        expect(out).toContain(profile.summary);
      }
    });

    it("offers the PDF path when one is deployed", () => {
      const out = runCommand("cat resume", { resumeHref: "/resume.pdf" });
      expect(out.join("\n")).toContain("/resume.pdf");
    });

    it("mentions no file when none is deployed", () => {
      // The whole point of gating on the filesystem: a recruiter must never be
      // handed a path that 404s.
      const out = runCommand("cat resume", { resumeHref: null }).join("\n");
      expect(out).not.toContain(".pdf");
    });
  });

  describe("help", () => {
    it("documents every command the terminal advertises", () => {
      const help = runCommand("help").join("\n");
      // `help` itself is excluded: you already found it if you are reading
      // this output. Everything else must be discoverable from here, since
      // the terminal has no other affordance.
      for (const name of COMMAND_NAMES.filter((n) => n !== "help")) {
        expect(help, `help omits \`${name}\``).toContain(name);
      }
    });

    it("every command it documents actually resolves", () => {
      // `clear` and `exit` are handled by the terminal component, not the
      // table, so they are expected to fall through to not-found here.
      const dispatched = COMMAND_NAMES.filter(
        (name) => name !== "clear" && name !== "exit",
      );
      for (const name of dispatched) {
        expect(runCommand(name).join("\n")).not.toContain("Command not found");
      }
    });
  });
});
