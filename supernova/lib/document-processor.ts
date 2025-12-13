import * as pdf from 'pdf-parse'
import mammoth from 'mammoth'
import fs from 'fs'

export type DocumentType = 'pdf' | 'docx' | 'markdown' | 'text'

export interface ProcessedDocument {
  text: string
  metadata: {
    title?: string
    pages?: number
    wordCount: number
  }
}

/**
 * Parse PDF file and extract text
 */
export async function parsePDF(filePath: string): Promise<ProcessedDocument> {
  const dataBuffer = fs.readFileSync(filePath)
  const data = await pdf(dataBuffer)

  return {
    text: data.text,
    metadata: {
      pages: data.numpages,
      wordCount: data.text.split(/\s+/).length,
    },
  }
}

/**
 * Parse DOCX file and extract text
 */
export async function parseDOCX(filePath: string): Promise<ProcessedDocument> {
  const result = await mammoth.extractRawText({ path: filePath })

  return {
    text: result.value,
    metadata: {
      wordCount: result.value.split(/\s+/).length,
    },
  }
}

/**
 * Parse Markdown file
 */
export async function parseMarkdown(filePath: string): Promise<ProcessedDocument> {
  const text = fs.readFileSync(filePath, 'utf-8')

  return {
    text,
    metadata: {
      wordCount: text.split(/\s+/).length,
    },
  }
}

/**
 * Parse plain text file
 */
export async function parseText(filePath: string): Promise<ProcessedDocument> {
  const text = fs.readFileSync(filePath, 'utf-8')

  return {
    text,
    metadata: {
      wordCount: text.split(/\s+/).length,
    },
  }
}

/**
 * Auto-detect file type and parse accordingly
 */
export async function parseDocument(filePath: string): Promise<ProcessedDocument> {
  const extension = filePath.toLowerCase().split('.').pop()

  switch (extension) {
    case 'pdf':
      return parsePDF(filePath)
    case 'docx':
      return parseDOCX(filePath)
    case 'md':
    case 'markdown':
      return parseMarkdown(filePath)
    case 'txt':
      return parseText(filePath)
    default:
      throw new Error(`Unsupported file type: ${extension}`)
  }
}
