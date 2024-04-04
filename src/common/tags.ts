export interface Tag {
  /** The name of the tag to display */
  name: string;

  /** The color of the text and icon */
  color: string;

  /** A data uri representing an icon */
  icon: string;
}

export interface Video {
  video: string;
  channel: string;
}
