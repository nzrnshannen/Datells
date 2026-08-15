import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { NextResponse } from 'next/server';
import { storySchema } from '@/lib/schema';

// Allow longer duration for generation
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { datasetSummary } = await req.json();

    if (!datasetSummary) {
      return NextResponse.json({ error: 'Missing dataset summary' }, { status: 400 });
    }

    const { object } = await generateObject({
      model: google('gemini-3.5-flash'),
      schema: storySchema,
      system: `You are an expert Data Scientist and Executive Storyteller. You analyze dataset summary statistics and generate a cohesive, interactive data story for a dashboard.`,
      prompt: `
        I am providing you with the summary statistics of a dataset. 
        Analyze these statistics and return a structured JSON response matching the required schema.
        
        Instructions:
        1. Create a catchy, insightful title.
        2. Write a 2-3 sentence executive summary of the most important findings.
        3. Extract 3-5 key takeaways, providing a metric impact where possible.
        4. Recommend up to 4 charts (bar, line, scatter, or pie) that would best visualize this data. Ensure you provide the exact column names from the dataset for the xAxisKey and yAxisKey.
        5. Identify any anomalies (outliers, high null counts, severe skewness) and flag their severity.
        
        Dataset Summary JSON:
        ${JSON.stringify(datasetSummary, null, 2)}
      `,
    });

    return NextResponse.json({ story: object });

  } catch (error: any) {
    console.error('Error generating story:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate story. Make sure your GOOGLE_GENERATIVE_AI_API_KEY is set and valid.' },
      { status: 500 }
    );
  }
}
