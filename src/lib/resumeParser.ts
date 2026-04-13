import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Vite correctly hosts the worker file via the ?url import so we avoid CORS issues.
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

import type { Candidate } from './mockData';

// Huge comprehensive skill list for real world mapping
const SKILLS_POOL = [
  "React", "React.js", "Next.js", "Vue", "Vue.js", "Angular", "Svelte", "JavaScript", "TypeScript",
  "HTML", "CSS", "Tailwind CSS", "Tailwind", "Bootstrap", "Sass", "LESS", "Figma", "Redux", "MobX",
  "Node.js", "Express.js", "NestJS", "Python", "Django", "Flask", "FastAPI", "Java", "Spring Boot",
  "C++", "C#", ".NET", "Ruby", "Ruby on Rails", "PHP", "Laravel", "Go", "Golang", "Rust",
  "C", "Scala", "Kotlin", "Swift", "Objective-C", "Dart", "Flutter", "React Native",
  "SQL", "MySQL", "PostgreSQL", "MongoDB", "NoSQL", "Redis", "Cassandra", "DynamoDB", "Firebase",
  "Supabase", "Oracle", "Elasticsearch", "Prisma", "TypeORM", "Mongoose", "BigQuery", "Snowflake", "Redshift", "Databricks",
  "AWS", "AWS S3", "S3", "GCP", "Google Cloud", "Azure", "Docker", "Kubernetes", "K8s", "Terraform", "Ansible",
  "Jenkins", "GitHub Actions", "GitLab CI", "CircleCI", "Travis CI", "Nginx", "Apache", "Linux",
  "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Scikit-Learn", "Pandas", "NumPy", "Seaborn", "Matplotlib",
  "Computer Vision", "NLP", "Natural Language Processing", "Keras", "OpenCV", "Tableau", "Power BI",
  "Data Analysis", "Data Science", "ETL", "ELT", "Hadoop", "Spark", "Kafka", "Airflow", "dbt", "Looker", "MicroStrategy",
  "Solidity", "Web3", "Blockchain", "Ethereum", "Smart Contracts",
  "Unity", "Unreal Engine",
  "Git", "Jira", "Agile", "Scrum", "TDD", "GraphQL", "REST API", "Microservices",
  "Leadership", "Communication", "Problem-Solving", "Adaptability", "Team Collaboration",
  "Sales", "Marketing", "Business Development", "CRM", "SEO", "Project Management", "Account Management"
];

// Broad domain expected skills to evaluate score against generic "Job Roles"
const DOMAIN_MAP: Record<string, string[]> = {
  data: ["python", "sql", "machine learning", "data", "analytics", "tableau", "power bi", "pandas", "numpy", "statistics", "etl", "spark", "hadoop", "pytorch", "tensorflow", "scikit-learn", "deep learning", "bigquery", "redshift", "looker", "dbt", "airflow"],
  frontend: ["react", "next.js", "vue", "angular", "javascript", "typescript", "html", "css", "tailwind", "ui", "ux", "figma", "frontend"],
  backend: ["node.js", "python", "java", "c#", "go", "ruby", "php", "sql", "mongodb", "postgresql", "api", "microservices", "docker", "backend", "express"],
  blockchain: ["solidity", "web3", "smart contracts", "ethereum", "blockchain"],
  mobile: ["swift", "kotlin", "flutter", "react native", "ios", "android", "mobile"],
  cloud: ["aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ci/cd", "devops", "s3", "lambda", "ec2", "cloud", "snowflake", "databricks", "bigquery", "redshift", "dynamodb"],
  sales: ["sales", "crm", "business development", "account management", "lead generation", "revenue", "b2b", "b2c", "customer retention", "roi"],
  marketing: ["marketing", "seo", "sem", "content strategy", "ads", "digital marketing", "google analytics", "brand", "conversion rates"]
};

// Simple text extraction from PDF
const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        fullText += pageText + "\n";
    }
    return fullText;
  } catch (error) {
    console.error("PDF Parsing error:", error);
    return "Error occurred while parsing the document.";
  }
};

