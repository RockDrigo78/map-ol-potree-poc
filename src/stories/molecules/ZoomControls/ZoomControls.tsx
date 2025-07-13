import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { Add as AddIcon, Remove as RemoveIcon } from "@mui/icons-material";
import type { FC } from "react";

type ZoomControlsProps = {
  handleZoomIn: () => void;
  handleZoomOut: () => void;
};

const ZoomControls: FC<ZoomControlsProps> = ({
  handleZoomIn,
  handleZoomOut,
}) => {
  return (
    <ToggleButtonGroup
      orientation="vertical"
      sx={{
        width: "fit-content",
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
  );
};

export default ZoomControls;
