// src/components/AnimatedCard.tsx
import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleProp,
  ViewStyle,
  StyleSheet,
  GestureResponderEvent,
} from 'react-native';

export interface AnimatedCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
  minScale?: number;
}

/**
 * Componente contenedor de tarjeta con feedback táctil elástico (Semana 09).
 * Utiliza Animated.spring para comprimir la tarjeta a 0.95 al presionar
 * y rebotar suavemente a 1.0 al soltar, con useNativeDriver: true.
 */
export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  onPress,
  style,
  containerStyle,
  disabled = false,
  minScale = 0.95,
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = (event: GestureResponderEvent) => {
    if (disabled) return;
    Animated.spring(scaleValue, {
      toValue: minScale,
      useNativeDriver: true,
      friction: 7,
      tension: 120,
    }).start();
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    if (disabled) return;
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      friction: 7,
      tension: 120,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={containerStyle}
    >
      <Animated.View style={[styles.card, { transform: [{ scale: scaleValue }] }, style]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
  },
});
