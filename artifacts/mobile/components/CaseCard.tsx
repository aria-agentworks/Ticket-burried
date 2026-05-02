import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";
import { Case, VIOLATION_TYPES, STATUS_CONFIG } from "@/constants/violations";

interface CaseCardProps {
  item: Case;
}

export function CaseCard({ item }: CaseCardProps) {
  const colors = useColors();
  const router = useRouter();
  const scale = React.useRef(new Animated.Value(1)).current;

  const violation = VIOLATION_TYPES[item.violationType];
  const statusConfig = STATUS_CONFIG[item.status];

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }).start();
  };

  const dateStr = new Date(item.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => router.push(`/case/${item.id}`)}
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <View style={styles.header}>
          <View style={[styles.iconBadge, { backgroundColor: violation.color + "20" }]}>
            <Feather name={violation.iconName as any} size={18} color={violation.color} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.type, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              {violation.label}
            </Text>
            <Text style={[styles.date, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {dateStr}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
            <Text style={[styles.statusText, { color: statusConfig.color, fontFamily: "Inter_600SemiBold" }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.footer}>
          <View style={styles.footerItem}>
            <Text style={[styles.footerLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Fine Amount
            </Text>
            <Text style={[styles.footerValue, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              ${item.fineAmount.toFixed(0)}
            </Text>
          </View>

          {item.analysis && (
            <View style={styles.footerItem}>
              <Text style={[styles.footerLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Success Rate
              </Text>
              <Text
                style={[
                  styles.footerValue,
                  {
                    fontFamily: "Inter_700Bold",
                    color:
                      item.analysis.successProbability >= 60
                        ? colors.success
                        : item.analysis.successProbability >= 35
                        ? colors.warning
                        : colors.destructive,
                  },
                ]}
              >
                {item.analysis.successProbability}%
              </Text>
            </View>
          )}

          {item.status === "won" && item.recoveredAmount && (
            <View style={styles.footerItem}>
              <Text style={[styles.footerLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Recovered
              </Text>
              <Text style={[styles.footerValue, { color: colors.success, fontFamily: "Inter_700Bold" }]}>
                ${item.recoveredAmount.toFixed(0)}
              </Text>
            </View>
          )}

          <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
        </View>

        {item.status === "analysing" && (
          <View style={[styles.analysingBar, { backgroundColor: colors.warning + "20" }]}>
            <Feather name="cpu" size={12} color={colors.warning} />
            <Text style={[styles.analysingText, { color: colors.warning, fontFamily: "Inter_500Medium" }]}>
              AI is analysing your case...
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
  },
  type: {
    fontSize: 15,
    marginBottom: 2,
  },
  date: {
    fontSize: 13,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 20,
  },
  footerItem: {
    flex: 1,
  },
  footerLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  footerValue: {
    fontSize: 15,
  },
  analysingBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 6,
  },
  analysingText: {
    fontSize: 12,
  },
});
