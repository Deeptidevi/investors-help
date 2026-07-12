"use client";

import { TrendingUp, AlertTriangle, FileText, CheckCircle, Ban } from "lucide-react";
import styles from "../app/page.module.css";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ResultsProps {
  company: string;
  results: {
    symbol: string;
    quote: {
      price: number;
      changePercent: number;
      marketCap: number;
      peRatio: number;
      name: string;
    };
    chartData: { date: string; price: number }[];
    decision: "INVEST" | "PASS";
    reasoning: string;
    highlights: string[];
    risks: string[];
  };
}

export default function ResearchResults({ company, results }: ResultsProps) {
  const isInvest = results.decision === "INVEST";
  const isPositiveChange = results.quote?.changePercent >= 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={styles.reportContainer}
    >
      <div className={styles.reportHeader}>
        <div className={styles.reportMeta}>
          <span className={styles.reportTitle}>{results.symbol ? `Ticker: ${results.symbol}` : 'Executive Summary'}</span>
          <span className={styles.reportDate}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
        
        <div className={styles.titlePriceRow}>
          <h2 className={styles.reportCompany}>{results.quote?.name || company}</h2>
          {results.quote && (
            <div className={styles.priceContainer}>
              <span className={styles.currentPrice}>${results.quote.price?.toFixed(2)}</span>
              <span className={isPositiveChange ? styles.positiveChange : styles.negativeChange}>
                {isPositiveChange ? '+' : ''}{results.quote.changePercent?.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
        
        <div className={styles.decisionContainer}>
          <span className={styles.decisionLabel}>FINAL VERDICT:</span>
          <div className={isInvest ? styles.decisionValueInvest : styles.decisionValuePass}>
            {isInvest ? <CheckCircle size={24} /> : <Ban size={24} />}
            {results.decision}
          </div>
        </div>
      </div>

      {results.chartData && results.chartData.length > 0 && (
        <div className={styles.chartSection}>
           <ResponsiveContainer width="100%" height={200}>
             <AreaChart data={results.chartData}>
               <defs>
                 <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor={isPositiveChange ? '#10b981' : '#ef4444'} stopOpacity={0.3}/>
                   <stop offset="95%" stopColor={isPositiveChange ? '#10b981' : '#ef4444'} stopOpacity={0}/>
                 </linearGradient>
               </defs>
               <XAxis dataKey="date" hide />
               <YAxis domain={['auto', 'auto']} hide />
               <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
               />
               <Area type="monotone" dataKey="price" stroke={isPositiveChange ? '#10b981' : '#ef4444'} strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
             </AreaChart>
           </ResponsiveContainer>
        </div>
      )}

      <div className={styles.reportBody}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <FileText size={18} />
            Investment Rationale
          </h3>
          <p className={styles.reasoningText}>{results.reasoning}</p>
        </div>

        <div className={styles.gridSection}>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <TrendingUp size={18} />
              Growth Drivers
            </h3>
            <div className={styles.listContainer}>
              {results.highlights.map((highlight, idx) => (
                <div key={idx} className={`${styles.listItem} ${styles.listItemPositive}`}>
                  <span className={styles.listText}>{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {results.risks && results.risks.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <AlertTriangle size={18} />
                Risk Factors
              </h3>
              <div className={styles.listContainer}>
                {results.risks.map((risk, idx) => (
                  <div key={idx} className={`${styles.listItem} ${styles.listItemNegative}`}>
                    <span className={styles.listText}>{risk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
