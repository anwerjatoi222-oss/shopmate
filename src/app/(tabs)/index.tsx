import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AppButton } from "../../components/AppButton";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { Screen } from "../../components/Screen";
import { colors, radius, spacing } from "../../constants/theme";
import { supabase } from "../../lib/supabase";
import { DashboardStats } from "../../types/dashboard";
import { LowStockProduct } from "../../types/product";

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        setError(null);
        const [statsRes, lowRes] = await Promise.all([
          supabase.rpc("dashboard_stats"),
          supabase.from("low_stock_products").select("*").order("stock").limit(10),
        ]);
        if (statsRes.error) {
          console.log("Dashboard error:", statsRes.error.message);
          setError(statsRes.error.message);
        } else setStats(statsRes.data as DashboardStats);

        if (lowRes.error) {
          console.log("Low stock error:", lowRes.error.message);
          setError((prev) => prev ?? lowRes.error.message);
        } else setLowStock(lowRes.data as LowStockProduct[]);

        setLoading(false);
      };
      load();
    }, [])
  );

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Text style={styles.heading}>Dashboard</Text>
      <Text style={styles.sub}>Today’s shop overview</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Card style={styles.heroCard}>
        <Text style={styles.label}>Today’s sales</Text>
        <Text style={styles.heroValue}>
          Rs. {Number(stats?.today_sales ?? 0).toLocaleString()}
        </Text>
      </Card>

      <View style={styles.row}>
        <Pressable style={styles.half} onPress={() => router.navigate("/products")}>
          <Card>
            <Text style={styles.label}>Products</Text>
            <Text style={styles.value}>{stats?.product_count ?? 0}</Text>
          </Card>
        </Pressable>

        <Pressable style={styles.half} onPress={() => router.navigate("/products")}>
          <Card>
            <Text style={styles.label}>Low stock</Text>
            <Text
              style={[
                styles.value,
                (stats?.low_stock_count ?? 0) > 0 && styles.warning,
              ]}
            >
              {stats?.low_stock_count ?? 0}
            </Text>
          </Card>
        </Pressable>
      </View>

      <AppButton title="New sale" onPress={() => router.push("/new-sale")} />

      <Text style={styles.sectionTitle}>Low stock alerts</Text>

      {lowStock.length === 0 ? (
        <Card>
          <EmptyState
            title="All products are well stocked"
            message="When stock falls below the limit, alerts will appear here."
          />
        </Card>
      ) : (
        lowStock.map((p) => (
          <Pressable
            key={p.id}
            onPress={() =>
              router.push({ pathname: "/edit-product", params: { id: p.id } })
            }
          >
            <Card style={styles.alertCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.alertName}>{p.name}</Text>
                <Text style={styles.alertSub}>Limit: {p.low_stock_limit}</Text>
              </View>
              <View style={styles.alertBadge}>
                <Text style={styles.alertStock}>
                  {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                </Text>
              </View>
            </Card>
          </Pressable>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  heading: { fontSize: 28, fontWeight: "bold", color: colors.text },
  sub: { color: colors.muted, marginTop: 2, marginBottom: spacing.lg },
  error: { color: colors.danger, marginBottom: spacing.md },
  heroCard: { marginBottom: spacing.md },
  row: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.md },
  half: { flex: 1 },
  label: { fontSize: 14, color: colors.muted },
  heroValue: { fontSize: 32, fontWeight: "bold", color: colors.primary, marginTop: 4 },
  value: { fontSize: 28, fontWeight: "bold", color: colors.primary, marginTop: 4 },
  warning: { color: colors.danger },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  alertCard: {
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
  },
  alertName: { fontSize: 16, fontWeight: "600", color: colors.text },
  alertSub: { color: colors.muted, marginTop: 2 },
  alertBadge: {
    backgroundColor: colors.dangerSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  alertStock: { fontWeight: "700", color: colors.danger },
});