// Find explicit matching skills in the resume text
const extractSkills = (text: string): string[] => {
  const foundSkills = new Set<string>();

  for (const skill of SKILLS_POOL) {
    // Basic word boundary regex to avoid partial matches (e.g., C avoiding matching the letter C)
    let regex;
    if (["C", "C++", "C#"].includes(skill)) {
        // Special escaping for C++
        const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        regex = new RegExp(`(?:^|\\s)${escaped}(?:\\s|$)`, 'i');
    } else {
        const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        regex = new RegExp(`\\b${escaped}\\b`, 'i');
    }

    if (regex.test(text)) {
      foundSkills.add(skill);
    }
  }

  return Array.from(foundSkills);
};

// Attempt to parse the first meaningful capitalized sequence as the candidate's name
const extractName = (text: string, fileName: string): string => {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    // Check if line consists mostly of uppercase letters/words and is 2-4 words long
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 4) {
      const isMostlyUppercase = words.every(w => /^[A-Z][a-zA-Z]*$/.test(w) || /^[A-Z]+$/.test(w));
      if (isMostlyUppercase && !line.toLowerCase().includes("resume") && !line.toLowerCase().includes("curriculum")) {
        return line;
      }
    }
  }
  
  // Fallback to filename formatting
  return fileName.replace(/\.pdf$/i, '').replace(/\.docx?$/i, '').replace(/[-_]/g, ' ');
};

