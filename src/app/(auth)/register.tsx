import { Link } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import { supabase } from "../../lib/supabase";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const handleRegister = async () => {
    if (!fullName.trim() || !shopName.trim() || !email.trim()) {
      return Alert.alert("Galat data", "Saari fields bharo");
    }
    if (password.length < 6) {
      return Alert.alert("Galat data", "Password kam az kam 6 characters ka ho");
    }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim(), shop_name: shopName.trim() },
      },
    });
    setBusy(false);
    if (error) Alert.alert("Register nahi hua", error.message);
    // Kamyab hone par session ban jata hai aur app khud tabs par chali jati hai
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f3f4f6" }}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Naya Account</Text>

      <TextInput style={styles.input} placeholder="Aapka naam" value={fullName} onChangeText={setFullName} />
      <TextInput style={styles.input} placeholder="Dukaan ka naam" value={shopName} onChangeText={setShopName} />
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password (6+ characters)"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable
        style={[styles.button, busy && { opacity: 0.6 }]}
        onPress={handleRegister}
        disabled={busy}
      >
        <Text style={styles.buttonText}>{busy ? "Ruko..." : "Register karo"}</Text>
      </Pressable>

      <Link href="/login" style={styles.link}>
        Pehle se account hai? Login karo
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", padding: 24 },
  title: { fontSize: 30, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
  },
  button: { backgroundColor: "#16a34a", padding: 14, borderRadius: 10, alignItems: "center", marginTop: 4 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  link: { color: "#16a34a", textAlign: "center", marginTop: 20, fontSize: 15 },
});