import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { FormField } from "../components/FormField";
import { Screen } from "../components/Screen";
import { colors, spacing } from "../constants/theme";
import { supabase } from "../lib/supabase";

type Form = { name: string; price: string; stock: string; low: string };

export default function EditProduct() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [form, setForm] = useState<Form>({ name: "", price: "", stock: "", low: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      if (error || !data) {
        Alert.alert("Error", error?.message ?? "Product nahi mila");
        router.back();
        return;
      }
      setForm({
        name: data.name,
        price: String(data.price),
        stock: String(data.stock),
        low: String(data.low_stock_limit),
      });
      setLoading(false);
    };
    load();
  }, [id, router]);

  const set = (key: keyof Form) => (text: string) =>
    setForm((prev) => ({ ...prev, [key]: text }));

  const handleSave = async () => {
    const price = Number(form.price);
    const stock = Number(form.stock);
    const low = Number(form.low);
    if (!form.name.trim() || isNaN(price) || price <= 0)
      return Alert.alert("Galat data", "Naam aur sahi price zaroori hai");
    if (!Number.isInteger(stock) || stock < 0 || !Number.isInteger(low) || low < 0)
      return Alert.alert("Galat data", "Stock aur limit poore numbers hon");

    setSaving(true);
    const { error } = await supabase
      .from("products")
      .update({
        name: form.name.trim(),
        price,
        stock,
        low_stock_limit: low,
      })
      .eq("id", id);
    setSaving(false);

    if (error) return Alert.alert("Error", error.message);
    router.back();
  };

  const handleDelete = () => {
    Alert.alert("Delete karein?", `${form.name} hamesha ke liye hat jayega`, [
      { text: "Nahi", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.from("products").delete().eq("id", id);
          if (error) return Alert.alert("Error", error.message);
          router.back();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Pressable onPress={() => router.back()} hitSlop={8}>
        <Text style={styles.back}>← Wapas</Text>
      </Pressable>
      <Text style={styles.heading}>Product Edit</Text>
      <Text style={styles.sub}>Details update karein ya product delete karein</Text>

      <FormField label="Naam" value={form.name} onChangeText={set("name")} />
      <FormField label="Price (Rs.)" value={form.price} onChangeText={set("price")} keyboardType="numeric" />
      <FormField label="Stock" value={form.stock} onChangeText={set("stock")} keyboardType="numeric" />
      <FormField label="Low stock limit" value={form.low} onChangeText={set("low")} keyboardType="numeric" />

      <AppButton
        title={saving ? "Save ho raha hai..." : "Update karo"}
        onPress={handleSave}
        disabled={saving}
        style={styles.button}
      />
      <AppButton
        title="Product delete karo"
        variant="outline"
        onPress={handleDelete}
        style={styles.deleteBtn}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  back: { color: colors.primary, fontSize: 16, marginBottom: spacing.sm },
  heading: { fontSize: 28, fontWeight: "bold", color: colors.text },
  sub: { color: colors.muted, marginTop: 2, marginBottom: spacing.lg },
  button: { marginTop: spacing.sm },
  deleteBtn: { marginTop: spacing.md },
});
