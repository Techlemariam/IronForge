/**
 * Ollama Service v1.0
 * 
 * Handles all communication with the local Ollama daemon.
 * Default Endpoint: http://localhost:11434
 */

export interface OllamaRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  format?: 'json';
  options?: Record<string, any>;
  system?: string;
  template?: string;
  messages?: { role: string; content: string }[];
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

const OLLAMA_HOST = process.env.NEXT_PUBLIC_OLLAMA_URL || 'http://localhost:11434';

export const OllamaService = {
  /**
   * Check if Ollama is reachable
   */
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${OLLAMA_HOST}/api/tags`);
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Standard generation request
   */
  async generate(req: OllamaRequest): Promise<OllamaResponse> {
    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...req,
        stream: req.stream ?? false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama Error: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Helper for JSON-mode generation
   */
  async generateJSON<T>(req: Omit<OllamaRequest, 'format'>): Promise<T> {
    const res = await this.generate({
      ...req,
      format: 'json',
      stream: false,
    });

    try {
      return JSON.parse(res.response) as T;
    } catch (e) {
      console.error('Failed to parse Ollama JSON response:', res.response);
      throw new Error('Invalid JSON from Ollama');
    }
  },

  /**
   * Standard Chat completion
   */
  async chat(req: Omit<OllamaRequest, 'prompt'>): Promise<OllamaResponse> {
    const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...req,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama Chat Error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      ...data,
      response: data.message?.content || '',
    };
  },

  /**
   * Streaming response helper for Next.js API Routes
   */
  async streamResponse(req: OllamaRequest): Promise<ReadableStream> {
    const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...req,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama Streaming Error: ${response.statusText}`);
    }

    return response.body!;
  },
};
