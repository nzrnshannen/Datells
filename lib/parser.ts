import Papa from 'papaparse';
import * as xlsx from 'xlsx';

export async function parseFileToJSON(file: File): Promise<any[]> {
  const name = file.name.toLowerCase();

  return new Promise((resolve, reject) => {
    try {
      if (name.endsWith('.csv') || name.endsWith('.tsv')) {
        Papa.parse(file, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors && results.errors.length > 0) {
              console.warn("PapaParse completed with errors:", results.errors);
            }
            resolve(results.data);
          },
          error: (error: any) => {
            reject(new Error(`Failed to parse CSV/TSV: ${error.message}`));
          }
        });
      } 
      else if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = xlsx.read(data, { type: 'array' });
            if (workbook.SheetNames.length === 0) {
              throw new Error("No worksheets found in the Excel file");
            }
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = xlsx.utils.sheet_to_json(firstSheet);
            resolve(jsonData);
          } catch (error: any) {
            reject(new Error(`Failed to parse Excel file: ${error.message}`));
          }
        };
        reader.onerror = () => reject(new Error("Failed to read the Excel file"));
        reader.readAsArrayBuffer(file);
      } 
      else if (name.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const text = e.target?.result as string;
            const parsed = JSON.parse(text);
            
            // Handle { data: [...] } wrapper
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
              if (parsed.data && Array.isArray(parsed.data)) {
                resolve(parsed.data);
                return;
              }
            }
            
            if (Array.isArray(parsed)) {
              resolve(parsed);
            } else {
              reject(new Error("JSON file does not contain a standard array of objects."));
            }
          } catch (error: any) {
            reject(new Error(`Failed to parse JSON file: ${error.message}`));
          }
        };
        reader.onerror = () => reject(new Error("Failed to read the JSON file"));
        reader.readAsText(file);
      } 
      else {
        reject(new Error("Unsupported file format. Please upload CSV, TSV, Excel, or JSON."));
      }
    } catch (e: any) {
      reject(new Error(`Unexpected error parsing file: ${e.message}`));
    }
  });
}
