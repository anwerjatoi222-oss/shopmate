import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../../constants/theme";
import { supabase } from "../../lib/supabase";
import { DashboardStats } from "../../types/dashboard";

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const { data, error } = await supabase.rpc("dashboard_stats");
        if (error) console.log("Dashboard error:", error.message);
        else setStats(data as DashboardStats);
        setLoading(false);
      };
      load();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Dashboard</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Aaj ki sale</Text>
        <Text style={styles.value}>
          Rs. {Number(stats?.today_sales ?? 0).toLocaleString()}
        </Text>
      </View>

      <View style={styles.row}>
        <Pressable
          style={[styles.card, styles.half]}
          onPress={() => router.navigate("/products")}
        >
          <Text style={styles.label}>Products</Text>
          <Text style={styles.value}>{stats?.product_count ?? 0}</Text>
        </Pressable>

        <Pressable
          style={[styles.card, styles.half]}
          onPress={() => router.navigate("/products")}
        >
          <Text style={styles.label}>Low stock</Text>
          <Text style={[styles.value, (stats?.low_stock_count ?? 0) > 0 && styles.warning]}>
            {stats?.low_stock_count ?? 0}
          </Text>
        </Pressable>
      </View>

      <Pressable style={styles.button} onPress={() => router.push("/new-sale")}>
        <Text style={styles.buttonText}>+ Naya sale</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, paddingTop: 56 },
  heading: { fontSize: 28, fontWeight: "bold", color: colors.text, marginBottom: spacing.lg },
  row: { flexDirection: "row", gap: spacing.md },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  half: { flex: 1 },
  label: { fontSize: 14, color: colors.muted },
  value: { fontSize: 28, fontWeight: "bold", color: colors.primary, marginTop: 4 },
  warning: { color: colors.danger },
  button: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: radius.sm,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});