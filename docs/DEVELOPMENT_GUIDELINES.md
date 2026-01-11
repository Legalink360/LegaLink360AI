# LegaLink360 Development Guidelines & Standards

**Version**: 1.0.0  
**Last Updated**: January 11, 2026  
**Status**: Active

---

## Overview

This document provides development guidelines, coding standards, and best practices for building LegaLink360 products and services.

---

## Code Quality Standards

### TypeScript Guidelines
- Use strict mode: `"strict": true` in tsconfig.json
- Define types for all functions and variables
- Avoid `any` type - use `unknown` or proper typing
- Use interfaces for object shapes
- Leverage discriminated unions for complex state

### Component Structure
```typescript
// Imports
import React, { useState, useCallback } from 'react';

// Types
interface ComponentProps {
  title: string;
  onSubmit?: (data: any) => void;
}

// Component
export const Component: React.FC<ComponentProps> = ({ title, onSubmit }) => {
  // State
  const [state, setState] = useState('');
  
  // Effects
  useEffect(() => {
    // initialization
  }, []);
  
  // Handlers
  const handleChange = useCallback((value: string) => {
    setState(value);
  }, []);
  
  // Render
  return (
    <div>
      <h1>{title}</h1>
      {/* JSX content */}
    </div>
  );
};

export default Component;
```

