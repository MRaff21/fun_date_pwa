# Datebook PWA prototype

Datebook is a private date-planning prototype for two people. This repository explores the web-first version of the idea: it runs in any modern browser, adapts from a phone layout to a wider desktop layout, and includes the minimum files required to be installed as a Progressive Web App.

The prototype is intentionally more than a static mock-up. You can browse fake date ideas, filter them, open a detail view, assemble an invitation, choose a suggested day, preview the result, add and edit curated listings, archive listings, and simulate connecting a Google account. Everything is local and temporary; there is no database and no real authentication yet.

## Why this repository exists

The original fun_date project proved that a playful guided invitation works. This prototype asks a different question: can that personal experience grow into a maintainable application while staying easy to open from a link?

The PWA approach puts the browser first. A recipient can open a future invitation without installing anything. The owner can use the same app from a laptop to manage content. On Android, the app can later be installed to the home screen and opened in a standalone window.

This is one of two deliberately separate experiments. The sibling Expo repository explores a native-mobile-shaped implementation of the same product. They share concepts and fake content, but no code. Keeping them independent makes it possible to discard one without leaving framework-specific pieces behind.

## Run it locally

Requirements:

- Node.js 20 or newer
- npm

Install and start the development server:

    npm install
    npm run dev

Vite prints a local URL, normally http://localhost:5173. Open it in a browser.

To try the site on an Android phone connected to the same network:

    npm run dev -- --host

Vite will print a Network URL. Open that address in Chrome on the phone. Your computer firewall must allow the connection.

Create and inspect a production build with:

    npm run build
    npm run preview -- --host

The service worker is registered only in a production build. This prevents stale cached JavaScript from interfering while actively editing the app.

Other checks:

    npm run typecheck
    npm run lint

## What to click through

### Discover

Discover is the default screen and the future member-facing home. It combines reusable date ideas with time-limited local events. The horizontal filters update the in-memory list. Opening an image or title leads to the full detail view. The Add button places up to three choices into the current invitation.

The hero intentionally starts with a planning action rather than a general welcome message. The private version assumes there are only two people, so the most important repeat action is creating the next invitation.

### Date detail

The detail screen gives one date idea enough room to feel desirable. Location, duration, approximate budget, event timing, and descriptive tags are separated from the emotional description. This structure is important later: the descriptive copy helps someone choose, while the structured fields can power filters, calendar entries, and community-event imports.

The bottom actions connect the idea back to the invitation. They do not create a second copy of the item. Instead, the root application stores only the selected idea IDs and derives the current choices from the master list.

### Our plan

Our plan is a compact invitation builder. It reads the selected IDs from the root state, resolves them into full idea records, and displays them in the selected order. Removing an item changes the same selection used by Discover, so both screens stay synchronized.

The day buttons and personal note represent invitation-level data. They belong to the proposed date plan, not to any particular venue. Previewing the invitation changes the local screen to a success state and displays a fake private URL. No message is actually sent.

In a real version this screen would create a plan record, child option records, suggested time records, and a random invitation token. A guest route would use the token to show only that invitation and accept one response.

### Manage

Manage is the first sketch of the future curator dashboard. It shows live ideas, local events, and drafts. Add new opens a form. Edit preloads the same form from an existing idea. Archive and Publish toggle whether an item can appear in Discover.

Saving creates or updates a record only in React memory. New records use the hero image as a placeholder. Refreshing the browser resets everything to the fake seed data in src/data.ts. That limitation is intentional: it lets this prototype test the information architecture before choosing database tables, upload rules, or event-source integrations.

The eventual dashboard should separate evergreen ideas from dated event occurrences. A restaurant or trail can remain available for months, while a night market occurrence needs a start time, end time, source URL, and expiry behavior.

### You

The profile screen establishes the privacy model: one private space, one owner, and one invited member. Continue simulates Google sign-in by changing local component state. It does not load a Google script, open OAuth, store a token, or contact a server.

Real Google sign-in should establish identity only. Calendar access should be a separate opt-in action with its own explanation and narrower permission request.

## How the code connects

The project is intentionally small:

    index.html
      loads src/main.tsx
        renders src/App.tsx
          imports seed records from src/data.ts
          imports shared shapes from src/types.ts
          renders the active screen
          owns cross-screen prototype state

    src/App.css
      styles every application screen
      changes the left rail into bottom navigation below 800px

    public/manifest.webmanifest
      supplies install name, colors, orientation, and icon

    public/service-worker.js
      caches visited GET responses for a lightweight offline demonstration

### src/types.ts

DateIdea is the central domain type. It contains both emotional presentation fields, such as title and description, and structured operational fields, such as kind, location, price, and eventDate. IdeaDraft is the subset the editor is allowed to change. AppTab limits navigation state to the four valid top-level screens.

