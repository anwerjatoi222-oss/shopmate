import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../constants/theme";

type Props = {
  title: string;
  message?: string;
};

export function EmptyState({ title, message }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", paddingVertical: spacing.xl, paddingHorizontal: spacing.lg },
  title: { fontSize: 16, fontWeight: "600", color: colors.text, textAlign: "center" },
  message: { marginTop: spacing.xs, color: colors.muted, textAlign: "center" },
});
