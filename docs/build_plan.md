# ChihriinTawag --- Build Plan

> **Tagline:** Dump your dates. Keep your memories. Build your story.\
> **Product concept:** A private shared space where two people can plan
> dates, collect photos, and build a timeline of their relationship.

------------------------------------------------------------------------

## 1. Product vision

LoveDump is a couples' date planner and shared memory scrapbook. It
should feel less like a productivity dashboard and more like a small,
personal corner of the internet that two people build together.

### Product goals

1.  Make it easy for either partner to suggest and plan a date.
2.  Give both partners a shared place to record completed dates.
3.  Preserve photos, captions, and notes as a browsable memory timeline.
4.  Add lightweight, delightful couple features without making the app
    complicated.
5.  Keep the couple's content private and accessible only to its
    members.

### Initial audience

Start with one couple: the founder and their partner. Design the data
model so the product can support many separate couples later.

### Product principles

-   **Private by default:** Couple content must never be public by
    accident.
-   **Shared ownership:** Both partners can contribute to the same
    space.
-   **Memory first:** A completed date should naturally become a lasting
    memory.
-   **Low friction:** Adding an idea, scheduling a date, or uploading
    photos should be quick.
-   **Mobile friendly:** Photo uploads and memory browsing should work
    especially well on phones.

------------------------------------------------------------------------

## 2. Scope and release strategy

Build a small, complete MVP before adding optional features.

### MVP --- Must have

  -----------------------------------------------------------------------
  Area                                MVP capability
  ----------------------------------- -----------------------------------
  Authentication                      Sign up, sign in, sign out

  Couple space                        Create a couple space and invite
                                      one partner

  Membership                          Accept an invitation and join the
                                      shared space

  Date ideas                          Create, edit, view, and delete date
                                      ideas

  Date planning                       Add a planned date/time, location,
                                      and optional budget

  Date status                         Move a date through Idea, Planned,
                                      and Completed

  Date memories                       Add a reflection or note to a
                                      completed date

  Photo uploads                       Upload multiple photos and add
                                      captions

  Timeline                            Browse completed dates and their
                                      photos chronologically

  Privacy                             Enforce couple membership for all
                                      data and storage access
  -----------------------------------------------------------------------

### Version 1.1 --- Nice to have

-   Shared couple bucket list.
-   Date roulette: randomly choose from saved date ideas.
-   Love notes visible to both partners.
-   Relationship milestones and anniversary countdown.
-   Comments or reactions on a date memory.
-   Basic search and filters.

### Later ideas --- Only after real use

-   Map of places visited.
-   "On this day" memory resurfacing.
-   Monthly or yearly memory recap.
-   Shared playlist links.
-   Question of the day.
-   Export memories as a downloadable archive.
-   Notifications and calendar integration.

**Scope rule:** Do not build every fun idea before the date-to-memory
flow is working smoothly.

------------------------------------------------------------------------

## 3. Main user journeys

### Journey A --- Set up the shared space

1.  Partner A creates an account.
2.  Partner A creates a couple space.
3.  The app generates a secure invitation link or code.
4.  Partner A shares it with Partner B.
5.  Partner B signs in or creates an account, then accepts the
    invitation.
6.  Both partners land in the same private couple space.

Acceptance criteria:

-   A couple space has no more than two active members in the initial
    product.
-   An invitation can only be accepted by an authenticated user.
-   Invitation tokens are random, single-use, and expire.
-   A user cannot join a couple they were not invited to.

### Journey B --- Suggest and plan a date

1.  Either partner selects **Add date idea**.
2.  They enter a title and optional description, location, estimated
    budget, and notes.
3.  They can leave it as an idea or set a planned date/time.
4.  The date appears in the shared list or upcoming-date section.
5.  Either partner can edit the date or update its status.

Acceptance criteria:

-   A date idea can be saved with only a title.
-   Planned dates can be sorted by date.
-   The app clearly distinguishes ideas from scheduled dates.
-   The creator is recorded, but both partners can manage shared dates.

