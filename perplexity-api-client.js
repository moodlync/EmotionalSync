// Perplexity AI API Client for MoodLync
// This file implements a client for the Perplexity AI API

import fetch from 'node-fetch';

/**
 * Make a request to the Perplexity AI chat completions API
 * @param {string} apiKey - The Perplexity API key
 * @param {Object} options - Configuration options
 * @param {Array<Object>} options.messages - The messages to send to the API
 * @param {string} [options.model="llama-3.1-sonar-small-128k-online"] - The model to use
 * @param {number} [options.temperature=0.2] - The temperature parameter
 * @param {boolean} [options.stream=false] - Whether to stream the response
 * @returns {Promise<Object>} - The API response
 */
export async function getPerplexityCompletion(apiKey, options = {}) {
  if (!apiKey) {
    throw new Error('Perplexity API key is required');
  }

  const {
    messages,
    model = "llama-3.1-sonar-small-128k-online",
    temperature = 0.2,
    stream = false,
  } = options;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw new Error('Messages array is required and must not be empty');
  }

  // Validate that messages alternate correctly
  let lastRole = null;
  let hasSystem = false;
  
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    
    if (!msg.role || !msg.content) {
      throw new Error(`Message at index ${i} must have 'role' and 'content' properties`);
    }
    
    if (msg.role === 'system') {
      if (i !== 0) {
        throw new Error('System message must be the first message if present');
      }
      hasSystem = true;
    } else if (msg.role === 'user' || msg.role === 'assistant') {
      if (lastRole === msg.role && lastRole !== null) {
        throw new Error(`Messages must alternate between 'user' and 'assistant'. Found consecutive '${msg.role}' messages`);
      }
      lastRole = msg.role;
    } else {
      throw new Error(`Invalid role '${msg.role}' at index ${i}. Must be 'system', 'user', or 'assistant'`);
    }
  }
  
  // Last message must be from user
  if (lastRole !== 'user') {
    throw new Error('The last message must be from the user');
  }

  const requestBody = {
    model,
    messages,
    temperature,
    stream,
    max_tokens: options.max_tokens,
    top_p: options.top_p || 0.9,
    search_domain_filter: options.search_domain_filter,
    return_images: options.return_images || false,
    return_related_questions: options.return_related_questions || false,
    search_recency_filter: options.search_recency_filter || "month",
    top_k: options.top_k || 0,
    presence_penalty: options.presence_penalty || 0,
    frequency_penalty: options.frequency_penalty || 1
  };

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API error (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Failed to call Perplexity API: ${error.message}`);
  }
}

/**
 * Example usage of the Perplexity API client
 */
export async function analyzeEmotionWithPerplexity(apiKey, text) {
  try {
    const response = await getPerplexityCompletion(apiKey, {
      messages: [
        {
          role: "system",
          content: "You are an emotion analysis expert. Analyze the emotional content of the text and provide a JSON response with these fields: primaryEmotion (string), intensity (1-10), secondaryEmotion (string or null), actionableInsight (string)."
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.2
    });

    // Extract the content from the response
    const content = response.choices[0].message.content;
    
    // Try to parse as JSON
    try {
      return JSON.parse(content);
    } catch (e) {
      console.warn("Could not parse response as JSON, returning raw text");
      return { rawResponse: content };
    }
  } catch (error) {
    console.error("Error analyzing emotion:", error);
    return { error: error.message };
  }
}

// Example usage in a MoodLync context (commented out)
/*
import { analyzeEmotionWithPerplexity } from './perplexity-api-client.js';

// Inside your route handler or service function
const journalEntry = req.body.journalText;
const apiKey = process.env.PERPLEXITY_API_KEY;

const analysis = await analyzeEmotionWithPerplexity(apiKey, journalEntry);

res.json({
  journalId: savedJournal.id,
  emotionAnalysis: analysis
});
*/