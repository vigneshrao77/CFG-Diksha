require('dotenv').config({ path: './.env' });
const apiKey = process.env.GROQ_API_KEY;

function extractJSON(raw) {
  if (!raw) return null;
  // Remove thinking blocks
  let text = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  // Remove code block backticks
  text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  
  // Find outermost JSON object
  const startIdx = text.indexOf('{');
  const endIdx = text.lastIndexOf('}');
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    const jsonSub = text.substring(startIdx, endIdx + 1);
    try {
      return JSON.parse(jsonSub);
    } catch (e) {
      // Clean possible trailing commas
      const fixed = jsonSub.replace(/,\s*([}\]])/g, '$1');
      return JSON.parse(fixed);
    }
  }
  return JSON.parse(text);
}

const makePrompt = (q, dim, ans) => `You are an expert, fair, and nuanced Social-Emotional Learning (SEL) and communication evaluator for school students.

EVALUATION PHILOSOPHY:
You evaluate like a careful human teacher. You do NOT jump to scores. You analyze the student's actual words first.
- Do NOT use simplistic binary scoring (e.g. 2 vs 8).
- Differentiate between a generic answer vs a reasoned answer with evidence.
- Allow full partial credit across the 0-10 spectrum.
- Base every strength, weakness, and score on direct evidence from what the student actually said.
- Do NOT invent or assume facts the student never stated.
- Do NOT penalize valid alternative perspectives.

INPUT:
Question: "${q}"
Target Dimension: "${dim}"
Student Transcript: "${ans}"

SCORING GUIDELINES (0-10):
- 0-2: Off-topic / audio test ("can you hear me", "am I already there") / no meaningful response.
- 3-4: Limited / vague / touches topic but has zero explanation, reasoning, or personal insight.
- 5-6: Partially satisfactory / relevant but generic or brief (e.g. "it is a good career with many jobs").
- 7-8: Strong / clear personal reasoning, specific examples, thoughtful SEL perspective.
- 9-10: Exceptional / deep reflection, mature empathy or self-regulation with concrete evidence.

Return ONLY a valid JSON object matching this exact structure with no extra text:
{
  "questionId": 1,
  "dimension": "${dim}",
  "selScore": 5,
  "communicationScore": 6,
  "analysis": {
    "questionIntent": "Short description of what the question asks",
    "keyPointsIdentified": ["Point 1 from student words", "Point 2 from student words"],
    "missingOrWeakAspects": ["What depth or reasoning is missing"],
    "depthLevel": "Superficial"
  },
  "strengths": ["Evidence-based strength from what student said"],
  "areasForImprovement": ["Constructive suggestion for growth"],
  "feedback": "2-3 encouraging, specific sentences explaining the evaluation.",
  "speechIndicators": {
    "observation": "Tone and delivery structure observation.",
    "confidenceRelatedIndicator": "Confidence and relevance observation."
  }
}`;

const testCases = [
  {
    name: "Case 1: Generic / Shallow Answer",
    q: 'Why do you want to become a software engineer?',
    dim: 'Self-Awareness',
    ans: 'Software engineering is a good career and there are many jobs.'
  },
  {
    name: "Case 2: Specific / Reasoned Answer",
    q: 'Why do you want to become a software engineer?',
    dim: 'Self-Awareness',
    ans: 'I want to become a software engineer because I enjoy solving problems. During my college projects, I particularly enjoyed building the backend and debugging issues, which made me realize that I want to work in software development.'
  },
  {
    name: "Case 3: Off-Topic / Mic Check",
    q: 'When you receive unexpected constructive criticism on a group project, how do you reflect on your work?',
    dim: 'Self-Awareness',
    ans: 'Am I already there?'
  }
];

async function runTests() {
  for (const tc of testCases) {
    console.log('\n=============================================');
    console.log(tc.name);
    console.log('Question:', tc.q);
    console.log('Student Answer:', `"${tc.ans}"`);
    console.log('=============================================');

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + apiKey.trim(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'qwen/qwen3.6-27b',
          messages: [
            { role: 'system', content: 'You are an SEL evaluator. Output ONLY valid JSON.' },
            { role: 'user', content: makePrompt(tc.q, tc.dim, tc.ans) }
          ],
          response_format: { type: 'json_object' }
        })
      });

      const data = await res.json();
      const content = data.choices[0].message.content;
      const parsed = extractJSON(content);

      console.log('✅ SEL Score:', parsed.selScore, '/ 10');
      console.log('✅ Communication Score:', parsed.communicationScore, '/ 10');
      console.log('Depth Level:', parsed.analysis?.depthLevel);
      console.log('Key Points:', parsed.analysis?.keyPointsIdentified);
      console.log('Missing/Weak Aspects:', parsed.analysis?.missingOrWeakAspects);
      console.log('Strengths:', parsed.strengths);
      console.log('Areas for Improvement:', parsed.areasForImprovement);
      console.log('Feedback:', parsed.feedback);
    } catch (e) {
      console.error('Test Error:', e.message);
    }
  }
}

runTests();
