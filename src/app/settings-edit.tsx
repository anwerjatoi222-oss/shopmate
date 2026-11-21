import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { FormField } from "../components/FormField";
import { Screen } from "../components/Screen";
import { colors, spacing } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

export default function SettingsEdit() {
  const router = useRouter();
  const { session } = useAuth();
  const [fullName, setFullName] = useState("");
  const [shopName, setShopName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!session?.user) {
        setLoading(false);
        return;
      }

      const [profileRes, shopRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", session.user.id).single(),
        supabase.from("shops").select("*").eq("owner_id", session.user.id).maybeSingle(),
      ]);

      if (profileRes.data) {
        setFullName(profileRes.data.full_name ?? "");
      }
      if (shopRes.data) {
        setShopName(shopRes.data.name);
      }

      setLoading(false);
    };
    void load();
  }, [session?.user]);

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  const handleSave = async () => {
    if (!session?.user) return;

    if (!fullName.trim() || !shopName.trim()) {
      return Alert.alert("Missing information", "Please fill in your name and shop name.");
    }

    if (newPassword && newPassword !== confirmPassword) {
      return Alert.alert("Password mismatch", "New password and confirm password do not match.");
    }
    if (newPassword && newPassword.length < 6) {
      return Alert.alert("Weak password", "Password must be at least 6 characters.");
    }

    setSaving(true);

    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ full_name: fullName.trim() })
        .eq("id", session.user.id);

      if (profileError) throw profileError;

      const { error: shopError } = await supabase
        .from("shops")
        .update({ name: shopName.trim() })
        .eq("owner_id", session.user.id);

      if (shopError) throw shopError;

      if (newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (passwordError) throw passwordError;
      }

      Alert.alert("Saved", "Your profile has been updated.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Update failed", error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll>
      <Pressable onPress={() => router.back()} hitSlop={8}>
        <Text style={styles.back}>← Back</Text>
      </Pressable>
      <Text style={styles.heading}>Edit Profile</Text>
      <Text style={styles.sub}>Update your account details</Text>

      <FormField
        label="Full name"
        value={fullName}
        onChangeText={setFullName}
        placeholder="Your name"
      />
      <FormField
        label="Shop name"
        value={shopName}
        onChangeText={setShopName}
        placeholder="Your shop name"
      />
      <FormField
        label="New password"
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="Leave blank to keep current"
        secureTextEntry
      />
      <FormField
        label="Confirm new password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Re-enter new password"
        secureTextEntry
      />

      <AppButton
        title={saving ? "Saving..." : "Save changes"}
        onPress={handleSave}
        disabled={saving}
        style={styles.button}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  back: { color: colors.primary, fontSize: 16, marginBottom: spacing.sm },
  heading: { fontSize: 28, fontWeight: "bold", color: colors.text, marginBottom: spacing.md },
  sub: { color: colors.muted, marginTop: 2, marginBottom: spacing.lg },
  button: { marginTop: spacing.sm },
});
