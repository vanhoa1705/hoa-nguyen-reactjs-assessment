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
# then edit .env and set VITE_DOG_API_KEY and VITE_SUB_ID
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
- **Progress persistence** — swipe state is saved to localStorage and vote history is restored from The Dog API

## Library Choices

**TanStack Query v5** over SWR or plain `useEffect` — declarative cache management with staleTime, background refetch, and request deduplication out of the box. The `useMutation` + `onSuccess` callback made the vote → advance flow clean without extra state.

**Zustand v5 with `persist`** over Redux or Context — the swipe state (`currentBreedId`, `isDone`) is a simple flat object with one action. Zustand's `create` + `persist` middleware solved localStorage sync in ~10 lines. Redux would have been 5× the boilerplate for no benefit here.

**Framer Motion v11** over CSS animations or react-spring — `useMotionValue` + `useTransform` gave drag-to-rotate and LIKE/NOPE stamp opacity in two lines each. The declarative `drag="x"` with `onDragEnd` removed any need to wire up pointer events manually.

**React Router v6** — file-level route components (`/`, `/breeds/:id`, `/history`) with `useNavigate(-1)` for back navigation. No loader/action API needed at this scale.

**Tailwind CSS v3** — design tokens (`accent`, `nope`, `super`, `ink`, `muted`, `bg`) defined once in `tailwind.config.js` and used consistently across all components. The `border-ink/10` opacity modifier mapped directly to the design's `rgba(20,22,26,.10)` without a custom CSS variable.

## Technical Decisions

**API key in header, not query string** — The Dog API accepts `x-api-key` as a request header. The `.env.example` documents both `VITE_DOG_API_KEY` (the key) and `VITE_SUB_ID` (the subscriber ID used to namespace votes, needed to fetch your own history).

**Votes cache with mutation refresh** — `GET /votes` is cached for 30 seconds so homepage/history do not refetch on every render. After a like, pass, or super like succeeds, the votes query is invalidated and refetched in the background. Existing collection data stays visible while the fresh response loads, so the total count does not briefly drop to zero.

**`advance` reads current position from store** — rather than passing the current index as a parameter, `advance(breeds, hasNextPage)` derives the next breed from `currentBreedId` in the store. When the user votes the last breed of a loaded page but more pages exist (`hasNextPage=true`), `isDone` is not set — the sync effect resumes once the next page arrives.

**Image preloading** — the next breed's `image.url` (returned inline by the breeds list endpoint) is loaded into browser cache via `new Image()` while the user views the current card. No extra API call needed.

**Vote-aware breed pagination** — breeds are fetched 50 at a time. On homepage load, the initial breed page is calculated from the number of unique voted image IDs (`Math.floor(votedCount / BREEDS_PAGE_LIMIT)`), so a user with 47 votes starts from page 0 while a user with 120 votes starts from page 2. The next page is fetched only after the current page has no remaining unvoted breeds.

## Project Structure

```
src/
  api/          dogApi.ts - all fetch calls, typed responses
  components/   BreedCard, SwipeButtons, Skeleton
  constants/    API settings and swipe thresholds
  hooks/        useBreeds, useVotes, useVoteActions
  pages/        MainPage, DetailsPage, HistoryPage
  stores/       swipeStore (Zustand + persist)
  types/        Breed, Vote
  utils/        swipe direction classifier
```

## Tests

46 unit tests covering API calls, store logic, vote actions, breed pagination, swipe classification, and page-level interactions. Framer Motion is mocked in page tests so drag behavior is tested via keyboard events and button clicks.

```bash
pnpm test
```
