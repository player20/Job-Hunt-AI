/**
 * Resume Parser Service
 * Combines text extraction and Claude AI parsing
 */

import { extractTextFromFile, cleanExtractedText } from '../utils/text-extractor';
import { claudeService, type ParsedResumeData } from './claudeService';

/**
 * Parse a resume file and extract structured data
 */
export async function parseResumeFile(
  filePath: string,
  fileType: string
): Promise<ParsedResumeData> {
  try {
    // Step 1: Extract raw text from file
    console.log('📄 Extracting text from file...');
    const rawText = await extractTextFromFile(filePath, fileType);

    // Step 2: Clean the extracted text
    const cleanedText = cleanExtractedText(rawText);

    if (!cleanedText || cleanedText.length < 50) {
      throw new Error('Extracted text is too short or empty');
    }

    console.log(`📝 Extracted ${cleanedText.length} characters of text`);

    // Step 3: Parse with Claude AI
    console.log('🤖 Parsing resume with Claude AI...');
    const parsedData = await claudeService.parseResume(cleanedText);

    console.log('✅ Resume parsed successfully');
    return parsedData;
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw error;
  }
}

/**
 * Re-parse existing resume text (without re-extracting from file)
 */
export async function reparseResumeText(rawText: string): Promise<ParsedResumeData> {
  try {
    const cleanedText = cleanExtractedText(rawText);

    if (!cleanedText || cleanedText.length < 50) {
      throw new Error('Resume text is too short or empty');
    }

    console.log('🤖 Re-parsing resume with Claude AI...');
    const parsedData = await claudeService.parseResume(cleanedText);

    console.log('✅ Resume re-parsed successfully');
    return parsedData;
  } catch (error) {
    console.error('Error re-parsing resume:', error);
    throw error;
  }
}