These definitions keep UI components honest. A card cannot silently depend on a field that is absent from the editor and future API without TypeScript identifying the mismatch.

### src/data.ts

This file acts as a fake database. It exports five seed records, three suggested days, and the blank editor value. Keeping seed data out of the components makes the eventual backend transition clearer: an API hook can replace initialIdeas while the screens continue to receive DateIdea objects.

Image paths start with /images because Vite copies the public directory directly to the build output. The same paths therefore work during development and after deployment.

### src/App.tsx

App owns state that must survive tab changes:

- activeTab decides which main screen is visible.
- ideas is the current curated catalogue.
- selectedIds is the invitation shortlist.
- selectedDay and inviteSent describe the current mock plan.
- detailId opens one idea without introducing a routing library.
- draft, editingId, and showEditor coordinate the create/edit form.
- signedIn drives only the simulated profile state.

The screen components receive values and callbacks. For example, ManageView never mutates the catalogue directly. It calls onToggleActive, and App replaces the matching record. This one-way data flow is close to how a later server-backed mutation will work.

There is no URL router in this prototype. Refreshing a detail or admin form returns to Discover. If this direction is selected, React Router or a framework router should give invitations and details durable URLs.

### src/App.css and src/index.css

index.css defines only global browser behavior. App.css contains the product theme and component layout. CSS custom properties at the top are the design tokens shared across the prototype.

At wider sizes, a fixed left rail leaves more room for curation and editing. At 800 pixels and below, it disappears and a fixed bottom navigation bar takes over. This is the central advantage being tested by the PWA: one component hierarchy can serve phone and desktop with CSS changing the presentation.

### PWA files

The web app manifest tells Android how the installed application should be named and displayed. The service worker uses a small network-first strategy: it requests current content, stores successful GET responses, and falls back to cached content when the network fails.

This is enough for a prototype, not a final caching policy. Authentication responses, private API data, invitation tokens, and uploaded images need explicit cache rules before real personal data is introduced.

## Data flow in the prototype

    Fake catalogue in data.ts
              |
              v
       App ideas state <------ Manage create/edit/archive
              |
        +-----+------------------+
        |                        |
        v                        v
     Discover ------------> selectedIds
                                 |
                                 v
                           Our plan screen
                                 |
                                 v
                       Local invitation preview

The profile simulation is currently separate because no operation needs identity until persistence exists.

## What is deliberately mocked

- Google authentication
- Private membership and invitations
- Email or push delivery
- Database reads and writes
- Image upload
- Calendar integration
- Community RSS feeds or external event APIs
- Durable URLs and browser history
- Offline handling for private API responses
- Authorization between owner and guest

The interface labels these boundaries so a click does not imply that a secure integration exists.

## A sensible production path

If the PWA is selected, the next vertical slice should connect Supabase while changing as little UI code as possible:

1. Add Google authentication and a profiles table.
2. Create private spaces and membership records.
3. Store date ideas and dated event occurrences separately.
4. Replace the local catalogue state with authenticated queries.
5. Convert editor actions into validated mutations.
6. Store plan options and suggested times.
7. Add tokenized guest invitation routes.
8. Add image upload and lifecycle cleanup.
9. Add calendar export only after plan confirmation.

Row-level security must enforce membership in the database. Hiding the Manage tab in React is presentation, not authorization.

## Suggested future database concepts

- profiles: application identity associated with a Google-authenticated user
- spaces: the private planning area that can later support more than two members
- space_members: owner/member roles and invitation status
- date_ideas: reusable curated places or activities
- event_occurrences: dated local events linked to a source
- plans: one proposed date invitation and its lifecycle
- plan_options: the ideas offered on a plan
- suggested_times: one or more proposed time windows
- responses: the guest choice, availability, and note
- media: uploaded photos and ownership metadata

Using a neutral space concept avoids baking the assumption of exactly one couple into the data model, while the private user experience can still say “the two of us.”

## Prototype limitations worth noticing

- State resets on reload.
- The fake invitation URL does not resolve.
- The service worker is intentionally basic.
- Dates are display strings rather than timezone-aware timestamps.
- New items receive a placeholder image.
- There is no form error summary or server validation.
- Navigation is state-based and does not update browser history.
- Accessibility has a reasonable structural start but has not had a formal audit.
- The existing image assets are large and should be resized into responsive variants before production.

## What to evaluate against the Expo prototype

Try the same tasks in both repositories on the same Android phone:

1. Browse and filter several ideas.
2. Open a detail and add it to the invitation.
3. Remove an option and select a day.
4. Preview the invitation.
5. Add a fake local event and edit it.
6. Archive an item and confirm it leaves Discover.
7. Simulate Google connection.

Pay attention to touch feel, scrolling, keyboard behavior, navigation, visual density, development refresh speed, and whether managing content from a laptop matters. Those observations are more useful at this stage than feature count.
