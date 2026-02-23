import React, { forwardRef } from 'react';
import { StyleProp, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { createStyles } from './UnifiedSearchInputStyles';

interface UnifiedSearchInputProps extends Omit<TextInputProps, 'style'> {
  left?: React.ReactNode;
  right?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: TextInputProps['style'];
  contentStyle?: StyleProp<ViewStyle>;
}

const UnifiedSearchInput = forwardRef<TextInput, UnifiedSearchInputProps>(
  ({ left, right, containerStyle, contentStyle, inputStyle, placeholderTextColor, ...rest }, ref) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    return (
      <View style={[styles.container, containerStyle]}>
        <View style={[styles.content, contentStyle]}>
          {left}
          <TextInput
            ref={ref}
            style={[styles.input, inputStyle]}
            placeholderTextColor={placeholderTextColor ?? colors.subTextColor}
            autoCorrect={false}
            autoCapitalize="none"
            {...rest}
          />
        </View>
        {right}
      </View>
    );
  },
);

UnifiedSearchInput.displayName = 'UnifiedSearchInput';

export default UnifiedSearchInput;

