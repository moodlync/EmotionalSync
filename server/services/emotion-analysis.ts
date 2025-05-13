/**
 * Emotion Analysis Service
 * 
 * This service provides emotion analysis functionality with graceful fallback
 * when the Perplexity API is not available.
 */

// Emotion analysis result type
export interface EmotionAnalysisResult {
  primaryEmotion: string;
  intensity: number;
  secondaryEmotion: string | null;
  actionableInsight: string;
  usingFallback?: boolean;
}

// Simple fallback emotion analysis implementation
export async function performFallbackAnalysis(text: string): Promise<EmotionAnalysisResult> {
  // Create a simple deterministic analysis based on the text content
  const textLower = text.toLowerCase();
  let primaryEmotion = "Neutral";
  let intensity = 5;
  
  // Very simple keyword-based analysis
  if (textLower.includes('happy') || textLower.includes('joy') || textLower.includes('excited')) {
    primaryEmotion = "Joy";
    intensity = 7;
  } else if (textLower.includes('sad') || textLower.includes('upset') || textLower.includes('depressed')) {
    primaryEmotion = "Sadness";
    intensity = 6;
  } else if (textLower.includes('angry') || textLower.includes('mad') || textLower.includes('frustrat')) {
    primaryEmotion = "Anger";
    intensity = 7;
  } else if (textLower.includes('anxious') || textLower.includes('worry') || textLower.includes('nervous')) {
    primaryEmotion = "Anxiety";
    intensity = 6;
  }
  
  return {
    primaryEmotion,
    intensity,
    secondaryEmotion: null,
    actionableInsight: "This is fallback analysis as the emotion analysis API is not currently available. For full analysis capabilities, please configure the Perplexity API.",
    usingFallback: true
  };
}

// Main analysis function that gracefully falls back
export async function analyzeEmotion(text: string): Promise<EmotionAnalysisResult> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    console.log("PERPLEXITY_API_KEY not configured, using fallback emotion analysis");
    return performFallbackAnalysis(text);
  }
  
  // Perplexity API functionality removed
  console.log("Using fallback emotion analysis (Perplexity API removed)");
  return performFallbackAnalysis(text);
}

// Utility function to check if the emotion analysis service is available
export async function checkEmotionAnalysisService(): Promise<{
  available: boolean;
  usingFallback: boolean;
  message: string;
}> {
  return {
    available: true,
    usingFallback: true,
    message: "Emotion analysis is available using fallback implementation (Perplexity integration removed)"
  };
}