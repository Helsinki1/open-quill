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
    // 1) Initialize the Search tool
    const serper = new Serper(process.env.SERPER_API_KEY);
    const searchTool = {
      name: "Search",                                  // <-- MUST have a name
      description: "Search for professional background.",
      func: async (input) => {
        // you can console.log(input) here to confirm it’s called
        return serper.run(input);
      },
    };

    // 2) Initialize LLM
    const llm = new ChatAnthropic({
      temperature: 0,
      apiKey: process.env.ANTHROPIC_API_KEY,
      modelName: "claude-sonnet-4-20250514",
    });

    // 3) Wrap it in an agent

    const executor = await initializeAgentExecutorWithOptions([searchTool], llm, {
      agentType: "zero-shot-react-description",
      maxIterations: 5,
      verbose: true,
    });

    // 4) Run the prompt
    const prompt =
      `Summarize ${name}'s professional background for a personalized cold email. ` +
      "Include any interesting human detail you find.";
    const { output } = await executor.call({ input: prompt });  // ← .run() returns just the string

    return NextResponse.json({ summary: output });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Agent execution failed" }, { status: 500 });
  }
}
