import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';

// Mock AI SDK
const mockToTextStreamResponse = vi.fn(() => new Response('Streamed response'));

vi.mock('ai', () => ({
    streamText: vi.fn(() => ({
        toTextStreamResponse: mockToTextStreamResponse
    })),
}));

vi.mock('@ai-sdk/google', () => ({
    createGoogleGenerativeAI: vi.fn(() => vi.fn()),
}));

describe('Chat API Route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should generate a streaming response from Gemini', async () => {
        const mockRequest = new Request('http://localhost:3000/api/chat', {
            method: 'POST',
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'Hail Oracle' }],
                context: { level: 1 }
            }),
        });

        const response = await POST(mockRequest);

        expect(response).toBeInstanceOf(Response);
        expect(mockToTextStreamResponse).toHaveBeenCalled();
    });

    it('should handle missing context gracefully', async () => {
        const mockRequest = new Request('http://localhost:3000/api/chat', {
            method: 'POST',
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'Hail Oracle' }]
            }),
        });

        const response = await POST(mockRequest);
        expect(response).toBeInstanceOf(Response);
        expect(mockToTextStreamResponse).toHaveBeenCalled();
    });
});
