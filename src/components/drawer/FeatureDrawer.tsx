import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Typography,
  IconButton,
  Box,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
} from "@mui/material";
import {
  Room as PointIcon,
  ShowChart as LineIcon,
  Pentagon as PolygonIcon,
  Delete as DeleteIcon,
  Cloud as CloudIcon,
  Clear as ClearIcon,
  Close as CloseIcon,
  CloudDownload as CloudDownloadIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import { useMapStore } from "../../contexts/mapContext";
import type { PointCloud } from "../../types/map";

interface FeatureDrawerProps {
  open: boolean;
  onClose: () => void;
  onPointCloudSelect: (cloud: PointCloud) => void;
  onFeatureClick?: (featureId: string) => void;
  visibleFeatureIds?: string[];
  onVisibleFeaturesChange?: (ids: string[]) => void;
}

const FeatureDrawer: React.FC<FeatureDrawerProps> = ({
  open,
  onClose,
  onPointCloudSelect,
  onFeatureClick,
  visibleFeatureIds = [],
  onVisibleFeaturesChange,
}) => {
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
  const fileInputRef = React.useRef<HTMLInputElement>(null);
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

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: 350 },
      }}
    >
      <Box sx={{ p: 2, pb: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">Map Features</Typography>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: "text.secondary",
              "&:hover": {
                color: "text.primary",
                bgcolor: "action.hover",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <Chip
            label={`${features.length} features`}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`${pointClouds.length} point clouds`}
            size="small"
            color="secondary"
            variant="outlined"
          />
        </Box>
        <Button
          size="small"
          variant="outlined"
          startIcon={<ClearIcon />}
          onClick={handleClearAll}
          disabled={features.length === 0 && pointClouds.length === 0}
          fullWidth
        >
          Clear All
        </Button>
        {/* Import and download/select all controls */}
        <Box
          sx={{
            display: "flex",
            alignItems: "start",
            justifyContent: "space-between",
            gap: 1,
            mt: 2,
            mb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Checkbox
              indeterminate={someChecked}
              checked={allChecked}
              onChange={handleSelectAll}
              inputProps={{ "aria-label": "Select all features" }}
            />
            <Typography variant="body2" sx={{ flex: 1 }}>
              Select All
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              marginTop: "5px",
            }}
          >
            <Button
              variant="contained"
              color="primary"
              startIcon={<CloudDownloadIcon />}
              onClick={downloadGeoJSON}
              disabled={checked.length === 0}
              size="small"
            >
              Download GeoJSON
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<CloudUploadIcon />}
              onClick={handleImportClick}
              size="small"
            >
              Upload GeoJSON
            </Button>
          </Box>
          <input
            ref={fileInputRef}
            type="file"
            accept=".geojson,.json,application/geo+json,application/json"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </Box>
      </Box>

      <Divider />

      <Box sx={{ p: 2, pb: 1 }}>
        <Typography variant="subtitle1" gutterBottom>
          Features
        </Typography>
        {features.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontStyle: "italic" }}
          >
            No features yet. Use the drawing tools on the map to create
            features.
          </Typography>
        ) : (
          <List sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {features.map((feature) => (
              <ListItem
                key={feature.id}
                sx={{
                  background: "#fff",
                  color: "#000",
                  gap: 1,
                }}
                component="button"
                onClick={() => handleFeatureClick(feature.id)}
                dense
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={(e) =>
                      handleDeleteClick(
                        e,
                        "feature",
                        feature.id,
                        feature.name || ""
                      )
                    }
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemIcon sx={{ alignItems: "center" }}>
                  <Checkbox
                    edge="start"
                    checked={checked.includes(feature.id)}
                    tabIndex={-1}
                    disableRipple
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => handleToggle(feature.id)}
                    inputProps={{
                      "aria-labelledby": `feature-checkbox-${feature.id}`,
                    }}
                  />
                  {getFeatureIcon(feature.type)}
                </ListItemIcon>
                <ListItemText
                  id={`feature-checkbox-${feature.id}`}
                  primary={feature.name || feature.type}
                  secondary={formatMeasurement(feature.measurements)}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      <Divider />

      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Point Clouds
        </Typography>
        {pointClouds.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontStyle: "italic" }}
          >
            No point clouds uploaded yet. Click "Upload Point Cloud" to add one.
          </Typography>
        ) : (
          <List dense>
            {pointClouds.map((c) => (
              <ListItem
                key={c.id}
                component="button"
                onClick={() => onPointCloudSelect(c)}
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  mb: 1,
                  textAlign: "left",
                  width: "100%",
                  "&:hover": { bgcolor: "action.hover" },
                  cursor: "pointer",
                }}
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={(e) =>
                      handleDeleteClick(e, "pointCloud", c.id, c.name)
                    }
                    size="small"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CloudIcon />
                </ListItemIcon>
                <ListItemText
                  primary={c.name}
                  secondary={`[${c.coordinate[0].toFixed(
                    4
                  )}, ${c.coordinate[1].toFixed(4)}]`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{itemToDelete?.name}"?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clear All Confirmation Dialog */}
      <Dialog
        open={clearAllDialogOpen}
        onClose={handleCancelClearAll}
        aria-labelledby="clear-all-dialog-title"
        aria-describedby="clear-all-dialog-description"
      >
        <DialogTitle id="clear-all-dialog-title">Clear All Items</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete all {features.length} features and{" "}
            {pointClouds.length} point clouds?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone and will remove all items from the map.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelClearAll} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmClearAll}
            color="error"
            variant="contained"
          >
            Clear All
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
};

export default FeatureDrawer;
