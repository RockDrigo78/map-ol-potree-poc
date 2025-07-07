import React, { createContext, useContext, useState, useCallback } from "react";
import type { MapFeature, PointCloud } from "../types/map";

interface MapState {
  features: MapFeature[];
  pointClouds: PointCloud[];
  selectedPointCloudId: string | null;
  addFeature: (feature: MapFeature) => void;
  removeFeature: (id: string) => void;
  addPointCloud: (cloud: PointCloud) => void;
  removePointCloud: (id: string) => void;
  selectPointCloud: (id: string | null) => void;
  loadFromStorage: () => void;
}

const FEATURES_KEY = "map_features";
const CLOUDS_KEY = "map_point_clouds";

const MapContext = createContext<MapState | undefined>(undefined);

type MapProviderProps = React.PropsWithChildren<{}>;
export const MapProvider: React.FC<MapProviderProps> = ({ children }) => {
  const [features, setFeatures] = useState<MapFeature[]>(() => {
    return JSON.parse(localStorage.getItem(FEATURES_KEY) || "[]");
  });
  const [pointClouds, setPointClouds] = useState<PointCloud[]>(() => {
    return JSON.parse(localStorage.getItem(CLOUDS_KEY) || "[]");
  });
  const [selectedPointCloudId, setSelectedPointCloudId] = useState<
    string | null
  >(null);

  const addFeature = useCallback((feature: MapFeature) => {
    setFeatures((prev) => {
      const updated = [...prev, feature];
      localStorage.setItem(FEATURES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeFeature = useCallback((id: string) => {
    setFeatures((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      localStorage.setItem(FEATURES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addPointCloud = useCallback((cloud: PointCloud) => {
    setPointClouds((prev) => {
      const updated = [...prev, cloud];
      localStorage.setItem(CLOUDS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removePointCloud = useCallback((id: string) => {
    setPointClouds((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      localStorage.setItem(CLOUDS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const selectPointCloud = useCallback((id: string | null) => {
    setSelectedPointCloudId(id);
  }, []);

  const loadFromStorage = useCallback(() => {
    setFeatures(JSON.parse(localStorage.getItem(FEATURES_KEY) || "[]"));
    setPointClouds(JSON.parse(localStorage.getItem(CLOUDS_KEY) || "[]"));
  }, []);

  return (
    <MapContext.Provider
      value={{
        features,
        pointClouds,
        selectedPointCloudId,
        addFeature,
        removeFeature,
        addPointCloud,
        removePointCloud,
        selectPointCloud,
        loadFromStorage,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};

export function useMapStore() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMapStore must be used within a MapProvider");
  }
  return context;
}
