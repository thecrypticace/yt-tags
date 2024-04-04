declare const browser: typeof import("webextension-polyfill");

import { Tags } from "../server/tags";

browser.runtime.onInstalled.addListener(() => {
  browser.action.setBadgeText({
    text: "OFF",
  });
});

// Listen for messages from the injected script
const TAGS = new Tags();

browser.runtime.onMessage.addListener(async (request, sender) => {
  // Ignore messages from non-YouTube tabs or from other extensions
  if (!YOUTUBE_URLS.some((url) => sender.tab?.url?.startsWith(url))) return;

  // The request is not valid
  if (!request || typeof request !== "object") {
    return { kind: "error", data: { message: "Invalid message" } };
  }

  if (request.kind !== "tags:read") {
    return { kind: "error", data: { message: "Unknown message type" } };
  }

  let videos = request.data?.videos ?? [];

  if (!Array.isArray(videos)) {
    return { kind: "error", data: { message: "Invalid videos" } };
  }

  for (let video of videos) {
    if (
      !video ||
      typeof video !== "object" ||
      typeof video.video !== "string" ||
      typeof video.channel !== "string"
    ) {
      return { kind: "error", data: { message: "Invalid video", video } };
    }
  }

  let tags = await TAGS.forVideos(videos);

  return {
    kind: "tags:list",
    data: {
      tags,
    },
  };
});

const YOUTUBE_URLS = ["https://youtube.com/", "https://www.youtube.com/"];
const INJECTED = new Set<number>();

// Inject tag rendering script into YouTube tabs
browser.tabs.onUpdated.addListener(async (tabId, { status }) => {
  if (status !== "complete") {
    INJECTED.delete(tabId);
    return;
  }

  if (INJECTED.has(tabId)) return;
  let tab = await browser.tabs.get(tabId);

  console.log({ tabId, status, url: tab.url, YOUTUBE_URLS });

  if (!YOUTUBE_URLS.some((url) => tab.url?.startsWith(url))) return;

  console.log("yay");

  await browser.action.setBadgeText({
    tabId,
    text: "…",
  });

  try {
    let res = await browser.scripting.executeScript({
      target: { tabId },
      files: ["dist/client.js"],
    });

    console.log({ res });
  } catch (err) {
    console.error(err);
    throw err;
  }

  INJECTED.add(tabId);

  await browser.action.setBadgeText({
    tabId,
    text: "ON",
  });
});
