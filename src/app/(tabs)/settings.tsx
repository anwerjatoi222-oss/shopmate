import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../../components/AppButton";
import { Card } from "../../components/Card";
import { Screen } from "../../components/Screen";
import { colors, spacing } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

export default function Settings() {
  const router = useRouter();
  const { session } = useAuth();

  return (
    <Screen>
      <Text style={styles.heading}>Settings</Text>
      <Text style={styles.sub}>Manage your account</Text>

      <Card style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{session?.user.email ?? "-"}</Text>
      </Card>

      <AppButton
        title="Edit profile"
        onPress={() => router.push("/settings-edit")}
        style={styles.editBtn}
      />

      <View style={styles.footer}>
        <AppButton
          title="Log out"
          variant="outline"
          onPress={() => supabase.auth.signOut()}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 28, fontWeight: "bold", color: colors.text },
  sub: { color: colors.muted, marginTop: spacing.xs, marginBottom: spacing.lg },
  card: { marginBottom: spacing.lg },
  label: { fontSize: 13, color: colors.muted, marginBottom: 4 },
  value: { fontSize: 16, color: colors.text, fontWeight: "500" },
  footer: { marginTop: "auto", paddingBottom: spacing.lg },
  editBtn: { alignSelf: "stretch", marginTop: spacing.md },
});
