import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { Card } from "../components/Card";
import { Screen } from "../components/Screen";
import { colors, radius, spacing } from "../constants/theme";
import { supabase } from "../lib/supabase";
import { Product } from "../types/product";

export default function ProductDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(() => Boolean(id));
  const [error, setError] = useState<string | null>(() => (id ? null : "Product ID not found"));

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (!mounted) return;

      if (error || !data) {
        setError(error?.message ?? "Product not found");
        setProduct(null);
        setLoading(false);
        return;
      }

      setProduct(data as Product);
      setLoading(false);
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const retry = () => {
    setLoading(true);
    setError(null);
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      </Screen>
    );
  }

  if (error || !product) {
    return (
      <Screen>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Text style={styles.heading}>Product Details</Text>
        <Card style={styles.stateCard}>
          <Text style={styles.errorTitle}>Could not load details</Text>
          <Text style={styles.errorText}>{error ?? "Product not found"}</Text>
          <AppButton title="Try again" onPress={retry} style={styles.retryBtn} />
        </Card>
      </Screen>
    );
  }

  const isLow = product.stock <= product.low_stock_limit;

  return (
    <Screen>
      <Pressable onPress={() => router.back()} hitSlop={8}>
        <Text style={styles.back}>← Back</Text>
      </Pressable>
      <Text style={styles.heading}>Product Details</Text>

      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.info}>
            <Text style={styles.name}>{product.name}</Text>
            <Text style={styles.meta}>Stock: {product.stock}</Text>
            <Text style={styles.meta}>Low stock limit: {product.low_stock_limit}</Text>
            {isLow ? (
              <Text style={styles.lowLabel}>Low stock alert</Text>
            ) : null}
          </View>
          <View style={styles.priceWrap}>
            <Text style={styles.price}>Rs. {Number(product.price).toLocaleString()}</Text>
          </View>
        </View>
      </Card>

      <View style={styles.actions}>
        <AppButton
          title="Edit product"
          onPress={() =>
            router.push({ pathname: "/edit-product", params: { id: product.id } })
          }
          style={styles.editBtn}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: spacing.md, color: colors.muted },
  back: { color: colors.primary, fontSize: 16, marginBottom: spacing.sm },
  heading: { fontSize: 28, fontWeight: "bold", color: colors.text, marginBottom: spacing.md },
  card: { marginBottom: spacing.lg },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  info: { flex: 1 },
  name: { fontSize: 20, fontWeight: "700", color: colors.text },
  meta: { color: colors.muted, marginTop: 2 },
  priceWrap: { alignItems: "flex-end" },
  price: { fontSize: 24, fontWeight: "bold", color: colors.primary },
  lowLabel: { color: colors.danger, fontSize: 13, marginTop: 4 },
  actions: { paddingTop: spacing.md },
  editBtn: { alignSelf: "stretch" },
  stateCard: { alignItems: "center", paddingVertical: spacing.xl },
  errorTitle: { fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: spacing.sm },
  errorText: { color: colors.danger, textAlign: "center" },
  retryBtn: { marginTop: spacing.lg, alignSelf: "stretch" },
});
