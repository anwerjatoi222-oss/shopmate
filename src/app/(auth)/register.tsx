import { Link } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../../components/AppButton";
import { FormField } from "../../components/FormField";
import { Screen } from "../../components/Screen";
import { colors, spacing } from "../../constants/theme";
import { supabase } from "../../lib/supabase";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const handleRegister = async () => {
    if (!fullName.trim() || !shopName.trim() || !email.trim()) {
      return Alert.alert("Missing information", "Please fill in all fields.");
    }
    if (password.length < 6) {
      return Alert.alert("Weak password", "Password must be at least 6 characters.");
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
    if (error) Alert.alert("Registration failed", error.message);
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.sub}>Set up your shop and start tracking sales</Text>
      </View>

      <FormField label="Full name" value={fullName} onChangeText={setFullName} placeholder="Your name" />
      <FormField label="Shop name" value={shopName} onChangeText={setShopName} placeholder="Your shop name" />
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
        placeholder="At least 6 characters"
        secureTextEntry
      />

      <AppButton
        title={busy ? "Creating account..." : "Create account"}
        onPress={handleRegister}
        disabled={busy}
      />

      <Link href="/login" style={styles.link}>
        Already have an account? Sign in
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: "center", paddingBottom: spacing.xl },
  hero: { marginBottom: spacing.xl, alignItems: "center" },
  title: { fontSize: 32, fontWeight: "bold", color: colors.text },
  sub: { color: colors.muted, marginTop: spacing.xs, fontSize: 15, textAlign: "center" },
  link: {
    color: colors.primary,
    textAlign: "center",
    marginTop: spacing.lg,
    fontSize: 15,
    fontWeight: "500",
  },
});
