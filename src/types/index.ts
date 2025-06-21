import { z } from "zod";
import { Browser, Page } from "playwright";

export interface ScrapingRequest {
  url: string;
  description?: string;
  maxRetries?: number;
  headless?: boolean;
  slowMo?: number;
}

export interface ScrapingResult<T = any> {
  success: boolean;
  data?: T;
  schema?: z.ZodSchema<T>;
  scraperCode?: string;
  errors?: string[];
  attempts: number;
  html?: string;
  screenshots?: string[];
}

export interface LLMResponse {
  fixtures: any[];
  schema: string;
  scraperCode: string;
  explanation?: string;
}

export interface ValidationError {
  message: string;
  scrapedData: any;
  schemaErrors: z.ZodError;
}

export interface ScraperConfig {
  maxRetries: number;
  requestTimeout: number;
  userAgent: string;
  openaiModel: string;
  headless: boolean;
  slowMo: number;
  screenshotDir: string;
}

export interface HTMLAnalysis {
  title: string;
  description: string;
  keyElements: string[];
  dataPatterns: string[];
}

export interface PlaywrightContext {
  browser: Browser;
  page: Page;
  html: string;
}

export interface BrowserAction {
  type: "click" | "type" | "scroll" | "wait" | "screenshot" | "extract";
  selector?: string;
  text?: string;
  delay?: number;
  description: string;
}
