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

    const userMessage = `Compare these two shopping notes.

NOTE_A:
title: ${params.noteA.productTitle ?? "N/A"}
estimated_cost: ${params.noteA.estcost ?? "N/A"}
actual_cost: ${params.noteA.cost ?? "N/A"}
price_diff: ${Number.isFinite(priceDiffA) ? `${priceDiffA >= 0 ? "+" : ""}${priceDiffA}` : "N/A"}
items: ${
      Array.isArray(params.noteA.products) && params.noteA.products.length > 0
        ? params.noteA.products
            .map(
              (p, i) =>
                `${i + 1}. ${p?.name ?? "N/A"} | qty: ${p?.quantity ?? "N/A"} | price: ${p?.estprice ?? "N/A"}`,
            )
            .join(", ")
        : "N/A"
    }

NOTE_B:
title: ${params.noteB.productTitle ?? "N/A"}
estimated_cost: ${params.noteB.estcost ?? "N/A"}
actual_cost: ${params.noteB.cost ?? "N/A"}
price_diff: ${Number.isFinite(priceDiffB) ? `${priceDiffB >= 0 ? "+" : ""}${priceDiffB}` : "N/A"}
items: ${
      Array.isArray(params.noteB.products) && params.noteB.products.length > 0
        ? params.noteB.products
            .map(
              (p, i) =>
                `${i + 1}. ${p?.name ?? "N/A"} | qty: ${p?.quantity ?? "N/A"} | price: ${p?.estprice ?? "N/A"}`,
            )
            .join(", ")
        : "N/A"
    }

GOAL:
- Produce a consistent, strict response format every time.
- If any field is missing or cannot be determined, output "N/A" (exactly).
- Always include ALL sections below in the exact order shown.
- Do NOT add extra sections, extra tables, or extra commentary outside the template.

TABLE_RULES (MANDATORY):
- Output MUST begin with the markdown table (first line must start with "|category|note_a|note_b|").
- Table MUST have exactly 3 columns: category, note_a, note_b
- Table MUST have exactly these 4 rows in this order:
  1) estimated_cost
  2) actual_cost
  3) price_diff
  4) item_count
- Each cell must be a single short value (number, currency, short text like "N/A").
- Never put lists or multiple items in any table cell.
- If you cannot compute a value, put "N/A".

INSIGHTS_RULES (MANDATORY):
- The next section title MUST be exactly: **Key Insights**
- Provide EXACTLY 3 bullet points.
- Each bullet MUST match this exact pattern:
  - **<short_title>**: <short_value_or_N/A>
- Keep titles short (1-3 words). Keep values short (max ~6 words).
- If you have no insight, still output 3 bullets with "N/A".

RECOMMENDATION_RULES (MANDATORY):
- The next section title MUST be exactly: **Final Recommendation**
- Output EXACTLY 3 bullets:
  - <short_text_or_N/A>
  - <short_text_or_N/A>
  - <short_text_or_N/A>
- If you cannot recommend, use "N/A" for all 3 bullets.

WINNER_RULES (MANDATORY):
- The FINAL section title MUST be exactly: **Winner**
- Output EXACTLY 3 bullets:
  - winner: <Note A | Note B | Tie>
  - reason: <short_text_or_N/A>
  - reason: <short_text_or_N/A>
- If winner cannot be determined, use "Tie" and "N/A" reasons.

OUTPUT_TEMPLATE (COPY EXACTLY; replace only values):

|category|note_a|note_b|
|---|---|---|
|estimated_cost|<value_or_N/A>|<value_or_N/A>|
|actual_cost|<value_or_N/A>|<value_or_N/A>|
|price_diff|<value_or_N/A>|<value_or_N/A>|
|item_count|<value_or_N/A>|<value_or_N/A>|

**Key Insights**
- **<short_title>**: <short_value_or_N/A>
- **<short_title>**: <short_value_or_N/A>
- **<short_title>**: <short_value_or_N/A>

**Final Recommendation**
- <short_text_or_N/A>
- <short_text_or_N/A>
- <short_text_or_N/A>

**Winner**
- winner: <Note A | Note B | Tie>
- reason: <short_text_or_N/A>
- reason: <short_text_or_N/A>
`.trim();

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
