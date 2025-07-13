import type { Meta, StoryObj } from "@storybook/react-vite";

import RotationControls from "./RotationControls";
import { fn } from "storybook/test";

const meta = {
  title: "Molecules/RotationControls",
  tags: ["autodocs"],
  component: RotationControls,
} satisfies Meta<typeof RotationControls>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Basic = {
  args: {
    handleResetRotation: fn(),
    handleRotateLeft: fn(),
    handleRotateRight: fn(),
    mapRotationInRad: 0,
  },
} satisfies Story;
