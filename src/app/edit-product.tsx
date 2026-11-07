import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
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
  }, [id]);

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
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>← Wapas</Text>
      </Pressable>
      <Text style={styles.heading}>Product Edit</Text>

      <Text style={styles.label}>Naam</Text>
      <TextInput style={styles.input} value={form.name} onChangeText={set("name")} />

      <Text style={styles.label}>Price (Rs.)</Text>
      <TextInput style={styles.input} value={form.price} onChangeText={set("price")} keyboardType="numeric" />

      <Text style={styles.label}>Stock</Text>
      <TextInput style={styles.input} value={form.stock} onChangeText={set("stock")} keyboardType="numeric" />

      <Text style={styles.label}>Low stock limit</Text>
      <TextInput style={styles.input} value={form.low} onChangeText={set("low")} keyboardType="numeric" />

      <Pressable
        style={[styles.button, saving && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.buttonText}>{saving ? "Save ho raha hai..." : "Update karo"}</Text>
      </Pressable>

      <Pressable style={styles.deleteBtn} onPress={handleDelete}>
        <Text style={styles.deleteText}>Product delete karo</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, backgroundColor: "#f3f4f6", padding: 16, paddingTop: 56 },
  back: { color: "#16a34a", fontSize: 16, marginBottom: 8 },
  heading: { fontSize: 28, fontWeight: "bold", marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 6 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 14,
  },
  button: { backgroundColor: "#16a34a", padding: 14, borderRadius: 10, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  deleteBtn: { padding: 14, borderRadius: 10, alignItems: "center", marginTop: 12, borderWidth: 1, borderColor: "#dc2626" },
  deleteText: { color: "#dc2626", fontSize: 16, fontWeight: "600" },
});