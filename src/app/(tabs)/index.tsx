import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, radius, spacing } from "../../constants/theme";
import { supabase } from "../../lib/supabase";
import { DashboardStats } from "../../types/dashboard";
import { LowStockProduct } from "../../types/product";

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const [statsRes, lowRes] = await Promise.all([
          supabase.rpc("dashboard_stats"),
          supabase.from("low_stock_products").select("*").order("stock").limit(10),
        ]);
        if (statsRes.error) console.log("Dashboard error:", statsRes.error.message);
        else setStats(statsRes.data as DashboardStats);
        if (lowRes.error) console.log("Low stock error:", lowRes.error.message);
        else setLowStock(lowRes.data as LowStockProduct[]);
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
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
          <Text
            style={[
              styles.value,
              (stats?.low_stock_count ?? 0) > 0 && styles.warning,
            ]}
          >
            {stats?.low_stock_count ?? 0}
          </Text>
        </Pressable>
      </View>

      <Pressable style={styles.button} onPress={() => router.push("/new-sale")}>
        <Text style={styles.buttonText}>+ Naya sale</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Low stock alerts</Text>

      {lowStock.length === 0 ? (
        <Text style={styles.empty}>Sab products ka stock theek hai</Text>
      ) : (
        lowStock.map((p) => (
          <Pressable
            key={p.id}
            style={styles.alertCard}
            onPress={() =>
              router.push({ pathname: "/edit-product", params: { id: p.id } })
            }
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.alertName}>{p.name}</Text>
              <Text style={styles.alertSub}>Limit: {p.low_stock_limit}</Text>
            </View>
            <Text style={styles.alertStock}>
              {p.stock === 0 ? "Khatam" : `${p.stock} bacha`}
            </Text>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    paddingTop: 56,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.lg,
  },
  row: { flexDirection: "row", gap: spacing.md },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  half: { flex: 1 },
  label: { fontSize: 14, color: colors.muted },
  value: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.primary,
    marginTop: 4,
  },
  warning: { color: colors.danger },
  button: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: radius.sm,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  empty: { color: colors.muted, textAlign: "center", marginTop: spacing.sm },
  alertCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
  },
  alertName: { fontSize: 16, fontWeight: "600", color: colors.text },
  alertSub: { color: colors.muted, marginTop: 2 },
  alertStock: { fontWeight: "bold", color: colors.danger },
});