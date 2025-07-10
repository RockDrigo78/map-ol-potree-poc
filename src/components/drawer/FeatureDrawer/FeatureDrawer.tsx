import React from "react";
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
  Delete as DeleteIcon,
  Cloud as CloudIcon,
  Clear as ClearIcon,
  Close as CloseIcon,
  CloudDownload as CloudDownloadIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import type { PointCloud } from "../../../types/map";
import { useFeatureDrawer } from "./useFeatureDrawer";
import { useMapStore } from "../../../contexts/mapContext";

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
  const { features, pointClouds } = useMapStore();

  const {
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
    deleteDialogOpen,
    itemToDelete,
    handleFileChange,
    handleImportClick,
    handleCancelDelete,
    handleConfirmDelete,
    handleDeleteClick,
    handleClearAll,
    handleFeatureClick,
    handleCancelClearAll,
    handleConfirmClearAll,
  } = useFeatureDrawer(
    onFeatureClick,
    visibleFeatureIds,
    onVisibleFeaturesChange
  );

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
                  background: "#fff",
                  color: "#000",
                  gap: 1,
                }}
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={(e) =>
                      handleDeleteClick(e, "pointCloud", c.id, c.name)
                    }
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
