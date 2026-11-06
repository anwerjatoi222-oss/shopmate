import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  KeyboardTypeOptions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type FormState = {
  name: string;
  price: string;
  stock: string;
  lowStockLimit: string;
};
type FormErrors = Partial<Record<keyof FormState, string>>;

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
};

function Field({ label, value, onChangeText, error, placeholder, keyboardType }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export default function AddProduct() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    name: "",
    price: "",
    stock: "",
    lowStockLimit: "5",
  });
  const [errors, setErrors] = useState<FormErrors>({});

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

  const handleSave = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const newProduct = {
      name: form.name.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      lowStockLimit: Number(form.lowStockLimit),
    };
    console.log("New product:", newProduct);

    Alert.alert("Saved", `${newProduct.name} add ho gaya`, [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Wapas</Text>
        </Pressable>
        <Text style={styles.heading}>Naya Product</Text>

        <Field
          label="Naam"
          value={form.name}
          onChangeText={update("name")}
          error={errors.name}
          placeholder="e.g. Atta (5 kg)"
        />
        <Field
          label="Price (Rs.)"
          value={form.price}
          onChangeText={update("price")}
          error={errors.price}
          placeholder="e.g. 1200"
          keyboardType="numeric"
        />
        <Field
          label="Stock (miqdar)"
          value={form.stock}
          onChangeText={update("stock")}
          error={errors.stock}
          placeholder="e.g. 20"
          keyboardType="numeric"
        />
        <Field
          label="Low stock limit"
          value={form.lowStockLimit}
          onChangeText={update("lowStockLimit")}
          error={errors.lowStockLimit}
          keyboardType="numeric"
        />

        <Pressable style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Save karo</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6", padding: 16, paddingTop: 56 },
  back: { color: "#16a34a", fontSize: 16, marginBottom: 8 },
  heading: { fontSize: 28, fontWeight: "bold", marginBottom: 16 },
  field: { marginBottom: 14 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6, color: "#374151" },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  inputError: { borderColor: "#dc2626" },
  error: { color: "#dc2626", fontSize: 12, marginTop: 4 },
  button: {
    backgroundColor: "#16a34a",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});