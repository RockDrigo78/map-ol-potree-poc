// Replace your-framework with the framework you are using, e.g. react-vite, nextjs, vue3-vite, etc.
import type { Meta, StoryObj } from "@storybook/react-vite";

import MapToolbar from "./MapToolbar";
import { fn } from "storybook/internal/test";

const meta = {
  title: "Molecules/MapToolbar",
  tags: ["autodocs"],
  component: MapToolbar,
} satisfies Meta<typeof MapToolbar>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Point = {
  args: {
    drawingMode: "Point",
    onDrawingModeChange: fn(),
  },
} satisfies Story;

export const Line = {
  args: {
    drawingMode: "LineString",
    onDrawingModeChange: fn(),
  },
} satisfies Story;

export const Polygon = {
  args: {
    drawingMode: "Polygon",
    onDrawingModeChange: fn(),
  },
} satisfies Story;

export const Unselected = {
  args: {
    drawingMode: null,
    onDrawingModeChange: fn(),
  },
} satisfies Story;
