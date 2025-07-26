require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs').promises;
const path = require('path');

// Initialize Anthropic with environment variable
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

/**
 * Find the most relevant statistics and quotes from a source file based on user's text
 * @param {string} userText - The user's written content
 * @param {string} sourceFilePath - Path to the source file to extract from
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Object containing relevant statistics and quotes
 */
async function findRelevantQuotesAndStats(userText, sourceFilePath, options = {}) {
  const {
    maxStats = 5,
    maxQuotes = 5,
    relevanceThreshold = 0.6,
    includeContext = true,
    contextLength = 150
  } = options;

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY environment variable is required');
  }

  if (!userText || !sourceFilePath) {
    throw new Error('Both userText and sourceFilePath are required');
  }

  try {
    console.log('Reading source file...');
    const sourceText = await readSourceFile(sourceFilePath);
    
    console.log('Analyzing user context...');
    const userContext = await analyzeUserNeeds(userText);
    
    console.log('Extracting statistics and quotes from source...');
    const extractedContent = await extractFromSource(sourceText);
    
    if (extractedContent.statistics.length === 0 && extractedContent.quotes.length === 0) {
      return {
        userContext,
        statistics: [],
        quotes: [],
        message: "No statistics or quotes were found in the source file.",
        sourceInfo: {
          file: path.basename(sourceFilePath),
          length: sourceText.length,
          wordCount: sourceText.split(/\s+/).length
        }
      };
    }
    
    console.log('Scoring relevance to user\'s text...');
    const scoredContent = await scoreContentRelevance(userText, userContext, extractedContent);
    
    // Filter and sort by relevance
    const relevantStats = scoredContent.statistics
      .filter(stat => stat.relevanceScore >= relevanceThreshold)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxStats);
    
    const relevantQuotes = scoredContent.quotes
      .filter(quote => quote.relevanceScore >= relevanceThreshold)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxQuotes);
    
    const result = {
      userContext,
      statistics: relevantStats,
      quotes: relevantQuotes,
      sourceInfo: {
        file: path.basename(sourceFilePath),
        totalStatsFound: extractedContent.statistics.length,
        totalQuotesFound: extractedContent.quotes.length,
        relevantStatsCount: relevantStats.length,
        relevantQuotesCount: relevantQuotes.length
      },
      recommendations: await generateUsageRecommendations(userText, relevantStats, relevantQuotes)
    };
    
    return result;
    
  } catch (error) {
    console.error('Error finding relevant content:', error.message);
    throw new Error(`Failed to analyze content: ${error.message}`);
  }
}

/**
 * Read and parse different file types
 */
async function readSourceFile(filePath) {
  try {
    const fileExtension = path.extname(filePath).toLowerCase();
    const fileContent = await fs.readFile(filePath, 'utf8');
    
    // Handle different file types
    switch (fileExtension) {
      case '.txt':
      case '.md':
        return fileContent;
      
      case '.json':
        const jsonData = JSON.parse(fileContent);
        return typeof jsonData === 'string' ? jsonData : JSON.stringify(jsonData, null, 2);
      
      case '.csv':
        // Convert CSV to readable text format
        return fileContent.split('\n').slice(0, 100).join('\n'); // First 100 lines
      
      default:
        return fileContent;
    }
  } catch (error) {
    throw new Error(`Failed to read source file: ${error.message}`);
  }
}

/**
 * Analyze what the user needs based on their text
 */
async function analyzeUserNeeds(userText) {
  const message = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022",
    max_tokens: 300,
    temperature: 0.2,
    system: `Analyze the user's text to understand what kind of supporting evidence would be most valuable.

Identify:
1. Main argument or thesis
2. Key topics and themes  
3. Type of evidence needed (statistics, expert quotes, research findings, etc.)
4. Gaps where supporting data would strengthen the argument
5. Writing style and target audience

Return as JSON: {"mainArgument": "...", "keyTopics": ["..."], "evidenceNeeds": ["..."], "gaps": ["..."], "audience": "..."}`,
    messages: [{
      role: "user",
      content: `Analyze this text to understand what supporting evidence would be most helpful:\n\n"${userText}"`
    }]
  });

  try {
    const content = message.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {
      mainArgument: "Could not determine main argument",
      keyTopics: ["general"],
      evidenceNeeds: ["supporting data"],
      gaps: ["needs more evidence"],
      audience: "general"
    };
  } catch (parseError) {
    console.warn('Failed to parse user context analysis');
    return {
      mainArgument: "Analysis unavailable",
      keyTopics: ["general"],
      evidenceNeeds: ["supporting data"],
      gaps: ["needs more evidence"],
      audience: "general"
    };
  }
}

