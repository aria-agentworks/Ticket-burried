import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useCases } from "@/context/CasesContext";
import { VIOLATION_TYPES } from "@/constants/violations";

function SettingRow({
  icon,
  label,
  value,
  onPress,
  danger,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.settingRow, { borderBottomColor: colors.border }]}
    >
      <View style={[styles.settingIcon, { backgroundColor: danger ? colors.destructive + "15" : colors.muted }]}>
        <Feather name={icon as any} size={16} color={danger ? colors.destructive : colors.accent} />
      </View>
      <Text
        style={[
          styles.settingLabel,
          { color: danger ? colors.destructive : colors.foreground, fontFamily: "Inter_500Medium" },
        ]}
      >
        {label}
      </Text>
      <View style={styles.settingRight}>
        {value && (
          <Text style={[styles.settingValue, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {value}
          </Text>
        )}
        {onPress && <Feather name="chevron-right" size={16} color={colors.mutedForeground} />}
      </View>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { cases, totalRecovered, casesWon, casesLost } = useCases();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : 0;

  const winRate =
    casesWon + casesLost > 0
      ? Math.round((casesWon / (casesWon + casesLost)) * 100)
      : 0;

  const byType = Object.entries(VIOLATION_TYPES).map(([key, v]) => ({
    key,
    label: v.label,
    color: v.color,
    count: cases.filter((c) => c.violationType === key).length,
    icon: v.iconName,
  })).filter(t => t.count > 0);

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.scroll,
        { paddingTop: topInset + 16, paddingBottom: bottomInset + 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
        Settings
      </Text>

      {/* Stats Card */}
      <View style={[styles.statsCard, { backgroundColor: colors.primary }]}>
        <Text style={[styles.statsCardTitle, { fontFamily: "Inter_700Bold" }]}>Your Results</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { fontFamily: "Inter_700Bold" }]}>${totalRecovered.toFixed(0)}</Text>
            <Text style={[styles.statLbl, { fontFamily: "Inter_400Regular" }]}>Recovered</Text>
          </View>
          <View style={[styles.statDivider]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { fontFamily: "Inter_700Bold" }]}>{casesWon}</Text>
            <Text style={[styles.statLbl, { fontFamily: "Inter_400Regular" }]}>Won</Text>
          </View>
          <View style={[styles.statDivider]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { fontFamily: "Inter_700Bold" }]}>{winRate}%</Text>
            <Text style={[styles.statLbl, { fontFamily: "Inter_400Regular" }]}>Win Rate</Text>
          </View>
        </View>
      </View>

      {/* Case Breakdown */}
      {byType.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Cases by Type
          </Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {byType.map((t, i) => (
              <View
                key={t.key}
                style={[
                  styles.typeRow,
                  i < byType.length - 1 ? { borderBottomColor: colors.border, borderBottomWidth: 1 } : {},
                ]}
              >
                <View style={[styles.typeIcon, { backgroundColor: t.color + "20" }]}>
                  <Feather name={t.icon as any} size={14} color={t.color} />
                </View>
                <Text style={[styles.typeName, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                  {t.label}
                </Text>
                <Text style={[styles.typeCount, { color: colors.mutedForeground, fontFamily: "Inter_700Bold" }]}>
                  {t.count}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* About */}
      <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
        About
      </Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SettingRow icon="shield" label="How it Works" onPress={() =>
          Alert.alert(
            "How TicketBuried Works",
            "1. Submit your violation with details and photos.\n\n2. Our AI analyses your case and generates a defence strategy with a success probability.\n\n3. Review your personalised appeal letter.\n\n4. Submit the appeal yourself using the instructions we provide.\n\n5. Report your outcome. We charge 25% of the amount saved — only if you win.\n\nIf you don't win, you owe nothing."
          )
        } />
        <SettingRow icon="percent" label="Our Fee" value="25% on success only" />
        <SettingRow icon="info" label="App Version" value="1.0.0" />
      </View>

      {/* Legal */}
      <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
        Legal
      </Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SettingRow icon="file-text" label="Terms of Service" onPress={() =>
          Alert.alert("Terms of Service", "TicketBuried provides AI-powered assistance to help users contest violations. We are not a law firm. Our services do not constitute legal advice. The 25% contingency fee applies only to amounts actually recovered or waived.")
        } />
        <SettingRow icon="lock" label="Privacy Policy" onPress={() =>
          Alert.alert("Privacy Policy", "We collect only the information necessary to process your case. We do not sell your data. Case information is stored locally on your device.")
        } />
        <SettingRow icon="alert-triangle" label="Disclaimer" onPress={() =>
          Alert.alert("Disclaimer", "TicketBuried AI analysis is for informational purposes only. Results may vary. Past success rates do not guarantee future outcomes.")
        } />
      </View>

      <Text style={[styles.footer, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
        TicketBuried · Zero risk, maximum recovery
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20 },
  title: { fontSize: 28, marginBottom: 20 },
  statsCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
  },
  statsCardTitle: { color: "rgba(255,255,255,0.8)", fontSize: 13, marginBottom: 16 },
  statsGrid: { flexDirection: "row", alignItems: "center" },
  statItem: { flex: 1, alignItems: "center" },
  statNum: { color: "#fff", fontSize: 24, marginBottom: 2 },
  statLbl: { color: "rgba(255,255,255,0.7)", fontSize: 12 },
  statDivider: { width: 1, height: 40, backgroundColor: "rgba(255,255,255,0.2)" },
  sectionTitle: { fontSize: 18, marginBottom: 12 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 24,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
  },
  settingIcon: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  settingLabel: { flex: 1, fontSize: 15 },
  settingRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  settingValue: { fontSize: 14 },
  typeRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  typeIcon: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  typeName: { flex: 1, fontSize: 14 },
  typeCount: { fontSize: 16 },
  footer: { textAlign: "center", fontSize: 12, marginTop: 10, marginBottom: 20 },
});
