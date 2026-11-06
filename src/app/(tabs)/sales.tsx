import { StyleSheet, Text, View } from "react-native";

export default function Sales() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Sales</Text>
      <Text style={styles.sub}>Sales recording jald aa rahi hai</Text>
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
