import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { AppButton } from "../components/AppButton";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { Screen } from "../components/Screen";
import { colors, radius, spacing } from "../constants/theme";
import { supabase } from "../lib/supabase";
import { Product } from "../types/product";

export default function NewSale() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .gt("stock", 0)
        .order("name");
      if (error) Alert.alert("Error", error.message);
      else setProducts(data as Product[]);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const change = (p: Product, delta: number) => {
    setCart((prev) => {
      const next = Math.max(0, Math.min(p.stock, (prev[p.id] ?? 0) + delta));
      const copy = { ...prev };
      if (next === 0) delete copy[p.id];
      else copy[p.id] = next;
      return copy;
    });
  };

  const total = useMemo(
    () => products.reduce((sum, p) => sum + p.price * (cart[p.id] ?? 0), 0),
    [products, cart]
  );
  const itemCount = Object.keys(cart).length;

  const handleSave = async () => {
    if (itemCount === 0) return Alert.alert("Empty cart", "Select at least one product.");
    setSaving(true);
    const items = Object.entries(cart).map(([product_id, quantity]) => ({
      product_id,
      quantity,
    }));
    const { error } = await supabase.rpc("create_sale", { items });
    setSaving(false);
    if (error) return Alert.alert("Sale failed", error.message);
    Alert.alert("Sale recorded", `Total: Rs. ${total.toLocaleString()}`, [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <Screen contentStyle={styles.screenContent}>
      <Pressable onPress={() => router.back()} hitSlop={8}>
        <Text style={styles.back}>← Back</Text>
      </Pressable>
      <Text style={styles.heading}>New Sale</Text>
      <Text style={styles.sub}>Select products and set quantities</Text>

      <TextInput
        style={styles.input}
        placeholder="Search products..."
        placeholderTextColor={colors.muted}
        value={search}
        onChangeText={setSearch}
      />

      {loading ? <ActivityIndicator size="large" color={colors.primary} /> : null}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              title="No products available"
              message="Products with stock will appear here."
            />
          ) : undefined
        }
        renderItem={({ item }) => {
          const qty = cart[item.id] ?? 0;
          return (
            <Card style={[styles.card, qty > 0 && styles.cardSelected]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>
                  Rs. {Number(item.price).toLocaleString()} · Stock: {item.stock}
                </Text>
              </View>
              <View style={styles.stepper}>
                <Pressable style={styles.stepBtn} onPress={() => change(item, -1)} hitSlop={4}>
                  <Text style={styles.stepText}>−</Text>
                </Pressable>
                <Text style={styles.qty}>{qty}</Text>
                <Pressable style={styles.stepBtn} onPress={() => change(item, 1)} hitSlop={4}>
                  <Text style={styles.stepText}>+</Text>
                </Pressable>
              </View>
            </Card>
          );
        }}
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalText}>Rs. {total.toLocaleString()}</Text>
        </View>
        <AppButton
          title={saving ? "Saving..." : `Save sale (${itemCount})`}
          onPress={handleSave}
          disabled={saving || itemCount === 0}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: { paddingBottom: 0 },
  back: { color: colors.primary, fontSize: 16, marginBottom: spacing.sm },
  heading: { fontSize: 28, fontWeight: "bold", color: colors.text },
  sub: { color: colors.muted, marginTop: 2, marginBottom: spacing.md },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.md,
    fontSize: 16,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
  },
  listContent: { paddingBottom: spacing.md },
  card: { marginBottom: 10, flexDirection: "row", alignItems: "center" },
  cardSelected: { borderColor: colors.primary, backgroundColor: "#F0FDF4" },
  name: { fontSize: 16, fontWeight: "600", color: colors.text },
  meta: { color: colors.muted, marginTop: 2 },
  stepper: { flexDirection: "row", alignItems: "center", gap: 10 },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepText: { fontSize: 20, fontWeight: "bold", color: colors.primary, lineHeight: 22 },
  qty: { minWidth: 24, textAlign: "center", fontSize: 16, fontWeight: "600", color: colors.text },
  footer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.md },
  totalLabel: { fontSize: 16, color: colors.muted },
  totalText: { fontSize: 22, fontWeight: "bold", color: colors.text },
});
