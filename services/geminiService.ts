import { ResumeData, ATSAnalysis } from "../types";

export const analyzeResumeATS = async (base64Data: string, mimeType: string = 'application/pdf'): Promise<ATSAnalysis> => {
  const response = await fetch('/api/analyze-resume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64Data, mimeType })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to analyze resume");
  return data.result as ATSAnalysis;
};

export const generateResumeFromJobDescription = async (description: string, country: 'Global' | 'India' = 'Global'): Promise<ResumeData> => {
  const response = await fetch('/api/generate-resume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description, country })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to generate resume");
  return data.result as ResumeData;
};

export const extractResumeData = async (base64Data: string, mimeType: string = 'application/pdf'): Promise<ResumeData> => {
  const response = await fetch('/api/extract-resume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64Data, mimeType })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to extract resume data");
  return data.result as ResumeData;
};

export const chatWithAI = async (message: string, context?: ResumeData): Promise<string> => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, context })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to chat");
  return data.result as string;
};

export const processResumeRequest = async (currentData: ResumeData, instruction: string): Promise<{ message: string, updatedData: ResumeData | null, healthScore: number | null }> => {
  const response = await fetch('/api/process-resume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentData, instruction })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to process resume");
  return data.result as { message: string, updatedData: ResumeData | null, healthScore: number | null };
};
