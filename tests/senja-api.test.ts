import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { SenjaApiClient, SenjaApiError } from "../src/senja-api.js";
import {
  mockTestimonialResponse,
  mockListTestimonialsResponse,
  createMockFetch,
} from "./helpers/mock-senja.js";

describe("SenjaApiClient", () => {
  let client: SenjaApiClient;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    client = new SenjaApiClient("test-api-key");
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe("request headers", () => {
    it("should include authorization header with bearer token", async () => {
      const mockFetch = createMockFetch([
        { status: 200, body: mockListTestimonialsResponse() },
      ]);
      globalThis.fetch = mockFetch;

      await client.listTestimonials();

      const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect((options.headers as Record<string, string>)["Authorization"]).toBe(
        "Bearer test-api-key",
      );
    });

    it("should include content-type json header", async () => {
      const mockFetch = createMockFetch([
        { status: 200, body: mockListTestimonialsResponse() },
      ]);
      globalThis.fetch = mockFetch;

      await client.listTestimonials();

      const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(
        (options.headers as Record<string, string>)["Content-Type"],
      ).toBe("application/json");
    });
  });

  describe("listTestimonials", () => {
    it("should call the correct endpoint", async () => {
      const mockFetch = createMockFetch([
        { status: 200, body: mockListTestimonialsResponse() },
      ]);
      globalThis.fetch = mockFetch;

      await client.listTestimonials();

      const [url] = mockFetch.mock.calls[0] as [string];
      expect(url).toContain("https://api.senja.io/v1/testimonials");
    });

    it("should return testimonials data", async () => {
      const expected = mockListTestimonialsResponse();
      globalThis.fetch = createMockFetch([{ status: 200, body: expected }]);

      const result = await client.listTestimonials();

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it("should pass filter parameters as query params", async () => {
      const mockFetch = createMockFetch([
        { status: 200, body: mockListTestimonialsResponse() },
      ]);
      globalThis.fetch = mockFetch;

      await client.listTestimonials({
        approved: true,
        rating: 5,
        type: "text",
        sort: "rating",
        order: "desc",
        limit: 50,
        page: 2,
      });

      const [url] = mockFetch.mock.calls[0] as [string];
      expect(url).toContain("approved=true");
      expect(url).toContain("rating=5");
      expect(url).toContain("type=text");
      expect(url).toContain("sort=rating");
      expect(url).toContain("order=desc");
      expect(url).toContain("limit=50");
      expect(url).toContain("page=2");
    });

    it("should pass tags as repeated query params", async () => {
      const mockFetch = createMockFetch([
        { status: 200, body: mockListTestimonialsResponse() },
      ]);
      globalThis.fetch = mockFetch;

      await client.listTestimonials({ tags: ["happy", "featured"] });

      const [url] = mockFetch.mock.calls[0] as [string];
      expect(url).toContain("tags=happy");
      expect(url).toContain("tags=featured");
    });

    it("should not include undefined params in query string", async () => {
      const mockFetch = createMockFetch([
        { status: 200, body: mockListTestimonialsResponse() },
      ]);
      globalThis.fetch = mockFetch;

      await client.listTestimonials({});

      const [url] = mockFetch.mock.calls[0] as [string];
      const urlObj = new URL(url);
      expect([...urlObj.searchParams.keys()]).toHaveLength(0);
    });
  });

  describe("getTestimonial", () => {
    it("should call the correct endpoint with ID", async () => {
      const mockFetch = createMockFetch([
        { status: 200, body: mockTestimonialResponse() },
      ]);
      globalThis.fetch = mockFetch;

      await client.getTestimonial("test-id-1");

      const [url] = mockFetch.mock.calls[0] as [string];
      expect(url).toBe(
        "https://api.senja.io/v1/testimonials/test-id-1",
      );
    });

    it("should return the testimonial", async () => {
      const expected = mockTestimonialResponse();
      globalThis.fetch = createMockFetch([{ status: 200, body: expected }]);

      const result = await client.getTestimonial("test-id-1");

      expect(result.id).toBe("test-id-1");
      expect(result.customer_name).toBe("Jane Doe");
    });
  });

  describe("createTestimonial", () => {
    it("should POST to the correct endpoint", async () => {
      const mockFetch = createMockFetch([
        { status: 200, body: mockTestimonialResponse() },
      ]);
      globalThis.fetch = mockFetch;

      await client.createTestimonial({
        type: "text",
        customer_name: "Jane Doe",
        text: "Great product!",
      });

      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toContain("https://api.senja.io/v1/testimonials");
      expect(options.method).toBe("POST");
    });

    it("should send the testimonial data in the body", async () => {
      const mockFetch = createMockFetch([
        { status: 200, body: mockTestimonialResponse() },
      ]);
      globalThis.fetch = mockFetch;

      const payload = {
        type: "text" as const,
        customer_name: "Jane Doe",
        text: "Great product!",
        rating: 5,
        tags: ["happy"],
      };

      await client.createTestimonial(payload);

      const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(JSON.parse(options.body as string)).toEqual(payload);
    });

    it("should return the created testimonial", async () => {
      const expected = mockTestimonialResponse({ text: "New testimonial" });
      globalThis.fetch = createMockFetch([{ status: 200, body: expected }]);

      const result = await client.createTestimonial({
        type: "text",
        customer_name: "Jane Doe",
        text: "New testimonial",
      });

      expect(result.text).toBe("New testimonial");
    });
  });

  describe("error handling", () => {
    it("should throw SenjaApiError on 401", async () => {
      globalThis.fetch = createMockFetch([
        { status: 401, body: "Unauthorized" },
      ]);

      await expect(client.listTestimonials()).rejects.toThrow(SenjaApiError);
    });

    it("should throw SenjaApiError on 404", async () => {
      globalThis.fetch = createMockFetch([
        { status: 404, body: "Not Found" },
      ]);

      await expect(client.getTestimonial("nonexistent")).rejects.toThrow(
        SenjaApiError,
      );
    });

    it("should include status code in error", async () => {
      globalThis.fetch = createMockFetch([
        { status: 403, body: "Forbidden" },
      ]);

      try {
        await client.listTestimonials();
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(SenjaApiError);
        expect((error as SenjaApiError).status).toBe(403);
      }
    });

    it("should include error message from response", async () => {
      globalThis.fetch = createMockFetch([
        { status: 500, body: "Internal Server Error" },
      ]);

      await expect(client.listTestimonials()).rejects.toThrow(
        /Senja API error \(500\)/,
      );
    });
  });
});
