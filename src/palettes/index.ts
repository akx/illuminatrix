import type {
  CompressedPaletteV1,
  Palette,
  PaletteCollectionJSON,
} from "./types";

const EMPTY_PALETTE: Palette = {
  author: "",
  collection: "",
  colors: [],
  name: "",
  url: "",
};

const sources: Record<
  string,
  // can't use `default: PaletteCollectionJSON` because then
  // typescript insists on trying to validate things, and the compressed
  // array type is hard to validate
  () => Promise<{ default: unknown }>
> = {
  five_point_palettes: () => import("./data/five_point_palettes.json"),
  docc: () => import("./data/docc.json"),
  lospec: () => import("./data/lospec.json"),
  hue: () => import("./data/hue.json"),
};

function isCompressedPaletteV1(x: any): x is CompressedPaletteV1 {
  return Array.isArray(x) && (x.length === 5 || x.length === 6) && x[0] === 1;
}

function decompressColorString(color: string): string {
  if (color.length === 3) {
    const [r, g, b] = color.split("");
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  if (!color.startsWith("#")) {
    color = `#${color}`;
  }
  return color;
}

function decompressPalette(
  data: Partial<Palette> | CompressedPaletteV1,
  defaults: Partial<Palette>,
  tagMap: string[],
  colorMap: string[],
): Palette {
  if (isCompressedPaletteV1(data)) {
    const [
      version,
      name,
      timestamp,
      tagIndices,
      compressedColorsOrIndices,
      extra,
    ] = data;
    if (version !== 1) throw new Error(`Unknown palette version ${version}`);
    return {
      ...EMPTY_PALETTE,
      ...defaults,
      name,
      colors: compressedColorsOrIndices.map((c) =>
        typeof c === "string"
          ? decompressColorString(c)
          : colorMap[c] ?? "#ff00ff",
      ),
      date: new Date(timestamp * 1000).toISOString(),
      tags: tagIndices.map((i) => tagMap[i] ?? "<unknown>"),
      ...(extra || {}),
    };
  }
  return {
    ...EMPTY_PALETTE,
    ...defaults,
    ...data,
  };
}

function getPalettesFromCollection({
  defaults,
  palettes,
  tag_indices,
  color_indices,
}: PaletteCollectionJSON): Palette[] {
  const tagMap = tag_indices ?? [];
  const colorMap = (color_indices ?? []).map(decompressColorString);
  return palettes.map((data) =>
    decompressPalette(data, defaults ?? {}, tagMap, colorMap),
  );
}

function shuffle<T>(x: T[]): void {
  // Fisher-Yates shuffle
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // casts are OK: we know i and j are in bounds
    const t = x[i] as T;
    x[i] = x[j] as T;
    x[j] = t;
  }
}

export async function getPalettes(): Promise<Palette[]> {
  const promises = Object.values(sources).map((source) => source());
  const results = await Promise.all(promises);
  const palettes = results.flatMap((result) =>
    getPalettesFromCollection(result.default as PaletteCollectionJSON),
  );
  shuffle(palettes);
  return palettes;
}
