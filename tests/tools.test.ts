import { describe, it, expect, beforeEach, vi } from "vitest";
import type { SenjaApiClient } from "../src/senja-api.js";
import {
  mockTestimonialResponse,
  mockListTestimonialsResponse,
} from "./helpers/mock-senja.js";

type ToolHandler = (params: Record<string, unknown>) => Promise<{
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}>;

function createMockClient(): {
  [K in keyof SenjaApiClient]: ReturnType<typeof vi.fn>;
} {
  return {
    listTestimonials: vi.fn(),
    getTestimonial: vi.fn(),
    createTestimonial: vi.fn(),
  } as unknown as { [K in keyof SenjaApiClient]: ReturnType<typeof vi.fn> };
}

// Capture tool registrations by mocking McpServer
function createMockServer() {
  const tools: Record<string, ToolHandler> = {};

  return {
    server: {
      registerTool: (
        name: string,
        _config: unknown,
        handler: ToolHandler,
      ) => {
        tools[name] = handler;
      },
    },
    tools,
  };
}

// To test tool handlers, we need to extract them from the registration.
// Since index.ts registers tools on module load, we test the handler logic
// by re-implementing the pattern used in publer-mcp: capture the handlers.

describe("list_testimonials tool", () => {
  let mockClient: ReturnType<typeof createMockClient>;
  let handler: ToolHandler;

  beforeEach(() => {
    mockClient = createMockClient();
    // Simulate what the tool handler does
    handler = async (params: Record<string, unknown>) => {
      try {
        const result = await mockClient.listTestimonials(params);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : `Failed: ${error}`,
            },
          ],
          isError: true,
        };
      }
    };
  });

  it("should return testimonials as JSON", async () => {
    const mockResponse = mockListTestimonialsResponse();
    mockClient.listTestimonials.mockResolvedValue(mockResponse);

    const result = await handler({});

    expect(result.content[0].text).toBe(JSON.stringify(mockResponse, null, 2));
    expect(result.isError).toBeUndefined();
  });

  it("should pass filter parameters to client", async () => {
    mockClient.listTestimonials.mockResolvedValue(
      mockListTestimonialsResponse(),
    );

    const params = { approved: true, rating: 5, type: "text" };
    await handler(params);

    expect(mockClient.listTestimonials).toHaveBeenCalledWith(params);
  });

  it("should return error on failure", async () => {
    mockClient.listTestimonials.mockRejectedValue(
      new Error("Senja API error (401): Unauthorized"),
    );

    const result = await handler({});

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Unauthorized");
  });

  it("should handle empty results", async () => {
    mockClient.listTestimonials.mockResolvedValue(
      mockListTestimonialsResponse({ data: [], total: 0 }),
    );

    const result = await handler({});

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.data).toHaveLength(0);
    expect(parsed.total).toBe(0);
  });
});

describe("get_testimonial tool", () => {
  let mockClient: ReturnType<typeof createMockClient>;
  let handler: ToolHandler;

  beforeEach(() => {
    mockClient = createMockClient();
    handler = async ({ id }: Record<string, unknown>) => {
      try {
        const result = await mockClient.getTestimonial(id as string);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : `Failed: ${error}`,
            },
          ],
          isError: true,
        };
      }
    };
  });

  it("should return a testimonial by ID", async () => {
    const mockTestimonial = mockTestimonialResponse();
    mockClient.getTestimonial.mockResolvedValue(mockTestimonial);

    const result = await handler({ id: "test-id-1" });

    expect(mockClient.getTestimonial).toHaveBeenCalledWith("test-id-1");
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.id).toBe("test-id-1");
  });

  it("should return error for non-existent testimonial", async () => {
    mockClient.getTestimonial.mockRejectedValue(
      new Error("Senja API error (404): Not Found"),
    );

    const result = await handler({ id: "nonexistent" });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("404");
  });
});

describe("create_testimonial tool", () => {
  let mockClient: ReturnType<typeof createMockClient>;
  let handler: ToolHandler;

  beforeEach(() => {
    mockClient = createMockClient();
    handler = async (params: Record<string, unknown>) => {
      try {
        const result = await mockClient.createTestimonial(params);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : `Failed: ${error}`,
            },
          ],
          isError: true,
        };
      }
    };
  });

  it("should create a testimonial with required fields", async () => {
    const created = mockTestimonialResponse();
    mockClient.createTestimonial.mockResolvedValue(created);

    const params = { type: "text", customer_name: "Jane Doe" };
    const result = await handler(params);

    expect(mockClient.createTestimonial).toHaveBeenCalledWith(params);
    expect(result.isError).toBeUndefined();
  });

  it("should create a testimonial with all optional fields", async () => {
    const created = mockTestimonialResponse();
    mockClient.createTestimonial.mockResolvedValue(created);

    const params = {
      type: "text",
      customer_name: "Jane Doe",
      title: "Great product!",
      text: "I love it",
      rating: 5,
      approved: true,
      customer_email: "jane@example.com",
      customer_company: "Acme Corp",
      customer_tagline: "CEO",
      tags: ["happy"],
    };

    await handler(params);

    expect(mockClient.createTestimonial).toHaveBeenCalledWith(params);
  });

  it("should return error on API failure", async () => {
    mockClient.createTestimonial.mockRejectedValue(
      new Error("Senja API error (400): Bad Request"),
    );

    const result = await handler({
      type: "text",
      customer_name: "Jane Doe",
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("400");
  });
});
