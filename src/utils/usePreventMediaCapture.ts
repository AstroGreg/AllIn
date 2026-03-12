import {useFocusEffect} from '@react-navigation/native';
import {useCallback} from 'react';
import {CaptureProtection} from 'react-native-capture-protection';

export function usePreventMediaCapture(enabled = true) {
  useFocusEffect(
    useCallback(() => {
      if (!enabled) return () => {};

      let active = true;
      void CaptureProtection.prevent({
        screenshot: true,
        record: true,
        appSwitcher: true,
      }).catch(() => {});

      return () => {
        if (!active) return;
        active = false;
        void CaptureProtection.allow().catch(() => {});
      };
    }, [enabled]),
  );
}
