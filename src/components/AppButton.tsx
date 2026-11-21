import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from "react-native";
import { colors, radius } from "../constants/theme";

type Variant = "primary" | "danger" | "outline" | "secondary";

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
};

export function AppButton({
  title,
  onPress,
  disabled = false,
  variant = "primary",
  style,
}: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, textStyles[variant]]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.55 },
  text: { fontSize: 16, fontWeight: "600" },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: colors.primary },
  danger: { backgroundColor: colors.danger },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.danger,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
});

const textStyles = StyleSheet.create({
  primary: { color: "#fff" },
  danger: { color: "#fff" },
  outline: { color: colors.danger },
  secondary: { color: colors.text },
});
