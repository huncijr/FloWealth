import { Product } from "../types/interfaces";
import { conversationservice } from "./ConversationService";
import SYSTEM_PROMPT from "./SystemPrompt";

interface NoteData {
  productTitle: string;
  estcost: string | number;
  cost: string | number;
  products: Product[];
  picture?: string | null;
}

interface CompareNotesParams {
  noteA: NoteData;
  noteB: NoteData;
}

interface CompareNotesResult {
  result: string;
  token: number;
}

export class NoteComparisonAnalyzer {
  private apiKey: string | null;
  private apiURL: string | null;
  private model: string | null;

  constructor() {
    this.apiKey = process.env.AI_API_KEY || null;
    this.apiURL = process.env.API_URL || null;
    this.model = process.env.AI_MODEL || null;
  }
  async compareNotes(params: CompareNotesParams): Promise<CompareNotesResult> {
    const priceDiffA = Number(params.noteA.cost) - Number(params.noteA.estcost);
    const priceDiffB = Number(params.noteB.cost) - Number(params.noteB.estcost);

    const userMessage = `Compare these two shopping notes:
NOTE_A:
title: ${params.noteA.productTitle}
estimated_cost: ${params.noteA.estcost}
actual_cost: ${params.noteA.cost}
price_diff: ${priceDiffA >= 0 ? "+" : ""}${priceDiffA}
items: ${params.noteA.products.map((p, i) => `${i + 1}. ${p.name} | qty: ${p.quantity} | price: ${p.estprice}`).join(", ")}

NOTE_B:
title: ${params.noteB.productTitle}
estimated_cost: ${params.noteB.estcost}
actual_cost: ${params.noteB.cost}
price_diff: ${priceDiffB >= 0 ? "+" : ""}${priceDiffB}
items: ${params.noteB.products.map((p, i) => `${i + 1}. ${p.name} | qty: ${p.quantity} | price: ${p.estprice}`).join(", ")}

Respond ONLY in this markdown format:

|category|note_a|note_b|
|---|---|---|
|estimated_cost|$35.00|$23.00|
|actual_cost|$49.00|$41.72|
...

**Key Insights**
- **Insight Title**: Description here
- **Another Insight**: More description

**Note A** represents better value because:
- reason one
- reason two

**Final Recommendation**
- tip one
- tip two
- tip three`.trim();

    const messageContent: any[] = [{ type: "text", text: userMessage }];
    if (params.noteA.picture) {
      const cleanBase64 = params.noteA.picture.replace(/\s/g, "");
      const hasPrefix = cleanBase64.startsWith("data:image");
      messageContent.push({
        type: "image_url",
        image_url: {
          url: hasPrefix
            ? cleanBase64
            : `data:image/jpeg;base64,${cleanBase64}`,
        },
      });
    }

    const response = await fetch(String(this.apiURL), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: messageContent },
        ],
        max_tokens: 2500,
        temperature: 0.7,
      }),
    });

    console.log(response);

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.choices?.[0].message?.content;

    if (!result) {
      throw new Error(`No content received from AI API`);
    }

    const tokens =
      data.usage?.total_tokens || conversationservice.estimateTokens(result);

    return { result, token: tokens };
  }
}

export const noteComparisionAnalyzer = new NoteComparisonAnalyzer();
