import React from "react";
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  InputAdornment,
  Chip,
} from "@mui/material";
import { CloudUpload as UploadIcon } from "@mui/icons-material";
import usePointCloudUpload from "./usePointCloudUpload";

interface PointCloudUploadProps {
  open: boolean;
  onClose: () => void;
  onUpload: (data: {
    name: string;
    file: File;
    coordinate: [number, number];
  }) => void;
}

const PointCloudUpload: React.FC<PointCloudUploadProps> = ({
  open,
  onClose,
  onUpload,
}) => {
  const {
    handleSubmit,
    handleFileChange,
    handleClose,
    errors,
    setErrors,
    lat,
    setLat,
    lon,
    setLon,
    file,
    name,
    setName,
  } = usePointCloudUpload(onClose, onUpload);
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <UploadIcon />
          Upload Point Cloud
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={3} sx={{ mt: 1 }}>
          <TextField
            label="Point Cloud Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
            }}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
            required
          />

          <Box>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              fullWidth
              sx={{ height: 56, mb: 1 }}
            >
              {file ? file.name : "Select Point Cloud File"}
              <input
                type="file"
                hidden
                accept=".las,.laz,.ply,.xyz,.pts"
                onChange={handleFileChange}
              />
            </Button>
            {file && (
              <Chip
                label={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {errors.file && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {errors.file}
              </Alert>
            )}
          </Box>

          <Typography variant="subtitle2" color="text.secondary">
            Map Coordinates
          </Typography>

          <Box display="flex" gap={2}>
            <TextField
              label="Longitude"
              value={lon}
              onChange={(e) => {
                setLon(e.target.value);
                if (errors.lon) setErrors((prev) => ({ ...prev, lon: "" }));
              }}
              error={!!errors.lon}
              helperText={errors.lon}
              type="number"
              inputProps={{ step: 0.000001, min: -180, max: 180 }}
              InputProps={{
                endAdornment: <InputAdornment position="end">°</InputAdornment>,
              }}
              fullWidth
              required
            />
            <TextField
              label="Latitude"
              value={lat}
              onChange={(e) => {
                setLat(e.target.value);
                if (errors.lat) setErrors((prev) => ({ ...prev, lat: "" }));
              }}
              error={!!errors.lat}
              helperText={errors.lat}
              type="number"
              inputProps={{ step: 0.000001, min: -90, max: 90 }}
              InputProps={{
                endAdornment: <InputAdornment position="end">°</InputAdornment>,
              }}
              fullWidth
              required
            />
          </Box>

          <Alert severity="info">
            <Typography variant="body2">
              Supported formats: LAS, LAZ, PLY, XYZ, PTS
            </Typography>
          </Alert>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!name || !file || !lon || !lat}
        >
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PointCloudUpload;
