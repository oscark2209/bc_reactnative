// src/screens/HomeScreen.tsx
import React from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { INSTRUMENTS_MOCK } from '../data/mockData';
import { ItemCard } from '../components/ItemCard';
import { Instrument } from '../types';

export const HomeScreen: React.FC = () => {
  const handleSelectInstrument = (instrument: Instrument) => {
    const studentInfo = instrument.assignedStudent
      ? `\nEstudiante Asignado: ${instrument.assignedStudent.name} (${instrument.assignedStudent.matricula})`
      : '\nEstudiante Asignado: Ninguno';

    Alert.alert(
      'Ficha Técnica del Instrumento',
      `Nombre: ${instrument.name}\n` +
        `Familia: ${instrument.family}\n` +
        `Nivel: ${instrument.level}\n` +
        `Estado: ${instrument.status}\n` +
        `Ubicación: ${instrument.roomLocation}\n` +
        `Profesor: ${instrument.responsibleTeacher.name} (${instrument.responsibleTeacher.department})` +
        studentInfo +
        `\n\n${instrument.description}`,
      [{ text: 'Entendido', style: 'default' }]
    );
  };

  // Cálculos estadísticos derivados para el header informativo
  const totalCount = INSTRUMENTS_MOCK.length;
  const availableCount = INSTRUMENTS_MOCK.filter((i) => i.status === 'Disponible').length;
  const inUseCount = INSTRUMENTS_MOCK.filter(
    (i) => i.status === 'En préstamo' || i.status === 'Asignado'
  ).length;

  return (
    <View style={styles.screenContainer}>
      {/* Header superior del dominio */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTag}>
          <Text style={styles.headerTagText}>CONSERVATORIO ACADÉMICO</Text>
        </View>
        <Text style={styles.headerTitle}>Escuela de Música</Text>
        <Text style={styles.headerSubtitle}>
          Inventario y asignación de instrumentos para cátedras
        </Text>

        {/* Barra de métricas rápidas (Flexbox) */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalCount}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValueAvailable}>{availableCount}</Text>
            <Text style={styles.statLabel}>Disponibles</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValueInUse}>{inUseCount}</Text>
            <Text style={styles.statLabel}>En Uso</Text>
          </View>
        </View>
      </View>

      {/* Lista de tarjetas con ScrollView */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Catálogo de Instrumentos</Text>
          <Text style={styles.sectionCounter}>{totalCount} registros</Text>
        </View>

        {INSTRUMENTS_MOCK.map((instrument) => (
          <ItemCard
            key={instrument.id}
            item={instrument}
            onPress={handleSelectInstrument}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  headerContainer: {
    paddingTop: 54,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
    gap: 8,
  },
  headerTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#3730A3',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
  },
  headerTagText: {
    color: '#C7D2FE',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F9FAFB',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  statValueAvailable: {
    fontSize: 18,
    fontWeight: '700',
    color: '#34D399',
  },
  statValueInUse: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FBBF24',
  },
  statLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#374151',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E5E7EB',
  },
  sectionCounter: {
    fontSize: 12,
    fontWeight: '600',
    color: '#818CF8',
  },
});