import React, { useState } from "react";

const usePointCloudUpload = (
  onClose: () => void,
  onUpload: (data: {
    name: string;
    file: File;
    coordinate: [number, number];
  }) => void
) => {
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
      const validTypes = [".las", ".laz", ".ply", ".xyz", ".pts", ".rwcx"];
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
  return {
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
  };
};

export default usePointCloudUpload;
