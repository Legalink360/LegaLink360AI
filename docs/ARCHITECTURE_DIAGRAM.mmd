```mermaid
graph TB
    subgraph Frontend["🎨 FRONTEND LAYER (Next.js)"]
        A["ChatArea Component"] -->|uses| B["useLegalChat Hook"]
        B -->|manages| C["API Requests"]
        A -->|displays| D["Chat Interface"]
        B -->|state management| E["Loading/Error States"]
    end

    subgraph BackendServer["🚀 BACKEND SERVER (Express.js - Port 3001)"]
        F["HTTP Server\nserver.ts"] -->|handles| G["GET /health"]
        F -->|handles| H["POST /api/retrieve"]
        F -->|handles| I["POST /api/query"]
        F -->|handles| J["POST /api/query/stream"]
    end

    subgraph Services["⚙️ SERVICE LAYER"]
        K["RetrievalService"] -->|generates| L["Query Embeddings"]
        K -->|searches| M["Vector Database"]
        K -->|fetches| N["Document Content"]
        
        O["LLMService"] -->|receives| P["Retrieved Documents"]
        O -->|calls| Q["GPT-4-turbo"]
        O -->|returns| R["Generated Answer"]
        O -->|supports| S["Streaming Responses"]
    end

    subgraph DataLayer["💾 DATA LAYER"]
        T["Pinecone\nVector Database"] -->|stores| U["20 Vectors\n3072-dim\nLegal Documents"]
        V["Supabase\nPostgreSQL"] -->|stores| W["Metadata\nUser Profiles\nChat History"]
        X["OpenAI API"] -->|provides| Y["GPT-4-turbo\nAnswer Generation"]
        X -->|provides| Z["Embeddings\ntext-embedding-3-large"]
    end

    subgraph DataContent["📚 LEGAL DATA"]
        AA["Constitutional Law"] -.->|ingested| U
        AB["Criminal Law"] -.->|ingested| U
        AC["Civil Law"] -.->|ingested| U
        AD["Family Law"] -.->|ingested| U
        AE["Labor Law"] -.->|ingested| U
        AF["Corporate Law"] -.->|ingested| U
        AG["Tax Law"] -.->|ingested| U
        AH["Land Law"] -.->|ingested| U
    end

    %% Connections between layers
    C -->|HTTP JSON| F
    H -->|calls| K
    I -->|calls| K
    I -->|calls| O
    J -->|calls| K
    J -->|calls| O
    
    L -->|uses| Z
    M -->|queries| T
    N -->|retrieves from| V
    
    P -->|context for| Q
    Q -->|returns| R
    S -->|streams from| Q

    %% Styling
    classDef frontend fill:#4F46E5,stroke:#4F46E5,color:#fff,stroke-width:2px
    classDef backend fill:#7C3AED,stroke:#7C3AED,color:#fff,stroke-width:2px
    classDef service fill:#EC4899,stroke:#EC4899,color:#fff,stroke-width:2px
    classDef data fill:#14B8A6,stroke:#14B8A6,color:#fff,stroke-width:2px
    classDef legal fill:#F97316,stroke:#F97316,color:#fff,stroke-width:2px

    class Frontend frontend
    class BackendServer backend
    class Services service
    class DataLayer data
    class DataContent legal
```

## Full Architecture as Code

Here's the complete Mermaid code for a comprehensive system architecture diagram. Copy and paste this into [Mermaid Diagram Generator](https://mermaid.live/) to visualize the complete project structure.

### Key Components Shown:

**🎨 Frontend Layer (Next.js)**
- ChatArea Component
- useLegalChat Hook
- API Requests
- Chat Interface
- State Management

**🚀 Backend Server (Express.js)**
- HTTP Server (Port 3001)
- 4 Endpoints (health, retrieve, query, stream)

**⚙️ Service Layer**
- RetrievalService (semantic search)
- LLMService (answer generation)
- Embedding generation
- Vector search
- Document retrieval

**💾 Data Layer**
- Pinecone (vector storage, 20 indexed documents)
- Supabase (metadata and user data)
- OpenAI (models for generation and embeddings)

**📚 Legal Data**
- 8 categories of Uganda law
- 20 ingested document chunks

### How to Use:

1. Go to [Mermaid Live Editor](https://mermaid.live/)
2. Paste the code above
3. Click "Draw" or wait for auto-rendering
4. Export as PNG, SVG, or embed in documentation

### Alternative: Sequence Diagram Version

If you want to show the data flow sequence instead:

```mermaid
sequenceDiagram
    User->>ChatArea: Types Query
    ChatArea->>useLegalChat: queryLegalAI(query)
    useLegalChat->>Backend: HTTP POST /api/query
    Backend->>RetrievalService: semanticSearch(query)
    RetrievalService->>OpenAI: generateEmbedding(query)
    RetrievalService->>Pinecone: search(embedding)
    Pinecone-->>RetrievalService: top-K matches
    RetrievalService->>Supabase: fetchDocuments(IDs)
    Supabase-->>RetrievalService: documents + metadata
    RetrievalService-->>Backend: SearchResult[]
    Backend->>LLMService: generateAnswer(query, documents)
    LLMService->>OpenAI: chat.completions.create()
    OpenAI-->>LLMService: answer text
    LLMService-->>Backend: answer + sources
    Backend-->>useLegalChat: JSON response
    useLegalChat-->>ChatArea: answer + sources
    ChatArea-->>User: displays answer
```

### Alternative: Deployment Architecture

```mermaid
graph LR
    subgraph Cloud["☁️ CLOUD DEPLOYMENT"]
        subgraph CDN["Content Delivery"]
            FE["Vercel/Netlify\nNext.js Frontend\nPort 3000"]
        end
        
        subgraph Compute["Compute"]
            BE["Railway/Heroku\nExpress Backend\nPort 3001"]
        end
        
        subgraph Services["External Services"]
            PI["Pinecone\nVector DB"]
            SB["Supabase\nPostgreSQL"]
            OA["OpenAI\nGPT-4 API"]
        end
    end
    
    User["👤 User Browser"]
    User -->|HTTPS| FE
    FE -->|HTTP API| BE
    BE -->|Vector Search| PI
    BE -->|Metadata| SB
    BE -->|LLM Call| OA
    
    classDef frontend fill:#4F46E5,stroke:#4F46E5,color:#fff
    classDef backend fill:#7C3AED,stroke:#7C3AED,color:#fff
    classDef service fill:#14B8A6,stroke:#14B8A6,color:#fff
    classDef user fill:#F97316,stroke:#F97316,color:#fff
    
    class FE frontend
    class BE backend
    class PI,SB,OA service
    class User user
```

Choose the diagram type that works best for your documentation!
