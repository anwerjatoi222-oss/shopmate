import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../../components/AppButton";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { Screen } from "../../components/Screen";
import { colors, spacing } from "../../constants/theme";
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
    <Screen>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.heading}>Sales</Text>
          <Text style={styles.sub}>Recent sales history</Text>
        </View>
        <AppButton
          title="+ Naya sale"
          onPress={() => router.push("/new-sale")}
          style={styles.addBtn}
        />
      </View>

      {loading ? <ActivityIndicator size="large" color={colors.primary} /> : null}

      <FlatList
        data={sales}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading ? (
            <EmptyState title="Abhi koi sale nahi" message="Pehla sale record karein" />
          ) : undefined
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: "/sale-detail", params: { id: item.id } })}
          >
            <Card style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.date}>
                  {new Date(item.created_at).toLocaleString()}
                </Text>
                <Text style={styles.hint}>Details dekhne ke liye tap karein</Text>
              </View>
              <Text style={styles.total}>Rs. {Number(item.total).toLocaleString()}</Text>
            </Card>
          </Pressable>
        )}
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
  addBtn: { paddingVertical: 10, paddingHorizontal: 14 },
  listContent: { paddingBottom: spacing.xl },
  card: { marginBottom: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  date: { color: colors.text, fontWeight: "500" },
  hint: { color: colors.muted, fontSize: 12, marginTop: 2 },
  total: { fontWeight: "bold", fontSize: 16, color: colors.primary },
});
