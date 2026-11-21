import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { AppButton } from "../../components/AppButton";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { Screen } from "../../components/Screen";
import { colors, radius, spacing } from "../../constants/theme";
import { supabase } from "../../lib/supabase";
import { Product } from "../../types/product";

export default function Products() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("name");
        if (error) console.log("Supabase error:", error.message);
        else setProducts(data as Product[]);
        setLoading(false);
      };
      load();
    }, []),
  );

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Screen>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.heading}>Products</Text>
          <Text style={styles.sub}>Manage your inventory</Text>
        </View>
        <AppButton
          title="Add"
          onPress={() => router.push("/add-product")}
          style={styles.addBtn}
        />
      </View>

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
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              title="No products found"
              message={search ? "Try a different search." : "Add your first product to get started."}
            />
          ) : undefined
        }
        renderItem={({ item }) => {
          const isLow = item.stock <= item.low_stock_limit;
          return (
            <Pressable
              onPress={() =>
                router.push({ pathname: "/product-detail", params: { id: item.id } })
              }
            >
              <Card style={styles.card}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.price}>Rs. {Number(item.price).toLocaleString()}</Text>
                </View>
                <View style={styles.stockWrap}>
                  <Text style={[styles.stock, isLow && styles.low]}>
                    {item.stock === 0 ? "Out of stock" : `Stock: ${item.stock}`}
                  </Text>
                  {isLow ? <Text style={styles.lowLabel}>Low stock</Text> : null}
                </View>
              </Card>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  heading: { fontSize: 28, fontWeight: "bold", color: colors.text },
  sub: { color: colors.muted, marginTop: 2 },
  addBtn: { paddingVertical: 10, paddingHorizontal: 16 },
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
  listContent: { paddingBottom: spacing.xl },
  card: {
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: { fontSize: 16, fontWeight: "600", color: colors.text },
  price: { color: colors.muted, marginTop: 2 },
  stockWrap: { alignItems: "flex-end" },
  stock: { fontWeight: "600", color: colors.primary },
  low: { color: colors.danger },
  lowLabel: { color: colors.danger, fontSize: 12, marginTop: 2 },
});
