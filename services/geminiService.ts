import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ResumeData, ATSAnalysis } from "../types";

// Initialize strictly following guidelines with named parameter and direct env var
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using the fast model as requested for better responsiveness
const MODEL_NAME = 'gemini-3-flash-preview';

// Reusable schema for ResumeData to avoid duplication
const resumeDataSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    fullName: { type: Type.STRING },
    contactInfo: { type: Type.STRING },
    summary: { type: Type.STRING },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          school: { type: Type.STRING },
          degree: { type: Type.STRING },
          location: { type: Type.STRING },
          year: { type: Type.STRING },
          details: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    },
    experience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          company: { type: Type.STRING },
          role: { type: Type.STRING },
          location: { type: Type.STRING },
          duration: { type: Type.STRING },
          points: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    },
    skills: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          items: { type: Type.STRING }
        }
      }
    },
    additionalInfo: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        points: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    }
  },
  required: ["fullName", "summary", "experience", "education", "skills"]
};

const handleGeminiError = (error: any) => {
    console.error("Gemini API Error:", error);
    const msg = error.message || '';
    if (msg.includes('Rpc failed') || msg.includes('xhr error') || msg.includes('500')) {
        throw new Error("Connection failed. This may be due to network restrictions, ad-blockers, or the file size/type being too large.");
    }
    throw error;
};

export const analyzeResumeATS = async (base64Data: string, mimeType: string = 'application/pdf'): Promise<ATSAnalysis> => {
  // Guard against unsupported formats that cause RPC errors
  if (mimeType.includes('word') || mimeType.includes('document') || mimeType.includes('msword')) {
      throw new Error("Word documents (.doc, .docx) are not currently supported for AI analysis. Please convert your resume to PDF or TXT.");
  }

  try {
    const prompt = `
      You are an expert ATS (Applicant Tracking System) scanner and Resume Consultant.
      Analyze the provided resume document.
      
      Return a JSON response with:
      - score: A number between 0 and 100 representing the ATS compatibility score.
      - feedback: An array of strings containing constructive criticism and actionable advice.
      - missingKeywords: An array of strings representing important industry keywords that might be missing based on the resume's likely target role.
    `;

    const parts: any[] = [];
    
    // Handle text files as simple text parts, others as inlineData
    if (mimeType.startsWith('text/')) {
        try {
            const textContent = atob(base64Data);
            parts.push({ text: textContent });
        } catch (e) {
            console.error("Failed to decode text file", e);
            throw new Error("Could not read text file content.");
        }
    } else {
        parts.push({
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
        });
    }
    
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            feedback: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            missingKeywords: {
              type: Type.ARRAY,
              items: { 
                  type: Type.OBJECT,
                  properties: {
                      keyword: { type: Type.STRING },
                      suggestion: { type: Type.STRING }
                  }
               }
            }
          },
          required: ["score", "feedback", "missingKeywords"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as ATSAnalysis;

  } catch (error) {
    handleGeminiError(error);
    throw error;
  }
};

