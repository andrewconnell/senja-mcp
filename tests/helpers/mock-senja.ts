import type { SenjaTestimonial, ListTestimonialsResponse } from "../../src/senja-api.js";

export function mockTestimonialResponse(
  overrides: Partial<SenjaTestimonial> = {},
): SenjaTestimonial {
  return {
    id: "test-id-1",
    type: "text",
    customer_name: "Jane Doe",
    title: "Great product!",
    text: "I love using this product. Highly recommended.",
    rating: 5,
    approved: true,
    customer_email: "jane@example.com",
    customer_company: "Acme Corp",
    customer_tagline: "CEO",
    tags: ["happy", "featured"],
    ...overrides,
  };
}

export function mockListTestimonialsResponse(
  overrides: Partial<ListTestimonialsResponse> = {},
): ListTestimonialsResponse {
  return {
    data: [mockTestimonialResponse(), mockTestimonialResponse({ id: "test-id-2", customer_name: "John Smith" })],
    total: 2,
    page: 1,
    limit: 100,
    ...overrides,
  };
}

interface MockResponseConfig {
  status: number;
  body: unknown;
}

export function createMockFetch(responses: MockResponseConfig[]) {
  let callIndex = 0;

  return vi.fn(async () => {
    const config = responses[Math.min(callIndex, responses.length - 1)];
    callIndex++;

    return {
      ok: config.status >= 200 && config.status < 300,
      status: config.status,
      json: async () => config.body,
      text: async () =>
        typeof config.body === "string"
          ? config.body
          : JSON.stringify(config.body),
    } as unknown as Response;
  });
}
