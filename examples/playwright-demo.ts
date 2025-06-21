import dotenv from "dotenv";
import { AgenticScraper } from "../src";

// Load environment variables
dotenv.config();

async function demo() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("Please set ANTHROPIC_API_KEY in your .env file");
    return;
  }

  const scraper = new AgenticScraper(apiKey, {
    headless: false, // Show browser
    slowMo: 1000, // Slow down for visibility
    screenshotDir: "./screenshots",
  });

  try {
    console.log("🤖 Starting Playwright-based agentic scraping...");

    // Example 1: Basic scraping
    console.log("\n📰 Scraping news article...");
    const newsResult = await scraper.scrape({
      url: "https://example.com",
      description:
        "Extract the article title, content, author, and publication date",
    });

    if (newsResult.success) {
      console.log("✅ News scraping successful!");
      console.log("📊 Data:", JSON.stringify(newsResult.data, null, 2));
      console.log(
        `📸 Screenshots: ${newsResult.screenshots?.length || 0} taken`
      );
    } else {
      console.log("❌ News scraping failed:", newsResult.errors);
    }

    // Example 2: Page analysis
    console.log("\n🔍 Analyzing page structure...");
    try {
      const analysis = await scraper.analyzePage("https://example.com");
      console.log("📋 Page analysis:", JSON.stringify(analysis, null, 2));
    } catch (error) {
      console.log("❌ Analysis failed:", error);
    }

    // Example 3: Custom browser actions
    console.log("\n🎯 Performing custom browser actions...");
    try {
      const actions = [
        { type: "wait", delay: 2000, description: "Wait for page to load" },
        { type: "scroll", description: "Scroll down the page" },
        { type: "screenshot", description: "Take screenshot after scroll" },
        { type: "wait", delay: 1000, description: "Wait before closing" },
      ];

      await scraper.performActions("https://example.com", actions);
      console.log("✅ Custom actions completed!");
    } catch (error) {
      console.log("❌ Custom actions failed:", error);
    }
  } catch (error) {
    console.error("💥 Unexpected error:", error);
  }
}

// Run the demo
demo().catch(console.error);
