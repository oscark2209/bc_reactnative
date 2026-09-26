// src/screens/HomeScreen.tsx
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ListRenderItem,
} from 'react-native';
import { INSTRUMENTS } from '../data/mockData';
import { Instrument } from '../types';
import { ItemCard } from '../components/ItemCard';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SIZES } from '../theme';

export const HomeScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Filtrado en tiempo real optimizado con useMemo
  const filteredInstruments = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      return INSTRUMENTS;
    }
    return INSTRUMENTS.filter(
      (instrument) =>
        instrument.name.toLowerCase().includes(query) ||
        instrument.category.toLowerCase().includes(query) ||
        instrument.level.toLowerCase().includes(query) ||
        instrument.roomLocation.toLowerCase().includes(query) ||
        instrument.responsibleTeacher.name.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // 2. keyExtractor estrictamente basado en el id único (NUNCA el índice del array)
  const keyExtractor = useCallback((item: Instrument) => item.id, []);

  // 3. renderItem memorizado con useCallback
  const renderItem: ListRenderItem<Instrument> = useCallback(
    ({ item }) => <ItemCard item={item} />,
    []
  );

  // 4. Separador visual entre tarjetas memorizado con useCallback
  const ItemSeparator = useCallback(
    () => <View style={styles.separator} />,
    []
  );

  // 5. Componente de estado vacío memorizado con useCallback
  const ListEmptyComponent = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🔍</Text>
        <Text style={styles.emptyTitle}>Sin resultados encontrados</Text>
        <Text style={styles.emptySubtitle}>
          No se encontraron instrumentos que coincidan con "{searchQuery}". Intenta con otro término o categoría.
        </Text>
      </View>
    ),
    [searchQuery]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Encabezado del Dominio */}
        <View style={styles.header}>
          <View style={styles.headerTag}>
            <Text style={styles.headerTagText}>CONSERVATORIO ACADÉMICO</Text>
          </View>
          <Text style={styles.headerTitle}>Escuela de Música</Text>
          <Text style={styles.headerSubtitle}>
            Catálogo de inventario con búsqueda en tiempo real
          </Text>
        </View>

        {/* Input de Búsqueda */}
        <View style={styles.searchSection}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre, categoría, profesor o aula..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
            autoCorrect={false}
          />
          <View style={styles.resultsCounterRow}>
            <Text style={styles.resultsCounterText}>
              {filteredInstruments.length} de {INSTRUMENTS.length} instrumentos
            </Text>
          </View>
        </View>

        {/* FlatList optimizada */}
        <FlatList
          data={filteredInstruments}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ItemSeparatorComponent={ItemSeparator}
          ListEmptyComponent={ListEmptyComponent}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    paddingTop: SIZES.headerPaddingTop,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surfaceElevated,
    borderBottomWidth: SIZES.borderThin,
    borderBottomColor: COLORS.borderLight,
    gap: SPACING.xs,
  },
  headerTag: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.badgeCategoryBg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.xs,
  },
  headerTagText: {
    ...TYPOGRAPHY.headerTag,
  },
  headerTitle: {
    ...TYPOGRAPHY.headerTitle,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.headerSubtitle,
  },
  searchSection: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
    backgroundColor: COLORS.background,
  },
  searchInput: {
    backgroundColor: COLORS.surface,
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.md,
    height: SIZES.searchInputHeight,
    borderRadius: RADIUS.md,
    borderWidth: SIZES.borderThin,
    borderColor: COLORS.border,
    fontSize: TYPOGRAPHY.body.fontSize,
  },
  resultsCounterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: SPACING.xs,
  },
  resultsCounterText: {
    ...TYPOGRAPHY.searchCounter,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.xs,
  },
  separator: {
    height: SIZES.separatorHeight,
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: SPACING.xs,
  },
  emptyTitle: {
    ...TYPOGRAPHY.emptyTitle,
  },
  emptySubtitle: {
    ...TYPOGRAPHY.emptySubtitle,
    textAlign: 'center',
  },
});
