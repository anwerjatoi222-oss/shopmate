import { Link } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../../components/AppButton";
import { FormField } from "../../components/FormField";
import { Screen } from "../../components/Screen";
import { colors, spacing } from "../../constants/theme";
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
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.title}>ShopMate</Text>
        <Text style={styles.sub}>Apne account mein login karo</Text>
      </View>

      <FormField
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <FormField
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Apna password"
        secureTextEntry
      />

      <AppButton
        title={busy ? "Ruko..." : "Login"}
        onPress={handleLogin}
        disabled={busy}
      />

      <Link href="/register" style={styles.link}>
        Naya account banao
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: "center", paddingBottom: spacing.xl },
  hero: { marginBottom: spacing.xl, alignItems: "center" },
  title: { fontSize: 36, fontWeight: "bold", color: colors.primary },
  sub: { color: colors.muted, marginTop: spacing.xs, fontSize: 15 },
  link: { color: colors.primary, textAlign: "center", marginTop: spacing.lg, fontSize: 15, fontWeight: "500" },
});
