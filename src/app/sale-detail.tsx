import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AppButton } from "../components/AppButton";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { Screen } from "../components/Screen";
import { colors, radius, spacing } from "../constants/theme";
import { supabase } from "../lib/supabase";

type Sale = {
  id: string;
  total: number;
  created_at: string;
};

type SaleItem = {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
};

function formatRs(value: number) {
  return `Rs. ${Number(value).toLocaleString()}`;
}

export default function SaleDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [sale, setSale] = useState<Sale | null>(null);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(() => Boolean(id));
  const [error, setError] = useState<string | null>(() => (id ? null : "Sale ID nahi mili"));
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (!id) return;

      const [saleRes, itemsRes] = await Promise.all([
        supabase.from("sales").select("id, total, created_at").eq("id", id).single(),
        supabase
          .from("sale_items")
          .select("id, product_name, quantity, unit_price")
          .eq("sale_id", id)
          .order("product_name"),
      ]);

      if (!mounted) return;

      if (saleRes.error) {
        setError(saleRes.error.message);
        setSale(null);
        setItems([]);
        setLoading(false);
        return;
      }

      if (itemsRes.error) {
        setError(itemsRes.error.message);
        setSale(saleRes.data as Sale);
        setItems([]);
        setLoading(false);
        return;
      }

      setSale(saleRes.data as Sale);
      setItems((itemsRes.data ?? []) as SaleItem[]);
      setLoading(false);
    };

    void run();
    return () => {
      mounted = false;
    };
  }, [id, refresh]);

  const retry = () => {
    setLoading(true);
    setError(null);
    setRefresh((r) => r + 1);
  };

  const itemCount = items.length;
  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Sale detail load ho rahi hai...</Text>
        </View>
      </Screen>
    );
  }

  if (error || !sale) {
    return (
      <Screen>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.back}>← Wapas</Text>
        </Pressable>
        <Text style={styles.heading}>Sale Detail</Text>
        <Card style={styles.stateCard}>
          <Text style={styles.errorTitle}>Detail load nahi hui</Text>
          <Text style={styles.errorText}>{error ?? "Sale nahi mili"}</Text>
          <AppButton title="Dobara try karo" onPress={retry} style={styles.retryBtn} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <Pressable onPress={() => router.back()} hitSlop={8}>
        <Text style={styles.back}>← Wapas</Text>
      </Pressable>
      <Text style={styles.heading}>Sale Detail</Text>

      <Card style={styles.summaryCard}>
        <Text style={styles.date}>{new Date(sale.created_at).toLocaleString()}</Text>
        <Text style={styles.total}>{formatRs(sale.total)}</Text>

        <View style={styles.summaryRow}>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryLabel}>Items</Text>
            <Text style={styles.summaryValue}>{itemCount}</Text>
          </View>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryLabel}>Quantity</Text>
            <Text style={styles.summaryValue}>{totalQty}</Text>
          </View>
        </View>
      </Card>

      <Text style={styles.sectionTitle}>Items</Text>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        ListEmptyComponent={
          <Card>
            <EmptyState
              title="Koi item nahi mila"
              message="Is sale ke liye items record maujood nahi hain."
            />
          </Card>
        }
        renderItem={({ item }) => {
          const lineTotal = Number(item.unit_price) * item.quantity;
          return (
            <Card style={styles.itemCard}>
              <View style={{ flex: 1, paddingRight: spacing.md }}>
                <Text style={styles.itemName}>{item.product_name}</Text>
                <Text style={styles.itemSub}>
                  {item.quantity} x {formatRs(item.unit_price)}
                </Text>
              </View>
              <Text style={styles.itemTotal}>{formatRs(lineTotal)}</Text>
            </Card>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: spacing.md, color: colors.muted },
  back: { color: colors.primary, fontSize: 16, marginBottom: spacing.sm },
  heading: { fontSize: 28, fontWeight: "bold", color: colors.text, marginBottom: spacing.md },
  summaryCard: { marginBottom: spacing.lg },
  date: { color: colors.muted, marginBottom: 4 },
  total: { fontSize: 30, fontWeight: "bold", color: colors.primary },
  summaryRow: { flexDirection: "row", gap: spacing.md, marginTop: spacing.lg },
  summaryPill: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  summaryLabel: { color: colors.muted, fontSize: 13 },
  summaryValue: { color: colors.text, fontSize: 18, fontWeight: "700", marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: colors.text, marginBottom: spacing.md },
  itemCard: { marginBottom: 10, flexDirection: "row", alignItems: "center" },
  itemName: { fontSize: 16, fontWeight: "600", color: colors.text },
  itemSub: { color: colors.muted, marginTop: 2 },
  itemTotal: { fontWeight: "bold", color: colors.text },
  stateCard: { alignItems: "center", paddingVertical: spacing.xl },
  errorTitle: { fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: spacing.sm },
  errorText: { color: colors.danger, textAlign: "center" },
  retryBtn: { marginTop: spacing.lg, alignSelf: "stretch" },
});
