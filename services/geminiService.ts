import { GoogleGenAI } from "@google/genai";
import { OutfitStyle } from "../types";

// Initialize the client with the API key from environment variables
// Note: In a real production app, this should be proxied through a backend to protect the key,
// but for this client-side demo we assume it's available via process.env.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash-image';

/**
 * Generates an outfit based on an uploaded clothing item image.
 */
export const generateOutfit = async (
  base64Image: string,
  style: OutfitStyle
): Promise<string> => {
  try {
    // Strip the data URL prefix if present (e.g., "data:image/jpeg;base64,")
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const prompt = `
      You are a digital fashion stylist.
      Generate a high-quality image of a realistic 3D human model wearing the clothing item shown in the input image.
      
      Requirements:
      1. The input clothing item MUST be worn by the model.
      2. The model should be styled in a complete ${style} outfit (including matching shoes, accessories, and bottoms/tops as needed).
      3. The aesthetic should be that of a high-end digital fashion editorial or realistic 3D character render.
      4. Ensure the model is posing naturally to showcase the outfit.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            text: prompt,
          },
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming JPEG for simplicity, or detect from source
              data: cleanBase64,
            },
          },
        ],
      },
    });

    // Extract the generated image
    // Note: The response structure for generated images in 2.5 Flash Image usually comes in the parts
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/jpeg;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image generated.");

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};

/**
 * Edits an existing outfit image based on user text instruction.
 */
export const editOutfit = async (
  currentImageBase64: string,
  instruction: string
): Promise<string> => {
  try {
    const cleanBase64 = currentImageBase64.split(',')[1] || currentImageBase64;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            text: `Edit this image of the fashion model: ${instruction}. Maintain the photorealistic 3D model style.`,
          },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64,
            },
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/jpeg;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No edited image generated.");
  } catch (error) {
    console.error("Gemini Edit Error:", error);
    throw error;
  }
};