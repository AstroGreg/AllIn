export function isSvgAssetUrl(value?: string | null): boolean {
  const uri = String(value ?? '').trim();
  if (!uri) {
    return false;
  }
  return /\.svg(?:$|[?#])/i.test(uri) || /image\/svg\+xml/i.test(uri);
}
