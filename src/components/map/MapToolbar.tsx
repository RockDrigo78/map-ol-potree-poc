import React from "react";
import {
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  Tooltip,
} from "@mui/material";
import {
  Room as PointIcon,
  ShowChart as LineIcon,
  CropSquare as PolygonIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import type { FeatureType } from "../../types/map";

interface MapToolbarProps {
  drawingMode: FeatureType | null;
  onDrawingModeChange: (mode: FeatureType | null) => void;
  onClear: () => void;
}

const MapToolbar: React.FC<MapToolbarProps> = ({
  drawingMode,
  onDrawingModeChange,
  onClear,
}) => {
  const handleModeChange = (
    _: React.MouseEvent<HTMLElement>,
    newMode: FeatureType | null
  ) => {
    onDrawingModeChange(newMode);
  };

  return (
    <Box
      sx={{
        position: "absolute",
        top: 16,
        right: 16,
        zIndex: 1000,
        bgcolor: "background.paper",
        borderRadius: 1,
        boxShadow: 3,
        p: 1,
      }}
    >
      <ToggleButtonGroup
        value={drawingMode}
        exclusive
        onChange={handleModeChange}
        size="small"
      >
        <ToggleButton value="Point">
          <Tooltip title="Draw Point">
            <PointIcon />
          </Tooltip>
        </ToggleButton>
        <ToggleButton value="LineString">
          <Tooltip title="Draw Line">
            <LineIcon />
          </Tooltip>
        </ToggleButton>
        <ToggleButton value="Polygon">
          <Tooltip title="Draw Polygon">
            <PolygonIcon />
          </Tooltip>
        </ToggleButton>
      </ToggleButtonGroup>

      <Button
        size="small"
        onClick={onClear}
        sx={{ ml: 1 }}
        startIcon={<ClearIcon />}
      >
        Clear
      </Button>
    </Box>
  );
};

export default MapToolbar;