### Journey C --- Turn a date into a memory

1.  A partner opens a planned date.
2.  They mark it as completed.
3.  They add a short reflection, rating, or favorite moment (optional).
4.  Either partner uploads one or more photos.
5.  They add optional captions.
6.  The completed date appears in the memory timeline.

Acceptance criteria:

-   A completed date can exist without photos.
-   Upload progress and upload errors are visible.
-   Photos are associated with the correct date and couple.
-   Both partners can view the resulting memory.
-   Deleting a date or photo follows a deliberate confirmation flow.

------------------------------------------------------------------------

## 4. Information architecture and pages

### Primary navigation

Keep the first version to four main destinations:

1.  **Home** --- greeting, next planned date, quick actions, recent
    memories.
2.  **Dates** --- date ideas, upcoming plans, and completed dates.
3.  **Memories** --- chronological gallery of completed dates and
    photos.
4.  **Our space** --- bucket list (when added), milestones, partner
    settings, and account settings.

### Page requirements

  -----------------------------------------------------------------------
  Page                    Main content            Key actions
  ----------------------- ----------------------- -----------------------
  Sign in / Sign up       Authentication forms    Create account, sign in

  Couple setup            Create space or accept  Create, join
                          invitation              

  Home                    Next date, recent       Add idea, plan date,
                          memories, quick stats   upload memory

  Dates                   Tabs or filters for     Create, edit, complete
                          Ideas, Planned,         
                          Completed               

  Date detail             Description, date/time, Edit, mark complete,
                          location, photos, notes add photos

  Add/edit date           Title, description,     Save, cancel
                          date/time, location,    
                          budget                  

  Memories                Chronological memory    Open memory, filter
                          cards or photo grid     

  Memory detail           Photos, captions, date  Add photos, edit
                          details, reflection     captions

  Settings                Partner membership and  Manage invitation, sign
                          account preferences     out
  -----------------------------------------------------------------------

### Home page layout suggestion

-   Header: couple-space name and a friendly greeting.
-   Featured card: next planned date.
-   Quick actions: add date idea and add memory.
-   Small stats: dates completed and photos saved.
-   Recent memories: latest completed dates with photo previews.

Avoid turning the homepage into a dense analytics dashboard.

------------------------------------------------------------------------

## 5. Recommended technology stack

A practical stack for a modern, maintainable web app:

  -----------------------------------------------------------------------
  Layer                   Recommendation          Why
  ----------------------- ----------------------- -----------------------
  Framework               Next.js + TypeScript    Full-stack React
                                                  framework and strong
                                                  typing

  UI                      Tailwind CSS +          Fast, consistent
                          shadcn/ui               component development

  Database                Supabase PostgreSQL     Relational data and
                                                  managed database

  Authentication          Supabase Auth           Account creation and
                                                  sessions

  File storage            Supabase Storage        Store date photos
                                                  separately from
                                                  relational data

  Authorization           PostgreSQL RLS +        Enforce couple-level
                          Storage policies        privacy

  Validation              Zod                     Validate form and
                                                  server input

  Forms                   React Hook Form         Manage forms cleanly

  Deployment              Vercel                  Straightforward Next.js
                                                  deployment

  Version control         GitHub                  Source control and
                                                  issue tracking
  -----------------------------------------------------------------------

Keep business rules and authorization checks on the server. Do not rely
on hiding buttons in the frontend as a security boundary.

------------------------------------------------------------------------

## 6. Data model

Use UUID primary keys and timestamps. Store image files in object
storage; store their metadata and storage paths in PostgreSQL.

### Entity relationship overview

``` text
auth.users
   |
   | 1-to-many
   v
couple_members >------ couples
                         |
                         | 1-to-many
                         v
                       dates
                         |
                         | 1-to-many
                         v
                    date_photos

couples >-------------- bucket_list_items
couples >-------------- love_notes
```

### Tables

#### `profiles`

