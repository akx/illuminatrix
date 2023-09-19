import * as culori from "culori";
import type { Rgb } from "./types/app";

export function clampInteger(n: number, min: number, max: number): number {
  return Math.min(Math.max(Math.round(n), min), max);
}

export function getColorRGBs(colors: readonly string[]): Rgb[] {
  return colors.map((color) => {
    const rgb = culori.rgb(culori.parseHex(color));
    if (rgb === undefined) {
      throw new Error("Invalid color");
    }
    return rgb;
  });
}

export async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function rgbTripleToHex(rgbTriple: [number, number, number]): string {
  return `#${(rgbTriple ?? [255, 255, 255])
    .map((c) => c.toString(16).padStart(2, "0"))
    .join("")}`;
}

export function* randomBag<T>(arr: readonly T[]): Generator<T, never> {
  const bag = [...arr];
  while (true) {
    if (bag.length === 0) {
      bag.push(...arr);
    }
    const index = Math.floor(Math.random() * bag.length);
    const elements = bag.splice(index, 1);
    if (elements[0] !== undefined) {
      yield elements[0];
    }
  }
}

export function rgbTo8BitRGBTriple({ b, g, r }: Rgb) {
  return [
    clampInteger(r * 255, 0, 255),
    clampInteger(g * 255, 0, 255),
    clampInteger(b * 255, 0, 255),
  ];
}
