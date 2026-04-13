export type AlgorithmName = 'GNN-SLM Hybrid' | 'S-BERT' | 'Cosine Similarity' | 'Keyword Matching';

export interface AlgorithmMetrics {
  accuracy: number;
  contextAwareness: number;
  processingSpeed: number; // latency or processing score
  scalability: number;
  recall: number;
}

export type VisualizationData = 
  | { type: 'keywords'; data: { found: string[]; missing: string[] } }
  | { type: 'vectors'; data: { terms: { term: string; weight: number }[]; formula: string; dotProduct: number; magnitudeDoc: number; magnitudeTarget: number } }
  | { type: 'sentences'; data: { candidateText: string; targetText: string; similarity: number; poolSource: string }[] }
  | { type: 'graph'; data: { nodes: { id: string; label: string; group: 'role' | 'skill' | 'core' }[]; edges: { source: string; target: string; strength: number }[] } };

export interface DeepDiveDetails {
  algo: AlgorithmName;
  score: number;
  description: string;
  steps: { label: string; value: string | number; detail: string }[];
  visualization: VisualizationData;
}

export interface Candidate {
  id: string;
  name: string;
  fileName: string;
  topSkills: string[];
  finalScore: number;
  algoScores: Record<AlgorithmName, number>;
  metrics: Record<AlgorithmName, AlgorithmMetrics>;
  explanation: string;
  relevanceScore: number;
  deepDive: Record<AlgorithmName, DeepDiveDetails>;
}

