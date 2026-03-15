import { jsx as _jsx } from "react/jsx-runtime";
import { View, StyleSheet } from 'react-native';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
const ShimmerEffect = ({ width, height, borderRadius = 8 }) => {
    return (_jsx(View, Object.assign({ style: [styles.container, { width, height }] }, { children: _jsx(ShimmerPlaceholder, { LinearGradient: LinearGradient, style: [styles.shimmer, { borderRadius }], shimmerColors: [
                '#EBEBEB',
                '#FFFFFF',
                '#EBEBEB'
            ], shimmerStyle: {
                width: '100%',
                height: '100%',
            }, duration: 1500, shimmerWidthPercent: 1 }) })));
};
const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
    },
    shimmer: {
        width: '100%',
        height: '100%',
    }
});
export default ShimmerEffect;
