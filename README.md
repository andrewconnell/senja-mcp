# MCP Server for Senja (unofficial)

> Collect, Manage and Share Testimonials - *The easiest way to collect testimonials and add them to your website. Get started for free.*

[![@andrewconnell/senja-mcp@next](https://img.shields.io/badge/github-repo-blue?logo=github)](https://github.com/andrewconnell/senja-mcp)
[![@andrewconnell/senja-mcp@latest](https://img.shields.io/npm/v/@andrewconnell/senja-mcp/latest?style=flat-square&color=%230E1F43)](https://www.npmjs.com/package/@andrewconnell/senja-mcp)
[![@andrewconnell/senja-mcp@next](https://img.shields.io/npm/v/@andrewconnell/senja-mcp/next?style=flat-square&color=%23D96200)](https://www.npmjs.com/package/@andrewconnell/senja-mcp)

An MCP (Model Context Protocol) server for the [Senja](https://senja.io) testimonial API. This server allows AI assistants like Claude to interact with your Senja testimonials through standardized MCP tools.

## Features

- **List testimonials** with filtering by approval status, rating, type, integration source, tags, and language
- **Get a specific testimonial** by ID
- **Create new testimonials** with full support for customer details, ratings, tags, and media

## Prerequisites

- Node.js 18+
- A Senja account on the Starter or Pro plan
- A Senja API key (available from the **Automate** section in your Senja dashboard)

## Setup

1. Clone this repository:

   ```console
   git clone https://github.com/andrewconnell/senja-mcp.git
   cd senja-mcp
   ```

2. Install dependencies:

   ```console
   npm install
   ```

3. Build the project:

   ```console
   npm run build
   ```

## Configuration

### Claude Desktop

Add the following to your Claude Desktop configuration file (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "senja": {
      "command": "node",
      "args": ["/path/to/senja-mcp/lib/index.js"],
      "env": {
        "SENJA_API_KEY": "your-senja-api-key"
      }
    }
  }
}
```

### Claude Code

Add the following to your Claude Code MCP settings:

```json
{
  "mcpServers": {
    "senja": {
      "command": "node",
      "args": ["/path/to/senja-mcp/lib/index.js"],
      "env": {
        "SENJA_API_KEY": "your-senja-api-key"
      }
    }
  }
}
```

### Environment Variables

| Variable        | Required | Description          |
| --------------- | -------- | -------------------- |
| `SENJA_API_KEY` | Yes      | Your Senja API key   |

## Available Tools

### `list_testimonials`

Retrieve testimonials with optional filtering and sorting.

**Parameters:**
- `sort` — Sort by `date` or `rating` (default: `date`)
- `order` — Sort direction: `asc` or `desc` (default: `desc`)
- `approved` — Filter by approval status
- `rating` — Filter by star rating (1-5)
- `type` — Filter by type: `text` or `video`
- `integration` — Filter by source (e.g., `twitter`, `google`, `linkedin`)
- `tags` — Filter by tag names
- `lang` — Filter by language (ISO 639 code)
- `limit` — Number of results (1-1000, default: 100)
- `page` — Page number for pagination

### `get_testimonial`

Retrieve a specific testimonial by ID.

**Parameters:**
- `id` — The testimonial ID (required)

### `create_testimonial`

Create a new testimonial.

**Parameters:**
- `type` — Testimonial type: `text` or `video` (required)
- `customer_name` — Name of the customer (required)
- `title` — Testimonial title/headline
- `text` — Testimonial text content
- `rating` — Star rating (1-5)
- `url` — Source URL
- `date` — Date in ISO 8601 format
- `approved` — Whether the testimonial is approved
- `customer_email` — Customer email
- `customer_avatar` — Customer avatar URL
- `customer_company` — Customer company name
- `customer_tagline` — Customer tagline or job title
- `customer_website` — Customer website URL
- `integration` — Integration source identifier
- `tags` — Tags to apply
- `video_url` — Video URL (for video testimonials)

## License

MIT