### Naming Conventions
- Components: PascalCase (e.g., `ChatKitPanel.tsx`)
- Functions: camelCase (e.g., `handleSubmit()`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- Files: Match component name or use descriptive camelCase
- Hooks: Start with `use` (e.g., `useColorScheme`)

---

## File Organization

### Component File Structure
```
components/
├── Button.tsx              # Single component
├── Form/
│   ├── Form.tsx           # Main component
│   ├── Form.types.ts      # Type definitions
│   ├── Form.styles.ts     # Styles (if using CSS-in-JS)
│   └── index.ts           # Barrel export
└── index.ts               # Root exports
```

### API Routes
```
app/api/
├── create-session/
│   └── route.ts           # POST /api/create-session
├── users/
│   ├── route.ts           # GET/POST /api/users
│   └── [id]/
│       └── route.ts       # GET/PUT/DELETE /api/users/[id]
```

---

## Styling & Theming

### CSS Classes
- Use descriptive names: `.chat-input`, `.error-message`
- Follow BEM convention for complex components
- Prefix with module context: `.chatkit-panel__message`
- Avoid deeply nested selectors (max 3 levels)

### Theme System
```typescript
// lib/config.ts
export const THEME = {
  colors: {
    primary: '#1a73e8',
    secondary: '#34a853',
    error: '#d33b27',
    background: '#ffffff',
    text: '#202124',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  typography: {
    fontSize: {
      sm: '12px',
      base: '14px',
      lg: '16px',
      xl: '20px',
    },
  },
};
```

---

## API Integration Patterns

### OpenAI ChatKit Integration
```typescript
// Initialize session
async function createSession(workflowId: string) {
  const response = await fetch('/api/create-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workflow_id: workflowId }),
  });
  
  if (!response.ok) throw new Error('Failed to create session');
  return response.json();
}

// Error handling
try {
  const session = await createSession(workflowId);
} catch (error) {
  console.error('Session creation failed:', error);
  // Show user-friendly error
}
```

---

## State Management

### React Hooks Pattern
```typescript
// Simple state
const [input, setInput] = useState('');

// Derived state
const isDisabled = input.trim().length === 0;

// Complex state
const [state, dispatch] = useReducer(reducer, initialState);

// Effects
useEffect(() => {
  // Setup
  return () => {
    // Cleanup
  };
}, [dependency]);

// Custom hooks
const useCustomLogic = () => {
  // Custom hook logic
  return { value, setValue };
};
```

---

## Error Handling & Logging

### Error Handling Pattern
```typescript
// Explicit error types
interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

// Error handling
async function apiCall() {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new ApiError(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    // Re-throw or handle gracefully
    throw error;
  }
}
```

### Logging Standards
```typescript
// Log levels: error, warn, info, debug
console.error('Critical issue:', error); // Errors
console.warn('Potential issue:', warning); // Warnings
console.log('Info:', data); // General info
// Remove debug logs before production
```

---

## Testing & QA

### Unit Testing Structure
```typescript
describe('Component Name', () => {
  it('should render correctly', () => {
    // Arrange
    const props = { /* test props */ };
    
    // Act
    render(<Component {...props} />);
    
    // Assert
    expect(screen.getByText('text')).toBeInTheDocument();
  });
});
```

### Pre-Commit Checklist
- [ ] Code passes linting: `npm run lint`
- [ ] No console errors/warnings
- [ ] TypeScript compilation successful
- [ ] All imports resolved
- [ ] Component props documented
- [ ] Error cases handled

---

## Git & Version Control

### Commit Message Format
```
type(scope): subject

body

footer
```

**Types**: feat, fix, docs, style, refactor, perf, test, chore  
**Scope**: Component or feature name  
**Subject**: Concise description (imperative mood)

### Examples
```
feat(chat): add message search functionality
fix(api): handle network timeout errors
docs(readme): update installation instructions
refactor(components): extract shared logic
```

### Branch Naming
- Feature: `feature/user-authentication`
- Bug fix: `bugfix/session-timeout`
- Documentation: `docs/api-reference`

---

## Security Best Practices

### API Keys & Secrets
- Never commit `.env.local` or sensitive files
- Use `.env.example` for template
- Rotate API keys regularly
- Use environment-specific keys

### Input Validation
```typescript
// Always validate user input
function processUserInput(input: string): string {
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid input');
  }
  return input.trim().slice(0, 1000); // Limit length
}
```

### HTTPS & CORS
- Always use HTTPS in production
- Configure CORS properly
- Use secure cookies (HttpOnly, Secure, SameSite)

---

## Performance Optimization

### Code Splitting
```typescript
// Use dynamic imports for large components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />,
});
```

### Memoization
```typescript
// Memoize expensive computations
const memoizedValue = useMemo(() => {
  return expensiveCalculation(a, b);
}, [a, b]);

// Memoize callbacks
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

### Image Optimization
```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image 
  src="/image.png" 
  alt="Description"
  width={100}
  height={100}
/>
```

---

## Documentation Standards

### Function Documentation
```typescript
/**
 * Creates a new chat session with OpenAI
 * @param workflowId - The Agent Builder workflow ID
 * @returns Promise<SessionData> - Session configuration
 * @throws ApiError if session creation fails
 * @example
 * const session = await createSession('wf_123');
 */
async function createSession(workflowId: string): Promise<SessionData> {
  // implementation
}
```

### README Requirements
- Project description and purpose
- Setup and installation instructions
- Configuration guide
- API documentation
- Deployment instructions
- Contributing guidelines

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] No linting errors
- [ ] Build succeeds: `npm run build`
- [ ] Environment variables configured
- [ ] API keys rotated if needed
- [ ] Documentation updated

### Production Verification
- [ ] Domain added to OpenAI allowlist
- [ ] SSL certificate valid
- [ ] Monitoring enabled
- [ ] Error tracking configured
- [ ] Analytics integrated
- [ ] Performance monitoring active

---

## Continuous Improvement

### Code Review Process
1. Self-review before requesting review
2. Ensure all tests pass
3. No linting violations
4. Clear commit history
5. Comprehensive PR description

### Regular Maintenance
- Update dependencies monthly
- Review and fix security vulnerabilities
- Optimize performance bottlenecks
- Refactor technical debt
- Update documentation

---

## Tools & Resources

### Development Tools
- **Package Manager**: npm
- **Language**: TypeScript
- **Framework**: Next.js
- **UI Library**: React
- **Linter**: ESLint
- **Editor**: VS Code (recommended)

### Browser DevTools
- Chrome/Firefox DevTools
- React DevTools extension
- OpenAI API reference
- Network tab for API debugging

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)

---

## Common Patterns & Recipes

### Async Data Loading
```typescript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<Error | null>(null);

useEffect(() => {
  const load = async () => {
    setLoading(true);
    try {
      const result = await fetchData();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };
  
  load();
}, []);
```

### Conditional Rendering
```typescript
// Good patterns
{loading && <Spinner />}
{error && <ErrorMessage error={error} />}
{data && <DataDisplay data={data} />}

// Avoid
{data ? <DataDisplay /> : null}
{!error && <Content />}
```

---

## Support & Questions

For questions about development standards:
- Check existing code patterns
- Review this guideline document
- Consult team members
- Update this document as standards evolve

---

**This document is a living reference. Update it as development practices and standards evolve.**
