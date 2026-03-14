import { Alert, Linking, Platform } from 'react-native';
import NativeShare from 'react-native-share';
import { AppConfig } from '../../constants/AppConfig';
import type { InstagramStoryComposeOptions } from './InstagramStoryComposer';

const INSTAGRAM_APP_ID = String(AppConfig.INSTAGRAM_APP_ID ?? '').trim();
const STORY_APP_NAME = 'SpotMe';
const STORY_BACKGROUND_TOP_COLOR = '#0D0F12';
const STORY_BACKGROUND_BOTTOM_COLOR = '#0D0F12';
const STORY_ATTRIBUTION_URL = 'https://spot-me.ai';

type TranslateFn = (key: string) => string;
type ComposeInstagramStoryImage = (
    imageUri?: string | null,
    title?: string | null,
    appName?: string | null,
    subtitle?: string | null,
    options?: InstagramStoryComposeOptions,
) => Promise<string>;

type ShareModuleLike = {
    Social?: {
        INSTAGRAM_STORIES?: string;
    };
    shareSingle?: (options: Record<string, unknown>) => Promise<unknown>;
    isPackageInstalled?: (packageName: string) => Promise<{ isInstalled?: boolean } | null | undefined>;
};

export type InstagramStoryShareResult = 'shared' | 'unavailable' | 'unsupported';

function resolveShareModule(shareModule?: ShareModuleLike | null) {
    return (shareModule ?? (NativeShare as ShareModuleLike)) || null;
}

async function ensureInstagramStoryAvailable(
    t: TranslateFn,
    shareModule?: ShareModuleLike | null,
): Promise<{ result: InstagramStoryShareResult; shareLib?: ShareModuleLike }> {
    if (!INSTAGRAM_APP_ID) {
        Alert.alert(t('Instagram Story failed'), t('INSTAGRAM_APP_ID is missing.'));
        return { result: 'unavailable' };
    }

    const shareLib = resolveShareModule(shareModule);
    if (!shareLib?.shareSingle || !shareLib?.Social?.INSTAGRAM_STORIES) {
        return { result: 'unsupported' };
    }

    try {
        if (Platform.OS === 'android') {
            const pkg = await shareLib.isPackageInstalled?.('com.instagram.android');
            if (pkg && !pkg.isInstalled) {
                Alert.alert(t('Instagram unavailable'), t('Install Instagram to share to Stories.'));
                return { result: 'unavailable' };
            }
        } else {
            const canOpen = await Linking.canOpenURL('instagram-stories://share');
            if (!canOpen) {
                Alert.alert(t('Instagram unavailable'), t('Install Instagram to share to Stories.'));
                return { result: 'unavailable' };
            }
        }
    } catch {
        Alert.alert(t('Instagram unavailable'), t('Could not verify Instagram installation.'));
        return { result: 'unavailable' };
    }

    return { result: 'shared', shareLib };
}

export async function shareMediaToInstagramStory(params: {
    t: TranslateFn;
    composeInstagramStoryImage: ComposeInstagramStoryImage;
    localAssetUrl: string;
    isVideo: boolean;
    title?: string | null;
    subtitle?: string | null;
    composeImageUri?: string | null;
    preferComposedBackground?: boolean;
    shareModule?: ShareModuleLike | null;
}): Promise<InstagramStoryShareResult> {
    const {
        t,
        composeInstagramStoryImage,
        localAssetUrl,
        isVideo,
        title,
        subtitle,
        composeImageUri,
        preferComposedBackground,
        shareModule,
    } = params;
    const availability = await ensureInstagramStoryAvailable(t, shareModule);
    if (availability.result !== 'shared' || !availability.shareLib) {
        return availability.result;
    }

    if (isVideo && preferComposedBackground && String(composeImageUri ?? '').trim()) {
        const composedImageUri = await composeInstagramStoryImage(
            composeImageUri,
            title,
            STORY_APP_NAME,
            subtitle,
            { layout: 'home_media_card' },
        );

        await availability.shareLib.shareSingle?.({
            social: availability.shareLib.Social?.INSTAGRAM_STORIES,
            appId: INSTAGRAM_APP_ID,
            backgroundImage: composedImageUri,
            backgroundTopColor: STORY_BACKGROUND_TOP_COLOR,
            backgroundBottomColor: STORY_BACKGROUND_BOTTOM_COLOR,
            attributionURL: STORY_ATTRIBUTION_URL,
            failOnCancel: false,
        });

        return 'shared';
    }

    if (!isVideo && (String(title ?? '').trim() || String(subtitle ?? '').trim())) {
        const composedImageUri = await composeInstagramStoryImage(
            composeImageUri || localAssetUrl,
            title,
            STORY_APP_NAME,
            subtitle,
            { layout: 'home_media_card' },
        );

        await availability.shareLib.shareSingle?.({
            social: availability.shareLib.Social?.INSTAGRAM_STORIES,
            appId: INSTAGRAM_APP_ID,
            backgroundImage: composedImageUri,
            backgroundTopColor: STORY_BACKGROUND_TOP_COLOR,
            backgroundBottomColor: STORY_BACKGROUND_BOTTOM_COLOR,
            attributionURL: STORY_ATTRIBUTION_URL,
            failOnCancel: false,
        });

        return 'shared';
    }

    const stickerImage = await composeInstagramStoryImage(
        null,
        isVideo ? title : null,
        STORY_APP_NAME,
        isVideo ? subtitle : null,
        isVideo && (String(title ?? '').trim() || String(subtitle ?? '').trim())
            ? { mode: 'overlay', layout: 'home_media_overlay_card' }
            : { mode: 'overlay' },
    );

    await availability.shareLib.shareSingle?.({
        social: availability.shareLib.Social?.INSTAGRAM_STORIES,
        appId: INSTAGRAM_APP_ID,
        backgroundImage: isVideo ? undefined : localAssetUrl,
        backgroundVideo: isVideo ? localAssetUrl : undefined,
        stickerImage,
        backgroundTopColor: STORY_BACKGROUND_TOP_COLOR,
        backgroundBottomColor: STORY_BACKGROUND_BOTTOM_COLOR,
        attributionURL: STORY_ATTRIBUTION_URL,
        failOnCancel: false,
    });

    return 'shared';
}

export async function shareBlogToInstagramStory(params: {
    t: TranslateFn;
    composeInstagramStoryImage: ComposeInstagramStoryImage;
    imageUri?: string | null;
    title?: string | null;
    subtitle?: string | null;
    shareModule?: ShareModuleLike | null;
}): Promise<InstagramStoryShareResult> {
    const { t, composeInstagramStoryImage, imageUri, title, subtitle, shareModule } = params;
    const availability = await ensureInstagramStoryAvailable(t, shareModule);
    if (availability.result !== 'shared' || !availability.shareLib) {
        return availability.result;
    }

    const composedImageUri = await composeInstagramStoryImage(
        imageUri,
        title,
        STORY_APP_NAME,
        subtitle,
        { layout: 'blog_card' },
    );

    await availability.shareLib.shareSingle?.({
        social: availability.shareLib.Social?.INSTAGRAM_STORIES,
        appId: INSTAGRAM_APP_ID,
        backgroundImage: composedImageUri,
        backgroundTopColor: STORY_BACKGROUND_TOP_COLOR,
        backgroundBottomColor: STORY_BACKGROUND_BOTTOM_COLOR,
        attributionURL: STORY_ATTRIBUTION_URL,
        failOnCancel: false,
    });

    return 'shared';
}
