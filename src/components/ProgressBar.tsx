// src/components/ProgressBar.tsx
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../theme';

export interface ProgressBarProps {
  progress: number; // 0 a 100
  label?: string;
  subtitle?: string;
  showPercentage?: boolean;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Barra de progreso animada con interpolación continua de ancho y color (Semana 09).
 * - Interpolación de ancho: 0% → 100%
 * - Interpolación de color: '#ef4444' (rojo) → '#facc15' (amarillo) → '#22c55e' (verde)
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  subtitle,
  showPercentage = true,
  height = 10,
  style,
}) => {
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const clampedProgress = Math.min(100, Math.max(0, progress));

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: clampedProgress,
      duration: 800,
      useNativeDriver: false, // Animaciones de 'width' y 'backgroundColor' requieren false
    }).start();
  }, [clampedProgress, animatedProgress]);

  // Interpolación de Ancho: '0%' -> '100%'
  const widthInterpolation = animatedProgress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  // Interpolación de Color Semántico: Rojo (#ef4444) -> Amarillo (#facc15) -> Verde (#22c55e)
  const colorInterpolation = animatedProgress.interpolate({
    inputRange: [0, 50, 100],
    outputRange: ['#ef4444', '#facc15', '#22c55e'],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, style]}>
      {(label || showPercentage) && (
        <View style={styles.labelRow}>
          {label && <Text style={styles.labelText}>{label}</Text>}
          {showPercentage && (
            <Text style={styles.percentageText}>{Math.round(clampedProgress)}%</Text>
          )}
        </View>
      )}

      {/* Contenedor de la barra de fondo */}
      <View style={[styles.track, { height, borderRadius: height / 2 }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: widthInterpolation,
              backgroundColor: colorInterpolation,
              height,
              borderRadius: height / 2,
            },
          ]}
        />
      </View>

      {subtitle && <Text style={styles.subtitleText}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: SPACING.xs,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primaryLight,
  },
  track: {
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  fill: {
    height: '100%',
  },
  subtitleText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
