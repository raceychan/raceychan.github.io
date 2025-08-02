---
description: Create a new blog post folder with auto-generated name following current pattern
allowed-tools: Bash, Write, Read, LS
---

Create a new blog post folder in the `blog/` directory following the existing naming pattern: `YYYY-MM-DDTHH_MM-title-with-dashes/`

Steps:
1. Generate current timestamp in the format `YYYY-MM-DDTHH_MM`
2. Convert the title from $ARGUMENTS to lowercase with dashes (replace spaces with dashes, remove special chars)
3. Create the folder: `blog/[timestamp]-[title]/`
4. Create a `content.md` file inside with basic blog post template:

```markdown
---
slug: [title]
title: [Title Case]
authors: [raceychan]
tags: []
draft: true
---

# [Title]

## Introduction

## [Main Content Sections]

## Conclusion
```

If no title is provided in $ARGUMENTS, ask the user for a blog post title.

Example usage:
- `/create-blogpost async patterns in python` → `blog/2025-08-02T14_30-async-patterns-in-python/`
- `/create-blogpost "Web Framework Design"` → `blog/2025-08-02T14_30-web-framework-design/`