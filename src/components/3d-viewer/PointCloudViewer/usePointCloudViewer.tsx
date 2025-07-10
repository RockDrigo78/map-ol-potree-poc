import { useEffect, useState } from "react";
import * as THREE from "three";
import type { PointCloud } from "../../../types/map";

const usePointCloudViewer = (
  pointCloud: PointCloud,
  mountRef: React.RefObject<HTMLDivElement | null>,
  sceneRef: React.RefObject<THREE.Scene | null>,
  rendererRef: React.RefObject<THREE.WebGLRenderer | null>,
  cameraRef: React.RefObject<THREE.PerspectiveCamera | null>
) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
    camera.position.set(0, 0, 100);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Add grid helper
    const gridHelper = new THREE.GridHelper(100, 20);
    scene.add(gridHelper);

    // Animation loop
    let animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    // Load point cloud with Potree
    const loadPointCloud = async () => {
      try {
        setLoading(true);
        setError(null);

        // For demo purposes, create a sample point cloud
        // In production, you would load actual point cloud data
        const geometry = new THREE.BufferGeometry();
        const pointCount = 10000;
        const positions = new Float32Array(pointCount * 3);
        const colors = new Float32Array(pointCount * 3);

        for (let i = 0; i < pointCount; i++) {
          positions[i * 3] = (Math.random() - 0.5) * 50;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 50;

          colors[i * 3] = Math.random();
          colors[i * 3 + 1] = Math.random();
          colors[i * 3 + 2] = Math.random();
        }

        geometry.setAttribute(
          "position",
          new THREE.BufferAttribute(positions, 3)
        );
        geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
          size: 0.1,
          vertexColors: true,
          sizeAttenuation: true,
        });

        const points = new THREE.Points(geometry, material);
        scene.add(points);

        // Auto-rotate camera around the point cloud
        const animateCamera = () => {
          const time = Date.now() * 0.001;
          camera.position.x = Math.cos(time * 0.5) * 100;
          camera.position.z = Math.sin(time * 0.5) * 100;
          camera.lookAt(0, 0, 0);
        };

        // Add camera animation to the render loop
        animate = () => {
          requestAnimationFrame(animate);
          animateCamera();
          renderer.render(scene, camera);
        };

        setLoading(false);
      } catch (err) {
        setError("Failed to load point cloud");
        setLoading(false);
        console.error("Error loading point cloud:", err);
      }
    };

    loadPointCloud();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [pointCloud]);
  return {
    error,
    setError,
    loading,
    setLoading,
  };
};

export default usePointCloudViewer;
