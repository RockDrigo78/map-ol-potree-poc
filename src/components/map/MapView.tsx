import React, { useEffect, useRef, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { Draw, Modify, Snap } from "ol/interaction";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { fromLonLat, toLonLat } from "ol/proj";
import { Feature } from "ol";
import Point from "ol/geom/Point";
import LineString from "ol/geom/LineString";
import Polygon from "ol/geom/Polygon";
import Icon from "ol/style/Icon";
import Style from "ol/style/Style";
import Attribution from "ol/control/Attribution";
import { useMapStore } from "../../store/mapStore";
import type { MapFeature, PointCloud, FeatureType } from "../../types/map";
import MapToolbar from "./MapToolbar";
import { Stroke, Fill } from "ol/style";
import Circle from "ol/style/Circle";
import Zoom from "ol/control/Zoom";
import Rotate from "ol/control/Rotate";
import { IconButton, Box } from "@mui/material";
import { Add as AddIcon, Remove as RemoveIcon } from "@mui/icons-material";
import "./MapView.css";

interface MapViewProps {
  onPointCloudClick: (cloud: PointCloud) => void;
  onMapReady?: (focusOnFeature: (featureId: string) => void) => void;
}

const MapView: React.FC<MapViewProps> = ({ onPointCloudClick, onMapReady }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { features, pointClouds, addFeature, removeFeature, loadFromStorage } =
    useMapStore();
  const vectorSourceRef = useRef<VectorSource>(new VectorSource());
  const [drawingMode, setDrawingMode] = useState<FeatureType | null>(null);
  const mapRef2 = useRef<Map | null>(null);
  const drawRef = useRef<Draw | null>(null);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(
    null
  );

  // Calculate measurements
  const calculateMeasurements = (
    type: FeatureType,
    coordinates: number[][]
  ): { length?: number; area?: number } => {
    if (type === "Point") return {};

    if (type === "LineString") {
      let length = 0;
      for (let i = 1; i < coordinates.length; i++) {
        const [lon1, lat1] = coordinates[i - 1];
        const [lon2, lat2] = coordinates[i];
        const R = 6371; // Earth's radius in km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        length += R * c;
      }
      return { length: Math.round(length * 1000) }; // Convert to meters
    }

    if (type === "Polygon") {
      // Simple area calculation (approximate)
      let area = 0;
      for (let i = 0; i < coordinates.length; i++) {
        const [lon1, lat1] = coordinates[i];
        const [lon2, lat2] = coordinates[(i + 1) % coordinates.length];
        area += ((lon2 - lon1) * (lat2 + lat1)) / 2;
      }
      return { area: Math.abs(Math.round(area * 111000 * 111000)) }; // Rough conversion to m²
    }

    return {};
  };

  // Focus on a feature
  const focusOnFeature = (featureId: string) => {
    if (!mapRef2.current) return;

    const feature = features.find((f) => f.id === featureId);
    if (!feature) return;

    setSelectedFeatureId(featureId);

    // Create a temporary feature to get its extent
    let geom;
    if (feature.type === "Point") {
      geom = new Point(fromLonLat(feature.coordinates[0]));
    } else if (feature.type === "LineString") {
      geom = new LineString(
        feature.coordinates.map((coord) => fromLonLat(coord))
      );
    } else if (feature.type === "Polygon") {
      geom = new Polygon([
        feature.coordinates.map((coord) => fromLonLat(coord)),
      ]);
    }

    if (geom) {
      const extent = geom.getExtent();
      mapRef2.current.getView().fit(extent, {
        duration: 1000,
        padding: [50, 50, 50, 50],
        maxZoom: 18,
      });
    }
  };

  // Expose focusOnFeature to parent component
  useEffect(() => {
    if (onMapReady) {
      onMapReady(focusOnFeature);
    }
  }, [onMapReady]);

  useEffect(() => {
    loadFromStorage();
    const raster = new TileLayer({
      source: new OSM(),
    });
    const vector = new VectorLayer({ source: vectorSourceRef.current });

    // Create custom rotate control (compass)
    const rotateControl = new Rotate({
      className: "custom-rotate-control",
      label: "⇡",
    });

    const map = new Map({
      target: mapRef.current!,
      layers: [raster, vector],
      view: new View({ center: fromLonLat([0, 0]), zoom: 2 }),
    });

    // Add controls after map creation
    map.addControl(rotateControl);

    console.log("Map controls:", map.getControls().getArray());

    mapRef2.current = map;

    // Add snap interaction
    const snap = new Snap({ source: vectorSourceRef.current });
    map.addInteraction(snap);

    // Add modify interaction
    const modify = new Modify({ source: vectorSourceRef.current });
    map.addInteraction(modify);

    // Add a test point to verify the vector layer is working
    const testPoint = new Feature({
      geometry: new Point(fromLonLat([0, 0])),
    });
    testPoint.setStyle(
      new Style({
        image: new Circle({
          radius: 10,
          fill: new Fill({
            color: "#ff0000",
          }),
          stroke: new Stroke({
            color: "#ffffff",
            width: 2,
          }),
        }),
      })
    );
    vectorSourceRef.current.addFeature(testPoint);
    console.log("Added test point at [0, 0]");

    return () => map.setTarget(undefined);
  }, [loadFromStorage]);

  // Handle drawing mode changes
  useEffect(() => {
    if (!mapRef2.current) return;

    // Remove existing draw interaction
    if (drawRef.current) {
      mapRef2.current.removeInteraction(drawRef.current);
      drawRef.current = null;
    }

    // Add new draw interaction if mode is selected
    if (drawingMode) {
      const draw = new Draw({
        source: vectorSourceRef.current,
        type: drawingMode,
      });

      draw.on("drawend", (evt) => {
        const olFeature = evt.feature;
        const geom = olFeature.getGeometry();
        let type: FeatureType = "Point";
        let coords: number[][] = [];

        if (geom instanceof Point) {
          type = "Point";
          coords = [toLonLat(geom.getCoordinates())];
          console.log("Drawing point at:", coords[0]);
        } else if (geom instanceof LineString) {
          type = "LineString";
          coords = geom.getCoordinates().map((coord) => toLonLat(coord));
        } else if (geom instanceof Polygon) {
          type = "Polygon";
          coords = geom.getCoordinates()[0].map((coord) => toLonLat(coord));
        }

        const measurements = calculateMeasurements(type, coords);
        const newFeature = {
          id: Date.now().toString(),
          type,
          coordinates: coords,
          measurements,
          name: `${type} ${Date.now()}`,
        };

        console.log("Adding feature:", newFeature);
        addFeature(newFeature);

        // Remove the drawn feature from the map (we store it in our state)
        vectorSourceRef.current.removeFeature(olFeature);
      });

      mapRef2.current.addInteraction(draw);
      drawRef.current = draw;
    }
  }, [drawingMode, addFeature]);

  // Render features on map
  useEffect(() => {
    if (!mapRef2.current) return;

    // Clear existing features
    vectorSourceRef.current.clear();

    // Add saved features from localStorage
    features.forEach((feature) => {
      console.log("Rendering feature:", feature);
      let geom;
      if (feature.type === "Point") {
        geom = new Point(fromLonLat(feature.coordinates[0]));
        console.log("Created point geometry at:", feature.coordinates[0]);
      } else if (feature.type === "LineString") {
        geom = new LineString(
          feature.coordinates.map((coord) => fromLonLat(coord))
        );
      } else if (feature.type === "Polygon") {
        geom = new Polygon([
          feature.coordinates.map((coord) => fromLonLat(coord)),
        ]);
      }

      if (geom) {
        const olFeature = new Feature({ geometry: geom });
        olFeature.setId(feature.id);

        // Set style based on feature type
        let style;
        if (feature.type === "Point") {
          style = new Style({
            image: new Circle({
              radius: 6,
              fill: new Fill({
                color: "#1976d2",
              }),
              stroke: new Stroke({
                color: "#ffffff",
                width: 2,
              }),
            }),
          });
          console.log("Created point style");
        } else {
          style = new Style({
            stroke: new Stroke({
              color: "#ff5722",
              width: 3,
            }),
            fill: new Fill({
              color:
                feature.type === "Polygon"
                  ? "rgba(255, 87, 34, 0.2)"
                  : "transparent",
            }),
          });
        }

        olFeature.setStyle(style);
        vectorSourceRef.current.addFeature(olFeature);
        console.log("Added feature to vector source");
      }
    });

    // Add point cloud icons
    pointClouds.forEach((cloud) => {
      const iconFeature = new Feature({
        geometry: new Point(fromLonLat(cloud.coordinate)),
      });

      iconFeature.setStyle(
        new Style({
          image: new Icon({
            src:
              "data:image/svg+xml;base64," +
              btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4caf50">
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
            </svg>
          `),
            scale: 1.5,
            anchor: [0.5, 1],
          }),
        })
      );

      iconFeature.setId(cloud.id);
      vectorSourceRef.current.addFeature(iconFeature);
    });
  }, [features, pointClouds]);

  // Click handler for point cloud icons
  useEffect(() => {
    if (!mapRef2.current) return;

    const handleClick = (evt: any) => {
      mapRef2.current!.forEachFeatureAtPixel(evt.pixel, (feature) => {
        const id = feature.getId();
        const cloud = pointClouds.find((c) => c.id === id);
        if (cloud) onPointCloudClick(cloud);
      });
    };

    mapRef2.current.on("singleclick", handleClick);
    return () => mapRef2.current?.un("singleclick", handleClick);
  }, [pointClouds, onPointCloudClick]);

  const handleClear = () => {
    vectorSourceRef.current.clear();
    features.forEach((feature) => removeFeature(feature.id));
  };

  const handleZoomIn = () => {
    if (mapRef2.current) {
      const view = mapRef2.current.getView();
      const zoom = view.getZoom();
      if (zoom !== undefined) {
        view.animate({ zoom: zoom + 1, duration: 250 });
      }
    }
  };

  const handleZoomOut = () => {
    if (mapRef2.current) {
      const view = mapRef2.current.getView();
      const zoom = view.getZoom();
      if (zoom !== undefined) {
        view.animate({ zoom: zoom - 1, duration: 250 });
      }
    }
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      <MapToolbar
        drawingMode={drawingMode}
        onDrawingModeChange={setDrawingMode}
        onClear={handleClear}
      />

      {/* Custom Zoom Controls */}
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          right: 16,
          transform: "translateY(-50%)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          bgcolor: "rgba(255, 255, 255, 0.9)",
          borderRadius: 1,
          padding: 0.5,
          boxShadow: 2,
        }}
      >
        <IconButton
          onClick={handleZoomIn}
          size="small"
          sx={{
            width: 36,
            height: 36,
            bgcolor: "white",
            border: "1px solid #ccc",
            "&:hover": {
              bgcolor: "#f0f0f0",
            },
          }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
        <IconButton
          onClick={handleZoomOut}
          size="small"
          sx={{
            width: 36,
            height: 36,
            bgcolor: "white",
            border: "1px solid #ccc",
            "&:hover": {
              bgcolor: "#f0f0f0",
            },
          }}
        >
          <RemoveIcon fontSize="small" />
        </IconButton>
      </Box>
    </div>
  );
};

export default MapView;
