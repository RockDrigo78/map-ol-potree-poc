import { useRef, type FC } from "react";
import * as THREE from "three";
import {
  IconButton,
  Box,
  CircularProgress,
  Typography,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { PointCloud } from "../../../types/map";
import usePointCloudViewer from "./usePointCloudViewer";

interface PointCloudViewerProps {
  pointCloud: PointCloud;
  onClose: () => void;
}

const PointCloudViewer: FC<PointCloudViewerProps> = ({
  pointCloud,
  onClose,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  const { error, loading } = usePointCloudViewer(
    pointCloud,
    mountRef,
    sceneRef,
    rendererRef,
    cameraRef
  );

  return (
    <Box position="relative" width="100%" height="100%">
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          top: 8,
          right: 16,
          zIndex: 1,
          bgcolor: "rgba(0,0,0,0.5)",
          color: "white",
          "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
        }}
      >
        <CloseIcon />
      </IconButton>

      {loading && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <CircularProgress />
          <Typography color="white">Loading point cloud...</Typography>
        </Box>
      )}

      {error && (
        <Alert
          severity="error"
          sx={{
            position: "absolute",
            top: 16,
            left: 16,
            right: 16,
            zIndex: 2,
          }}
        >
          {error}
        </Alert>
      )}

      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
    </Box>
  );
};

export default PointCloudViewer;
