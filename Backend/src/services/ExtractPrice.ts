import dotenv from "dotenv";
import { UserIdRequest } from "../types/interfaces";
import { NextFunction, response } from "express";
import SYSTEM_PROMPT from "./SystemPrompt";
dotenv.config();

interface PriceExtractResult {
  price: number;
  token: number;
}
export class ExtractPrice {
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
  async extractPriceFromReceipt(
    imageBase64: string,
  ): Promise<PriceExtractResult> {
    try {
      if (!imageBase64 || imageBase64.trim() === "") {
        return { price: 0, token: 0 };
      }
      const cleanBase64 = imageBase64.replace(/\s/g, "");
      const hasPrefix = cleanBase64.startsWith("data:image");
      const imageURL = hasPrefix
        ? cleanBase64
        : `data:image/jpeg;base64,${cleanBase64}`;

      const apiMessage: any[] = [
        {
          role: "system",
          content: `You MUST respond with ONLY valid JSON: {"price": 45.99}. No explanation.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract the total price from this receipt. Return ONLY JSON.",
            },
            {
              type: "image_url",
              image_url: { url: imageURL },
            },
          ],
        },
      ];
      const response = await fetch(String(this.apiURL), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: apiMessage,
          max_tokens: 300,
          temperature: 0.1,
        }),
      });
      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }
      const data = await response.json();
      console.log("Full data:", JSON.stringify(data, null, 2));
      let result =
        data.choices?.[0]?.message?.content ||
        data.choices?.[0]?.message?.reasoning;
      console.log(result);
      const tokens = data.usage?.total_tokens || 0;
      let price = 0;
      if (result) {
        try {
          const parsed = JSON.parse(result);
          price = parseFloat(parsed.price) || 0;
        } catch (error) {
          const numMatch = result.match(/[\d]+\.?[\d]*/);
          if (numMatch) {
            price = parseFloat(numMatch[0]);
          }
        }
      }
      return { price, token: tokens };
    } catch (error) {
      console.log("Error extracting price", error);
      return { price: 0, token: 0 };
    }
  }
  calculatePriceFromItems(
    items: Array<{ name: string; quantity: number; price: number }>,
  ): number {
    return items.reduce((sum, item) => {
      return sum + (Number(item.price) * Number(item.quantity) || 0);
    }, 0);
  }
}

export const extractPrice = new ExtractPrice();
