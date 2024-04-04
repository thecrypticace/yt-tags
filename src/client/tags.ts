import type { Tag, Video } from "../common";

export class Tags {
  public async forVideos(videos: Video[]): Promise<Tag[][]> {
    // Ask the extension for tags
    const response = await chrome.runtime.sendMessage({
      kind: "tags:read",
      data: {
        videos,
      },
    });

    // Invalid response: Not the expected type
    if (!response || typeof response !== "object") {
      return [];
    }

    // Invalid response: Not the expected message kind
    if (response.kind !== "tags:list") {
      return [];
    }

    // Invalid response: No data
    if (!response.data) {
      return [];
    }

    // Make sure the tags are an array
    let groups: Tag[][] = response.data?.tags ?? [];

    // Invalid response: Too many or too few tags
    if (groups.length !== videos.length) {
      return [];
    }

    // Ignore invalid tags (in case the user has tampered with the data)
    return groups.map((tags) =>
      tags.filter((tag) => {
        return (
          tag &&
          typeof tag === "object" &&
          typeof tag.name === "string" &&
          typeof tag.color === "string" &&
          typeof tag.icon === "string"
        );
      }),
    );
  }
}
