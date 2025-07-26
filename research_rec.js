require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const axios = require('axios');
const xml2js = require('xml2js');

// Initialize Anthropic with environment variable
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

/**
 * Get relevant humanities research articles based on user input text
 * Uses multiple academic databases and repositories for humanities research
 * @param {string} userText - The text to analyze for research topics
 * @param {number} maxPapers - Maximum number of papers to return (default: 3)
 * @returns {Promise<Array>} Array of relevant research papers
 */
async function getRelevantHumanitiesArticles(userText, maxPapers = 3) {
  // Validate environment variables
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY environment variable is required');
  }

  if (!userText || typeof userText !== 'string' || userText.trim().length === 0) {
    throw new Error('Valid user text is required');
  }

  try {
    console.log('Analyzing text for humanities research topics with Claude...');
    
    // Step 1: Use Claude to extract humanities research topics
    const message = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022",
      max_tokens: 300,
      temperature: 0.3,
      system: `You are a humanities research specialist with expertise across literature, philosophy, history, cultural studies, linguistics, anthropology, religious studies, art history, political theory, and interdisciplinary humanities fields. 

Analyze the given text and extract 3-5 key academic topics, concepts, or keywords that would be effective for finding scholarly humanities articles. Focus on:
- Literary theories, movements, authors, or periods
- Philosophical concepts, thinkers, or schools of thought
- Historical periods, events, or methodological approaches
- Cultural phenomena, identity studies, or social theory
- Linguistic concepts or language families
- Religious or theological concepts
- Art historical movements, artists, or techniques
- Political theories or governance concepts

Return only a JSON array of strings. Each should be a specific, scholarly term or concept appropriate for humanities databases.`,
      messages: [{
        role: "user",
        content: userText
      }]
    });

    let topics;
    try {
      const content = message.content[0].text;
      // Try to extract JSON array from response
      const jsonMatch = content.match(/\[.*?\]/s);
      if (jsonMatch) {
        topics = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback parsing
        topics = content.split('\n')
          .map(line => line.replace(/^[-*•]\s*/, '').replace(/["\[\]]/g, '').trim())
          .filter(topic => topic.length > 2)
          .slice(0, 5);
      }
    } catch (parseError) {
      console.warn('Failed to parse Claude response as JSON, using fallback extraction');
      topics = extractHumanitiesFallbackTopics(userText);
    }

    if (!topics || topics.length === 0) {
      throw new Error('No humanities research topics could be extracted from the text');
    }

    console.log('Extracted humanities topics:', topics);

    // Step 2: Search multiple sources for papers
    const papers = await searchMultipleHumanitiesSources(topics, maxPapers);
    
    if (papers.length === 0) {
      console.warn('No papers found for the extracted topics');
    }
    
    return papers;

  } catch (error) {
    console.error('Error getting relevant humanities articles:', error.message);
    throw new Error(`Failed to get relevant humanities articles: ${error.message}`);
  }
}

/**
 * Fallback topic extraction for humanities using domain-specific terms
 * @param {string} text - Input text
 * @returns {Array<string>} Array of potential humanities topics
 */
function extractHumanitiesFallbackTopics(text) {
  const humanitiesTerms = [
    // Literature
    'narrative theory', 'postcolonial literature', 'modernism', 'romanticism', 'feminist criticism',
    'comparative literature', 'literary theory', 'canon formation', 'genre studies', 'poetry analysis',
    // Philosophy
    'phenomenology', 'existentialism', 'ethics', 'epistemology', 'metaphysics', 'political philosophy',
    'continental philosophy', 'analytic philosophy', 'moral philosophy', 'philosophy of mind',
    // History
    'social history', 'cultural history', 'intellectual history', 'microhistory', 'oral history',
    'historiography', 'medieval history', 'ancient history', 'modern history', 'gender history',
    // Cultural Studies
    'cultural identity', 'postmodernism', 'globalization', 'cultural theory', 'media studies',
    'popular culture', 'digital humanities', 'memory studies', 'diaspora studies', 'queer theory',
    // Linguistics
    'sociolinguistics', 'historical linguistics', 'discourse analysis', 'pragmatics', 'semantics',
    'language contact', 'morphology', 'phonology', 'syntax', 'language acquisition',
    // Religion
    'comparative religion', 'theology', 'religious studies', 'biblical studies', 'islamic studies',
    'buddhist studies', 'religious philosophy', 'sacred texts', 'ritual studies', 'mysticism',
    // Art History
    'renaissance art', 'contemporary art', 'art criticism', 'visual culture', 'iconography',
    'museum studies', 'art theory', 'aesthetic theory', 'public art', 'digital art'
  ];
  
  const lowercaseText = text.toLowerCase();
  const foundTerms = humanitiesTerms.filter(term => lowercaseText.includes(term));
  
  // Extract potentially relevant academic words
  const words = text.match(/\b[A-Z][a-z]{4,}\b/g) || []; // Capitalized words (proper nouns, theories)
  const uniqueWords = [...new Set(words.map(w => w.toLowerCase()))];
  
  return [...foundTerms, ...uniqueWords.slice(0, 3)].slice(0, 5);
}

/**
 * Search multiple humanities databases and repositories
 * @param {Array<string>} topics - Array of research topics
 * @param {number} maxPapers - Maximum papers to return
 * @returns {Promise<Array>} Array of paper objects
 */
async function searchMultipleHumanitiesSources(topics, maxPapers) {
  const allPapers = [];
  const papersPerSource = Math.ceil(maxPapers / 3); // Distribute across sources
  
  // Search strategies for different sources
  const searchPromises = [
    searchArXivHumanities(topics, papersPerSource),
    searchDoaj(topics, papersPerSource),
    searchSemanticScholar(topics, papersPerSource)
  ];
  
  const results = await Promise.allSettled(searchPromises);
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      allPapers.push(...result.value);
    } else {
      console.warn(`Search source ${index + 1} failed:`, result.reason.message);
    }
  });
  
  // Remove duplicates and limit results
  const uniquePapers = removeDuplicatePapers(allPapers);
  return uniquePapers.slice(0, maxPapers);
}

