import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";
import { CaseAnalysis, DefenceStrength } from "@/constants/violations";

interface AnalysisPanelProps {
  analysis: CaseAnalysis;
  fineAmount: number;
}

const strengthConfig: Record<DefenceStrength, { label: string; color: string; bg: string }> = {
  strong: { label: "Strong", color: "#065F46", bg: "#D1FAE5" },
  moderate: { label: "Moderate", color: "#92400E", bg: "#FEF3C7" },
  weak: { label: "Weak", color: "#991B1B", bg: "#FEE2E2" },
};

function DefenceItem({ defence }: { defence: CaseAnalysis["defences"][0] }) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);
  const strength = strengthConfig[defence.strength];

  return (
    <Pressable
      onPress={() => setExpanded((e) => !e)}
      style={[styles.defenceItem, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={styles.defenceHeader}>
        <View style={[styles.strengthDot, { backgroundColor: strength.bg }]}>
          <Text style={[styles.strengthText, { color: strength.color, fontFamily: "Inter_600SemiBold" }]}>
            {strength.label}
          </Text>
        </View>
        <Text
          style={[styles.defenceTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold", flex: 1 }]}
          numberOfLines={expanded ? undefined : 2}
        >
          {defence.title}
        </Text>
        <Feather
          name={expanded ? "chevron-up" : "chevron-down"}
          size={16}
          color={colors.mutedForeground}
        />
      </View>
      {expanded && (
        <View style={styles.defenceBody}>
          <Text style={[styles.defenceExplanation, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
            {defence.explanation}
          </Text>
          <View style={[styles.evidenceBox, { backgroundColor: colors.muted }]}>
            <Feather name="file-text" size={12} color={colors.accent} />
            <Text style={[styles.evidenceText, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
              Evidence needed: {defence.evidenceNeeded}
            </Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

export function AnalysisPanel({ analysis, fineAmount }: AnalysisPanelProps) {
  const colors = useColors();
  const [copied, setCopied] = useState(false);

  const probabilityColor =
    analysis.successProbability >= 60
      ? colors.success
      : analysis.successProbability >= 35
      ? colors.warning
      : colors.destructive;

  const ourFee = (fineAmount * 0.25).toFixed(2);

  const handleCopyLetter = async () => {
    await Clipboard.setStringAsync(analysis.appealLetter);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.container}>
      {/* Success Probability */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.probabilityHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              Win Probability
            </Text>
            <Text style={[styles.confidenceLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {analysis.confidenceLevel.charAt(0).toUpperCase() + analysis.confidenceLevel.slice(1)} confidence
            </Text>
          </View>
          <Text style={[styles.probabilityNumber, { color: probabilityColor, fontFamily: "Inter_700Bold" }]}>
            {analysis.successProbability}%
          </Text>
        </View>
        <View style={[styles.barTrack, { backgroundColor: colors.muted }]}>
          <View
            style={[
              styles.barFill,
              { width: `${analysis.successProbability}%` as any, backgroundColor: probabilityColor },
            ]}
          />
        </View>
        <View style={[styles.feeBanner, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "20" }]}>
          <Feather name="info" size={13} color={colors.primary} />
          <Text style={[styles.feeText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>
            We take ${ourFee} (25%) only if you win. Nothing today.
          </Text>
        </View>
      </View>

      {/* Primary Defence */}
      <View style={[styles.section, { backgroundColor: colors.primary, borderColor: colors.primary }]}>
        <Text style={[styles.sectionLabel, { color: "rgba(255,255,255,0.7)", fontFamily: "Inter_500Medium" }]}>
          STRONGEST ARGUMENT
        </Text>
        <Text style={[styles.primaryDefenceText, { color: "#FFFFFF", fontFamily: "Inter_600SemiBold" }]}>
          {analysis.primaryDefence}
        </Text>
      </View>

      {/* Recommendation */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
          OUR RECOMMENDATION
        </Text>
        <View style={styles.recommendationRow}>
          <View
            style={[
              styles.recommendationBadge,
              {
                backgroundColor:
                  analysis.recommendation === "fight"
                    ? colors.success + "20"
                    : analysis.recommendation === "negotiate"
                    ? colors.warning + "20"
                    : colors.destructive + "20",
              },
            ]}
          >
            <Text
              style={[
                styles.recommendationText,
                {
                  fontFamily: "Inter_700Bold",
                  color:
                    analysis.recommendation === "fight"
                      ? colors.success
                      : analysis.recommendation === "negotiate"
                      ? colors.warning
                      : colors.destructive,
                },
              ]}
            >
              {analysis.recommendation.toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={[styles.recommendationReason, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
          {analysis.recommendationReason}
        </Text>
      </View>

      {/* Defences List */}
      <Text style={[styles.groupTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
        All Arguments
      </Text>
      {analysis.defences.map((d, i) => (
        <DefenceItem key={i} defence={d} />
      ))}

      {/* Submission Info */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
          HOW TO SUBMIT
        </Text>
        <View style={styles.submissionRow}>
          <Feather name="send" size={14} color={colors.accent} />
          <Text style={[styles.submissionMethod, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            {analysis.submissionMethod}
          </Text>
        </View>
        <View style={styles.submissionRow}>
          <Feather name="clock" size={14} color={colors.warning} />
          <Text style={[styles.submissionMethod, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
            Deadline: {analysis.deadlineDays} days from violation date
          </Text>
        </View>
      </View>

      {/* Appeal Letter */}
      <Text style={[styles.groupTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
        Generated Appeal Letter
      </Text>
      <View style={[styles.letterContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ScrollView style={styles.letterScroll} nestedScrollEnabled>
          <Text style={[styles.letterText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
            {analysis.appealLetter}
          </Text>
        </ScrollView>
        <Pressable
          onPress={handleCopyLetter}
          style={[styles.copyButton, { backgroundColor: copied ? colors.success : colors.primary }]}
        >
          <Feather name={copied ? "check" : "copy"} size={15} color="#fff" />
          <Text style={[styles.copyText, { fontFamily: "Inter_600SemiBold" }]}>
            {copied ? "Copied!" : "Copy Letter"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    marginBottom: 2,
  },
  probabilityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  probabilityNumber: {
    fontSize: 42,
  },
  confidenceLabel: {
    fontSize: 13,
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 14,
  },
  barFill: {
    height: 8,
    borderRadius: 4,
  },
  feeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  feeText: {
    fontSize: 13,
    flex: 1,
  },
  primaryDefenceText: {
    fontSize: 15,
    lineHeight: 22,
  },
  recommendationRow: {
    marginBottom: 10,
  },
  recommendationBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 10,
  },
  recommendationText: {
    fontSize: 13,
    letterSpacing: 0.5,
  },
  recommendationReason: {
    fontSize: 14,
    lineHeight: 20,
  },
  groupTitle: {
    fontSize: 18,
    marginTop: 4,
    marginBottom: 4,
  },
  defenceItem: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
  },
  defenceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  strengthDot: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  strengthText: {
    fontSize: 11,
  },
  defenceTitle: {
    fontSize: 14,
    lineHeight: 19,
  },
  defenceBody: {
    marginTop: 12,
    gap: 10,
  },
  defenceExplanation: {
    fontSize: 14,
    lineHeight: 20,
  },
  evidenceBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    padding: 10,
    borderRadius: 8,
  },
  evidenceText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  submissionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  submissionMethod: {
    fontSize: 14,
  },
  letterContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  letterScroll: {
    maxHeight: 220,
    padding: 16,
  },
  letterText: {
    fontSize: 13,
    lineHeight: 20,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  copyText: {
    color: "#fff",
    fontSize: 14,
  },
});
