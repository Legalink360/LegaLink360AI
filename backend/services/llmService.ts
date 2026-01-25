import { OpenAI } from 'openai';
import { SearchResult } from './retrievalService';

export class LLMService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
  }

  /**
   * Generate disclaimer text for all responses
   */
  private getDisclaimer(): string {
    return `

---

⚖️ **DISCLAIMER**

This response is based on available legal documents and is provided for informational purposes only. It does not constitute legal advice. Every legal situation is unique and requires professional evaluation.

**Would you like to speak with a qualified lawyer?** 
Visit **www.legalink360.com** to connect with our legal professionals who can provide personalized guidance, expert advice, and further support for your specific legal needs.

**Need More Help?** Our team of experienced lawyers is ready to assist you. Visit **legalink360.com** today!

---`;
  }

  /**
   * Generate answer using retrieved documents and GPT-4
   */
  async generateAnswer(
    query: string,
    documents: SearchResult[]
  ): Promise<string> {
    // Build context from documents
    const separator = '─'.repeat(70);
    const context = documents
      .map(
        (doc, i) =>
          `[Source ${i + 1}] ${doc.title} (Category: ${doc.category}, Relevance: ${(doc.relevanceScore * 100).toFixed(1)}%)\n\n${doc.content}`
      )
      .join(`\n\n${separator}\n\n`);

    const systemPrompt = `You are a knowledgeable legal assistant specialized in Uganda law.
You have access to official Uganda legal documents and statutes.
Your role is to answer legal questions accurately based ONLY on the provided documents.
Always cite your sources using [Source X] notation.
If information is not available in the provided documents, clearly state that the information is not available.
Be precise, professional, concise, and helpful.
Format your answer with clear sections and proper legal terminology.`;

    const userPrompt = `Based on these legal documents, answer the following legal question:

QUESTION: ${query}

SUPPORTING DOCUMENTS:
${context}

Please provide a comprehensive answer citing the relevant sources using [Source X] notation.`;

    try {
      console.log('[LLM] Generating answer with GPT-4-turbo...');
      const startTime = Date.now();

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      });

      const elapsed = Date.now() - startTime;
      console.log(`   ✓ Answer generated in ${elapsed}ms`);
      console.log(`   ✓ Tokens used: ${response.usage?.total_tokens}\n`);

      const answer = response.choices[0].message.content || 'No response generated';
      return answer + this.getDisclaimer();
    } catch (error: any) {
      throw new Error(`LLM generation failed: ${error.message}`);
    }
  }

  /**
   * Stream answer for real-time display
   */
  async *generateAnswerStream(
    query: string,
    documents: SearchResult[]
  ): AsyncGenerator<string, void, unknown> {
    const context = documents
      .map(
        (doc, i) =>
          `[Source ${i + 1}] ${doc.title}\n${doc.content}`
      )
      .join('\n\n---\n\n');

    const systemPrompt = `You are a knowledgeable legal assistant for Uganda law.
Answer questions based ONLY on provided documents.
Always cite sources using [Source X].
Be professional and accurate.`;

    const userPrompt = `Question: ${query}\n\nDocuments:\n${context}\n\nProvide detailed answer with citations.`;

    try {
      console.log('[LLM-STREAM] Generating answer stream...');
      const stream = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 2000,
        temperature: 0.7,
        stream: true,
      });

      for await (const chunk of stream) {
        if (chunk.choices[0].delta?.content) {
          yield chunk.choices[0].delta.content;
        }
      }

      // Yield disclaimer at the end of stream
      yield this.getDisclaimer();

      console.log('   ✓ Stream completed\n');
    } catch (error: any) {
      throw new Error(`Stream generation failed: ${error.message}`);
    }
  }
}
