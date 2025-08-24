import React from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import { useFinance } from '../../src/context/FinanceContext';

export default function DataScreen() {
  const { data, setData } = useFinance();

  const onNum = (key: keyof typeof data) => (txt: string) => {
    const v = Number(txt.replace(/[^0-9.-]/g, ''));
    if (!Number.isNaN(v)) setData({ ...data, [key]: v });
    else if (txt === '') setData({ ...data, [key]: 0 });
  };

  const currency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Your Financial Data</Text>

      <Field label="Current Savings" value={String(data.savings)} onChangeText={onNum('savings')} prefix="$" />
      <Field label="Monthly Income" value={String(data.monthlyIncome)} onChangeText={onNum('monthlyIncome')} prefix="$" />
      <Field label="Monthly Expenses" value={String(data.monthlyExpenses)} onChangeText={onNum('monthlyExpenses')} prefix="$" />
      <Field
        label="Expected Annual Growth (%)"
        value={String((data.annualGrowthRate * 100).toFixed(2))}
        onChangeText={(t) => {
          const v = Number(t.replace(/[^0-9.-]/g, ''));
          setData({ ...data, annualGrowthRate: Number.isNaN(v) ? 0 : v / 100 });
        }}
        suffix="%"
      />

      <View style={styles.noteBox}>
        <Text style={styles.noteText}>
          Tip: Projection assumes monthly contribution = income − expenses. Growth compounds per selected interval.
        </Text>
      </View>

      <View style={styles.summary}>
        <Text>Net Monthly: {currency(Math.max(0, data.monthlyIncome - data.monthlyExpenses))}</Text>
        <Text>Annual Growth: {(data.annualGrowthRate * 100).toFixed(2)}%</Text>
      </View>
    </ScrollView>
  );
}

function Field({ label, value, onChangeText, prefix, suffix }: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <View style={styles.fieldBox}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        {prefix ? <Text style={styles.affix}>{prefix}</Text> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
          style={styles.input}
          placeholder="0"
        />
        {suffix ? <Text style={styles.affix}>{suffix}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12, gap: 12 },
  title: { fontSize: 20, fontWeight: '600' },
  fieldBox: { gap: 8 },
  label: { fontSize: 12, color: '#6b7280' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  input: { flex: 1, fontSize: 16, paddingVertical: 6 },
  affix: { color: '#6b7280', fontSize: 14 },
  noteBox: { backgroundColor: '#f9fafb', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#f3f4f6' },
  noteText: { fontSize: 12, color: '#6b7280' },
  summary: { gap: 4, padding: 10, borderWidth: 1, borderColor: '#f3f4f6', borderRadius: 8, backgroundColor: '#fff' },
});

