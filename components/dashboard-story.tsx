"use client";

import React from 'react';
import { StoryData } from '@/lib/schema';
import { DynamicChart } from './dynamic-chart';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';

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

      {/* Key Takeaways & Anomalies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Takeaways */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {story.keyTakeaways.map((takeaway, i) => (
                <motion.div 
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 hover:bg-slate-800/80 hover:border-slate-700 transition-all group relative overflow-hidden shadow-lg"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-2 bg-slate-800/80 border border-slate-700 rounded-lg group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                        </div>
                        {takeaway.metricImpact && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {takeaway.metricImpact}
                            </span>
                        )}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-2">{takeaway.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{takeaway.detail}</p>
                </motion.div>
            ))}
        </div>

        {/* Anomalies Panel */}
        {story.anomaliesDetected && story.anomaliesDetected.length > 0 && (
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col shadow-lg"
            >
                <div className="flex items-center gap-2 mb-6">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <h3 className="text-lg font-semibold text-slate-200">Detected Anomalies</h3>
                </div>
                <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {story.anomaliesDetected.map((anomaly, i) => (
                        <div key={i} className="flex gap-3 items-start bg-slate-950/50 p-4 rounded-xl border border-slate-800/50 hover:border-slate-700 transition-colors">
                            <AlertCircle className={`w-4 h-4 mt-0.5 shrink-0 ${
                                anomaly.severity === 'high' ? 'text-rose-500' :
                                anomaly.severity === 'medium' ? 'text-amber-500' : 'text-blue-400'
                            }`} />
                            <div>
                                <p className="text-sm font-medium text-slate-300 mb-1">{anomaly.column}</p>
                                <p className="text-xs text-slate-500 leading-relaxed">{anomaly.observation}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        )}
      </div>

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
