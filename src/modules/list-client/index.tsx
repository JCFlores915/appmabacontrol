import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ListRenderItem,
  TextInput,
  Linking,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import EntypoIcon from "react-native-vector-icons/Entypo";
import AntIcon from "react-native-vector-icons/AntDesign";
import FA5 from "react-native-vector-icons/FontAwesome5";
import type { ClientItem } from "../home/screens";

type Props = {
  data: ClientItem[];
  safeTop: number;
  safeBottom: number;
  onSelectClient: (item: ClientItem) => void; // Ver en mapa
  onPay: (clientId: number) => void; // Realizar pago (Home logic)
  onCreateNewCuote: (idsale: number) => void | Promise<void>; // Nueva cuota (Home logic)
};

// ——— Performance helpers (ajusta si tu card crece mucho) ———
const ITEM_VERTICAL_MARGIN = 8;
const ITEM_PADDING = 12;
// Altura estimada para `getItemLayout`
const ITEM_HEIGHT = 108 + ITEM_VERTICAL_MARGIN * 2;

export const ListClientScreen: React.FC<Props> = React.memo(
  ({ data, safeTop, safeBottom, onSelectClient, onPay, onCreateNewCuote }) => {
    const styles = useMemo(
      () => createStyles(safeTop, safeBottom),
      [safeTop, safeBottom]
    );

    // --- Search ---
    const [query, setQuery] = useState("");
    const [searching, setSearching] = useState(false);
    const [filtered, setFiltered] = useState<ClientItem[]>(data);
    const inputRef = useRef<TextInput>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // --- Estado local para "nueva cuota" creada (toggle de botones por ítem) ---
    const [newCuoteCreatedFor, setNewCuoteCreatedFor] = useState<Set<number>>(
      new Set()
    );

    // Búsqueda en vivo con debounce, sin cerrar teclado (input fuera del FlatList)
    useEffect(() => {
      setSearching(true);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const q = query.trim().toLowerCase();
        if (!q) {
          setFiltered(data);
          setSearching(false);
          return;
        }
        const next = data.filter((it) => {
          const name = (it.name || "").toLowerCase();
          const sale = String(it.idsale || "");
          return name.includes(q) || sale.includes(q);
        });
        setFiltered(next);
        setSearching(false);
      }, 250);
      return () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
      };
    }, [query, data]);

    const clearQuery = useCallback(() => {
      setQuery("");
      // mantener teclado abierto tras limpiar
      requestAnimationFrame(() => inputRef.current?.focus());
    }, []);

    // Asegúrate de que idsale + idfee exista y sea único por fila
    const keyExtractor = useCallback(
      (item: ClientItem) => String((item as any).idsale + "-" + (item as any).idfee),
      []
    );

    const openWaze = useCallback((lat: number, lon: number) => {
      if (Number.isNaN(lat) || Number.isNaN(lon)) {
        Alert.alert("Coordenadas inválidas", "No se pudo abrir Waze por coordenadas no válidas.");
        return;
      }
      const tryUrl = `waze://?ll=${lat},${lon}&navigate=yes`;
      const fallback = `https://waze.com/ul?ll=${lat},${lon}&navigate=yes`;
      Linking.openURL(tryUrl).catch(() => Linking.openURL(fallback));
    }, []);

    // ¿Está pagada la cuota? (misma lógica que en Home)
    const isPaid = useCallback((item: ClientItem) => {
      const c = Number(item.cancel);
      return c !== 0 && c !== 2;
    }, []);

    const hasNewCuote = useCallback(
      (item: ClientItem) => newCuoteCreatedFor.has(item.idclient),
      [newCuoteCreatedFor]
    );

    const handleCreateNewCuote = useCallback(
      async (item: ClientItem) => {
        try {
          await Promise.resolve(onCreateNewCuote(item.idsale));
          setNewCuoteCreatedFor((prev) => {
            const next = new Set(prev);
            next.add(item.idclient);
            return next;
          });
        } catch {
          // si falla, no mutamos el estado local
        }
      },
      [onCreateNewCuote]
    );

    const renderItem = useCallback<ListRenderItem<ClientItem>>(
      ({ item }) => {
        const lat = Number(item.latitude);
        const lon = Number(item.longitude);
        const leftColor =
          typeof item.color_status === "string" && item.color_status.trim()
            ? item.color_status
            : "#EEE";

        const paid = isPaid(item);
        const created = hasNewCuote(item);

        // Reglas:
        // 1) Si pagada y sin nueva cuota => mostrar "Nueva cuota", ocultar "Pagar"
        // 2) Si pagada y ya creaste nueva cuota => ocultar "Nueva cuota", mostrar "Pagar"
        // 3) Si NO pagada => mostrar "Pagar", ocultar "Nueva cuota"
        const showNewCuoteBtn = paid && !created;
        const showPayBtn = !paid || (paid && created);

        return (
          <View style={[styles.card, { borderLeftColor: leftColor }]}>
            {/* Header */}
            <View style={styles.rowBetween}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.name}
                </Text>

                {/* Contrato | No. Cuota — todo dentro de <Text> para evitar errores */}
                <View style={styles.rowWrap}>
                  <Text style={styles.contract}>
                    <Text style={styles.contractLabel}>No. Contrato: </Text>
                    <Text style={styles.contractValue}>{String(item.idsale)}</Text>
                  </Text>
                  <Text style={styles.pipe}>|</Text>
                  <Text style={styles.contract}>
                    <Text style={styles.contractLabel}>No. Cuota: </Text>
                    <Text style={styles.contractValue}>{String((item as any).number_fee ?? "")}</Text>
                  </Text>
                </View>

                {/* Estado — anidar <Text> */}
                <Text style={styles.status}>
                  <Text style={styles.statusLabel}>Estado: </Text>
                  <Text style={styles.statusValue}>
                    {Number(item.cancel) === 0
                      ? "Pendiente"
                      : Number(item.cancel) === 2
                      ? "En Ruta"
                      : "Cancelado"}
                  </Text>
                </Text>
              </View>

              <View style={[styles.dot, { backgroundColor: leftColor }]} />
            </View>

            {/* Acciones */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => openWaze(lat, lon)}
              >
                {/* Nota: si tu set de íconos no trae 'waze', usa EntypoIcon 'direction' */}
                <FA5 name="waze" size={18} color="#115F83" />
                <Text style={styles.actionText}>Waze</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => onSelectClient(item)}
              >
                <EntypoIcon name="map" size={18} color="#115F83" />
                <Text style={styles.actionText}>Ver mapa</Text>
              </TouchableOpacity>

              {showNewCuoteBtn && (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleCreateNewCuote(item)}
                >
                  <AntIcon name="pluscircleo" size={18} color="#115F83" />
                  <Text style={styles.actionText}>Nueva cuota</Text>
                </TouchableOpacity>
              )}

              {showPayBtn && (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => onPay(item.idclient)}
                >
                  <FA5 name="money-bill-wave" size={18} color="#115F83" />
                  <Text style={styles.actionText}>Pagar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      },
      [
        onSelectClient,
        onPay,
        openWaze,
        handleCreateNewCuote,
        isPaid,
        hasNewCuote,
        styles.card,
        styles.rowBetween,
        styles.dot,
        styles.actionsRow,
        styles.actionBtn,
        styles.actionText,
        styles.name,
        styles.contract,
        styles.contractLabel,
        styles.contractValue,
        styles.status,
        styles.statusLabel,
        styles.statusValue,
        styles.rowWrap,
        styles.pipe,
      ]
    );

    const ListEmptyComponent = useCallback(() => {
      if (searching) {
        return (
          <View style={styles.emptyWrap}>
            <ActivityIndicator size="small" color="#115F83" />
            <Text style={styles.emptyText}>Buscando…</Text>
          </View>
        );
      }
      if (query.trim().length > 0) {
        return (
          <View style={styles.emptyWrap}>
            <AntIcon
              name="frowno"
              size={36}
              color="#9aa4ad"
              style={{ marginBottom: 6 }}
            />
            <Text style={styles.emptyText}>
              No hay resultados para “{query.trim()}”.
            </Text>
          </View>
        );
      }
      return (
        <Text style={styles.noClientsText}>No hay clientes asignados.</Text>
      );
    }, [searching, query, styles.emptyWrap, styles.emptyText, styles.noClientsText]);

    // getItemLayout para rendimiento en listas largas
    const getItemLayout = useCallback(
      (_: any, index: number) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
      }),
      []
    );

    return (
      <View style={styles.container}>
        {/* Buscador fuera del FlatList => no se desmonta => teclado no se cierra */}
        <View style={styles.searchWrap}>
          <AntIcon
            name="search1"
            size={18}
            color="#666"
            style={{ marginRight: 8 }}
          />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar por contrato o nombre…"
            placeholderTextColor="#999"
            style={styles.input}
            returnKeyType="search"
            autoCorrect={false}
            blurOnSubmit={false} // mantiene teclado en submit
          />
          {searching && (
            <ActivityIndicator
              size="small"
              color="#115F83"
              style={{ marginRight: 8 }}
            />
          )}
          {query.length > 0 && (
            <TouchableOpacity
              onPress={clearQuery}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <AntIcon name="closecircleo" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={filtered}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListEmptyComponent={ListEmptyComponent}
          showsVerticalScrollIndicator
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
          initialNumToRender={10}
          windowSize={11}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews={Platform.OS === "android"}
          getItemLayout={getItemLayout}
        />
      </View>
    );
  }
);

