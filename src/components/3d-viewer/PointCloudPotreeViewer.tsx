import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { Potree } from "potree-core";

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

  useEffect(() => {
    const width = containerRef.current?.clientWidth || 800;
    const height = containerRef.current?.clientHeight || 600;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 10000);
    camera.position.set(0, 0, 10);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    rendererRef.current = renderer;

    // Add renderer to DOM
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(renderer.domElement);
    }

    // OrbitControls (from potree-core)
    // @ts-ignore
    const controls = new Potree.OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const directional = new THREE.DirectionalLight(0xffffff, 0.8);
    directional.position.set(10, 10, 10);
    scene.add(directional);

    // Load Potree point cloud
    const potree = new Potree();
    const baseUrl = `/${pointCloudPath}/`;
    // Try both cloud.js and metadata.json
    const tryLoad = async () => {
      let loaded = false;
      for (const file of ["cloud.js", "metadata.json"]) {
        try {
          // potree.loadPointCloud(url, baseUrl)
          const url = `${baseUrl}${file}`;
          // @ts-ignore
          const pco = await potree.loadPointCloud(url, baseUrl);
          scene.add(pco);
          pointCloudsRef.current.push(pco);
          loaded = true;
          break;
        } catch (e) {
          // Try next file
        }
      }
      if (!loaded) {
        // eslint-disable-next-line no-console
        console.error("Failed to load Potree point cloud from", baseUrl);
      }
    };
    tryLoad();

    // Animation loop
    const animate = () => {
      if (pointCloudsRef.current.length > 0) {
        potree.updatePointClouds(pointCloudsRef.current, camera, renderer);
      }
      controls.update && controls.update();
      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      renderer.dispose();
      // Remove all objects from scene
      scene.clear();
      pointCloudsRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointCloudPath]);

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
