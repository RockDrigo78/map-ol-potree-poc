import React, { useState } from "react";
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
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [lon, setLon] = useState("");
  const [lat, setLat] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!file) {
      newErrors.file = "Please select a file";
    } else {
      const validTypes = [".las", ".laz", ".ply", ".xyz", ".pts"];
      const fileExtension = file.name
        .toLowerCase()
        .substring(file.name.lastIndexOf("."));
      if (!validTypes.includes(fileExtension)) {
        newErrors.file =
          "Please select a valid point cloud file (.las, .laz, .ply, .xyz, .pts)";
      }
    }

    const lonNum = parseFloat(lon);
    if (isNaN(lonNum) || lonNum < -180 || lonNum > 180) {
      newErrors.lon = "Longitude must be between -180 and 180";
    }

    const latNum = parseFloat(lat);
    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      newErrors.lat = "Latitude must be between -90 and 90";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm() && file) {
      onUpload({
        name: name.trim(),
        file,
        coordinate: [parseFloat(lon), parseFloat(lat)],
      });
      setName("");
      setFile(null);
      setLon("");
      setLat("");
      setErrors({});
      onClose();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile && errors.file) {
      setErrors((prev) => ({ ...prev, file: "" }));
    }
  };

  const handleClose = () => {
    setName("");
    setFile(null);
    setLon("");
    setLat("");
    setErrors({});
    onClose();
  };

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
