import React from "react";
import { TouchableOpacity, Text, StyleSheet, View, StyleProp, ViewStyle } from "react-native";

type Variant = "primary" | "soft";

interface Props {
  label: string;
  onPress: () => void;
  leftIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: Variant; // "primary" = sólido #115F83, "soft" = chip suave
}

export const PillButton: React.FC<Props> = React.memo(
  ({ label, onPress, leftIcon, style, variant = "primary" }) => {
    const isPrimary = variant === "primary";
    return (
      <TouchableOpacity
        style={[
          styles.base,
          isPrimary ? styles.primary : styles.soft,
          style,
        ]}
        activeOpacity={0.85}
        onPress={onPress}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        {leftIcon ? <View style={{ marginRight: 8 }}>{leftIcon}</View> : null}
        <Text style={[styles.text, isPrimary ? styles.textPrimary : styles.textSoft]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  base: {
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    // Sombra ligera
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
  },
  primary: {
    backgroundColor: "#115F83",
    borderColor: "#115F83",
  },
  soft: {
    backgroundColor: "#F0F6FA",
    borderColor: "#D3E6F0",
  },
  text: {
    fontWeight: "700",
    fontSize: 14,
  },
  textPrimary: {
    color: "#FFF",
  },
  textSoft: {
    color: "#115F83",
  },
});
