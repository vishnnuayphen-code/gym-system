import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { nebulaGold } from '../../theme/nebulaGold';

interface OnboardingInputProps extends TextInputProps {
  label: string;
  error?: string;
  suffix?: string;
}

export const OnboardingInput = ({ 
  label, 
  error, 
  suffix, 
  style, 
  onFocus, 
  onBlur, 
  ...props 
}: OnboardingInputProps) => {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <View 
        style={[
          styles.inputWrapper,
          isFocused && styles.inputFocused,
          error && styles.inputError
        ]}
      >
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={nebulaGold.colors.text.secondary + '80'}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
        {suffix && (
          <Text style={styles.suffix}>{suffix}</Text>
        )}
      </View>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    ...nebulaGold.typography.label,
    color: nebulaGold.colors.text.secondary,
    marginBottom: 8,
  },
  inputWrapper: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: nebulaGold.colors.background.tertiary,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: nebulaGold.borderRadius.md,
    paddingHorizontal: 16,
  },
  inputFocused: {
    borderColor: nebulaGold.colors.gold.primary,
  },
  inputError: {
    borderColor: nebulaGold.colors.status.danger,
  },
  input: {
    flex: 1,
    ...nebulaGold.typography.body,
    color: nebulaGold.colors.text.primary,
    height: '100%',
  },
  suffix: {
    ...nebulaGold.typography.caption,
    color: nebulaGold.colors.text.secondary,
    marginLeft: 8,
  },
  errorText: {
    ...nebulaGold.typography.caption,
    color: nebulaGold.colors.status.danger,
    marginTop: 4,
  },
});
