import { useRef, useState } from "react";
import { useMapStore } from "../../../contexts/mapContext";
import {
  Room as PointIcon,
  ShowChart as LineIcon,
  Pentagon as PolygonIcon,
} from "@mui/icons-material";

export const useFeatureDrawer = (
  onFeatureClick: ((featureId: string) => void) | undefined,
  visibleFeatureIds: string[] = [],
  onVisibleFeaturesChange: ((ids: string[]) => void) | undefined
) => {
  const { features, pointClouds, removeFeature, removePointCloud, addFeature } =
    useMapStore();

  // State for confirmation dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    type: "feature" | "pointCloud";
    id: string;
    name: string;
  } | null>(null);

  // Remove local checked state, use visibleFeatureIds directly
  const checked = visibleFeatureIds;

  // Select all/none handler
  const allChecked = features.length > 0 && checked.length === features.length;
  const someChecked = checked.length > 0 && checked.length < features.length;
  const handleSelectAll = () => {
    if (allChecked) {
      onVisibleFeaturesChange && onVisibleFeaturesChange([]);
    } else {
      onVisibleFeaturesChange &&
        onVisibleFeaturesChange(features.map((f) => f.id));
    }
  };

  // Download selected features as GeoJSON
  const downloadGeoJSON = () => {
    const selectedFeatures = features.filter((f) => checked.includes(f.id));
    const geojson = {
      type: "FeatureCollection",
      features: selectedFeatures.map((f) => ({
        type: "Feature",
        geometry: {
          type: f.type,
          coordinates: f.coordinates,
        },
        properties: {
          id: f.id,
          name: f.name,
          measurements: f.measurements,
        },
      })),
    };
    const blob = new Blob([JSON.stringify(geojson, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "features.geojson";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };

  // Toggle a single feature
  const handleToggle = (id: string) => {
    if (!onVisibleFeaturesChange) return;
    if (checked.includes(id)) {
      onVisibleFeaturesChange(checked.filter((cid) => cid !== id));
    } else {
      onVisibleFeaturesChange([...checked, id]);
    }
  };

  const getFeatureIcon = (type: string) => {
    switch (type) {
      case "Point":
        return <PointIcon />;
      case "LineString":
        return <LineIcon />;
      case "Polygon":
        return <PolygonIcon />;
      default:
        return <PointIcon />;
    }
  };

  const formatMeasurement = (measurements?: {
    length?: number;
    area?: number;
  }) => {
    if (!measurements) return "";
    if (measurements.length) return `${measurements.length}m`;
    if (measurements.area) return `${measurements.area}m²`;
    return "";
  };

  const handleClearAll = () => {
    setClearAllDialogOpen(true);
  };

  const handleConfirmClearAll = () => {
    features.forEach((f) => removeFeature(f.id));
    pointClouds.forEach((c) => removePointCloud(c.id));
    setClearAllDialogOpen(false);
  };

  const handleCancelClearAll = () => {
    setClearAllDialogOpen(false);
  };

  const handleFeatureClick = (featureId: string) => {
    if (onFeatureClick) {
      onFeatureClick(featureId);
    }
    // se(false);
  };

  const handleDeleteClick = (
    e: React.MouseEvent,
    type: "feature" | "pointCloud",
    id: string,
    name: string
  ) => {
    e.stopPropagation();
    setItemToDelete({ type, id, name });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      if (itemToDelete.type === "feature") {
        removeFeature(itemToDelete.id);
      } else {
        removePointCloud(itemToDelete.id);
      }
    }
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  // Import GeoJSON handler
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const geojson = JSON.parse(event.target?.result as string);
        if (
          geojson.type !== "FeatureCollection" ||
          !Array.isArray(geojson.features)
        ) {
          alert("Invalid GeoJSON: must be a FeatureCollection");
          return;
        }
        geojson.features.forEach((f: any) => {
          if (!f.geometry || !f.geometry.type || !f.geometry.coordinates)
            return;
          const id = f.properties?.id || Date.now().toString() + Math.random();
          addFeature({
            id,
            type: f.geometry.type,
            coordinates: f.geometry.coordinates,
            measurements: f.properties?.measurements,
            name: f.properties?.name || f.geometry.type,
          });
        });
        alert("GeoJSON imported successfully!");
      } catch (err) {
        alert("Failed to import GeoJSON: " + (err as Error).message);
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be re-imported
    e.target.value = "";
  };
  return {
    formatMeasurement,
    getFeatureIcon,
    handleToggle,
    downloadGeoJSON,
    handleSelectAll,
    fileInputRef,
    checked,
    allChecked,
    someChecked,
    clearAllDialogOpen,
    setClearAllDialogOpen,
    deleteDialogOpen,
    itemToDelete,
    setDeleteDialogOpen,
    handleFileChange,
    handleImportClick,
    handleCancelDelete,
    handleConfirmDelete,
    handleDeleteClick,
    handleClearAll,
    handleFeatureClick,
    handleCancelClearAll,
    handleConfirmClearAll,
  };
};
