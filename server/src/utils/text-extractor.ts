/**
 * Text Extraction Utilities
 * Extract text from PDF and DOCX files
 */

import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import PDFParser from 'pdf2json';

/**
 * Extract text from a file based on its type
 */
export async function extractTextFromFile(
  filePath: string,
  fileType: string
): Promise<string> {
  try {
    if (fileType === 'pdf' || filePath.endsWith('.pdf')) {
      return await extractTextFromPDF(filePath);
    } else if (
      fileType === 'docx' ||
      filePath.endsWith('.docx') ||
      filePath.endsWith('.doc')
    ) {
      return await extractTextFromDOCX(filePath);
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw new Error('Failed to extract text from file');
  }
}

/**
 * Extract text from PDF using pdf2json (fallback parser)
 */
async function extractTextFromPDFFallback(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on('pdfParser_dataError', (errData: any) => {
      reject(new Error(errData.parserError));
    });

    pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
      try {
        let text = '';

        // Extract text from all pages
        if (pdfData.Pages) {
          for (const page of pdfData.Pages) {
            if (page.Texts) {
              for (const textItem of page.Texts) {
                if (textItem.R) {
                  for (const run of textItem.R) {
                    if (run.T) {
                      text += decodeURIComponent(run.T) + ' ';
                    }
                  }
                }
              }
              text += '\n';
            }
          }
        }

        if (!text.trim()) {
          reject(new Error('No text content found in PDF'));
        } else {
          resolve(text);
        }
      } catch (err: any) {
        reject(new Error(`Failed to extract text: ${err.message}`));
      }
    });

    pdfParser.loadPDF(filePath);
  });
}

/**
 * Extract text from PDF file
 */
async function extractTextFromPDF(filePath: string): Promise<string> {
  // Try primary parser first
  try {
    const dataBuffer = await fs.readFile(filePath);

    // Try parsing with more permissive options
    const data = await pdfParse(dataBuffer, {
      // Max pages to parse (0 = all pages)
      max: 0,
      // More permissive parsing
      verbosity: 0,
    });

    if (!data.text || data.text.trim().length === 0) {
      throw new Error('No text content found in PDF');
    }

    return data.text;
  } catch (primaryError: any) {
    console.log('Primary PDF parser failed, trying fallback parser...');

    // Try fallback parser for corrupted/problematic PDFs
    try {
      const text = await extractTextFromPDFFallback(filePath);
      console.log('✅ Fallback PDF parser succeeded');
      return text;
    } catch (fallbackError: any) {
      console.error('Both PDF parsers failed:', {
        primary: primaryError.message,
        fallback: fallbackError.message,
      });

      // Provide helpful error message
      if (
        primaryError.message?.includes('Illegal character') ||
        primaryError.message?.includes('bad XRef')
      ) {
        throw new Error(
          'PDF file appears to be corrupted or uses an unsupported format. Please try:\n' +
            '1. Re-exporting your PDF from the original application\n' +
            '2. Using a DOCX file instead (recommended)\n' +
            '3. Using a PDF repair tool'
        );
      }

      throw new Error(
        `Failed to parse PDF file. Please try uploading a DOCX file instead. Error: ${primaryError.message}`
      );
    }
  }
}

/**
 * Extract text from DOCX file
 */
async function extractTextFromDOCX(filePath: string): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error('Failed to parse DOCX file');
  }
}

/**
 * Clean extracted text (remove excessive whitespace, etc.)
 */
export function cleanExtractedText(text: string): string {
  return text
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
    .replace(/[ \t]{2,}/g, ' ') // Reduce multiple spaces to single space
    .trim();
}
