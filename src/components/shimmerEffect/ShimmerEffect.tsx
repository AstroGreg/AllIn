import React from 'react';
import { View, StyleSheet } from 'react-native';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

interface ShimmerProps {
    width: any;
    height: any;
    borderRadius?: number;
}

const ShimmerEffect = ({ width, height, borderRadius = 8 }: ShimmerProps) => {
    return (
        <View style={[styles.container, { width, height }]}>
            <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                style={[styles.shimmer, { borderRadius }]}
                shimmerColors={[
                    '#EBEBEB',
                    '#FFFFFF',
                    '#EBEBEB'
                ]}
                shimmerStyle={{
                    width: '100%',
                    height: '100%',
                }}
                duration={1500}
                shimmerWidthPercent={1}
            />
        </View>
    );
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