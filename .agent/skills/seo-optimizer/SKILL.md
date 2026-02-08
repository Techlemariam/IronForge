---
name: seo-optimizer
description: Meta tags, structured data, and Open Graph optimization
version: 1.0.0
category: marketing
owner: "@ui-ux"
platforms: ["windows", "linux", "macos"]
requires: []
context:
  primarySources:
    - src/app/layout.tsx
    - src/lib/metadata.ts
  references:
    - next.config.ts
---

# 🔍 SEO Optimizer

Ensures pages are discoverable and shareable.

## Checklist

- [ ] Title tag unique per page
- [ ] Meta description < 160 chars
- [ ] Open Graph image (1200x630)
- [ ] Canonical URLs set
- [ ] Structured data (JSON-LD)

## Next.js Metadata

```typescript
export const metadata: Metadata = {
  title: 'IronForge - Train Like a Titan',
  description: 'Gamified fitness tracking...',
  openGraph: {
    images: ['/og-image.png'],
  },
};
```

## Integration

- `ui-ux.md`: Include in design reviews
- `pre-deploy.md`: Validate before launch
