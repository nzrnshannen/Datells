import { z } from 'zod';

// --- DuckDB Summary Statistics ---
export const columnSummarySchema = z.object({
  columnName: z.string(),
  dataType: z.enum(['numeric', 'categorical', 'datetime', 'boolean']),
  rowCount: z.number(),
  nullCount: z.number(),
  min: z.number().optional(),
  max: z.number().optional(),
  mean: z.number().optional(),
  median: z.number().optional(),
  stdDev: z.number().optional(),
  uniqueValues: z.number().optional(), // For categorical
});

export type ColumnSummary = z.infer<typeof columnSummarySchema>;

export const datasetSummarySchema = z.object({
  fileName: z.string(),
  totalRows: z.number(),
  totalColumns: z.number(),
  columns: z.array(columnSummarySchema),
  correlationMatrix: z.record(z.string(), z.record(z.string(), z.number())).optional()
});

export type DatasetSummary = z.infer<typeof datasetSummarySchema>;

// --- LLM Generated Story Schema (Vercel AI SDK generateObject) ---
export const storySchema = z.object({
  title: z.string().describe("Catchy, insightful title for the dashboard"),
  executiveSummary: z.string().describe("A 2-3 sentence overview of the dataset's most important findings"),
  keyTakeaways: z.array(
    z.object({
      title: z.string(),
      detail: z.string(),
      metricImpact: z.string().optional().describe("E.g., '+15% YoY' or 'Critical Drop'")
    })
  ).describe("3-5 key actionable takeaways"),
  chartConfigs: z.array(
    z.object({
      chartType: z.enum(['bar', 'line', 'scatter', 'pie']),
      title: z.string(),
      description: z.string(),
      xAxisKey: z.string(),
      yAxisKey: z.string(),
      aggregation: z.enum(['sum', 'avg', 'count'])
    })
  ).describe("Configurations for Recharts to display dynamic visualisations based on DuckDB data"),
  anomaliesDetected: z.array(
    z.object({
      column: z.string(),
      observation: z.string(),
      severity: z.enum(['low', 'medium', 'high'])
    })
  ).describe("Any interesting outliers, null value concentrations, or skewness detected")
});

export type StoryData = z.infer<typeof storySchema>;
