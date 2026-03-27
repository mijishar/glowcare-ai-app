W2# Tasks

## Task List

- [x] 1. Project Setup and Configuration
  - [x] 1.1 Initialize React + TypeScript frontend with Vite and Tailwind CSS
  - [x] 1.2 Initialize Node.js + Express + TypeScript backend
  - [x] 1.3 Configure environment variables for LLM API key (server-side only)
  - [x] 1.4 Set up shared TypeScript types in `src/types/index.ts`
  - [x] 1.5 Install fast-check for property-based testing

- [x] 2. Backend: LLM Integration and API Route
  - [x] 2.1 Implement `server/services/llm.ts` — prompt builder and OpenAI API client
  - [x] 2.2 Implement `server/services/parser.ts` — parse and validate LLM JSON response into `AdviceResponse`
  - [x] 2.3 Implement `POST /api/query` route in `server/routes/query.ts`
  - [x] 2.4 Implement global error handler middleware in `server/middleware/errorHandler.ts`
  - [x] 2.5 Wire up Express app in `server/index.ts` with 30-second timeout

- [x] 3. Frontend: Core Query Flow
  - [x] 3.1 Implement `QueryInput.tsx` — text input with submit button and empty-input validation
  - [x] 3.2 Implement `QuickOptions.tsx` — quick-select buttons with active highlight state
  - [x] 3.3 Implement `LoadingSpinner.tsx` — loading indicator shown during API call
  - [x] 3.4 Implement `services/api.ts` — fetch wrapper for `POST /api/query` with timeout handling
  - [x] 3.5 Wire up `Home.tsx` page — connects QueryInput, QuickOptions, LoadingSpinner, and AdviceCard

- [x] 4. Frontend: Advice Rendering
  - [x] 4.1 Implement `SkinTypeTag.tsx` — displays detected skin type badge (hidden when null)
  - [x] 4.2 Implement `DermatologistAlert.tsx` — advisory banner shown when `dermatologistFlag` is true
  - [x] 4.3 Implement `AdviceCard.tsx` — renders all four advice sections with labeled headings

- [x] 5. Frontend: Daily Tips
  - [x] 5.1 Create curated tips array with at least 30 unique tips
  - [x] 5.2 Implement `hooks/useDailyTip.ts` — daily tip rotation using localStorage date tracking
  - [x] 5.3 Implement `DailyTip.tsx` — displays the current daily tip

- [x] 6. Frontend: Query History
  - [x] 6.1 Implement `hooks/useQueryHistory.ts` — localStorage read/write for `QueryHistoryEntry[]`
  - [x] 6.2 Implement `HistoryItem.tsx` — single history entry display
  - [x] 6.3 Implement `HistoryList.tsx` — ordered list of history entries with clear-all action
  - [x] 6.4 Implement `History.tsx` page — history view with empty state

- [x] 7. Styling and Responsive UI
  - [x] 7.1 Apply pink/peach/beige color palette via Tailwind config
  - [x] 7.2 Ensure body text is at least 16px and color contrast meets 4.5:1 ratio
  - [x] 7.3 Verify layout renders correctly from 320px to 1920px viewport widths
  - [x] 7.4 Ensure all interactive elements are keyboard-navigable (Tab + Enter/Space)

- [x] 8. Property-Based Tests
  - [x] 8.1 Write property test for P1: empty/whitespace input rejected (no API call)
  - [x] 8.2 Write property test for P2: loading state shows spinner
  - [x] 8.3 Write property test for P3: query submission passes input to API
  - [x] 8.4 Write property test for P4: quick option populates input and submits
  - [x] 8.5 Write property test for P5: quick option selection highlights only selected button
  - [x] 8.6 Write property test for P6: parsed skinType is always a valid enum value or null
  - [x] 8.7 Write property test for P7: skin type badge renders iff skinType is non-null
  - [x] 8.8 Write property test for P8: all four advice sections present in parsed response
  - [x] 8.9 Write property test for P9: dermatologist flag triggers advisory message
  - [x] 8.10 Write property test for P10: rendered advice contains all four labeled section headings
  - [x] 8.11 Write property test for P11: daily tips do not repeat on consecutive days
  - [x] 8.12 Write property test for P12: query history save/load round trip
  - [x] 8.13 Write property test for P13: history list is ordered newest first
  - [x] 8.14 Write property test for P14: selecting history entry displays its response
  - [x] 8.15 Write property test for P15: clear history results in empty state
  - [x] 8.16 Write property test for P16: prompt contains user input and required instructions
  - [x] 8.17 Write property test for P17: LLM API errors return user-friendly messages

- [x] 9. Unit Tests
  - [x] 9.1 Write unit tests for AdviceCard with known fixture data
  - [x] 9.2 Write unit tests for QuickOptions rendering and interaction
  - [x] 9.3 Write unit tests for HistoryList with empty and populated states
  - [x] 9.4 Write unit tests for DailyTip with mocked localStorage
  - [x] 9.5 Write unit tests for error states (API error, timeout, malformed JSON)