const createStyles = (safeTop: number, safeBottom: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      marginTop: safeTop + 70, // debajo de las tabs
      backgroundColor: "#F3F8FD",
      borderTopLeftRadius: 15,
      borderTopRightRadius: 15,
      overflow: "hidden",
    },
    // Search
    searchWrap: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#FFF",
      borderRadius: 10,
      paddingHorizontal: 12,
      height: 42,
      borderWidth: 1,
      borderColor: "#E6E6E6",
      marginBottom: 8,
      marginHorizontal: 16,
      marginTop: 12,
    },
    input: {
      flex: 1,
      color: "#222",
      paddingVertical: 0,
    },
    // List
    content: {
      paddingHorizontal: 16,
      paddingBottom: safeBottom + 100, // que no tape la bottom bar / FAB
      paddingTop: 4,
      minHeight: 200,
    },
    card: {
      backgroundColor: "#FFF",
      borderRadius: 12,
      padding: ITEM_PADDING,
      marginVertical: ITEM_VERTICAL_MARGIN,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 2,
      borderLeftWidth: 6, // color dinámico (color_status)
    },
    rowBetween: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    rowWrap: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 2,
      flexWrap: "wrap",
    },
    pipe: {
      marginHorizontal: 6,
      color: "#999",
      fontSize: 13,
    },
    dot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#EEE",
    },
    name: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#212121",
    },
    contract: {
      fontSize: 13,
      color: "#444",
      marginTop: 2,
    },
    contractLabel: { fontWeight: "600", color: "#555" },
    contractValue: { fontWeight: "700", color: "#212121" },
    status: {
      fontSize: 13,
      color: "gray",
      marginTop: 2,
    },
    statusLabel: { fontWeight: "600", color: "#666" },
    statusValue: { fontWeight: "700", color: "#444" },
    actionsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      marginTop: 10,
    },
    actionBtn: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#F0F6FA",
      paddingHorizontal: 10,
      height: 36,
      borderRadius: 18,
      marginRight: 8,
      marginTop: 8,
      borderWidth: 1,
      borderColor: "#D3E6F0",
    },
    actionText: {
      marginLeft: 6,
      color: "#115F83",
      fontWeight: "600",
      fontSize: 12,
    },
    emptyWrap: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 40,
    },
    emptyText: {
      fontSize: 14,
      color: "#7a8590",
      textAlign: "center",
    },
    noClientsText: {
      textAlign: "center",
      marginTop: 50,
      fontSize: 16,
      color: "#888",
    },
  });
