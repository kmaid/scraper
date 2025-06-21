import { chromium, Browser, Page } from "playwright";
import { ScraperConfig, PlaywrightContext } from "../types";
import * as fs from "fs";
import * as path from "path";

export class BrowserService {
  private config: ScraperConfig;
  private browser: Browser | null = null;

  constructor(config: ScraperConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: this.config.headless,
        slowMo: this.config.slowMo,
      });
    }
  }

  async navigateToPage(url: string): Promise<PlaywrightContext> {
    if (!this.browser) {
      await this.initialize();
    }

    const page = await this.browser!.newPage();

    // Set user agent via context
    await page.context().setExtraHTTPHeaders({
      "User-Agent": this.config.userAgent,
    });

    // Set viewport
    await page.setViewportSize({ width: 1280, height: 720 });

    console.log(`🌐 Navigating to ${url}...`);

    try {
      await page.goto(url, {
        waitUntil: "networkidle",
        timeout: this.config.requestTimeout,
      });

      // Wait a bit for any dynamic content
      await page.waitForTimeout(2000);

      const html = await page.content();

      return {
        browser: this.browser!,
        page,
        html,
      };
    } catch (error) {
      await page.close();
      throw new Error(`Failed to navigate to ${url}: ${error}`);
    }
  }

  async takeScreenshot(page: Page, name: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `${name}-${timestamp}.png`;
    const filepath = path.join(this.config.screenshotDir, filename);

    // Ensure screenshot directory exists
    if (!fs.existsSync(this.config.screenshotDir)) {
      fs.mkdirSync(this.config.screenshotDir, { recursive: true });
    }

    await page.screenshot({
      path: filepath,
      fullPage: true,
    });

    console.log(`📸 Screenshot saved: ${filepath}`);
    return filepath;
  }

  async executeScraper(page: Page, scraperCode: string): Promise<any> {
    try {
      // Execute the scraper code in the browser context
      const result = await page.evaluate((code: string) => {
        // Create a safe execution environment
        const sandbox = {
          document: document,
          window: window,
          // Add utility functions
          console: {
            log: (...args: any[]) => console.log("[Scraper]", ...args),
            warn: (...args: any[]) => console.warn("[Scraper]", ...args),
            error: (...args: any[]) => console.error("[Scraper]", ...args),
          },
          // Add common DOM traversal methods
          $: (selector: string) => document.querySelector(selector),
          $$: (selector: string) =>
            Array.from(document.querySelectorAll(selector)),
          // Add text extraction helpers
          getText: (element: Element | null) =>
            element?.textContent?.trim() || "",
          getAttribute: (element: Element | null, attr: string) =>
            element?.getAttribute(attr) || "",
          getInnerHTML: (element: Element | null) => element?.innerHTML || "",
        };

        // Create and execute the function
        const scraperFunction = new Function(
          "document",
          "window",
          "console",
          "$",
          "$$",
          "getText",
          "getAttribute",
          "getInnerHTML",
          `
          try {
            ${code}
          } catch (error) {
            console.error('Scraper execution error:', error);
            throw error;
          }
        `
        );

        return scraperFunction(
          sandbox.document,
          sandbox.window,
          sandbox.console,
          sandbox.$,
          sandbox.$$,
          sandbox.getText,
          sandbox.getAttribute,
          sandbox.getInnerHTML
        );
      }, scraperCode);

      return result;
    } catch (error) {
      throw new Error(`Failed to execute scraper: ${error}`);
    }
  }

  async performActions(page: Page, actions: any[]): Promise<void> {
    for (const action of actions) {
      console.log(`🎯 Performing action: ${action.description}`);

      switch (action.type) {
        case "click":
          if (action.selector) {
            await page.click(action.selector);
          }
          break;
        case "type":
          if (action.selector && action.text) {
            await page.fill(action.selector, action.text);
          }
          break;
        case "scroll":
          await page.evaluate(() => window.scrollBy(0, 500));
          break;
        case "wait":
          await page.waitForTimeout(action.delay || 1000);
          break;
        case "screenshot":
          await this.takeScreenshot(page, action.description || "action");
          break;
        default:
          console.warn(`Unknown action type: ${action.type}`);
      }

      if (action.delay) {
        await page.waitForTimeout(action.delay);
      }
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  validateScraperCode(scraperCode: string): boolean {
    try {
      // Basic syntax validation
      new Function(
        "document",
        "window",
        "console",
        "$",
        "$$",
        "getText",
        "getAttribute",
        "getInnerHTML",
        scraperCode
      );
      return true;
    } catch {
      return false;
    }
  }

  sanitizeScraperCode(scraperCode: string): string {
    // Remove any potentially dangerous code patterns
    const dangerousPatterns = [
      /eval\s*\(/gi,
      /Function\s*\(/gi,
      /setTimeout\s*\(/gi,
      /setInterval\s*\(/gi,
      /process\./gi,
      /require\s*\(/gi,
      /import\s*\(/gi,
      /fetch\s*\(/gi,
      /XMLHttpRequest/gi,
    ];

    let sanitized = scraperCode;
    dangerousPatterns.forEach((pattern) => {
      sanitized = sanitized.replace(pattern, "// BLOCKED: $&");
    });

    return sanitized;
  }
}
