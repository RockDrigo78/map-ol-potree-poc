import React, { useRef } from "react";
import * as THREE from "three";
import usePointCloudPotreeViewer from "./usePointCloudPotreeViewer";

interface PointCloudPotreeViewerProps {
  /**
   * The folder (relative to public/) containing the Potree-converted point cloud (should contain cloud.js or metadata.json)
   * Example: "pointclouds/mycloud" for public/pointclouds/mycloud/cloud.js
   */
  pointCloudPath: string;
}

const PointCloudPotreeViewer: React.FC<PointCloudPotreeViewerProps> = ({
  pointCloudPath,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<any>(null);
  const pointCloudsRef = useRef<any[]>([]);
  const animationRef = useRef<number | null>(null);

  const {} = usePointCloudPotreeViewer(
    pointCloudPath,
    containerRef,
    rendererRef,
    sceneRef,
    cameraRef,
    controlsRef,
    pointCloudsRef,
    animationRef
  );

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        minHeight: 400,
        background: "#222",
      }}
    />
  );
};

export default PointCloudPotreeViewer;