/**
 * Search arXiv for humanities-related papers
 * ArXiv has some humanities content, especially digital humanities and computational approaches
 */
async function searchArXivHumanities(topics, maxPapers) {
  const papers = [];
  const timeout = parseInt(process.env.SEARCH_TIMEOUT) || 10000;
  
  for (const topic of topics.slice(0, 2)) {
    try {
      const searchUrl = 'http://export.arxiv.org/api/query';
      const params = {
        search_query: `all:${topic}`,
        start: 0,
        max_results: Math.min(maxPapers, 10),
        sortBy: 'relevance',
        sortOrder: 'descending'
      };
      
      const response = await axios.get(searchUrl, {
        timeout,
        params,
        headers: {
          'User-Agent': 'HumanitiesResearchAgent/1.0'
        }
      });
      
      if (response.data) {
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(response.data);
        
        if (result.feed && result.feed.entry) {
          const entries = Array.isArray(result.feed.entry) ? result.feed.entry : [result.feed.entry];
          
          for (const entry of entries) {
            // Filter for potentially humanities-relevant papers
            const title = entry.title?.[0] || '';
            const abstract = entry.summary?.[0] || '';
            const categories = entry.category ? entry.category.map(cat => cat.$.term) : [];
            
            // Check if paper might be humanities-related
            const isHumanities = categories.some(cat => 
              cat.startsWith('cs.CL') || // Computational Linguistics
              cat.startsWith('cs.CY') || // Computers and Society
              cat.startsWith('cs.DL') // Digital Libraries
            ) || title.toLowerCase().includes('digital humanities') ||
                abstract.toLowerCase().includes('humanities') ||
                abstract.toLowerCase().includes('cultural') ||
                abstract.toLowerCase().includes('literary');
            
            if (isHumanities) {
              const paper = {
                title: cleanText(title),
                authors: extractArxivAuthors(entry.author),
                abstract: cleanText(abstract),
                published: formatDate(entry.published?.[0]),
                updated: formatDate(entry.updated?.[0]),
                url: entry.id?.[0] || '',
                doi: extractDoiFromArxiv(entry),
                source: 'arXiv',
                subjects: categories.join(', '),
                relevantTopic: topic,
                pdfUrl: entry.id?.[0]?.replace('/abs/', '/pdf/') + '.pdf' || '',
                language: 'en',
                type: 'preprint'
              };
              
              if (paper.title && paper.url) {
                papers.push(paper);
              }
            }
          }
        }
      }
    } catch (error) {
      console.warn(`Error searching arXiv for topic "${topic}":`, error.message);
    }
  }
  
  return papers;
}