/**
 * Extract statistics and quotes from source text
 */
async function extractFromSource(sourceText) {
  const message = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022",
    max_tokens: 1200,
    temperature: 0.1,
    system: `Extract statistics and quotable content from the provided text.

STATISTICS: Look for:
- Numerical data, percentages, measurements
- Research findings with numbers
- Survey results, poll data
- Trend data (increases, decreases)
- Comparative data
- Financial figures

QUOTES: Look for:
- Expert statements and opinions
- Key conclusions or findings
- Memorable or impactful phrases
- Authoritative declarations
- Research conclusions
- Notable insights

For each item provide:
- exact text
- surrounding context (2-3 sentences)
- source/speaker if mentioned
- approximate position in document

Return as JSON: {"statistics": [{"text": "...", "context": "...", "source": "...", "position": "..."}], "quotes": [{"text": "...", "context": "...", "source": "...", "position": "..."}]}`,
    messages: [{
      role: "user",
      content: `Extract all statistics and quotes from this text:\n\n"${sourceText.substring(0, 8000)}"` // Limit to avoid token limits
    }]
  });

  try {
    const content = message.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { statistics: [], quotes: [] };
  } catch (parseError) {
    console.warn('Failed to parse extracted content, using fallback');
    return extractFallback(sourceText);
  }
}

/**
 * Score each piece of content for relevance to user's text
 */
async function scoreContentRelevance(userText, userContext, extractedContent) {
  const allItems = [
    ...extractedContent.statistics.map(item => ({ ...item, type: 'statistic' })),
    ...extractedContent.quotes.map(item => ({ ...item, type: 'quote' }))
  ];

  const scoringPromises = allItems.map(item => scoreIndividualItem(userText, userContext, item));
  const scoredItems = await Promise.all(scoringPromises);

  return {
    statistics: scoredItems.filter(item => item.type === 'statistic'),
    quotes: scoredItems.filter(item => item.type === 'quote')
  };
}

/**
 * Score an individual item for relevance
 */
async function scoreIndividualItem(userText, userContext, item) {
  try {
    const message = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022",
      max_tokens: 150,
      temperature: 0.1,
      system: `Score how relevant this ${item.type} is for supporting the user's writing.

Consider:
- Direct relevance to main argument
- Support for key topics
- Credibility and impact
- Appropriateness for audience
- How well it fills identified gaps

Return score 0.0-1.0 and brief explanation.
Format: {"score": 0.85, "reason": "directly supports main argument about..."}`,
      messages: [{
        role: "user",
        content: `User's main argument: ${userContext.mainArgument}
Key topics: ${userContext.keyTopics?.join(', ')}
Evidence needs: ${userContext.evidenceNeeds?.join(', ')}

${item.type.toUpperCase()}: "${item.text}"
Context: ${item.context}

Relevance score?`
      }]
    });

    const content = message.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*?\}/);
    
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        ...item,
        relevanceScore: result.score || 0.5,
        relevanceReason: result.reason || 'No specific reason provided'
      };
    }
  } catch (error) {
    console.warn(`Failed to score ${item.type}:`, error.message);
  }
  
  return {
    ...item,
    relevanceScore: 0.5,
    relevanceReason: 'Could not determine relevance'
  };
}

/**
 * Generate recommendations for how to use the found content
 */
async function generateUsageRecommendations(userText, statistics, quotes) {
  if (statistics.length === 0 && quotes.length === 0) {
    return "No relevant statistics or quotes found. Consider using different source material or refining your search terms.";
  }

  const message = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022",
    max_tokens: 400,
    temperature: 0.3,
    system: `Provide specific recommendations for incorporating the found statistics and quotes into the user's writing.

Include:
- Where each piece of evidence would be most effective
- How to introduce and frame the evidence
- What additional context might be needed
- Specific integration suggestions

Be practical and actionable.`,
    messages: [{
      role: "user",
      content: `User's text: "${userText}"

Found Statistics: ${statistics.map(s => `"${s.text}" (relevance: ${s.relevanceScore.toFixed(2)})`).join('; ')}

Found Quotes: ${quotes.map(q => `"${q.text}" (relevance: ${q.relevanceScore.toFixed(2)})`).join('; ')}

How should they integrate this evidence?`
    }]
  });

  return message.content[0].text;
}

/**
 * Fallback extraction using regex patterns
 */
