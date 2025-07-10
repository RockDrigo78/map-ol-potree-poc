import { useEffect, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { Draw, Modify, Snap } from "ol/interaction";
import VectorLayer from "ol/layer/Vector";
import { fromLonLat, toLonLat } from "ol/proj";
import { Feature } from "ol";
import Point from "ol/geom/Point";
import LineString from "ol/geom/LineString";
import Polygon from "ol/geom/Polygon";
import Icon from "ol/style/Icon";
import Style from "ol/style/Style";
import { useMapStore } from "../../../contexts/mapContext";
import type { FeatureType, PointCloud } from "../../../types/map";
import { Stroke, Fill } from "ol/style";
import Circle from "ol/style/Circle";
import type VectorSource from "ol/source/Vector";
import type { Geometry } from "ol/geom";

export const useMapView = (
  mapRef: React.RefObject<HTMLDivElement | null>,
  mapRef2: React.RefObject<Map | null>,
  drawRef: React.RefObject<Draw | null>,
  onMapReady:
    | ((focusOnFeature: (featureId: string) => void) => void)
    | undefined,
  vectorSourceRef: React.RefObject<VectorSource<Feature<Geometry>>>,
  onPointCloudClick: (cloud: PointCloud) => void,
  visibleFeatureIds: string[] | undefined
) => {
  const { features, pointClouds, addFeature, removeFeature, loadFromStorage } =
    useMapStore();
  const [tooltipContent, setTooltipContent] = useState<string>("");
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [mapRotation, setMapRotation] = useState(0);

  const [drawingMode, setDrawingMode] = useState<FeatureType | null>(null);
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

  // Format coordinates for tooltip display
  const formatCoordinates = (coordinates: number[][]): string => {
    if (coordinates.length === 0) return "";

    if (coordinates.length === 1) {
      const [lon, lat] = coordinates[0];
      return `[${lon.toFixed(6)}, ${lat.toFixed(6)}]`;
    }

    if (coordinates.length <= 3) {
      return coordinates
        .map(([lon, lat]) => `[${lon.toFixed(6)}, ${lat.toFixed(6)}]`)
        .join(", ");
    }

    // For features with many coordinates, show first and last
    const first = coordinates[0];
    const last = coordinates[coordinates.length - 1];
    return `[${first[0].toFixed(6)}, ${first[1].toFixed(
      6
    )}] ... [${last[0].toFixed(6)}, ${last[1].toFixed(6)}] (${
      coordinates.length
    } points)`;
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

    const map = new Map({
      target: mapRef.current!,
      controls: [],
      layers: [raster, vector],
      view: new View({ center: fromLonLat([0, 0]), zoom: 2 }),
    });

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

    // Add saved features from localStorage, filtered by visibleFeatureIds if provided
    (visibleFeatureIds
      ? features.filter((f) => visibleFeatureIds.includes(f.id))
      : features
    ).forEach((feature) => {
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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#9c27b0">
              <defs>
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="1" dy="1" stdDeviation="1" flood-color="#000" flood-opacity="0.3"/>
                </filter>
              </defs>
              <g filter="url(#shadow)">
                <!-- Main point cloud representation -->
                <circle cx="12" cy="12" r="4" fill="#9c27b0" stroke="#fff" stroke-width="1"/>
                <circle cx="8" cy="8" r="2" fill="#ba68c8" opacity="0.8"/>
                <circle cx="16" cy="16" r="2" fill="#ba68c8" opacity="0.8"/>
                <circle cx="16" cy="8" r="1.5" fill="#ce93d8" opacity="0.6"/>
                <circle cx="8" cy="16" r="1.5" fill="#ce93d8" opacity="0.6"/>
                <circle cx="12" cy="6" r="1" fill="#e1bee7" opacity="0.7"/>
                <circle cx="6" cy="12" r="1" fill="#e1bee7" opacity="0.7"/>
                <circle cx="18" cy="12" r="1" fill="#e1bee7" opacity="0.7"/>
                <circle cx="12" cy="18" r="1" fill="#e1bee7" opacity="0.7"/>
                <!-- 3D indicator -->
                <path d="M12 4 L14 6 L10 6 Z" fill="#7b1fa2"/>
                <path d="M12 20 L14 18 L10 18 Z" fill="#7b1fa2"/>
                <path d="M4 12 L6 14 L6 10 Z" fill="#7b1fa2"/>
                <path d="M20 12 L18 14 L18 10 Z" fill="#7b1fa2"/>
              </g>
            </svg>
          `),
            scale: 1.3,
            anchor: [0.5, 0.5],
          }),
        })
      );

      iconFeature.setId(cloud.id);
      vectorSourceRef.current.addFeature(iconFeature);
    });
  }, [features, pointClouds, visibleFeatureIds]);

  // Click handler for point cloud icons
  useEffect(() => {
    if (!mapRef2.current) return;

    const handleClick = (evt: any) => {
      mapRef2.current!.forEachFeatureAtPixel(evt.pixel, (feature) => {
        const id = feature.getId();
        const cloud = pointClouds.find((c) => c.id === id);
        if (cloud) {
          // Focus on the point cloud location
          const pointGeom = new Point(fromLonLat(cloud.coordinate));
          const extent = pointGeom.getExtent();
          mapRef2.current!.getView().fit(extent, {
            duration: 1000,
            padding: [50, 50, 50, 50],
            maxZoom: 18,
          });

          // Call the original callback
          onPointCloudClick(cloud);
        }
      });
    };

    mapRef2.current.on("singleclick", handleClick);
    return () => mapRef2.current?.un("singleclick", handleClick);
  }, [pointClouds, onPointCloudClick]);

  // Pointer move handler for tooltips
  useEffect(() => {
    if (!mapRef2.current) return;

    const handlePointerMove = (evt: any) => {
      const pixel = evt.pixel;
      //   const coordinate = evt.coordinate;

      mapRef2.current!.forEachFeatureAtPixel(pixel, (feature) => {
        const id = feature.getId();

        // Check if it's a feature (not a point cloud)
        const mapFeature = features.find((f) => f.id === id);
        if (mapFeature) {
          const coordsText = formatCoordinates(mapFeature.coordinates);
          const measurementText = mapFeature.measurements
            ? mapFeature.measurements.length
              ? `${mapFeature.measurements.length}m`
              : mapFeature.measurements.area
              ? `${mapFeature.measurements.area}m²`
              : ""
            : "";

          const tooltipText = `${
            mapFeature.name || mapFeature.type
          }\n${coordsText}${measurementText ? `\n${measurementText}` : ""}`;

          setTooltipContent(tooltipText);
          setTooltipPosition({ x: pixel[0], y: pixel[1] });
          setShowTooltip(true);
          return;
        }

        // Check if it's a point cloud
        const cloud = pointClouds.find((c) => c.id === id);
        if (cloud) {
          const coordsText = `[${cloud.coordinate[0].toFixed(
            6
          )}, ${cloud.coordinate[1].toFixed(6)}]`;
          const tooltipText = `${cloud.name}\n${coordsText}`;

          setTooltipContent(tooltipText);
          setTooltipPosition({ x: pixel[0], y: pixel[1] });
          setShowTooltip(true);
          return;
        }
      });

      // Hide tooltip if no feature is found
      if (!mapRef2.current!.hasFeatureAtPixel(pixel)) {
        setShowTooltip(false);
      }
    };

    mapRef2.current.on("pointermove", handlePointerMove);
    return () => mapRef2.current?.un("pointermove", handlePointerMove);
  }, [features, pointClouds]);

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

  const handleResetRotation = () => {
    if (mapRef2.current) {
      const view = mapRef2.current.getView();
      view.animate({ rotation: 0, duration: 500 });
    }
  };

  const handleRotateLeft = () => {
    if (mapRef2.current) {
      const view = mapRef2.current.getView();
      const currentRotation = view.getRotation() || 0;
      view.animate({ rotation: currentRotation - Math.PI / 4, duration: 300 });
    }
  };

  const handleRotateRight = () => {
    if (mapRef2.current) {
      const view = mapRef2.current.getView();
      const currentRotation = view.getRotation() || 0;
      view.animate({ rotation: currentRotation + Math.PI / 4, duration: 300 });
    }
  };

  return {
    calculateMeasurements,
    focusOnFeature,
    tooltipContent,
    setTooltipContent,
    tooltipPosition,
    setTooltipPosition,
    showTooltip,
    setShowTooltip,
    selectedFeatureId,
    setSelectedFeatureId,
    drawingMode,
    setDrawingMode,
    mapRotation,
    setMapRotation,
    handleRotateRight,
    handleRotateLeft,
    handleResetRotation,
    handleZoomOut,
    handleZoomIn,
    handleClear,
  };
};
