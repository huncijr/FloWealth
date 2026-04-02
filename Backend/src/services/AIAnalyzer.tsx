import dotenv from "dotenv";
import SYSTEM_PROMPT from "./SystemPrompt";

dotenv.config();

export interface AnalyzeReceiptParams {
  base64Image: string;
  plannedNote?: {
    productTitle: string;
    estcost: string | number;
    products: Array<{
      name: string;
      quantity: number | null;
      estprice: number | null;
    }>;
  };
}

export class AIReceiptAnalyzer {
  private apiKey: string | null;
  private apiURL: string | null;
  private model: string | null;

  constructor() {
    this.apiKey = process.env.AI_API_KEY || null;
    this.apiURL = process.env.API_URL || null;
    this.model = process.env.AI_MODEL || null;

    if (!this.apiKey || !this.apiURL || !this.model) {
      console.warn("AI_API_KEY not set in environment variables");
    }
  }

  /**
   * Analyzes a receipt image and returns a friendly text analysis
   * @param params - Object containing base64Image and optional plannedNote
   * @returns Friendly text analysis in the receipt's language
   */
  async analyzeReceipt(params: AnalyzeReceiptParams): Promise<string> {
    try {
      const { base64Image, plannedNote } = params;

      // Build the user message with receipt image and planned note data
      let userMessage =
        "Please analyze this receipt image and provide a detailed spending analysis.";

      if (plannedNote) {
        userMessage += `\n\nHere is what the user planned to buy before shopping:\n`;
        userMessage += `- Planned Title: ${plannedNote.productTitle}\n`;
        userMessage += `- Estimated Total Cost: ${plannedNote.estcost}\n`;
        userMessage += `- Planned Items:\n`;
        plannedNote.products.forEach((product, index) => {
          userMessage += `  ${index + 1}. ${product.name} - Qty: ${product.quantity}, Est. Price: ${product.estprice}\n`;
        });
        userMessage += `\nPlease compare the actual receipt with this plan and highlight any differences. Use my picture as to represent my language.`;
      }

      console.log(userMessage);

      const cleanBase64 = base64Image.replace(/\s/g, "");
      const hasPrefix = cleanBase64.startsWith("data:image");
      const imageURL = hasPrefix
        ? cleanBase64
        : `data:image/jpeg;base64,${cleanBase64}`;

      const response = await fetch(String(this.apiURL), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: userMessage,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageURL,
                  },
                },
              ],
            },
          ],
          max_tokens: 2000,
          temperature: 0.7, // Slightly higher for more natural, friendly responses
        }),
      });
      console.log(response);
      if (!response.ok) {
        throw new Error(
          `AI API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      console.log("data, ", data);
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("No content received from AI API");
      }

      return content;
    } catch (error) {
      console.error("Error analyzing receipt:", error);
      throw error;
    }
  }
}

// Singleton instance for easy import
export const aiReceiptAnalyzer = new AIReceiptAnalyzer();
