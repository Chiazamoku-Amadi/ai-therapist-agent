import { GoogleGenerativeAI } from "@google/generative-ai";
import { inngest } from "./client";
import { logger } from "../utils/logger";

// Initialize Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Responsible for handling and analysing incoming chat messages utilising the Gemini AI
export const processChatMessage = inngest.createFunction(
  { id: "process-chat-message" }, // Unique identifier for the function
  { event: "therapy/session.message" }, // Triggered when a new message is sent in a therapy session
  async ({ event, step }) => {
    try {
      // Extract relevant data from the event payload
      const {
        message,
        history,
        memory = {
          userProfile: {
            emotionalState: [],
            riskLevel: 0,
            preferences: {},
          },
          sessionContext: {
            conversationThemes: [],
            currentTechnique: null,
          },
        },
        goals = [],
        systemPrompt,
      } = event.data;

      // Log the received message and history length for debugging purposes
      logger.info("Processing chat message:", {
        message,
        historyLength: history?.length,
      });

      // Analyze Message Sub-step
      // Analyzes the message using Gemini AI
      const analysis = await step.run("analyze-message", async () => {
        try {
          const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
          });

          // Construct the prompt for Gemini AI
          const prompt = `Analyze this therapy message and provide insights. Return ONLY a valid JSON object with no markdown formatting or additional text.
          Message: ${message}
          Context: ${JSON.stringify({ memory, goals })}
          
          Required JSON structure:
          {
            "emotionalState": "string",
            "themes": ["string"],
            "riskLevel": number,
            "recommendedApproach": "string",
            "progressIndicators": ["string"]
          }`;

          // Call Gemini AI to generate the analysis
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text().trim(); // Extract the text response

          logger.info("Received analysis from Gemini:", { text }); // Log the raw response text

          const cleanText = text?.replace(/```json\n|\n```/g, "").trim(); // Clean the extracted text to remove any code block indicators or extra spaces
          const parsedAnalysis = JSON.parse(cleanText || "{}"); // Parse the cleaned text into a JSON object

          logger.info("Successfully parsed analysis:", parsedAnalysis); // Log the parsed JSON object
          return parsedAnalysis; // Return the parsed analysis
        } catch (error) {
          // Log any errors encountered during analysis
          logger.error("Error in message analysis:", { error, message });

          // Then, return a default neutral analysis object to ensure the workflow can continue
          return {
            emotionalState: "neutral",
            themes: [],
            riskLevel: 0,
            recommendedApproach: "supportive",
            progressIndicators: [],
          };
        }
      });

      // Update Memory Sub-step
      // Updates the session's memory based on the results of the analysis
      const updatedMemory = await step.run("update-memory", async () => {
        if (analysis.emotionalState) {
          memory.userProfile.emotionalState.push(analysis.emotionalState);
        }

        if (analysis.themes) {
          memory.sessionContext.conversationThemes.push(...analysis.themes);
        }

        if (analysis.riskLevel) {
          memory.userProfile.riskLevel = analysis.riskLevel;
        }

        return memory; // Return the updated memory object
      });

      // If high risk is detected, trigger a trigger risk alert sub-step
      if (analysis.riskLevel > 4) {
        await step.run("trigger-risk-alert", async () => {
          logger.warn("High risk level detected in chat message", {
            message,
            riskLevel: analysis.riskLevel,
          });
        });
      }

      // Generate Response Sub-step
      // Generates a therapeutic response using Gemini AI
      const response = await step.run("generate-response", async () => {
        try {
          const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

          // Construct the prompt for Gemini AI
          // This prompt incorporates the system's initial instructions followed by a request to generate a therapeutic response based on the user's message, the analysis results, the updated memory, and the user's therapy goals
          // The prompt also gives guidelines on how to structure the response
          const prompt = `${systemPrompt}
          
          Based on the following context, generate a therapeutic response:
          Message: ${message}
          Analysis: ${JSON.stringify(analysis)}
          Memory: ${JSON.stringify(memory)}
          Goals: ${JSON.stringify(goals)}
          
          Provide a response that:
          1. Addresses the immediate emotional needs
          2. Uses appropriate therapeutic techniques
          3. Shows empathy and understanding
          4. Maintains professional boundaries
          5. Considers safety and well-being`;

          // Call Gemini AI to generate the therapeutic response
          const result = await model.generateContent(prompt);
          const responseText = result.response.text().trim(); // Extract the text response

          logger.info("Generated response:", { responseText }); // Log the generated response text

          return responseText; // Return the generated response text
        } catch (error) {
          // Log any errors encountered during response generation
          logger.error("Error generating response:", { error, message });

          // Return a default supportive message to ensure the user receives some form of reply
          return "I'm here to support you. Could you tell me more about what's on your mind?";
        }
      });

      // Return the AI's generated response, the full analysis object, and the updated memory state
      return {
        response,
        analysis,
        updatedMemory,
      };
    } catch (error) {
      // Log any unexpected errors that occur during the overall process
      logger.error("Error in chat message processing:", {
        error,
        message: event.data.message,
      });

      // Return a complete default response containing a supportive message,a standard neutral analysis object, and the orignal memory state from the event data to ensure the system always provides a stable output
      return {
        response:
          "I'm here to support you. Could you tell me more about what's on your mind?",
        analysis: {
          emotionalState: "neutral",
          themes: [],
          riskLevel: 0,
          recommendedApproach: "supportive",
          progressIndicators: [],
        },
        updatedMemory: event.data.memory,
      };
    }
  }
);

