# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MCP (Model Context Protocol) server that exposes the Senja testimonial API as MCP tools. Runs over stdio transport and requires a `SENJA_API_KEY` environment variable.

## Commands

- `npm run build` — Compile TypeScript to `lib/`
- `npm run dev` — Watch mode compilation
- `npm test` — Run tests once (`vitest run`)
- `npm run test:watch` — Watch mode testing
- `npm run test:mcpinspector` — Launch MCP Inspector for manual testing (uses 1Password CLI to inject `SENJA_API_KEY`)
- `npm start` — Run the built server (`node lib/index.js`)

## Architecture

Two source files in `src/`:

- **`index.ts`** — MCP server entry point. Creates an `McpServer` instance, registers three tools (`list_testimonials`, `get_testimonial`, `create_testimonial`) with Zod input schemas, and connects via `StdioServerTransport`. All tool handlers delegate to `SenjaApiClient` and return JSON-stringified results.
- **`senja-api.ts`** — HTTP client for the Senja REST API (`https://api.senja.io/v1`). Exports `SenjaApiClient` (handles auth, request building, error handling) and TypeScript interfaces for testimonial data types. Uses native `fetch`.

## Testing

Tests use vitest with `globalThis.fetch` mocking. Test files live in `tests/` with mock factories in `tests/helpers/mock-senja.ts`. Two test suites:

- **`senja-api.test.ts`** — API client tests (headers, endpoints, query params, error handling)
- **`tools.test.ts`** — Tool handler tests (response formatting, parameter passing, error propagation)

## Key Details

- ESM project (`"type": "module"`) — all imports use `.js` extensions
- TypeScript strict mode, target ES2022, module resolution Node16
- Output goes to `lib/` directory
- Dependencies: `@modelcontextprotocol/sdk` and `zod`
