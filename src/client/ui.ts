import type { Tag } from "../common";

// Get the element for a given tag
function renderTag(tag: Tag): HTMLElement {
  let icon = document.createElement("span");
  icon.innerHTML = tag.icon;
  icon.style.width = "1em";
  icon.style.height = "1em";
  icon.style.marginLeft = "0.25em";
  icon.style.marginRight = "0.25em";
  icon.style.verticalAlign = "middle";

  let span = document.createElement("span");
  span.style.color = tag.color;
  span.append(icon, tag.name);

  return span;
}

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

  container.replaceChildren(...tags.map(renderTag));
}