Additional application profile information for an authenticated user.

  Column           Type          Notes
  ---------------- ------------- -----------------------------------------
  `id`             uuid          Primary key; references `auth.users.id`
  `display_name`   text          Optional display name
  `avatar_path`    text          Optional storage path
  `created_at`     timestamptz   Default current timestamp
  `updated_at`     timestamptz   Updated on changes

#### `couples`

One private shared space.

  Column         Type          Notes
  -------------- ------------- -------------------------------
  `id`           uuid          Primary key
  `name`         text          Example: "Our Little World"
  `created_by`   uuid          References authenticated user
  `created_at`   timestamptz   Default current timestamp
  `updated_at`   timestamptz   Updated on changes

#### `couple_members`

Connects users to couple spaces.

  Column        Type          Notes
  ------------- ------------- -------------------------------
  `id`          uuid          Primary key
  `couple_id`   uuid          References `couples.id`
  `user_id`     uuid          References `auth.users.id`
  `role`        text          Initially `owner` or `member`
  `joined_at`   timestamptz   Default current timestamp

Add a unique constraint on (`couple_id`, `user_id`) and enforce the
two-member product limit through trusted server-side logic and database
constraints/transactions where appropriate.

#### `couple_invitations`

Secure invitation flow for the second partner.

  Column          Type          Notes
  --------------- ------------- ---------------------------------
  `id`            uuid          Primary key
  `couple_id`     uuid          References `couples.id`
  `token_hash`    text          Store a hash, not the raw token
  `created_by`    uuid          Inviting user
  `expires_at`    timestamptz   Invitation expiry
  `accepted_at`   timestamptz   Nullable
  `created_at`    timestamptz   Default current timestamp

Generate high-entropy invitation tokens. Validate and consume them on
the server. Avoid exposing token hashes in client queries.

#### `dates`

Stores date ideas, plans, and completed dates.

  Column               Type          Notes
  -------------------- ------------- ------------------------------------
  `id`                 uuid          Primary key
  `couple_id`          uuid          References `couples.id`
  `title`              text          Required
  `description`        text          Optional
  `location_name`      text          Optional
  `planned_at`         timestamptz   Nullable until scheduled
  `estimated_budget`   numeric       Optional; define currency handling
  `currency_code`      text          Optional ISO currency code
  `status`             text          `idea`, `planned`, or `completed`
  `reflection`         text          Optional memory note
  `created_by`         uuid          User who created it
  `completed_at`       timestamptz   Nullable
  `created_at`         timestamptz   Default current timestamp
  `updated_at`         timestamptz   Updated on changes

Use a database check constraint for allowed statuses. Decide whether
completed dates can be reopened and implement that behavior
consistently.

#### `date_photos`

Metadata for images stored in Supabase Storage.

  Column           Type          Notes
  ---------------- ------------- -------------------------------------------------
  `id`             uuid          Primary key
  `date_id`        uuid          References `dates.id`
  `couple_id`      uuid          Denormalized for policy checks; keep consistent
  `storage_path`   text          Private bucket object path
  `caption`        text          Optional
  `uploaded_by`    uuid          Authenticated uploader
  `created_at`     timestamptz   Default current timestamp

Do not store image binary data in PostgreSQL. Store the object path and
metadata.

#### Future tables

Add these only when implementing the corresponding features:

-   `bucket_list_items`: couple ID, title, description, completed state,
    completed timestamp, creator.
-   `love_notes`: couple ID, sender ID, content, created timestamp,
    optional read timestamp.
-   `date_reactions`: date ID, user ID, reaction type, created
    timestamp.
-   `milestones`: couple ID, title, date, description.

------------------------------------------------------------------------

## 7. Privacy and security requirements

This is a private relationship product, so security is a core feature,
not a final polish task.

### Database security

-   Enable Row Level Security on every table containing private or
    user-owned data.
-   A user may read couple data only if they are a member of that
    couple.
-   A user may insert a date only into a couple they belong to.
-   A user may update or delete a date only if they belong to its
    couple.
