import * as duckdb from '@duckdb/duckdb-wasm';

let dbInstance: duckdb.AsyncDuckDB | null = null;
let initPromise: Promise<duckdb.AsyncDuckDB> | null = null;

export const initDuckDB = async (): Promise<duckdb.AsyncDuckDB> => {
  if (dbInstance) return dbInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // Select a bundle based on browser checks
    const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();

    // Select a bundle based on browser checks
    const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

    const worker_url = URL.createObjectURL(
      new Blob([`importScripts("${bundle.mainWorker!}");`], { type: 'text/javascript' })
    );

    // Instantiate the asynchronous version of DuckDB-Wasm
    const worker = new Worker(worker_url);
    const logger = new duckdb.ConsoleLogger();
    const db = new duckdb.AsyncDuckDB(logger, worker);
    
    await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
    URL.revokeObjectURL(worker_url);

    dbInstance = db;
    return db;
  })();

  return initPromise;
};

// Helper function to ingest a File (CSV) into DuckDB
export const ingestCSV = async (file: File, tableName: string = 'dataset'): Promise<void> => {
    const db = await initDuckDB();
    const c = await db.connect();
    
    try {
        // Drop table if it exists
        await c.query(`DROP TABLE IF EXISTS ${tableName}`);
        
        // Register the file in DuckDB's virtual file system
        await db.registerFileHandle(file.name, file, duckdb.DuckDBDataProtocol.BROWSER_FILEREADER, true);
        
        // Create table from the CSV
        await c.insertCSVFromPath(file.name, {
            schema: 'main',
            name: tableName,
            detect: true,
            header: true,
        });
    } finally {
        await c.close();
    }
};

// Helper function to execute arbitrary SQL
export const executeQuery = async (query: string): Promise<any[]> => {
    const db = await initDuckDB();
    const c = await db.connect();
    try {
        const result = await c.query(query);
        return result.toArray().map(row => row.toJSON());
    } finally {
        await c.close();
    }
};
