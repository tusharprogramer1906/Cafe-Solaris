# AI Growth System for Cafes

Production-ready SaaS app built with:

- Next.js App Router
- Tailwind CSS
- Supabase (DB + Auth)
- Stripe (subscriptions)
- Notion API
- OpenAI API

## Features Included

- Premium dark-themed landing page with lead form (`Book Demo`)
- Lead capture API with Supabase insert
- AI auto-reply generator (WhatsApp-style) and conversation storage
- Automation flow after lead submit:
  - AI reply generation
  - Conversation insert
  - Notion database row creation
  - Email reply sending (SMTP)
- Review reply generator (positive/negative logic)
- Instagram content generator API (captions, hashtags, reel ideas)
- Protected dashboard at `/dashboard` with:
  - Total leads
  - Recent leads
  - Conversations
  - Lead status card
  - Stripe checkout buttons
  - AI tools
- Stripe subscription checkout + webhook -> `clients` table

## 1) Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
copy .env.example .env.local
```

3. Fill all required values in `.env.local`.

4. Run dev server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## 2) Environment Variables

Use `.env.example` as reference:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `CAFE_NAME`
- `NOTION_API_KEY`
- `NOTION_DATABASE_ID`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_EMAIL`
- `LEAD_REPLY_FALLBACK_EMAIL`
- `DEFAULT_OWNER_PHONE`

## 3) Supabase Setup Guide

1. Create a Supabase project.
2. In SQL editor, run `supabase/schema.sql`.
3. Enable Email auth in Supabase Auth settings.
4. Create at least one dashboard user via signup on `/login`.
5. Add these keys in `.env.local`:
   - Project URL -> `NEXT_PUBLIC_SUPABASE_URL`
   - anon key -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service role key -> `SUPABASE_SERVICE_ROLE_KEY`

### Tables created

- `leads` (`id`, `name`, `phone`, `message`, `source`, `status`, `created_at`)
- `conversations` (`id`, `lead_id`, `message`, `reply`, `created_at`)
- `clients` (`id`, `business_name`, `owner_name`, `phone`, `plan`, `created_at`)

## 4) Stripe Webhook Guide

1. Create Stripe secret key and add `STRIPE_SECRET_KEY`.
2. Start local dev server.
3. Install Stripe CLI and login.
4. Forward webhooks:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

5. Copy signing secret from CLI output into `STRIPE_WEBHOOK_SECRET`.
6. Trigger test event:

```bash
stripe trigger checkout.session.completed
```

On successful event, client data is inserted in `clients`.

## 5) Notion Setup Guide

1. Create a Notion integration and copy API key.
2. Create a Notion database with properties:
   - `Name` (Title)
   - `Phone` (Rich text)
   - `Status` (Select)
   - `Message` (Rich text)
   - `Created Time` (Date)
3. Share the database with the integration.
4. Copy database ID from Notion URL and add:
   - `NOTION_API_KEY`
   - `NOTION_DATABASE_ID`

## 6) API Endpoints

- `POST /api/leads` - create lead and run automation
- `POST /api/ai/lead-reply` - generate/store AI reply for a lead
- `POST /api/review-reply` - generate review response
- `POST /api/content/generate` - generate social content
- `POST /api/stripe/checkout` - create Stripe subscription checkout session
- `POST /api/stripe/webhook` - Stripe webhook listener

## 7) Production Notes

- Set all env vars in hosting provider (Vercel/other).
- Use secure SMTP provider for outbound email.
- Configure Stripe webhook endpoint in dashboard for production URL.
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only.
