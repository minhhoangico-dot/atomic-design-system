---
tags: [skill-creator]
max_turns: 40
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

This is fdc-ui, the component library for our family-doctor clinic (FDC, Bác sĩ Gia đình) in Hanoi. On the booking page patients pick an appointment time. Please add a component that shows the available time slots for one day (like 08:00, 08:30, 09:00 …) where some slots are already taken, and the patient picks one. Write the component, its CSS, a Storybook story file and a test. Many of our patients are elderly.

Input files: src/tokens/tokens.css, src/components/atoms/Button/Button.tsx, src/components/atoms/Button/Button.module.css, src/components/atoms/Button/index.ts, src/index.ts
