# Feedback & Status Guidelines

_Orlo Human Interface Guidelines — Multi-Channel Communication, Callouts & Asynchronous Lifecycles_

---

## 1. Feedback Philosophy

In Orlo, feedback is the conversational dialogue between user and application. Following Apple's Human Interface Guidelines on Feedback: **the system should communicate status clearly and promptly, keeping users informed without causing unnecessary distraction or anxiety.**

```
┌────────────────────────────────────────────────────────────────────────┐
│                                                                        │
│   STATUS COMMUNICATION RULES:                                          │
│                                                                        │
│   1. MULTI-CHANNEL           Status is communicated via text, icon,    │
│                              and color simultaneously. Never color     │
│                              alone.                                    │
│                                                                        │
│   2. PROPORTIONATE NOTICE    Low-priority info uses quiet in-page      │
│                              callouts; only critical blocks use modals.│
│                                                                        │
│   3. FIVE LIFECYCLE STATES   Every asynchronous action supports:       │
│                              Idle -> Pending -> Success -> Error ->    │
│                              Recovery.                                 │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Multi-Channel Status Principle

Relying on color alone to indicate status excludes individuals with red-green color vision deficiency (deuteranopia/protanopia), monochromatic vision, or users in bright outdoor lighting.

Orlo enforces a **triple-channel status standard**:
1. **Descriptive Text:** Clear language that explicitly names the status (e.g., "Verification failed: password too short").
2. **Iconographic Glyph:** A recognizable SVG icon (e.g., Checkmark for success, Alert Triangle for warning, Octagon/X for error, Info circle for neutral notes).
3. **Semantic Token Color:** Calibrated tokens (`--orlo-color-success`, `--orlo-color-warning`, `--orlo-color-error`, `--orlo-color-accent`) that frame the message.

---

## 3. Feedback Surface Spectrum

Different situations require different levels of feedback prominence:

| Feedback Surface | Modality | Persistence | Appropriate Context |
|---|---|---|---|
| **Callout Banner** | In-page | Persistent until addressed | Best practice tips, important prerequisites, system warnings |
| **Inline Validation** | In-page | Bound to form field | Form input errors, format requirements, field helper hints |
| **Toast Notice** | Floating | Auto-dismisses (4s – 6s) | Non-critical background completions ("Draft saved", "Link copied") |
| **Modal Alert** | Modal | Explicit user dismissal | Destructive confirmations, critical session expiration |
| **Progress / Shimmer**| In-page | Visible while in-flight | Geometry-preserving loading skeletons, file upload progress |

---

## 4. The Five Asynchronous Lifecycle States

Every asynchronous component in Orlo (e.g. data grids, image fetchers, form submitters) manages five deterministic states:

```
    [ 1. IDLE ]
         │ (User Action)
         ▼
   [ 2. PENDING ] ──────── (Success) ───────► [ 3. SUCCESS ]
         │
         │ (Failure)
         ▼
   [ 4. FAILURE ]
         │ (Retry)
         ▼
   [ 5. RECOVERY ] (Preserves user input, attempts recovery)
```

1. **Idle:** Control is resting, enabled, and ready for user interaction.
2. **Pending (Loading):** Control displays an animated spinner or shimmer, marks `aria-busy="true"`, and temporarily disables duplicate clicks to prevent race conditions.
3. **Success:** Clear visual acknowledgement (e.g. green checkmark badge) confirms the action completed.
4. **Failure (Error):** A human-readable diagnostic message explains exactly what failed and why, avoiding cryptic raw error codes.
5. **Recovery (Retry):** An explicit, actionable "Retry" button is provided. All previously entered form data is strictly preserved so the user never has to re-type their work.

---

## 5. Comparative Do's and Don'ts

| Do | Don't |
|---|---|
| Always pair status colors with an icon glyph and explicit explanatory text. | Turn an input border red with no text explanation of what was wrong. |
| Use non-blocking toast notifications for passive success messages ("File saved"). | Force the user to dismiss a modal dialog for simple confirmation notices. |
| Preserve all user input and form state when an API request fails. | Wipe out form inputs upon a submission failure, forcing users to re-enter data. |
| Clearly explain how to fix an error (e.g. "Password must be at least 8 characters"). | Display vague, unhelpful error text like "Invalid input" or "Error 500". |
| Announce dynamic status updates to screen readers using `aria-live="polite"`. | Update status silently in the DOM without notifying assistive technologies. |
