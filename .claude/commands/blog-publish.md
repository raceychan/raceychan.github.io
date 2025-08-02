---
description: Publish a draft to a new blog post folder
allowed-tools: Bash, Write, Read, LS, Glob
---

Publish an existing draft from the `drafts/` folder to a new blog post folder in `blog/` directory.

Steps:
1. Find the draft file matching the title from $ARGUMENTS
2. Read the draft content
3. Generate current timestamp in format `YYYY-MM-DDTHH_MM`
4. Convert title to lowercase with dashes (replace spaces with dashes, remove special chars)
5. Create blog folder: `blog/[timestamp]-[title]/`
6. Create `content.md` with proper frontmatter and draft content
7. Remove `draft: true` from frontmatter to publish

The published blog post should use this template:

```markdown
---
slug: [title-with-dashes]
title: [Original Title Case]
authors: [raceychan]
tags: []
---

[Draft content with proper formatting]
```

Search logic:
- Look for draft files in `drafts/` that match the title
- Use fuzzy matching (partial title match in filename)
- If multiple matches, ask user to specify
- If no matches, list available drafts

Example usage:
- `/blog-publish Encapsulation Beyond Syntax` → finds `draft_encapsulation_beyond_syntax_why_access_modifiers_still_matter.md` and publishes to `blog/2025-08-02T14_30-encapsulation-beyond-syntax-why-access-modifiers-still-matter/`

If no title provided in $ARGUMENTS, list all available drafts for user to choose from.