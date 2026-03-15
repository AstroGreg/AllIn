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

  it('uses the real image as Instagram background and the new layout as sticker for titled image stories', async () => {
    const composeInstagramStoryImage = jest
      .fn()
      .mockResolvedValue('file:///tmp/home-overlay-sticker.png');
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
      null,
      'BK CadSch',
      'SpotMe',
      'Face + Chest',
      {mode: 'overlay', layout: 'home_media_overlay_card'},
    );
    expect(shareSingle).toHaveBeenCalledWith(
      expect.objectContaining({
        social: 'instagram-stories',
        appId: 'test-instagram-app-id',
        backgroundImage: 'file:///tmp/source-image.webp',
        stickerImage: 'file:///tmp/home-overlay-sticker.png',
      }),
    );
  });
});
