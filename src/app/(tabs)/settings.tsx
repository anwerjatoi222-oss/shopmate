import { StyleSheet, Text, View } from "react-native";

export default function Settings() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Settings</Text>
      <Text style={styles.sub}>Profile aur shop settings yahan aayengi"</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 16,
    paddingTop: 56,
  },
  heading: { fontSize: 28, fontWeight: "bold" },
  sub: { color: "#6b7280", marginTop: 8 },
});
