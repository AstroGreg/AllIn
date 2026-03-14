var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
import { Alert, Linking, Platform } from 'react-native';
import NativeShare from 'react-native-share';
import { AppConfig } from '../../constants/AppConfig';
const INSTAGRAM_APP_ID = String((_a = AppConfig.INSTAGRAM_APP_ID) !== null && _a !== void 0 ? _a : '').trim();
const STORY_APP_NAME = 'SpotMe';
const STORY_BACKGROUND_TOP_COLOR = '#0D0F12';
const STORY_BACKGROUND_BOTTOM_COLOR = '#0D0F12';
const STORY_ATTRIBUTION_URL = 'https://spot-me.ai';
function resolveShareModule(shareModule) {
    return (shareModule !== null && shareModule !== void 0 ? shareModule : NativeShare) || null;
}
function ensureInstagramStoryAvailable(t, shareModule) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        if (!INSTAGRAM_APP_ID) {
            Alert.alert(t('Instagram Story failed'), t('INSTAGRAM_APP_ID is missing.'));
            return { result: 'unavailable' };
        }
        const shareLib = resolveShareModule(shareModule);
        if (!(shareLib === null || shareLib === void 0 ? void 0 : shareLib.shareSingle) || !((_a = shareLib === null || shareLib === void 0 ? void 0 : shareLib.Social) === null || _a === void 0 ? void 0 : _a.INSTAGRAM_STORIES)) {
            return { result: 'unsupported' };
        }
        try {
            if (Platform.OS === 'android') {
                const pkg = yield ((_b = shareLib.isPackageInstalled) === null || _b === void 0 ? void 0 : _b.call(shareLib, 'com.instagram.android'));
                if (pkg && !pkg.isInstalled) {
                    Alert.alert(t('Instagram unavailable'), t('Install Instagram to share to Stories.'));
                    return { result: 'unavailable' };
                }
            }
            else {
                const canOpen = yield Linking.canOpenURL('instagram-stories://share');
                if (!canOpen) {
                    Alert.alert(t('Instagram unavailable'), t('Install Instagram to share to Stories.'));
                    return { result: 'unavailable' };
                }
            }
        }
        catch (_c) {
            Alert.alert(t('Instagram unavailable'), t('Could not verify Instagram installation.'));
            return { result: 'unavailable' };
        }
        return { result: 'shared', shareLib };
    });
}
export function shareMediaToInstagramStory(params) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    return __awaiter(this, void 0, void 0, function* () {
        const { t, composeInstagramStoryImage, localAssetUrl, isVideo, title, subtitle, composeImageUri, preferComposedBackground, shareModule, } = params;
        const availability = yield ensureInstagramStoryAvailable(t, shareModule);
        if (availability.result !== 'shared' || !availability.shareLib) {
            return availability.result;
        }
        if (isVideo && preferComposedBackground && String(composeImageUri !== null && composeImageUri !== void 0 ? composeImageUri : '').trim()) {
            const composedImageUri = yield composeInstagramStoryImage(composeImageUri, title, STORY_APP_NAME, subtitle, { layout: 'home_media_card' });
            yield ((_b = (_a = availability.shareLib).shareSingle) === null || _b === void 0 ? void 0 : _b.call(_a, {
                social: (_c = availability.shareLib.Social) === null || _c === void 0 ? void 0 : _c.INSTAGRAM_STORIES,
                appId: INSTAGRAM_APP_ID,
                backgroundImage: composedImageUri,
                backgroundTopColor: STORY_BACKGROUND_TOP_COLOR,
                backgroundBottomColor: STORY_BACKGROUND_BOTTOM_COLOR,
                attributionURL: STORY_ATTRIBUTION_URL,
                failOnCancel: false,
            }));
            return 'shared';
        }
        if (!isVideo && (String(title !== null && title !== void 0 ? title : '').trim() || String(subtitle !== null && subtitle !== void 0 ? subtitle : '').trim())) {
            const composedImageUri = yield composeInstagramStoryImage(composeImageUri || localAssetUrl, title, STORY_APP_NAME, subtitle, { layout: 'home_media_card' });
            yield ((_e = (_d = availability.shareLib).shareSingle) === null || _e === void 0 ? void 0 : _e.call(_d, {
                social: (_f = availability.shareLib.Social) === null || _f === void 0 ? void 0 : _f.INSTAGRAM_STORIES,
                appId: INSTAGRAM_APP_ID,
                backgroundImage: composedImageUri,
                backgroundTopColor: STORY_BACKGROUND_TOP_COLOR,
                backgroundBottomColor: STORY_BACKGROUND_BOTTOM_COLOR,
                attributionURL: STORY_ATTRIBUTION_URL,
                failOnCancel: false,
            }));
            return 'shared';
        }
        const stickerImage = yield composeInstagramStoryImage(null, isVideo ? title : null, STORY_APP_NAME, isVideo ? subtitle : null, isVideo && (String(title !== null && title !== void 0 ? title : '').trim() || String(subtitle !== null && subtitle !== void 0 ? subtitle : '').trim())
            ? { mode: 'overlay', layout: 'home_media_overlay_card' }
            : { mode: 'overlay' });
        yield ((_h = (_g = availability.shareLib).shareSingle) === null || _h === void 0 ? void 0 : _h.call(_g, {
            social: (_j = availability.shareLib.Social) === null || _j === void 0 ? void 0 : _j.INSTAGRAM_STORIES,
            appId: INSTAGRAM_APP_ID,
            backgroundImage: isVideo ? undefined : localAssetUrl,
            backgroundVideo: isVideo ? localAssetUrl : undefined,
            stickerImage,
            backgroundTopColor: STORY_BACKGROUND_TOP_COLOR,
            backgroundBottomColor: STORY_BACKGROUND_BOTTOM_COLOR,
            attributionURL: STORY_ATTRIBUTION_URL,
            failOnCancel: false,
        }));
        return 'shared';
    });
}
export function shareBlogToInstagramStory(params) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const { t, composeInstagramStoryImage, imageUri, title, subtitle, shareModule } = params;
        const availability = yield ensureInstagramStoryAvailable(t, shareModule);
        if (availability.result !== 'shared' || !availability.shareLib) {
            return availability.result;
        }
        const composedImageUri = yield composeInstagramStoryImage(imageUri, title, STORY_APP_NAME, subtitle, { layout: 'blog_card' });
        yield ((_b = (_a = availability.shareLib).shareSingle) === null || _b === void 0 ? void 0 : _b.call(_a, {
            social: (_c = availability.shareLib.Social) === null || _c === void 0 ? void 0 : _c.INSTAGRAM_STORIES,
            appId: INSTAGRAM_APP_ID,
            backgroundImage: composedImageUri,
            backgroundTopColor: STORY_BACKGROUND_TOP_COLOR,
            backgroundBottomColor: STORY_BACKGROUND_BOTTOM_COLOR,
            attributionURL: STORY_ATTRIBUTION_URL,
            failOnCancel: false,
        }));
        return 'shared';
    });
}
