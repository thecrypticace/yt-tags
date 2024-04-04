import type { Tag } from "../common";
import { render } from "lit-html";
import { renderTags } from "./templates";

// Get the element to contain all the tags for a given video
function renderTagContainer(media: HTMLElement): HTMLElement | null {
  let channel = media.querySelector<HTMLElement>("ytd-channel-name");
  if (!channel) return null;

  let container = media.querySelector<HTMLElement>(".yt-quick-tags-container");
  if (!container) {
    container = document.createElement("span");
    container.classList.add("yt-quick-tags-container");
    channel.append(" ", container);
  }

  return container;
}

// Renders the tags for a given video
export function renderTagsIn(media: HTMLElement, tags: Tag[]) {
  let container = renderTagContainer(media);
  if (!container) return;

  render(renderTags(tags), container);
}
