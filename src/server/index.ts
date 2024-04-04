import { Tags } from "./tags";

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
    text: "OFF",
  });
});

// Listen for messages from the injected script
const TAGS = new Tags();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Ignore messages from non-YouTube tabs or from other extensions
  if (!YOUTUBE_URLS.some((url) => sender.tab?.url?.startsWith(url))) return;

  // The request is not valid
  if (!request || typeof request !== "object") {
    sendResponse({ kind: "error", data: { message: "Invalid message" } });
    return;
  }

  if (request.kind !== "tags:read") {
    sendResponse({ kind: "error", data: { message: "Unknown message type" } });
    return;
  }

  let videos = request.data?.videos ?? [];

  if (!Array.isArray(videos)) {
    sendResponse({ kind: "error", data: { message: "Invalid videos" } });
    return;
  }

  for (let video of videos) {
    if (
      !video ||
      typeof video !== "object" ||
      typeof video.video !== "string" ||
      typeof video.channel !== "string"
    ) {
      sendResponse({ kind: "error", data: { message: "Invalid video", video } });
      return;
    }
  }

  async function read() {
    let tags = await TAGS.forVideos(videos);

    sendResponse({
      kind: "tags:list",
      data: {
        tags,
      },
    });
  }

  read();

  return true;
});

const YOUTUBE_URLS = ["https://youtube.com/", "https://www.youtube.com/"];
const INJECTED = new Set<number>();

// Inject tag rendering script into YouTube tabs
chrome.tabs.onUpdated.addListener(async (tabId, { status }) => {
  if (status !== "complete") {
    INJECTED.delete(tabId);
    return;
  }

  if (INJECTED.has(tabId)) return;
  let tab = await chrome.tabs.get(tabId);
  if (!YOUTUBE_URLS.some((url) => tab.url?.startsWith(url))) return;

  await chrome.action.setBadgeText({
    tabId,
    text: "Loading",
  });

  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["dist/client.js"],
  });

  INJECTED.add(tabId);

  await chrome.action.setBadgeText({
    tabId,
    text: "ON",
  });
});
