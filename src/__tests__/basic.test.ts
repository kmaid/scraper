import { describe, it, expect } from "vitest";
import { AgenticScraper } from "../agenticScraper";

describe("AgenticScraper", () => {
  it("should be defined", () => {
    expect(AgenticScraper).toBeDefined();
  });

  it("should be a class", () => {
    expect(typeof AgenticScraper).toBe("function");
  });

  it("should have a constructor", () => {
    expect(AgenticScraper.prototype.constructor).toBeDefined();
  });
});
