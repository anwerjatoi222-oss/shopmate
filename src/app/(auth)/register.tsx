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
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.title}>Naya Account</Text>
        <Text style={styles.sub}>Apni dukaan ka digital record shuru karein</Text>
      </View>

      <FormField label="Aapka naam" value={fullName} onChangeText={setFullName} placeholder="Aapka naam" />
      <FormField label="Dukaan ka naam" value={shopName} onChangeText={setShopName} placeholder="Dukaan ka naam" />
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
        placeholder="Kam az kam 6 characters"
        secureTextEntry
      />

      <AppButton
        title={busy ? "Ruko..." : "Register karo"}
        onPress={handleRegister}
        disabled={busy}
      />

      <Link href="/login" style={styles.link}>
        Pehle se account hai? Login karo
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: "center", paddingBottom: spacing.xl },
  hero: { marginBottom: spacing.xl, alignItems: "center" },
  title: { fontSize: 32, fontWeight: "bold", color: colors.text },
  sub: { color: colors.muted, marginTop: spacing.xs, fontSize: 15, textAlign: "center" },
  link: { color: colors.primary, textAlign: "center", marginTop: spacing.lg, fontSize: 15, fontWeight: "500" },
});
