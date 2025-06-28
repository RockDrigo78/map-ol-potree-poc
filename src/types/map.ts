export type FeatureType = "Point" | "LineString" | "Polygon";

export interface MapFeature {
  id: string;
  type: FeatureType;
  coordinates: number[][]; // [ [lon, lat], ... ]
  measurements?: {
    length?: number;
    area?: number;
  };
  name?: string;
}

export interface PointCloud {
  id: string;
  name: string;
  coordinate: [number, number]; // [lon, lat]
  fileUrl: string;
}