/**
 * Search Directory of Open Access Journals (DOAJ)
 */
async function searchDoaj(topics, maxPapers) {
  const papers = [];
  const timeout = parseInt(process.env.SEARCH_TIMEOUT) || 10000;
  
  for (const topic of topics.slice(0, 2)) {
    try {
      const searchUrl = 'https://doaj.org/api/v2/search/articles';
      const params = {
        q: topic,
        pageSize: Math.min(maxPapers, 10),
        sort: 'score'
      };
      
      const response = await axios.get(searchUrl, {
        timeout,
        params,
        headers: {
          'User-Agent': 'HumanitiesResearchAgent/1.0'
        }
      });
      
      if (response.data && response.data.results) {
        for (const article of response.data.results) {
          // Check if article is humanities-related
          const subjects = article.bibjson?.subject || [];
          const title = article.bibjson?.title || '';
          const abstract = article.bibjson?.abstract || '';
          
          const isHumanities = subjects.some(subject => 
            subject.term && (
              subject.term.toLowerCase().includes('humanities') ||
              subject.term.toLowerCase().includes('literature') ||
              subject.term.toLowerCase().includes('philosophy') ||
              subject.term.toLowerCase().includes('history') ||
              subject.term.toLowerCase().includes('cultural') ||
              subject.term.toLowerCase().includes('linguistics') ||
              subject.term.toLowerCase().includes('religion') ||
              subject.term.toLowerCase().includes('art')
            )
          ) || title.toLowerCase().includes('humanities') ||
              abstract.toLowerCase().includes('humanities');
          
          if (isHumanities || subjects.length === 0) { // Include if clearly humanities or subjects unclear
            const paper = {
              title: cleanText(title),
              authors: extractDoajAuthors(article.bibjson?.author || []),
              abstract: cleanText(abstract),
              published: formatDate(article.bibjson?.year),
              updated: formatDate(article.bibjson?.year),
              url: extractDoajUrl(article.bibjson?.link || []),
              doi: article.bibjson?.identifier?.find(id => id.type === 'doi')?.id || '',
              source: 'DOAJ',
              subjects: subjects.map(s => s.term).join(', '),
              relevantTopic: topic,
              language: article.bibjson?.language?.[0] || 'en',
              type: 'journal_article'
            };
            
            if (paper.title && paper.url) {
              papers.push(paper);
            }
          }
        }
      }
    } catch (error) {
      console.warn(`Error searching DOAJ for topic "${topic}":`, error.message);
    }
  }
  
  return papers;
}

/**
 * Search Semantic Scholar for humanities papers
 */
