import { StyleSheet, Dimensions } from 'react-native';
import { ThemeColors } from '../../context/ThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#000000',
        },
        header: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 16,
            zIndex: 10,
        },
        closeButton: {
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
        },
        counterBadge: {
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 8,
        },
        counterText: {
            color: '#FFFFFF',
            fontSize: 14,
            fontWeight: '600',
        },
        titleContainer: {
            position: 'absolute',
            left: 16,
            right: 16,
            zIndex: 10,
        },
        title: {
            color: '#FFFFFF',
            fontSize: 18,
            fontWeight: '600',
            textAlign: 'center',
        },
        imageContainer: {
            width: screenWidth,
            height: screenHeight,
            justifyContent: 'center',
            alignItems: 'center',
        },
        fullImage: {
            width: screenWidth,
            height: screenHeight * 0.8,
        },
        paginationDotsContainer: {
            position: 'absolute',
            left: 0,
            right: 0,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
        },
        paginationDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
        },
        paginationDotActive: {
            backgroundColor: '#FFFFFF',
            width: 24,
        },
    });
