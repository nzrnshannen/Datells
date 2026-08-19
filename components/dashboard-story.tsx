"use client";

import React from 'react';
import { StoryData } from '@/lib/schema';
import { DynamicChart } from './dynamic-chart';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, TrendingDown, Sparkles, AlertCircle, Info } from 'lucide-react';

interface DashboardStoryProps {
  story: StoryData;
}

export function DashboardStory({ story }: DashboardStoryProps) {
  return (
    <div className="w-full max-w-7xl mx-auto mt-12 space-y-12 pb-24">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50 p-8 md:p-12 text-center shadow-2xl"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-900/0 to-slate-900/0 pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-6 border border-emerald-500/20">
                <Sparkles className="w-4 h-4" /> AI Generated Insights
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-100 mb-6 max-w-4xl leading-tight">
                {story.title}
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
                {story.executiveSummary}
            </p>
        </div>
      </motion.div>

      {/* Key Takeaways Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">
          {story.keyTakeaways.map((takeaway, i) => {
              let Icon = Sparkles;
              let colorClass = "text-indigo-400";
              let glowClass = "bg-indigo-500/5 group-hover:bg-indigo-500/10";
              
              // @ts-ignore - Handle older schema types or default
              const type = takeaway.type || 'insight';
              if (type === 'positive') {
                  Icon = TrendingUp;
                  colorClass = "text-emerald-400";
                  glowClass = "bg-emerald-500/5 group-hover:bg-emerald-500/10";
              } else if (type === 'negative') {
                  Icon = TrendingDown;
                  colorClass = "text-amber-400";
                  glowClass = "bg-amber-500/5 group-hover:bg-amber-500/10";
              } else if (type === 'neutral') {
                  Icon = Info;
                  colorClass = "text-blue-400";
                  glowClass = "bg-blue-500/5 group-hover:bg-blue-500/10";
              }

              return (
                  <motion.div 
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 hover:bg-slate-800/80 hover:border-slate-700 transition-all group relative overflow-hidden shadow-lg flex flex-col h-full"
                  >
                      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl transition-colors pointer-events-none ${glowClass}`} />
                      <div className="flex items-start justify-between mb-4">
                          <div className="p-2 bg-slate-800/80 border border-slate-700 rounded-lg group-hover:scale-110 transition-transform">
                              <Icon className={`w-5 h-5 ${colorClass}`} />
                          </div>
                      </div>
                      <div className="mb-4">
                          <h3 className="text-sm font-medium text-slate-400 mb-1">{takeaway.title}</h3>
                          <p className="text-3xl font-bold text-slate-100">{takeaway.metricImpact || "Insight"}</p>
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed flex-1 line-clamp-2">{takeaway.detail}</p>
                  </motion.div>
              );
          })}
      </div>

      {/* Anomalies Panel */}
      {story.anomaliesDetected && story.anomaliesDetected.length > 0 && (
          <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col shadow-lg w-full"
          >
              <div className="flex items-center gap-2 mb-6">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h3 className="text-lg font-semibold text-slate-200">Detected Anomalies</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {story.anomaliesDetected.map((anomaly, i) => {
                      const isHigh = anomaly.severity === 'high';
                      const isMed = anomaly.severity === 'medium';
                      const borderColor = isHigh ? 'border-rose-500/60' : isMed ? 'border-amber-500/60' : 'border-blue-500/60';
                      const iconColor = isHigh ? 'text-rose-500' : isMed ? 'text-amber-500' : 'text-blue-400';
                      const bgHover = isHigh ? 'hover:bg-rose-950/20' : isMed ? 'hover:bg-amber-950/20' : 'hover:bg-blue-950/20';
                      
                      return (
                          <div key={i} className={`flex gap-3 items-start pl-4 py-3 border-l-2 ${borderColor} ${bgHover} transition-colors bg-slate-950/30 rounded-r-xl border-y border-r border-slate-800/50`}>
                              <AlertCircle className={`w-4 h-4 mt-0.5 shrink-0 ${iconColor}`} />
                              <div>
                                  <p className="text-sm font-medium text-slate-200 mb-1">{anomaly.column}</p>
                                  <p className="text-sm text-slate-400 leading-relaxed">{anomaly.observation}</p>
                              </div>
                          </div>
                      );
                  })}
              </div>
          </motion.div>
      )}

      {/* Dynamic Charts Grid */}
      {story.chartConfigs && story.chartConfigs.length > 0 && (
          <div className="space-y-6 pt-8 border-t border-slate-800/80">
              <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-2xl font-bold text-slate-100">Visual Insights</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {story.chartConfigs.map((config, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + (i * 0.1) }}
                        className="h-[450px]"
                      >
                          <DynamicChart config={config} />
                      </motion.div>
                  ))}
              </div>
          </div>
      )}

    </div>
  );
}
