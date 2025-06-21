// Vitest setup file
import dotenv from "dotenv";
import { beforeAll } from "vitest";

// Load environment variables for tests
dotenv.config({ path: ".env.test" });

beforeAll(() => {
  // Global test setup
  console.log("Setting up test environment...");
});

// Global test timeout
// Vitest handles this via config