-   Validate `created_by`, `uploaded_by`, and membership relationships
    using the authenticated user identity; never trust client-supplied
    user IDs.
-   Protect invitation creation and acceptance with server-side checks.
-   Test policies using two unrelated test accounts and a third account
    that belongs to neither couple.

### Storage security

-   Use a private bucket for date photos.
-   Organize object paths by couple and date, for example:
    `couple-id/date-id/random-file-id.jpg`.
-   Add Storage policies that verify the authenticated user is a member
    of the couple represented by the object path.
-   Use short-lived signed URLs for viewing private images.
-   Validate file size and MIME type; do not trust the filename or
    browser-provided content type alone.
-   Generate random object names rather than using user-supplied
    filenames.
-   Consider image resizing and compression to reduce storage and
    bandwidth costs.
-   Define deletion behavior so removing a photo also removes its
    storage object.

### General security

-   Keep service-role keys and other secrets on the server only.
-   Validate all input on the server.
-   Add rate limits to invitation and upload-related endpoints where
    appropriate.
-   Avoid logging private note contents, invitation tokens, or signed
    URLs.
-   Provide a way to delete a photo, date, or account, with clear
    consequences.
-   Use HTTPS in production.

------------------------------------------------------------------------

## 8. Photo upload design

The photo experience is one of the most important parts of LoveDump.

### Upload flow

1.  User opens a date or completed memory.
2.  User selects one or more photos.
3.  Client checks basic file constraints for a helpful experience.
4.  Server verifies the user's membership and upload permission.
5.  The app uploads each file to the private storage bucket.
6.  The app inserts a `date_photos` metadata record.
7.  The app displays upload progress and a preview.
8.  The user can add or edit captions.

### Initial upload constraints

Choose and document sensible limits before launch. For example:

-   Accept JPEG, PNG, and WebP initially.
-   Set a conservative per-file size limit, such as 10 MB.
-   Limit the number of files per upload batch.
-   Compress or resize large images where practical.
-   Show a clear error if a file is rejected.
-   Allow retrying a failed upload without duplicating successful
    uploads.

These are starting defaults, not immutable product requirements.

### Important failure cases

-   Upload succeeds but metadata insertion fails: clean up the orphaned
    object or provide a retry/reconciliation path.
-   Metadata insertion succeeds but upload fails: do not show a broken
    photo; remove or mark the incomplete record.
-   User loses connection: preserve clear status and allow retry.
-   User is no longer a member: deny upload and signed URL creation.

------------------------------------------------------------------------

## 9. UX and visual direction

Suggested initial direction: **cozy, romantic, playful, and nostalgic**,
without making the interface feel overly childish.

### Visual language

-   Warm off-white or cream backgrounds.
-   Soft rose, muted red, peach, or lavender accents.
-   Rounded cards and gentle shadows.
-   Polaroid-inspired photo treatments used selectively.
-   Friendly typography with strong readability.
-   Small celebratory animations when a date is marked completed.
-   Clear focus states and accessible contrast.

### UX details worth prioritizing

-   A date idea should take seconds to add.
-   Allow a title-only quick-add, with optional details later.
-   Make the next planned date visible on the home page.
-   Use a clear empty state that encourages adding the first date.
-   Show who added a date or photo.
-   Make photo upload work well on mobile, including the camera/photo
    picker.
-   Support keyboard navigation and accessible labels.
-   Use confirmation dialogs for destructive actions.

Do not make decorative animations block important actions or slow down
the app.

------------------------------------------------------------------------

## 10. Development roadmap

