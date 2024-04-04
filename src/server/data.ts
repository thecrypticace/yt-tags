import { Tag } from "../common";

export class Data {
  public tags: Record<string, Tag> = {};
  public channels: Record<string, string[]> = {};
  public videos: Record<string, string[]> = {};

  static async load() {
    const url = chrome.runtime.getURL(`data/tags.json`);
    const response = await fetch(url).then((response) => response.json());

    let tags: Tag[] = response.tags ?? [];
    let channels: Record<string, string[]> = response.channels ?? {};
    let videos: Record<string, string[]> = response.videos ?? {};

    let icons = await this.loadIcons(tags.map((tag) => tag.icon));

    let data = new Data();

    for (let [idx, tag] of tags.entries()) {
      data.tags[tag.name] = {
        name: tag.name,
        color: tag.color,
        icon: icons[idx],
      };
    }

    data.channels = channels;
    data.videos = videos;

    return data;
  }

  private static async loadIcons(names: string[]): Promise<string[]> {
    const urls = names.map((name) => chrome.runtime.getURL(`data/icons/${name}.svg`));
    const responses = await Promise.all(
      urls.map((url) => fetch(url).then((response) => response.text())),
    );

    return responses;
  }
}
