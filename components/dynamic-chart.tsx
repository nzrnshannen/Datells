"use client";

import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { executeQuery } from '@/lib/duckdb';

interface ChartConfig {
  chartType: 'bar' | 'line' | 'scatter' | 'pie';
  title: string;
  description: string;
  xAxisKey: string;
  yAxisKey: string;
  aggregation: 'sum' | 'avg' | 'count';
}

interface DynamicChartProps {
  config: ChartConfig;
  tableName?: string;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function DynamicChart({ config, tableName = 'dataset' }: DynamicChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let aggFunc = 'SUM';
        if (config.aggregation === 'avg') aggFunc = 'AVG';
        if (config.aggregation === 'count') aggFunc = 'COUNT';

        // Safe query building for chart
        const safeX = `"${config.xAxisKey}"`;
        const safeY = `"${config.yAxisKey}"`;

        let query = '';
        if (config.chartType === 'scatter') {
            query = `SELECT ${safeX}, ${safeY} FROM ${tableName} LIMIT 500`;
        } else {
            query = `
            SELECT ${safeX}, ${aggFunc}(${safeY}) as ${safeY}
            FROM ${tableName} 
            GROUP BY ${safeX}
            ORDER BY ${safeX}
            LIMIT 50
            `;
        }
        
        const result = await executeQuery(query);
        let sortedResult = [...result];
        sortedResult.sort((a, b) => {
          const valA = a[config.xAxisKey];
          const valB = b[config.xAxisKey];
          if (typeof valA === 'number' && typeof valB === 'number') {
            return valA - valB;
          }
          return String(valA).localeCompare(String(valB));
        });
        
        setData(sortedResult);
      } catch (e: any) {
        console.error("Failed to execute chart query", e);
        setError(e.message || "Failed to load chart data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [config, tableName]);

  if (isLoading) {
    return <div className="h-64 flex items-center justify-center text-slate-500 animate-pulse">Running DuckDB Query...</div>;
  }

  if (error) {
    return <div className="h-64 flex items-center justify-center text-red-500 text-sm">Error: {error}</div>;
  }

  if (!data || data.length === 0) {
      return <div className="h-64 flex items-center justify-center text-slate-500">No data for this chart.</div>;
  }

  const isTimestamp = (val: any) => typeof val === 'number' && val > 1000000000000;

  const xAxisFormatter = (val: any) => {
    if (isTimestamp(val)) {
      return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(val));
    }
    return val;
  };

  const tooltipLabelFormatter = (val: any) => {
    if (isTimestamp(val)) {
      return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(val));
    }
    return val;
  };

  const tooltipFormatter = (value: any, name: any) => {
    const isPricing = config.title.toLowerCase().includes('pric') || config.yAxisKey.toLowerCase().includes('price') || config.yAxisKey.toLowerCase().includes('cost');
    if (isPricing && typeof value === 'number') {
      return [`$${value.toFixed(2)}`, name];
    }
    return [value, name];
  };

  const renderChart = () => {
    switch (config.chartType) {
      case 'bar':
        return (
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey={config.xAxisKey} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={xAxisFormatter} tickCount={6} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip cursor={{ fill: '#334155', opacity: 0.4 }} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#f8fafc' }} labelFormatter={tooltipLabelFormatter} formatter={tooltipFormatter} />
            <Bar dataKey={config.yAxisKey} fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey={config.xAxisKey} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={xAxisFormatter} tickCount={6} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#f8fafc' }} labelFormatter={tooltipLabelFormatter} formatter={tooltipFormatter} />
            <Line type="monotone" dataKey={config.yAxisKey} stroke="#3b82f6" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 6 }} />
          </LineChart>
        );
      case 'scatter':
        return (
          <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis type="number" dataKey={config.xAxisKey} name={config.xAxisKey} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis type="number" dataKey={config.yAxisKey} name={config.yAxisKey} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#f8fafc' }} />
            <Scatter name="Data" data={data} fill="#f59e0b" />
          </ScatterChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#f8fafc' }} />
            <Pie data={data} dataKey={config.yAxisKey} nameKey={config.xAxisKey} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5}>
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Pie>
          </PieChart>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/40 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
        <h4 className="text-lg font-semibold text-slate-100 mb-1">{config.title}</h4>
        <p className="text-sm text-slate-400 mb-6">{config.description}</p>
        <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
            </ResponsiveContainer>
        </div>
    </div>
  );
}
