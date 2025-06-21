# Agentic Web Scraper - Playwright Edition

An intelligent web scraping system that uses LLMs (Claude) and Playwright to automatically extract structured data from websites. The system opens a real browser, analyzes HTML, generates schemas, creates scrapers, and iteratively improves them while you watch the automation in action.

## Features

- 🌐 **Real Browser Automation**: Uses Playwright to control a real Chrome browser
- 👀 **Visual Automation**: Watch the browser perform actions in real-time
- 🤖 **LLM-Powered Analysis**: Uses Claude via LangChain to analyze HTML and understand page structure
- 📊 **Automatic Schema Generation**: Creates Zod schemas based on extracted example data
- 🔧 **Code Generation**: Generates TypeScript code using DOM APIs to extract data
- ✅ **Validation & Iteration**: Validates extracted data and improves scrapers on failure
- 🔄 **Self-Improving**: Iteratively refines both schema and scraper code
- 📸 **Screenshot Capture**: Automatically captures screenshots at each step
- 🛡️ **Safe Execution**: Sandboxed code execution with security measures

## Workflow

1. **Open Browser**: Playwright launches a real Chrome browser (visible by default)
2. **Navigate**: Browser navigates to the target webpage
3. **LLM Analysis**: Claude analyzes the HTML and identifies data patterns
4. **Generate Fixtures**: Creates example data structures from the page
5. **Create Schema**: Generates a Zod schema based on the fixtures
6. **Write Scraper**: Creates TypeScript code using DOM APIs
7. **Execute & Validate**: Runs the scraper in the browser and validates against the schema
8. **Iterate**: If validation fails, sends errors back to Claude for improvement
9. **Success**: Returns validated data, schema, scraper code, and screenshots

## Installation

```bash
# Install dependencies
yarn install

# Install Playwright browsers
yarn install-browsers
```

## Configuration

1. Copy the environment file:

```bash
cp env.example .env
```

2. Add your Anthropic API key to `.env`:

```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ANTHROPIC_MODEL=claude-3-sonnet-20240229
```

## Usage

### Basic Usage

```typescript
import { AgenticScraper } from "./src";

const scraper = new AgenticScraper(process.env.ANTHROPIC_API_KEY!, {
  headless: false, // Show browser
  slowMo: 1000, // Slow down actions for visibility
  screenshotDir: "./screenshots",
});

const result = await scraper.scrape({
  url: "https://example.com",
  description: "Extract product information from this e-commerce page",
});

if (result.success) {
  console.log("Extracted data:", result.data);
  console.log("Generated schema:", result.schema);
  console.log("Scraper code:", result.scraperCode);
  console.log("Screenshots:", result.screenshots);
} else {
  console.error("Scraping failed:", result.errors);
}
```

### Advanced Configuration

```typescript
const scraper = new AgenticScraper(apiKey, {
  maxRetries: 5,
  requestTimeout: 30000,
  userAgent: "Custom User Agent",
  openaiModel: "claude-3-sonnet-20240229",
  headless: false, // Show browser window
  slowMo: 1000, // Slow down actions (milliseconds)
  screenshotDir: "./screenshots",
});
```

### Page Analysis

```typescript
const analysis = await scraper.analyzePage("https://example.com");
console.log("Page analysis:", analysis);
```

### Perform Custom Actions

```typescript
const actions = [
  {
    type: "click",
    selector: ".login-button",
    description: "Click login button",
  },
  {
    type: "type",
    selector: "#email",
    text: "user@example.com",
    description: "Enter email",
  },
  { type: "wait", delay: 2000, description: "Wait for page to load" },
  { type: "screenshot", description: "Take screenshot after login" },
];

await scraper.performActions("https://example.com", actions);
```

## Development

```bash
# Install dependencies
yarn install

# Install Playwright browsers
yarn install-browsers

# Run demo
yarn dev

# Build the project
yarn build

# Run tests
yarn test
```

## Example Output

The system generates:

1. **Structured Data**: Validated data matching the generated schema
2. **Zod Schema**: Type-safe validation schema
3. **Scraper Code**: Reusable TypeScript code using DOM APIs
4. **Screenshots**: Visual record of each step in the process
5. **Analysis**: Page structure and data pattern analysis

## Directory Structure

```
src/
├── agenticScraper.ts      # Main orchestrator class
├── services/
│   ├── browserService.ts  # Playwright browser automation
│   ├── llmService.ts      # LangChain Claude integration
│   └── schemaValidator.ts # Zod schema validation
├── types/
│   └── index.ts          # TypeScript interfaces
└── index.ts              # Entry point and exports
screenshots/              # Generated screenshots
```

## Dependencies

- **Playwright**: Browser automation and control
- **LangChain**: LLM integration framework
- **Anthropic Claude**: AI model for analysis and code generation
- **Zod**: Schema validation
- **TypeScript**: Type safety

## Browser Automation Features

- **Real Browser**: Uses actual Chrome browser (not headless by default)
- **Visual Feedback**: Watch actions happen in real-time
- **Screenshot Capture**: Automatic screenshots at each step
- **Action Recording**: Perform custom browser actions
- **Error Handling**: Robust error handling with visual feedback

## Security Features

- Sandboxed code execution
- Dangerous code pattern blocking
- Input validation and sanitization
- Safe HTML parsing
- Secure API key management

## Error Handling

The system handles various failure modes:

- Network errors with retry logic
- Invalid generated schemas
- Malformed scraper code
- Validation failures with automatic improvement
- Browser automation errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
