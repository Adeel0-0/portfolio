import ts from "typescript";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

/** Parse emitted JavaScript, including minified imports and re-exports. */
export function staticDependencies(source: string): string[] {
  const tree = ts.createSourceFile(
    "bundle.js",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );
  return tree.statements.flatMap((node) => {
    if (!ts.isImportDeclaration(node) && !ts.isExportDeclaration(node))
      return [];
    const specifier = node.moduleSpecifier;
    return specifier && ts.isStringLiteral(specifier) ? [specifier.text] : [];
  });
}

export function collectStaticScripts(
  entries: string[],
  root: string,
  read: (file: string) => string = (file) => readFileSync(file, "utf8"),
): Set<string> {
  const files = new Set<string>();
  function follow(file: string) {
    if (files.has(file)) return;
    files.add(file);
    for (const specifier of staticDependencies(read(file))) {
      if (specifier.startsWith(".")) follow(resolve(dirname(file), specifier));
      else if (specifier.startsWith("/") && !specifier.startsWith("//"))
        follow(resolve(root, "." + specifier));
    }
  }
  entries.forEach(follow);
  return files;
}
