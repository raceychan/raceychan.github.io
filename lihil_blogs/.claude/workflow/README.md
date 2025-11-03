# Blog Workflow FSM Controller

A complete Finite State Machine implementation for managing blog writer-editor workflows with built-in safety mechanisms, user approval gates, and state persistence.

## Features

✅ **Predictable Workflow**: Clear state transitions prevent confusion  
✅ **Loop Prevention**: Built-in safeguards against infinite cycles  
✅ **User Control**: User approval required for all automated actions  
✅ **State Persistence**: Save/load workflow state across sessions  
✅ **Error Recovery**: Robust error handling and recovery mechanisms  
✅ **CLI Interface**: Interactive and command-line interfaces available  
✅ **Logging**: Complete audit trail of workflow transitions  

## Architecture

### Core Components

1. **BlogWorkflowFSM** - Core finite state machine with 7 states
2. **AgentController** - Integration layer for Claude Code agents  
3. **CLI Interface** - Command-line and interactive interfaces
4. **State Persistence** - JSON-based state saving/loading

### Workflow States

```
IDLE → WRITING → REVIEWING → PENDING_USER → REVISING → COMPLETE
  ↑                                ↓
  └─────────── RESET ←─────────────┘
```

- **IDLE**: Ready for new work
- **WRITING**: Writer agent creating/modifying content
- **REVIEWING**: Editor agent analyzing content  
- **PENDING_USER**: Waiting for user approval
- **REVISING**: Writer implementing editor feedback
- **COMPLETE**: Work finished, user satisfied
- **ERROR**: Error state with recovery options

## Quick Start

### Basic Usage

```python
from agent_controller import AgentController

# Create controller
controller = AgentController()

# Start workflow
result = controller.start_blog_workflow(
    user_input="Write about Python decorators",
    file_path="drafts/decorators.md"
)

# Handle agent completions
result = controller.handle_agent_completion("technical-writer", {
    "file_path": "drafts/decorators.md"
})

# Handle user responses
result = controller.handle_user_response("yes")  # or "no"
```

### CLI Interface

```bash
# Interactive mode
python cli.py --interactive

# Direct commands
python cli.py start "My blog topic"
python cli.py status
python cli.py approve
python cli.py writer-done --file path/to/blog.md
python cli.py editor-done "Great content, fix typos"
```

### Interactive Mode Commands

```
> start "Blog about Python typing"
> writer-done /path/to/draft.md
> editor-done "Good content, needs examples"  
> approve
> writer-done
> reject  # If satisfied with current version
```

## Safety Mechanisms

### Infinite Loop Prevention
- **Max iteration limit**: Default 5 revision cycles
- **User approval gates**: Every automated action requires approval
- **Timeout handling**: Auto-complete after 30 minutes of inactivity

### Error Recovery
- **Invalid transitions**: Maintain current state, show valid options
- **Agent failures**: Graceful fallback with recovery suggestions
- **State corruption**: Automatic state validation and repair

## Configuration

Create `.claude/workflow/config.json`:

```json
{
  "max_iterations": 5,
  "timeout_minutes": 30,
  "auto_backup": true,
  "safety_checks": true
}
```

## State Persistence

Workflow state is automatically saved to:
- `.claude/workflow/state.json` - FSM state
- `.claude/workflow/controller_state.json` - Controller state
- `.claude/workflow/workflow.log` - Activity log

## Integration with Claude Code Agents

### Agent Hooks

Add to your agent prompts:

```markdown
## FSM Integration
When completing work, trigger the appropriate workflow transition:
- Writer completion: Signal via workflow controller
- Editor completion: Provide feedback via workflow controller
```

### Example Agent Integration

```python
# In agent completion handler
if agent_name == "technical-writer":
    controller.handle_agent_completion("technical-writer", {
        "file_path": result_file_path
    })
```

## Examples

Run the examples:

```bash
python example_usage.py
```

This demonstrates:
- Basic workflow cycles
- Status monitoring  
- State persistence
- Error handling
- Iteration limits

## File Structure

```
.claude/workflow/
├── __init__.py           # Package init
├── blog_fsm.py          # Core FSM implementation  
├── agent_controller.py  # Agent integration layer
├── cli.py              # Command-line interface
├── example_usage.py    # Usage examples
├── README.md           # This file
├── config.json         # Configuration (optional)
├── state.json          # FSM state (auto-generated)
├── controller_state.json # Controller state (auto-generated)
└── workflow.log        # Activity log (auto-generated)
```

## API Reference

### BlogWorkflowFSM

```python
fsm = BlogWorkflowFSM()
fsm.transition(WorkflowTrigger.USER_REQUEST_BLOG, user_input="content")
fsm.get_status()
fsm.save_state() / fsm.load_state()
```

### AgentController  

```python
controller = AgentController()
controller.start_blog_workflow(content, file_path)
controller.handle_agent_completion(agent_name, result)
controller.handle_user_response(response)
controller.execute_workflow_action(action_result)
```

## Advanced Usage

### Custom State Transitions

```python
# Add custom error recovery
fsm.transitions[(WorkflowState.ERROR, WorkflowTrigger.CUSTOM)] = custom_handler

# Custom timeout handling
fsm.context.timeout_minutes = 60
```

### Workflow Hooks

```python
# Pre/post transition hooks
def on_state_change(old_state, new_state, trigger):
    print(f"Transition: {old_state} -> {new_state}")

controller.fsm.add_hook("state_change", on_state_change)
```

## Troubleshooting

### Common Issues

1. **Invalid Transition Error**
   - Check current state with `status` command
   - Use `get_valid_triggers()` to see available actions

2. **State Loading Failed**
   - Check file permissions on `.claude/workflow/`
   - Verify JSON files are not corrupted

3. **Infinite Loop**
   - Check `max_iterations` setting
   - Verify user approval gates are working

### Recovery Commands

```bash
python cli.py reset        # Reset to idle state
python cli.py load         # Reload last saved state
python cli.py status       # Check current state
```

## Contributing

This is a complete, production-ready FSM implementation. Extensions welcome:

- Additional workflow states (PUBLISHING, ARCHIVING)
- Integration with more agents
- Advanced error recovery strategies
- Metrics and analytics
- Web UI interface

## License

Part of the Claude Code blog management system.