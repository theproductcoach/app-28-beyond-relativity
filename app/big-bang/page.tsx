"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

// Define key cosmic events in the universe timeline
const cosmicEvents = [
  {
    time: 0,
    age: "0",
    event: "Big Bang",
    description: "The universe begins as an infinitely hot, dense singularity.",
  },
  {
    time: 10,
    age: "10⁻⁴³s",
    event: "Planck Epoch",
    description: "Quantum gravity era - our physics breaks down completely.",
  },
  {
    time: 20,
    age: "10⁻³⁶s",
    event: "Inflation Begins",
    description:
      "The universe expands exponentially, increasing its size by a factor of 10²⁶ in just a fraction of a second.",
  },
  {
    time: 30,
    age: "10⁻³²s",
    event: "Inflation Ends",
    description: "The universe is now filled with a hot quark-gluon plasma.",
  },
  {
    time: 40,
    age: "1s",
    event: "Nucleosynthesis",
    description: "Protons and neutrons form as the universe cools.",
  },
  {
    time: 50,
    age: "3 minutes",
    event: "Light Elements Form",
    description:
      "Hydrogen and helium nuclei form as the universe continues to cool.",
  },
  {
    time: 60,
    age: "380,000 years",
    event: "Recombination",
    description:
      "Electrons bind to nuclei, forming neutral atoms. The universe becomes transparent to light.",
  },
  {
    time: 70,
    age: "100 million years",
    event: "First Stars",
    description:
      "Gravity pulls matter together to form the first stars, ending the cosmic dark ages.",
  },
  {
    time: 80,
    age: "1 billion years",
    event: "First Galaxies",
    description: "Stars group together to form the first galaxies.",
  },
  {
    time: 90,
    age: "9 billion years",
    event: "Solar System Forms",
    description: "Our sun and planets form from a molecular cloud.",
  },
  {
    time: 100,
    age: "13.8 billion years",
    event: "Present Day",
    description:
      "The universe continues to expand and cool, with galaxies moving further apart.",
  },
];

