"use client";

import { useEffect, useRef, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

interface AnimatedSectionProps {
  children: ReactNode;
  delay?: number;
}

function AnimatedSection({ children, delay = 0 }: AnimatedSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add("visible");
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const sectionElement = sectionRef.current;
    if (sectionElement) {
      observer.observe(sectionElement);
    }

    return () => {
      if (sectionElement) {
        observer.unobserve(sectionElement);
      }
    };
  }, [delay]);

  return (
    <section
      ref={sectionRef}
      className="animated-section"
      style={{
        marginBottom: "2rem",
        opacity: 0,
        transform: "translateY(20px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}
    >
      {children}
    </section>
  );
}

function SingularityImage() {
  return (
    <div
      style={{ display: "flex", justifyContent: "center", margin: "2rem 0" }}
    >
      <div style={{ position: "relative", width: "280px", height: "280px" }}>
        <Image
          src="/singularity.png"
          alt="Black hole gravitational singularity visualization"
          fill
          style={{ objectFit: "contain" }}
          priority
        />
      </div>
    </div>
  );
}

function BigBangImage() {
  return (
    <div
      style={{ display: "flex", justifyContent: "center", margin: "2rem 0" }}
    >
      <div style={{ position: "relative", width: "280px", height: "280px" }}>
        <Image
          src="/big_bang.png"
          alt="Big Bang visualization"
          fill
          style={{ objectFit: "contain" }}
        />
      </div>
    </div>
  );
}

function QuantumImage() {
  return (
    <div
      style={{ display: "flex", justifyContent: "center", margin: "2rem 0" }}
    >
      <div style={{ position: "relative", width: "280px", height: "280px" }}>
        <Image
          src="/quantum.png"
          alt="Quantum world visualization"
          fill
          style={{ objectFit: "contain" }}
        />
      </div>
    </div>
  );
}

function ExploreButton({
  href,
  text = "Explore",
}: {
  href: string;
  text?: string;
}) {
  return (
    <div
      style={{ display: "flex", justifyContent: "center", margin: "1.5rem 0" }}
    >
      <Link href={href}>
        <button
          style={{
            backgroundColor: "transparent",
            color: "white",
            border: "1px solid rgba(255, 255, 255, 0.6)",
            padding: "0.6rem 1.5rem",
            fontSize: "0.9rem",
            borderRadius: "4px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            fontWeight: "500",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          {text} →
        </button>
      </Link>
    </div>
  );
}

export default function Home() {
  return (
    <main
      style={{
        padding: "2rem",
        fontFamily: "sans-serif",
        maxWidth: "700px",
        margin: "auto",
        backgroundColor: "#000",
        color: "#fff",
        minHeight: "100vh",
        lineHeight: 1.6,
      }}
    >
      <style jsx global>{`
        .animated-section.visible {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>

      <h1
        style={{ fontSize: "2rem", marginBottom: "1rem", textAlign: "center" }}
      >
        Where Einstein Fails
      </h1>
      <p
        style={{
          fontSize: "1.1rem",
          marginBottom: "2rem",
          textAlign: "center",
        }}
      >
        This is a visual explainer of where General Relativity breaks down.
      </p>

      <AnimatedSection delay={100}>
        <h2 style={{ fontSize: "1.3rem" }}>1. Black Hole Singularity</h2>
        <SingularityImage />
        <p>
          As mass compresses into an infinitely small point, the curvature of
          spacetime becomes infinite. Einstein&apos;s equations no longer make
          sense here.
        </p>
        <ExploreButton href="/black-holes" />
      </AnimatedSection>

      <AnimatedSection delay={300}>
        <h2 style={{ fontSize: "1.3rem" }}>2. The Big Bang</h2>
        <BigBangImage />
        <p>
          Going backwards in time, the universe shrinks to a single point. We
          have no equation that works at t = 0 — a singularity in time.
        </p>
        <ExploreButton href="/big-bang" />
      </AnimatedSection>

      <AnimatedSection delay={500}>
        <h2 style={{ fontSize: "1.3rem" }}>3. The Quantum World</h2>
        <QuantumImage />
        <p>
          General Relativity breaks down at the quantum level, where particles
          behave unpredictably and spacetime isn&apos;t smooth anymore.
        </p>
        <ExploreButton href="/quantum-demo" />
      </AnimatedSection>
    </main>
  );
}
