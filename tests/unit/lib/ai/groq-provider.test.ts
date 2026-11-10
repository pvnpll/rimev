import { GroqProvider } from "@/lib/providers/ai/groq-provider";
import { describe, expect, it, vi } from "vitest";

describe("GroqProvider", () => {
  it("throws when GROQ_API_KEY is not configured", () => {
    const originalEnv = process.env.GROQ_API_KEY;
    delete process.env.GROQ_API_KEY;

    expect(() => new GroqProvider()).toThrowError(/GROQ_API_KEY/);

    process.env.GROQ_API_KEY = originalEnv;
  });

  it("successfully parses JSON output from Groq /chat/completions", async () => {
    const provider = new GroqProvider({
      apiKey: "test-groq-key",
      model: "llama-3.3-70b-versatile",
    });

    const mockResponseBody = JSON.stringify({
      id: "chatcmpl-test",
      model: "llama-3.3-70b-versatile",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: JSON.stringify({
              cards: [
                {
                  front: "Hello",
                  back: "Namaskara",
                  pronunciation: "Na-mas-ka-ra",
                  example: "Namaskara, neevu hegiddira?",
                  notes: "Polite greeting",
                  nuance: "Standard polite form",
                },
                { front: "Water", back: "Neeru" },
              ],
            }),
          },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: 150,
        completion_tokens: 60,
        total_tokens: 210,
      },
    });

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => mockResponseBody,
      json: async () => JSON.parse(mockResponseBody),
    });

    global.fetch = mockFetch;

    const result = await provider.generateCards({
      goal: "Learn Kannada",
      topic: "Greetings",
      level: "beginner",
      batchSize: 2,
      context: { known: [], struggled: [], recentlySeen: [], preferences: {} },
      systemPrompt: "You are a tutor",
      userPrompt: "Generate cards",
    });

    expect(result.cards).toHaveLength(2);
    expect(result.cards[0]).toEqual({
      front: "Hello",
      back: "Namaskara",
      pronunciation: "Na-mas-ka-ra",
      example: "Namaskara, neevu hegiddira?",
      notes: "Polite greeting",
      nuance: "Standard polite form",
    });
    expect(result.cards[1]).toEqual({
      front: "Water",
      back: "Neeru",
      pronunciation: undefined,
      example: undefined,
      notes: undefined,
      nuance: undefined,
    });
    expect(result.usage?.promptTokens).toBe(150);
    expect(result.usage?.completionTokens).toBe(60);
    expect(result.usage?.totalTokens).toBe(210);
    expect(result.usage?.model).toBe("llama-3.3-70b-versatile");

    // Verify request payload and endpoint
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, requestInit] = mockFetch.mock.calls[0];
    expect(url).toBe("https://api.groq.com/openai/v1/chat/completions");
    expect(requestInit.headers["Authorization"]).toBe("Bearer test-groq-key");
    expect(requestInit.headers["Content-Type"]).toBe("application/json");

    const parsedBody = JSON.parse(requestInit.body);
    expect(parsedBody.model).toBe("llama-3.3-70b-versatile");
    expect(parsedBody.stream).toBe(false);
    expect(parsedBody.response_format).toEqual({ type: "json_object" });
  });

  it("strips markdown codeblock fences from raw JSON content", async () => {
    const provider = new GroqProvider({
      apiKey: "test-groq-key",
      model: "openai/gpt-oss-20b",
    });

    const wrappedJson = "```json\n{\"cards\": [{\"front\": \"Dog\", \"back\": \"Naayi\"}]}\n```";
    const mockResponseBody = JSON.stringify({
      choices: [
        {
          message: {
            content: wrappedJson,
          },
        },
      ],
      usage: {
        prompt_tokens: 50,
        completion_tokens: 30,
        total_tokens: 80,
      },
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => mockResponseBody,
      json: async () => JSON.parse(mockResponseBody),
    });

    const result = await provider.generateCards({
      goal: "Animals",
      topic: "Pets",
      level: "beginner",
      batchSize: 1,
      context: { known: [], struggled: [], recentlySeen: [], preferences: {} },
      systemPrompt: "You are a tutor",
      userPrompt: "Generate cards",
    });

    expect(result.cards).toHaveLength(1);
    expect(result.cards[0]).toEqual({
      front: "Dog",
      back: "Naayi",
      pronunciation: undefined,
      example: undefined,
      notes: undefined,
      nuance: undefined,
    });
  });

  it("handles custom baseUrl and timeout", async () => {
    const provider = new GroqProvider({
      apiKey: "test-groq-key",
      baseUrl: "https://custom-groq-proxy.internal/v1",
      timeoutMs: 15000,
    });

    const mockResponseBody = JSON.stringify({
      choices: [
        {
          message: {
            content: JSON.stringify({ cards: [{ front: "Cat", back: "Bekku" }] }),
          },
        },
      ],
    });

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => mockResponseBody,
      json: async () => JSON.parse(mockResponseBody),
    });
    global.fetch = mockFetch;

    await provider.generateCards({
      goal: "Animals",
      topic: "Cats",
      level: "beginner",
      batchSize: 1,
      context: { known: [], struggled: [], recentlySeen: [], preferences: {} },
      systemPrompt: "You are a tutor",
      userPrompt: "Generate cards",
    });

    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe("https://custom-groq-proxy.internal/v1/chat/completions");
  });

  it("identifies 429 rate limit errors and throws RATE_LIMITED", async () => {
    const provider = new GroqProvider({
      apiKey: "test-groq-key",
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      text: async () => "Rate limit reached",
    });

    await expect(
      provider.generateCards({
        goal: "Topic",
        topic: "Test",
        level: "beginner",
        batchSize: 1,
        context: { known: [], struggled: [], recentlySeen: [], preferences: {} },
        systemPrompt: "prompt",
        userPrompt: "prompt",
      }),
    ).rejects.toThrowError(/rate limit/i);
  });

  it("fails closed on 401 authorization failure without retrying next models", async () => {
    const provider = new GroqProvider({
      apiKey: "invalid-groq-key",
    });

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => "Unauthorized API key",
    });
    global.fetch = mockFetch;

    await expect(
      provider.generateCards({
        goal: "Topic",
        topic: "Test",
        level: "beginner",
        batchSize: 1,
        context: { known: [], struggled: [], recentlySeen: [], preferences: {} },
        systemPrompt: "prompt",
        userPrompt: "prompt",
      }),
    ).rejects.toThrowError(/unauthorized/i);

    // Fatal auth errors must fail immediately without spinning through candidate models
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
