/**
 * Example usage of the Thred SDK
 *
 * This file demonstrates various ways to use the SDK.
 * To run these examples, set your API key in the environment:
 * export THRED_API_KEY="your-api-key"
 */

import { ThredClient, type AnswerResponse } from "./index";

// Initialize the client
const client = new ThredClient({
  apiKey: process.env.THRED_API_KEY || "your-api-key-here",
});

/**
 * Example 1: Basic non-streaming response
 */
async function basicExample() {
  console.log("=== Basic Example ===\n");

  try {
    const response: AnswerResponse = await client.answer({
      message: "What's the best way to organize my tasks?",
    });

    console.log("Response:", response.response);

    if (response.metadata.brandUsed) {
      console.log("\nBrand Information:");
      console.log("  Name:", response.metadata.brandUsed.name);
      console.log("  Domain:", response.metadata.brandUsed.domain);
      console.log("  Link:", response.metadata.link);
      console.log("  Similarity Score:", response.metadata.similarityScore);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

/**
 * Example 2: Streaming response with callback
 */
async function streamingExample() {
  console.log("\n\n=== Streaming Example ===\n");

  try {
    const metadata = await client.answerStream(
      {
        message: "How can I improve my productivity?",
        model: "gpt-4",
        instructions: "Be concise and practical",
      },
      (accumulatedText) => {
        // This receives the full accumulated text so far, not individual chunks
        // You can update your UI with the complete text each time
        console.clear();
        console.log("Streaming Response:\n");
        console.log(accumulatedText);
      }
    );

    if (metadata?.metadata.brandUsed) {
      console.log("\n\nBrand:", metadata.metadata.brandUsed.name);
      console.log("Link:", metadata.metadata.link);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

/**
 * Example 3: Streaming with async generator
 */
async function generatorExample() {
  console.log("\n\n=== Generator Example ===\n");

  try {
    for await (const result of client.answerStreamGenerator({
      message: "What are the best productivity apps?",
      model: "gpt-4-turbo",
    })) {
      if (typeof result === "string") {
        // Accumulated text - clear and redisplay
        console.clear();
        console.log("Streaming Response:\n");
        console.log(result);
      } else {
        // Metadata
        console.log("\n\n--- Metadata ---");
        if (result.metadata.metadata.brandUsed) {
          console.log("Brand:", result.metadata.metadata.brandUsed.name);
          console.log("Domain:", result.metadata.metadata.brandUsed.domain);
          console.log("Similarity:", result.metadata.metadata.similarityScore);
        }
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

/**
 * Example 4: Conversation context
 */
async function conversationExample() {
  console.log("\n\n=== Conversation Context Example ===\n");

  const conversationId = `conv_${Date.now()}`;

  try {
    // First message
    console.log("User: What's a good task management tool?\n");
    const response1 = await client.answer({
      message: "What's a good task management tool?",
      conversationId,
    });
    console.log("AI:", response1.response);

    // Follow-up message
    console.log("\n\nUser: Does it have a mobile app?\n");
    const response2 = await client.answer({
      message: "Does it have a mobile app?",
      conversationId,
    });
    console.log("AI:", response2.response);
  } catch (error) {
    console.error("Error:", error);
  }
}

/**
 * Example 5: Error handling
 */
async function errorHandlingExample() {
  console.log("\n\n=== Error Handling Example ===\n");

  try {
    // This will fail with a validation error (empty message)
    await client.answer({
      message: "",
    });
  } catch (error) {
    if (error instanceof Error) {
      console.log("Caught error:", error.name);
      console.log("Message:", error.message);
    }
  }
}

/**
 * Example 6: Using different models
 */
async function modelSelectionExample() {
  console.log("\n\n=== Model Selection Example ===\n");

  try {
    // GPT-4 Turbo for faster responses
    console.log("Using GPT-4 Turbo:");
    const response1 = await client.answer({
      message: "Quick question about productivity",
      model: "gpt-4-turbo",
    });
    console.log(response1.response);

    // GPT-3.5 Turbo for cost-effective responses
    console.log("\n\nUsing GPT-3.5 Turbo:");
    const response2 = await client.answer({
      message: "Simple task organization tips",
      model: "gpt-3.5-turbo",
    });
    console.log(response2.response);
  } catch (error) {
    console.error("Error:", error);
  }
}

/**
 * Example 7: Custom parameters
 */
async function customParametersExample() {
  console.log("\n\n=== Custom Parameters Example ===\n");

  try {
    const response = await client.answer({
      message: "Tell me about time management",
      model: "gpt-4",
      maxTokens: 200,
      temperature: 0.5,
      instructions: "Keep the response under 3 sentences",
    });

    console.log("Response:", response.response);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Run all examples
//@ts-ignore
async function runAllExamples() {
  await basicExample();
  await streamingExample();
  await generatorExample();
  await conversationExample();
  await errorHandlingExample();
  await modelSelectionExample();
  await customParametersExample();
}

// Uncomment to run all examples
// runAllExamples();

// Or run individual examples:
// basicExample();
// streamingExample();
// generatorExample();
// conversationExample();
// errorHandlingExample();
// modelSelectionExample();
// customParametersExample();
