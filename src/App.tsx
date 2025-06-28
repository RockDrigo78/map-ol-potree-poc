import { useState, useRef } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import MapView from "./components/map/MapView";
import FeatureDrawer from "./components/drawer/FeatureDrawer";
import PointCloudViewer from "./components/3d-viewer/PointCloudViewer";
import PointCloudUpload from "./components/ui/PointCloudUpload";
import { useMapStore } from "./store/mapStore";
import type { PointCloud } from "./types/map";

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const { selectedPointCloudId, pointClouds, addPointCloud, selectPointCloud } =
    useMapStore();
  const selectedCloud =
    pointClouds.find((c) => c.id === selectedPointCloudId) || null;
  const focusOnFeatureRef = useRef<((featureId: string) => void) | null>(null);

  const handlePointCloudClick = (cloud: PointCloud) => {
    selectPointCloud(cloud.id);
  };

  const handlePointCloudSelect = (cloud: PointCloud) => {
    selectPointCloud(cloud.id);
  };

  const handleFeatureClick = (featureId: string) => {
    if (focusOnFeatureRef.current) {
      focusOnFeatureRef.current(featureId);
    }
  };

  const handleMapReady = (focusOnFeature: (featureId: string) => void) => {
    focusOnFeatureRef.current = focusOnFeature;
  };

  const handleUpload = async ({
    name,
    file,
    coordinate,
  }: {
    name: string;
    file: File;
    coordinate: [number, number];
  }) => {
    // For demo, use a blob URL. In production, use a backend or IndexedDB.
    const fileUrl = URL.createObjectURL(file);
    addPointCloud({
      id: Date.now().toString(),
      name,
      coordinate,
      fileUrl,
    });
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AppBar position="static">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            sx={{ mr: "10px" }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Map & 3D Point Cloud App
          </Typography>
          <Button
            color="inherit"
            startIcon={<AddIcon />}
            onClick={() => setUploadOpen(true)}
          >
            Upload Point Cloud
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ flex: 1, display: "flex", position: "relative" }}>
        <Box sx={{ flex: 1, height: "100%" }}>
          <MapView
            onPointCloudClick={handlePointCloudClick}
            onMapReady={handleMapReady}
          />
        </Box>
        {selectedCloud && (
          <Box
            sx={{
              width: 500,
              height: "100%",
              position: "absolute",
              right: 0,
              top: 0,
              zIndex: 10,
              bgcolor: "background.paper",
              boxShadow: 3,
            }}
          >
            <PointCloudViewer
              pointCloud={selectedCloud}
              onClose={() => selectPointCloud(null)}
            />
          </Box>
        )}
      </Box>
      <FeatureDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onPointCloudSelect={handlePointCloudSelect}
        onFeatureClick={handleFeatureClick}
      />
      <PointCloudUpload
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUpload={handleUpload}
      />
    </Box>
  );
}

export default App;
