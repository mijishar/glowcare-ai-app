# Requirements Document

## Introduction

GlowCare AI is a modern, AI-powered web application designed to assist women with personalized skincare advice. Users describe their skin concerns in natural language and receive tailored skincare routines, home remedies, product suggestions, and do's and don'ts. The application features a clean, feminine UI with quick-select options, optional daily tips, and query history.

## Glossary

- **GlowCare_AI**: The web application system described in this document
- **User**: A person using the GlowCare AI application to seek skincare advice
- **AI_Engine**: The backend AI component (powered by an LLM API such as OpenAI) that analyzes skin concerns and generates personalized advice
- **Skin_Profile**: A detected classification of the user's skin type (Dry, Oily, Combination, or Sensitive) derived from the user's input
- **Skincare_Routine**: A structured morning and night sequence of skincare steps recommended by the AI_Engine
- **Quick_Option**: A predefined clickable button representing a common skin concern (e.g., Acne, Tan Removal, Glowing Skin, Dark Circles)
- **Query_History**: A persisted record of previous user inputs and their corresponding AI responses
- **Daily_Tip**: A short, informative skincare tip surfaced to the user on a daily basis
- **Dermatologist_Flag**: A condition detected by the AI_Engine indicating the user's concern may require professional medical attention

---

## Requirements

### Requirement 1: User Input and Query Submission

**User Story:** As a user, I want to describe my skin problems in natural language, so that I can receive personalized skincare advice without needing technical knowledge.

#### Acceptance Criteria

1. THE GlowCare_AI SHALL provide a text input field where the User can type a free-form description of their skin concerns.
2. WHEN the User submits a skin concern query, THE GlowCare_AI SHALL pass the input to the AI_Engine for analysis.
3. WHEN the User submits an empty input, THE GlowCare_AI SHALL display an inline validation message prompting the User to describe their skin concern before submitting.
4. WHILE a query is being processed, THE GlowCare_AI SHALL display a loading indicator to inform the User that a response is being generated.
5. IF the AI_Engine fails to respond within 30 seconds, THEN THE GlowCare_AI SHALL display an error message and allow the User to retry the submission.

---

### Requirement 2: Quick Option Selection

**User Story:** As a user, I want to select from predefined skin concern buttons, so that I can quickly get advice without typing.

#### Acceptance Criteria

1. THE GlowCare_AI SHALL display Quick_Option buttons for at least the following concerns: Acne, Tan Removal, Glowing Skin, and Dark Circles.
2. WHEN the User selects a Quick_Option, THE GlowCare_AI SHALL populate the text input field with the corresponding concern text and submit it to the AI_Engine.
3. WHEN the User selects a Quick_Option, THE GlowCare_AI SHALL visually highlight the selected button to indicate the active selection.

---

### Requirement 3: Skin Type Detection

**User Story:** As a user, I want the app to identify my skin type from my description, so that the advice I receive is relevant to my specific skin profile.

#### Acceptance Criteria

1. WHEN the AI_Engine analyzes a user query, THE AI_Engine SHALL classify the User's skin type as one of: Dry, Oily, Combination, or Sensitive.
2. WHEN a Skin_Profile is determined, THE GlowCare_AI SHALL display the detected skin type to the User alongside the AI response.
3. IF the AI_Engine cannot determine a Skin_Profile from the input, THEN THE GlowCare_AI SHALL display the advice without a skin type label and prompt the User to provide more detail.

---

### Requirement 4: AI-Powered Skincare Advice

**User Story:** As a user, I want to receive structured, personalized skincare advice, so that I know exactly what steps to take for my skin concerns.

#### Acceptance Criteria

