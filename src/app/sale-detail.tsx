import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
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
  const [error, setError] = useState<string | null>(() =>
    id ? null : "Sale ID nahi mili",
  );

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

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    setRefresh((r) => r + 1);
  }, []);

  const itemCount = items.length;
  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Sale detail load ho rahi hai...</Text>
      </View>
    );
  }

  if (error || !sale) {
    return (
      <View style={styles.container}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.back}>← Wapas</Text>
        </Pressable>
        <Text style={styles.heading}>Sale Detail</Text>
        <View style={styles.stateCard}>
          <Text style={styles.errorTitle}>Detail load nahi hui</Text>
          <Text style={styles.errorText}>{error ?? "Sale nahi mili"}</Text>
          <Pressable style={styles.retryBtn} onPress={load}>
            <Text style={styles.retryText}>Dobara try karo</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} hitSlop={8}>
        <Text style={styles.back}>← Wapas</Text>
      </Pressable>
      <Text style={styles.heading}>Sale Detail</Text>

      <View style={styles.summaryCard}>
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
      </View>

      <Text style={styles.sectionTitle}>Items</Text>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <View style={styles.stateCard}>
            <Text style={styles.emptyTitle}>Koi item nahi mila</Text>
            <Text style={styles.emptyText}>Is sale ke liye items record maujood nahi hain.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const lineTotal = Number(item.unit_price) * item.quantity;
          return (
            <View style={styles.itemCard}>
              <View style={{ flex: 1, paddingRight: spacing.md }}>
                <Text style={styles.itemName}>{item.product_name}</Text>
                <Text style={styles.itemSub}>
                  {item.quantity} x {formatRs(item.unit_price)}
                </Text>
              </View>
              <Text style={styles.itemTotal}>{formatRs(lineTotal)}</Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  loadingText: { marginTop: spacing.md, color: colors.muted },
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, paddingTop: 56 },
  back: { color: colors.primary, fontSize: 16, marginBottom: spacing.sm },
  heading: { fontSize: 28, fontWeight: "bold", color: colors.text, marginBottom: spacing.md },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
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
  itemCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  itemName: { fontSize: 16, fontWeight: "600", color: colors.text },
  itemSub: { color: colors.muted, marginTop: 2 },
  itemTotal: { fontWeight: "bold", color: colors.text },
  stateCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.xl,
    alignItems: "center",
  },
  errorTitle: { fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: spacing.sm },
  errorText: { color: colors.danger, textAlign: "center" },
  retryBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
  },
  retryText: { color: "#fff", fontWeight: "600" },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: colors.text, marginBottom: 4 },
  emptyText: { color: colors.muted, textAlign: "center" },
});
