
import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage } from '../types';
import { config } from '../config';

declare var PptxGenJS: any;

let ai: GoogleGenAI;

const getAI = () => {
    if (!ai) {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set.");
        }
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
};

const mapMessagesToContent = (messages: ChatMessage[]): {role: string, parts: {text: string}[]}[] => {
    const validMessages = messages.filter(m => m.role === 'user' || m.role === 'model');
    // The Gemini API requires alternating user/model roles.
    // This ensures the history starts with a user message if possible.
    let firstUserIndex = validMessages.findIndex(m => m.role === 'user');
    if (firstUserIndex === -1) firstUserIndex = 0;
    
    return validMessages.slice(firstUserIndex).map(message => ({
        role: message.role,
        parts: [{ text: message.content }]
    }));
};

export async function* streamMultiModalResponse(
    newPrompt: string,
    history: ChatMessage[],
    image?: { base64: string; mimeType: string }
) {
    try {
        const aiInstance = getAI();
        const mappedHistory = mapMessagesToContent(history);

        const chat = aiInstance.chats.create({
            model: 'gemini-2.5-flash',
            history: mappedHistory,
            config: {
                systemInstruction: `You are ${config.APP_NAME}, a helpful and creative AI assistant. Your responses should be fluid, intelligent, and elegant.`,
            },
        });
        
        const parts: ({text: string} | {inlineData: {data: string, mimeType: string}})[] = [{text: newPrompt}];
        
        if (image && image.base64 && image.mimeType) {
            parts.push({
                inlineData: {
                    data: image.base64,
                    mimeType: image.mimeType
                }
            });
        }

        const response = await chat.sendMessageStream({ message: parts });

        for await (const chunk of response) {
            yield chunk.text;
        }

    } catch (error) {
        console.error("Error streaming response from Gemini:", error);
        yield "An error occurred while connecting to the AI. Please check your API key and try again.";
    }
}

export async function extractTextFromImage(base64: string, mimeType: string): Promise<string> {
    const aiInstance = getAI();
    const imagePart = {
        inlineData: {
            data: base64,
            mimeType: mimeType,
        },
    };
    const textPart = {
        text: "Extract text from this image.",
    };

    const response = await aiInstance.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: [imagePart, textPart] },
    });

    return response.text;
}

export async function executeCode(prompt: string): Promise<{ explanation: string; code: string }> {
    const aiInstance = getAI();
    const schema = {
      type: Type.OBJECT,
      properties: {
        explanation: {
          type: Type.STRING,
          description: 'An explanation of the created code, including what it does and how it works. Format this using Markdown.'
        },
        code: {
          type: Type.STRING,
          description: 'A single block of runnable HTML code, including any necessary CSS and JavaScript within the HTML file structure, based on the user\'s request.'
        }
      },
      required: ['explanation', 'code']
    };
    
    const response = await aiInstance.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: `Based on the following request, generate a single, runnable HTML file and a brief explanation of how it works. Request: "${prompt}"`,
        config: {
            responseMimeType: 'application/json',
            responseSchema: schema,
        },
    });

    const jsonText = response.text.trim();
    const cleanedJsonText = jsonText.startsWith('```json') ? jsonText.replace(/^```json\n|```$/g, '') : jsonText;
    
    try {
        return JSON.parse(cleanedJsonText);
    } catch (e) {
        console.error("Failed to parse JSON response for code execution:", cleanedJsonText, e);
        throw new Error("Sorry, I couldn't process the code correctly. The response was not valid JSON.");
    }
}

export async function generateImage(prompt: string): Promise<string> {
    const aiInstance = getAI();
    const response = await aiInstance.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '1:1',
        },
    });
    
    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    throw new Error("Image generation failed. No images were returned.");
}

export async function generatePresentation(prompt: string): Promise<{
    confirmationMessage: string;
    presentationData: { fileName: string; title: string; slides: {title: string, content: string[]}[] };
}> {
    const aiInstance = getAI();
    const schema = {
      type: Type.OBJECT,
      properties: {
        fileName: {
          type: Type.STRING,
          description: 'A short, file-friendly name for the presentation. E.g., "Renewable_Energy".'
        },
        title: {
          type: Type.STRING,
          description: 'The main title for the title slide of the presentation.'
        },
        slides: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: 'The title for a single slide.'
              },
              content: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
                description: 'An array of bullet points for the slide\'s main content. Each string is a new bullet point.'
              }
            },
            required: ['title', 'content']
          },
          description: 'An array of slide objects that make up the presentation.'
        }
      },
      required: ['fileName', 'title', 'slides']
    };
    
    const response = await aiInstance.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: `Create a presentation based on this topic: "${prompt}". Generate a title, and at least 5 content slides with titles and bullet points.`,
        config: {
            responseMimeType: 'application/json',
            responseSchema: schema,
        },
    });

    const jsonText = response.text.trim();
    const cleanedJsonText = jsonText.startsWith('```json') ? jsonText.replace(/^```json\n|```$/g, '') : jsonText;
    
    try {
        const presentationData = JSON.parse(cleanedJsonText);
        
        const pptx = new PptxGenJS();
        pptx.layout = 'LAYOUT_WIDE';

        pptx.addSlide().addText(presentationData.title, { x: 1, y: 2.5, w: 8, h: 1, fontSize: 36, bold: true, align: 'center' });

        presentationData.slides.forEach((slideData: { title: string; content: string[] }) => {
            const slide = pptx.addSlide();
            slide.addText(slideData.title, { x: 0.5, y: 0.25, w: '90%', h: 0.75, fontSize: 24, bold: true, color: '363636' });
            slide.addText(slideData.content.join('\n'), { 
                x: 0.5, y: 1.2, w: '90%', h: '75%', 
                fontSize: 18, 
                color: '363636',
                bullet: { type: 'bullet' },
                lineSpacing: 36
            });
        });

        const fileName = `${presentationData.fileName || 'presentation'}.pptx`;
        pptx.writeFile({ fileName });
        
        return {
            confirmationMessage: `I've created and downloaded the presentation "${fileName}". It has a title slide and ${presentationData.slides.length} content slides.`,
            presentationData: presentationData,
        };
    } catch (e) {
        console.error("Failed to parse JSON or create PPTX:", cleanedJsonText, e);
        throw new Error("Sorry, I encountered an error while creating the presentation. The generated data might have been invalid.");
    }
}