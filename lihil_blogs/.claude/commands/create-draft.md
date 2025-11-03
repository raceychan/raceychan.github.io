---
description: Create a new draft file in the drafts folder with template structure
allowed-tools: Write, Read
---

Create a new draft file in the `drafts/` folder with the filename provided in arguments (or prompt for one if not provided).

The draft should include this template structure:

```markdown
# Draft: [Topic Title]

## Core Thesis
- Main argument or point you want to prove
- Why this matters to developers

## Key Ideas
- Bullet points of concepts to cover
- Examples or analogies that came to mind
- Problems this solves

## Code Examples (rough)
```python
# Add rough code snippets or pseudocode here
```

## Random Thoughts
- Any scattered ideas
- Questions to explore
- Related concepts

## Structure Ideas
- Introduction approach
- Main sections to cover
- Conclusion direction
```

If no filename is provided in $ARGUMENTS, ask the user for a descriptive filename (without .md extension).
Name the file as `draft_[filename].md` in the drafts folder.