// Designed to analyze the content of a therapy session
export const analyzeTherapySession = inngest.createFunction(
  { id: "analyze-therapy-session" }, // Unique identifier for the function
  { event: "therapy/session.created" }, // Triggered when a new therapy session is created
  async ({ event, step }) => {
    try {
      // Get Session Content Sub-step
      // Retrieves the session's content which comes from either therapy notes or a transcript found within the event data
      const sessionContent = await step.run("get-session-content", async () => {
        return event.data.notes || event.data.transcript;
      });

      // Analyze with Gemini AI Sub-step
      // Constructs a detailed prompt for Gemini AI
      const analysis = await step.run("analyze-with-gemini", async () => {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Construct the prompt for Gemini AI
        const prompt = `Analyze this therapy session and provide insights:
        Session Content: ${sessionContent}
        
        Please provide:
        1. Key themes and topics discussed
        2. Emotional state analysis
        3. Potential areas of concern
        4. Recommendations for follow-up
        5. Progress indicators
        
        Format the response as a JSON object.`;

        // Call Gemini AI to perform the analysis
        const result = await model.generateContent(prompt);

        // Extract and clean the text response from Gemini AI
        const response = await result.response;
        const text = response.text();

        // Parse and return the analysis as a JSON object
        return JSON.parse(text);
      });

      // Store Analysis Sub-step
      // Here, a message is logged confirming that the analysis has been stored successfully
      await step.run("store-analysis", async () => {
        logger.info("Session analysis stored successfully:");
        return analysis;
      });

      // If there are concerning indicators, trigger an alert
      if (analysis.areasOfConcern?.length > 0) {
        await step.run("trigger-concern-alert", async () => {
          logger.warn("Concerning indicators detected in session analysis", {
            sessionId: event.data.sessionId,
            concerns: analysis.areasOfConcern,
          });

          // Add logic here
        });
      }

      // Return the analysis results
      return {
        message: "Session analysis completed",
        analysis,
      };
    } catch (error) {
      // Log any errors encountered during the therapy session analysis process
      logger.error("Error in therapy session analysis:", error);
      throw error; // Re-throw the error to ensure it can be caught and managed by higher level error handlers in the application
    }
  }
);

// Function to generate personalized activity recommendations
export const generateActivityRecommendations = inngest.createFunction(
  { id: "generate-activity-recommendations" },
  { event: "mood/updated" },
  async ({ event, step }) => {
    try {
      // Get user's mood history and activity history
      const userContext = await step.run("get-user-context", async () => {
        // Here you would typically fetch user's history from your database
        return {
          recentMoods: event.data.recentMoods,
          completedActivities: event.data.completedActivities,
          preferences: event.data.preferences,
        };
      });

      // Generate recommendations using Gemini
      const recommendations = await step.run(
        "generate-recommendations",
        async () => {
          const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

          const prompt = `Based on the following user context, generate personalized activity recommendations:
        User Context: ${JSON.stringify(userContext)}
        
        Please provide:
        1. 3-5 personalized activity recommendations
        2. Reasoning for each recommendation
        3. Expected benefits
        4. Difficulty level
        5. Estimated duration
        
        Format the response as a JSON object.`;

          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text();

          return JSON.parse(text);
        }
      );

      // Store the recommendations
      await step.run("store-recommendations", async () => {
        // Here you would typically store the recommendations in your database
        logger.info("Activity recommendations stored successfully");
        return recommendations;
      });

      return {
        message: "Activity recommendations generated",
        recommendations,
      };
    } catch (error) {
      logger.error("Error generating activity recommendations:", error);
      throw error;
    }
  }
);

export const functions = [
  processChatMessage,
  analyzeTherapySession,
  generateActivityRecommendations,
];
