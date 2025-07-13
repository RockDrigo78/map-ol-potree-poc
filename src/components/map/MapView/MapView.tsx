import React, { useRef } from "react";
import Map from "ol/Map";
import { Draw } from "ol/interaction";
import VectorSource from "ol/source/Vector";
import type { PointCloud } from "../../../types/map";
import MapToolbar from "../../../stories/molecules/MapToolbar/MapToolbar";
import { Box } from "@mui/material";
import ZoomControls from "../../../stories/molecules/ZoomControls/ZoomControls";
import { useMapView } from "./useMapView";
import RotationControls from "../../../stories/molecules/RotationControls/RotationControls";

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
    mapRotationInRad,
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
      <Box
        sx={{
          position: "absolute",
          bottom: 8,
          right: "50%",
          transform: "translateX(50%)",
          zIndex: 1000,
        }}
      >
        <MapToolbar
          drawingMode={drawingMode}
          onDrawingModeChange={setDrawingMode}
        />
      </Box>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          right: 8,
          transform: "translateY(-50%)",
          zIndex: 1000,
        }}
      >
        <ZoomControls
          handleZoomIn={handleZoomIn}
          handleZoomOut={handleZoomOut}
        />
      </Box>
      <Box
        sx={{
          position: "absolute",
          bottom: 8,
          left: 8,
          zIndex: 1000,
        }}
      >
        <RotationControls
          handleResetRotation={handleResetRotation}
          handleRotateLeft={handleRotateLeft}
          handleRotateRight={handleRotateRight}
          mapRotationInRad={mapRotationInRad}
        />
      </Box>

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
