import { findRelevantQuotesAndStats } from './quote_finder.js';
import { writeFileSync } from 'fs';

// Create a test source file with statistics and quotes about international students
const sourceContent = `
 💰 Only 5% of U.S. colleges offer need-blind admissions for international students, and fewer than 1% guarantee to meet full demonstrated financial need.
(Source: EducationUSA, NAFSA)

🎓 In the 2023-24 academic year, the average annual cost of attending a private U.S. university was $58,628 (tuition, fees, and living expenses combined).
(Source: College Board)

Visa and Employment Barriers

👔 Only 25% of U.S. employers are willing to sponsor international students for work visas after graduation.
(Source: Interstride, 2023 Survey)

🕒 F-1 students are only allowed to work 20 hours per week during academic terms and must receive prior approval for most off-campus employment.
(Source: U.S. Citizenship and Immigration Services – USCIS)

⚠️ In 2024, the H-1B visa lottery acceptance rate was under 20%, making post-graduation work uncertain even for highly qualified graduates.
(Source: USCIS H-1B FY 2024 Cap Season Data)

Rising Enrollment but Persistent Inequality

🌍 There are over 1 million international students currently enrolled in U.S. institutions, accounting for ~5.6% of the total student population.
(Source: Institute of International Education – IIE, Open Doors 2024)

🇨🇳 🇮🇳 Students from China and India make up over 52% of the total international student population.
(Source: IIE, 2024)

Return on Investment (ROI) Challenges

🧾 According to a 2023 report, more than 40% of international students who wished to stay in the U.S. post-graduation were unable to secure work visas, forcing many to return home.
(Source: FWD.us & Niskanen Center)

`;

// Write the source file
writeFileSync('./international_student_source.txt', sourceContent);

// Your user text about international students
const userText = `Every fall, countless international students leave behind their communities, cultures, and loved ones to pursue higher education in the United States, drawn by the promise of opportunity and prestige of American institutions. Yet, behind the glossy brochures and world-class rankings, reality is much different from what they imagine. Despite being physically present in the United States, their visa restrictions, limited access to financial aid, and barriers to permanent employment present substantial challenges to their career development – effectively denying their access to the same opportunities as domestic students. To make matters worse, the conditions of the F-1 student visa – the visa that allows international students to live in the United States during their college enrollment – state that a "non-resident alien" would face deportation if they cannot secure employment after graduation. This means that students hoping to stay in the country after college face immense pressure to find employers willing to sponsor their visas – something employers are reluctant to do. All of these factors naturally raise the question: how should our immigration and education systems change to better serve a global community of scholars?`;

async function testInternationalStudentAnalysis() {
  try {
    console.log('🔍 Analyzing international student content...\n');
    
    const results = await findRelevantQuotesAndStats(
      userText,
      './international_student_source.txt',
      {
        maxStats: 5,
        maxQuotes: 3,
        relevanceThreshold: 0.2
      }
    );

    console.log('📊 MOST RELEVANT STATISTICS:');
    console.log('============================');
    if (results.statistics.length === 0) {
      console.log('No relevant statistics found.');
    } else {
      results.statistics.forEach((stat, i) => {
        console.log(`${i + 1}. "${stat.text}"`);
        console.log(`   📈 Relevance: ${(stat.relevanceScore * 100).toFixed(1)}%`);
        console.log(`   💡 Why relevant: ${stat.relevanceReason}`);
        console.log(`   📝 How to use: ${stat.context.substring(0, 150)}...`);
        console.log('');
      });
    }

    console.log('💬 MOST RELEVANT QUOTES:');
    console.log('=========================');
    if (results.quotes.length === 0) {
      console.log('No relevant quotes found.');
    } else {
      results.quotes.forEach((quote, i) => {
        console.log(`${i + 1}. "${quote.text}"`);
        console.log(`   📈 Relevance: ${(quote.relevanceScore * 100).toFixed(1)}%`);
        console.log(`   💡 Why relevant: ${quote.relevanceReason}`);
        if (quote.source && quote.source !== 'Quotation marks') {
          console.log(`   👤 Source: ${quote.source}`);
        }
        console.log('');
      });
    }

    console.log('📋 HOW TO USE THIS EVIDENCE:');
    console.log('============================');
    console.log(results.recommendations);

    console.log('\n📊 ANALYSIS SUMMARY:');
    console.log('====================');
    console.log(`📄 Source file: ${results.sourceInfo.file}`);
    console.log(`📈 Statistics found: ${results.sourceInfo.totalStatsFound} total, ${results.sourceInfo.relevantStatsCount} relevant`);
    console.log(`💬 Quotes found: ${results.sourceInfo.totalQuotesFound} total, ${results.sourceInfo.relevantQuotesCount} relevant`);
    
    // Show user context understanding
    console.log('\n🎯 DETECTED WRITING FOCUS:');
    console.log('===========================');
    console.log(`Main argument: ${results.userContext.mainArgument}`);
    console.log(`Key topics: ${results.userContext.keyTopics?.join(', ')}`);
    console.log(`Evidence needs: ${results.userContext.evidenceNeeds?.join(', ')}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the test
testInternationalStudentAnalysis();