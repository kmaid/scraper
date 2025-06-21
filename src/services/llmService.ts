import { ChatAnthropic } from "@langchain/anthropic";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { LLMResponse, HTMLAnalysis, ScraperConfig } from "../types";

export class LLMService {
  private model: ChatAnthropic;

  constructor(apiKey: string, model: string = "claude-3-sonnet-20240229") {
    this.model = new ChatAnthropic({
      apiKey,
      model,
      temperature: 0.1,
    });
  }

  async analyzeHTML(html: string, url: string): Promise<HTMLAnalysis> {
    const systemPrompt = `You are an expert web analyst. Analyze the provided HTML and extract key information about the page structure and data patterns.

Focus on:
1. Page title and main purpose
2. Key data elements and their structure
3. Repeating patterns that might contain structured data
4. CSS classes and IDs that could be used for scraping

Return a JSON object with:
- title: The page title
- description: A brief description of the page content
- keyElements: Array of important HTML elements or patterns
- dataPatterns: Array of data structures you observe`;

    const humanPrompt = `Analyze this HTML from ${url}:

${html.substring(0, 10000)}${html.length > 10000 ? "... (truncated)" : ""}

Provide your analysis as a valid JSON object.`;

    const response = await this.model.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(humanPrompt),
    ]);

    try {
      return JSON.parse(response.content as string);
    } catch (error) {
      throw new Error(`Failed to parse LLM response: ${error}`);
    }
  }

  async generateFixturesAndSchema(
    html: string,
    url: string,
    description?: string
  ): Promise<LLMResponse> {
    const systemPrompt = `You are an expert data extraction specialist. Your task is to:
1. Analyze the HTML and identify the key structured data on the page
2. Create example data (fixtures) that represent the typical data found
3. Generate a Zod schema that validates this data structure
4. Write TypeScript code using DOM APIs to extract this data

The Zod schema should be comprehensive and handle edge cases.
The scraper code should use DOM APIs like querySelector, textContent, etc.

Return your response as a JSON object with:
- fixtures: Array of example data objects
- schema: A valid Zod schema as a string
- scraperCode: TypeScript code using DOM APIs
- explanation: Brief explanation of your approach`;

    const humanPrompt = `Analyze this HTML from ${url}${
      description ? ` (${description})` : ""
    }:

${html.substring(0, 8000)}${html.length > 8000 ? "... (truncated)" : ""}

Generate fixtures, schema, and scraper code for the most important structured data on this page.`;

    const response = await this.model.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(humanPrompt),
    ]);

    try {
      return JSON.parse(response.content as string);
    } catch (error) {
      throw new Error(`Failed to parse LLM response: ${error}`);
    }
  }

  async improveScraper(
    html: string,
    currentSchema: string,
    currentScraperCode: string,
    validationErrors: string,
    scrapedData: any
  ): Promise<LLMResponse> {
    const systemPrompt = `You are an expert data extraction specialist. The current scraper failed validation. Your task is to improve either the schema or the scraper code based on the validation errors.

Analyze the errors and the scraped data to understand what went wrong, then provide an improved solution.

Return your response as a JSON object with:
- fixtures: Updated example data objects
- schema: Improved Zod schema as a string
- scraperCode: Improved TypeScript code using DOM APIs
- explanation: Explanation of what was wrong and how you fixed it`;

    const humanPrompt = `The scraper failed validation. Here are the details:

Original HTML (first 5000 chars):
${html.substring(0, 5000)}${html.length > 5000 ? "... (truncated)" : ""}

Current Schema:
${currentSchema}

Current Scraper Code:
${currentScraperCode}

Validation Errors:
${validationErrors}

Scraped Data:
${JSON.stringify(scrapedData, null, 2)}

Please improve the schema or scraper code to fix these validation issues.`;

    const response = await this.model.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(humanPrompt),
    ]);

    try {
      return JSON.parse(response.content as string);
    } catch (error) {
      throw new Error(`Failed to parse LLM response: ${error}`);
    }
  }
}
