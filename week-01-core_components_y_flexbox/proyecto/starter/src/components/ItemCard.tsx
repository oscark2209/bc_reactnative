// src/components/ItemCard.tsx
import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Instrument } from '../types';

interface ItemCardProps {
  item: Instrument;
  onPress: (instrument: Instrument) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onPress }) => {
  const getStatusBadgeStyle = (status: Instrument['status']) => {
    switch (status) {
      case 'Disponible':
        return styles.statusBadgeDisponible;
      case 'En préstamo':
        return styles.statusBadgeEnPrestamo;
      case 'Asignado':
        return styles.statusBadgeAsignado;
      case 'En mantenimiento':
        return styles.statusBadgeEnMantenimiento;
    }
  };

  const getStatusTextStyle = (status: Instrument['status']) => {
    switch (status) {
      case 'Disponible':
        return styles.statusTextDisponible;
      case 'En préstamo':
        return styles.statusTextEnPrestamo;
      case 'Asignado':
        return styles.statusTextAsignado;
      case 'En mantenimiento':
        return styles.statusTextEnMantenimiento;
    }
  };

  return (
    <View style={styles.cardContainer}>
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.cardImage}
        resizeMode="cover"
      />

      <View style={styles.cardBody}>
        {/* Fila de insignias informativas */}
        <View style={styles.badgesRow}>
          <View style={styles.familyBadge}>
            <Text style={styles.familyBadgeText}>{item.family}</Text>
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

        {/* Nombre del instrumento y descripción con estilos diferenciados */}
        <Text style={styles.instrumentName}>{item.name}</Text>
        <Text style={styles.instrumentDescription}>{item.description}</Text>

        {/* Metadatos institucionales (Flexbox) */}
        <View style={styles.metadataContainer}>
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
              <Text style={styles.metaValueHighlight}>
                {item.assignedStudent.name} ({item.assignedStudent.matricula})
              </Text>
            </View>
          )}
        </View>

        {/* Botón de acción interactivo con feedback visual en Pressable */}
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.actionButtonPressed,
          ]}
          onPress={() => onPress(item)}
        >
          <Text style={styles.actionButtonText}>Consultar Ficha Técnica</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 190,
    backgroundColor: '#0F172A',
  },
  cardBody: {
    padding: 16,
    flexDirection: 'column',
    gap: 10,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  familyBadge: {
    backgroundColor: '#312E81',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  familyBadgeText: {
    color: '#A5B4FC',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  levelBadge: {
    backgroundColor: '#1E1B4B',
    borderWidth: 1,
    borderColor: '#4338CA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  levelBadgeText: {
    color: '#C7D2FE',
    fontSize: 11,
    fontWeight: '600',
  },
  statusBadgeBase: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeDisponible: {
    backgroundColor: '#064E3B',
  },
  statusBadgeEnPrestamo: {
    backgroundColor: '#78350F',
  },
  statusBadgeAsignado: {
    backgroundColor: '#581C87',
  },
  statusBadgeEnMantenimiento: {
    backgroundColor: '#7F1D1D',
  },
  statusTextBase: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextDisponible: {
    color: '#34D399',
  },
  statusTextEnPrestamo: {
    color: '#FBBF24',
  },
  statusTextAsignado: {
    color: '#C084FC',
  },
  statusTextEnMantenimiento: {
    color: '#F87171',
  },
  instrumentName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: 0.3,
  },
  instrumentDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: '#94A3B8',
  },
  metadataContainer: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  metaLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 12,
    color: '#E2E8F0',
    fontWeight: '500',
    flexShrink: 1,
    textAlign: 'right',
  },
  metaValueHighlight: {
    fontSize: 12,
    color: '#38BDF8',
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  actionButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  actionButtonPressed: {
    backgroundColor: '#3730A3',
    opacity: 0.85,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});