The following is a suggested sequence for a solo developer. Actual
duration depends on experience and how much polish is included.

  -----------------------------------------------------------------------
  Milestone               Work                    Deliverable
  ----------------------- ----------------------- -----------------------
  0\. Project setup       Repository, Next.js,    Running starter app
                          TypeScript, Tailwind,   
                          environment setup       

  1\. Database foundation Supabase project,       Secure data foundation
                          schema, migrations, RLS 
                          tests                   

  2\. Authentication      Sign up, sign in,       Working accounts
                          session handling,       
                          profile                 

  3\. Couple onboarding   Create space, invite    Two users share one
                          partner, accept         space
                          invitation              

  4\. Date management     Create, edit, list,     Working date planner
                          filter, and update      
                          dates                   

  5\. Photo memories      Private bucket, upload, Photos attached to
                          captions, previews,     dates
                          deletion                

  6\. Timeline and home   Upcoming date, recent   Useful main experience
                          memories,               
                          completed-date timeline 

  7\. Quality and launch  Mobile QA, security     MVP ready for private
                          checks, error states,   use
                          deployment              
  -----------------------------------------------------------------------

### Suggested implementation order

**Milestone 0 --- Project setup**

-   Create a GitHub repository.
-   Initialize Next.js with TypeScript.
-   Add Tailwind CSS and shadcn/ui.
-   Configure formatting and linting.
-   Create development and production environment variables.
-   Add a basic app layout and navigation.

**Milestone 1 --- Database foundation**

-   Create the Supabase project.
-   Add SQL migrations for profiles, couples, members, invitations,
    dates, and photos.
-   Add constraints and indexes.
-   Enable RLS.
-   Write policy tests before relying on the policies in the UI.

**Milestone 2 --- Authentication**

-   Implement sign up and sign in.
-   Add protected routes.
-   Create or update a profile after registration.
-   Add sign out and basic account error states.

**Milestone 3 --- Couple onboarding**

-   Build create-couple flow.
-   Build invitation generation and acceptance.
-   Enforce invitation expiry and single-use behavior.
-   Test with two accounts and an unrelated third account.

**Milestone 4 --- Date management**

-   Build date list and date detail pages.
-   Implement create and edit forms.
-   Add status transitions.
-   Add sorting and basic filters.
-   Validate all fields on the server.

**Milestone 5 --- Photo memories**

-   Create private storage bucket and policies.
-   Build multi-file upload UI.
-   Add upload progress, retry, and error handling.
-   Add captions and photo deletion.
-   Verify that a non-member cannot retrieve photos.

**Milestone 6 --- Home and timeline**

-   Build the home page around the next planned date and recent
    memories.
-   Build the chronological memory timeline.
-   Add empty states and loading states.
-   Check responsive behavior on mobile and desktop.

**Milestone 7 --- Launch readiness**

-   Run security and authorization tests.
-   Test the complete flow from invitation through memory creation.
-   Test large, invalid, and interrupted uploads.
-   Check keyboard navigation and contrast.
-   Configure production environment variables and deployment.
-   Add a simple privacy policy before inviting anyone beyond the
    initial couple.

------------------------------------------------------------------------

## 11. MVP acceptance checklist

Use this checklist to decide whether the first version is genuinely
usable.

### Accounts and couple space

-   [ ] A user can sign up, sign in, and sign out.
-   [ ] A user can create a couple space.
-   [ ] A second user can securely accept an invitation.
-   [ ] Both partners see the same shared dates and memories.
-   [ ] An unrelated account cannot access the couple's data.

### Dates

-   [ ] Either partner can add a date idea.
-   [ ] A date can be scheduled with a date and time.
-   [ ] Either partner can edit a shared date.
-   [ ] A date can be marked completed.
-   [ ] Dates can be sorted and filtered by status.

### Photos and memories

-   [ ] Either partner can upload photos to a date.
-   [ ] Photos remain private.
-   [ ] Both partners can view photos.
-   [ ] Captions can be added and edited.
-   [ ] Failed uploads are handled clearly.
-   [ ] Deleted photos are removed from storage as well as the database.

### Experience

-   [ ] The app works on a phone-sized screen.
-   [ ] Forms have validation and useful error messages.
-   [ ] Empty, loading, and error states are designed.
-   [ ] Destructive actions require confirmation.
-   [ ] The home page makes the next planned date and recent memories
    easy to find.

