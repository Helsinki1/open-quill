// Import the function
const { getRelevantHumanitiesArticles } = require('./research_rec');

async function findPapers() {
  const userText = `
    	Immigration policies in the united states

  `;
  
  try {
    const papers = await getRelevantHumanitiesArticles(userText,3);
    console.log('Found papers:', papers);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

findPapers();