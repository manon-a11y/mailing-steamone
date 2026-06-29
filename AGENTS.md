# Prototype Instructions

Run the local server yourself and open the preview in the in-app browser. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

## Durable design decisions

- Keep the existing premium hotel-room hero composition, lighting, marble table, and left-side copy space.
- The hero product grouping should feature the open black SteamOne travel case with handheld steamer and the upright tapered black SteamOne appliance supplied on June 18, 2026, replacing the previous steamer set.
- Use "Hotel garment steamers" as the hero eyebrow wording.
- In the hero description, start “and optimize housekeeping efficiency.” on a new line for
  readability over the background image.
- Display the Hyatt Regency logo without a visible white or checkerboard rectangle behind it.
- Display the Four Seasons logo without a visible white rectangle behind it.
- Display the Mandarin Oriental logo without a visible white or checkerboard rectangle behind it.
- Introduce Manon with “Good day, my name is Manon.”
- Use “Just to introduce myself” as the introduction section heading.
- Describe SteamOne as the French creator of garment steamers and a family-owned company with
  nearly 15 years of expertise, designing elegant, reliable and easy-to-use solutions.
- In the sample product-selection modal, show the contact reassurance note directly below the
  product-selection subtitle, using smaller, muted text with a subtle warm accent.
- Keep Marine's personalized page on a separate `/marine` route without changing the original
  `/hotels-steamone` page.
- On Marine's page, remove only the top-right "Request a sample" header action, use
  `/public/team/marine.jpg` for her portrait, and include `commercialOwner: Marine` in meeting
  and sample request submissions.
- Use Marine's supplied close-cropped black-blazer portrait for `/public/team/marine.jpg`, with
  the portrait shown in a reduced, centered card so Marine feels present but not visually dominant
  across responsive widths.
- On Marine's page, show `marine-room-steamers.png` above "Why a steamer in the room?" and
  `marine-steamone-products.png` above "Why SteamOne?".
- On Marine's page, justify the body text inside the two "Why" cards, and keep the sample
  product-selection modal visually limited to large, non-clickable product photos only, without
  visible text, sample-request actions, or "Request this sample" buttons.
- Keep commercial landing pages in a single deployment with separate page configs. Manon uses
  `commercialOwner: Manon` and `NOTIFICATION_EMAIL`; Marine uses `commercialOwner: Marine` and
  `MARINE_NOTIFICATION_EMAIL`, falling back to `NOTIFICATION_EMAIL` when the Marine-specific
  variable is absent.
