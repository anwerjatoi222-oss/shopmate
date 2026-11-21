import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text } from "react-native";
import { AppButton } from "../components/AppButton";
import { FormField } from "../components/FormField";
import { Screen } from "../components/Screen";
import { colors, spacing } from "../constants/theme";
import { supabase } from "../lib/supabase";

type FormState = {
  name: string;
  price: string;
  stock: string;
  lowStockLimit: string;
};
type FormErrors = Partial<Record<keyof FormState, string>>;

export default function AddProduct() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    name: "",
    price: "",
    stock: "",
    lowStockLimit: "5",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const update = (key: keyof FormState) => (text: string) =>
    setForm((prev) => ({ ...prev, [key]: text }));

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = "Product ka naam zaroori hai";

    const price = Number(form.price);
    if (!form.price.trim() || isNaN(price) || price <= 0)
      e.price = "Sahi price likho (0 se zyada)";

    const stock = Number(form.stock);
    if (!form.stock.trim() || !Number.isInteger(stock) || stock < 0)
      e.stock = "Stock poora number ho (0 ya zyada)";

    const limit = Number(form.lowStockLimit);
    if (!form.lowStockLimit.trim() || !Number.isInteger(limit) || limit < 0)
      e.lowStockLimit = "Low stock limit poora number ho";

    return e;
  };

  const handleSave = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSaving(true);
    const { error } = await supabase.from("products").insert({
      name: form.name.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      low_stock_limit: Number(form.lowStockLimit),
    });
    setSaving(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    Alert.alert("Saved", `${form.name.trim()} add ho gaya`, [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <Screen scroll>
      <Pressable onPress={() => router.back()} hitSlop={8}>
        <Text style={styles.back}>← Wapas</Text>
      </Pressable>
      <Text style={styles.heading}>Naya Product</Text>
      <Text style={styles.sub}>Product ki details darj karein</Text>

      <FormField
        label="Naam"
        value={form.name}
        onChangeText={update("name")}
        error={errors.name}
        placeholder="e.g. Atta (5 kg)"
      />
      <FormField
        label="Price (Rs.)"
        value={form.price}
        onChangeText={update("price")}
        error={errors.price}
        placeholder="e.g. 1200"
        keyboardType="numeric"
      />
      <FormField
        label="Stock (miqdar)"
        value={form.stock}
        onChangeText={update("stock")}
        error={errors.stock}
        placeholder="e.g. 20"
        keyboardType="numeric"
      />
      <FormField
        label="Low stock limit"
        value={form.lowStockLimit}
        onChangeText={update("lowStockLimit")}
        error={errors.lowStockLimit}
        keyboardType="numeric"
      />

      <AppButton
        title={saving ? "Save ho raha hai..." : "Save karo"}
        onPress={handleSave}
        disabled={saving}
        style={styles.button}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { color: colors.primary, fontSize: 16, marginBottom: spacing.sm },
  heading: { fontSize: 28, fontWeight: "bold", color: colors.text },
  sub: { color: colors.muted, marginTop: 2, marginBottom: spacing.lg },
  button: { marginTop: spacing.sm },
});
