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
} from "@mui/material";
import {
  Room as PointIcon,
  ShowChart as LineIcon,
  CropSquare as PolygonIcon,
  Delete as DeleteIcon,
  Cloud as CloudIcon,
  Clear as ClearIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useMapStore } from "../../store/mapStore";
import type { MapFeature, PointCloud } from "../../types/map";

interface FeatureDrawerProps {
  open: boolean;
  onClose: () => void;
  onPointCloudSelect: (cloud: PointCloud) => void;
  onFeatureClick?: (featureId: string) => void;
}

const FeatureDrawer: React.FC<FeatureDrawerProps> = ({
  open,
  onClose,
  onPointCloudSelect,
  onFeatureClick,
}) => {
  const { features, pointClouds, removeFeature, removePointCloud } =
    useMapStore();

  // State for confirmation dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    type: "feature" | "pointCloud";
    id: string;
    name: string;
  } | null>(null);

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
          <List dense>
            {features.map((f) => (
              <ListItem
                key={f.id}
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  mb: 1,
                  cursor: "pointer",
                  "&:hover": { bgcolor: "action.hover" },
                }}
                onClick={() => handleFeatureClick(f.id)}
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={(e) =>
                      handleDeleteClick(e, "feature", f.id, f.name || f.type)
                    }
                    size="small"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {getFeatureIcon(f.type)}
                </ListItemIcon>
                <ListItemText
                  primary={f.name || f.type}
                  secondary={
                    <Box>
                      <Typography variant="caption" display="block">
                        Type: {f.type}
                      </Typography>
                      {formatMeasurement(f.measurements) && (
                        <Typography
                          variant="caption"
                          display="block"
                          color="primary"
                        >
                          {formatMeasurement(f.measurements)}
                        </Typography>
                      )}
                    </Box>
                  }
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
