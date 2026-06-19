import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { nebulaGold } from '../../theme/nebulaGold';

interface FormFieldProps extends TextInputProps {
  label: string;
  suffix?: string;
  containerStyle?: any;
  light?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  suffix,
  value,
  onChangeText,
  placeholder,
  containerStyle,
  light = true,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.label, light && styles.labelLight]}>{label}</Text>
      <View style={[
        styles.inputWrapper, 
        light && styles.inputWrapperLight,
        nebulaGold.colors.shadow.light
      ]}>
        <TextInput
          style={[styles.input, light && styles.inputLight]}
          placeholder={placeholder}
          placeholderTextColor={light ? "#8E8E93" : "#5A5750"}
          value={value}
          onChangeText={onChangeText}
          {...props}
        />
        {suffix && (
          <Text style={[styles.suffix, light && styles.suffixLight]}>{suffix}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9E9A8E',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelLight: {
    color: '#8E8E93',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181F',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  inputWrapperLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EBEBF0',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#F0EBE0',
    height: '100%',
    fontWeight: '500',
  },
  inputLight: {
    color: '#000000',
  },
  suffix: {
    fontSize: 14,
    color: '#5A5750',
    marginLeft: 8,
  },
  suffixLight: {
    color: '#8E8E93',
    fontWeight: '600',
  },
});
