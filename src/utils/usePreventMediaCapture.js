import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { allowMediaCapture, preventMediaCapture } from './nativeCaptureProtection';
export function usePreventMediaCapture(enabled = true) {
    useFocusEffect(useCallback(() => {
        if (!enabled)
            return () => { };
        let active = true;
        void preventMediaCapture({
            screenshot: true,
            record: true,
            appSwitcher: true,
        }).catch(() => { });
        return () => {
            if (!active)
                return;
            active = false;
            void allowMediaCapture().catch(() => { });
        };
    }, [enabled]));
}
