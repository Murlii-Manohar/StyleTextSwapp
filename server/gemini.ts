import { GoogleGenAI } from "@google/genai";

type StyleTransferOptions = {
  originalText: string;
  fromStyle?: string;
  toStyle: string;
  preservationPercentage?: number;
};

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function transformTextStyle({
  originalText,
  fromStyle,
  toStyle,
  preservationPercentage = 50,
}: StyleTransferOptions): Promise<string> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error("Gemini API key is not configured.");
    }

    const preservationText = preservationPercentage === 50 
      ? "with a balanced mix of original and target styles" 
      : preservationPercentage < 50 
        ? `with a stronger emphasis on the ${toStyle} style (${100-preservationPercentage}% ${toStyle}, ${preservationPercentage}% original)`
        : `while preserving more of the original style (${preservationPercentage}% original, ${100-preservationPercentage}% ${toStyle})`;
      
    const prompt = fromStyle
      ? `Transform the following text from ${fromStyle} style to ${toStyle} style ${preservationText}. Keep the original meaning intact. Only respond with the transformed text, nothing else. The text is: "${originalText}"`
      : `Transform the following text to ${toStyle} style ${preservationText}. Keep the original meaning intact. Only respond with the transformed text, nothing else. The text is: "${originalText}"`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let transformedText = response.text || "";
    
    if (!transformedText) {
      throw new Error("Empty response from Gemini API");
    }

    transformedText = transformedText.trim();
    
    if (transformedText.startsWith('"') && transformedText.endsWith('"')) {
      transformedText = transformedText.substring(1, transformedText.length - 1);
    }
    
    return transformedText;
  } catch (error) {
    console.error("Error transforming text style with Gemini:", error);
    throw error;
  }
}

export async function validateApiKey(): Promise<boolean> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error("Gemini API key is not set");
      return false;
    }

    console.log("Testing Gemini API key:", apiKey.substring(0, 5) + "..." + apiKey.substring(apiKey.length - 3));
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hello, this is a test.",
    });

    if (!response.text) {
      console.error("Gemini API validation failed: Empty response");
      return false;
    }
    
    console.log("Gemini API key is valid. Using Gemini for style transformations.");
    return true;
  } catch (error) {
    console.error("Error validating Gemini API key:", error);
    return false;
  }
}
