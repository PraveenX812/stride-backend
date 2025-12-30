const axios = require('axios');
require('dotenv').config();

const MOCK_ANSWERS = {
    default: "I can help you visualize and understand emissions data. Try asking about specific sectors like 'Transport' or 'Energy', or ask for global trends.",
    transport: "The **Transport sector** is a major contributor to global emissions, primarily driven by road vehicles (passenger cars and freight). Aviation and shipping also contribute significantly. **Recent trends** show a rebound in transport emissions post-COVID-19. \n\n*Source: Global Carbon Project*",
    energy: "The **Energy sector** remains the largest source of global greenhouse gas emissions. While renewable energy adoption is accelerating, coal and gas still dominate in many regions. \n\n*Source: IEA World Energy Outlook*",
    agriculture: "**Agriculture** is the primary source of anthropogenic methane emissions, largely from livestock and rice cultivation. Sustainable farming practices are being developed to mitigate this. \n\n*Source: FAO Stats*",
    policy: "**Current policies** in the EU (Green Deal) and US (Inflation Reduction Act) differ in approach but aim for net-zero by 2050. Carbon pricing is becoming more prevalent globally."
};

async function searchWeb(query) {
    try {
        if (!process.env.TAVILY_API_KEY) throw new Error("No Tavily Key");

        const response = await axios.post('https://api.tavily.com/search', {
            api_key: process.env.TAVILY_API_KEY,
            query: query,
            search_depth: "basic",
            max_results: 3
        }, {
            headers: { 'Content-Type': 'application/json' }
        });

        return response.data.results.map(r => `[${r.title}](${r.url}): ${r.content}`).join('\n\n');
    } catch (error) {
        console.warn("Search API failed or missing key, using fallback.");
        return null;
    }
}

async function generateAIResponse(userMessage, searchContext) {
    try {
        if (!process.env.GEMINI_API_KEY) throw new Error("No Gemini Key");

        const systemPrompt = `You are EcoInsight, an expert environmental data analyst. 
        User Question: "${userMessage}"
        
        Context from Web Search:
        ${searchContext || "No external context available."}
        
        DATA VISUALIZATION INSTRUCTIONS:
        If the user command implies visualizing data (e.g., "plot", "show", "compare", "graph"), you MUST include a JSON object.
        
        You have two valid schema options. Choose the one that fits the available data best.

        OPTION 1: Time Series (Trends over years)
        {
            "response_text": "Explanation...",
            "chart_type": "trend",
            "chart_data": [
                {
                    "sector": "USA",
                    "data": [ { "year": 2020, "co2": 100 }, { "year": 2021, "co2": 110 } ],
                    "color": "#3b82f6"
                }
            ]
        }

        OPTION 2: Snapshot (Comparison at a single point in time)
        {
            "response_text": "Explanation...",
            "chart_type": "snapshot",
            "chart_data": [
                { "label": "Transport", "value": 4500, "color": "#ef4444" },
                { "label": "Energy", "value": 8000, "color": "#f59e0b" }
            ]
        }

        General Rules:
        1. Always wrap the main JSON object in \`\`\`json code blocks.
        2. Ensure "chart_data" is never empty if you promise a visualization.
        3. Use contrasting colors for different entities.
        `;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`;

        const response = await axios.post(url, {
            contents: [{
                parts: [{
                    text: systemPrompt
                }]
            }]
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return response.data.candidates[0].content.parts[0].text;

    } catch (error) {
        console.warn("Gemini API failed or missing key.", error.message);
        if (error.response) console.warn("API Error Details:", error.response.data);
        return null;
    }
}

async function handleChat(message) {
    const lowerMsg = message.toLowerCase();

    if (process.env.GEMINI_API_KEY && process.env.TAVILY_API_KEY) {
        const searchResults = await searchWeb(message);
        const aiResponse = await generateAIResponse(message, searchResults);
        let sourceLabel = "Live AI (Gemini)";
        if (searchResults) sourceLabel += " + Web Search";

        if (aiResponse) return { answer: aiResponse, source: sourceLabel };
    }

    await new Promise(r => setTimeout(r, 1000));

    return { answer: MOCK_ANSWERS.default, source: "System" };
}

module.exports = { handleChat };
