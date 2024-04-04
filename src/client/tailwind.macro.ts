import { __unstable__loadDesignSystem } from "tailwindcss";
import { readFileSync } from "node:fs";
import { type ClassValue, clsx } from "clsx";

const theme = readFileSync(require.resolve("tailwindcss/theme.css"), "utf8");
const design = __unstable__loadDesignSystem(theme);

export function tw(classes: ClassValue) {
  // Get a list of candidate classes to apply
  let candidates = clsx(classes).split(/\s+/);

  // Compile the AST nodes for each class
  let ast = candidates.map((cls) => design.compileAstNodes(cls)).map(({ node }) => node);

  // Combine all the nodes into a single "style object"
  // This currently assumes no values are being used
  let style: Record<string, string> = {};

  for (let node of ast) {
    if (node.kind !== "rule") continue;

    for (let prop of node.nodes) {
      if (prop.kind !== "declaration") {
        throw new Error(`Varaiants are not supported`);
      }

      if (prop.property === "--tw-sort") {
        continue;
      }

      style[prop.property] = prop.value.replace(/var\(--[a-z0-9-]+,\s*(.*?)\)/, "$1");
    }
  }

  return style;
}
