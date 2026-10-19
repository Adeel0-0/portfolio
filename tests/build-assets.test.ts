import { describe, expect, it } from "vitest";
import { resolve } from "node:path";
import {
  collectStaticScripts,
  staticDependencies,
} from "../scripts/build-assets";

describe("arrival JavaScript accounting", () => {
  it("includes minified imports, side effects and static re-exports", () => {
    expect(
      staticDependencies(
        `import{r as a}from"./storage.js";import'./side.js';export{b}from'./shared.js';export*from"./other.js";`,
      ),
    ).toEqual(["./storage.js", "./side.js", "./shared.js", "./other.js"]);
  });
  it("excludes dynamic imports and import-looking strings or comments", () => {
    expect(
      staticDependencies(
        `import('./f1-scene.js');const text="import './fake.js'";/* import './comment.js' */`,
      ),
    ).toEqual([]);
  });
  it("follows shared dependencies once even with cycles and root-relative imports", () => {
    const root = resolve("virtual-build");
    const sources = new Map([
      [
        resolve(root, "a.js"),
        `import{b}from'./b.js';import'/c.js';import('./f1-scene.js');`,
      ],
      [resolve(root, "b.js"), `export*from'./c.js';`],
      [resolve(root, "c.js"), `import'./a.js';`],
    ]);
    const visited: string[] = [];
    const files = collectStaticScripts(
      [resolve(root, "a.js"), resolve(root, "b.js")],
      root,
      (file) => {
        visited.push(file);
        const source = sources.get(file);
        if (source === undefined)
          throw new Error(`Unexpected dependency ${file}`);
        return source;
      },
    );
    expect(files.size).toBe(3);
    expect(visited).toHaveLength(3);
  });
});
