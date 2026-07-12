"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import styles from "./page.module.css";
import ResearchResults from "@/components/ResearchResults";

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
        {loading && (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingText}>Synthesizing market data and financials...</p>
          </div>
        )}

        {results && !loading && (
          <ResearchResults results={results} company={companyName} />
        )}
      </div>
    </main>
  );
}
