import { GoogleGenAI, Type, Schema, Chat } from "@google/genai";
import { IshikawaCause, IshikawaSolution, LensScanResult, LPAScanResult } from "../types";

// Helper for safe Env access
const getApiKey = () => {
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.API_KEY) {
    return (import.meta as any).env.API_KEY;
  }
  return '';
};

// Schema for structured output
const solutionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    solutions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
          steps: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["title", "description", "priority", "steps"]
      }
    }
  },
  required: ["solutions"]
};

// Updated Lens Schema for AR Checklist Validation
const lensSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    overallCompliance: { type: Type.INTEGER, description: "0 to 100" },
    checklistResults: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          item: { type: Type.STRING },
          compliant: { type: Type.BOOLEAN },
          observation: { type: Type.STRING }
        },
        required: ["item", "compliant", "observation"]
      }
    },
    detectedHazards: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          action: { type: Type.STRING, enum: ["Sort", "Set in Order", "Shine", "Standardize", "Sustain"] },
          severity: { type: Type.STRING, enum: ["Low", "Medium", "High"] }
        },
        required: ["name", "action", "severity"]
      }
    }
  },
  required: ["overallCompliance", "checklistResults", "detectedHazards"]
};

const lpaSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    compliance: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
    observations: { 
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    safetyRisk: { type: Type.BOOLEAN },
    identifiedIssues: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    }
  },
  required: ["compliance", "observations", "safetyRisk", "identifiedIssues"]
};

