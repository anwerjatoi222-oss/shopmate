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
    () =>
      products.reduce((sum, p) => sum + p.price * (cart[p.id] ?? 0), 0),
    [products, cart]
  );
  const itemCount = Object.keys(cart).length;

  const handleSave = async () => {
    if (itemCount === 0) return Alert.alert("Khali", "Pehle koi product chuno");
    setSaving(true);
    const items = Object.entries(cart).map(([product_id, quantity]) => ({
      product_id,
      quantity,
    }));
    const { error } = await supabase.rpc("create_sale", { items });
    setSaving(false);
    if (error) return Alert.alert("Sale nahi hui", error.message);
    Alert.alert("Sale ho gayi", `Total: Rs. ${total}`, [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>← Wapas</Text>
      </Pressable>
      <Text style={styles.heading}>Naya Sale</Text>

      <TextInput
        style={styles.input}
        placeholder="Product search karo..."
        value={search}
        onChangeText={setSearch}
      />

      {loading && <ActivityIndicator size="large" color={colors.primary} />}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>Koi product nahi (stock 0 ya khali)</Text> : undefined
        }
        renderItem={({ item }) => {
          const qty = cart[item.id] ?? 0;
          return (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.sub}>
                  Rs. {item.price} · Stock: {item.stock}
                </Text>
              </View>
              <View style={styles.stepper}>
                <Pressable style={styles.stepBtn} onPress={() => change(item, -1)}>
                  <Text style={styles.stepText}>−</Text>
                </Pressable>
                <Text style={styles.qty}>{qty}</Text>
                <Pressable style={styles.stepBtn} onPress={() => change(item, 1)}>
                  <Text style={styles.stepText}>+</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
      />

      <View style={styles.footer}>
        <Text style={styles.totalText}>Total: Rs. {total}</Text>
        <Pressable
          style={[styles.saveBtn, (saving || itemCount === 0) && { opacity: 0.5 }]}
          onPress={handleSave}
          disabled={saving || itemCount === 0}
        >
          <Text style={styles.saveText}>
            {saving ? "Ruko..." : `Sale save karo (${itemCount})`}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, paddingTop: 56 },
  back: { color: colors.primary, fontSize: 16, marginBottom: spacing.sm },
  heading: { fontSize: 28, fontWeight: "bold", color: colors.text, marginBottom: spacing.md },
  input: {
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    padding: spacing.md,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  name: { fontSize: 16, fontWeight: "600", color: colors.text },
  sub: { color: colors.muted, marginTop: 2 },
  stepper: { flexDirection: "row", alignItems: "center", gap: 10 },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: { fontSize: 20, fontWeight: "bold", color: colors.primary },
  qty: { minWidth: 20, textAlign: "center", fontSize: 16, fontWeight: "600" },
  empty: { textAlign: "center", color: colors.muted, marginTop: 24 },
  footer: { paddingTop: spacing.md, paddingBottom: spacing.lg },
  totalText: { fontSize: 20, fontWeight: "bold", color: colors.text, marginBottom: spacing.sm },
  saveBtn: { backgroundColor: colors.primary, padding: 14, borderRadius: radius.sm, alignItems: "center" },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});