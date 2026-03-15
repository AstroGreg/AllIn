import { jsx as _jsx } from "react/jsx-runtime";
import { View } from 'react-native';
const SizeBox = ({ height, width, flex }) => {
    return _jsx(View, { style: { height, width, flex } });
};
export default SizeBox;
