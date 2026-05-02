import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
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

import { useColors } from "@/hooks/useColors";
import { useCases } from "@/context/CasesContext";
import {
  VIOLATION_TYPES,
  ViolationType,
} from "@/constants/violations";

const VIOLATION_ORDER: ViolationType[] = ["parking", "camera", "bank", "airline", "hoa"];

export default function NewCaseScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addCase } = useCases();
  const params = useLocalSearchParams<{ preselect?: string }>();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedType, setSelectedType] = useState<ViolationType | null>(
    params.preselect as ViolationType | null
  );
  const [fineAmount, setFineAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [meta, setMeta] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (params.preselect && VIOLATION_TYPES[params.preselect as ViolationType]) {
      setSelectedType(params.preselect as ViolationType);
      setStep(2);
    }
  }, []);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (step - 1) / 2,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [step]);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  function handleSelectType(type: ViolationType) {
    Haptics.selectionAsync();
    setSelectedType(type);
    setStep(2);
  }

  function handleNext() {
    if (step === 2) {
      if (!fineAmount || parseFloat(fineAmount) <= 0) {
        Alert.alert("Enter Fine Amount", "Please enter the fine amount to continue.");
        return;
      }
      setStep(3);
    }
  }

  async function handleSubmit() {
    if (!selectedType) return;
    setSubmitting(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const newCase = await addCase({
      violationType: selectedType,
      fineAmount: parseFloat(fineAmount) || 0,
      notes,
      meta,
    });
    setSubmitting(false);
    router.replace(`/case/${newCase.id}`);
  }

  const violation = selectedType ? VIOLATION_TYPES[selectedType] : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: topInset + 8, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="x" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.topTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          {step === 1 ? "Choose Violation" : step === 2 ? "Case Details" : "Review & Submit"}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor: colors.primary,
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>

      {/* Step 1: Violation Type */}
      {step === 1 && (
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: bottomInset + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.stepHeading, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
            STEP 1 OF 3
          </Text>
          <Text style={[styles.stepTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            What type of violation?
          </Text>
          <View style={styles.typeGrid}>
            {VIOLATION_ORDER.map((type) => {
              const v = VIOLATION_TYPES[type];
              return (
                <Pressable
                  key={type}
                  onPress={() => handleSelectType(type)}
                  style={[styles.typeCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <View style={[styles.typeIconBadge, { backgroundColor: v.color + "20" }]}>
                    <Feather name={v.iconName as any} size={24} color={v.color} />
                  </View>
                  <Text style={[styles.typeCardName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                    {v.label}
                  </Text>
                  <Text style={[styles.typeCardDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {v.description}
                  </Text>
                  <View style={styles.typeCardFooter}>
                    <View style={[styles.rateChip, { backgroundColor: colors.success + "20" }]}>
                      <Text style={[styles.rateChipText, { color: colors.success, fontFamily: "Inter_700Bold" }]}>
                        {v.avgSuccessRate}% success
                      </Text>
                    </View>
                    <Text style={[styles.avgFine, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      avg ${v.avgFine}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* Step 2: Form */}
      {step === 2 && violation && (
        <>
          <ScrollView
            contentContainerStyle={[styles.scroll, { paddingBottom: bottomInset + 100 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={[styles.stepHeading, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
              STEP 2 OF 3
            </Text>
            <Text style={[styles.stepTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              {violation.label} Details
            </Text>

            {/* Fine Amount */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                Fine Amount ($) *
              </Text>
              <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.inputPrefix, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>$</Text>
                <TextInput
                  style={[styles.input, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                  placeholder="0.00"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="decimal-pad"
                  value={fineAmount}
                  onChangeText={setFineAmount}
                />
              </View>
            </View>

            {/* Type-specific fields */}
            {violation.fields.map((field) => {
              if (field.type === "select" && field.options) {
                return (
                  <View key={field.key} style={styles.fieldGroup}>
                    <Text style={[styles.fieldLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                      {field.label} {field.required ? "*" : ""}
                    </Text>
                    <View style={styles.optionsRow}>
                      {field.options.map((opt) => {
                        const selected = meta[field.key] === opt;
                        return (
                          <Pressable
                            key={opt}
                            onPress={() => {
                              Haptics.selectionAsync();
                              setMeta((m) => ({ ...m, [field.key]: opt }));
                            }}
                            style={[
                              styles.optionChip,
                              {
                                backgroundColor: selected ? colors.primary : colors.card,
                                borderColor: selected ? colors.primary : colors.border,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.optionChipText,
                                {
                                  color: selected ? "#fff" : colors.foreground,
                                  fontFamily: selected ? "Inter_600SemiBold" : "Inter_400Regular",
                                },
                              ]}
                            >
                              {opt}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                );
              }

              return (
                <View key={field.key} style={styles.fieldGroup}>
                  <Text style={[styles.fieldLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                    {field.label} {field.required ? "*" : ""}
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border, fontFamily: "Inter_400Regular" },
                    ]}
                    placeholder={field.placeholder}
                    placeholderTextColor={colors.mutedForeground}
                    value={meta[field.key] ?? ""}
                    onChangeText={(v) => setMeta((m) => ({ ...m, [field.key]: v }))}
                  />
                </View>
              );
            })}

            {/* Notes */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                Additional Notes
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  styles.notesInput,
                  { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border, fontFamily: "Inter_400Regular" },
                ]}
                placeholder="Anything else the AI should know..."
                placeholderTextColor={colors.mutedForeground}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          {/* Bottom Nav */}
          <View style={[styles.bottomBar, { borderTopColor: colors.border, backgroundColor: colors.background, paddingBottom: bottomInset + 16 }]}>
            <Pressable
              onPress={() => setStep(1)}
              style={[styles.backBtnBottom, { backgroundColor: colors.muted }]}
            >
              <Feather name="arrow-left" size={18} color={colors.foreground} />
            </Pressable>
            <Pressable
              onPress={handleNext}
              style={[styles.nextBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.nextBtnText, { fontFamily: "Inter_700Bold" }]}>Review</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </Pressable>
          </View>
        </>
      )}

      {/* Step 3: Review */}
      {step === 3 && violation && (
        <>
          <ScrollView
            contentContainerStyle={[styles.scroll, { paddingBottom: bottomInset + 100 }]}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.stepHeading, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
              STEP 3 OF 3
            </Text>
            <Text style={[styles.stepTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              Review Your Case
            </Text>

            {/* Summary Card */}
            <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.summaryHeader}>
                <View style={[styles.summaryIcon, { backgroundColor: violation.color + "20" }]}>
                  <Feather name={violation.iconName as any} size={22} color={violation.color} />
                </View>
                <View>
                  <Text style={[styles.summaryType, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                    {violation.label}
                  </Text>
                  <Text style={[styles.summaryFine, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    Fine: ${parseFloat(fineAmount || "0").toFixed(2)}
                  </Text>
                </View>
              </View>

              {Object.entries(meta)
                .filter(([_, v]) => v)
                .map(([k, v]) => {
                  const fieldDef = violation.fields.find((f) => f.key === k);
                  if (!fieldDef) return null;
                  return (
                    <View key={k} style={[styles.summaryRow, { borderTopColor: colors.border }]}>
                      <Text style={[styles.summaryKey, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                        {fieldDef.label}
                      </Text>
                      <Text style={[styles.summaryVal, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                        {v}
                      </Text>
                    </View>
                  );
                })}

              {notes.length > 0 && (
                <View style={[styles.summaryRow, { borderTopColor: colors.border }]}>
                  <Text style={[styles.summaryKey, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>Notes</Text>
                  <Text style={[styles.summaryVal, { color: colors.foreground, fontFamily: "Inter_600SemiBold", flex: 1 }]}>
                    {notes}
                  </Text>
                </View>
              )}
            </View>

            {/* Fee notice */}
            <View style={[styles.feeNotice, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "20" }]}>
              <Feather name="shield" size={18} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.feeTitle, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
                  Zero Risk Guarantee
                </Text>
                <Text style={[styles.feeDesc, { color: colors.primary, fontFamily: "Inter_400Regular" }]}>
                  We take 25% of ${parseFloat(fineAmount || "0").toFixed(2)} (${(parseFloat(fineAmount || "0") * 0.25).toFixed(2)}) only if you win. Nothing due today.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Nav */}
          <View style={[styles.bottomBar, { borderTopColor: colors.border, backgroundColor: colors.background, paddingBottom: bottomInset + 16 }]}>
            <Pressable
              onPress={() => setStep(2)}
              style={[styles.backBtnBottom, { backgroundColor: colors.muted }]}
            >
              <Feather name="arrow-left" size={18} color={colors.foreground} />
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              disabled={submitting}
              style={[styles.nextBtn, { backgroundColor: submitting ? colors.mutedForeground : colors.primary }]}
            >
              <Feather name="cpu" size={18} color="#fff" />
              <Text style={[styles.nextBtnText, { fontFamily: "Inter_700Bold" }]}>
                {submitting ? "Submitting..." : "Analyse My Case"}
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  topTitle: { fontSize: 17 },
  progressTrack: { height: 3 },
  progressFill: { height: 3 },
  scroll: { paddingHorizontal: 20, paddingTop: 24, gap: 0 },
  stepHeading: { fontSize: 11, letterSpacing: 1, marginBottom: 6 },
  stepTitle: { fontSize: 26, marginBottom: 24 },
  typeGrid: { gap: 12 },
  typeCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    gap: 8,
  },
  typeIconBadge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  typeCardName: { fontSize: 18 },
  typeCardDesc: { fontSize: 13, lineHeight: 19 },
  typeCardFooter: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
  rateChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  rateChipText: { fontSize: 12 },
  avgFine: { fontSize: 12 },
  fieldGroup: { marginBottom: 18 },
  fieldLabel: { fontSize: 14, marginBottom: 8 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 50,
  },
  inputPrefix: { fontSize: 18, marginRight: 4 },
  input: { flex: 1, fontSize: 18 },
  textInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
  },
  notesInput: { height: 100, paddingTop: 13 },
  optionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  optionChipText: { fontSize: 13 },
  bottomBar: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  backBtnBottom: {
    width: 50,
    height: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  nextBtn: {
    flex: 1,
    height: 54,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  nextBtnText: { color: "#fff", fontSize: 16 },
  summaryCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 18,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 18,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryType: { fontSize: 18, marginBottom: 2 },
  summaryFine: { fontSize: 14 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
    borderTopWidth: 1,
    gap: 12,
  },
  summaryKey: { fontSize: 13 },
  summaryVal: { fontSize: 13, textAlign: "right" },
  feeNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  feeTitle: { fontSize: 15, marginBottom: 4 },
  feeDesc: { fontSize: 13, lineHeight: 19 },
});
