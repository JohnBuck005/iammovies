# Google Play Data Safety Form
# Fill these answers into the Google Play Console data safety section

## Data Collection

### Does your app collect or share any of the required user data types?
**Yes**

### Data types collected:

**Personal Info**
- Email address — Collected, Shared (with payment processor for transactions), Required for app functionality
  - Purpose: App functionality, Account management
  - Is it required? Yes

**App Activity**
- Page views and taps — Collected, Not shared
  - Purpose: Analytics
  - Is it required? No (can opt out)

- Other user-generated content (watchlist, viewing history) — Collected, Not shared
  - Purpose: App functionality
  - Is it required? No

**App Info and Performance**
- Crash logs — Collected, Not shared
  - Purpose: Analytics, App functionality
  - Is it required? No

**Device or Other IDs**
- Device push token — Collected, Not shared
  - Purpose: App functionality (push notifications)
  - Is it required? No

### Data NOT collected:
- Physical address
- Phone number
- Photos or videos
- Audio files
- Files and docs
- Calendar
- Contacts
- Health & fitness
- Financial info (credit/debit cards — handled entirely by PayPal, not stored by app)
- Precise location
- Browsing history
- Search history

---

## Security Practices

### Is data encrypted in transit?
**Yes** — All data transmitted over HTTPS

### Can users request data deletion?
**Yes** — Users can request deletion via email or in-app

### Is the app committed to following the Families Policy?
**No** — App is rated Teen (13+)

---

## Data Sharing

### Is user data shared with third parties?
**Yes** — Email address is shared with PayPal for payment processing only

### Third parties:
- **PayPal** — Payment processing
- **Vercel** — Hosting (server-side, not user data)
- **Supabase** — Database/auth provider
