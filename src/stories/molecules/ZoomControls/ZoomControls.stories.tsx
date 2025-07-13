import type { Meta, StoryObj } from "@storybook/react-vite";

import ZoomControls from "./ZoomControls";

const meta = {
  title: "Molecules/ZoomControls",
  tags: ["autodocs"],
  component: ZoomControls,
} satisfies Meta<typeof ZoomControls>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Basic = {
  args: {
    handleZoomIn: () => console.log("Zoom In"),
    handleZoomOut: () => console.log("Zoom Out"),
  },
} satisfies Story;
