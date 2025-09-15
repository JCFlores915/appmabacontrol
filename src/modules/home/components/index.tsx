import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import AntIcon from "react-native-vector-icons/AntDesign";
import EntypoIcon from "react-native-vector-icons/Entypo";
import type { TabName } from "../screens";

interface Props {
  activeTab: TabName;
  onChangeTab: (t: TabName) => void;
  safeTop: number;
}

export const Tabs: React.FC<Props> = React.memo(({ activeTab, onChangeTab, safeTop }) => {
  const styles = useMemo(() => createStyles(safeTop), [safeTop]);

  return (
    <View style={styles.container}>
      {/* Clientes */}
      <TouchableOpacity
        onPress={() => onChangeTab("clientes")}
        style={[
          styles.pill,
          activeTab === "clientes" ? styles.pillActive : styles.pillInactive,
          { marginRight: 8 },
        ]}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        activeOpacity={0.8}
      >
        <AntIcon
          name="profile"
          size={18}
          color={activeTab === "clientes" ? "#FFF" : "#115F83"}
          style={{ marginRight: 6 }}
        />
        <Text
          style={[
            styles.pillText,
            activeTab === "clientes" ? styles.pillTextActive : styles.pillTextInactive,
          ]}
        >
          Clientes
        </Text>
      </TouchableOpacity>

      {/* Ruta */}
      <TouchableOpacity
        onPress={() => onChangeTab("ruta")}
        style={[styles.pill, activeTab === "ruta" ? styles.pillActive : styles.pillInactive]}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        activeOpacity={0.8}
      >
        <EntypoIcon
          name="map"
          size={18}
          color={activeTab === "ruta" ? "#FFF" : "#115F83"}
          style={{ marginRight: 6 }}
        />
        <Text
          style={[
            styles.pillText,
            activeTab === "ruta" ? styles.pillTextActive : styles.pillTextInactive,
          ]}
        >
          Ruta
        </Text>
      </TouchableOpacity>
    </View>
  );
});

const createStyles = (safeTop: number) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      top: safeTop + 15,
      left: 12,
      zIndex: 999,
      flexDirection: "row",
      alignItems: "center",
      // sin fondo, como chips sueltos
    },
    pill: {
      height: 36,
      borderRadius: 18,
      paddingHorizontal: 12,
      borderWidth: 1,
      flexDirection: "row",
      alignItems: "center",
      // sombra ligera (iOS) + elevación (Android) opcional
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 1,
      elevation: 1,
    },
    pillInactive: {
      backgroundColor: "#F0F6FA",
      borderColor: "#D3E6F0",
    },
    pillActive: {
      backgroundColor: "#115F83",
      borderColor: "#115F83",
    },
    pillText: {
      fontWeight: "600",
      fontSize: 12,
    },
    pillTextInactive: {
      color: "#115F83",
    },
    pillTextActive: {
      color: "#FFF",
    },
  });
