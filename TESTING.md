# Testing

This project uses Vitest with React Testing Library for unit, component, and integration-style tests.

## Run tests

```bash
npm install
npm run test
npm run test:coverage
```

`npm run test` runs the suite once in jsdom. `npm run test:coverage` generates coverage output and enforces the configured thresholds in `vite.config.ts`.

## What is covered

- App-level navigation and progress updates
- Guided learning, quiz, FAQ, glossary, checklist, and timeline flows
- Gemini assistant success and fallback behavior
- Progress context persistence and recovery from localStorage
- Core data module consistency checks

## Where to add more tests

- Section tests: `src/components/sections/__tests__/`
- Context tests: `src/context/__tests__/`
- Data tests: `src/data/__tests__/`
- Service tests: `src/services/__tests__/`
- App integration tests: `src/__tests__/`

## Coverage notes

- Coverage is configured in `vite.config.ts`.
- Important app, context, data, and service files are included in coverage collection.
- Coverage artifacts are written to the default Vitest/V8 coverage output directories.