import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { ChatAnthropic } from "@langchain/anthropic";
import { Serper } from "@langchain/community/tools/serper";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  if (!name) {
    return NextResponse.json({ error: "Missing name parameter" }, { status: 400 });
  }

  try {
    // 1) Initialize the Search tool - use Serper directly as a tool
    const serperTool = new Serper(process.env.SERPER_API_KEY);

    // 2) Initialize LLM
    const llm = new ChatAnthropic({
      temperature: 0,
      apiKey: process.env.ANTHROPIC_API_KEY,
      modelName: "claude-sonnet-4-20250514",
    });

    // 3) Create agent with the Serper tool directly
    const executor = await initializeAgentExecutorWithOptions(
      [serperTool], // Use serperTool directly instead of wrapping it
      llm, 
      {
        agentType: "zero-shot-react-description",
        maxIterations: 3, // Reduced iterations
        verbose: true,
        earlyStoppingMethod: "generate", // Stop when agent thinks it has enough info
      }
    );

    // 4) Run the prompt - be more specific and directive
    const prompt = `Search for "${name} professional background" and then immediately provide a summary for a cold email. Do not search multiple times. After you get search results, provide a concise summary of their professional background and any interesting details you found. Focus on their current role, company, and notable achievements.`;
    
    const result = await executor.call({ input: prompt });

    return NextResponse.json({ summary: result.output });
  } catch (error) {
    console.error("Agent execution error:", error);
    return NextResponse.json({ 
      error: "Agent execution failed", 
      details: error.message 
    }, { status: 500 });
  }
}

// More reliable approach - direct search and summarization
export async function GET_RELIABLE(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  if (!name) {
    return NextResponse.json({ error: "Missing name parameter" }, { status: 400 });
  }

  try {
    // 1) Do the search directly first
    const serper = new Serper(process.env.SERPER_API_KEY);
    const searchQuery = `"${name}" professional background career LinkedIn`;
    
    console.log("🔍 Searching for:", searchQuery);
    const searchResults = await serper.call(searchQuery);
    
    // 2) Process search results
    let formattedResults = "No relevant information found.";
    
    if (typeof searchResults === 'string') {
      try {
        const parsed = JSON.parse(searchResults);
        if (parsed.organic && Array.isArray(parsed.organic)) {
          formattedResults = parsed.organic.slice(0, 3).map((result: any) => 
            `${result.title}\n${result.snippet || result.description || ''}`
          ).join('\n\n');
        }
      } catch (e) {
        formattedResults = searchResults;
      }
    } else if (searchResults && typeof searchResults === 'object' && searchResults.organic) {
      formattedResults = searchResults.organic.slice(0, 3).map((result: any) => 
        `${result.title}\n${result.snippet || result.description || ''}`
      ).join('\n\n');
    }

    // 3) Use LLM to summarize the results directly
    const llm = new ChatAnthropic({
      temperature: 0,
      apiKey: process.env.ANTHROPIC_API_KEY,
      modelName: "claude-sonnet-4-20250514",
    });

    const summaryPrompt = `Based on the following search results about ${name}, create a concise professional summary suitable for a personalized cold email. Focus on their current role, company, notable achievements, and any interesting human details that would make for good conversation starters.

Search Results:
${formattedResults}

Provide a summary in 2-3 sentences that highlights the most relevant professional information and one interesting detail if available.`;

    const summary = await llm.call([{ role: "user", content: summaryPrompt }]);
    
    return NextResponse.json({ 
      summary: summary.content,
      searchResults: formattedResults // Include raw results for debugging
    });

  } catch (error) {
    console.error("Search and summarization error:", error);
    return NextResponse.json({ 
      error: "Failed to generate summary", 
      details: error.message 
    }, { status: 500 });
  }
}
export async function GET_ALTERNATIVE(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  if (!name) {
    return NextResponse.json({ error: "Missing name parameter" }, { status: 400 });
  }

  try {
    // 1) Initialize Serper
    const serper = new Serper(process.env.SERPER_API_KEY);

    // 2) Create a properly structured tool
    const searchTool = {
      name: "search",
      description: "Search for information about people and their professional backgrounds",
      func: async (query: string) => {
        console.log("🔍 [Search] Query:", query);
        try {
          const results = await serper.call(query);
          console.log("✅ [Search] Raw response:", results);
          
          // Parse the Serper response properly
          if (typeof results === 'string') {
            try {
              const parsed = JSON.parse(results);
              // Extract meaningful content from organic results
              if (parsed.organic && Array.isArray(parsed.organic)) {
                const summaries = parsed.organic.slice(0, 5).map((result: any) => 
                  `${result.title}: ${result.snippet || result.description || ''}`
                ).join('\n\n');
                return summaries || "No relevant results found";
              }
            } catch (parseError) {
              console.error("Parse error:", parseError);
              return results; // Return raw string if parsing fails
            }
          }
          
          // If results is already an object
          if (results && typeof results === 'object') {
            if (results.organic && Array.isArray(results.organic)) {
              const summaries = results.organic.slice(0, 5).map((result: any) => 
                `${result.title}: ${result.snippet || result.description || ''}`
              ).join('\n\n');
              return summaries || "No relevant results found";
            }
          }
          
          return JSON.stringify(results);
        } catch (error) {
          console.error("❌ [Search] Error:", error);
          return `Search error: ${error.message}`;
        }
      },
    };

    // 3) Initialize LLM
    const llm = new ChatAnthropic({
      temperature: 0,
      apiKey: process.env.ANTHROPIC_API_KEY,
      modelName: "claude-sonnet-4-20250514",
    });

    // 4) Create agent with better configuration
    const executor = await initializeAgentExecutorWithOptions(
      [searchTool], 
      llm, 
      {
        agentType: "zero-shot-react-description",
        maxIterations: 3, // Reduced iterations
        verbose: true,
        earlyStoppingMethod: "generate",
      }
    );

    // 5) Run the prompt - more directive
    const prompt = `Search for "${name} professional background" once and then provide a summary. After getting search results, immediately summarize their professional background for a cold email including any notable achievements or interesting details. Do not perform additional searches.`;
    
    const result = await executor.call({ input: prompt });

    return NextResponse.json({ summary: result.output });
  } catch (error) {
    console.error("Agent execution error:", error);
    return NextResponse.json({ 
      error: "Agent execution failed", 
      details: error.message 
    }, { status: 500 });
  }
}