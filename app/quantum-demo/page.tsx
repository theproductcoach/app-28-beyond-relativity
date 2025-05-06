"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// Constants for the simulation
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const SOURCE_X = 100;
const SOURCE_Y = CANVAS_HEIGHT / 2;
const SCREEN_X = CANVAS_WIDTH - 150;
const SLIT_PANEL_X = 350;
const DEFAULT_PARTICLE_COUNT = 2000;

export default function QuantumDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<any[]>([]);
  const detectionPatternRef = useRef<number[]>(Array(CANVAS_HEIGHT).fill(0));
  const animationRef = useRef<number | null>(null);

  // Simulation states
  const [running, setRunning] = useState<boolean>(false);
  const [particleType, setParticleType] = useState<string>("electron");
  const [observe, setObserve] = useState<boolean>(false);
  const [slitCount, setSlitCount] = useState<number>(2);
  const [slitWidth, setSlitWidth] = useState<number>(20);
  const [slitSeparation, setSlitSeparation] = useState<number>(100);
  const [particleCount, setParticleCount] = useState<number>(
    DEFAULT_PARTICLE_COUNT
  );
  const [completedParticles, setCompletedParticles] = useState<number>(0);
  const [showExplanation, setShowExplanation] = useState<boolean>(true);

  // Reset the simulation
  const resetSimulation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    setRunning(false);
    setCompletedParticles(0);
    particlesRef.current = [];
    detectionPatternRef.current = Array(CANVAS_HEIGHT).fill(0);

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        drawBackground(ctx);
      }
    }
  };

  // Start the simulation
  const startSimulation = () => {
    resetSimulation();
    initializeParticles();
    setRunning(true);
  };

  // Initialize particles for the simulation
  const initializeParticles = () => {
    particlesRef.current = Array(particleCount)
      .fill(0)
      .map(() => ({
        x: SOURCE_X,
        y: SOURCE_Y,
        vx: Math.random() * 1.5 + 0.8,
        vy: (Math.random() - 0.5) * 1.6,
        detected: false,
        whichSlit: 0, // 0 = not yet determined, 1 = top slit, 2 = bottom slit
      }));
  };

  // Draw the background elements (source, slits, screen)
  const drawBackground = (ctx: CanvasRenderingContext2D) => {
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Background
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw source
    ctx.fillStyle = particleType === "electron" ? "#00AAFF" : "#FFAA00";
    ctx.beginPath();
    ctx.arc(SOURCE_X, SOURCE_Y, 8, 0, Math.PI * 2);
    ctx.fill();

    // Draw slit panel
    ctx.fillStyle = "#444";
    ctx.fillRect(SLIT_PANEL_X, 0, 10, CANVAS_HEIGHT);

    // Draw the slits
    ctx.fillStyle = "#000";
    const centerY = CANVAS_HEIGHT / 2;

    if (slitCount === 1) {
      // Single slit in the center
      ctx.fillRect(SLIT_PANEL_X, centerY - slitWidth / 2, 10, slitWidth);
    } else {
      // Top slit
      ctx.fillRect(
        SLIT_PANEL_X,
        centerY - slitSeparation / 2 - slitWidth,
        10,
        slitWidth
      );
      // Bottom slit
      ctx.fillRect(SLIT_PANEL_X, centerY + slitSeparation / 2, 10, slitWidth);
    }

    // Draw screen
    ctx.fillStyle = "#333";
    ctx.fillRect(SCREEN_X, 0, 5, CANVAS_HEIGHT);

    // Draw detection pattern
    const maxCount = Math.max(...detectionPatternRef.current, 1);

    for (let y = 0; y < CANVAS_HEIGHT; y++) {
      const intensity = detectionPatternRef.current[y] / maxCount;
      if (intensity > 0) {
        const colorIntensity = Math.min(255, Math.floor(intensity * 255));
        ctx.fillStyle =
          particleType === "electron"
            ? `rgba(0, ${colorIntensity}, ${255}, 0.8)`
            : `rgba(255, ${colorIntensity}, 0, 0.8)`;
        ctx.fillRect(SCREEN_X + 6, y, 50 * intensity, 1);
      }
    }

    // Draw labels
    ctx.fillStyle = "#FFF";
    ctx.font = "16px Arial";
    ctx.fillText("Source", SOURCE_X - 20, SOURCE_Y + 30);
    ctx.fillText("Slits", SLIT_PANEL_X - 10, 30);
    ctx.fillText("Detector Screen", SCREEN_X + 10, 30);

    // Draw progress counter
    ctx.fillStyle = "#FFF";
    ctx.font = "14px Arial";
    ctx.fillText(`Particles: ${completedParticles}/${particleCount}`, 20, 30);
  };

  // Calculate quantum wave interference
  const calculateQuantumInterference = (
    y: number,
    slit1Y: number,
    slit2Y: number
  ) => {
    if (particleType === "photon") {
      // Constants for photon waves
      const k = 0.2; // Wave number
      const lambda = (2 * Math.PI) / k; // Wavelength

      // Distance from slits to point on screen
      const d1 = Math.sqrt(
        Math.pow(SCREEN_X - SLIT_PANEL_X, 2) + Math.pow(y - slit1Y, 2)
      );
      const d2 = Math.sqrt(
        Math.pow(SCREEN_X - SLIT_PANEL_X, 2) + Math.pow(y - slit2Y, 2)
      );

      // Phase difference
      const phaseDiff = k * (d2 - d1);

      // Probability amplitude considering interference
      // Use cos² for constructive/destructive interference
      return Math.pow(Math.cos(phaseDiff / 2), 2) * 3.0; // Amplify effect for visibility
    } else {
      // Electron has a shorter effective wavelength
      const k = 0.5; // Increased wave number for more visible bands
      const lambda = (2 * Math.PI) / k; // Wavelength

      const d1 = Math.sqrt(
        Math.pow(SCREEN_X - SLIT_PANEL_X, 2) + Math.pow(y - slit1Y, 2)
      );
      const d2 = Math.sqrt(
        Math.pow(SCREEN_X - SLIT_PANEL_X, 2) + Math.pow(y - slit2Y, 2)
      );

      const phaseDiff = k * (d2 - d1);
      return Math.pow(Math.cos(phaseDiff / 2), 2) * 3.0; // Amplify effect for visibility
    }
  };

  // Update and draw a frame of the simulation
  const updateAndDraw = () => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    drawBackground(ctx);

    // Define slit positions
    const centerY = CANVAS_HEIGHT / 2;
    const slits =
      slitCount === 1
        ? [{ y: centerY, height: slitWidth }]
        : [
            {
              y: centerY - slitSeparation / 2 - slitWidth / 2,
              height: slitWidth,
            },
            {
              y: centerY + slitSeparation / 2 + slitWidth / 2,
              height: slitWidth,
            },
          ];

    // Update particle positions
    let completed = 0;
    particlesRef.current.forEach((particle) => {
      if (particle.detected) {
        completed++;
        return;
      }

      // Move particle
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Check if particle is at slit panel
      if (particle.x >= SLIT_PANEL_X && particle.x <= SLIT_PANEL_X + 10) {
        // If we're observing the slits (Observe Slits mode), force the particle through a specific slit
        if (!observe && particle.whichSlit === 0) {
          // Determine which slit the particle goes through
          let passedThroughSlit = false;

          slits.forEach((slit, index) => {
            if (
              particle.y > slit.y - slit.height / 2 &&
              particle.y < slit.y + slit.height / 2
            ) {
              particle.whichSlit = index + 1;
              passedThroughSlit = true;

              // Add some randomness to show measurement effect
              particle.vy = (Math.random() - 0.5) * 2;
            }
          });

          if (!passedThroughSlit) {
            // Particle hits the panel and stops
            particle.vx = 0;
            particle.vy = 0;
            particle.detected = true;
          }
        }
        // If we're in quantum mode, allow superposition
        else if (observe && particle.whichSlit === 0) {
          // Calculate probability of passing through any slit
          let passedThroughSlit = false;

          slits.forEach((slit, index) => {
            if (
              particle.y > slit.y - slit.height / 2 &&
              particle.y < slit.y + slit.height / 2
            ) {
              passedThroughSlit = true;
            }
          });

          if (!passedThroughSlit) {
            // Particle hits the panel and stops
            particle.vx = 0;
            particle.vy = 0;
            particle.detected = true;
          } else {
            // In quantum mode, we don't record which slit
            particle.whichSlit = -1; // special value for "superposition"
          }
        }
      }

      // Check if particle hit the screen
      if (particle.x >= SCREEN_X) {
        if (observe && slitCount === 2) {
          // Quantum interference pattern (when using Quantum mode and double slit)
          // Get slit positions
          const slit1Y = slits[0].y;
          const slit2Y = slits[1].y;

          // Apply quantum interference to determine if particle is detected
          const probability = calculateQuantumInterference(
            particle.y,
            slit1Y,
            slit2Y
          );

          // Use probability to determine if particle lands at this position
          if (Math.random() < probability) {
            // Record hit on screen - this creates the interference pattern
            const screenY = Math.floor(particle.y);
            if (screenY >= 0 && screenY < CANVAS_HEIGHT) {
              detectionPatternRef.current[screenY]++;
            }
          }
        } else {
          // Classical behavior (when using Observe Slits mode or single slit)
          // Just record the position directly without interference
          const screenY = Math.floor(particle.y);
          if (screenY >= 0 && screenY < CANVAS_HEIGHT) {
            detectionPatternRef.current[screenY]++;
          }
        }

        particle.detected = true;
      }

      // Draw particle
      if (!particle.detected) {
        ctx.fillStyle = particleType === "electron" ? "#00AAFF" : "#FFAA00";
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    setCompletedParticles(completed);

    // Continue animation if not all particles are detected
    if (completed < particleCount && running) {
      animationRef.current = requestAnimationFrame(updateAndDraw);
    } else if (completed >= particleCount) {
      setRunning(false);
    }
  };

  // Handle animation loop
  useEffect(() => {
    if (running) {
      animationRef.current = requestAnimationFrame(updateAndDraw);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [running]);

  // Initialize canvas on mount
  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        drawBackground(ctx);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Redraw when parameters change
  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        drawBackground(ctx);
      }
    }
  }, [slitCount, slitWidth, slitSeparation, particleType, completedParticles]);

  // Fade in content on page load
  useEffect(() => {
    const content = document.getElementById("content");
    if (content) {
      content.style.opacity = "1";
      content.style.transform = "translateY(0)";
    }
  }, []);

  // useEffect for window resize handling
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          drawBackground(ctx);
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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
          Double-Slit Experiment Simulator
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
          Visualize quantum wave-particle duality by experimenting with the
          famous double-slit experiment
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          {/* Experiment canvas */}
          <div
            style={{
              width: "100%",
              maxWidth: `${CANVAS_WIDTH}px`,
              backgroundColor: "#000",
              marginBottom: "1.5rem",
              borderRadius: "8px",
              overflow: "hidden",
              border: "1px solid #333",
              aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`, // This maintains aspect ratio on small screens
              position: "relative",
            }}
          >
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              style={{
                width: "100%",
                height: "100%",
                display: "block",
                objectFit: "contain",
              }}
            />
          </div>

          {/* Control panel */}
          <div
            style={{
              width: "100%",
              maxWidth: "700px",
              backgroundColor: "rgba(52, 152, 219, 0.1)",
              padding: "1.5rem",
              borderRadius: "8px",
              marginBottom: "2rem",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {/* Left column */}
            <div>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>
                  Particle Type
                </label>
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                  }}
                >
                  <button
                    onClick={() => setParticleType("electron")}
                    style={{
                      backgroundColor:
                        particleType === "electron" ? "#00AAFF" : "#222",
                      color: "white",
                      border: "none",
                      padding: "0.5rem 1rem",
                      borderRadius: "4px",
                      cursor: "pointer",
                      flex: 1,
                    }}
                  >
                    Electron
                  </button>
                  <button
                    onClick={() => setParticleType("photon")}
                    style={{
                      backgroundColor:
                        particleType === "photon" ? "#FFAA00" : "#222",
                      color: "white",
                      border: "none",
                      padding: "0.5rem 1rem",
                      borderRadius: "4px",
                      cursor: "pointer",
                      flex: 1,
                    }}
                  >
                    Photon
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>
                  Slit Configuration
                </label>
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                  }}
                >
                  <button
                    onClick={() => setSlitCount(1)}
                    style={{
                      backgroundColor: slitCount === 1 ? "#3498db" : "#222",
                      color: "white",
                      border: "none",
                      padding: "0.5rem 1rem",
                      borderRadius: "4px",
                      cursor: "pointer",
                      flex: 1,
                    }}
                  >
                    Single Slit
                  </button>
                  <button
                    onClick={() => setSlitCount(2)}
                    style={{
                      backgroundColor: slitCount === 2 ? "#3498db" : "#222",
                      color: "white",
                      border: "none",
                      padding: "0.5rem 1rem",
                      borderRadius: "4px",
                      cursor: "pointer",
                      flex: 1,
                    }}
                  >
                    Double Slit
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>
                  Behavior Mode
                </label>
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                  }}
                >
                  <button
                    onClick={() => setObserve(false)}
                    style={{
                      backgroundColor: !observe ? "#3498db" : "#222",
                      color: "white",
                      border: "none",
                      padding: "0.5rem 1rem",
                      borderRadius: "4px",
                      cursor: "pointer",
                      flex: 1,
                    }}
                  >
                    Quantum
                  </button>
                  <button
                    onClick={() => setObserve(true)}
                    style={{
                      backgroundColor: observe ? "#3498db" : "#222",
                      color: "white",
                      border: "none",
                      padding: "0.5rem 1rem",
                      borderRadius: "4px",
                      cursor: "pointer",
                      flex: 1,
                    }}
                  >
                    Classical
                  </button>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>
                  Slit Width: {slitWidth}px
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={slitWidth}
                  onChange={(e) => setSlitWidth(parseInt(e.target.value))}
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>
                  Slit Separation: {slitSeparation}px
                </label>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={slitSeparation}
                  onChange={(e) => setSlitSeparation(parseInt(e.target.value))}
                  style={{ width: "100%" }}
                  disabled={slitCount === 1}
                />
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>
                  Particle Count: {particleCount}
                </label>
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="100"
                  value={particleCount}
                  onChange={(e) => setParticleCount(parseInt(e.target.value))}
                  style={{ width: "100%" }}
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              marginBottom: "2rem",
            }}
          >
            <button
              onClick={startSimulation}
              disabled={running}
              style={{
                backgroundColor: running ? "#555" : "#3498db",
                color: "white",
                border: "none",
                padding: "0.8rem 1.5rem",
                borderRadius: "4px",
                cursor: running ? "default" : "pointer",
                fontSize: "1rem",
                fontWeight: "bold",
              }}
            >
              {running ? "Running..." : "Start Experiment"}
            </button>
            <button
              onClick={resetSimulation}
              style={{
                backgroundColor: "#e74c3c",
                color: "white",
                border: "none",
                padding: "0.8rem 1.5rem",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              Reset
            </button>
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              style={{
                backgroundColor: "#2c3e50",
                color: "white",
                border: "none",
                padding: "0.8rem 1.5rem",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              {showExplanation ? "Hide Explanation" : "Show Explanation"}
            </button>
          </div>

          {/* Explanation panel */}
          {showExplanation && (
            <div
              style={{
                backgroundColor: "rgba(44, 62, 80, 0.2)",
                padding: "1.5rem",
                borderRadius: "8px",
                marginBottom: "2rem",
                maxWidth: "700px",
              }}
            >
              <h3
                style={{
                  margin: "0 0 1rem 0",
                  color: "#3498db",
                  fontSize: "1.3rem",
                }}
              >
                Understanding Quantum Wave-Particle Duality
              </h3>

              <div style={{ marginBottom: "1rem" }}>
                <h4
                  style={{
                    fontSize: "1.1rem",
                    color: "#f1c40f",
                    marginBottom: "0.5rem",
                  }}
                >
                  What You're Seeing
                </h4>
                <p>
                  In the <strong>Interference Pattern</strong> mode, particles
                  like electrons and photons behave as waves and create an
                  interference pattern on the detector screen—even when sent one
                  at a time! This demonstrates the wave-particle duality at the
                  heart of quantum mechanics.
                </p>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <h4
                  style={{
                    fontSize: "1.1rem",
                    color: "#f1c40f",
                    marginBottom: "0.5rem",
                  }}
                >
                  The Observer Effect
                </h4>
                <p>
                  When you switch to <strong>Classical</strong> mode, you're
                  "watching" which slit each particle goes through. According to
                  quantum mechanics, this measurement forces the particle to
                  choose a specific path, destroying the wave-like behavior and
                  interference pattern.
                </p>
              </div>

              <div>
                <h4
                  style={{
                    fontSize: "1.1rem",
                    color: "#f1c40f",
                    marginBottom: "0.5rem",
                  }}
                >
                  Try This
                </h4>
                <ol style={{ paddingLeft: "1.5rem", margin: "0" }}>
                  <li>
                    Run with double slits in Interference Pattern mode and
                    observe the striped interference pattern
                  </li>
                  <li>
                    Switch to Two Distinct Bands mode and notice how the pattern
                    changes to two distinct bands
                  </li>
                  <li>
                    Try a single slit and see diffraction rather than
                    interference
                  </li>
                  <li>
                    Compare electrons and photons with different slit widths and
                    separations
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* Final explanation */}
          <section
            style={{
              maxWidth: "700px",
              margin: "1rem auto",
            }}
          >
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
              Why Einstein Was Troubled By Quantum Mechanics
            </h2>
            <p>
              Albert Einstein famously said "God does not play dice with the
              universe" in response to the probabilistic nature of quantum
              mechanics. The double-slit experiment reveals a fundamental limit
              to Einstein's classical view of physics.
            </p>
            <p style={{ marginTop: "1rem" }}>
              In quantum mechanics, particles exist in "superposition" states
              until observed. This means they simultaneously follow all possible
              paths—traveling through both slits at once—creating wave-like
              interference patterns. But when we try to observe which path they
              take, the very act of measurement forces the particle to choose
              just one path.
            </p>
            <p style={{ marginTop: "1rem" }}>
              This behavior, which Einstein called "spooky action," represents a
              profound breakdown in our ability to predict the exact behavior of
              individual particles—one of the reasons why Einstein's
              deterministic view of physics fails at the quantum scale, where
              probability and uncertainty rule.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