// --- Ishikawa Generation ---
export const generateSolutions = async (
  problemTitle: string,
  problemDescription: string,
  causes: IshikawaCause[]
): Promise<IshikawaSolution[]> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("API Key not found, using mock response");
    return [
      {
        title: "Standardize Operator Training",
        description: "Develop a TWI (Training Within Industry) module.",
        priority: "High",
        steps: ["Create standard work sheet", "Train shift supervisors"]
      },
      {
        title: "Preventative Maintenance Schedule",
        description: "Update the PM schedule.",
        priority: "Medium",
        steps: ["Audit current PM logs", "Adjust frequency"]
      }
    ];
  }

  const ai = new GoogleGenAI({ apiKey });

  const causesText = causes.map(c => `- [${c.category}] ${c.text}`).join("\n");

  const prompt = `
    You are a Lean Manufacturing Expert.
    Problem: ${problemTitle}
    Context: ${problemDescription}
    Identified Root Causes:
    ${causesText}
    Generate 3 specific countermeasures.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: solutionSchema,
        temperature: 0.3, 
      },
    });

    const text = response.text;
    if (!text) return [];

    const result = JSON.parse(text);
    return result.solutions || [];

  } catch (error) {
    console.error("Error generating solutions:", error);
    throw new Error("Failed to generate solutions.");
  }
};

// --- Vision / Lens Analysis ---
export const analyze5SImage = async (base64Image: string, context?: string, checklist: string[] = []): Promise<LensScanResult> => {
  const apiKey = getApiKey();
  
  // Mock fallback if no API key
  if (!apiKey) {
    return new Promise(resolve => setTimeout(() => resolve({
      overallCompliance: 65,
      checklistResults: checklist.length > 0 ? checklist.map((item, i) => ({
          item,
          compliant: i % 2 === 0, // Mock alternating compliance
          observation: i % 2 === 0 ? "Looks good." : "Item appears disorganized or missing."
      })) : [],
      detectedHazards: [
          { name: "Unknown Object in Walkway", action: "Sort", severity: "Medium" }
      ],
      // Backward compat
      itemDetected: "Cluttered Area",
      observation: "General disarray observed.",
      suggested5SAction: "Sort",
      practicalAction: "Remove unnecessary items."
    }), 2000));
  }

  const ai = new GoogleGenAI({ apiKey });

  let promptText = `
    Role: Lean Manufacturing 5S Auditor.
    Task: Analyze this image for 5S compliance and safety hazards.
    Location Context: "${context || "General Workplace"}".
  `;

  if (checklist.length > 0) {
      promptText += `\nValidate against these specific standards:\n${checklist.map(c => `- ${c}`).join('\n')}`;
  } else {
      promptText += `\nIdentify any specific items or areas that violate 5S principles (clutter, dirt, unorganized tools, safety hazard).`;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image
            }
          },
          {
            text: promptText
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: lensSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from vision model");
    
    const result = JSON.parse(text);

    // Map new structure to old structure for backward compatibility if needed by components
    const primaryHazard = result.detectedHazards?.[0] || { name: "General Issue", action: "Sort", severity: "Low" };
    
    return {
        ...result,
        itemDetected: primaryHazard.name,
        suggested5SAction: primaryHazard.action,
        observation: result.checklistResults?.find((r: any) => !r.compliant)?.observation || "Issue detected via AR scan.",
        practicalAction: `Address: ${primaryHazard.name}`
    } as LensScanResult;

  } catch (error) {
    console.error("Vision Error:", error);
    // Graceful fallback
    return {
      overallCompliance: 0,
      checklistResults: [],
      detectedHazards: [{ name: "Scan Error", action: "Sustain", severity: "Low" }],
      itemDetected: "Error",
      observation: "Could not process image.",
      suggested5SAction: "Sustain",
      practicalAction: "Retry scan."
    };
  }
};

export const analyzeLPAImage = async (base64Image: string): Promise<LPAScanResult> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    return new Promise(resolve => setTimeout(() => resolve({
      compliance: "Medium",
      observations: ["PPE usage needs verification", "Walkways appear clear"],
      safetyRisk: false,
      identifiedIssues: ["Potential material crowding near station"]
    }), 2000));
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image
            }
          },
          {
            text: "Analyze this image for industrial safety and standard work compliance (Layered Process Audit). Look for PPE usage, trip hazards, proper material storage, and general cleanliness. Is the process being followed?"
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: lpaSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from vision model");
    
    return JSON.parse(text) as LPAScanResult;

  } catch (error) {
    console.error("LPA Vision Error:", error);
    return {
      compliance: "Low",
      observations: ["Analysis failed due to technical error"],
      safetyRisk: true,
      identifiedIssues: ["Error: Could not process image"]
    };
  }
};

// --- Lean Sensei Chat ---
let chatSession: Chat | null = null;

export const sendMessageToSensei = async (message: string, context?: string): Promise<string> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    return "I am running in demo mode. Please configure the API Key to chat with me about Lean methodologies! (Context: " + (context || "None") + ")";
  }

  const ai = new GoogleGenAI({ apiKey });

  if (!chatSession) {
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `
          You are 'Lean Sensei', a wise, professional, and encouraging mentor in a manufacturing environment.
          Your goal is to teach Lean principles (5S, Kaizen, Six Sigma, Ishikawa) by guiding the user, not just giving answers.
          
          Tone:
          - Professional but approachable.
          - Use Socratic questioning when appropriate (e.g., "Why do you think that waste exists?").
          - Be concise and actionable.
          - Use formatting (bolding, lists) to make text easy to read.

          Context Awareness:
          - You will receive the user's current activity/location in the message payload. Use this!
          - If the user is in an Audit, suggest what to look for based on the zone.
          - If the user is solving a problem, guide them through the 5 Whys.
        `
      }
    });
  }

  try {
    // Inject context into the message prompt if provided
    const contentToSend = context 
        ? `[SYSTEM CONTEXT: User is currently ${context}] \nUser Message: ${message}`
        : message;

    const result = await chatSession.sendMessage({ message: contentToSend });
    return result.text || "I'm thinking...";
  } catch (error) {
    console.error("Chat error:", error);
    return "I seem to be having trouble connecting to the factory network. Please try again.";
  }
};