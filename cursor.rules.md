# Cursor Rules for Agentic Web Scraper - Playwright Edition

## Project Goal

Build an agentic web scraping system in TypeScript that uses LLMs (Claude via LangChain) and Playwright to automate the process of extracting structured data from websites. The system should:

- Use Playwright to control a real browser (visible by default)
- Analyze HTML using an LLM via LangChain
- Generate example data (fixtures)
- Generate a Zod schema
- Generate TypeScript code using DOM APIs
- Validate output against the schema
- Iteratively improve the schema or scraper code until validation passes
- Capture screenshots at each step for visual feedback

## Stack

- **Language:** TypeScript
- **Browser Automation:** Playwright (Chrome)
- **LLM:** Claude (Anthropic) via LangChain
- **Schema Validation:** Zod
- **HTML Parsing:** DOM APIs (in browser context)
- **Orchestration:** Custom agentic loop with visual feedback
- **Environment:** Node.js
- **Package Manager:** Yarn

## Conventions

- All code should be type-safe and use TypeScript best practices
- Use Playwright for browser automation (not headless by default)
- LLM prompts should be clear, explicit, and robust to hallucination
- Generated code (schemas, scrapers) should be validated before execution
- Use environment variables for API keys
- All services should be modular and testable
- Document all public interfaces and main workflow steps
- Capture screenshots at key points for debugging
- Provide visual feedback during automation

## Directory Structure

- `src/` — main source code
- `src/services/` — service modules (browser automation, LLM, schema validator)
- `src/types/` — TypeScript interfaces and types
- `screenshots/` — generated screenshots
- `README.md` — project documentation
- `env.example` — environment variable template

## Browser Automation

- Use Playwright to control real Chrome browser
- Default to non-headless mode for visual feedback
- Capture screenshots at each step
- Support custom browser actions (click, type, scroll, wait)
- Handle browser errors gracefully
- Provide slowMo option for visibility

## Iteration

- If validation fails, always send the error, scraped data, and HTML back to the LLM for improvement
- Repeat until the data is successfully extracted and validated
- Capture screenshots at each attempt for debugging
- Provide visual feedback during the improvement process

## Security

- All generated code must be sandboxed and sanitized before execution
- Never allow arbitrary code execution outside the sandbox
- Block dangerous patterns like eval, fetch, XMLHttpRequest in generated code
- Secure API key management through environment variables

## Key Features

- Real browser automation with Playwright
- Visual feedback and screenshot capture
- LangChain integration for LLM calls
- DOM-based code generation and execution
- Iterative improvement with visual debugging
- Comprehensive error handling

---

_Last updated: 2024-06-11_
