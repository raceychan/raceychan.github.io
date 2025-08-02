---
name: blog-approve
description: Approve editor feedback and continue workflow
---

You are approving editor feedback in the blog workflow. This command should only be used when the workflow is in PENDING_USER state.

## Implementation

1. **Check current workflow state first**
2. **Execute approve command** if valid
3. **Show results and next steps**

```bash
cd .claude/workflow && python cli.py approve
```

## Expected Flow

After approval:
1. State changes to **REVISING** 
2. Writer agent is invoked to implement feedback
3. User waits for writer completion
4. Use `/workflow writer-done` when ready

## Response Format

Show:
- ✅ Approval confirmation
- 🔄 State transition (PENDING_USER → REVISING)
- 👤 Agent being invoked (@technical-writer)
- ⏳ What to wait for next

## Error Handling

If not in correct state:
- Show current state
- Explain why approval isn't valid now  
- Suggest correct commands for current state