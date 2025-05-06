"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Add MathJax type declaration
declare global {
  interface Window {
    MathJax: any;
  }
}

export default function BlackHoles() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshRef = useRef<THREE.Object3D | null>(null);
  const frameIdRef = useRef<number>(0);
  const controlsRef = useRef<OrbitControls | null>(null);
  const equationRef = useRef<HTMLDivElement>(null);

  const [mass, setMass] = useState<number>(5);
  const [loading, setLoading] = useState<boolean>(true);
  const [curvatureValue, setCurvatureValue] = useState<string>("0");
  const [eventHorizonRadius, setEventHorizonRadius] = useState<string>("0");
  const [rawCurvature, setRawCurvature] = useState<number>(0);

  // Initialize Three.js scene
  useEffect(() => {
    // Load MathJax for equation rendering
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
    script.async = true;
    document.head.appendChild(script);

    if (!canvasRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(15, 10, 15);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      canvasRef.current.clientWidth,
      canvasRef.current.clientHeight
    );
    renderer.setPixelRatio(window.devicePixelRatio);
    canvasRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controlsRef.current = controls;

    // Create the warped surface
    createWarpedSurface(mass);

    // Handle window resize
    const handleResize = () => {
      if (!canvasRef.current || !cameraRef.current || !rendererRef.current)
        return;

      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();

      rendererRef.current.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // Animation loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();
    setLoading(false);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frameIdRef.current);

      if (rendererRef.current && canvasRef.current) {
        canvasRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Create/update the warped surface when mass changes
  useEffect(() => {
    const values = calculateValues(mass);
    setCurvatureValue(values.curvature);
    setEventHorizonRadius(values.radius);
    setRawCurvature(values.rawCurvature);
    createWarpedSurface(mass);
    updateEquation();
  }, [mass]);

  // Function to create the warped surface
  const createWarpedSurface = (mass: number) => {
    if (!sceneRef.current) return;

    // Remove previous mesh if it exists
    if (meshRef.current) {
      sceneRef.current.remove(meshRef.current);

      // Safely dispose meshRef elements by checking if they exist
      if (meshRef.current instanceof THREE.Mesh) {
        if (meshRef.current.geometry) {
          meshRef.current.geometry.dispose();
        }
        if (meshRef.current.material) {
          if (Array.isArray(meshRef.current.material)) {
            meshRef.current.material.forEach((material) => material.dispose());
          } else {
            meshRef.current.material.dispose();
          }
        }
      } else if (meshRef.current instanceof THREE.Group) {
        // Dispose all children of the group
        meshRef.current.children.forEach((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((material) => material.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
      }

      // Remove any existing objects
      sceneRef.current.children = sceneRef.current.children.filter(
        (child) =>
          !(child instanceof THREE.Mesh || child instanceof THREE.Group)
      );
    }

    // Create a funnel-shaped grid
    const group = new THREE.Group();

    // Grid parameters
    const gridSize = 20;
    const gridDivisions = 20;
    const cellSize = gridSize / gridDivisions;

    // Create the grid wireframe
    const gridGeometry = new THREE.PlaneGeometry(
      gridSize,
      gridSize,
      gridDivisions,
      gridDivisions
    );

    // Create and apply the funnel distortion
    const vertices = gridGeometry.attributes.position;
    const center = new THREE.Vector3(0, 0, 0);

    for (let i = 0; i < vertices.count; i++) {
      const x = vertices.getX(i);
      const z = vertices.getY(i); // Note: Y is Z in the plane geometry when rotated

      // Calculate distance from center
      const distance = Math.sqrt(x * x + z * z);

      // Calculate the depth of the funnel based on mass and distance
      let depth;
      if (distance < 0.5) {
        // Create a steep funnel near the center
        depth = -mass * 8;
      } else if (distance < 3) {
        // Transition zone - steeper curve
        const normalizedDist = (distance - 0.5) / 2.5;
        depth = -mass * (8 - 7 * Math.pow(normalizedDist, 0.6));
      } else {
        // Outer zone - more gradual curve
        const normalizedDist = Math.min(1, (distance - 3) / (gridSize / 2 - 3));
        depth = -mass * (1 - 0.9 * Math.pow(normalizedDist, 0.5));
      }

      // Apply the distortion
      vertices.setZ(i, depth);
    }

    // Enable normals for proper lighting
    gridGeometry.computeVertexNormals();

    // Create a material for the grid
    const gridMaterial = new THREE.MeshBasicMaterial({
      color: 0x3498db,
      wireframe: true,
      transparent: true,
      opacity: 0.8,
    });

    // Create the grid mesh
    const gridMesh = new THREE.Mesh(gridGeometry, gridMaterial);
    gridMesh.rotation.x = -Math.PI / 2; // Rotate to horizontal
    group.add(gridMesh);

    // Add radial lines for a more complete grid
    const radiusStep = gridSize / 2 / 10;
    for (
      let radius = radiusStep;
      radius <= gridSize / 2;
      radius += radiusStep
    ) {
      const circleGeometry = new THREE.CircleGeometry(radius, 64);
      // Remove the center vertex to create just the outline
      const positions = circleGeometry.attributes.position.array;
      const indices = [];
      for (let i = 1; i < positions.length / 3; i++) {
        indices.push(i);
      }

      const circleEdgeGeometry = new THREE.BufferGeometry();
      circleEdgeGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
      );
      circleEdgeGeometry.setIndex(indices);

      // Apply the same distortion to the circle
      const circleVertices = circleEdgeGeometry.attributes.position;
      for (let i = 0; i < circleVertices.count; i++) {
        const x = circleVertices.getX(i);
        const z = circleVertices.getY(i);

        // Calculate distance from center
        const distance = Math.sqrt(x * x + z * z);

        // Calculate depth using the same formula
        let depth;
        if (distance < 0.5) {
          depth = -mass * 8;
        } else if (distance < 3) {
          const normalizedDist = (distance - 0.5) / 2.5;
          depth = -mass * (8 - 7 * Math.pow(normalizedDist, 0.6));
        } else {
          const normalizedDist = Math.min(
            1,
            (distance - 3) / (gridSize / 2 - 3)
          );
          depth = -mass * (1 - 0.9 * Math.pow(normalizedDist, 0.5));
        }

        circleVertices.setZ(i, depth);
      }

      const circleMaterial = new THREE.LineBasicMaterial({
        color: 0x3498db,
        transparent: true,
        opacity: 0.5,
      });

      const circleLine = new THREE.Line(circleEdgeGeometry, circleMaterial);
      circleLine.rotation.x = -Math.PI / 2;
      group.add(circleLine);
    }

    // Add radial lines
    const angleStep = Math.PI / 12;
    for (let angle = 0; angle < Math.PI * 2; angle += angleStep) {
      const points = [];

      for (let r = 0; r <= gridSize / 2; r += 0.5) {
        const x = r * Math.cos(angle);
        const z = r * Math.sin(angle);

        // Calculate depth using the same formula
        let y;
        const distance = Math.sqrt(x * x + z * z);

        if (distance < 0.5) {
          y = -mass * 8;
        } else if (distance < 3) {
          const normalizedDist = (distance - 0.5) / 2.5;
          y = -mass * (8 - 7 * Math.pow(normalizedDist, 0.6));
        } else {
          const normalizedDist = Math.min(
            1,
            (distance - 3) / (gridSize / 2 - 3)
          );
          y = -mass * (1 - 0.9 * Math.pow(normalizedDist, 0.5));
        }

        points.push(new THREE.Vector3(x, y, z));
      }

      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x3498db,
        transparent: true,
        opacity: 0.5,
      });

      const line = new THREE.Line(lineGeometry, lineMaterial);
      group.add(line);
    }

    // Add a sphere at the bottom of the funnel
    const sphereSize = Math.max(0.3, mass * 0.15);
    const sphereGeometry = new THREE.SphereGeometry(sphereSize, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0xf39c12,
      emissive: 0xe67e22,
      emissiveIntensity: 0.5,
    });

    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(0, -mass * 8, 0);
    group.add(sphere);

    // Add a glow effect
    const glowGeometry = new THREE.SphereGeometry(sphereSize * 1.5, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xf39c12,
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide,
    });

    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    glowMesh.position.copy(sphere.position);
    group.add(glowMesh);

    // Add the group to the scene
    sceneRef.current.add(group);
    meshRef.current = group;

    // Add ambient light for better visibility
    const ambientLight = new THREE.AmbientLight(0x404040);
    sceneRef.current.add(ambientLight);

    // Add directional light for better visualization
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    sceneRef.current.add(directionalLight);
  };

  // Add a fade-in effect on page load
  useEffect(() => {
    const content = document.getElementById("content");
    if (content) {
      content.style.opacity = "1";
      content.style.transform = "translateY(0)";
    }
  }, []);

  // Functions to get the gravitational equations for the current mass
  const getEquation = () => {
    if (mass <= 5) {
      return "R_{\\mu\\nu} - \\frac{1}{2}R g_{\\mu\\nu} = \\frac{8\\pi G}{c^4}T_{\\mu\\nu}";
    } else if (mass <= 10) {
      return "R_{\\mu\\nu} - \\frac{1}{2}R g_{\\mu\\nu} + \\Lambda g_{\\mu\\nu} = \\frac{8\\pi G}{c^4}T_{\\mu\\nu}";
    } else {
      return "g_{tt} = -\\left(1-\\frac{2GM}{c^2r}\\right)";
    }
  };

  const getExplanation = () => {
    if (mass <= 5) {
      return "Einstein's Field Equations: Describe how mass curves spacetime";
    } else if (mass <= 10) {
      return "Field Equations with Cosmological Constant: Increasing curvature effects";
    } else {
      return "Schwarzschild Metric: Approaching the event horizon as mass increases";
    }
  };

  // Update the displayed equation
  const updateEquation = () => {
    if (
      typeof window !== "undefined" &&
      window.MathJax &&
      equationRef.current
    ) {
      equationRef.current.innerHTML = "\\(" + getEquation() + "\\)";
      (window as any).MathJax.typeset([equationRef.current]);
    }
  };

  // Function to calculate curvature values based on mass
  const calculateValues = (mass: number) => {
    try {
      // Simplified Kretschmann scalar (measure of spacetime curvature)
      // K = 48G²M²/(c⁴r⁶) at the Schwarzschild radius r = 2GM/c²
      const G = 6.6743e-11; // Gravitational constant
      const c = 299792458; // Speed of light
      const solarMassKg = 1.989e30; // Mass of the sun in kg

      // Convert our mass factor to kg (assuming factor is in solar masses)
      const massKg = mass * solarMassKg;

      // Calculate Schwarzschild radius (event horizon)
      const schwarzschildRadius = (2 * G * massKg) / (c * c);

      // Format the result to be more readable
      const schwarzschildRadiusKm = schwarzschildRadius / 1000;

      // Calculate curvature at 1.1 times the Schwarzschild radius
      // (slightly outside the event horizon where we can still measure)
      const observationDistance = schwarzschildRadius * 1.1;

      // Calculate Kretschmann scalar (measure of curvature)
      // K = 48G²M²/(c⁴r⁶)
      const kretschmann =
        (48 * G * G * massKg * massKg) /
        (c * c * c * c * Math.pow(observationDistance, 6));

      // For debugging output to browser console
      console.log(`Mass: ${mass} solar masses`);
      console.log(
        `Schwarzschild radius: ${schwarzschildRadiusKm.toFixed(2)} km`
      );
      console.log(`Kretschmann scalar: ${kretschmann.toExponential(4)}`);

      // Format the values with appropriate units and scientific notation
      // Always use scientific notation for clarity
      const formattedKretschmann = kretschmann.toExponential(2) + " m⁻⁴";

      const formattedRadius =
        schwarzschildRadiusKm.toLocaleString(undefined, {
          maximumFractionDigits: 1,
        }) + " km";

      return {
        curvature: formattedKretschmann,
        radius: formattedRadius,
        rawCurvature: kretschmann, // Store raw value for comparison
      };
    } catch (error) {
      console.error("Error in calculation:", error);
      return {
        curvature: "Error in calculation",
        radius: "Error in calculation",
        rawCurvature: 0,
      };
    }
  };

  return (
    <main
      style={{
        padding: "2rem",
        fontFamily: "sans-serif",
        maxWidth: "900px",
        width: "92%",
        margin: "auto",
        backgroundColor: "#000",
        color: "#fff",
        minHeight: "100vh",
        lineHeight: 1.6,
      }}
    >
      <div
        id="content"
        style={{
          opacity: 0,
          transform: "translateY(20px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      >
        <Link href="/">
          <button
            style={{
              backgroundColor: "transparent",
              color: "#888",
              border: "none",
              padding: "0.5rem 0",
              fontSize: "0.9rem",
              cursor: "pointer",
              marginBottom: "2rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            ← Back to overview
          </button>
        </Link>

        <h1
          style={{
            fontSize: "2.5rem",
            textAlign: "center",
            marginBottom: "1rem",
          }}
        >
          Black Hole Spacetime Warping
        </h1>

        <p
          style={{
            fontSize: "1.2rem",
            marginBottom: "2rem",
            textAlign: "center",
            maxWidth: "700px",
            margin: "0 auto 2rem auto",
          }}
        >
          Interactive visualization of gravity's effect on spacetime
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          {/* Left side: 3D visualization */}
          <div
            ref={canvasRef}
            style={{
              width: "100%",
              height: "400px",
              backgroundColor: "#000",
              position: "relative",
              marginBottom: "1rem",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            {loading && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  color: "white",
                }}
              >
                Loading visualization...
              </div>
            )}
          </div>

          {/* Mass slider */}
          <div style={{ width: "100%", margin: "0 auto", maxWidth: "700px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              <span>Mass Factor:</span>
              <span>{mass.toFixed(1)} M☉</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              step="0.1"
              value={mass}
              onChange={(e) => setMass(parseFloat(e.target.value))}
              style={{
                width: "100%",
                accentColor: "#3498db",
                background: "#222",
                height: "8px",
                borderRadius: "4px",
                outline: "none",
              }}
            />
          </div>

          {/* Equation display */}
          <div
            style={{
              width: "100%",
              padding: "1.5rem",
              backgroundColor: "rgba(52, 152, 219, 0.1)",
              borderRadius: "8px",
              textAlign: "center",
              marginTop: "1rem",
              maxWidth: "700px",
              margin: "1rem auto 0 auto",
            }}
          >
            <div style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
              {getExplanation()}
            </div>

            <div
              style={{
                width: "100%",
                padding: "1rem",
                overflow: "auto",
                fontSize: "1.4rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* MathJax will render this div */}
              <div
                ref={equationRef}
                style={{
                  minHeight: "50px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1rem",
                }}
              >
                {`\\(${getEquation()}\\)`}
              </div>

              {/* Numerical examples */}
              <div
                style={{
                  fontSize: "1rem",
                  backgroundColor: "rgba(0, 0, 0, 0.2)",
                  padding: "1rem",
                  borderRadius: "4px",
                  maxWidth: "100%",
                  overflow: "auto",
                  marginTop: "0.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <div>With {mass.toFixed(1)} solar masses:</div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "2rem",
                  }}
                >
                  <span>Event Horizon Radius:</span>
                  <span style={{ fontWeight: "bold", color: "#3498db" }}>
                    {eventHorizonRadius}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "2rem",
                  }}
                >
                  <span>Spacetime Curvature:</span>
                  <span
                    style={{
                      fontWeight: "bold",
                      color: mass > 10 ? "#e74c3c" : "#3498db",
                    }}
                  >
                    {curvatureValue}
                  </span>
                </div>
                <div
                  style={{
                    color: "#e74c3c",
                    fontSize: "0.9rem",
                    marginTop: "0.5rem",
                  }}
                >
                  At {mass.toFixed(1)} solar masses, spacetime curvature becomes
                  extremely intense near the event horizon!
                  {rawCurvature > 1e30 &&
                    " At this point, curvature is approaching infinity, where Einstein's equations break down."}
                </div>
              </div>
            </div>
          </div>
        </div>

        <section
          style={{
            marginTop: "3rem",
            maxWidth: "700px",
            margin: "3rem auto 0 auto",
          }}
        >
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
            Understanding Spacetime Curvature
          </h2>
          <p>
            This visualization demonstrates how mass warps the fabric of
            spacetime according to Einstein's theory of General Relativity. As
            you increase the mass using the slider, you can observe how the
            curvature becomes more pronounced.
          </p>
          <p style={{ marginTop: "1rem" }}>
            In the vicinity of a black hole, this curvature becomes extreme. At
            a certain point (the event horizon), the curvature is so severe that
            not even light can escape. Beyond this point, Einstein's equations
            predict a singularity where spacetime curvature becomes infinite - a
            breakdown point in our current understanding of physics.
          </p>
        </section>
      </div>
    </main>
  );
}
