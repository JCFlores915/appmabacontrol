import { decode } from "@mapbox/polyline"

export const getDirections = async (startLoc, destinationLoc) => {
  try {
    const KEY = "AIzaSyD5l5UcrOFpVDKAOyJ72zMfwUQ0S2yjjXs";
    let resp = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc}&destination=${destinationLoc}&key=${KEY}`
    );
    let respJson = await resp.json();
    let points = decode(respJson.routes[0].overview_polyline.points);
    let coords = points.map((point, index) => {
      return {
        latitude: point[0],
        longitude: point[1]
      };
    });
    return coords;
  } catch (error) {
    throw error
  }
};