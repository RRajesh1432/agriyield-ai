import { GoogleGenAI, Type } from "@google/genai";
import type { PredictionFormData, PredictionResult, CropInfo, HistoricalWeatherData, Farmer, Land } from '../types';

if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const predictionSchema = {
    type: Type.OBJECT,
    properties: {
        predictedYield: { type: Type.NUMBER, description: "Predicted yield in tons per hectare." },
        yieldUnit: { type: Type.STRING, description: "The unit for the predicted yield, e.g., 'tons/hectare'." },
        confidenceScore: { type: Type.NUMBER, description: "A score from 0.0 to 1.0 indicating model confidence." },
        summary: { type: Type.STRING, description: "A brief summary of the prediction and key factors." },
        weatherImpactAnalysis: { type: Type.STRING, description: "Analysis of how weather conditions impact the yield." },
        recommendations: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "Title of the recommendation." },
                    description: { type: Type.STRING, description: "Detailed description of the recommendation." },
                    impact: { type: Type.STRING, description: "Potential impact (High, Medium, Low)." },
                    potentialYieldIncrease: { type: Type.NUMBER, description: "Estimated percentage increase in yield if recommendation is followed." }
                },
                required: ["title", "description", "impact"]
            }
        },
        riskFactors: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING,
                description: "A potential risk factor, e.g., 'late monsoon'."
            }
        }
    },
    required: ["predictedYield", "yieldUnit", "confidenceScore", "summary", "weatherImpactAnalysis", "recommendations", "riskFactors"]
};

const cropInfoSchema = {
    type: Type.OBJECT,
    properties: {
        cropName: { type: Type.STRING },
        description: { type: Type.STRING },
        idealConditions: {
            type: Type.OBJECT,
            properties: {
                soilType: { type: Type.ARRAY, items: { type: Type.STRING } },
                temperatureRange: { type: Type.STRING },
                annualRainfall: { type: Type.STRING }
            },
            required: ["soilType", "temperatureRange", "annualRainfall"]
        },
        commonPests: { type: Type.ARRAY, items: { type: Type.STRING } },
        growingCycle: { type: Type.STRING }
    },
    required: ["cropName", "description", "idealConditions", "commonPests", "growingCycle"]
};

const weatherDataPointSchema = {
    type: Type.OBJECT,
    properties: {
        month: { type: Type.STRING, description: "The month, abbreviated (e.g., 'Jan', 'Feb')." },
        value: { type: Type.NUMBER, description: "The numerical value for that month." }
    },
    required: ["month", "value"]
};

const historicalWeatherSchema = {
    type: Type.OBJECT,
    properties: {
        monthlyTemperature: {
            type: Type.ARRAY,
            description: "Average temperature in Celsius for each of the last 12 months.",
            items: weatherDataPointSchema
        },
        monthlyRainfall: {
            type: Type.ARRAY,
            description: "Total rainfall in millimeters for each of the last 12 months.",
            items: weatherDataPointSchema
        }
    },
    required: ["monthlyTemperature", "monthlyRainfall"]
};


const generatePrompt = (data: PredictionFormData, farmers: Farmer[], lands: Land[]): string => {
    const farmerName = data.farmerId ? farmers.find(f => f.id === data.farmerId)?.name : undefined;
    
    let landIdentifier = 'Not specified';
    if(data.farmerId && data.landId) {
        const farmerLands = lands.filter(l => l.farmerId === data.farmerId);
        const landIndex = farmerLands.findIndex(l => l.id === data.landId);
        if(landIndex !== -1) {
            landIdentifier = `Land ${landIndex + 1}`;
        }
    }

    let farmContext = '';
    if (farmerName) {
        farmContext = `
      Farm Context:
      - Farmer: ${farmerName}
      - Land Plot: ${landIdentifier}`;
    }

    return `
      Analyze the following agricultural data to predict crop yield and provide recommendations.
      The output must be a JSON object matching the provided schema.
      The recommendations should be tailored to the provided 'Task Description'.
      ${farmContext}

      Farm Data:
      - Crop Type: ${data.cropType}
      - Field Shape (GeoJSON): ${data.fieldShape || 'Not provided'}
      - Soil Type: ${data.soilType}
      - Annual Rainfall (mm): ${data.rainfall}
      - Average Temperature (°C): ${data.temperature}
      - Pesticide Usage: ${data.pesticideUsage ? 'Yes' : 'No'}
      - Fertilizer Type: ${data.fertilizerType}
      - Area (hectares): ${data.area}
      - Task Description: ${data.taskDescription || 'Not provided'}

      Based on this data, provide a detailed analysis including predicted yield, risk factors, and actionable recommendations.
      The confidence score should reflect the quality and completeness of the input data.
      For example, for Wheat in Loamy soil with 450mm rainfall and 22°C, you might predict around 2.8 tons/hectare.
    `;
};

export const predictYield = async (formData: PredictionFormData, farmers: Farmer[], lands: Land[]): Promise<PredictionResult> => {
    try {
        if (!formData.fieldShape || formData.area <= 0) {
            throw new Error("Please draw the field shape on the map or select a saved land before getting a prediction.");
        }
        const prompt = generatePrompt(formData, farmers, lands);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: predictionSchema,
            },
        });

        const jsonString = response.text.trim();
        const parsedResult = JSON.parse(jsonString);
        
        if (!parsedResult.predictedYield || !parsedResult.summary) {
            throw new Error("Invalid JSON schema received from API.");
        }

        return parsedResult as PredictionResult;

    } catch (error) {
        console.error("Error calling Gemini API for yield prediction:", error);
        if (error instanceof Error && (error.message.includes("Please draw the field shape") || error.message.includes("select a saved land"))) {
            throw error;
        }
        throw new Error("Failed to get prediction from AgriYield-AI. Please check your inputs and API key.");
    }
};

export const getCropInfo = async (cropName: string): Promise<CropInfo> => {
    try {
        const prompt = `Provide detailed information about the crop: ${cropName}. The output must be a JSON object matching the provided schema. Include ideal growing conditions, common pests, and the typical growing cycle duration.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: cropInfoSchema,
            },
        });

        const jsonString = response.text.trim();
        return JSON.parse(jsonString) as CropInfo;
        
    } catch (error) {
        console.error("Error calling Gemini API for crop information:", error);
        throw new Error("Failed to get crop information from AgriYield-AI.");
    }
};

export const getHistoricalWeather = async (region: string): Promise<HistoricalWeatherData> => {
    try {
        const prompt = `Generate synthetic historical weather data for the region: "${region}". Provide the average monthly temperature (in Celsius) and total monthly rainfall (in mm) for the last 12 months. The output must be a JSON object matching the provided schema. The months should be in chronological order starting from 12 months ago to the last month.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: historicalWeatherSchema
            }
        });

        const jsonString = response.text.trim();
        return JSON.parse(jsonString) as HistoricalWeatherData;
    } catch (error) {
        console.error("Error calling Gemini API for historical weather:", error);
        throw new Error(`Failed to get historical weather data for ${region}.`);
    }
};