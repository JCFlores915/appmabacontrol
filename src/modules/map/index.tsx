import React from "react";
import { View, Text } from "react-native";
import MapView, { Marker, MarkerAnimated, Polyline } from "react-native-maps";
import _ from "lodash";
import IconFontAwesome from "react-native-vector-icons/FontAwesome5";
import type { ClientItem, LatLng } from "../home/screens";

type Props = {
  data: ClientItem[];
  coords: LatLng[];
  location: { latitude: number; longitude: number } | null | undefined;
  safeTop: number;
  mapRef: React.RefObject<MapView>;
  markerRef: React.RefObject<MarkerAnimated>;
  onPressedDrawRoute: (item: ClientItem) => void;
  onShowCuote: (idsale: number, value: boolean) => void;
  customMapStyle: any;
};

export const MapScreen: React.FC<Props> = React.memo(
  ({ data, coords, location, mapRef, markerRef, onPressedDrawRoute, onShowCuote, customMapStyle }) => {
    return (
      <MapView
        provider="google"
        ref={mapRef}
        loadingEnabled
        style={{ flex: 1 }}
        loadingIndicatorColor="#EECFD4"
        loadingBackgroundColor="#F3F8FD"
        customMapStyle={customMapStyle}
      >
        {!!location && location.latitude !== 0 && (
          <MarkerAnimated ref={markerRef} coordinate={{ latitude: location.latitude, longitude: location.longitude }}>
            <IconFontAwesome name="truck-moving" size={20} color="gray" />
          </MarkerAnimated>
        )}

        {_.map(data, (item, index) => {
          const lat = Number(item.latitude);
          const lon = Number(item.longitude);
          if (isNaN(lat) || isNaN(lon)) return null;

          return (
            <View key={`${item.idclient}-${index}`}>
              <Marker
                pinColor={item.color_status}
                coordinate={{ latitude: lat, longitude: lon }}
                onPress={() =>
                  Number(item.cancel) === 0 || Number(item.cancel) === 2
                    ? onPressedDrawRoute(item)
                    : onShowCuote(item.idsale, true)
                }
              />
              <Marker coordinate={{ latitude: lat, longitude: lon }} anchor={{ x: 0, y: 0 }}>
                <View>
                  <Text style={{ color: "#212121", fontWeight: "bold" }}>{item.name}</Text>
                </View>
              </Marker>
            </View>
          );
        })}

        {coords.length > 0 && <Polyline coordinates={coords} strokeColor="#115F83" strokeWidth={3} />}
      </MapView>
    );
  }
);
