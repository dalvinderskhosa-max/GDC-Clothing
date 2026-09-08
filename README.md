# GDC Clothing — Headless Storefront

A headless storefront for **GDC Clothing** built with **Next.js 14 (App Router)** + **Tailwind CSS**,
pulling live data from the **Shopify Storefront API** and handing off to **Shopify's hosted checkout**.
Designed to deploy on **Netlify**.

Design goal: an editorial, Gymking-inspired layout that feels full even with a lean catalogue
(big hero, category tiles, product spotlight, lookbook, brand-story bands).

---

## Features

- 🏬 Live products / collections / menu from Shopify Storefront API
- 🛒 Cart via Storefront Cart API (cookie-persisted) → **checkout stays on Shopify** (`checkoutUrl`)
- 🎯 Email + phone **lead-capture popup** → creates a Shopify customer with marketing consent
- 📰 Newsletter band, blog (`/blogs/the-grind`), CMS pages (`/pages/*`), lookbook
- 📱 Fully responsive, sticky nav, mobile drawer, animated marquee
- 🔎 SEO metadata + Product JSON-LD

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in real values
npm run dev                  # http://localhost:3000
```

## Environment variables

Set these in `.env.local` (local) and in **Netlify → Site settings → Environment variables** (production):

| Variable | Purpose | Public? |
|---|---|---|
| `SHOPIFY_STORE_DOMAIN` | `7gh6iu-fz.myshopify.com` | — |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Storefront API (products, cart) | ok if exposed |
| `SHOPIFY_ADMIN_API_TOKEN` | Admin API — **popup customer capture only** | **SECRET, server-only** |
| `SHOPIFY_API_VERSION` | e.g. `2025-07` | — |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for metadata | public |

## ⚠️ Required Shopify setup for the popup

The email/phone popup writes to Shopify via the Admin API. Your app token must have the
**`write_customers`** scope (and `read_customers`). If it doesn't, the popup returns a 502 and the
server logs `requires merchant approval for write_customers scope`.

1. Shopify admin → **Settings → Apps and sales channels → Develop apps → [your app]**
2. **Configuration → Admin API integration → Edit scopes**
3. Enable **`write_customers`** and **`read_customers`** → **Save**
4. **Install / update** the app, then copy the **Admin API access token** into `SHOPIFY_ADMIN_API_TOKEN`.

> Everything else (browsing, cart, checkout) needs only the **Storefront** token and works today.

## 🔐 Security

- `.env.local` is git-ignored — never commit tokens.
- The Admin token that was shared in chat is **compromised**; regenerate it and use the new value.
- Storefront API calls run server-side (React Server Components), so no token is shipped to the browser.

## Deploy to Netlify

```bash
# Option A — CLI
netlify login
netlify init          # link/create the site
netlify env:import .env.local   # (or set vars in the dashboard)
netlify deploy --build --prod

# Option B — Git
# Push to GitHub, "Add new site" in Netlify, set env vars in the dashboard.
```

`netlify.toml` is already configured (`@netlify/plugin-nextjs`, Node 18.20.5).
After the first deploy, set `NEXT_PUBLIC_SITE_URL` to your Netlify URL (or custom domain).

## Project structure

```
app/                     # routes (home, collections, products, pages, blogs, api/subscribe)
components/
  layout/                # header, footer, marquee
  product/               # card, grid, gallery, PDP form
  cart/                  # cart context + drawer
  popup/                 # lead popup + newsletter form
  home/                  # homepage section helpers
lib/
  shopify/               # Storefront API client, queries, types
  cart/actions.ts        # cart server actions
  utils.ts
```
