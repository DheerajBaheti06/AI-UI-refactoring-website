import { GoogleGenAI, Type } from "@google/genai";
import { Language } from "../types";

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. App will not function correctly.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const CODE_SYSTEM_INSTRUCTION = `You are a world-class senior frontend engineer. Your primary task is to rewrite user-provided component code based on their requests.

**1. First, analyze the user's code to identify the language.** It will be either React (TSX/JSX) or standard HTML with CSS.

**2. Based on the identified language, you MUST follow the specific rules for that language:**

---

### **If the language is React (TSX/JSX):**
- Rewrite the code using React, TypeScript, and Tailwind CSS.
- **CRITICAL RULE: The generated component MUST be completely self-contained.** It cannot accept or rely on any props being passed to it. If the component needs to be interactive, it must manage its own state internally (e.g., using \`React.useState\`).
- The user's code is being rendered in a sandbox where React and ReactDOM are already available globally. **DO NOT include 'import React from "react"'** or any other imports. The code must be a single, self-contained component.
- The root component of your refactored code **MUST** be a function declaration named \`RefactoredComponent\`.
- Example format: \`function RefactoredComponent() { /* your JSX here */ }\`
- **DO NOT use \`export default\`**. This is critical for the live preview to work.
- The returned language in the JSON must be "tsx".

---

### **If the language is HTML/CSS:**
- Rewrite the code as a single, self-contained HTML snippet.
- **You MUST use Tailwind CSS classes directly within the HTML for all styling.** Do not use inline \`<style>\` tags or separate CSS. The goal is a modern, utility-first HTML component.
- Ensure the HTML is semantically correct and accessible.
- The returned language in the JSON must be "html".

---

**3. General Rules:**
- If the user provides a target style, you **MUST** creatively and significantly overhaul the component's design to match that style. This is your top priority.
- If no style is provided, focus on improving layout, spacing, color contrast, and overall aesthetic according to modern UI/UX principles.
- Provide a brief explanation of the key improvements you made in markdown format.
- You **MUST** return a valid JSON object matching the provided schema.

**4. List Dependencies:**
- If your refactored code uses any third-party libraries that need to be installed (e.g., 'framer-motion', 'clsx', 'lucide-react'), you MUST list the installation commands in the 'dependencies' array.
- The format should be the full command, e.g., "npm install framer-motion".
- If the code uses only React and Tailwind CSS (which are assumed to be present), or standard HTML/CSS, the 'dependencies' array **MUST** be empty.`;

const improvementSchema = {
  type: Type.OBJECT,
  properties: {
    language: {
      type: Type.STRING,
      description: "The detected language of the provided code. Must be either 'tsx' or 'html'.",
    },
    improvedCode: {
      type: Type.STRING,
      description: "The complete, refactored code as a single string, following the language-specific rules.",
    },
    explanation: {
      type: Type.STRING,
      description: "A brief, user-friendly explanation of the UI/UX improvements made, in markdown format.",
    },
    dependencies: {
      type: Type.ARRAY,
      description: "A list of command-line instructions for installing any new npm packages required by the refactored code. E.g., ['npm install framer-motion']. If no new dependencies are needed, this should be an empty array.",
      items: { type: Type.STRING }
    }
  },
  required: ["language", "improvedCode", "explanation", "dependencies"],
};

export const getUIImprovementFromCode = async (
  userCode: string,
  refactorPrompt: string,
  stylePrompt: string,
): Promise<{ language: Language, improvedCode: string; explanation: string; dependencies: string[] }> => {
  try {
    const fullPrompt = `
      The user has provided a frontend component. Your task is to identify its language, refactor it based on their requests, and follow all rules in the system instruction.

      **User's Original Code:**
      \`\`\`
      ${userCode}
      \`\`\`

      ---

      **User's Refactor Request:** 
      "${refactorPrompt || 'No specific request provided. Focus on general UI/UX improvements.'}"

      **User's Target Style:**
      "${stylePrompt || 'No specific style provided. Use your best judgment for a modern, clean design.'}"

      ---

      Based on all of the above, please identify the language, rewrite the code, provide an explanation for your changes, and list any required dependencies.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        systemInstruction: CODE_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: improvementSchema,
        temperature: 0.7,
      },
    });

    const jsonStr = response.text.trim();
    if (jsonStr.startsWith('{') && jsonStr.endsWith('}')) {
        const result = JSON.parse(jsonStr);
        if (result.language !== 'tsx' && result.language !== 'html') {
          throw new Error("AI returned an invalid language type.");
        }
        return result;
    } else {
        console.error("Received non-JSON response:", jsonStr);
        throw new Error("Received an invalid response from the AI. It might have been too complex to process.");
    }
  } catch (error) {
    console.error("Error generating code improvement:", error);
    throw new Error("Failed to get UI improvement from code. The AI may have been unable to process the request.");
  }
};