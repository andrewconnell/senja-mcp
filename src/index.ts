#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { SenjaApiClient, SenjaApiError } from "./senja-api.js";

const SENJA_API_KEY = process.env.SENJA_API_KEY;

if (!SENJA_API_KEY) {
  console.error("Error: SENJA_API_KEY environment variable is required");
  process.exit(1);
}

const client = new SenjaApiClient(SENJA_API_KEY);

const server = new McpServer({
  name: "senja",
  version: "1.0.0",
});

function errorResult(message: string) {
  return {
    content: [{ type: "text" as const, text: message }],
    isError: true,
  };
}

function textResult(text: string) {
  return {
    content: [{ type: "text" as const, text }],
  };
}

// Tool: List testimonials
server.registerTool(
  "list_testimonials",
  {
    title: "List Testimonials",
    description:
      "Retrieve testimonials from your Senja project with optional filtering and sorting.",
    inputSchema: {
      sort: z
        .enum(["date", "rating"])
        .optional()
        .describe("Sort by date or rating (default: date)"),
      order: z
        .enum(["asc", "desc"])
        .optional()
        .describe("Sort direction (default: desc)"),
      approved: z
        .boolean()
        .optional()
        .describe("Filter by approval status"),
      rating: z
        .number()
        .int()
        .min(1)
        .max(5)
        .optional()
        .describe("Filter by star rating (1-5)"),
      type: z
        .enum(["text", "video"])
        .optional()
        .describe("Filter by testimonial type"),
      integration: z
        .string()
        .optional()
        .describe(
          "Filter by integration source (e.g., twitter, google, linkedin)",
        ),
      tags: z
        .array(z.string())
        .optional()
        .describe("Filter by tag names"),
      lang: z
        .string()
        .optional()
        .describe("Filter by language (ISO 639 code)"),
      limit: z
        .number()
        .int()
        .min(1)
        .max(1000)
        .optional()
        .describe("Number of results to return (1-1000, default: 100)"),
      page: z.number().int().min(1).optional().describe("Page number"),
    },
  },
  async (params) => {
    try {
      const result = await client.listTestimonials(params);
      return textResult(JSON.stringify(result, null, 2));
    } catch (error) {
      if (error instanceof SenjaApiError) {
        return errorResult(error.message);
      }
      return errorResult(`Failed to list testimonials: ${error}`);
    }
  },
);

// Tool: Get a specific testimonial
server.registerTool(
  "get_testimonial",
  {
    title: "Get Testimonial",
    description: "Retrieve a specific testimonial by its ID.",
    inputSchema: {
      id: z.string().describe("The testimonial ID"),
    },
  },
  async ({ id }) => {
    try {
      const result = await client.getTestimonial(id);
      return textResult(JSON.stringify(result, null, 2));
    } catch (error) {
      if (error instanceof SenjaApiError) {
        return errorResult(error.message);
      }
      return errorResult(`Failed to get testimonial: ${error}`);
    }
  },
);

// Tool: Create a new testimonial
server.registerTool(
  "create_testimonial",
  {
    title: "Create Testimonial",
    description: "Create a new testimonial in your Senja project.",
    inputSchema: {
      type: z
        .enum(["text", "video"])
        .describe("Testimonial type: text or video"),
      customer_name: z.string().describe("Name of the customer"),
      title: z.string().optional().describe("Testimonial title/headline"),
      text: z.string().optional().describe("Testimonial text content"),
      rating: z
        .number()
        .int()
        .min(1)
        .max(5)
        .optional()
        .describe("Star rating (1-5)"),
      url: z.string().url().optional().describe("Source URL"),
      date: z
        .string()
        .optional()
        .describe("Date in ISO 8601 format (e.g., 2024-01-15T00:00:00Z)"),
      approved: z
        .boolean()
        .optional()
        .describe("Whether the testimonial is approved"),
      customer_email: z
        .string()
        .email()
        .optional()
        .describe("Customer email"),
      customer_avatar: z
        .string()
        .url()
        .optional()
        .describe("Customer avatar URL"),
      customer_company: z
        .string()
        .optional()
        .describe("Customer company name"),
      customer_tagline: z
        .string()
        .optional()
        .describe("Customer tagline or job title"),
      customer_website: z
        .string()
        .url()
        .optional()
        .describe("Customer website URL"),
      integration: z
        .string()
        .optional()
        .describe("Integration source identifier"),
      tags: z
        .array(z.string())
        .optional()
        .describe("Tags to apply to the testimonial"),
      video_url: z
        .string()
        .url()
        .optional()
        .describe("Video URL (for video testimonials)"),
    },
  },
  async (params) => {
    try {
      const result = await client.createTestimonial(params);
      return textResult(JSON.stringify(result, null, 2));
    } catch (error) {
      if (error instanceof SenjaApiError) {
        return errorResult(error.message);
      }
      return errorResult(`Failed to create testimonial: ${error}`);
    }
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Senja MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