------------------------------------------------------------------------

## 12. Testing plan

### Manual end-to-end test

Use two accounts, Alice and Ben, plus a third unrelated account,
Charlie.

1.  Alice creates an account and a couple space.
2.  Alice invites Ben.
3.  Ben accepts the invitation.
4.  Alice adds a date idea.
5.  Ben schedules the date.
6.  Alice marks the date completed.
7.  Ben uploads photos and adds captions.
8.  Alice opens the memory timeline and sees the photos.
9.  Charlie attempts to access the couple's dates and photos and is
    denied.
10. Alice deletes a test photo and confirms it is no longer accessible.

### Additional cases

-   Expired invitation.
-   Invitation accepted twice.
-   Attempt to join a third member.
-   Missing date title.
-   Invalid planned date.
-   Unsupported file type.
-   File over the upload limit.
-   Interrupted upload.
-   User removed from a couple while a page is open.
-   Direct database and storage requests from a non-member.

------------------------------------------------------------------------

## 13. Risks and decisions to make early

  -----------------------------------------------------------------------
  Risk or decision                    Recommendation
  ----------------------------------- -----------------------------------
  Scope grows too quickly             Keep the MVP to accounts, couple
                                      space, dates, photos, and timeline

  Private photos accidentally become  Private bucket, RLS/Storage
  public                              policies, short-lived signed URLs

  Invitation links are shared or      Random single-use tokens with
  reused                              expiry

  Uploads fail halfway                Track upload and metadata states;
                                      support cleanup and retry

  Couples want different currencies   Store an explicit currency code
                                      with budget values

  Time zones cause confusion          Store timestamps consistently and
                                      display them in the user's
                                      chosen/local time zone

  One partner deletes shared content  Confirm destructive actions and
                                      consider soft deletion or recovery

  Product becomes difficult to        Use migrations, typed data access,
  maintain                            and server-side validation
  -----------------------------------------------------------------------

### Product decisions to settle

-   Can a user belong to more than one couple space? For the first
    version, probably no.
-   Can a completed date be reopened? Decide before implementing status
    transitions.
-   Can either partner delete a date or photo? Define shared-content
    ownership clearly.
-   Should notes be editable by both partners or only their author?
-   What happens to shared content if one partner leaves?
-   What photo size and storage quota will the first version support?

------------------------------------------------------------------------

## 14. Suggested first GitHub issues

Create these as small, independently testable tasks:

1.  `[Setup] Initialize Next.js and TypeScript project`
2.  `[Setup] Configure Tailwind and component library`
3.  `[Database] Add initial Supabase migrations`
4.  `[Security] Add RLS policies and authorization tests`
5.  `[Auth] Implement sign-up and sign-in`
6.  `[Couples] Implement couple-space creation`
7.  `[Couples] Implement secure partner invitations`
8.  `[Dates] Build date idea CRUD`
9.  `[Dates] Add date status transitions`
10. `[Photos] Configure private storage bucket and policies`
11. `[Photos] Implement multi-photo upload`
12. `[Photos] Add captions and deletion`
13. `[Memories] Build chronological memory timeline`
14. `[Home] Build upcoming date and recent memories`
15. `[QA] Test authorization with unrelated accounts`
16. `[Launch] Deploy MVP and verify production configuration`

------------------------------------------------------------------------

## 15. Definition of done

The MVP is done when:

-   Two real accounts can securely share one couple space.
-   Either partner can add and schedule date ideas.
-   Either partner can mark a date completed and add a reflection.
-   Both partners can upload and view private photos attached to that
    date.
-   Completed dates appear in a useful chronological timeline.
-   An unrelated user cannot access the couple's database records or
    photos.
-   The experience works reliably on mobile and desktop.

**The first milestone is not a feature-rich couples platform. It is one
beautiful, reliable loop: suggest a date → plan it → enjoy it → save the
memory.**

Build that loop well, use it together, and let real usage decide what
LoveDump becomes next.
