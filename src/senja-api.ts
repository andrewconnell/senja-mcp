const SENJA_API_BASE = "https://api.senja.io/v1";

export interface SenjaTestimonial {
  id: string;
  type: "text" | "video";
  title?: string;
  text?: string;
  rating?: number;
  url?: string;
  date?: string;
  approved?: boolean;
  customer_name: string;
  customer_email?: string;
  customer_avatar?: string;
  customer_company?: string;
  customer_tagline?: string;
  customer_website?: string;
  integration?: string;
  tags?: string[];
  video_url?: string;
  permalink?: string;
  media?: Array<{ url: string; type: string }>;
}

export interface ListTestimonialsParams {
  sort?: "date" | "rating";
  order?: "asc" | "desc";
  approved?: boolean;
  rating?: number;
  type?: "text" | "video";
  integration?: string;
  tags?: string[];
  lang?: string;
  limit?: number;
  page?: number;
}

export interface CreateTestimonialParams {
  type: "text" | "video";
  customer_name: string;
  title?: string;
  text?: string;
  rating?: number;
  url?: string;
  date?: string;
  approved?: boolean;
  customer_email?: string;
  customer_avatar?: string;
  customer_company?: string;
  customer_tagline?: string;
  customer_website?: string;
  integration?: string;
  tags?: string[];
  video_url?: string;
}

export interface ListTestimonialsResponse {
  data: SenjaTestimonial[];
  total: number;
  page: number;
  limit: number;
}

export class SenjaApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "SenjaApiError";
  }
}

export class SenjaApiClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    params?: Record<string, string | string[] | number | boolean | undefined>,
  ): Promise<T> {
    const url = new URL(`${SENJA_API_BASE}${path}`);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value === undefined) continue;
        if (Array.isArray(value)) {
          for (const v of value) {
            url.searchParams.append(key, v);
          }
        } else {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(url.toString(), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new SenjaApiError(
        response.status,
        `Senja API error (${response.status}): ${errorText}`,
      );
    }

    return (await response.json()) as T;
  }

  async listTestimonials(
    params?: ListTestimonialsParams,
  ): Promise<ListTestimonialsResponse> {
    const queryParams: Record<
      string,
      string | string[] | number | boolean | undefined
    > = {};

    if (params) {
      if (params.sort) queryParams.sort = params.sort;
      if (params.order) queryParams.order = params.order;
      if (params.approved !== undefined)
        queryParams.approved = params.approved;
      if (params.rating !== undefined) queryParams.rating = params.rating;
      if (params.type) queryParams.type = params.type;
      if (params.integration) queryParams.integration = params.integration;
      if (params.tags) queryParams.tags = params.tags;
      if (params.lang) queryParams.lang = params.lang;
      if (params.limit !== undefined) queryParams.limit = params.limit;
      if (params.page !== undefined) queryParams.page = params.page;
    }

    return this.request<ListTestimonialsResponse>(
      "GET",
      "/testimonials",
      undefined,
      queryParams,
    );
  }

  async getTestimonial(id: string): Promise<SenjaTestimonial> {
    return this.request<SenjaTestimonial>("GET", `/testimonials/${id}`);
  }

  async createTestimonial(
    params: CreateTestimonialParams,
  ): Promise<SenjaTestimonial> {
    return this.request<SenjaTestimonial>("POST", "/testimonials", params);
  }
}
