import { Link } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { supabase } from "../../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      return Alert.alert("Galat data", "Email aur password likho");
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (error) Alert.alert("Login nahi hua", error.message);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ShopMate</Text>
      <Text style={styles.sub}>Apne account mein login karo</Text>

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
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable
        style={[styles.button, busy && { opacity: 0.6 }]}
        onPress={handleLogin}
        disabled={busy}
      >
        <Text style={styles.buttonText}>{busy ? "Ruko..." : "Login"}</Text>
      </Pressable>

      <Link href="/register" style={styles.link}>
        Naya account banao
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#f3f4f6" },
  title: { fontSize: 36, fontWeight: "bold", color: "#16a34a", textAlign: "center" },
  sub: { color: "#6b7280", textAlign: "center", marginBottom: 24, marginTop: 4 },
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