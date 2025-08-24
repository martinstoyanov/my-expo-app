import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, useWindowDimensions, ScrollView } from 'react-native';
import { useFinance } from '../../src/context/FinanceContext';
import { buildProjection } from '../../src/utils/projection';
import LineChart from '../../src/components/LineChart';

type Mode = 'daily' | 'monthly' | 'yearly';

export default function ProjectionScreen() {
  const { data } = useFinance();
  const [mode, setMode] = useState<Mode>('monthly');
  const { width } = useWindowDimensions();

  const { points, labels } = useMemo(() => buildProjection(data, mode), [data, mode]);
  const listProjection = useMemo(() => buildProjection(data, mode), [data, mode]);

  const chartWidth = Math.min(width - 24, 800);
  const chartHeight = 220;

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  const last = points[points.length - 1] ?? 0;
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const items = useMemo(
    () => listProjection.points.slice(1).map((v, idx) => ({ label: listProjection.labels[idx + 1], value: v })),
    [listProjection]
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Net Worth Projection</Text>
      <View style={styles.modeRow}>
        {(['daily', 'monthly', 'yearly'] as Mode[]).map((m) => (
          <Pressable key={m} onPress={() => setMode(m)} style={[styles.modeBtn, mode === m && styles.modeBtnActive]}>
            <Text style={[styles.modeText, mode === m && styles.modeTextActive]}>
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.chartBox}>
        <LineChart
          data={points}
          width={chartWidth}
          height={chartHeight}
          stroke="#3b82f6"
          fill="rgba(59,130,246,0.15)"
          onFocusChange={(i) => setFocusIndex(i)}
          getTooltipText={(i, v) => `${labels[i]} · ${fmt(v)}`}
        />
        <Text style={styles.focusHint}>
          {focusIndex != null ? `${labels[focusIndex]} · ${fmt(points[focusIndex] ?? 0)}` : `End · ${fmt(last)}`}
        </Text>
      </View>

      <View style={styles.summaryRow}>
        <Summary label="Now" value={fmt(points[0] ?? 0)} />
        <Summary label="End" value={fmt(last)} />
        <Summary label="Monthly Net" value={fmt(Math.max(0, data.monthlyIncome - data.monthlyExpenses))} />
        <Summary label="Growth" value={`${(data.annualGrowthRate * 100).toFixed(1)}%`} />
      </View>

      <Text style={styles.axisHint}>{labels[0]} → {labels[labels.length - 1]}</Text>

      <Text style={styles.breakdownTitle}>
        {mode === 'daily' ? 'Daily' : mode === 'monthly' ? 'Monthly' : 'Yearly'} Breakdown
      </Text>
      <View style={styles.listContainer}>
        {items.map((item, idx) => (
          <View key={idx} style={styles.listRow}>
            <Text style={styles.listLabel}>{item.label}</Text>
            <Text style={styles.listValue}>{fmt(item.value)}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryBox}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  modeBtnActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#c7d2fe',
  },
  modeText: { color: '#111827' },
  modeTextActive: { color: '#1d4ed8', fontWeight: '600' },
  chartBox: {
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 12,
    padding: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  focusHint: { marginTop: 6, color: '#111827', fontSize: 12 },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryBox: {
    flexGrow: 1,
    minWidth: '45%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  summaryValue: { fontSize: 16, fontWeight: '600' },
  axisHint: { color: '#6b7280', fontSize: 12 },
  breakdownTitle: { fontSize: 16, fontWeight: '600', marginTop: 4 },
  listContainer: {
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  listLabel: { color: '#6b7280' },
  listValue: { fontWeight: '600' },
  toggleBtn: {},
  toggleBtnText: {},
});
