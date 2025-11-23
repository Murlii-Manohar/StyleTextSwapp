import fetch from 'node-fetch';

type StyleTransferOptions = {
  originalText: string;
  fromStyle?: string;
  toStyle: string;
  preservationPercentage?: number; // 0-100 percentage of original style to preserve
};

/**
 * Transforms text from one style to another using Hugging Face API
 */
export async function transformTextStyle({
  originalText,
  fromStyle,
  toStyle,
  preservationPercentage = 50, // Default to 50% preservation if not specified
}: StyleTransferOptions): Promise<string> {
  try {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    
    if (!apiKey) {
      throw new Error("Hugging Face API key is not configured.");
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

    // Using Hugging Face's Inference API with a suitable model like Mixtral or Mistral
    const response = await fetch('https://router.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.95,
          do_sample: true
        }
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Hugging Face API Error:", error);
      throw new Error(`Hugging Face API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    
    // The response format varies by model, but typically it's in the generated_text field
    // or is the entire response for instruction models
    const generatedText = data[0]?.generated_text || data.generated_text || data;
    
    // Extract the transformed text, removing any potential artifacts or instructions
    let transformedText = generatedText;
    
    // If the response includes the prompt, remove it to get just the generated part
    if (typeof transformedText === 'string' && transformedText.includes(prompt)) {
      transformedText = transformedText.substring(transformedText.indexOf(prompt) + prompt.length).trim();
    }
    
    // Remove any common AI-generated prefixes like "Here's the text transformed..."
    const commonPrefixes = [
      "Here's the text transformed",
      "Here is the text transformed",
      "The transformed text is",
      "Here's the transformed text",
      "Here is the transformed text"
    ];
    
    for (const prefix of commonPrefixes) {
      if (transformedText.includes(prefix)) {
        const startIndex = transformedText.indexOf(prefix);
        const endIndex = transformedText.indexOf(":", startIndex) + 1;
        if (endIndex > startIndex) {
          transformedText = transformedText.substring(endIndex).trim();
        }
      }
    }
    
    // Remove quotes if they're enclosing the entire text
    if (transformedText.startsWith('"') && transformedText.endsWith('"')) {
      transformedText = transformedText.substring(1, transformedText.length - 1);
    }
    
    return transformedText;
  } catch (error) {
    console.error("Error transforming text style:", error);
    throw error;
  }
}

/**
 * Validates the Hugging Face API key
 */
export async function validateApiKey(): Promise<boolean> {
  try {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    
    if (!apiKey) {
      console.error("Hugging Face API key is not set");
      return false;
    }

    console.log("Testing Hugging Face API key:", apiKey.substring(0, 5) + "..." + apiKey.substring(apiKey.length - 3));
    
    // Try with the same model we use for transformations
    const response = await fetch('https://router.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: "Hello",
        parameters: {
          max_new_tokens: 5
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Hugging Face API response:", response.status, response.statusText);
      console.error("Error details:", errorText);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error validating Hugging Face API key:", error);
    return false;
  }
}