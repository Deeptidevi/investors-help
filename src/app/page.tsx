"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import styles from "./page.module.css";
import ResearchResults from "@/components/ResearchResults";

const LOADING_STEPS = [
  { icon: "🔍", text: "Resolving company ticker symbol..." },
  { icon: "📡", text: "Fetching real-time market data..." },
  { icon: "📊", text: "Pulling 90-day price history..." },
  { icon: "🤖", text: "Running AI investment analysis..." },
  { icon: "⚖️",  text: "Weighing risks and growth factors..." },
  { icon: "📝", text: "Compiling your research report..." },
];

function LoadingAnimation({ company }: { company: string }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 2200);
    return () => clearInterval(stepTimer);
  }, []);

  useEffect(() => {
    const dotTimer = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);
    return () => clearInterval(dotTimer);
  }, []);

  return (
    <div className={styles.loadingContainer}>
      {/* Animated orb */}
      <div className={styles.orbWrapper}>
        <div className={styles.orb}></div>
        <div className={styles.orbRing}></div>
        <div className={styles.orbRing2}></div>
      </div>

      <p className={styles.loadingCompany}>Analyzing <strong>{company}</strong></p>

      {/* Step indicator */}
      <div className={styles.stepCard}>
        <span className={styles.stepIcon}>{LOADING_STEPS[stepIndex].icon}</span>
        <span className={styles.stepText}>
          {LOADING_STEPS[stepIndex].text}{dots}
        </span>
      </div>

      {/* Progress dots */}
      <div className={styles.progressDots}>
        {LOADING_STEPS.map((_, i) => (
          <div
            key={i}
            className={`${styles.progressDot} ${i === stepIndex ? styles.progressDotActive : i < stepIndex ? styles.progressDotDone : ""}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState("");

  const handleResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ company: companyName }),
      });

      if (!res.ok) {
        let errMsg = "Failed to perform research. Make sure you added your API key to .env.local.";
        try {
          const text = await res.text();
          try {
            const errData = JSON.parse(text);
            if (errData.error) errMsg = errData.error;
          } catch (e) {
            console.error("Server HTML Error:", text);
            errMsg = `Server Error: Please check your terminal. Ensure you ran 'npm install' and restarted the server. (Status ${res.status})`;
          }
        } catch(e) {}
        throw new Error(errMsg);
      }

      const data = await res.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message || "An error occurred during research.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <h1 className={styles.title}>AI Investment Analyst</h1>
        <p className={styles.subtitle}>
          Enter a company name and our AI agent will perform deep research to give you a definitive Invest or Pass decision.
        </p>
      </div>

      <div className={styles.formContainer}>
        <form onSubmit={handleResearch} className={styles.form}>
          <input
            type="text"
            className={styles.input}
            placeholder="e.g. Tesla, NVIDIA, Microsoft..."
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className={styles.button} disabled={loading || !companyName.trim()}>
            <Search className={styles.buttonIcon} />
            {loading ? "Analyzing..." : "Research"}
          </button>
        </form>
        {error && <div style={{ color: 'var(--danger)', marginTop: '1rem', textAlign: 'center' }}>{error}</div>}
      </div>

      <div className="status-area">
        {loading && <LoadingAnimation company={companyName} />}

        {results && !loading && (
          <ResearchResults results={results} company={companyName} />
        )}
      </div>
    </main>
  );
}
