import { ratiosToCompare } from '../config';

export function normalisedRGB(rgb: RGB): RGB {
  return {
    r: Math.round(rgb.r * 255),
    g: Math.round(rgb.g * 255),
    b: Math.round(rgb.b * 255),
  }
}

export function luminance(rgb: RGB) {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return r * 0.2126 + g * 0.7152 + b * 0.0722;
};

export function contrast(colorA: RGB, colorB: RGB) {
  const foregroundLumiance = luminance(colorA);
  const backgroundLuminance = luminance(colorB);
  return backgroundLuminance < foregroundLumiance
      ? ((backgroundLuminance + 0.05) / (foregroundLumiance + 0.05))
      : ((foregroundLumiance + 0.05) / (backgroundLuminance + 0.05));
};

export function HexToRGB(hex: string): RGB {
  hex = hex.slice(1);
  const value = parseInt(hex, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return { r, g, b };
};

export function RGBToHex(rgb: RGB): string {
  let normalised = normalisedRGB(rgb)
  let r = normalised.r.toString(16);
  let g = normalised.g.toString(16);
  let b = normalised.b.toString(16);

  if (r.length == 1)
    r = "0" + r;
  if (g.length == 1)
    g = "0" + g;
  if (b.length == 1)
    b = "0" + b;

  return "#" + r + g + b;
}

export function getCurrentRatio(fgColor: string, bgColor:string):number {
  const ratioContrast = contrast(
    HexToRGB(fgColor), 
    HexToRGB(bgColor)
  )
  return ratioContrast
}

export function doesPass(ratio: number, ratioLevel: string, fontSize:string):boolean {
  const passRatio:number = ratiosToCompare[ratioLevel][fontSize]
  return ratio < passRatio
}