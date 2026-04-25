import dotenv from "dotenv";
import SYSTEM_PROMPT from "./SystemPrompt";

dotenv.config();
interface ParsedProduct {
  name: string;
  quantity: number | null;
  estprice: number | null;
}
interface ParseResult {
  products: ParsedProduct[];
  token: number;
}

export class ProductPArser {
  private apiKey: string | null;
  private apiURL: string | null;
  private model: string | null;
  constructor() {
    this.apiKey = process.env.AI_API_KEY || null;
    this.apiURL = process.env.API_URL || null;
    this.model = process.env.AI_MODEL || null;
  }
  async ParseProducts(userText: string): Promise<ParseResult> {
    userText += `
You are a product list parser for a shopping expense tracker.

TASK: Extract products from user text. Extract ANY product-like noun you can find.

CRITICAL RULES:
1. EXTRACT EVERY product noun you can identify - do NOT skip products
2. Only ignore pure actions/verbs like "buy", "get", "need", "want" as standalone words
3. The PRODUCT is what comes AFTER action words, not before
4. Extract 3 fields ONLY: name, quantity, estprice

GOOD EXAMPLES (extract products):
- "milk 2L 2 euro" → [{"name":"milk","quantity":2,"estprice":2}]
- "I want to buy a milk for 4$" → [{"name":"milk","quantity":1,"estprice":4}]
- "I'll get bread and butter" → [{"name":"bread","quantity":1,"estprice":0},{"name":"butter","quantity":1,"estprice":0}]
- "bought milk 1.5 euro" → [{"name":"milk","quantity":1,"estprice":1.5}]
- "I need some stuff for cooking: rice, chicken, vegetables" → [{"name":"rice","quantity":1,"estprice":0},{"name":"chicken","quantity":1,"estprice":0},{"name":"vegetables","quantity":1,"estprice":0}]

WHAT TO IGNORE (not products):
- "for cooking", "for dinner", "for dessert" - these describe purpose, not products
- "stuff", "things", "items" - vague words, extract what follows

PRICE EXTRACTION:
- If price mentioned, extract it
- If no price, use 0
- Currency: just the number (ignore $ € etc symbols)

OUTPUT: Pure JSON array only, no markdown, no explanation.
Empty input = return []
`;
    console.log(userText);
    const response = await fetch(String(this.apiURL), {
      method: "Post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userText },
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });
    // console.log(response);
    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }
    const data = await response.json();
    // console.log("data:", data, "\n");
    const result = data.choices?.[0]?.message?.content;
    console.log("result:", result);

    const tokens = data.usage?.total_tokens || 0;
    let products: ParsedProduct[] = [];
    try {
      products = JSON.parse(result);
    } catch (e) {
      products = [];
    }
    return { products, token: tokens };
  }
}
export const productParser = new ProductPArser();
