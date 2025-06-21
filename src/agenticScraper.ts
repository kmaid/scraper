import { BrowserService } from "./services/browserService";
import { LLMService } from "./services/llmService";
import { SchemaValidator } from "./services/schemaValidator";
import { ScrapingRequest, ScrapingResult, ScraperConfig } from "./types";
import { z } from "zod";

export class AgenticScraper {
  private browserService: BrowserService;
  private llmService: LLMService;
  private config: ScraperConfig;

  constructor(apiKey: string, config: Partial<ScraperConfig> = {}) {
    this.config = {
      maxRetries: 5,
      requestTimeout: 30000,
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      openaiModel: "claude-3-sonnet-20240229",
      headless: false, // Show browser by default
      slowMo: 1000, // Slow down actions for visibility
      screenshotDir: "./screenshots",
      ...config,
    };

    this.browserService = new BrowserService(this.config);
    this.llmService = new LLMService(apiKey, this.config.openaiModel);
  }

  async scrape<T = any>(request: ScrapingRequest): Promise<ScrapingResult<T>> {
    const maxRetries = request.maxRetries || this.config.maxRetries;
    let attempts = 0;
    let lastError: string | undefined;
    let screenshots: string[] = [];

    try {
      // Step 1: Navigate to page with Playwright
      console.log(`🌐 Navigating to ${request.url}...`);
      const context = await this.browserService.navigateToPage(request.url);

      // Take initial screenshot
      const initialScreenshot = await this.browserService.takeScreenshot(
        context.page,
        "initial"
      );
      screenshots.push(initialScreenshot);

      // Step 2: Initial analysis and schema generation
      console.log("🤖 Analyzing HTML and generating initial schema...");
      const llmResponse = await this.llmService.generateFixturesAndSchema(
        context.html,
        request.url,
        request.description
      );

      // Validate the generated schema
      if (!SchemaValidator.validateSchemaString(llmResponse.schema)) {
        throw new Error("Generated schema is invalid");
      }

      // Validate the generated scraper code
      if (!this.browserService.validateScraperCode(llmResponse.scraperCode)) {
        throw new Error("Generated scraper code is invalid");
      }

      // Step 3: Execute scraper and validate
      while (attempts < maxRetries) {
        attempts++;
        console.log(`🔄 Attempt ${attempts}/${maxRetries}...`);

        try {
          // Execute the scraper in the browser context
          const scrapedData = await this.browserService.executeScraper(
            context.page,
            llmResponse.scraperCode
          );

          // Take screenshot after scraping
          const attemptScreenshot = await this.browserService.takeScreenshot(
            context.page,
            `attempt-${attempts}`
          );
          screenshots.push(attemptScreenshot);

          // Validate against schema
          const validation = SchemaValidator.validateData<T>(
            scrapedData,
            llmResponse.schema
          );

          if (validation.success) {
            console.log("✅ Scraping successful!");

            // Take final success screenshot
            const successScreenshot = await this.browserService.takeScreenshot(
              context.page,
              "success"
            );
            screenshots.push(successScreenshot);

            await context.page.close();

            return {
              success: true,
              data: validation.data,
              schema: validation.data
                ? this.createSchemaFromString(llmResponse.schema)
                : undefined,
              scraperCode: llmResponse.scraperCode,
              attempts,
              screenshots,
            };
          } else {
            // Step 4: Improve scraper based on validation errors
            console.log("❌ Validation failed, improving scraper...");
            const errorMessage = SchemaValidator.formatValidationErrors(
              validation.errors!
            );

            const improvedResponse = await this.llmService.improveScraper(
              context.html,
              llmResponse.schema,
              llmResponse.scraperCode,
              errorMessage,
              scrapedData
            );

            // Update with improved version
            llmResponse.schema = improvedResponse.schema;
            llmResponse.scraperCode = improvedResponse.scraperCode;
            lastError = errorMessage;
          }
        } catch (error) {
          lastError = `Scraper execution error: ${error}`;
          console.warn(`Attempt ${attempts} failed: ${lastError}`);

          // Take error screenshot
          const errorScreenshot = await this.browserService.takeScreenshot(
            context.page,
            `error-${attempts}`
          );
          screenshots.push(errorScreenshot);
        }
      }

      // If we get here, all attempts failed
      await context.page.close();

      return {
        success: false,
        errors: [lastError || "All scraping attempts failed"],
        attempts,
        html: context.html,
        screenshots,
      };
    } catch (error) {
      return {
        success: false,
        errors: [`Initial setup failed: ${error}`],
        attempts: 0,
        screenshots,
      };
    } finally {
      // Always close the browser
      await this.browserService.close();
    }
  }

  private createSchemaFromString(schemaString: string) {
    try {
      const createSchema = new Function("z", `return ${schemaString}`);
      return createSchema(z);
    } catch {
      return undefined;
    }
  }

  async analyzePage(url: string): Promise<any> {
    try {
      const context = await this.browserService.navigateToPage(url);
      const analysis = await this.llmService.analyzeHTML(context.html, url);

      // Take analysis screenshot
      await this.browserService.takeScreenshot(context.page, "analysis");

      await context.page.close();
      return analysis;
    } catch (error) {
      throw new Error(`Failed to analyze page: ${error}`);
    } finally {
      await this.browserService.close();
    }
  }

  async performActions(url: string, actions: any[]): Promise<void> {
    try {
      const context = await this.browserService.navigateToPage(url);
      await this.browserService.performActions(context.page, actions);
      await context.page.close();
    } catch (error) {
      throw new Error(`Failed to perform actions: ${error}`);
    } finally {
      await this.browserService.close();
    }
  }
}
