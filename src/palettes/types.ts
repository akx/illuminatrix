export interface Palette {
  name: string;
  collection: string;
  author: string;
  url: string;
  colors: string[];
  date?: string;
  tags?: string[];
}

export type CompressedPaletteV1 = [
  1,
  string, // name
  number, // unix timestamp
  number[], // tag indices
  Array<number | string>, // color index or compressed colors (no #, 3 or 6 chars)
  Partial<Palette> | never, // any extra data
];

export interface PaletteCollectionJSON {
  v?: number;
  defaults?: Partial<Palette>;
  tag_indices?: string[]; // maps tag index to tag
  color_indices?: string[]; // maps color index to color
  palettes: Array<Partial<Palette> | CompressedPaletteV1>;
}
