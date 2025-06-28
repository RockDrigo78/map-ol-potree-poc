import { create } from "zustand";
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

export const useMapStore = create<MapState>((set, get) => ({
  features: [],
  pointClouds: [],
  selectedPointCloudId: null,
  addFeature: (feature) => {
    const features = [...get().features, feature];
    set({ features });
    localStorage.setItem(FEATURES_KEY, JSON.stringify(features));
  },
  removeFeature: (id) => {
    const features = get().features.filter((f) => f.id !== id);
    set({ features });
    localStorage.setItem(FEATURES_KEY, JSON.stringify(features));
  },
  addPointCloud: (cloud) => {
    const pointClouds = [...get().pointClouds, cloud];
    set({ pointClouds });
    localStorage.setItem(CLOUDS_KEY, JSON.stringify(pointClouds));
  },
  removePointCloud: (id) => {
    const pointClouds = get().pointClouds.filter((c) => c.id !== id);
    set({ pointClouds });
    localStorage.setItem(CLOUDS_KEY, JSON.stringify(pointClouds));
  },
  selectPointCloud: (id) => set({ selectedPointCloudId: id }),
  loadFromStorage: () => {
    const features = JSON.parse(localStorage.getItem(FEATURES_KEY) || "[]");
    const pointClouds = JSON.parse(localStorage.getItem(CLOUDS_KEY) || "[]");
    set({ features, pointClouds });
  },
}));
