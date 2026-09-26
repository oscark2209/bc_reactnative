// src/components/ItemCard.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Instrument } from '../types';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SIZES } from '../theme';

interface ItemCardProps {
  item: Instrument;
  onPress?: (item: Instrument) => void;
  isSaved?: boolean;
  onToggleSave?: (item: Instrument) => void;
}

export const ItemCard: React.FC<ItemCardProps> = React.memo(
  ({ item, onPress, isSaved = false, onToggleSave }) => {
    const getStatusBadgeStyle = (status: Instrument['status']) => {
      switch (status) {
        case 'Disponible':
          return styles.statusBadgeAvailable;
        case 'En préstamo':
          return styles.statusBadgeLoan;
        case 'Asignado':
          return styles.statusBadgeAssigned;
        case 'En mantenimiento':
          return styles.statusBadgeMaintenance;
      }
    };

    const getStatusTextStyle = (status: Instrument['status']) => {
      switch (status) {
        case 'Disponible':
          return styles.statusTextAvailable;
        case 'En préstamo':
          return styles.statusTextLoan;
        case 'Asignado':
          return styles.statusTextAssigned;
        case 'En mantenimiento':
          return styles.statusTextMaintenance;
      }
    };

    const handleCardPress = () => {
      if (onPress) {
        onPress(item);
      }
    };

    const handleSavePress = () => {
      if (onToggleSave) {
        onToggleSave(item);
      }
    };

    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={handleCardPress}
        disabled={!onPress}
        style={styles.card}
      >
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />

          {/* Botón rápido de Guardar / Favoritos sobre la imagen */}
          {onToggleSave && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleSavePress}
              style={[styles.saveIconButton, isSaved && styles.saveIconButtonActive]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={18}
                color={isSaved ? COLORS.textInverse : COLORS.textPrimary}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.cardContent}>
          {/* Fila de etiquetas de categoría, nivel y estado */}
          <View style={styles.badgesRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.category}</Text>
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>{item.level}</Text>
            </View>
            <View style={[styles.statusBadgeBase, getStatusBadgeStyle(item.status)]}>
              <Text style={[styles.statusTextBase, getStatusTextStyle(item.status)]}>
                {item.status}
              </Text>
            </View>
          </View>

          {/* Nombre y descripción */}
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>

          {/* Metadatos estructurados */}
          <View style={styles.metaContainer}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Profesor a cargo:</Text>
              <Text style={styles.metaValue}>{item.responsibleTeacher.name}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Ubicación:</Text>
              <Text style={styles.metaValue}>{item.roomLocation}</Text>
            </View>
            {item.assignedStudent && (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Estudiante:</Text>
                <Text style={styles.metaStudentValue}>
                  {item.assignedStudent.name} ({item.assignedStudent.matricula})
                </Text>
              </View>
            )}
          </View>

          {/* Footer con precio e indicador de tap para detalle */}
          <View style={styles.cardFooter}>
            <Text style={styles.priceLabel}>
              ${item.priceCOP.toLocaleString('es-CO')}{' '}
              <Text style={styles.currencyLabel}>COP</Text>
            </Text>

            <View style={styles.footerActions}>
              {onToggleSave && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleSavePress}
                  style={[styles.saveBadgeButton, isSaved && styles.saveBadgeButtonActive]}
                >
                  <Ionicons
                    name={isSaved ? 'bookmark' : 'bookmark-outline'}
                    size={13}
                    color={isSaved ? COLORS.textInverse : COLORS.primaryLight}
                  />
                  <Text
                    style={[styles.saveBadgeText, isSaved && styles.saveBadgeTextActive]}
                  >
                    {isSaved ? 'Guardado' : 'Guardar'}
                  </Text>
                </TouchableOpacity>
              )}

              {onPress && (
                <View style={styles.actionPrompt}>
                  <Text style={styles.actionPromptText}>Ver ficha</Text>
                  <Text style={styles.actionPromptArrow}>→</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: SIZES.borderThin,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: SIZES.cardImageHeight,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.surfaceElevated,
  },
  saveIconButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: RADIUS.full,
    padding: SPACING.xs + 2,
    borderWidth: SIZES.borderThin,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  saveIconButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryLight,
  },
  cardContent: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: COLORS.badgeCategoryBg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  categoryBadgeText: {
    ...TYPOGRAPHY.badge,
    color: COLORS.badgeCategoryText,
    textTransform: 'uppercase',
  },
  levelBadge: {
    backgroundColor: COLORS.badgeLevelBg,
    borderWidth: SIZES.borderThin,
    borderColor: COLORS.badgeLevelBorder,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  levelBadgeText: {
    ...TYPOGRAPHY.badge,
    color: COLORS.badgeLevelText,
  },
  statusBadgeBase: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  statusBadgeAvailable: {
    backgroundColor: COLORS.availableBg,
  },
  statusBadgeLoan: {
    backgroundColor: COLORS.loanBg,
  },
  statusBadgeAssigned: {
    backgroundColor: COLORS.assignedBg,
  },
  statusBadgeMaintenance: {
    backgroundColor: COLORS.maintenanceBg,
  },
  statusTextBase: {
    ...TYPOGRAPHY.badge,
  },
  statusTextAvailable: {
    color: COLORS.availableText,
  },
  statusTextLoan: {
    color: COLORS.loanText,
  },
  statusTextAssigned: {
    color: COLORS.assignedText,
  },
  statusTextMaintenance: {
    color: COLORS.maintenanceText,
  },
  title: {
    ...TYPOGRAPHY.title,
  },
  description: {
    ...TYPOGRAPHY.body,
  },
  metaContainer: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    gap: SPACING.xs,
    borderWidth: SIZES.borderThin,
    borderColor: COLORS.borderLight,
    marginTop: SPACING.xs,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  metaLabel: {
    ...TYPOGRAPHY.metaLabel,
  },
  metaValue: {
    ...TYPOGRAPHY.metaValue,
    flexShrink: 1,
    textAlign: 'right',
  },
  metaStudentValue: {
    ...TYPOGRAPHY.metaStudent,
    flexShrink: 1,
    textAlign: 'right',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.xs,
    borderTopWidth: SIZES.borderThin,
    borderTopColor: COLORS.borderLight,
    marginTop: SPACING.xs,
  },
  priceLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
  currencyLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  saveBadgeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.badgeCategoryBg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.xs,
    borderWidth: SIZES.borderThin,
    borderColor: COLORS.border,
  },
  saveBadgeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryLight,
  },
  saveBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
  saveBadgeTextActive: {
    color: COLORS.textInverse,
  },
  actionPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionPromptText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryLight,
  },
  actionPromptArrow: {
    fontSize: 14,
    color: COLORS.primaryLight,
  },
});
