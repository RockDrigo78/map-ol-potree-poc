import React, { useRef } from "react";
import Map from "ol/Map";
import { Draw } from "ol/interaction";
import VectorSource from "ol/source/Vector";
import type { PointCloud } from "../../../types/map";
import MapToolbar from "../MapToolbar/MapToolbar";
import { Box, Tooltip, ToggleButtonGroup, ToggleButton } from "@mui/material";
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  RotateLeft as RotateLeftIcon,
  RotateRight as RotateRightIcon,
} from "@mui/icons-material";
import { useMapView } from "./useMapView";

interface MapViewProps {
  onPointCloudClick: (cloud: PointCloud) => void;
  onMapReady?: (focusOnFeature: (featureId: string) => void) => void;
  visibleFeatureIds?: string[];
}

const MapView: React.FC<MapViewProps> = ({
  onPointCloudClick,
  onMapReady,
  visibleFeatureIds,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapRef2 = useRef<Map | null>(null);
  const drawRef = useRef<Draw | null>(null);
  const vectorSourceRef = useRef<VectorSource>(new VectorSource());

  const tooltipRef = useRef<HTMLDivElement>(null);

  const {
    tooltipContent,
    tooltipPosition,
    showTooltip,
    drawingMode,
    setDrawingMode,
    mapRotation,
    handleRotateRight,
    handleRotateLeft,
    handleResetRotation,
    handleZoomOut,
    handleZoomIn,
  } = useMapView(
    mapRef,
    mapRef2,
    drawRef,
    onMapReady,
    vectorSourceRef,
    onPointCloudClick,
    visibleFeatureIds
  );

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      <MapToolbar
        drawingMode={drawingMode}
        onDrawingModeChange={setDrawingMode}
      />

      {/* Custom Zoom Controls */}
      <ToggleButtonGroup
        orientation="vertical"
        sx={{
          position: "absolute",
          top: "50%",
          right: 8,
          transform: "translateY(-50%)",
          zIndex: 1000,
          bgcolor: "background.paper",
          borderRadius: 1,
          boxShadow: 3,
          p: 1,
          display: "flex",
        }}
      >
        <ToggleButton
          sx={{
            width: 32,
            height: 32,
            color: "text.primary",
          }}
          value="point"
          onClick={handleZoomIn}
          size="small"
        >
          <AddIcon fontSize="small" />
        </ToggleButton>
        <ToggleButton
          sx={{
            width: 32,
            height: 32,
            color: "text.primary",
          }}
          value="point"
          onClick={handleZoomOut}
          size="small"
        >
          <RemoveIcon fontSize="small" />
        </ToggleButton>
      </ToggleButtonGroup>

      {/* Rotation Control Toolbar */}
      <ToggleButtonGroup
        sx={{
          position: "absolute",
          bottom: 8,
          left: 8,
          zIndex: 1000,
          bgcolor: "background.paper",
          borderRadius: 1,
          boxShadow: 3,
          p: 1,
          display: "flex",
        }}
      >
        <Tooltip title="Rotate Left">
          <ToggleButton
            value="point"
            onClick={handleRotateLeft}
            size="small"
            sx={{
              width: 32,
              height: 32,
              color: "text.primary",
            }}
          >
            <RotateLeftIcon fontSize="small" />
          </ToggleButton>
        </Tooltip>
        <Tooltip title="Reset Rotation">
          <ToggleButton
            value="point"
            onClick={handleResetRotation}
            size="small"
            sx={{
              width: 32,
              height: 32,
              color: "text.primary",
            }}
          >
            <Box
              sx={{
                width: 0,
                height: 0,
                borderLeft: "4px solid transparent",
                borderRight: "4px solid transparent",
                borderBottom: "12px solid currentColor",
                transform: `rotate(${-mapRotation}rad)`,
                transition: "transform 0.3s ease",
              }}
            />
          </ToggleButton>
        </Tooltip>
        <Tooltip title="Rotate Right">
          <ToggleButton
            value="point"
            onClick={handleRotateRight}
            size="small"
            sx={{
              width: 32,
              height: 32,
              color: "text.primary",
            }}
          >
            <RotateRightIcon fontSize="small" />
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>

      {/* Tooltip */}
      {showTooltip && (
        <Box
          ref={tooltipRef}
          sx={{
            position: "absolute",
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 10,
            zIndex: 2000,
            bgcolor: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: 1,
            borderRadius: 1,
            fontSize: "12px",
            whiteSpace: "pre-line",
            maxWidth: 300,
            boxShadow: 2,
            pointerEvents: "none",
          }}
        >
          {tooltipContent}
        </Box>
      )}
    </div>
  );
};

export default MapView;
