// Quick test script to debug the chat API
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    headers: {
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Happy Land Chatbot Test",
    },
});

async function test() {
    console.log("Testing OpenRouter API...");
    console.log("API Key:", process.env.OPENROUTER_API_KEY?.substring(0, 20) + "...");

    try {
        const result = streamText({
            model: openai("google/gemini-2.5-flash"),
            messages: [
                { role: "user", content: "Xin chào, bạn là ai?" }
            ],
            system: "Bạn là trợ lý AI thân thiện.",
        });

        console.log("\n--- Streaming response ---");

        // Try different stream methods
        const fullResponse = await result;

        // Access the base stream to see raw parts
        const baseStream = (fullResponse as any).baseStream;
        if (baseStream) {
            console.log("BaseStream found, reading parts...");
            const reader = baseStream.getReader();
            let partCount = 0;
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                partCount++;
                console.log(`Part ${partCount}:`, JSON.stringify(value, null, 2));
            }
            console.log(`Total parts: ${partCount}`);
        } else {
            console.log("No baseStream found");
        }

        // Also try text
        const text = await result.text;
        console.log("\n--- Final Text ---");
        console.log(text || "(empty)");

    } catch (error) {
        console.error("Error:", error);
    }
}

test();
