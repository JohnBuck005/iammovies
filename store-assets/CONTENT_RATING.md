# Google Play Content Rating Questionnaire Answers
# Use these answers when filling out the IARC rating questionnaire
# VERIFIED against the shipped build: 2026-09-25 (commit 0868b99)

## General

**Category:** Entertainment (video streaming)
**App pricing:** Free to install
**Ads:** None

## Questions:

### Violence
- Does the app contain violence? **No**
  (Drama series may contain dramatic conflict; no graphic or realistic violence)

### Sexual Content
- Does the app contain sexual content or nudity? **No**

### Language
- Does the app contain profanity or crude humor? **No** (unless specific series content contains mild language — rate conservatively)

### Controlled Substances
- Does the app reference or depict use of controlled substances? **No**

### User Interaction
- Can users interact with each other? **No** (no chat, comments, or social features)

### Sharing Location
- Can users share their location with other users? **No**

### In-App Purchases
- Does the app offer in-app purchases? **No**
  - The shipped build contains **no Play Billing SDK** (no `BillingClient`) and no configured
    payment provider (PayPal/Stripe keys are empty in the build).
  - The Subscribe screen renders an external PayPal button, but checkout is **not enabled** —
    nothing can actually be purchased inside the app.
  - ⚠️ **If payments are switched on later:** re-answer this question **Yes** and use
    **Google Play Billing** for in-app digital goods (external payment links for digital
    content are a Play policy risk).

### Personal Information
- Does the app ask for or request personal information? **Yes** (email address for sign-in / magic link)

### Unrated Content
- Does the app contain any unrated content that may not be suitable for children? **No**

---

## Expected Rating

Based on the above answers:
- **IARC:** PEGI 12 / ESRB Teen / equivalent
- **Google Play:** Teen (13+)

## Content Descriptors
- **Digital Purchases** — No (none in the shipped build)

## Interactive Elements
- **Users Interact** — No
- **Shares Location** — No
- **Digital Purchases** — No

## Console checklist (beyond IARC)
- Target audience: 13+ (not directed to families / no Families badge)
- App access for review: login is **email magic link** — provide a test account or an
  email+link workaround in the "App access" section, otherwise review can stall
- Data safety form: see `DATA_SAFETY_FORM.md` (must match this build exactly)
