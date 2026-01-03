// lib/utils/ocrParser.ts
import Tesseract from 'tesseract.js';

export interface ParsedReceipt {
  merchant: string;
  date: string;
  total: number;
  items: ReceiptItem[];
  category: string;
  confidence: number;
}

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
}

// Common merchant patterns
const MERCHANT_PATTERNS = [
  /walmart/i,
  /target/i,
  /costco/i,
  /safeway/i,
  /kroger/i,
  /whole foods/i,
  /trader joe/i,
  /amazon/i,
  /starbucks/i,
  /mcdonald/i,
  /subway/i,
  /best buy/i,
  /home depot/i,
  /lowes/i,
];

// Price patterns
const PRICE_PATTERN = /\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/;
const TOTAL_PATTERNS = [
  /total[:\s]+\$?\s*(\d+\.?\d*)/i,
  /amount[:\s]+\$?\s*(\d+\.?\d*)/i,
  /balance[:\s]+\$?\s*(\d+\.?\d*)/i,
  /grand total[:\s]+\$?\s*(\d+\.?\d*)/i,
];

// Date patterns
const DATE_PATTERNS = [
  /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/,
  /(\d{2,4}[-\/]\d{1,2}[-\/]\d{1,2})/,
  /([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{2,4})/,
];

export const parseReceiptImage = async (imageFile: File): Promise<ParsedReceipt> => {
  try {
    // Perform OCR
    const result = await Tesseract.recognize(imageFile, 'eng', {
      logger: (m) => console.log(m),
    });

    const text = result.data.text;
    const lines = text.split('\n').filter((line) => line.trim().length > 0);

    // Extract merchant
    const merchant = extractMerchant(lines);

    // Extract date
    const date = extractDate(text);

    // Extract total
    const total = extractTotal(lines);

    // Extract items
    const items = extractItems(lines);

    // Determine category
    const category = determineCategory(merchant, items);

    // Calculate confidence
    const confidence = calculateConfidence(merchant, date, total, items);

    return {
      merchant,
      date,
      total,
      items,
      category,
      confidence,
    };
  } catch (error) {
    console.error('OCR parsing failed:', error);
    throw new Error('Failed to parse receipt. Please try again with a clearer image.');
  }
};

function extractMerchant(lines: string[]): string {
  // Check first few lines for merchant name
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    
    // Check against known merchants
    for (const pattern of MERCHANT_PATTERNS) {
      if (pattern.test(line)) {
        return line.trim();
      }
    }

    // If line has more than 3 chars and is mostly uppercase, likely merchant
    if (line.length > 3 && line === line.toUpperCase()) {
      return line.trim();
    }
  }

  return lines[0]?.trim() || 'Unknown Merchant';
}

function extractDate(text: string): string {
  for (const pattern of DATE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return new Date().toISOString().split('T')[0];
}

function extractTotal(lines: string[]): number {
  // Look for total in last 10 lines
  const relevantLines = lines.slice(-10);

  for (const line of relevantLines) {
    for (const pattern of TOTAL_PATTERNS) {
      const match = line.match(pattern);
      if (match) {
        const amount = parseFloat(match[1].replace(/,/g, ''));
        if (amount > 0) {
          return amount;
        }
      }
    }
  }

  // Fallback: find largest price in receipt
  let maxPrice = 0;
  for (const line of lines) {
    const match = line.match(PRICE_PATTERN);
    if (match) {
      const price = parseFloat(match[1].replace(/,/g, ''));
      if (price > maxPrice) {
        maxPrice = price;
      }
    }
  }

  return maxPrice;
}

function extractItems(lines: string[]): ReceiptItem[] {
  const items: ReceiptItem[] = [];

  for (const line of lines) {
    const priceMatch = line.match(PRICE_PATTERN);
    if (priceMatch) {
      const price = parseFloat(priceMatch[1].replace(/,/g, ''));
      
      // Extract item name (text before price)
      const name = line.substring(0, line.indexOf(priceMatch[0])).trim();
      
      // Try to extract quantity
      const qtyMatch = name.match(/(\d+)\s*x\s*/i);
      const quantity = qtyMatch ? parseInt(qtyMatch[1]) : 1;

      if (name && price > 0 && price < 1000) {
        // Filter out likely totals/subtotals
        if (!/total|tax|subtotal|balance/i.test(name)) {
          items.push({
            name: name.replace(/\d+\s*x\s*/i, '').trim(),
            quantity,
            price,
          });
        }
      }
    }
  }

  return items;
}

function determineCategory(merchant: string, items: ReceiptItem[]): string {
  const merchantLower = merchant.toLowerCase();

  // Grocery stores
  if (/(walmart|target|kroger|safeway|whole foods|trader joe|costco)/i.test(merchantLower)) {
    return 'Food & Dining';
  }

  // Restaurants
  if (/(restaurant|cafe|coffee|starbucks|mcdonald|burger|pizza|subway)/i.test(merchantLower)) {
    return 'Food & Dining';
  }

  // Gas stations
  if (/(shell|chevron|exxon|mobil|gas|fuel)/i.test(merchantLower)) {
    return 'Transportation';
  }

  // Retail
  if (/(amazon|best buy|home depot|lowes|macy)/i.test(merchantLower)) {
    return 'Shopping';
  }

  // Pharmacy
  if (/(cvs|walgreens|pharmacy|rite aid)/i.test(merchantLower)) {
    return 'Healthcare';
  }

  return 'Other';
}

function calculateConfidence(
  merchant: string,
  date: string,
  total: number,
  items: ReceiptItem[]
): number {
  let confidence = 0;

  // Merchant found: +30%
  if (merchant && merchant !== 'Unknown Merchant') {
    confidence += 0.3;
  }

  // Valid date: +20%
  if (date && date !== new Date().toISOString().split('T')[0]) {
    confidence += 0.2;
  }

  // Valid total: +30%
  if (total > 0) {
    confidence += 0.3;
  }

  // Items found: +20%
  if (items.length > 0) {
    confidence += 0.2;
  }

  return Math.min(confidence, 1);
}

// Preprocess image for better OCR results
export const preprocessImage = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Convert to grayscale and increase contrast
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const contrast = 1.5;
    const adjusted = ((avg - 128) * contrast) + 128;
    
    data[i] = adjusted;     // R
    data[i + 1] = adjusted; // G
    data[i + 2] = adjusted; // B
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
};