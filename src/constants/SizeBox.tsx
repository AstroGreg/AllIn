import React from 'react';
import { View } from 'react-native';

interface SizeBoxProps {
    height?: number;
    width?: number;
    flex?: number | undefined;
}

const SizeBox: React.FC<SizeBoxProps> = ({ height, width, flex }) => {
    return <View style={{ height, width, flex }} />;
};

export default SizeBox;