async function searchSemanticScholar(topics, maxPapers) {
  const papers = [];
  const timeout = parseInt(process.env.SEARCH_TIMEOUT) || 15000;
  
  for (const topic of topics.slice(0, 2)) {
    try {
      const searchUrl = 'https://api.semanticscholar.org/graph/v1/paper/search';
      const params = {
        query: topic,
        limit: Math.min(maxPapers, 10),
        fields: 'paperId,title,authors,abstract,year,url,openAccessPdf,fieldsOfStudy,citationCount'
      };
      
      const response = await axios.get(searchUrl, {
        timeout,
        params,
        headers: {
          'User-Agent': 'HumanitiesResearchAgent/1.0'
        }
      });
      
      if (response.data && response.data.data) {
        for (const paper of response.data.data) {
          // Filter for humanities fields
          const fields = paper.fieldsOfStudy || [];
          const isHumanities = fields.some(field => 
            field.toLowerCase().includes('art') ||
            field.toLowerCase().includes('history') ||
            field.toLowerCase().includes('philosophy') ||
            field.toLowerCase().includes('literature') ||
            field.toLowerCase().includes('linguistics') ||
            field.toLowerCase().includes('religious') ||
            field.toLowerCase().includes('cultural')
          ) || (paper.title && (
            paper.title.toLowerCase().includes('humanities') ||
            paper.title.toLowerCase().includes('cultural') ||
            paper.title.toLowerCase().includes('literary')
          ));
          
          if (isHumanities || fields.length === 0) {
            const paperObj = {
              title: cleanText(paper.title || ''),
              authors: extractSemanticScholarAuthors(paper.authors || []),
              abstract: cleanText(paper.abstract || 'No abstract available'),
              published: paper.year ? paper.year.toString() : '',
              updated: paper.year ? paper.year.toString() : '',
              url: paper.url || `https://www.semanticscholar.org/paper/${paper.paperId}`,
              doi: '',
              source: 'Semantic Scholar',
              subjects: fields.join(', '),
              relevantTopic: topic,
              pdfUrl: paper.openAccessPdf?.url || '',
              language: 'en',
              type: 'academic_paper',
              citationCount: paper.citationCount || 0
            };
            
            if (paperObj.title && paperObj.url) {
              papers.push(paperObj);
            }
          }
        }
      }
    } catch (error) {
      console.warn(`Error searching Semantic Scholar for topic "${topic}":`, error.message);
    }
  }
  
  return papers;
}

/**
 * Helper functions for extracting author information from different sources
 */
function extractArxivAuthors(authors) {
  if (!authors || !Array.isArray(authors)) return 'Unknown';
  return authors.map(author => author.name?.[0] || 'Unknown').slice(0, 5).join(', ');
}

function extractDoajAuthors(authors) {
  if (!authors || !Array.isArray(authors)) return 'Unknown';
  return authors.map(author => author.name || 'Unknown').slice(0, 5).join(', ');
}

function extractSemanticScholarAuthors(authors) {
  if (!authors || !Array.isArray(authors)) return 'Unknown';
  return authors.map(author => author.name || 'Unknown').slice(0, 5).join(', ');
}

function extractDoajUrl(links) {
  if (!links || !Array.isArray(links)) return '';
  const fullTextLink = links.find(link => link.type === 'fulltext');
  return fullTextLink?.url || '';
}

function extractDoiFromArxiv(entry) {
  if (entry.id && entry.id[0]) {
    const arxivId = entry.id[0].split('/').pop();
    return `10.48550/arXiv.${arxivId}`;
  }
  return '';
}

/**
 * Remove duplicate papers based on title similarity and DOI
 */
function removeDuplicatePapers(papers) {
  const unique = [];
  const seenTitles = new Set();
  const seenDOIs = new Set();
  
  for (const paper of papers) {
    const normalizedTitle = paper.title.toLowerCase().replace(/[^\w\s]/g, '').trim();
    const doi = paper.doi;
    
    if (doi && seenDOIs.has(doi)) {
      continue; // Skip duplicate DOI
    }
    
    if (seenTitles.has(normalizedTitle)) {
      continue; // Skip duplicate title
    }
    
    if (doi) seenDOIs.add(doi);
    seenTitles.add(normalizedTitle);
    unique.push(paper);
  }
  
  return unique;
}

/**
 * Helper functions for data extraction and cleaning
 */
function cleanText(text) {
  if (!text) return '';
  if (Array.isArray(text)) text = text[0] || '';
  return text.replace(/\s+/g, ' ').replace(/[^\w\s.,;:()\-]/g, '').trim();
}

function formatDate(dateString) {
  if (!dateString) return '';
  if (Array.isArray(dateString)) dateString = dateString[0];
  
  try {
    const date = new Date(dateString);
    return date.toISOString().substring(0, 10);
  } catch {
    return dateString.toString().substring(0, 10) || '';
  }
}

/**
 * Get humanities paper recommendations with Claude analysis of relevance
 */
