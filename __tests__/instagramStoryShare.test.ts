import {shareMediaToInstagramStory} from '../src/components/share/instagramStoryShare';

jest.mock('react-native', () => ({
  Alert: {alert: jest.fn()},
  Linking: {canOpenURL: jest.fn().mockResolvedValue(true)},
  Platform: {OS: 'android'},
}));

jest.mock('react-native-fs', () => ({
  __esModule: true,
  default: {
    exists: jest.fn().mockResolvedValue(true),
  },
  exists: jest.fn().mockResolvedValue(true),
}));

jest.mock('react-native-share', () => ({
  __esModule: true,
  default: {
    Social: {
      INSTAGRAM_STORIES: 'instagram-stories',
    },
    shareSingle: jest.fn().mockResolvedValue(undefined),
    isPackageInstalled: jest.fn().mockResolvedValue({isInstalled: true}),
  },
}));

jest.mock('../src/constants/AppConfig', () => ({
  AppConfig: {
    INSTAGRAM_APP_ID: 'test-instagram-app-id',
  },
}));

describe('shareMediaToInstagramStory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses a fully composed background for titled image stories when capture succeeds', async () => {
    const composeInstagramStoryImage = jest
      .fn()
      .mockResolvedValue('file:///tmp/home-composed-background.png');
    const shareSingle = jest.fn().mockResolvedValue(undefined);
    const isPackageInstalled = jest.fn().mockResolvedValue({isInstalled: true});

    const result = await shareMediaToInstagramStory({
      t: (key) => key,
      composeInstagramStoryImage,
      localAssetUrl: 'file:///tmp/source-image.webp',
      isVideo: false,
      title: 'BK CadSch',
      subtitle: 'Face + Chest',
      composeImageUri: 'file:///tmp/ignored-composed-source.webp',
      shareModule: {
        Social: {
          INSTAGRAM_STORIES: 'instagram-stories',
        },
        shareSingle,
        isPackageInstalled,
      },
    });

    expect(result).toBe('shared');
    expect(composeInstagramStoryImage).toHaveBeenCalledWith(
      'file:///tmp/ignored-composed-source.webp',
      'BK CadSch',
      'SpotMe',
      'Face + Chest',
      {layout: 'home_media_card'},
    );
    expect(shareSingle).toHaveBeenCalledWith(
      expect.objectContaining({
        social: 'instagram-stories',
        appId: 'test-instagram-app-id',
        backgroundImage: 'file:///tmp/home-composed-background.png',
      }),
    );
  });

  it('falls back to the sticker overlay path if composed background capture fails', async () => {
    const composeInstagramStoryImage = jest
      .fn()
      .mockRejectedValueOnce(new Error('capture failed'))
      .mockResolvedValueOnce('file:///tmp/home-overlay-sticker.png');
    const shareSingle = jest.fn().mockResolvedValue(undefined);
    const isPackageInstalled = jest.fn().mockResolvedValue({isInstalled: true});

    const result = await shareMediaToInstagramStory({
      t: (key) => key,
      composeInstagramStoryImage,
      localAssetUrl: 'file:///tmp/source-image.webp',
      isVideo: false,
      title: 'BK CadSch',
      subtitle: 'Face + Chest',
      composeImageUri: 'file:///tmp/source-image.webp',
      shareModule: {
        Social: {
          INSTAGRAM_STORIES: 'instagram-stories',
        },
        shareSingle,
        isPackageInstalled,
      },
    });

    expect(result).toBe('shared');
    expect(composeInstagramStoryImage).toHaveBeenNthCalledWith(
      1,
      'file:///tmp/source-image.webp',
      'BK CadSch',
      'SpotMe',
      'Face + Chest',
      {layout: 'home_media_card'},
    );
    expect(composeInstagramStoryImage).toHaveBeenNthCalledWith(
      2,
      null,
      'BK CadSch',
      'SpotMe',
      'Face + Chest',
      {mode: 'overlay', layout: 'home_media_overlay_card'},
    );
    expect(shareSingle).toHaveBeenCalledWith(
      expect.objectContaining({
        backgroundImage: 'file:///tmp/source-image.webp',
        stickerImage: 'file:///tmp/home-overlay-sticker.png',
      }),
    );
  });
});
