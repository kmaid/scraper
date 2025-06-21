import dotenv from "dotenv";
import { AgenticScraper } from "../src";

// Load environment variables
dotenv.config();

async function exampleUsage() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("Please set ANTHROPIC_API_KEY in your .env file");
    return;
  }

  const scraper = new AgenticScraper(apiKey);

  // Example 1: Scrape a news article
  console.log("📰 Scraping news article...");
  const newsResult = await scraper.scrape({
    url: "https://example.com",
    description:
      "Extract the article title, content, author, and publication date",
  });

  if (newsResult.success) {
    console.log("✅ News scraping successful!");
    console.log("📊 Data:", JSON.stringify(newsResult.data, null, 2));
  } else {
    console.log("❌ News scraping failed:", newsResult.errors);
  }

  // Example 2: Scrape product information
  console.log("\n🛍️ Scraping product page...");
  const productResult = await scraper.scrape({
    url: "https://example.com/product",
    description: "Extract product name, price, description, and images",
  });

  if (productResult.success) {
    console.log("✅ Product scraping successful!");
    console.log("📊 Data:", JSON.stringify(productResult.data, null, 2));
  } else {
    console.log("❌ Product scraping failed:", productResult.errors);
  }

  // Example 3: Analyze page structure
  console.log("\n🔍 Analyzing page structure...");
  try {
    const analysis = await scraper.analyzePage("https://example.com");
    console.log("📋 Page analysis:", JSON.stringify(analysis, null, 2));
  } catch (error) {
    console.log("❌ Analysis failed:", error);
  }
}

// Run the example
exampleUsage().catch(console.error);