export default function BigBang() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [time, setTime] = useState<number>(50);
  const [playing, setPlaying] = useState<boolean>(false);
  const [currentEvent, setCurrentEvent] = useState(cosmicEvents[4]); // Start at nucleosynthesis
  const animationRef = useRef<number | null>(null);

  // Handle time slider change
  const handleTimeChange = (newTime: number) => {
    setTime(newTime);

    // Find the current cosmic event based on time
    const event =
      cosmicEvents.find((e, index) => {
        return newTime <= e.time || index === cosmicEvents.length - 1;
      }) || cosmicEvents[0];

    setCurrentEvent(event);
  };

  // Play/pause the animation
  const togglePlay = () => {
    setPlaying(!playing);
  };

  // Expansion animation
  useEffect(() => {
    if (playing) {
      let frameCount = time;

      const animate = () => {
        frameCount += 0.2;
        if (frameCount > 100) {
          frameCount = 100;
          setPlaying(false);
        }

        handleTimeChange(frameCount);
        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [playing, time]);

  // Draw the universe simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Calculate universe size based on time
    // Non-linear expansion to simulate cosmic inflation
    let universeSize;
    if (time < 20) {
      // Early universe - very small
      universeSize = 5 + time * 0.5;
    } else if (time < 30) {
      // Inflation period - rapid expansion
      const inflationProgress = (time - 20) / 10;
      universeSize = 15 + inflationProgress * inflationProgress * 100;
    } else {
      // Post-inflation - slower expansion
      universeSize = 115 + (time - 30) * 3;
    }

    // Set max size to fit canvas
    const maxRadius = Math.min(centerX, centerY) * 0.9;
    universeSize = Math.min(universeSize, maxRadius);

    // Draw the universe
    const gradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      universeSize
    );

    // Color based on era
    if (time < 20) {
      // Planck epoch - intense white/purple
      gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
      gradient.addColorStop(0.7, "rgba(180, 100, 255, 0.7)");
      gradient.addColorStop(1, "rgba(120, 0, 255, 0)");
    } else if (time < 40) {
      // Early universe - hot/red
      gradient.addColorStop(0, "rgba(255, 255, 200, 1)");
      gradient.addColorStop(0.6, "rgba(255, 100, 50, 0.8)");
      gradient.addColorStop(1, "rgba(150, 50, 50, 0)");
    } else if (time < 60) {
      // Recombination era - orange/yellow
      gradient.addColorStop(0, "rgba(255, 230, 150, 1)");
      gradient.addColorStop(0.7, "rgba(200, 140, 50, 0.7)");
      gradient.addColorStop(1, "rgba(100, 70, 20, 0)");
    } else if (time < 80) {
      // First stars - blue hint
      gradient.addColorStop(0, "rgba(230, 230, 255, 1)");
      gradient.addColorStop(0.5, "rgba(100, 130, 255, 0.6)");
      gradient.addColorStop(0.9, "rgba(30, 50, 120, 0.3)");
      gradient.addColorStop(1, "rgba(10, 20, 80, 0)");
    } else {
      // Modern universe - blue/black
      gradient.addColorStop(0, "rgba(200, 220, 255, 1)");
      gradient.addColorStop(0.4, "rgba(50, 100, 200, 0.6)");
      gradient.addColorStop(0.8, "rgba(20, 30, 80, 0.3)");
      gradient.addColorStop(1, "rgba(0, 5, 20, 0)");
    }

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, universeSize, 0, Math.PI * 2);
    ctx.fill();

    // Add stars if we're in later eras
    if (time >= 70) {
      const starCount = Math.min(500, Math.floor((time - 70) * 20));
      for (let i = 0; i < starCount; i++) {
        // Random position within the universe
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * universeSize * 0.9;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;

        // Random star size
        const starSize = Math.random() * 1.5 + 0.5;

        // Star color varies with age
        const brightness = Math.random() * 55 + 200;
        const blueShift = Math.random() * 55;
        const starColor = `rgba(${brightness}, ${brightness}, ${
          brightness + blueShift
        }, ${Math.random() * 0.5 + 0.5})`;

        // Draw the star
        ctx.fillStyle = starColor;
        ctx.beginPath();
        ctx.arc(x, y, starSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Show galaxy structures in later eras
    if (time >= 80) {
      const galaxyCount = Math.floor((time - 80) * 0.5) + 3;

      for (let i = 0; i < galaxyCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * universeSize * 0.7;
        const galaxyX = centerX + Math.cos(angle) * distance;
        const galaxyY = centerY + Math.sin(angle) * distance;
        const galaxySize = Math.random() * 15 + 10;

        // Draw spiral galaxy
        const galaxyGradient = ctx.createRadialGradient(
          galaxyX,
          galaxyY,
          0,
          galaxyX,
          galaxyY,
          galaxySize
        );

        galaxyGradient.addColorStop(0, "rgba(255, 255, 200, 0.7)");
        galaxyGradient.addColorStop(0.3, "rgba(200, 180, 255, 0.5)");
        galaxyGradient.addColorStop(1, "rgba(70, 100, 150, 0)");

        ctx.fillStyle = galaxyGradient;
        ctx.beginPath();
        ctx.arc(galaxyX, galaxyY, galaxySize, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [time]);

  // Add fade-in effect on page load
  useEffect(() => {
    const content = document.getElementById("content");
    if (content) {
      content.style.opacity = "1";
      content.style.transform = "translateY(0)";
    }
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
          Universe Expansion Simulator
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
          Visualize how our universe expanded from a singularity to the vast
          cosmos we see today
        </p>

        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          {/* Universe visualization */}
          <div
            style={{
              width: "100%",
              height: "400px",
              backgroundColor: "#000",
              position: "relative",
              marginBottom: "1.5rem",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <canvas
              ref={canvasRef}
              style={{
                width: "100%",
                height: "100%",
                display: "block",
              }}
            />
          </div>

          {/* Timeline slider */}
          <div
            style={{
              width: "100%",
              maxWidth: "700px",
              margin: "0 auto 2rem auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.75rem",
              }}
            >
              <div>
                <span style={{ fontWeight: "bold" }}>Universe Age: </span>
                <span style={{ color: "#3498db" }}>{currentEvent.age}</span>
              </div>
              <button
                onClick={togglePlay}
                style={{
                  backgroundColor: "#3498db",
                  color: "white",
                  border: "none",
                  padding: "0.4rem 1rem",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                {playing ? "Pause" : "Play Expansion"}
              </button>
            </div>

            <div
              style={{
                width: "100%",
                height: "6px",
                backgroundColor: "#333",
                borderRadius: "3px",
                margin: "1rem 0",
                position: "relative",
              }}
            >
              {cosmicEvents.map((event, index) => (
                <div
                  key={index}
                  style={{
                    position: "absolute",
                    left: `${event.time}%`,
                    width: "2px",
                    height: "8px",
                    top: "-1px",
                    backgroundColor: time >= event.time ? "#3498db" : "#666",
                  }}
                />
              ))}
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={time}
              onChange={(e) => handleTimeChange(parseFloat(e.target.value))}
              style={{
                width: "100%",
                accentColor: "#3498db",
                height: "8px",
              }}
            />
          </div>

          {/* Event information box */}
          <div
            style={{
              backgroundColor: "rgba(52, 152, 219, 0.1)",
              padding: "1.5rem",
              borderRadius: "8px",
              marginBottom: "2rem",
              maxWidth: "700px",
              margin: "0 auto 2rem auto",
            }}
          >
            <h3
              style={{
                margin: "0 0 0.75rem 0",
                color: "#3498db",
                fontSize: "1.3rem",
              }}
            >
              {currentEvent.event}
            </h3>
            <p style={{ margin: "0", fontSize: "1rem" }}>
              {currentEvent.description}
            </p>
          </div>

          {/* Explanatory content */}
          <section
            style={{
              maxWidth: "700px",
              margin: "2rem auto",
            }}
          >
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
              The Expanding Universe
            </h2>
            <p>
              The Big Bang theory describes how the universe expanded from an
              extremely hot, dense state into the vast cosmos we observe today.
              This expansion continues, with galaxies moving further apart as
              space itself stretches.
            </p>
            <p style={{ marginTop: "1rem" }}>
              One of the most significant discoveries in cosmology was that the
              universe isn't just expanding—it's accelerating. This finding,
              which earned the 2011 Nobel Prize in Physics, suggests the
              presence of a mysterious force called dark energy pushing the
              universe apart.
            </p>
            <p style={{ marginTop: "1rem" }}>
              At the very beginning (t=0), physics as we know it breaks down
              completely. This singularity represents one of the fundamental
              limits of Einstein's equations, similar to the center of a black
              hole.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
