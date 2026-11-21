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

export default function SaleDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [sale, setSale] = useState<Sale | null>(null);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setError("Sale ID nahi mili");
        setLoading(false);
        return;
      }

      const [saleRes, itemsRes] = await Promise.all([
        supabase
          .from("sales")
          .select("id, total, created_at")
          .eq("id", id)
          .single(),
        supabase
          .from("sale_items")
          .select("id, product_name, quantity, unit_price")
          .eq("sale_id", id)
          .order("product_name"),
      ]);

      if (saleRes.error) {
        setError(saleRes.error.message);
        setLoading(false);
        return;
      }

      if (itemsRes.error) {
        setError(itemsRes.error.message);
        setLoading(false);
        return;
      }

      setSale(saleRes.data as Sale);
      setItems((itemsRes.data ?? []) as SaleItem[]);
      setLoading(false);
    };

    load();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !sale) {
    return (
      <View style={styles.container}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Wapas</Text>
        </Pressable>
        <Text style={styles.heading}>Sale Detail</Text>
        <Text style={styles.error}>{error ?? "Sale nahi mili"}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>← Wapas</Text>
      </Pressable>
      <Text style={styles.heading}>Sale Detail</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.date}>{new Date(sale.created_at).toLocaleString()}</Text>
        <Text style={styles.total}>Rs. {Number(sale.total).toLocaleString()}</Text>
      </View>

      <Text style={styles.sectionTitle}>Items</Text>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={<Text style={styles.empty}>Is sale mein koi item nahi mila</Text>}
        renderItem={({ item }) => {
          const lineTotal = Number(item.unit_price) * item.quantity;
          return (
            <View style={styles.itemCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.product_name}</Text>
                <Text style={styles.itemSub}>
                  {item.quantity} x Rs. {Number(item.unit_price).toLocaleString()}
                </Text>
              </View>
              <Text style={styles.itemTotal}>Rs. {lineTotal.toLocaleString()}</Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background },
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
  total: { fontSize: 28, fontWeight: "bold", color: colors.primary },
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
  empty: { textAlign: "center", color: colors.muted, marginTop: 24 },
  error: { color: colors.danger, marginTop: spacing.md },
});
