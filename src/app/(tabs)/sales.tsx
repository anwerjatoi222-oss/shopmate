import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../../constants/theme";
import { supabase } from "../../lib/supabase";
import { Sale } from "../../types/sales";

export default function Sales() {
  const router = useRouter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const { data, error } = await supabase
          .from("sales")
          .select("id, total, created_at")
          .order("created_at", { ascending: false })
          .limit(50);
        if (error) console.log("Sales error:", error.message);
        else setSales(data as Sale[]);
        setLoading(false);
      };
      load();
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Sales</Text>
        <Pressable style={styles.addBtn} onPress={() => router.push("/new-sale")}>
          <Text style={styles.addBtnText}>+ Naya sale</Text>
        </Pressable>
      </View>

      {loading && <ActivityIndicator size="large" color={colors.primary} />}

      <FlatList
        data={sales}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>Abhi koi sale nahi</Text> : undefined
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.date}>
              {new Date(item.created_at).toLocaleString()}
            </Text>
            <Text style={styles.total}>Rs. {item.total}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, paddingTop: 56 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md },
  heading: { fontSize: 28, fontWeight: "bold", color: colors.text },
  addBtn: { backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.sm },
  addBtnText: { color: "#fff", fontWeight: "600" },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: { color: colors.muted, flex: 1 },
  total: { fontWeight: "bold", fontSize: 16, color: colors.primary },
  empty: { textAlign: "center", color: colors.muted, marginTop: 24 },
});