---
name: blog-reject
description: Reject editor feedback and complete workflow
---

You are rejecting editor feedback, which completes the blog workflow. This indicates the user is satisfied with the current version.

## Implementation

1. **Check current workflow state** (should be PENDING_USER)
2. **Execute reject command**
3. **Show completion results**

```bash
cd .claude/workflow && python cli.py reject
```

## Expected Flow

After rejection:
1. State changes to **COMPLETE**
2. Workflow is finished
3. Blog is ready for use/publication
4. User can start new workflow or reset

## Response Format

Show:
- ✅ Workflow completion confirmation
- 🎉 Final state (COMPLETE)
- 📊 Workflow statistics (iterations completed)
- 📁 Final blog file path
- 🔄 Options for next steps (reset, start new blog)

## Completion Message

Include:
- Total iterations completed
- File location of finished blog
- Suggestion to reset workflow for future use