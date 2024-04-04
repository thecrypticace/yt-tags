import type { Tag, Video } from "../common";
import { Data } from "./data";

export class Tags {
  constructor(private data: Promise<Data> = Data.load()) {}

  async forVideos(videos: Video[]): Promise<Tag[][]> {
    const data = await this.data;

    return videos.map((video) => {
      // Video tags take precedence over channel tags
      const ids = new Set(data.videos[video.video] ?? data.channels[video.channel] ?? []);

      return Array.from(ids, (id) => data.tags[id]);
    });
  }
}
