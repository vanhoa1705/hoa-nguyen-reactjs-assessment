# DogFinder — ReactJS Assessment

A dog breed discovery app built with React 19. Swipe through breeds, like or pass, and build your collection.

## Setup

**Requirements:** Node.js 18+, pnpm

```bash
pnpm install
```

Copy `.env.example` to `.env` and add your [The Dog API](https://thedogapi.com) key:

```bash
cp .env.example .env
# then edit .env and set VITE_API_KEY and VITE_SUB_ID
```

```bash
pnpm dev        # start dev server at http://localhost:5173
pnpm build      # production build
pnpm test       # run unit tests (watch mode)
pnpm lint       # ESLint + Prettier check
pnpm lint:fix   # auto-fix lint and formatting issues
```

## Features

- **Swipe cards** — drag right to like, left to pass, up to super like
- **Keyboard shortcuts** — `←` pass · `→` like · `↑` super like · `↵` view details
- **Details page** — full breed info: weight, height, temperament, bred for, life span
- **Collection** — browse voted breeds, filter by like / pass / super like
- **Progress persistence** — swipe state saved to localStorage, survives page refresh
- **Undo** — step back one card

## Library Choices

**TanStack Query v5** over SWR or plain `useEffect` — declarative cache management with staleTime, background refetch, and request deduplication out of the box. The `useMutation` + `onSuccess` callback made the vote → advance flow clean without extra state.

**Zustand v5 with `persist`** over Redux or Context — the swipe state (current position, votes, history) is a simple flat object with a handful of actions. Zustand's `create` + `persist` middleware solved localStorage sync in ~10 lines. Redux would have been 5× the boilerplate for no benefit here.

**Framer Motion v11** over CSS animations or react-spring — `useMotionValue` + `useTransform` gave drag-to-rotate and LIKE/NOPE stamp opacity in two lines each. The declarative `drag="x"` with `onDragEnd` removed any need to wire up pointer events manually.

**React Router v6** — file-level route components (`/`, `/breeds/:id`, `/history`) with `useNavigate(-1)` for back navigation. No loader/action API needed at this scale.

**Tailwind CSS v3** — design tokens (`accent`, `nope`, `super`, `ink`, `muted`, `bg`) defined once in `tailwind.config.js` and used consistently across all components. The `border-ink/10` opacity modifier mapped directly to the design's `rgba(20,22,26,.10)` without a custom CSS variable.

## Technical Decisions

**API key in header, not query string** — The Dog API requires `x-api-key` as a request header. The `.env.example` documents both `VITE_API_KEY` (the key) and `VITE_SUB_ID` (the subscriber ID returned on first vote, needed to fetch your own votes).

**`advance` reads current position from store** — rather than passing the current index as a parameter, `advance(breeds)` derives the next breed from `currentBreedId` in the store. This keeps callers simple and avoids stale closure bugs.

**Image preloading** — the next breed's image is fetched in a `useQuery` with `enabled` but its result is intentionally discarded in `MainPage`. TanStack Query caches it, so by the time the user swipes to the next card the image is already in cache.

**Vote recorded locally before API call** — `recordVote` updates the Zustand store immediately, then the API mutation fires in the background. The UI never waits for the network, and if the API call fails the local vote is still reflected in the collection.

**`history: string[]` enables undo** — `advance` pushes the current breed ID to history before moving forward. `undo` pops it, deletes the vote, and restores `currentBreedId`. No separate undo stack library needed.

## Project Structure

```
src/
  api/          dogApi.ts — all fetch calls, typed responses
  components/   BreedCard, SwipeButtons, Skeleton
  constants/    swipe thresholds
  hooks/        useBreeds, useVoteActions
  pages/        MainPage, DetailsPage, HistoryPage
  stores/       swipeStore (Zustand + persist)
  types/        Breed, Vote
  utils/        swipe direction classifier
```

## Tests

46 unit tests covering store logic, vote actions, swipe classification, and page-level interactions. Framer Motion is mocked in page tests so drag behavior is tested via keyboard events and button clicks.

```bash
pnpm test
```
