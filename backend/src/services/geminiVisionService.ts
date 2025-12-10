import { randomUUID } from "crypto";

export type VisionContext = "PROBLEM_SOLVING" | "5S";

export interface VisionAnalysisResult {
  detectedProblems: Array<{
    type: string;
    severity: string;
    location?: string;
  }>;
  suggestedCauses: Array<{
    category: string;
    cause: string;
    confidence: number;
  }>;
  insights: string;
  recommendations: string[];
  referenceId: string;
}

export class GeminiVisionService {
  async analyzePhoto(
    base64Image: string,
    context: VisionContext,
    problemDescription?: string
  ): Promise<VisionAnalysisResult> {
    if (!base64Image) {
      throw new Error("Photo is required for analysis");
    }

    const referenceId = randomUUID();

    if (context === "5S") {
      return {
        detectedProblems: [
          { type: "Unsorted items", severity: "medium", location: "Workbench" },
          { type: "Labeling gaps", severity: "low", location: "Storage bins" },
        ],
        suggestedCauses: [
          { category: "SET IN ORDER", cause: "Tools not returned to home", confidence: 0.68 },
          { category: "SUSTAIN", cause: "Standards not reinforced", confidence: 0.54 },
        ],
        insights:
          "Surface-level 5S gaps detected. Cleaning and labeling improvements should reduce search time.",
        recommendations: [
          "Add clear labels for all storage bins",
          "Schedule quick shine at end of shift",
          "Reinforce daily audit checklist",
        ],
        referenceId,
      };
    }

    return {
      detectedProblems: [
        { type: "WIP build-up", severity: "high", location: "Station 3" },
        { type: "Operator waiting", severity: "medium", location: "Feeder lane" },
      ],
      suggestedCauses: [
        { category: "METHODS", cause: "Unbalanced schedule", confidence: 0.76 },
        { category: "MACHINES", cause: "Equipment cycle time variance", confidence: 0.41 },
        { category: "PEOPLE", cause: "Limited cross-training", confidence: 0.33 },
      ],
      insights:
        problemDescription?.slice(0, 160) ||
        "Potential overproduction and flow imbalance detected. Consider rebalancing takt time and introducing FIFO controls.",
      recommendations: [
        "Capture real-time photo evidence for the Ishikawa diagram",
        "Validate production schedule against demand",
        "Introduce buffer limits before Station 3",
      ],
      referenceId,
    };
  }
}

export const geminiVisionService = new GeminiVisionService();
