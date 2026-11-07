import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

export default function Settings() {
  const { session } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Settings</Text>
      <Text style={styles.sub}>{session?.user.email}</Text>

      <Pressable style={styles.logout} onPress={() => supabase.auth.signOut()}>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6", padding: 16, paddingTop: 56 },
  heading: { fontSize: 28, fontWeight: "bold" },
  sub: { color: "#6b7280", marginTop: 8, marginBottom: 24 },
  logout: { padding: 14, borderRadius: 10, alignItems: "center", borderWidth: 1, borderColor: "#dc2626" },
  logoutText: { color: "#dc2626", fontSize: 16, fontWeight: "600" },
});