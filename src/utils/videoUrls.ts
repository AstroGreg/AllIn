type VideoUrlFields = {
  preview_url?: string | null;
  original_url?: string | null;
  full_url?: string | null;
  raw_url?: string | null;
  hls_manifest_path?: string | null;
};

type UrlResolver = (value?: string | null) => string | null | undefined;

const MP4_LIKE_RE = /\.(mp4|mov|m4v)(\?|$)/i;

export function selectPreferredVideoUrls(
  source: VideoUrlFields | null | undefined,
  resolvers: {
    toAbsoluteUrl: UrlResolver;
    toHlsUrl: UrlResolver;
  },
) {
  if (!source) {
    return {
      playbackUrl: null,
      fallbackPlaybackUrl: null,
      downloadUrl: null,
      fileUrls: [] as string[],
      hlsUrl: null as string | null,
    };
  }

  const fileUrls = [
    source.original_url,
    source.full_url,
    source.raw_url,
    source.preview_url,
  ]
    .filter(Boolean)
    .map((value) => resolvers.toAbsoluteUrl(String(value)) || '')
    .filter(Boolean);

  const mp4LikeUrl = fileUrls.find((value) => MP4_LIKE_RE.test(value)) || null;
  const hlsUrl = source.hls_manifest_path ? (resolvers.toHlsUrl(source.hls_manifest_path) || null) : null;
  const playbackUrl = hlsUrl || mp4LikeUrl || fileUrls[0] || null;
  const downloadUrl = mp4LikeUrl || fileUrls[0] || hlsUrl || null;

  return {
    playbackUrl,
    fallbackPlaybackUrl: playbackUrl && downloadUrl && playbackUrl !== downloadUrl ? downloadUrl : null,
    downloadUrl,
    fileUrls,
    hlsUrl,
  };
}
