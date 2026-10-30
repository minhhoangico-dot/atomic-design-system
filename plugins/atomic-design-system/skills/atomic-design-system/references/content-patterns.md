# Content and patterns

Read this when writing UI copy, building forms, or designing flows — especially in healthcare or for older or less confident users. Words are part of the design system: components carry default strings, and patterns carry rules for the words around them. Sources: NHS digital service manual, VA.gov and CMS design systems, GOV.UK.

## Contents
1. Voice and plain language
2. Error messages
3. Form patterns
4. Specific inputs: names, dates, phone numbers, addresses
5. Healthcare patterns
6. Numbers, dates and time in copy

---

## 1. Voice and plain language

- Calm, reassuring, respectful, never patronizing. Address the reader as "you"; the organization as "we".
- Target a reading age of 9–11 (11–14 where medical content makes that impossible). Health literacy is low for many adults — more than 4 in 10 struggle with health information, more than 6 in 10 when numbers are involved (NHS).
- Sentences ≤ 20 words; paragraphs ≤ 3 sentences; active voice; one idea per sentence.
- Plain word first, medical term in brackets: "high blood pressure (hypertension)".
- Use precise numbers: "4 out of 5 people recover in a week", not "a good chance".
- Avoid "should" (sounds like blame), jargon, idioms, internal program names.
- Buttons say what happens: "Book appointment", "Send request". A button label and its confirmation match ("Book appointment" → "Appointment booked").
- Sentence case everywhere; avoid ALL CAPS (harder to read, and it crushes stacked diacritics in languages like Vietnamese).

## 2. Error messages

Formula: **what went wrong + how to fix it**, specific to the field, using the field's own words.

| Avoid | Use |
|---|---|
| "Invalid input" | "Enter a phone number with 10 digits, like 0912 345 678" |
| "Required field" | "Enter your full name" |
| "Date error" | "Date of birth must be in the past" |
| "Oops! Something went wrong" | "We could not book your appointment. Try again, or call 1900 xxxx." |

- Short, imperative, no blame, no "please/sorry/oops" for user errors; apologize only when the system failed.
- Show errors when the user tries to continue, not on every keystroke or blur (except for hard formats where instant help is kinder).
- At the top of the page, an **error summary** (`role="alert"`, focused on submit) lists each problem as a link to its field. Each field shows its message under the label and hint, with a visually hidden "Error:" prefix, `aria-invalid="true"`, and a thicker critical border.
- Never clear what the user typed. Never disable the submit button to signal errors.
- Don't use errors to tell someone they're ineligible; explain on a page instead.

## 3. Form patterns

- **Start with one question per page** for public users; group only when questions are closely related. Each question page: back link, question as `<h1>` (inside the `<label>` or `<legend>`), hint, input, one primary "Continue" button. Desktop: left-aligned; mobile: full width.
- **Labels always visible**; placeholders never replace labels. Hints go between label and input.
- Mark the minority: if most fields are required, mark the optional ones "(optional)", and vice versa — in text, not just with an asterisk.
- Offer "I don't know" / "Prefer not to say" where it is a legitimate answer.
- **Redundant entry:** prefill what you know; "Same as patient's address" checkbox; never ask twice in one flow.
- **Check your answers** page before submitting anything that books, pays, or changes medical data — each row with a "Change" link back to its question.
- **Confirmation page:** panel with the result and reference number, what happens next, how to get help.
- **Who is filling this in?** Ask early when family members or carers often act for the person (VA pattern), and adjust wording ("your mother's date of birth").
- Save progress for long forms; warn before timeouts (see healthcare patterns).

## 4. Specific inputs

- **Names:** one "Full name" field; don't split into first/last (name order and structure vary by culture). Store as entered; never strip diacritics.
- **Dates the user knows** (date of birth): three text inputs Day / Month / Year in one `<fieldset>` with the question as `<legend>`; `inputmode="numeric"`; `autocomplete="bday-day|bday-month|bday-year"`. Hint: "For example, 27 3 1950". Order the fields to match the locale (day-month-year in most of the world). Use all text inputs (VA testing found a month `<select>` mixed with text inputs troubled assistive-tech users).
- **Dates the user picks** (appointments): a list of available days/slots as buttons or radios beats a free calendar; if a calendar is used, allow typing too.
- **Approximate dates:** month + year only.
- **Phone numbers:** one field, `type="tel"`, `autocomplete="tel"`; accept spaces, dots, dashes, brackets and country codes; normalize on the server. Say why you need it. Render phone numbers as `tel:` links.
- **Addresses:** multiple labelled lines or a single textarea per local convention; don't force a lookup.
- **Ranges:** "Start date" / "End date", not "From" / "To".

## 5. Healthcare patterns

- **Urgency / care cards** (NHS): three levels — non-urgent (info color: "contact your doctor"), urgent (critical color: "get help today"), emergency (critical + dark: "call the emergency number now"). Order by seriousness; don't overuse — inform and reassure, don't scare.
- **Interruption page:** stop a flow when an answer means the person needs urgent help.
- **Warning callout** for safety information; **inset text** for supporting notes.
- **"Page last reviewed / Next review due"** on health information.
- **Idle timeout:** modal before session expiry with remaining time, "Stay signed in" (primary) and "Sign out"; ≥ 20 seconds to respond; keep entered data.
- **Consistent help:** hotline / contact in the same place on every page (WCAG 3.2.6).
- **Appointment booking flow:** service → doctor (optional "any doctor") → day → time slot → patient details (or "for someone else") → check answers → confirmation (with add-to-calendar and how to cancel).
- **Care records / medication lists** (staff and family): status by text + icon + color; times in 24-hour format; never truncate drug names or doses; confirm before recording administration; show who recorded what and when.
- **Privacy:** say why each piece of personal or health data is needed; consent in plain words; never show sensitive details on lock screens or in notification previews by default.

## 6. Numbers, dates and time in copy

- Numerals, not words ("3 days"). Thousands separators per locale. Avoid decimals except for money, measurements and doses (leading zero: "0.5 mg").
- "1 in 7 people" rather than "14.3%".
- Write dates with the weekday for appointments: "Saturday 24 October 2026"; spell out months in prose (screen readers mangle abbreviations).
- Format with `Intl.DateTimeFormat` / `Intl.NumberFormat` in the user's locale; set the time zone explicitly for appointments.
