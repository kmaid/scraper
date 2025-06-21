import dotenv from "dotenv";
import { AgenticScraper } from "./agenticScraper";

// Load environment variables
dotenv.config();

// Export the main class for use in other modules
export { AgenticScraper } from "./agenticScraper";
export * from "./types";

// Export individual services for advanced usage
export { BrowserService } from "./services/browserService";
export { LLMService } from "./services/llmService";
export { SchemaValidator } from "./services/schemaValidator";

async function demo() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("Please set ANTHROPIC_API_KEY in your .env file");
    process.exit(1);
  }

  const scraper = new AgenticScraper(apiKey, {
    headless: false, // Show browser
    slowMo: 1000, // Slow down for visibility
    screenshotDir: "./screenshots",
  });

  // Example usage
  const exampleUrl = "https://example.com";

  try {
    console.log("🤖 Starting agentic scraping with Playwright...");

    const result = await scraper.scrape({
      url: exampleUrl,
      description: "Extract the main content and metadata from this page",
    });

    if (result.success) {
      console.log("✅ Scraping completed successfully!");
      console.log("📊 Extracted data:", JSON.stringify(result.data, null, 2));
      console.log("🔧 Generated scraper code:", result.scraperCode);
      console.log(`📈 Attempts needed: ${result.attempts}`);
      console.log(`📸 Screenshots taken: ${result.screenshots?.length || 0}`);
    } else {
      console.error("❌ Scraping failed:");
      result.errors?.forEach((error) => console.error(`  - ${error}`));
    }
  } catch (error) {
    console.error("💥 Unexpected error:", error);
  }
}

// Run the demo if this file is executed directly (ESM compatible)
if (import.meta.url === `file://${process.argv[1]}`) {
  demo().catch(console.error);
}
