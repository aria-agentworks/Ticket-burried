import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AnalysisPanel } from "@/components/AnalysisPanel";
import { useColors } from "@/hooks/useColors";
import { useCases } from "@/context/CasesContext";
import { VIOLATION_TYPES, STATUS_CONFIG, CaseStatus } from "@/constants/violations";

export default function CaseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getCaseById, updateCaseStatus, deleteCase } = useCases();

  const [dotAnim] = useState(new Animated.Value(0));
  const [recoveryAmount, setRecoveryAmount] = useState("");
  const [showOutcomeInput, setShowOutcomeInput] = useState(false);

  const caseItem = getCaseById(id);

  const caseStatus = caseItem?.status;
  useEffect(() => {
    if (caseStatus === "analysing") {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(dotAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(dotAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [caseStatus]);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  if (!caseItem) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFound, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
          Case not found
        </Text>
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.backLink, { color: colors.accent, fontFamily: "Inter_500Medium" }]}>
            Go back
          </Text>
        </Pressable>
      </View>
    );
  }

  const violation = VIOLATION_TYPES[caseItem.violationType];
  const statusConfig = STATUS_CONFIG[caseItem.status];

  function handleDelete() {
    Alert.alert("Withdraw Case", "Are you sure you want to withdraw this case?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Withdraw",
        style: "destructive",
        onPress: async () => {
          await deleteCase(caseItem!.id);
          router.back();
        },
      },
    ]);
  }

  async function handleConfirmFight() {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await updateCaseStatus(caseItem!.id, "confirmed");
  }

  async function handleMarkSubmitted() {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await updateCaseStatus(caseItem!.id, "submitted");
  }

  async function handleOutcome(outcome: "won" | "lost") {
    if (outcome === "won") {
      if (!recoveryAmount || parseFloat(recoveryAmount) <= 0) {
        Alert.alert("Enter Amount", "Please enter the amount recovered or waived.");
        return;
      }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await updateCaseStatus(caseItem!.id, "won", {
        recoveredAmount: parseFloat(recoveryAmount),
      });
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      await updateCaseStatus(caseItem!.id, "lost");
    }
    setShowOutcomeInput(false);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Bar */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: topInset + 8,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <View style={[styles.statusPill, { backgroundColor: statusConfig.bg }]}>
          <Text style={[styles.statusPillText, { color: statusConfig.color, fontFamily: "Inter_600SemiBold" }]}>
            {statusConfig.label}
          </Text>
        </View>
        {["uploaded", "analysing", "analysed"].includes(caseItem.status) && (
          <Pressable onPress={handleDelete} style={styles.deleteBtn}>
            <Feather name="trash-2" size={18} color={colors.destructive} />
          </Pressable>
        )}
        {!["uploaded", "analysing", "analysed"].includes(caseItem.status) && (
          <View style={{ width: 36 }} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: bottomInset + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Case Header */}
        <View style={styles.caseHeader}>
          <View style={[styles.caseIcon, { backgroundColor: violation.color + "20" }]}>
            <Feather name={violation.iconName as any} size={28} color={violation.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.caseType, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              {violation.label}
            </Text>
            <Text style={[styles.caseDate, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {new Date(caseItem.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </View>
          <Text style={[styles.caseFine, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            ${caseItem.fineAmount.toFixed(0)}
          </Text>
        </View>

        {/* Meta details */}
        {Object.entries(caseItem.meta)
          .filter(([_, v]) => v)
          .slice(0, 4)
          .map(([k, v]) => {
            const fieldDef = violation.fields.find((f) => f.key === k);
            if (!fieldDef) return null;
            return (
              <View key={k} style={[styles.metaRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.metaKey, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                  {fieldDef.label}
                </Text>
                <Text style={[styles.metaVal, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  {v}
                </Text>
              </View>
            );
          })}

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* ANALYSING STATE */}
        {caseItem.status === "analysing" && (
          <View style={[styles.analysingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ActivityIndicator color={colors.warning} size="large" style={{ marginBottom: 16 }} />
            <Text style={[styles.analysingTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              Analysing Your Case
            </Text>
            <Text style={[styles.analysingSubtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Our AI is reviewing your {violation.label.toLowerCase()} and identifying the strongest defences. This takes 30–90 seconds.
            </Text>
            <View style={styles.analysingSteps}>
              {[
                "Identifying violation type and jurisdiction",
                "Searching for procedural defences",
                "Generating personalised appeal letter",
              ].map((step, i) => (
                <View key={i} style={styles.analysingStep}>
                  <Animated.View
                    style={[
                      styles.analysingDot,
                      {
                        backgroundColor: colors.warning,
                        opacity: dotAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.3, 1],
                        }),
                      },
                    ]}
                  />
                  <Text style={[styles.analysingStepText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {step}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ANALYSED STATE */}
        {caseItem.status === "analysed" && caseItem.analysis && (
          <>
            <AnalysisPanel analysis={caseItem.analysis} fineAmount={caseItem.fineAmount} />
            <View style={[styles.actionRow]}>
              <Pressable
                onPress={handleDelete}
                style={[styles.withdrawBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
              >
                <Text style={[styles.withdrawText, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
                  Withdraw
                </Text>
              </Pressable>
              <Pressable
                onPress={handleConfirmFight}
                style={[styles.fightBtn, { backgroundColor: colors.primary }]}
              >
                <Feather name="shield" size={18} color="#fff" />
                <Text style={[styles.fightText, { fontFamily: "Inter_700Bold" }]}>
                  I'll Fight This
                </Text>
              </Pressable>
            </View>
          </>
        )}

        {/* CONFIRMED STATE */}
        {caseItem.status === "confirmed" && caseItem.analysis && (
          <>
            <View style={[styles.infoCard, { backgroundColor: colors.success + "10", borderColor: colors.success + "30" }]}>
              <Feather name="check-circle" size={20} color={colors.success} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.infoTitle, { color: colors.success, fontFamily: "Inter_700Bold" }]}>
                  Appeal Ready
                </Text>
                <Text style={[styles.infoDesc, { color: colors.success, fontFamily: "Inter_400Regular" }]}>
                  Your appeal letter is ready. Submit it via: {caseItem.analysis.submissionMethod}
                </Text>
              </View>
            </View>
            <AnalysisPanel analysis={caseItem.analysis} fineAmount={caseItem.fineAmount} />
            <Pressable
              onPress={handleMarkSubmitted}
              style={[styles.fullBtn, { backgroundColor: colors.accent, marginTop: 16 }]}
            >
              <Feather name="send" size={18} color="#fff" />
              <Text style={[styles.fullBtnText, { fontFamily: "Inter_700Bold" }]}>
                I've Submitted the Appeal
              </Text>
            </Pressable>
          </>
        )}

        {/* SUBMITTED STATE */}
        {caseItem.status === "submitted" && (
          <>
            <View style={[styles.infoCard, { backgroundColor: colors.accent + "10", borderColor: colors.accent + "30" }]}>
              <Feather name="clock" size={20} color={colors.accent} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.infoTitle, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>
                  Waiting for Outcome
                </Text>
                <Text style={[styles.infoDesc, { color: colors.accent, fontFamily: "Inter_400Regular" }]}>
                  Appeal submitted. Report the result when you hear back.
                </Text>
              </View>
            </View>

            {showOutcomeInput ? (
              <View style={[styles.outcomeForm, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.outcomeFormTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                  How much was recovered?
                </Text>
                <View style={[styles.amountRow, { borderColor: colors.border, backgroundColor: colors.muted }]}>
                  <Text style={[styles.dollarSign, { color: colors.mutedForeground, fontFamily: "Inter_700Bold" }]}>$</Text>
                  <TextInput
                    style={[styles.amountInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                    placeholder="Amount waived or reduced"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="decimal-pad"
                    value={recoveryAmount}
                    onChangeText={setRecoveryAmount}
                  />
                </View>
                <View style={styles.outcomeButtons}>
                  <Pressable
                    onPress={() => handleOutcome("lost")}
                    style={[styles.outcomeBtn, { backgroundColor: colors.destructive + "15", borderColor: colors.destructive + "30" }]}
                  >
                    <Text style={[styles.outcomeBtnText, { color: colors.destructive, fontFamily: "Inter_700Bold" }]}>
                      Lost / Rejected
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleOutcome("won")}
                    style={[styles.outcomeBtn, { backgroundColor: colors.success + "15", borderColor: colors.success + "30" }]}
                  >
                    <Text style={[styles.outcomeBtnText, { color: colors.success, fontFamily: "Inter_700Bold" }]}>
                      Won / Waived
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={styles.outcomeOptions}>
                <Pressable
                  onPress={() => setShowOutcomeInput(true)}
                  style={[styles.fullBtn, { backgroundColor: colors.success }]}
                >
                  <Feather name="check-circle" size={18} color="#fff" />
                  <Text style={[styles.fullBtnText, { fontFamily: "Inter_700Bold" }]}>Report Outcome</Text>
                </Pressable>
              </View>
            )}
          </>
        )}

        {/* WON STATE */}
        {caseItem.status === "won" && (
          <View style={[styles.resultCard, { backgroundColor: colors.success + "15", borderColor: colors.success + "30" }]}>
            <Feather name="award" size={48} color={colors.success} style={{ marginBottom: 12 }} />
            <Text style={[styles.resultTitle, { color: colors.success, fontFamily: "Inter_700Bold" }]}>
              You Won!
            </Text>
            <Text style={[styles.resultAmount, { color: colors.success, fontFamily: "Inter_700Bold" }]}>
              ${caseItem.recoveredAmount?.toFixed(2) ?? caseItem.fineAmount.toFixed(2)} recovered
            </Text>
            <Text style={[styles.resultFee, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Our fee: ${((caseItem.recoveredAmount ?? caseItem.fineAmount) * 0.25).toFixed(2)}
            </Text>
            <Text style={[styles.resultDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Congratulations! We'll be in touch about settlement of our 25% success fee.
            </Text>
          </View>
        )}

        {/* LOST STATE */}
        {caseItem.status === "lost" && (
          <View style={[styles.resultCard, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Feather name="x-circle" size={48} color={colors.mutedForeground} style={{ marginBottom: 12 }} />
            <Text style={[styles.resultTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              Appeal Not Successful
            </Text>
            <Text style={[styles.resultDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              This one didn't go our way. You owe us nothing — our contingency model means we only get paid when you win.
            </Text>
            <View style={[styles.nextStepsBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.nextStepsTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                Next Steps
              </Text>
              <Text style={[styles.nextStepsText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                • Consider escalating to a regulatory body (CFPB, DOT, state agency){"\n"}
                • Try a new case with additional evidence{"\n"}
                • A new violation? We're ready to fight again.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  notFound: { fontSize: 18 },
  backLink: { fontSize: 15 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  deleteBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  statusPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  statusPillText: { fontSize: 13 },
  scroll: { paddingHorizontal: 20, paddingTop: 20, gap: 0 },
  caseHeader: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 18 },
  caseIcon: { width: 56, height: 56, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  caseType: { fontSize: 22, marginBottom: 3 },
  caseDate: { fontSize: 13 },
  caseFine: { fontSize: 24 },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  metaKey: { fontSize: 13 },
  metaVal: { fontSize: 13 },
  divider: { height: 1, marginVertical: 20 },
  analysingCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
  },
  analysingTitle: { fontSize: 20, marginBottom: 8, textAlign: "center" },
  analysingSubtitle: { fontSize: 14, lineHeight: 20, textAlign: "center", marginBottom: 20 },
  analysingSteps: { gap: 12, width: "100%" },
  analysingStep: { flexDirection: "row", alignItems: "center", gap: 10 },
  analysingDot: { width: 8, height: 8, borderRadius: 4 },
  analysingStepText: { fontSize: 13, flex: 1 },
  actionRow: { flexDirection: "row", gap: 12, marginTop: 20 },
  withdrawBtn: {
    flex: 1,
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  withdrawText: { fontSize: 15 },
  fightBtn: {
    flex: 2,
    height: 54,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  fightText: { color: "#fff", fontSize: 16 },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  infoTitle: { fontSize: 15, marginBottom: 4 },
  infoDesc: { fontSize: 13, lineHeight: 18 },
  fullBtn: {
    height: 54,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  fullBtnText: { color: "#fff", fontSize: 16 },
  outcomeOptions: { marginTop: 16, gap: 12 },
  outcomeForm: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    marginTop: 16,
    gap: 14,
  },
  outcomeFormTitle: { fontSize: 18 },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 52,
  },
  dollarSign: { fontSize: 20, marginRight: 4 },
  amountInput: { flex: 1, fontSize: 20 },
  outcomeButtons: { flexDirection: "row", gap: 10 },
  outcomeBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  outcomeBtnText: { fontSize: 14 },
  resultCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 28,
    alignItems: "center",
    gap: 8,
  },
  resultTitle: { fontSize: 26 },
  resultAmount: { fontSize: 36 },
  resultFee: { fontSize: 14, marginBottom: 4 },
  resultDesc: { fontSize: 14, lineHeight: 20, textAlign: "center" },
  nextStepsBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginTop: 16,
    width: "100%",
    gap: 8,
  },
  nextStepsTitle: { fontSize: 15 },
  nextStepsText: { fontSize: 13, lineHeight: 20 },
});
