import fetch from 'node-fetch';

type PerplexityMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type StyleTransferOptions = {
  originalText: string;
  fromStyle?: string;
  toStyle: string;
  preservationPercentage?: number; // 0-100 percentage of original style to preserve
};

/**
 * Transforms text from one style to another using Perplexity API
 */
export async function transformTextStyle({
  originalText,
  fromStyle,
  toStyle,
  preservationPercentage = 50, // Default to 50% preservation if not specified
}: StyleTransferOptions): Promise<string> {
  try {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    
    if (!apiKey) {
      throw new Error("Perplexity API key is not configured.");
    }

    // Include preservation percentage in the prompt
    const preservationText = preservationPercentage === 50 
      ? "with a balanced mix of original and target styles" 
      : preservationPercentage < 50 
        ? `with a stronger emphasis on the ${toStyle} style (${100-preservationPercentage}% ${toStyle}, ${preservationPercentage}% original)`
        : `while preserving more of the original style (${preservationPercentage}% original, ${100-preservationPercentage}% ${toStyle})`;
      
    const prompt = fromStyle
      ? `Transform the following text from ${fromStyle} style to ${toStyle} style ${preservationText}. Keep the original meaning intact. The text is: "${originalText}"`
      : `Transform the following text to ${toStyle} style ${preservationText}. Keep the original meaning intact. The text is: "${originalText}"`;

    const messages: PerplexityMessage[] = [
      {
        role: "system",
        content: "You are a professional text style transfer expert. Transform the text provided by the user to the requested style while preserving the original meaning. Only respond with the transformed text without any explanations or additional comments.",
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages,
        temperature: 0.2,
        max_tokens: 1000,
        top_p: 0.9,
        presence_penalty: 0,
        frequency_penalty: 1,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Perplexity API Error:", error);
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error transforming text style:", error);
    throw error;
  }
}

/**
 * Validates the Perplexity API key
 */
export async function validateApiKey(): Promise<boolean> {
  try {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    
    if (!apiKey) {
      console.error("Perplexity API key is not set");
      return false;
    }

    // Simple test query to check if the API key works
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "user",
            content: "Hello, this is a test message to validate the API key.",
          },
        ],
        max_tokens: 5,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Error validating Perplexity API key:", error);
    return false;
  }
}