1. WHEN the AI_Engine processes a query, THE AI_Engine SHALL return a response that includes all four of the following sections: Recommended Skincare Routine (morning and night), Home Remedies, Product Suggestions, and Do's and Don'ts.
2. THE AI_Engine SHALL generate responses using simple, conversational language free of medical jargon.
3. THE AI_Engine SHALL limit product suggestions to safe, basic, and widely available skincare products.
4. WHEN the AI_Engine detects a Dermatologist_Flag in the user's described concern, THE GlowCare_AI SHALL include a clearly visible advisory message: "This concern may need professional attention — please consult a dermatologist."
5. THE GlowCare_AI SHALL render the AI response in a structured, readable format with clearly labeled sections.

---

### Requirement 5: Responsive and Accessible UI

**User Story:** As a user, I want a clean, mobile-friendly interface, so that I can comfortably use the app on any device.

#### Acceptance Criteria

1. THE GlowCare_AI SHALL render correctly on viewport widths from 320px to 1920px without horizontal scrolling or layout breakage.
2. THE GlowCare_AI SHALL apply a color palette based on soft tones including pink, peach, and beige throughout the interface.
3. THE GlowCare_AI SHALL use a font size of at least 16px for body text to ensure readability on mobile devices.
4. THE GlowCare_AI SHALL provide sufficient color contrast between text and background elements meeting a minimum contrast ratio of 4.5:1 for normal text.
5. THE GlowCare_AI SHALL be navigable using a keyboard alone, with all interactive elements reachable via Tab key and activatable via Enter or Space.

---

### Requirement 6: Daily Skincare Tips

**User Story:** As a user, I want to see a daily skincare tip, so that I can continuously learn and improve my skincare habits.

#### Acceptance Criteria

1. WHERE the Daily Tips feature is enabled, THE GlowCare_AI SHALL display one Daily_Tip on the home screen each day.
2. WHERE the Daily Tips feature is enabled, THE GlowCare_AI SHALL rotate Daily_Tips so that the same tip is not shown on consecutive days.
3. WHERE the Daily Tips feature is enabled, THE GlowCare_AI SHALL source Daily_Tips from a curated set of at least 30 unique tips.

---

### Requirement 7: Query History

**User Story:** As a user, I want to view my previous skin concern queries and responses, so that I can refer back to past advice without re-entering my concerns.

#### Acceptance Criteria

1. WHERE the Query History feature is enabled, THE GlowCare_AI SHALL persist each submitted query and its corresponding AI response in the User's local browser storage.
2. WHERE the Query History feature is enabled, WHEN the User navigates to the history view, THE GlowCare_AI SHALL display a list of previous queries ordered from most recent to oldest.
3. WHERE the Query History feature is enabled, WHEN the User selects a past query from the history list, THE GlowCare_AI SHALL display the full AI response associated with that query.
4. WHERE the Query History feature is enabled, WHEN the User requests to clear history, THE GlowCare_AI SHALL remove all stored Query_History entries and display an empty history state.

---

### Requirement 8: AI API Integration

**User Story:** As a developer, I want the backend to integrate with an LLM API, so that the AI_Engine can generate accurate and contextual skincare advice.

#### Acceptance Criteria

1. THE GlowCare_AI SHALL integrate with an LLM API (such as OpenAI) to power the AI_Engine.
2. WHEN the backend receives a user query, THE GlowCare_AI SHALL construct a prompt that includes the user's input, instructs the AI to identify skin type, and requests the four structured advice sections.
3. IF the LLM API returns an error response, THEN THE GlowCare_AI SHALL log the error server-side and return a user-friendly error message to the frontend.
4. THE GlowCare_AI SHALL not expose the LLM API key in any client-side code or API response.

---

### Requirement 9: Performance

**User Story:** As a user, I want the application to respond quickly, so that I don't have to wait long for skincare advice.

#### Acceptance Criteria

1. THE GlowCare_AI SHALL serve the initial page load within 3 seconds on a standard broadband connection (10 Mbps or faster).
2. WHEN a query is submitted, THE GlowCare_AI SHALL begin streaming or displaying the AI response within 5 seconds of submission under normal network conditions.
