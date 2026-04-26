import React, { useEffect, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { defaultState, loadState, saveState } from '@/utils/storage';
import { CURVE_PRESETS, generatePlan, PlannerState } from '@/utils/plannerLogic';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [state, setState] = useState<PlannerState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadState().then(s => {
      setState(s);
      setLoading(false);
    });
  }, []);

  const updateState = (updates: Partial<PlannerState>) => {
    if (!state) return;
    const newState = { ...state, ...updates };
    setState(newState);
    saveState(newState);
  };

  const confirm = (message: string) =>
    Platform.OS === 'web' ? window.confirm(message) : true;

  const handleGenerate = () => {
    if (!state) return;
    const doGenerate = () => {
      const newState = generatePlan(state);
      setState(newState);
      saveState(newState);
    };
    if (Platform.OS === 'web') {
      if (confirm("This will overwrite your current schedule. Continue?")) doGenerate();
    } else {
      Alert.alert("Generate Plan", "This will overwrite your current schedule. Continued?", [
        { text: "Cancel", style: "cancel" },
        { text: "Generate", onPress: doGenerate },
      ]);
    }
  };

  const handleClear = () => {
    if (!state) return;
    const doClear = () => {
      const newState = { ...state, items: [], placeholders: {} };
      setState(newState);
      saveState(newState);
    };
    if (Platform.OS === 'web') {
      if (confirm("Clear plan? Are you sure?")) doClear();
    } else {
      Alert.alert("Clear Plan", "Are you sure?", [
        { text: "Cancel", style: "cancel" },
        { text: "Clear", style: 'destructive', onPress: doClear },
      ]);
    }
  };

  if (loading || !state) {
    return <View style={styles.center}><ActivityIndicator /></View>;
  }

  const activePreset = CURVE_PRESETS[state.curveMode] || CURVE_PRESETS.long90;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Plan Settings</Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.panel, borderColor: theme.border }]}>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Start Date (YYYY-MM-DD)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.panel2, color: theme.text, borderColor: theme.border }]}
              value={state.startDate}
              onChangeText={t => updateState({ startDate: t })}
              placeholder="2025-01-01"
              placeholderTextColor={theme.icon}
            />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Total Problems</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.panel2, color: theme.text, borderColor: theme.border }]}
              value={String(state.totalCount)}
              keyboardType="numeric"
              onChangeText={t => updateState({ totalCount: parseInt(t) || 0 })}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Daily Count</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.panel2, color: theme.text, borderColor: theme.border }]}
              value={String(state.perDay)}
              keyboardType="numeric"
              onChangeText={t => updateState({ perDay: parseInt(t) || 0 })}
            />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Prefix</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.panel2, color: theme.text, borderColor: theme.border }]}
              value={state.prefix}
              onChangeText={t => updateState({ prefix: t })}
            />
          </View>
        </View>

        <Text style={[styles.label, { marginTop: 12 }]}>Memory Curve Mode</Text>
        <View style={styles.modeContainer}>
          {Object.keys(CURVE_PRESETS).map(key => {
            const isActive = state.curveMode === key;
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.modeBtn,
                  { borderColor: isActive ? theme.tint : theme.border, backgroundColor: isActive ? theme.studyBg : theme.panel }
                ]}
                onPress={() => {
                  const preset = CURVE_PRESETS[key];
                  const updates: any = { curveMode: key };
                  if (key !== 'custom') {
                    updates.intervals = preset.intervals;
                  }
                  updateState(updates);
                }}
              >
                <Text style={[styles.modeText, { color: isActive ? theme.tint : theme.muted }]}>
                  {CURVE_PRESETS[key].label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={[styles.hint, { color: theme.muted }]}>{activePreset.hint}</Text>

        {state.curveMode === 'custom' && (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.label}>Custom Intervals (comma sep)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.panel2, color: theme.text, borderColor: theme.border }]}
              value={state.intervals.join(", ")}
              onChangeText={(t) => {
                const ints = t.split(",").map(x => parseInt(x.trim())).filter(x => !isNaN(x));
                updateState({ intervals: ints });
              }}
            />
          </View>
        )}

        <View style={styles.btnRow}>
          <TouchableOpacity style={[styles.btn, { backgroundColor: theme.tint }]} onPress={handleGenerate}>
            <Text style={styles.btnText}>Generate Plan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, { backgroundColor: 'transparent', borderColor: theme.border, borderWidth: 1 }]} onPress={handleClear}>
            <Text style={[styles.btnText, { color: theme.text }]}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      {state.items.length > 0 && (
        <View style={[styles.card, { backgroundColor: theme.panel, borderColor: theme.border, marginTop: 16, marginBottom: 40 }]}>
          <Text style={[styles.title, { fontSize: 16, marginBottom: 10 }]}>Stats</Text>
          <View style={styles.statsRow}>
            <View style={[styles.pill, { backgroundColor: theme.panel2 }]}>
              <Text style={[styles.pillText, { color: theme.text }]}>Total: {state.items.length}</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: theme.studyBg }]}>
              <Text style={[styles.pillText, { color: theme.studyText }]}>Study: {state.items.filter(i => i.type === 'study').length}</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: theme.reviewBg }]}>
              <Text style={[styles.pillText, { color: theme.reviewText }]}>Review: {state.items.filter(i => i.type === 'review').length}</Text>
            </View>
          </View>
        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginTop: 40, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  card: { padding: 16, borderRadius: 12, borderWidth: 1 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  col: { flex: 1 },
  label: { fontSize: 12, marginBottom: 4, fontWeight: '600', opacity: 0.6 },
  input: {
    height: 40, borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, fontSize: 14
  },
  modeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  modeBtn: { borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1 },
  modeText: { fontSize: 12, fontWeight: '600' },
  hint: { fontSize: 11, marginTop: 6, fontStyle: 'italic' },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  btn: { flex: 1, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  pillText: { fontSize: 12, fontWeight: '600' }
});
