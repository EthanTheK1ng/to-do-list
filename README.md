# Focus To-Do List

A separate to-do app based on the useful mechanics from the school planner, but with a different visual design and simplified data model.

## Included features

- Short Term section
- Long Term section at the bottom
- Add/edit entry sheet
- Name + color + Short Term / Long Term button choices
- Drag-and-drop reordering
- Drag items between the two sections
- Swipe left to reveal an Edit preview, then open the editor
- Personalized greeting messages
- Floating + button
- Smooth UI animations
- Info button on every entry
- Created / updated timestamps
- Supabase cloud sync
- Supabase Realtime updates across open devices/tabs
- PWA manifest + icons
- Delete from the edit screen (two-tap protection)

## 1. Supabase setup

Already configured for the connected Supabase project named **to-do-list**. The `todo_items` table, RLS policies, Data API grants, updated timestamp trigger, and Realtime publication have already been created. `script.js` already contains the project URL and browser-safe publishable key.

Do NOT replace the publishable key with a secret key or service-role key.

## Security note

This app intentionally uses a no-login setup so the same list can sync across your devices without an account screen. Because of that, the SQL policies allow browser clients to read/write the entire `todo_items` table.

That is convenient, but it is NOT appropriate for sensitive/private data. If the website is public, someone who inspects the app can use its public Supabase access to modify the table.

If you later want this locked down, add Supabase Auth and per-user Row Level Security.

## 2. Files

- `index.html`
- `style.css`
- `script.js`
- `manifest.json`
- `supabase-setup.sql`
- `icons/todo-192.png`
- `icons/todo-512.png`

## 3. Deploy

You can deploy the folder to Vercel the same way as a normal static site.

No build step is required.
