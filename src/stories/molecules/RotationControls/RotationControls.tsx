import { Box, ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
import {
  RotateLeft as RotateLeftIcon,
  RotateRight as RotateRightIcon,
} from "@mui/icons-material";
("@mui/icons-material");
import type { FC } from "react";

type RotationControlsProps = {
  handleRotateLeft: () => void;
  handleResetRotation: () => void;
  handleRotateRight: () => void;
  mapRotationInRad: number;
};

const RotationControls: FC<RotationControlsProps> = ({
  handleRotateLeft,
  handleResetRotation,
  handleRotateRight,
  mapRotationInRad,
}) => {
  return (
    <ToggleButtonGroup
      sx={{
        width: "fit-content",
        bgcolor: "background.paper",
        borderRadius: 1,
        boxShadow: 3,
        p: 1,
        display: "flex",
      }}
    >
      <Tooltip title="Rotate Left">
        <ToggleButton
          value="rotateLeft"
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
          value="resetRotation"
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
              transform: `rotate(${mapRotationInRad}rad)`,
              transition: "transform 0.3s ease",
            }}
          />
        </ToggleButton>
      </Tooltip>
      <Tooltip title="Rotate Right">
        <ToggleButton
          value="rotateRight"
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
  );
};

export default RotationControls;
