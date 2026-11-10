import { createAIProvider } from "@/lib/providers/ai/provider-factory";
import { describe, expect, it } from "vitest";

describe("createAIProvider", () => {
  it("creates GeminiProvider when requested", () => {
    const provider = createAIProvider({
      providerName: "gemini",
      geminiOptions: { apiKey: "test-gemini-key" },
    });
    expect(provider.name).toBe("gemini");
  });

  it("creates OpenRouterProvider when requested", () => {
    const provider = createAIProvider({
      providerName: "openrouter",
      openrouterOptions: { apiKey: "test-openrouter-key" },
    });
    expect(provider.name).toBe("openrouter");
  });

  it("creates GroqProvider when requested", () => {
    const provider = createAIProvider({
      providerName: "groq",
      groqOptions: { apiKey: "test-groq-key" },
    });
    expect(provider.name).toBe("groq");
  });

  it("creates OllamaCloudProvider when requested", () => {
    const provider = createAIProvider({
      providerName: "ollama",
      ollamaOptions: { apiKey: "test-ollama-key" },
    });
    expect(provider.name).toBe("ollama");
  });

  it("respects AI_PROVIDER=groq environment variable", () => {
    const originalProvider = process.env.AI_PROVIDER;
    const originalGroqKey = process.env.GROQ_API_KEY;

    process.env.AI_PROVIDER = "groq";
    process.env.GROQ_API_KEY = "test-groq-env-key";

    try {
      const provider = createAIProvider();
      expect(provider.name).toBe("groq");
    } finally {
      process.env.AI_PROVIDER = originalProvider;
      process.env.GROQ_API_KEY = originalGroqKey;
    }
  });

  it("respects AI_PROVIDER=ollama environment variable", () => {
    const originalProvider = process.env.AI_PROVIDER;
    const originalOllamaKey = process.env.OLLAMA_API_KEY;

    process.env.AI_PROVIDER = "ollama";
    process.env.OLLAMA_API_KEY = "test-ollama-env-key";

    try {
      const provider = createAIProvider();
      expect(provider.name).toBe("ollama");
    } finally {
      process.env.AI_PROVIDER = originalProvider;
      process.env.OLLAMA_API_KEY = originalOllamaKey;
    }
  });

  it("throws for unsupported provider name", () => {
    expect(() =>
      createAIProvider({ providerName: "unsupported-provider" }),
    ).toThrowError(/Unsupported AI provider/);
  });
});