function extractFallback(sourceText) {
  const statistics = [];
  const quotes = [];
  
  // Extract numbers and percentages
  const statPatterns = [
    /\d+(\.\d+)?%/g,
    /\$\d+(\.\d+)?\s*(million|billion|thousand)/gi,
    /\d+(\.\d+)?\s*(million|billion|thousand|percent)/gi,
    /(\d+(\.\d+)?)\s*(out of|in)\s*(\d+)/gi
  ];
  
  for (const pattern of statPatterns) {
    const matches = [...sourceText.matchAll(pattern)];
    matches.forEach(match => {
      const start = Math.max(0, match.index - 100);
      const end = Math.min(sourceText.length, match.index + match[0].length + 100);
      statistics.push({
        text: match[0],
        context: sourceText.substring(start, end).trim(),
        source: 'Pattern extraction',
        position: `Character ${match.index}`
      });
    });
  }
  
  // Extract quoted text
  const quotePattern = /"([^"]{20,300})"/g;
  const matches = [...sourceText.matchAll(quotePattern)];
  matches.forEach(match => {
    const start = Math.max(0, match.index - 100);
    const end = Math.min(sourceText.length, match.index + match[0].length + 100);
    quotes.push({
      text: match[1],
      context: sourceText.substring(start, end).trim(),
      source: 'Quotation marks',
      position: `Character ${match.index}`
    });
  });
  
  return { statistics, quotes };
}

/**
 * Command line interface
 */
async function runFromCommandLine() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log(`
Usage: node script.js "Your text here" path/to/source/file.txt

Example: node script.js "Climate change requires urgent action" ./climate_report.txt

Options:
  --max-stats=N     Maximum statistics to return (default: 5)
  --max-quotes=N    Maximum quotes to return (default: 5)
  --threshold=N     Minimum relevance score 0.0-1.0 (default: 0.6)
    `);
    return;
  }
  
  const userText = args[0];
  const sourceFile = args[1];
  
  // Parse options
  const options = {};
  args.slice(2).forEach(arg => {
    if (arg.startsWith('--max-stats=')) options.maxStats = parseInt(arg.split('=')[1]);
    if (arg.startsWith('--max-quotes=')) options.maxQuotes = parseInt(arg.split('=')[1]);
    if (arg.startsWith('--threshold=')) options.relevanceThreshold = parseFloat(arg.split('=')[1]);
  });
  
  try {
    const results = await findRelevantQuotesAndStats(userText, sourceFile, options);
    
    console.log('\n📊 RELEVANT STATISTICS:');
    console.log('========================');
    if (results.statistics.length === 0) {
      console.log('No relevant statistics found.');
    } else {
      results.statistics.forEach((stat, i) => {
        console.log(`${i + 1}. "${stat.text}"`);
        console.log(`   📈 Relevance: ${(stat.relevanceScore * 100).toFixed(1)}%`);
        console.log(`   💡 Why: ${stat.relevanceReason}`);
        console.log(`   📄 Context: ${stat.context.substring(0, 200)}...`);
        if (stat.source && stat.source !== 'Pattern extraction') {
          console.log(`   🎯 Source: ${stat.source}`);
        }
        console.log('');
      });
    }
    
    console.log('\n💬 RELEVANT QUOTES:');
    console.log('===================');
    if (results.quotes.length === 0) {
      console.log('No relevant quotes found.');
    } else {
      results.quotes.forEach((quote, i) => {
        console.log(`${i + 1}. "${quote.text}"`);
        console.log(`   📈 Relevance: ${(quote.relevanceScore * 100).toFixed(1)}%`);
        console.log(`   💡 Why: ${quote.relevanceReason}`);
        console.log(`   📄 Context: ${quote.context.substring(0, 200)}...`);
        if (quote.source && quote.source !== 'Quotation marks') {
          console.log(`   🎯 Source: ${quote.source}`);
        }
        console.log('');
      });
    }
    
    console.log('\n📋 USAGE RECOMMENDATIONS:');
    console.log('==========================');
    console.log(results.recommendations);
    
    console.log('\n📊 SUMMARY:');
    console.log('===========');
    console.log(`File analyzed: ${results.sourceInfo.file}`);
    console.log(`Statistics found: ${results.sourceInfo.totalStatsFound} (${results.sourceInfo.relevantStatsCount} relevant)`);
    console.log(`Quotes found: ${results.sourceInfo.totalQuotesFound} (${results.sourceInfo.relevantQuotesCount} relevant)`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Export functions for use as module
module.exports = {
  findRelevantQuotesAndStats,
  readSourceFile,
  analyzeUserNeeds,
  extractFromSource
};

// Run CLI if called directly
if (require.main === module) {
  runFromCommandLine();
}