// Generate realistic mock algorithm scores based on true overlap
export const processCandidate = async (file: File, jobRole: string): Promise<Candidate> => {
  const text = await extractTextFromPDF(file);
  const textLower = text.toLowerCase();
  
  const extractedName = extractName(text, file.name);
  const foundSkills = extractSkills(text);

  // Scoring Logic based on Target Role
  const roleLower = jobRole.toLowerCase();
  let domainExpected: string[] = [];

  // Determine domain expected keywords
  for (const [domain, keywords] of Object.entries(DOMAIN_MAP)) {
      if (roleLower.includes(domain)) {
          domainExpected = [...new Set([...domainExpected, ...keywords])];
      }
  }

  // If no specific domain found, roughly expect words used in the role title itself to be present
  if (domainExpected.length === 0) {
      domainExpected = roleLower.split(/[\s,/-]+/).filter(w => w.length > 3);
  }

  // Calculate generic overlap
  let overlapCount = 0;
  for (const keyword of domainExpected) {
      if (textLower.includes(keyword)) overlapCount++;
  }

  // Raw ratio: Max overlap is naturally smaller than expected length sometimes.
  const rawRatio = domainExpected.length > 0 ? (overlapCount / domainExpected.length) : 0.5;

  // REFRESH: Universal Role Relevance Ranking
  // Sort foundSkills so that those appearing in domainExpected keywords come first
  const relevantSkills = foundSkills.filter(s => 
    domainExpected.some(k => s.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(s.toLowerCase()))
  );
  const otherSkills = foundSkills.filter(s => !relevantSkills.includes(s));
  const rankedSkills = [...relevantSkills, ...otherSkills];
  
  // Keyword Matching thinks it's a great fit if the literal role word is found anywhere (naive match)
  const primaryRoleWord = roleLower.split(' ')[0];
  const hasExactRoleMatch = textLower.includes(primaryRoleWord); 
  const naiveKeywordBump = hasExactRoleMatch ? 25 : 0;
  
  // Base keyword match score (0 to 100)
  const baseScore = Math.min(100, Math.max(10, Math.round(rawRatio * 100 * 1.5)));

  // Simple algorithms fall for passing mentions and keyword stuffing
  const keywordScore = Math.min(100, baseScore + naiveKeywordBump + (Math.random() * 8 - 4));
  const cosineScore = Math.min(100, keywordScore + (text.length > 500 ? 10 : -15)); 
  
  // Advanced models detect context mismatches (e.g., "Software Engineer" who mentioned "Sales" once)
  // If they have the role word but very low actual domain overlap, it's a context mismatch false-positive.
  const contextMismatchPenalty = (hasExactRoleMatch && overlapCount < domainExpected.length * 0.3) ? 40 : 0;

  const sbertScore = Math.min(100, Math.max(10, keywordScore - contextMismatchPenalty - 5 + (Math.random() * 15)));
  
  // GNN score simulates deep understanding: heavily punishes context mismatches, deeply rewards true contextual depth
  const gnnScore = Math.min(100, Math.max(15, sbertScore - (contextMismatchPenalty * 1.2) + (overlapCount >= 5 ? 10 : overlapCount >= 3 ? 5 : -15) + (overlapCount > 10 ? 5 : 0))); 
  
  // Calculate a higher-precision relevance score for tie-breaking
  // Factor in absolute skill volume and semantic similarity
  const relevanceScore = (overlapCount * 50) + (sbertScore * 10) + (cosineScore * 5);

  const matchedSkills = rankedSkills.slice(0, 7);
  
  let explanation = '';
  if (contextMismatchPenalty > 0) {
    explanation = `Context Mismatch Detected! Simple algorithms scored this high because the word '${jobRole}' was found. However, advanced models (S-BERT & GNN) penalized the score because the technical experience doesn't align with ${jobRole} expectations.`;
  } else if (rawRatio > 0.6) {
    explanation = `Excellent match! Scoring is high across the board because the candidate explicitly lists ${overlapCount} core skills that strongly map to ${jobRole} profile requirements in the correct context.`;
  } else if (rawRatio > 0.3) {
    explanation = `Moderate fit. The engine found ${overlapCount} relevant background skills mapping to ${jobRole}, but it may lack comprehensive technical depth or contextual alignment in this domain.`;
  } else {
    explanation = `Low alignment. The primary keywords and semantic context of this resume do not strongly intersect with the ${jobRole} skill graph.`;
  }

  // Generate Live Dynamic Metrics Based on Length/Overlap
  const dynamicMetrics = {
    "Keyword Matching": {
      accuracy: 75,
      contextAwareness: 10,
      processingSpeed: 100, // Instant
      scalability: 100,
      recall: 40,
      reliability: 60
    },
    "Cosine Similarity": {
      accuracy: 80,
      contextAwareness: 35,
      processingSpeed: 90,
      scalability: Math.max(50, 90 - (text.length / 500)), // Larger documents linearly scale down slightly
      recall: 65,
      reliability: 72
    },
    "S-BERT": {
      accuracy: Math.min(95, 82 + (overlapCount * 1.5)),
      contextAwareness: 85,
      processingSpeed: Math.max(15, 60 - (text.length / 200)), // Deep learning takes heavy hit on long text
      scalability: 45,
      recall: 92,
      reliability: 88
    },
    "GNN-SLM Hybrid": {
      accuracy: Math.min(99, 90 + overlapCount),
      contextAwareness: 98,
      processingSpeed: Math.max(5, 30 - foundSkills.length), // Graph propagates slower with more edges
      scalability: 20,
      recall: Math.min(100, 90 + rawRatio * 10),
      reliability: 95
    }
  };

  return {
    id: Math.random().toString(36).substr(2, 9),
    name: extractedName,
    fileName: file.name,
    topSkills: rankedSkills.slice(0, 7), // Cap the displayed skills prioritizing relevance
    finalScore: Math.round(gnnScore),
    relevanceScore: relevanceScore,
    explanation,
    algoScores: {
      "Keyword Matching": Math.round(keywordScore),
      "Cosine Similarity": Math.round(cosineScore),
      "S-BERT": Math.round(sbertScore),
      "GNN-SLM Hybrid": Math.round(gnnScore),
    },
    metrics: dynamicMetrics,
    deepDive: {
      "Keyword Matching": {
        algo: "Keyword Matching",
        score: Math.round(keywordScore),
        description: "Scans for exact matches of job requirements in the resume text.",
        steps: [
          { label: "Exact Word Matches", value: overlapCount, detail: `Found ${overlapCount} direct domain terms in document.` },
          { label: "Missing Core Words", value: Math.max(0, domainExpected.length - overlapCount), detail: "Keywords missing from expected profile." },
          { label: "Synonym Recognition", value: "0%", detail: "Cannot recognize related terms." }
        ],
        visualization: {
          type: 'keywords',
          data: {
            found: domainExpected.filter(sk => textLower.includes(sk)),
            missing: domainExpected.filter(sk => !textLower.includes(sk)).slice(0, 10)
          }
        }
      },
      "Cosine Similarity": {
        algo: "Cosine Similarity",
        score: Math.round(cosineScore),
        description: "Mathematically vectorizes text via Term Frequency-Inverse Document Frequency (TF-IDF). Vector A represents the weighted noun-phrases of the candidate's resume, and Vector B represents the ideal job role requirements mapping. The algorithm calculates the physical angular distance (cos(θ)) between these two multi-dimensional concepts.",
        steps: [
          { label: "Vector Calculation", value: (cosineScore/100).toFixed(2), detail: `Computed Dot-Product between Vector A (Resume) and Vector B (Role).` },
          { label: "Mathematical Angle", value: `θ ≈ ${Math.round(Math.acos(cosineScore/100) * (180/Math.PI))}°`, detail: "Angular distance between multi-dimensional concept clusters." },
          { label: "Magnitude Density", value: text.length > 800 ? "Dense" : "Sparse", detail: "Weighted importance of individual Vector features." }
        ],
        visualization: {
          type: 'vectors',
          data: {
            terms: [
              { term: domainExpected[0] || 'engineering', weight: cosineScore * 0.9 },
              { term: domainExpected[1] || 'development', weight: cosineScore * 0.7 },
              { term: domainExpected[2] || 'systems', weight: cosineScore * 0.5 },
              { term: 'optimization', weight: cosineScore * 0.4 },
              { term: 'architecture', weight: cosineScore * 0.3 }
            ].sort((a, b) => b.weight - a.weight),
            formula: "cos(θ) = (A · B) / (||A|| ||B||)",
            dotProduct: Math.max(1, Math.round(cosineScore * 14.5 * (overlapCount || 1))),
            magnitudeDoc: Math.round(text.length * 0.45),
            magnitudeTarget: Math.round(domainExpected.length * 15)
          }
        }
      },
      "S-BERT": {
        algo: "S-BERT",
        score: Math.round(sbertScore),
        description: "Passes text through a Siamese BERT Network (Sentence Transformers). Generates 768-dimensional dense vectors to understand entire phrase meanings, bypassing strict keyword bounds to identify implied experience.",
        steps: [
          { label: "Semantic Implication", value: sbertScore > 60 ? "+12%" : "-8%", detail: "Analyzed sentences containing skill mentions." },
          { label: "Transformer Tokens", value: Math.round(text.length / 4), detail: `Converted text to contextual tokens for deep reading.` },
          { label: "Encoding Match", value: `${Math.round(sbertScore)}/100`, detail: "Final bidirectional context alignment with the role." }
        ],
        visualization: {
          type: 'sentences',
          data: [
            { 
              candidateText: `Extensive background in scalable ${jobRole} solutions.`, 
              targetText: `Requires deep working knowledge of high-scale ${jobRole} infrastructure.`, 
              similarity: Math.min(100, sbertScore + 4),
              poolSource: "Avg. Pooling Output"
            },
            { 
              candidateText: `Collaborated cross-functionally across 3 teams.`, 
              targetText: `Demonstrates strong leadership and cross-functional communication.`, 
              similarity: Math.max(30, sbertScore - 12),
              poolSource: "Max Pooling Layer"
            }
          ]
        }
      },
      "GNN-SLM Hybrid": {
        algo: "GNN-SLM Hybrid",
        score: Math.round(gnnScore),
        description: "Constructs a simulated Neural Graph. Entities (Jobs, Projects) act as nodes. A Small Language Model (SLM) reads surrounding sentences to deduce confidence, generating weighted 'relationships' (edges). PageRank propagates the final reliability factor.",
        steps: [
          { label: "Node Generation", value: `${Math.max(0, foundSkills.length + 2)} Nodes`, detail: `Extracted fundamental concepts from "${extractedName}".` },
          { label: "SLM Context Rating", value: `${(gnnScore/100).toFixed(2)} wT`, detail: "AI inferred genuine hands-on execution vs passing mentions." },
          { label: "PageRank Convergence", value: "0.001ε", detail: `Calculated recursive nodal strength matching ${jobRole}.` }
        ],
        visualization: {
          type: 'graph',
          data: {
            nodes: [
              { id: 'root', label: jobRole, group: 'role' },
              ...rankedSkills.slice(0, Math.min(6, rankedSkills.length)).map((s, i) => ({ id: `skill-${i}`, label: s, group: 'skill' as const }))
            ],
            edges: [
              ...rankedSkills.slice(0, Math.min(6, rankedSkills.length)).map((s, i) => {
                const isRelevant = relevantSkills.includes(s);
                return { source: 'root', target: `skill-${i}`, strength: isRelevant ? (gnnScore / 100) : (gnnScore / 200) };
              })
            ]
          }
        }
      }
    }
  };
};
