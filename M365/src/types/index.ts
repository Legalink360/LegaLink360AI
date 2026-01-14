// TypeScript type definitions for the Office Add-in

export interface DocumentAnalysisRequest {
  document_content: string;
  document_title?: string;
  analysis_type?: 'full' | 'summary' | 'risks' | 'clauses';
  options?: {
    include_citations?: boolean;
    risk_scoring?: boolean;
    compare_with_template?: boolean;
  };
}

export interface DocumentAnalysisResponse {
  analysis_id: string;
  summary: string;
  key_sections: Array<{
    title: string;
    content: string;
    page_number?: number;
  }>;
  identified_risks: Array<{
    severity: 'high' | 'medium' | 'low';
    category: string;
    description: string;
    location: string;
    recommendation?: string;
  }>;
  recommendations: string[];
  processing_time_ms: number;
}

export interface LegalQuestionRequest {
  question: string;
  document_context?: string;
  document_title?: string;
  jurisdiction?: string;
}

export interface LegalQuestionResponse {
  answer_id: string;
  answer: string;
  citations?: Array<{
    source: string;
    citation: string;
    quote?: string;
  }>;
  confidence_score?: number;
  processing_time_ms: number;
}


