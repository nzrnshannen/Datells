import { ingestCSV, executeQuery } from './duckdb';
import { DatasetSummary, ColumnSummary } from './schema';

export async function profileDataset(file: File): Promise<DatasetSummary> {
  const tableName = 'dataset';
  
  // 1. Ingest file into DuckDB
  await ingestCSV(file, tableName);

  // 2. Get table schema (columns and types)
  const schemaQuery = `DESCRIBE ${tableName};`;
  const schemaResult = await executeQuery(schemaQuery);

  // 3. Get total rows
  const countResult = await executeQuery(`SELECT COUNT(*) as total FROM ${tableName}`);
  const totalRows = Number(countResult[0].total);

  // 4. Compute column summaries
  const columns: ColumnSummary[] = [];
  
  for (const col of schemaResult) {
    const colName = col.column_name;
    const rawType = String(col.column_type).toUpperCase();
    
    // Map duckdb type to our schema type
    let dataType: 'numeric' | 'categorical' | 'datetime' | 'boolean' = 'categorical';
    if (rawType.includes('INT') || rawType.includes('FLOAT') || rawType.includes('DOUBLE') || rawType.includes('DECIMAL')) {
      dataType = 'numeric';
    } else if (rawType.includes('DATE') || rawType.includes('TIME') || rawType.includes('TIMESTAMP')) {
      dataType = 'datetime';
    } else if (rawType.includes('BOOL')) {
      dataType = 'boolean';
    }

    const colSafe = `"${colName}"`;
    
    let summary: ColumnSummary = {
      columnName: colName,
      dataType,
      rowCount: totalRows,
      nullCount: 0,
    };

    try {
      // Calculate nulls
      const nullsQuery = `SELECT COUNT(*) as nulls FROM ${tableName} WHERE ${colSafe} IS NULL`;
      const nullsResult = await executeQuery(nullsQuery);
      summary.nullCount = Number(nullsResult[0].nulls);

      if (dataType === 'numeric') {
        const statsQuery = `
          SELECT 
            MIN(${colSafe}) as min_val,
            MAX(${colSafe}) as max_val,
            AVG(${colSafe}) as mean_val,
            MEDIAN(${colSafe}) as median_val,
            STDDEV_SAMP(${colSafe}) as stddev_val
          FROM ${tableName}
        `;
        const stats = await executeQuery(statsQuery);
        if (stats.length > 0) {
          // Check for nulls before assigning
          if (stats[0].min_val !== null) summary.min = Number(stats[0].min_val);
          if (stats[0].max_val !== null) summary.max = Number(stats[0].max_val);
          if (stats[0].mean_val !== null) summary.mean = Number(stats[0].mean_val);
          if (stats[0].median_val !== null) summary.median = Number(stats[0].median_val);
          if (stats[0].stddev_val !== null) summary.stdDev = Number(stats[0].stddev_val);
        }
      } else if (dataType === 'categorical' || dataType === 'boolean') {
        const uniqueQuery = `SELECT COUNT(DISTINCT ${colSafe}) as uniques FROM ${tableName}`;
        const uniqueResult = await executeQuery(uniqueQuery);
        summary.uniqueValues = Number(uniqueResult[0].uniques);
      }
    } catch (e) {
      console.error(`Failed to profile column ${colName}:`, e);
    }

    columns.push(summary);
  }

  // 5. Build final summary
  const datasetSummary: DatasetSummary = {
    fileName: file.name,
    totalRows,
    totalColumns: columns.length,
    columns,
  };

  return datasetSummary;
}
