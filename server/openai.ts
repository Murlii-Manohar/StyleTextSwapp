import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "placeholder-key"
});

type StyleTransferOptions = {
  originalText: string;
  fromStyle?: string;
  toStyle: string;
  preservationPercentage?: number; // 0-100 percentage of original style to preserve
};

export async function transformTextStyle({
  originalText,
  fromStyle = "default",
  toStyle,
  preservationPercentage = 50, // Default to 50% preservation if not specified
}: StyleTransferOptions): Promise<string> {
  try {
    // Determine preservation guidance based on the percentage
    const styleGuidance = preservationPercentage === 50
      ? "with a balanced mix of original and target styles"
      : preservationPercentage < 50
        ? `with a stronger emphasis on the ${toStyle} style (${100-preservationPercentage}% ${toStyle}, ${preservationPercentage}% original)`
        : `while preserving more of the original style (${preservationPercentage}% original, ${100-preservationPercentage}% ${toStyle})`;
        
    const prompt = `
      Transform the following text from ${fromStyle} style to ${toStyle} style ${styleGuidance}.
      Preserve the original meaning, but adjust the writing style according to the specified balance.
      Return only the transformed text without any explanations or additional content.
      
      Original Text: "${originalText}"
      
      Transformed Text (${toStyle} style, with ${preservationPercentage}% original style preservation):
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional text style transfer assistant that helps rewrite content in different styles while preserving the original meaning.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    if (!response.choices[0].message.content) {
      throw new Error("No content returned from OpenAI");
    }

    return response.choices[0].message.content.trim();
  } catch (error: any) {
    console.error("Error transforming text:", error);
    throw new Error(`Failed to transform text: ${error.message}`);
  }
}

// Function to validate if the API key is working
export async function validateApiKey(): Promise<boolean> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: "Hello, this is a test." }],
      max_tokens: 5,
    });
    
    return !!response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API key validation failed:", error);
    return false;
  }
}
