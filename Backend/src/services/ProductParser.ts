import dotenv from "dotenv";

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
    const prompt = `You are a product list parser for a shopping expense tracker for FloWealth.
TASK: Parse user shopping text into a JSON array of products.

IMPORTANT RULES:
- Extract ONLY these 3 fields: name, quantity, estprice
- Ignore all "filler" words and conversational text like:
  * "I need for cooking", "I'll make dinner", "I should buy"
  * "Something for dessert", "stuff for the week"
  * "Maybe some", "I also need", "Could grab"
  
- name: product name as string (lowercase, short, no description)
- quantity: number (default to 1 if unclear or not specified)
- estprice: price in euros as number (if you can't determine price, use 0)

EXTRACTION EXAMPLES:
- Input: "milk 2L 2 euro, also bread and butter"
  Output: [{"name":"milk","quantity":2,"estprice":2},{"name":"bread","quantity":1,"estprice":0},{"name":"butter","quantity":1,"estprice":0}]

- Input: "I'll make pizza, need mozzarella and tomatoes and ham"
  Output: [{"name":"mozzarella","quantity":1,"estprice":0},{"name":"tomatoes","quantity":1,"estprice":0},{"name":"ham","quantity":1,"estprice":0}]

- Input: "bought milk 1.5 euro"
  Output: [{"name":"milk","quantity":1,"estprice":1.5}]

- Input: "I need some stuff for cooking: rice, chicken, vegetables"
  Output: [{"name":"rice","quantity":1,"estprice":0},{"name":"chicken","quantity":1,"estprice":0},{"name":"vegetables","quantity":1,"estprice":0}]

OUTPUT FORMAT: Pure JSON array only, no markdown, no explanations, no additional text.
If input has no valid products, return empty array [].
`;
    const response = await fetch(String(this.apiURL), {
      method: "Post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });
    console.log(response);
    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }
    const data = await response.json();
    console.log("data", data);
    const result = data.choices?.[0]?.message?.content;
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
