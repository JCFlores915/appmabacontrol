import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ToastAndroid as Toast,
} from "react-native";
import MapView, { MarkerAnimated } from "react-native-maps";
import Icon from "react-native-vector-icons/AntDesign";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Geolocation from "react-native-geolocation-service";

import { useAuth } from "../../../context/auth.context";
import request from "../../../services/axios";
import { getDirections } from "../../../utils";
import { useLocation } from "../../../hooks/useLocation";

import { Tabs } from "../components";
import { MapScreen } from "../../map";
import { ListClientScreen } from "../../list-client";

import { FloatingActionsButton } from "../../../components/common";
export type TabName = "ruta" | "clientes";

export interface LatLng {
  latitude: number;
  longitude: number;
  heading?: number;
}
export interface ClientItem {
  latitude: number;
  longitude: number;
  idclient: number;
  cancel: number;
  color_status: string;
  name: string;
  idsale: number;
  idfee: number;
  number_fee: number;
}

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { bottom, top } = useSafeAreaInsets();
  const safeTop = top || 0;
  const safeBottom = bottom || 0;

  const { location, loading } = useLocation();
  const styles = useMemo(
    () => factory({ insets: { bottom: safeBottom, top: safeTop } }),
    [safeBottom, safeTop]
  );

  const [data, setData] = useState<ClientItem[]>([]);
  const [coords, setCoords] = useState<LatLng[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientItem | undefined>(
    undefined
  );
  const [idfacturaventa, setIdFaturaVenta] = useState<number>(0);
  const [showCuote, setShowCuote] = useState<boolean>(false);
  const [lastClientId, setLastClientId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabName>("ruta");

  const { user, signOut } = useAuth();

  const mapRef = useRef<MapView | null>(null);
  const markerRef = useRef<MarkerAnimated | null>(null);

  // Carga data al enfocar
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      (async () => {
        try {
          const response = await request.post("?op=rutasAsignadas", {
            id: user.id,
          });
          if (isActive) setData(response.data || []);
        } catch {}
      })();
      return () => {
        isActive = false;
      };
    }, [user.id])
  );

  // Centrar cámara cuando haya ubicación
  useEffect(() => {
    if (!loading && location && location.latitude > 0) {
      mapRef.current?.animateCamera({
        center: { latitude: location.latitude, longitude: location.longitude },
        pitch: 0,
        heading: 0,
        altitude: 1000,
        zoom: 15,
      });
    }
  }, [loading, location?.latitude, location?.longitude]);

  // Seguimiento del marcador
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const watchId = Geolocation.watchPosition(
        ({ coords: { latitude, longitude } }) => {
          markerRef.current?.animateMarkerToCoordinate(
            { latitude, longitude },
            7000
          );
        },
        () => {},
        {
          distanceFilter: 0,
          enableHighAccuracy: true,
          showLocationDialog: true,
        }
      );
      return () => Geolocation.clearWatch(watchId);
    }, 8000);

    return () => clearTimeout(timeoutId);
  }, []);

  // Utils
  const viewOptionCuote = useCallback((idsale: number, value: boolean) => {
    setShowCuote(value);
    setIdFaturaVenta(idsale);
  }, []);

  const newCoute = useCallback((idsale: number) => {
    request.post("?op=newCoute", { idsale }).then((response) => {
      Toast.show(response.data?.message ?? "OK", Toast.SHORT);
    });
  }, []);

  const goCloseBox = useCallback(
    () => navigation.navigate("/closethebox", {}),
    [navigation]
  );
  const goExpenses = useCallback(
    () => navigation.navigate("/expenses"),
    [navigation]
  );
  const goConfig = useCallback(
    () => navigation.navigate("/match-printer"),
    [navigation]
  );

  const onPressedMarker = useCallback(
    (clientId: number) => {
      if (!user.printer?.address) {
        return Alert.alert(
          "Advertencia",
          "No tienes vinculada una impresora, antes de continuar por favor vincula la impresora.",
          [{ text: "OK", onPress: () => navigation.navigate("/match-printer") }]
        );
      }
      navigation.navigate("/scanner", { clientId });
    },
    [user.printer?.address, navigation]
  );

  const onPressedLogout = useCallback(() => {
    Alert.alert("CERRAR SESION", "¿Seguro que quieres cerrar la sesion?", [
      { text: "NO", onPress: () => {} },
      { text: "SI", onPress: () => void signOut() },
    ]);
  }, [signOut]);

  const onPressedRoute = useCallback(
    async (latlng: LatLng, id: number, item: ClientItem) => {
      if (!location || location.latitude === 0) {
        Toast.show(
          "Ubicación actual no disponible para trazar la ruta.",
          Toast.SHORT
        );
        return;
      }
      if (lastClientId === id && coords.length > 0) {
        setActiveTab("ruta");
        setSelectedClient(item);
        return;
      }
      setIsLoading(true);
      try {
        const points = await getDirections(
          `${location.latitude},${location.longitude}`,
          `${latlng.latitude},${latlng.longitude}`
        );
        setCoords(points);
        setSelectedClient(item);
        setLastClientId(id);
        setActiveTab("ruta");
      } catch {
        Toast.show("Ocurrió un error al intentar trazar la ruta.", Toast.SHORT);
      } finally {
        setIsLoading(false);
      }
    },
    [location?.latitude, location?.longitude, lastClientId, coords.length]
  );

  const onPressedDrawRoute = useCallback(
    (item: ClientItem) => {
      onPressedRoute(
        { latitude: Number(item.latitude), longitude: Number(item.longitude) },
        item.idclient,
        item
      );
    },
    [onPressedRoute]
  );

  const handleChangeTab = useCallback(
    (tab: TabName) => {
      if (tab !== activeTab) setActiveTab(tab);
    },
    [activeTab]
  );

  return (
    <View style={styles.screen}>
      {/* Tabs */}
      <Tabs
        activeTab={activeTab}
        onChangeTab={handleChangeTab}
        safeTop={safeTop}
      />

      {/* Contenido */}
      {activeTab === "ruta" ? (
        <MapScreen
          data={data}
          coords={coords}
          location={location}
          safeTop={safeTop}
          mapRef={mapRef}
          markerRef={markerRef}
          onPressedDrawRoute={onPressedDrawRoute}
          onShowCuote={viewOptionCuote}
          customMapStyle={require("../../../../style.json")}
        />
      ) : (
        <ListClientScreen
          data={data}
          safeTop={safeTop}
          safeBottom={safeBottom}
          onSelectClient={onPressedDrawRoute}
          onPay={onPressedMarker}
          onCreateNewCuote={newCoute}
        />
      )}

      {/* Overlay de carga */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color="#000" size="large" />
        </View>
      )}

      {/* Botón logout arriba derecha (lo dejamos igual) */}
      <View style={[styles.abs, { top: safeTop + 15, right: 12, zIndex: 999 }]}>
        <TouchableOpacity onPress={onPressedLogout}>
          <Icon name="logout" size={30} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Acciones sobre la ruta (solo en mapa) */}
      <View
        pointerEvents="box-none"
        style={[
          styles.abs,
          {
            top: 30 + safeTop,
            left: 0,
            right: 0,
            zIndex: 998,
            height: activeTab === "ruta" ? 150 : 0,
          },
        ]}
      >
        {selectedClient && activeTab === "ruta" && (
          <View style={styles.actionWrap}>
            <TouchableOpacity
              onPress={() => onPressedMarker(selectedClient.idclient)}
            >
              <View style={styles.actionButtonDark}>
                <Text style={styles.actionButtonText}>Realizar pago</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {showCuote && activeTab === "ruta" && (
          <View style={styles.actionWrap}>
            <TouchableOpacity onPress={() => newCoute(idfacturaventa)}>
              <View style={styles.actionButtonBlue}>
                <Text style={styles.actionButtonText}>Nueva Cuota</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* === Nuevo: FAB flotante con speed dial === */}
      <FloatingActionsButton
        safeBottom={safeBottom}
        onCloseRoute={goCloseBox}
        onAddExpense={goExpenses}
        onOpenPrinter={goConfig}
      />
    </View>
  );
};

const factory = (conditions: any) => {
  const { bottom, top } = conditions.insets;
  return StyleSheet.create({
    screen: { flex: 1, position: "relative", backgroundColor: "#EECFD4" },

    loadingOverlay: {
      position: "absolute",
      top,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.7)",
      zIndex: 1000,
    },

    abs: { position: "absolute" },

    actionWrap: {
      borderRadius: 10,
      paddingHorizontal: 10,
      marginHorizontal: 40,
      paddingVertical: 20,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
    },
    actionButtonDark: {
      marginVertical: 10,
      backgroundColor: "#000",
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 200,
      minWidth: 220,
    },
    actionButtonBlue: {
      marginVertical: 10,
      backgroundColor: "blue",
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 200,
      minWidth: 220,
    },
    actionButtonText: { color: "#fff", textAlign: "center" },
  });
};
