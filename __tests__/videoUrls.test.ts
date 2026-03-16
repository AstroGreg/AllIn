import {selectPreferredVideoUrls} from '../src/utils/videoUrls';

describe('selectPreferredVideoUrls', () => {
  const toAbsoluteUrl = (value?: string | null) => (value ? `https://api.spot-me.ai/${String(value).replace(/^\//, '')}` : null);
  const toHlsUrl = (value?: string | null) => (value ? `https://api.spot-me.ai/${String(value).replace(/^\//, '')}` : null);

  it('prefers HLS for playback when both HLS and MP4-like files exist', () => {
    const result = selectPreferredVideoUrls(
      {
        full_url: '/media/123/full.mp4',
        raw_url: '/media/123/raw.mov',
        hls_manifest_path: '/media/123/hls/master.m3u8',
      },
      {toAbsoluteUrl, toHlsUrl},
    );

    expect(result.playbackUrl).toBe('https://api.spot-me.ai/media/123/hls/master.m3u8');
    expect(result.fallbackPlaybackUrl).toBe('https://api.spot-me.ai/media/123/full.mp4');
    expect(result.downloadUrl).toBe('https://api.spot-me.ai/media/123/full.mp4');
  });

  it('falls back to MP4-like file playback when HLS is unavailable', () => {
    const result = selectPreferredVideoUrls(
      {
        preview_url: '/media/123/preview.mp4',
      },
      {toAbsoluteUrl, toHlsUrl},
    );

    expect(result.playbackUrl).toBe('https://api.spot-me.ai/media/123/preview.mp4');
    expect(result.fallbackPlaybackUrl).toBeNull();
    expect(result.downloadUrl).toBe('https://api.spot-me.ai/media/123/preview.mp4');
  });

  it('prefers the original/full file over preview for downloads', () => {
    const result = selectPreferredVideoUrls(
      {
        preview_url: '/media/123/preview.mp4',
        original_url: '/media/123/full.mp4',
      },
      {toAbsoluteUrl, toHlsUrl},
    );

    expect(result.playbackUrl).toBe('https://api.spot-me.ai/media/123/full.mp4');
    expect(result.downloadUrl).toBe('https://api.spot-me.ai/media/123/full.mp4');
  });
});
