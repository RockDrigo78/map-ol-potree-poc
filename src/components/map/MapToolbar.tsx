import React from "react";
import { Box, ToggleButtonGroup, ToggleButton, Tooltip } from "@mui/material";
import {
  Room as PointIcon,
  ShowChart as LineIcon,
  CropSquare as PolygonIcon,
} from "@mui/icons-material";
import type { FeatureType } from "../../types/map";

interface MapToolbarProps {
  drawingMode: FeatureType | null;
  onDrawingModeChange: (mode: FeatureType | null) => void;
}

const MapToolbar: React.FC<MapToolbarProps> = ({
  drawingMode,
  onDrawingModeChange,
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
        bottom: 8,
        right: "50%",
        transform: "translateX(50%)",
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
        <ToggleButton
          value="Point"
          sx={{
            width: 32,
            height: 32,
            color: "text.primary",
          }}
        >
          <Tooltip title="Draw Point">
            <PointIcon fontSize="small" />
          </Tooltip>
        </ToggleButton>
        <ToggleButton
          value="LineString"
          sx={{
            width: 32,
            height: 32,
            color: "text.primary",
          }}
        >
          <Tooltip title="Draw Line">
            <LineIcon fontSize="small" />
          </Tooltip>
        </ToggleButton>
        <ToggleButton
          value="Polygon"
          sx={{
            width: 32,
            height: 32,
            color: "text.primary",
          }}
        >
          <Tooltip title="Draw Polygon">
            <PolygonIcon fontSize="small" />
          </Tooltip>
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default MapToolbar;