async function getRelevantHumanitiesArticlesWithAnalysis(userText, maxPapers = 3) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY environment variable is required');
  }

  try {
    // First get the papers using standard method
    const papers = await getRelevantHumanitiesArticles(userText, maxPapers * 2);
    
    if (papers.length === 0) {
      return [];
    }
    
    // Use Claude to analyze relevance of each paper for humanities research
    const analysisPromises = papers.map(async (paper) => {
      try {
        const message = await anthropic.messages.create({
          model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022",
          max_tokens: 120,
          temperature: 0.1,
          system: "You are a humanities research expert familiar with interdisciplinary scholarship. Analyze how relevant a research paper is to the user's humanities research interests. Consider theoretical frameworks, methodological approaches, primary sources, and interdisciplinary connections. Return a relevance score from 1-10 and a brief explanation.",
          messages: [{
            role: "user",
            content: `User's research interest: "${userText}"
            
Paper title: "${paper.title}"
Paper abstract: "${paper.abstract.substring(0, 600)}"
Subjects: "${paper.subjects}"

Rate relevance (1-10) for humanities research and explain why in 1-2 sentences, focusing on theoretical or methodological relevance.`
          }]
        });
        
        const analysis = message.content[0].text;
        const scoreMatch = analysis.match(/(\d+)/);
        const relevanceScore = scoreMatch ? parseInt(scoreMatch[1]) : 5;
        
        return {
          ...paper,
          relevanceScore,
          relevanceAnalysis: analysis.replace(/^\d+[.\-:]\s*/, '').trim()
        };
      } catch (analysisError) {
        console.warn(`Failed to analyze paper: ${paper.title}`);
        return {
          ...paper,
          relevanceScore: 5,
          relevanceAnalysis: 'Analysis unavailable'
        };
      }
    });
    
    const analyzedPapers = await Promise.all(analysisPromises);
    
    // Sort by relevance score and return top papers
    return analyzedPapers
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxPapers);
    
  } catch (error) {
    console.error('Error in getRelevantHumanitiesArticlesWithAnalysis:', error.message);
    throw new Error(`Humanities analysis-enhanced search failed: ${error.message}`);
  }
}

/**
 * Example usage for humanities research
 */
async function humanitiesExample() {
  const validation = validateEnvironment();
  if (!validation.valid) {
    console.error('Environment validation failed:', validation.errors);
    return;
  }
  
  const sampleText = `
    I'm researching the representation of memory and trauma in postcolonial literature,
    particularly focusing on how contemporary authors from former colonial territories
    use narrative techniques to explore collective memory and cultural identity.
    I'm interested in comparative analysis between Francophone and Anglophone authors,
    and how postcolonial theory intersects with memory studies and trauma theory.
  `;
  
  try {
    console.log('Searching for relevant humanities articles with Claude...');
    const articles = await getRelevantHumanitiesArticlesWithAnalysis(sampleText, 3);
    
    console.log(`\nFound ${articles.length} relevant humanities articles:\n`);
    articles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   Authors: ${article.authors}`);
      console.log(`   Published: ${article.published}`);
      console.log(`   Source: ${article.source}`);
      console.log(`   Language: ${article.language}`);
      console.log(`   Subjects: ${article.subjects}`);
      if (article.relevanceScore) {
        console.log(`   Relevance Score: ${article.relevanceScore}/10`);
        console.log(`   Why relevant: ${article.relevanceAnalysis}`);
      }
      console.log(`   URL: ${article.url}`);
      if (article.doi) {
        console.log(`   DOI: ${article.doi}`);
      }
      if (article.pdfUrl) {
        console.log(`   PDF: ${article.pdfUrl}`);
      }
      console.log('');
    });
  } catch (error) {
    console.error('Humanities example failed:', error.message);
  }
}

/**
 * Validate environment setup
 */
function validateEnvironment() {
  const results = {
    valid: true,
    errors: [],
    config: {}
  };
  
  if (!process.env.ANTHROPIC_API_KEY) {
    results.valid = false;
    results.errors.push('ANTHROPIC_API_KEY environment variable is missing');
  } else {
    results.config.anthropicConfigured = true;
  }
  
  results.config.model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
  results.config.timeout = process.env.SEARCH_TIMEOUT || '10000';
  
  return results;
}

module.exports = {
  getRelevantHumanitiesArticles,
  getRelevantHumanitiesArticlesWithAnalysis,
  validateEnvironment,
  humanitiesExample
};