import { Alert, Linking, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import NativeShare from 'react-native-share';
import { AppConfig } from '../../constants/AppConfig';
import type { InstagramStoryComposeOptions } from './InstagramStoryComposer';

const INSTAGRAM_APP_ID = String(AppConfig.INSTAGRAM_APP_ID ?? '').trim();
const STORY_APP_NAME = 'SpotMe';
const STORY_BACKGROUND_TOP_COLOR = '#0D0F12';
const STORY_BACKGROUND_BOTTOM_COLOR = '#0D0F12';
const STORY_ATTRIBUTION_URL = 'https://spot-me.ai';

function debugInstagramStory(stage: string, details?: Record<string, unknown>) {
    console.log(`[IGStory] ${stage}`, details ?? {});
}

async function describeLocalFile(uri?: string | null) {
    const normalized = String(uri ?? '').trim();
    if (!normalized) {
        return null;
    }
    if (!normalized.startsWith('file://')) {
        return {uri: normalized, exists: null};
    }

    const path = normalized.slice('file://'.length);
    try {
        const exists = await RNFS.exists(path);
        return {uri: normalized, path, exists};
    } catch (error: any) {
        return {
            uri: normalized,
            path,
            exists: null,
            error: String(error?.message ?? error),
        };
    }
}

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
    debugInstagramStory('availability.check.start', {
        platform: Platform.OS,
        hasAppId: Boolean(INSTAGRAM_APP_ID),
    });
    if (!INSTAGRAM_APP_ID) {
        Alert.alert(t('Instagram Story failed'), t('INSTAGRAM_APP_ID is missing.'));
        debugInstagramStory('availability.check.failed', {reason: 'missing_app_id'});
        return { result: 'unavailable' };
    }

    const shareLib = resolveShareModule(shareModule);
    if (!shareLib?.shareSingle || !shareLib?.Social?.INSTAGRAM_STORIES) {
        debugInstagramStory('availability.check.failed', {reason: 'share_module_unsupported'});
        return { result: 'unsupported' };
    }

    try {
        if (Platform.OS === 'android') {
            const pkg = await shareLib.isPackageInstalled?.('com.instagram.android');
            if (pkg && !pkg.isInstalled) {
                Alert.alert(t('Instagram unavailable'), t('Install Instagram to share to Stories.'));
                debugInstagramStory('availability.check.failed', {reason: 'instagram_not_installed'});
                return { result: 'unavailable' };
            }
        } else {
            const canOpen = await Linking.canOpenURL('instagram-stories://share');
            if (!canOpen) {
                Alert.alert(t('Instagram unavailable'), t('Install Instagram to share to Stories.'));
                debugInstagramStory('availability.check.failed', {reason: 'scheme_unavailable'});
                return { result: 'unavailable' };
            }
        }
    } catch (error: any) {
        Alert.alert(t('Instagram unavailable'), t('Could not verify Instagram installation.'));
        debugInstagramStory('availability.check.failed', {
            reason: 'verification_error',
            message: String(error?.message ?? error),
        });
        return { result: 'unavailable' };
    }

    debugInstagramStory('availability.check.ready');
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
    debugInstagramStory('shareMedia.start', {
        isVideo,
        title: title ?? null,
        subtitle: subtitle ?? null,
        localAssetUrl,
        composeImageUri: composeImageUri ?? null,
        preferComposedBackground: Boolean(preferComposedBackground),
    });
    const availability = await ensureInstagramStoryAvailable(t, shareModule);
    if (availability.result !== 'shared' || !availability.shareLib) {
        debugInstagramStory('shareMedia.aborted', {result: availability.result});
        return availability.result;
    }

    try {
        if (isVideo && preferComposedBackground && String(composeImageUri ?? '').trim()) {
            debugInstagramStory('shareMedia.compose.background.start', {
                branch: 'video_composed_background',
                composeImageUri,
            });
            const composedImageUri = await composeInstagramStoryImage(
                composeImageUri,
                title,
                STORY_APP_NAME,
                subtitle,
                { layout: 'home_media_card' },
            );
            debugInstagramStory('shareMedia.compose.background.done', {
                branch: 'video_composed_background',
                composedImage: await describeLocalFile(composedImageUri),
            });

            await availability.shareLib.shareSingle?.({
                social: availability.shareLib.Social?.INSTAGRAM_STORIES,
                appId: INSTAGRAM_APP_ID,
                backgroundImage: composedImageUri,
                backgroundTopColor: STORY_BACKGROUND_TOP_COLOR,
                backgroundBottomColor: STORY_BACKGROUND_BOTTOM_COLOR,
                attributionURL: STORY_ATTRIBUTION_URL,
                failOnCancel: false,
            });
            debugInstagramStory('shareMedia.shareSingle.done', {branch: 'video_composed_background'});

            return 'shared';
        }

        if (!isVideo && (String(title ?? '').trim() || String(subtitle ?? '').trim())) {
            debugInstagramStory('shareMedia.compose.sticker.start', {
                branch: 'image_overlay_card',
                backgroundAsset: await describeLocalFile(localAssetUrl),
                composeImageUri: composeImageUri ?? null,
            });
            const stickerImage = await composeInstagramStoryImage(
                null,
                title,
                STORY_APP_NAME,
                subtitle,
                { mode: 'overlay', layout: 'home_media_overlay_card' },
            );
            debugInstagramStory('shareMedia.compose.sticker.done', {
                branch: 'image_overlay_card',
                stickerImage: await describeLocalFile(stickerImage),
            });

            await availability.shareLib.shareSingle?.({
                social: availability.shareLib.Social?.INSTAGRAM_STORIES,
                appId: INSTAGRAM_APP_ID,
                backgroundImage: localAssetUrl,
                stickerImage,
                backgroundTopColor: STORY_BACKGROUND_TOP_COLOR,
                backgroundBottomColor: STORY_BACKGROUND_BOTTOM_COLOR,
                attributionURL: STORY_ATTRIBUTION_URL,
                failOnCancel: false,
            });
            debugInstagramStory('shareMedia.shareSingle.done', {branch: 'image_overlay_card'});

            return 'shared';
        }

        debugInstagramStory('shareMedia.compose.sticker.start', {
            branch: isVideo ? 'video_overlay' : 'image_badge_overlay',
            backgroundAsset: isVideo ? null : await describeLocalFile(localAssetUrl),
        });
        const stickerImage = await composeInstagramStoryImage(
            null,
            isVideo ? title : null,
            STORY_APP_NAME,
            isVideo ? subtitle : null,
            isVideo && (String(title ?? '').trim() || String(subtitle ?? '').trim())
                ? { mode: 'overlay', layout: 'home_media_overlay_card' }
                : { mode: 'overlay' },
        );
        debugInstagramStory('shareMedia.compose.sticker.done', {
            stickerImage: await describeLocalFile(stickerImage),
        });

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
        debugInstagramStory('shareMedia.shareSingle.done', {
            branch: isVideo ? 'video_overlay' : 'image_badge_overlay',
        });

        return 'shared';
    } catch (error: any) {
        debugInstagramStory('shareMedia.failed', {
            message: String(error?.message ?? error),
        });
        throw error;
    }
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
    debugInstagramStory('shareBlog.start', {
        imageUri: imageUri ?? null,
        title: title ?? null,
        subtitle: subtitle ?? null,
    });
    const availability = await ensureInstagramStoryAvailable(t, shareModule);
    if (availability.result !== 'shared' || !availability.shareLib) {
        debugInstagramStory('shareBlog.aborted', {result: availability.result});
        return availability.result;
    }

    try {
        const composedImageUri = await composeInstagramStoryImage(
            imageUri,
            title,
            STORY_APP_NAME,
            subtitle,
            { layout: 'blog_card' },
        );
        debugInstagramStory('shareBlog.compose.done', {
            composedImage: await describeLocalFile(composedImageUri),
        });

        await availability.shareLib.shareSingle?.({
            social: availability.shareLib.Social?.INSTAGRAM_STORIES,
            appId: INSTAGRAM_APP_ID,
            backgroundImage: composedImageUri,
            backgroundTopColor: STORY_BACKGROUND_TOP_COLOR,
            backgroundBottomColor: STORY_BACKGROUND_BOTTOM_COLOR,
            attributionURL: STORY_ATTRIBUTION_URL,
            failOnCancel: false,
        });
        debugInstagramStory('shareBlog.shareSingle.done');

        return 'shared';
    } catch (error: any) {
        debugInstagramStory('shareBlog.failed', {
            message: String(error?.message ?? error),
        });
        throw error;
    }
}
