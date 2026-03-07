# UI Testing Plan (AllIn Frontend)

## Current Baseline
- Test runner: `jest` (React Native preset)
- Existing suites: `9`
- Current result: `9 passed`, `0 failed`
- New UI suite: `__tests__/searchScreen.ui.test.tsx`

## Goal
Create a stable, fast UI test strategy that protects critical user flows without slowing delivery.

## Test Layers
1. Component tests (many, fast)
2. Screen integration tests (moderate)
3. E2E tests for core journeys only (few, high value)
4. Manual release checklist (short, focused)

## Phase 1 (Immediate, highest ROI)
### 1) Stabilize existing Jest suite
- Fix `__tests__/AuthContext.test.tsx` transient bootstrap expectation mismatch.
- Keep `npm test -- --runInBand` green in CI.

### 2) Expand high-risk screen integration tests
- Search
  - `src/screens/search/SearchScreen.tsx`
  - Cover filter ordering, keyboard persistence on filter tap, profile avatar fallback rendering.
- Profile (own + view)
  - `src/screens/userProfile/UserProfileScreen.tsx`
  - `src/screens/viewUserProfile/ViewUserProfileScreen.tsx`
  - Cover follow button visibility rules, sport badge visibility, profile meta row formatting/truncation/clickable club.
- New Blog flow
  - `src/screens/profileBlog/ProfileBlogEditorScreen.tsx`
  - Cover step transitions, back-button behavior, preview behavior, required-field validation states.
- Upload flow
  - `src/screens/upload/*`
  - Cover checkpoint persistence, watermark next/skip behavior, multi-image watermark preview navigation.

### 3) Add testing-library for behavior-driven UI tests
- Add dev dependency: `@testing-library/react-native`
- Prefer user-centric assertions over tree inspection where practical.

## Phase 2 (Critical end-to-end journeys)
Use `Detox` or `Maestro` for these only:
1. Auth0 login -> onboarding/account completion -> home
2. Create blog (all steps) -> publish -> appears in feed
3. Search user -> open profile -> follow/unfollow
4. Upload media with watermark -> publish
5. Share to Instagram Story action opens expected intent path

## Phase 3 (Regression hardening)
- Visual regression snapshots for:
  - Home feed card variants (text/image/video)
  - Own profile header
  - View profile header
  - Upload watermark screen
  - Search result row
- Add deterministic mocks for:
  - Date/time
  - Network responses
  - Auth session state

## Conventions
- Prefer `accessibilityLabel` for interaction targets.
- Add `testID` only where selectors are ambiguous.
- No assertions on implementation details (internal state/hook calls).
- Assert visible output and user-observable behavior.

## Suggested File Additions
- `__tests__/searchScreen.ui.test.tsx`
- `__tests__/userProfile.ui.test.tsx`
- `__tests__/viewUserProfile.ui.test.tsx`
- `__tests__/profileBlogFlow.ui.test.tsx`
- `__tests__/uploadWatermark.ui.test.tsx`

## Run Commands
- Full frontend tests:
```bash
npm test -- --runInBand
```
- Single suite:
```bash
npm test -- __tests__/searchScreen.ui.test.tsx
```

## Definition of Done for UI Testing
- Jest suite fully green.
- High-risk screen suites added for Search, Profile, Blog flow, Upload flow.
- One E2E happy-path suite for auth/onboarding is running in CI.
- Release checklist used on both iOS + Android before shipping.
