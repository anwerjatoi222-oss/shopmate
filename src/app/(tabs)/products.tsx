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
  }, [])
);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Products</Text>
        <Pressable
          style={styles.addBtn}
          onPress={() => router.push("/add-product")}
        >
          <Text style={styles.addBtnText}>+ Add</Text>
        </Pressable>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Product search karo..."
        value={search}
        onChangeText={setSearch}
      />
      {loading && <ActivityIndicator size="large" color="#16a34a" />}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>Koi product nahi mila</Text>
        }
        renderItem={({ item }) => {
          const isLow = item.stock <= item.low_stock_limit;
          return (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>Rs. {item.price}</Text>
              </View>
              <Text style={[styles.stock, isLow && styles.low]}>
                Stock: {item.stock}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 16,
    paddingTop: 56,
  },
  heading: { fontSize: 28, fontWeight: "bold", marginBottom: 12 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  name: { fontSize: 16, fontWeight: "600" },
  price: { color: "#6b7280", marginTop: 2 },
  stock: { fontWeight: "600", color: "#16a34a" },
  low: { color: "#dc2626" },
  empty: { textAlign: "center", color: "#6b7280", marginTop: 24 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addBtn: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: { color: "#fff", fontWeight: "600" },
});