export const generateResumeFromJobDescription = async (description: string, country: 'Global' | 'India' = 'Global'): Promise<ResumeData> => {
  try {
    const marketContext = country === 'India' 
      ? 'Target Market: India. Use Indian English. Use Indian currency (₹ / Lakhs / Crores). Locations: Major Indian tech hubs (Bangalore, Gurgaon, Hyderabad, Pune). Education: Top Indian Institutes (IITs, NITs, BITS) or reputable universities.' 
      : 'Target Market: Global/US. Use standard US English. Use USD ($). Locations: Major US tech hubs.';

    const prompt = `
      You are an elite Resume Architect using the Google Gemini 3 model.
      
      USER INPUT: "${description}"
      
      TASK:
      Create a world-class, ATS-Optimized Resume based on the input above.
      
      SCENARIO 1: If the input is a Job Description, tailor the resume to perfectly match the JD keywords and requirements.
      SCENARIO 2: If the input is just a Profession/Role (e.g., "Data Scientist", "Marketing Manager"), create a top-tier "Ideal Candidate" profile for that role with 5+ years of experience.
      
      ${marketContext}
      
      STRICT CONTENT RULES:
      1. **Professional Summary**: 3-4 powerful sentences. Hook the reader immediately. Use metrics.
      2. **Experience**: 
         - Create 2-3 realistic roles. 
         - Companies should be plausible for the region.
         - Bullet points MUST utilize the STAR method (Situation, Task, Action, Result).
         - EVERY bullet point must have a number, %, or currency value to demonstrate impact.
      3. **Skills**: Group into "Technical", "Soft Skills", and "Tools". Ensure high keyword density for ATS.
      4. **Education**: Relevant degree from a reputable university.
      
      OUTPUT FORMAT:
      Return strictly JSON matching the schema.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: resumeDataSchema
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    // Parse and ensure unique IDs
    const data = JSON.parse(text) as ResumeData;
    
    // Post-processing to ensure IDs exist if AI missed them
    if (data.experience) {
        data.experience = data.experience.map((exp, i) => ({ ...exp, id: exp.id || `exp-${i}-${Date.now()}` }));
    }
    if (data.education) {
        data.education = data.education.map((edu, i) => ({ ...edu, id: edu.id || `edu-${i}-${Date.now()}` }));
    }

    return data;

  } catch (error) {
    handleGeminiError(error);
    throw error;
  }
};

export const extractResumeData = async (base64Data: string, mimeType: string = 'application/pdf'): Promise<ResumeData> => {
    // Guard against unsupported formats
    if (mimeType.includes('word') || mimeType.includes('document') || mimeType.includes('msword')) {
        throw new Error("Word documents are not currently supported for extraction. Please convert to PDF or TXT.");
    }

    try {
        const prompt = `
            Extract all information from this resume and structure it into a JSON object matching the provided schema.
            If specific fields are missing (like ID), generate unique placeholders.
            Ensure the 'experience' and 'education' arrays are populated.
        `;

        const parts: any[] = [];
        if (mimeType.startsWith('text/')) {
            const textContent = atob(base64Data);
            parts.push({ text: textContent });
        } else {
             parts.push({ inlineData: { mimeType, data: base64Data } });
        }
        parts.push({ text: prompt });

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: { parts },
            config: {
                responseMimeType: "application/json",
                responseSchema: resumeDataSchema
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response from AI extraction");
        return JSON.parse(text) as ResumeData;
    } catch (error) {
        handleGeminiError(error);
        throw error;
    }
};

export const chatWithAI = async (message: string, context?: ResumeData): Promise<string> => {
    try {
        const systemInstruction = `You are Rezumate AI, a helpful career assistant. 
        ${context ? `User Context: ${JSON.stringify(context)}` : ''}
        Keep answers concise and professional.`;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: message,
            config: {
                systemInstruction: systemInstruction
            }
        });

        return response.text || "I'm not sure how to respond to that.";
    } catch (error) {
        console.error("Chat Error:", error);
        return "I encountered a connection error. Please try again.";
    }
};

export const processResumeRequest = async (currentData: ResumeData, instruction: string): Promise<{ message: string, updatedData: ResumeData | null, healthScore: number | null }> => {
  try {
     const prompt = `
          ACT AS: High-Speed, Precision Resume Editor AI.
          CONTEXT: The user is editing a resume in real-time.
          
          CURRENT DATA: ${JSON.stringify(currentData)}
          REQUEST: "${instruction}"
          
          INSTRUCTIONS:
          1. **Immediate Execution**: Perform the requested edit instantly.
          2. **High Precision**: If the user says "fix grammar", only fix grammar. If they say "rewrite", rewrite completely with better impact.
          3. **Growth Hacking**: When rewriting summaries or experience, ALWAYS inject numbers, percentages, or metrics (e.g. "Improved X by Y%").
          4. **Completeness**: You MUST return the FULL updated \`ResumeData\` object in the \`updatedData\` field.
          
          RETURN ONLY JSON.
        `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING },
            healthScore: { type: Type.INTEGER, nullable: true },
            updatedData: { ...resumeDataSchema, nullable: true } as any
          },
          required: ["message"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);

  } catch (error) {
    handleGeminiError(error);
    throw error;
  }
}