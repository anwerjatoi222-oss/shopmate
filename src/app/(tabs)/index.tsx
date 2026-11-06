import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
export default function Index() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Todays Sale</Text>
        <Text style={styles.cardValue}>Rs. 12,500</Text>
      </View>

      <View style={styles.row}>
        <View style={[styles.card, styles.half]}>
          <Text style={styles.cardLabel}>Products</Text>
          <Text style={styles.cardValue}>48</Text>
        </View>
        <Pressable
          style={[styles.card, styles.half]}
          onPress={() => router.navigate("/products")}
        >
          <Text style={styles.cardLabel}>Low stock</Text>
          <Text style={[styles.cardValue, styles.warning]}>5</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 16,
    paddingTop: 64,
  },
  row: { flexDirection: "row", gap: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },

  half: { flex: 1 },
  cardLabel: { fontSize: 14, color: "#6b7280" },
  cardValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#16a34a",
    marginTop: 4,
  },
  warning: { color: "#dc2626" },
  button: {
    backgroundColor: "#16a34a",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
});
