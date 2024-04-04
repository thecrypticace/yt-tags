import type { Video } from "../common";
import { Tags } from "./tags";
import * as ui from "./ui";

const TAGS = new Tags();

function videoForMedia(el: HTMLElement): Video | null {
  let channelAnchor = el.querySelector<HTMLAnchorElement>("ytd-channel-name a");
  let videoAnchor = el.querySelector<HTMLAnchorElement>("#video-title-link");
  if (!channelAnchor || !videoAnchor) return null;

  let video = videoAnchor.search.match(/\?v=([^&]+)/)?.[1] ?? "";
  let channel = channelAnchor.pathname.replace(/^\/channels\//, "/").slice(1);

  return {
    video,
    channel,
  };
}

/**
 * Update the tags for all visible videos on the page
 * We can't just update "added" videos because YouTube sometimes reuses DOM
 * nodes for performance reasons. So we need to update all visible videos every
 * time in case the video represented by a given DOM node has changed.
 **/
async function updateVisibleTags() {
  let els = Array.from(document.querySelectorAll<HTMLElement>("ytd-rich-grid-media"));

  // Collect requests for each video
  let requests = els
    .map((el) => [el, videoForMedia(el)] as const)
    .filter(([, video]) => video !== null);

  // Make the request for all the tags
  let tags = await TAGS.forVideos(requests.map(([, video]) => video!));

  // Add / update the tags for each video
  requests.forEach(([el], i) => {
    ui.renderTagsIn(el, tags[i]);
  });
}

let observer = new MutationObserver(async (mutations) => {
  // Check for new videos on the page
  let blocks = mutations
    .flatMap((mutation) => Array.from(mutation.addedNodes))
    .filter((node): node is HTMLElement => node instanceof HTMLElement)
    .filter((node) => node.matches("ytd-rich-grid-media"));

  // Skip updates if there are no new videos on the page
  if (blocks.length === 0) {
    return;
  }

  // Render tags for the new / changed videos
  updateVisibleTags();
});

// Initial render for existing videos on the page
updateVisibleTags();

// Render tags for new videos as they are added to the page
observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
});
