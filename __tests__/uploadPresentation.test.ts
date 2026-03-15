import {
  formatUploadDisplayName,
  formatUploadStageLabel,
  normalizeUploadFileName,
} from '../src/utils/uploadPresentation';

describe('uploadPresentation', () => {
  it('normalizes ugly device file names', () => {
    expect(normalizeUploadFileName('IMG_2026-03-15 00-55-33.JPG')).toBe('IMG 2026 03 15 00 55 33');
  });

  it('prefers explicit titles over file names', () => {
    expect(
      formatUploadDisplayName({
        title: '4x400m mixed relay',
        fileName: 'IMG_1234.MOV',
        type: 'video/quicktime',
        fallbackIndex: 1,
      }),
    ).toBe('4x400m mixed relay');
  });

  it('formats fallback file labels into readable names', () => {
    expect(
      formatUploadDisplayName({
        fileName: 'merksem_4x400m-mixed.MOV',
        type: 'video/quicktime',
        fallbackIndex: 2,
      }),
    ).toBe('Merksem 4x400m Mixed');
  });

  it('maps backend processing stages to user-facing labels', () => {
    expect(formatUploadStageLabel('uploaded')).toBe('Stored');
    expect(formatUploadStageLabel('ai_processing')).toBe('AI processing');
    expect(formatUploadStageLabel('notifying')).toBe('Sending notifications');
    expect(formatUploadStageLabel('complete')).toBe('Ready');
  });
});
