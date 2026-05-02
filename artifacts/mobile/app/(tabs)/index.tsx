import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CaseCard } from "@/components/CaseCard";
import { useColors } from "@/hooks/useColors";
import { useCases } from "@/context/CasesContext";
import { VIOLATION_TYPES, ViolationType } from "@/constants/violations";

const VIOLATION_ORDER: ViolationType[] = ["parking", "camera", "bank", "airline", "hoa"];

export default function DashboardScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cases, loading, totalRecovered, casesWon, casesLost, activeCount } = useCases();

  const recentCases = cases.slice(0, 3);
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : 0;

  const winRate =
    casesWon + casesLost > 0
      ? Math.round((casesWon / (casesWon + casesLost)) * 100)
      : null;

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.scroll,
        { paddingTop: topInset + 16, paddingBottom: bottomInset + 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Good {getTimeOfDay()}
          </Text>
          <Text style={[styles.appName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            TicketBuried
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/new-case")}
          style={[styles.addButton, { backgroundColor: colors.primary }]}
        >
          <Feather name="plus" size={20} color="#fff" />
        </Pressable>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.success, fontFamily: "Inter_700Bold" }]}>
            ${totalRecovered.toFixed(0)}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Recovered
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>
            {activeCount}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Active Cases
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            {winRate !== null ? `${winRate}%` : "—"}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Win Rate
          </Text>
        </View>
      </View>

      {/* New Case Banner */}
      <Pressable
        onPress={() => router.push("/new-case")}
        style={[styles.newCaseBanner, { backgroundColor: colors.primary }]}
      >
        <View>
          <Text style={[styles.bannerTitle, { fontFamily: "Inter_700Bold" }]}>
            Fight a Violation
          </Text>
          <Text style={[styles.bannerSubtitle, { fontFamily: "Inter_400Regular" }]}>
            No win, no fee. We take 25% only on success.
          </Text>
        </View>
        <View style={styles.bannerIcon}>
          <Feather name="shield" size={32} color="rgba(255,255,255,0.3)" />
        </View>
        <View style={[styles.bannerCta, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
          <Text style={[styles.bannerCtaText, { fontFamily: "Inter_600SemiBold" }]}>Start</Text>
          <Feather name="arrow-right" size={14} color="#fff" />
        </View>
      </Pressable>

      {/* Violation Type Grid */}
      <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
        What can we fight?
      </Text>
      <View style={styles.typeGrid}>
        {VIOLATION_ORDER.map((type) => {
          const v = VIOLATION_TYPES[type];
          return (
            <Pressable
              key={type}
              onPress={() => router.push({ pathname: "/new-case", params: { preselect: type } })}
              style={[styles.typeCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.typeIcon, { backgroundColor: v.color + "20" }]}>
                <Feather name={v.iconName as any} size={20} color={v.color} />
              </View>
              <Text style={[styles.typeName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                {v.label}
              </Text>
              <Text style={[styles.typeRate, { color: colors.success, fontFamily: "Inter_700Bold" }]}>
                {v.avgSuccessRate}%
              </Text>
              <Text style={[styles.typeRateLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                success rate
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Recent Cases */}
      {recentCases.length > 0 && (
        <>
          <View style={styles.recentHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              Recent Cases
            </Text>
            <Pressable onPress={() => router.push("/(tabs)/cases")}>
              <Text style={[styles.seeAll, { color: colors.accent, fontFamily: "Inter_500Medium" }]}>
                See all
              </Text>
            </Pressable>
          </View>
          {recentCases.map((item) => (
            <CaseCard key={item.id} item={item} />
          ))}
        </>
      )}

      {cases.length === 0 && (
        <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="shield" size={36} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            No cases yet
          </Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Tap the + button above to fight your first violation. You pay nothing unless we win.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { paddingHorizontal: 20 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: { fontSize: 13, marginBottom: 2 },
  appName: { fontSize: 26 },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
  },
  statValue: { fontSize: 20, marginBottom: 2 },
  statLabel: { fontSize: 11, textAlign: "center" },
  newCaseBanner: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  bannerTitle: { color: "#fff", fontSize: 18, marginBottom: 4 },
  bannerSubtitle: { color: "rgba(255,255,255,0.75)", fontSize: 13, flex: 1, maxWidth: 200 },
  bannerIcon: { position: "absolute", right: 56, top: 10 },
  bannerCta: {
    position: "absolute",
    right: 16,
    bottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bannerCtaText: { color: "#fff", fontSize: 13 },
  sectionTitle: { fontSize: 20, marginBottom: 14 },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 28 },
  typeCard: {
    width: "47%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  typeName: { fontSize: 13, marginBottom: 6 },
  typeRate: { fontSize: 22 },
  typeRateLabel: { fontSize: 11 },
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  seeAll: { fontSize: 14 },
  emptyState: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 32,
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
  emptyTitle: { fontSize: 17 },
  emptyText: { fontSize: 14, lineHeight: 20, textAlign: "center" },
});
