"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import styles from "./page.module.css";
import ResearchResults from "@/components/ResearchResults";

const LOADING_PHASES = [
  "Fetching market data",
  "Analyzing financials",
  "Running AI model",
  "Generating report",
];

function LoadingAnimation({ company }: { company: string }) {
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Smooth progress bar
    const progressTimer = setInterval(() => {
      setProgress((p) => {
        if (p >= 92) return p; // hold near end until real data arrives
        return p + 0.6;
      });
    }, 80);
    return () => clearInterval(progressTimer);
  }, []);

  useEffect(() => {
    // Cycle phases
    const phaseTimer = setInterval(() => {
      setPhase((p) => Math.min(p + 1, LOADING_PHASES.length - 1));
    }, 2800);
    return () => clearInterval(phaseTimer);
  }, []);

  return (
    <div className={styles.loadingContainer}>
      {/* Thin progress bar at top */}
      <div className={styles.progressBar}>
        <div className={styles.progressBarFill} style={{ width: `${progress}%` }} />
      </div>

      <div className={styles.loadingInner}>
        {/* Minimal spinner ring */}
        <div className={styles.loadingRing} />

        <div className={styles.loadingInfo}>
          <p className={styles.loadingCompany}>{company}</p>
          <p className={styles.loadingPhase}>{LOADING_PHASES[phase]}</p>

          {/* Phase steps */}
          <div className={styles.phaseSteps}>
            {LOADING_PHASES.map((label, i) => (
              <div key={i} className={`${styles.phaseStep} ${i < phase ? styles.phaseStepDone : i === phase ? styles.phaseStepActive : ""}`}>
                <div className={styles.phaseStepDot} />
                <span className={styles.phaseStepLabel}>{label}</span>
              </div>
            ))}
          </div>
        </div>
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
        headers: { "Content-Type": "application/json" },
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
            errMsg = `Server Error: Please check your terminal. (Status ${res.status})`;
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
