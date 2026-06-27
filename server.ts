import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, Schema } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const MODEL_NAME = 'gemini-3.1-pro-preview'; // Using 3.1 pro as it handles complex JSON schemas better, and avoids 403.

// Reusable schema for ResumeData
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

  // Helper for error handling
  const handleError = (res: express.Response, error: any) => {
    console.error("API Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  };

  // API Routes
  app.post("/api/analyze-resume", async (req, res) => {
    try {
      const { base64Data, mimeType } = req.body;
      if (!base64Data) return res.status(400).json({ error: "Missing base64Data" });

      if (mimeType.includes('word') || mimeType.includes('document') || mimeType.includes('msword')) {
          return res.status(400).json({ error: "Word documents (.doc, .docx) are not currently supported. Please convert to PDF or TXT." });
      }

      const prompt = `
        You are an expert ATS (Applicant Tracking System) scanner and Resume Consultant.
        Analyze the provided resume document.
        
        Return a JSON response with:
        - score: A number between 0 and 100 representing the ATS compatibility score.
        - feedback: An array of strings containing constructive criticism and actionable advice.
        - missingKeywords: An array of strings representing important industry keywords that might be missing based on the resume's likely target role.
      `;

      const parts: any[] = [];
      if (mimeType.startsWith('text/')) {
          const textContent = Buffer.from(base64Data, 'base64').toString('utf8');
          parts.push({ text: textContent });
      } else {
          parts.push({
              inlineData: { mimeType, data: base64Data }
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
              feedback: { type: Type.ARRAY, items: { type: Type.STRING } },
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

      res.json({ result: JSON.parse(response.text || "{}") });
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/generate-resume", async (req, res) => {
    try {
      const { description, country } = req.body;
      const marketContext = country === 'India' 
        ? 'Target Market: India. Use Indian English. Use Indian currency (₹ / Lakhs / Crores). Locations: Major Indian tech hubs (Bangalore, Gurgaon, Hyderabad, Pune). Education: Top Indian Institutes (IITs, NITs, BITS) or reputable universities.' 
        : 'Target Market: Global/US. Use standard US English. Use USD ($). Locations: Major US tech hubs.';

      const prompt = `
        You are an elite Resume Architect.
        
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

      let data = JSON.parse(response.text || "{}");
      if (data.experience) {
          data.experience = data.experience.map((exp: any, i: number) => ({ ...exp, id: exp.id || `exp-${i}-${Date.now()}` }));
      }
      if (data.education) {
          data.education = data.education.map((edu: any, i: number) => ({ ...edu, id: edu.id || `edu-${i}-${Date.now()}` }));
      }

      res.json({ result: data });
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/extract-resume", async (req, res) => {
    try {
      const { base64Data, mimeType } = req.body;
      
      if (mimeType.includes('word') || mimeType.includes('document') || mimeType.includes('msword')) {
          return res.status(400).json({ error: "Word documents are not currently supported. Please convert to PDF or TXT." });
      }

      const prompt = `
          Extract all information from this resume and structure it into a JSON object matching the provided schema.
          If specific fields are missing (like ID), generate unique placeholders.
          Ensure the 'experience' and 'education' arrays are populated.
      `;

      const parts: any[] = [];
      if (mimeType.startsWith('text/')) {
          const textContent = Buffer.from(base64Data, 'base64').toString('utf8');
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

      res.json({ result: JSON.parse(response.text || "{}") });
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { message, context } = req.body;
      const systemInstruction = `You are Rezumate AI, a helpful career assistant. \n        ${context ? `User Context: ${JSON.stringify(context)}` : ''}\n        Keep answers concise and professional.`;

      const response = await ai.models.generateContent({
          model: MODEL_NAME,
          contents: message,
          config: {
              systemInstruction: systemInstruction
          }
      });

      res.json({ result: response.text || "I'm not sure how to respond to that." });
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/process-resume", async (req, res) => {
    try {
      const { currentData, instruction } = req.body;
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

      res.json({ result: JSON.parse(response.text || "{}") });
    } catch (error) {
      handleError(res, error);
    }
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
