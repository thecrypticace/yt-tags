import { html } from "lit-html";
import { tw } from "./tailwind.macro" with { type: "macro" };
import { styleMap } from "lit-html/directives/style-map.js";
import { unsafeHTML } from "lit-html/directives/unsafe-html.js";
import { Tag } from "../common";

export function renderTags(tags: Tag[]) {
  return tags.map(
    (tag) => html`
      <span
        style=${styleMap({
          ...tw("flex items-center gap-x-1 mx-1 align-middle font-bold"),
          color: tag.color,
        })}
      >
        ${unsafeHTML(tag.icon)}
        <span>${tag.name}</span>
      </span>
    `,
  );
}
