import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Text,
  Platform,
} from "react-native";
import AntIcon from "react-native-vector-icons/AntDesign";
import FA5 from "react-native-vector-icons/FontAwesome5";
import { PillButton } from "./pill-button.component";
type Props = {
  safeBottom: number;
  onCloseRoute: () => void;
  onAddExpense: () => void;
  onOpenPrinter: () => void;
};

export const FloatingActionsButton: React.FC<Props> = React.memo(
  ({ safeBottom, onCloseRoute, onAddExpense, onOpenPrinter }) => {
    const [open, setOpen] = useState(false);
    const anim = useRef(new Animated.Value(0)).current;

    const toggle = useCallback(() => {
      const toValue = open ? 0 : 1;
      setOpen(!open);
      Animated.timing(anim, {
        toValue,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }, [open, anim]);

    // Stagger de cada acción (0 = cerrado, 1 = abierto)
    const item1Style = useMemo(
      () => ({
        transform: [
          {
            translateY: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -60], // 1er item
            }),
          },
          { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) },
        ],
        opacity: anim,
      }),
      [anim]
    );

    const item2Style = useMemo(
      () => ({
        transform: [
          {
            translateY: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -116], // 2do item
            }),
          },
          { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) },
        ],
        opacity: anim,
      }),
      [anim]
    );

    const item3Style = useMemo(
      () => ({
        transform: [
          {
            translateY: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -172], // 3er item
            }),
          },
          { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) },
        ],
        opacity: anim,
      }),
      [anim]
    );

    const rotate = anim.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "45deg"],
    });


    return (
      <View
        pointerEvents="box-none"
        style={[styles.wrap, { bottom: safeBottom + 24 }]}
      >
        {/* Sombras/acciones desplegadas */}
        <Animated.View
          pointerEvents={open ? "auto" : "none"}
          style={[styles.itemWrap, item3Style]}
        >
          <PillButton
            label="Cerrar Ruta"
            variant="soft"
            onPress={onCloseRoute}
            leftIcon={<AntIcon name="checkcircleo" size={18} color="#115F83" />}
          />

        </Animated.View>

        <Animated.View
          pointerEvents={open ? "auto" : "none"}
          style={[styles.itemWrap, item2Style]}
        >
          <PillButton
            label="Gastos"
            onPress={onAddExpense}
            variant="soft"
            leftIcon={<AntIcon name="wallet" size={18} color="#115F83" />}
          />
        </Animated.View>

        <Animated.View
          pointerEvents={open ? "auto" : "none"}
          style={[styles.itemWrap, item1Style]}
        >
          <PillButton
            label="Impresora"
            onPress={onOpenPrinter}
            variant="soft"
            leftIcon={<AntIcon name="printer" size={18} color="#115F83" />}
          />
        </Animated.View>

        {/* FAB principal (settings) */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={toggle}
          style={styles.fab}
        >
          <Animated.View style={{ transform: [{ rotate }] }}>
            <AntIcon name="setting" size={26} color="#FFF" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    right: 16,
    zIndex: 999,
    alignItems: "flex-end",
  },
  itemWrap: {
    position: "absolute",
    right: 0,
    width: 140,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#115F83",
    alignItems: "center",
    justifyContent: "center",
    // sombra
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
  },
  pill: {
    minHeight: 40,
    borderRadius: 20,
    paddingHorizontal: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    // sombra suave
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: Platform.OS === "ios" ? 0.08 : 0.12,
    shadowRadius: 1,
    elevation: 1,
  },
  pillSoft: {
    backgroundColor: "#F0F6FA",
    borderColor: "#D3E6F0",
  },
  pillPrimary: {
    backgroundColor: "#115F83",
    borderColor: "#115F83",
  },
  pillText: {
    fontWeight: "700",
    fontSize: 13,
  },
  pillTextPrimary: { color: "#FFF" },
  pillTextSoft: { color: "#115F83" },
});
