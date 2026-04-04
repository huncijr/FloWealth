import dotenv from "dotenv";
import SYSTEM_PROMPT from "./SystemPrompt";
import { conversationservice } from "./ConversationService";

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
  message?: string;
  previousMessages?: Array<{ role: string; content: string }>;
  isInitialAnalysis: boolean;
}
interface AiAnalysisResult {
  content: string;
  token: number;
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
  async analyzeReceipt(
    params: AnalyzeReceiptParams,
  ): Promise<AiAnalysisResult> {
    try {
      const {
        base64Image,
        plannedNote,
        message,
        previousMessages,
        isInitialAnalysis,
      } = params;

      const apiMessage: any[] = [{ role: "system", content: SYSTEM_PROMPT }];

      // Build the user message with receipt image and planned note data
      let userMessage = "";

      if (isInitialAnalysis && plannedNote) {
        userMessage += `\n\nHere is what the user planned to buy before shopping:\n`;
        userMessage += `- Planned Title: ${plannedNote.productTitle}\n`;
        userMessage += `- Estimated Total Cost: ${plannedNote.estcost}\n`;
        userMessage += `- Planned Items:\n`;
        plannedNote.products.forEach((product, index) => {
          userMessage += `  ${index + 1}. ${product.name} - Qty: ${product.quantity}, Est. Price: ${product.estprice}\n`;
        });
        userMessage += `\nPlease compare the actual receipt with this plan and highlight any differences. Use my picture as to represent my language. 
        If there is no picture provided or the picture is not about finance dont speak about it or dont get to your attention`;
        if (base64Image && base64Image.trim() !== "") {
          userMessage +=
            "\nPlease also analyze the attached receipt image and compare with the planned data. Use the languange on the picture as your final response language, unless the user ask to translate";
        } else {
          userMessage +=
            "\nPlease provide analysis and insights about this spending plan.";
        }
        const messageContent: any[] = [{ type: "text", text: userMessage }];

        const content: any[] = [{ type: "text", text: userMessage }];

        if (base64Image && base64Image.trim() !== "") {
          const cleanBase64 = base64Image.replace(/\s/g, "");
          const hasPrefix = cleanBase64.startsWith("data:image");
          const imageURL = hasPrefix
            ? cleanBase64
            : `data:image/jpeg;base64,${cleanBase64}`;

          content.push({
            type: "image_url",
            image_url: {
              url: imageURL,
            },
          });
          messageContent.push({
            type: "image_url",
            image_url: { url: imageURL },
          });
        }
        apiMessage.push({
          role: "user",
          content: messageContent,
        });
      } else if (previousMessages && previousMessages.length > 0) {
        previousMessages.forEach((msg) => {
          apiMessage.push({
            role: msg.role === "ai" ? "assistant" : "user",
            content: msg.content,
          });
        });
        apiMessage.push({
          role: "user",
          content: message || "Please provide more details",
        });
      } else if (message) {
        apiMessage.push({ role: "user", content: message });
      }

      const response = await fetch(String(this.apiURL), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: apiMessage,
          max_tokens: 2000,
          temperature: 0.7, // Slightly higher for more natural, friendly responses
        }),
      });

      if (!response.ok) {
        throw new Error(
          `AI API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      const result = data.choices?.[0]?.message?.content;
      const tokens =
        data.usage?.total_tokens || conversationservice.estimateTokens(result);

      console.log(tokens);

      if (!result) {
        throw new Error("No content received from AI API");
      }

      return { content: result, token: tokens };
    } catch (error) {
      console.error("Error analyzing receipt:", error);
      throw error;
    }
  }
}

// Singleton instance for easy import
export const aiReceiptAnalyzer = new AIReceiptAnalyzer();
