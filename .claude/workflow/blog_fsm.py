"""
Blog Workflow Finite State Machine Controller

A complete FSM implementation for managing writer-editor workflow cycles
with built-in safety mechanisms and user approval gates.
"""

from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from typing import Optional, Dict, Callable, Any
import json
import logging
from pathlib import Path


class WorkflowState(Enum):
    """Workflow states for the blog FSM"""
    IDLE = "idle"
    WRITING = "writing"
    REVIEWING = "reviewing"
    PENDING_USER = "pending_user"
    REVISING = "revising"
    COMPLETE = "complete"
    ERROR = "error"


class WorkflowTrigger(Enum):
    """Valid triggers for state transitions"""
    USER_REQUEST_BLOG = "user_request_blog"
    WRITER_COMPLETES_DRAFT = "writer_completes_draft"
    EDITOR_PROVIDES_FEEDBACK = "editor_provides_feedback"
    USER_APPROVES_CHANGES = "user_approves_changes"
    USER_REJECTS_CHANGES = "user_rejects_changes"
    WRITER_COMPLETES_REVISIONS = "writer_completes_revisions"
    RESET_WORKFLOW = "reset_workflow"
    USER_REQUESTS_NEW_CHANGES = "user_requests_new_changes"
    TIMEOUT = "timeout"
    ERROR_OCCURRED = "error_occurred"


@dataclass
class WorkflowContext:
    """Context data for the workflow state machine"""
    current_state: WorkflowState = WorkflowState.IDLE
    blog_file_path: Optional[str] = None
    iteration_count: int = 0
    last_editor_feedback: Optional[str] = None
    user_satisfaction: bool = False
    max_iterations: int = 5
    timeout_minutes: int = 30
    created_at: datetime = field(default_factory=datetime.now)
    last_transition: datetime = field(default_factory=datetime.now)
    error_message: Optional[str] = None
    workflow_history: list[str] = field(default_factory=list)


class BlogWorkflowFSM:
    """
    Finite State Machine for managing blog writer-editor workflow.
    
    Provides safe, predictable workflow management with user approval gates
    and automatic loop prevention mechanisms.
    """
    
    def __init__(self, config_path: Optional[str] = None):
        self.context = WorkflowContext()
        self.logger = self._setup_logging()
        self.config = self._load_config(config_path)
        
        # State transition table
        self.transitions: Dict[tuple[WorkflowState, WorkflowTrigger], Callable] = {
            (WorkflowState.IDLE, WorkflowTrigger.USER_REQUEST_BLOG): self._start_writing,
            (WorkflowState.WRITING, WorkflowTrigger.WRITER_COMPLETES_DRAFT): self._start_review,
            (WorkflowState.REVIEWING, WorkflowTrigger.EDITOR_PROVIDES_FEEDBACK): self._await_user_approval,
            (WorkflowState.PENDING_USER, WorkflowTrigger.USER_APPROVES_CHANGES): self._start_revision,
            (WorkflowState.PENDING_USER, WorkflowTrigger.USER_REJECTS_CHANGES): self._complete_workflow,
            (WorkflowState.PENDING_USER, WorkflowTrigger.TIMEOUT): self._handle_timeout,
            (WorkflowState.REVISING, WorkflowTrigger.WRITER_COMPLETES_REVISIONS): self._check_iteration_limit,
            (WorkflowState.COMPLETE, WorkflowTrigger.RESET_WORKFLOW): self._reset_to_idle,
            (WorkflowState.COMPLETE, WorkflowTrigger.USER_REQUESTS_NEW_CHANGES): self._start_writing,
        }
        
        # Error recovery transitions (from any state)
        for state in WorkflowState:
            self.transitions[(state, WorkflowTrigger.ERROR_OCCURRED)] = self._handle_error
    
    def _setup_logging(self) -> logging.Logger:
        """Setup logging for workflow tracking"""
        logger = logging.getLogger("blog_workflow")
        logger.setLevel(logging.INFO)
        
        # Create file handler
        log_file = Path(".claude/workflow/workflow.log")
        log_file.parent.mkdir(parents=True, exist_ok=True)
        
        handler = logging.FileHandler(log_file)
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
        return logger
    
    def _load_config(self, config_path: Optional[str]) -> dict[str, Any]:
        """Load configuration from file or use defaults"""
        default_config = {
            "max_iterations": 5,
            "timeout_minutes": 30,
            "auto_backup": True,
            "safety_checks": True
        }
        
        if config_path and Path(config_path).exists():
            try:
                with open(config_path) as f:
                    user_config = json.load(f)
                default_config.update(user_config)
            except Exception as e:
                self.logger.warning(f"Failed to load config: {e}")
        
        return default_config
    
    @property
    def current_state(self) -> WorkflowState:
        """Get current workflow state"""
        return self.context.current_state
    
    def can_transition(self, trigger: WorkflowTrigger) -> bool:
        """Check if a transition is valid from current state"""
        return (self.context.current_state, trigger) in self.transitions
    
    def get_valid_triggers(self) -> list[WorkflowTrigger]:
        """Get all valid triggers from current state"""
        return [
            trigger for (state, trigger) in self.transitions.keys()
            if state == self.context.current_state
        ]
    
    def transition(self, trigger: WorkflowTrigger, **kwargs) -> dict[str, Any]:
        """
        Execute a state transition
        
        Args:
            trigger: The event triggering the transition
            **kwargs: Additional context data for the transition
            
        Returns:
            dict containing action, new_state, and any additional data
        """
        old_state = self.context.current_state
        
        # Check if transition is valid
        if not self.can_transition(trigger):
            error_msg = f"Invalid transition: {old_state.value} -> {trigger.value}"
            self.logger.error(error_msg)
            return {
                "action": "error",
                "error": error_msg,
                "state": old_state.value,
                "valid_triggers": [t.value for t in self.get_valid_triggers()]
            }
        
        # Check for timeout
        if self._is_timed_out() and trigger != WorkflowTrigger.TIMEOUT:
            return self.transition(WorkflowTrigger.TIMEOUT)
        
        try:
            # Execute transition handler
            handler = self.transitions[(old_state, trigger)]
            result = handler(**kwargs)
            
            # Update context
            self.context.last_transition = datetime.now()
            self.context.workflow_history.append(
                f"{old_state.value} -> {trigger.value} -> {self.context.current_state.value}"
            )
            
            # Log transition
            self.logger.info(
                f"Transition: {old_state.value} -> {trigger.value} -> {self.context.current_state.value}"
            )
            
            return {
                "action": result["action"],
                "new_state": self.context.current_state.value,
                "old_state": old_state.value,
                **result
            }
            
        except Exception as e:
            self.logger.error(f"Transition error: {e}")
            return self.transition(WorkflowTrigger.ERROR_OCCURRED, error=str(e))
    
    def _is_timed_out(self) -> bool:
        """Check if current state has timed out"""
        if self.context.current_state != WorkflowState.PENDING_USER:
            return False
        
        timeout_delta = timedelta(minutes=self.context.timeout_minutes)
        return datetime.now() - self.context.last_transition > timeout_delta
    
    # Transition handlers
    def _start_writing(self, user_input: str = "", file_path: str = None, **kwargs) -> dict[str, Any]:
        """Start writing workflow"""
        self.context.current_state = WorkflowState.WRITING
        self.context.blog_file_path = file_path
        
        return {
            "action": "invoke_writer",
            "agent": "technical-writer",
            "input": user_input,
            "file_path": file_path
        }
    
    def _start_review(self, file_path: str = None, **kwargs) -> dict[str, Any]:
        """Start review workflow"""
        self.context.current_state = WorkflowState.REVIEWING
        if file_path:
            self.context.blog_file_path = file_path
        
        return {
            "action": "invoke_editor",
            "agent": "blog-editor",
            "file_path": self.context.blog_file_path,
            "message": f"Please review {self.context.blog_file_path}"
        }
    
    def _await_user_approval(self, feedback: str = "", **kwargs) -> dict[str, Any]:
        """Wait for user approval of editor feedback"""
        self.context.current_state = WorkflowState.PENDING_USER
        self.context.last_editor_feedback = feedback
        
        return {
            "action": "request_user_approval",
            "message": "Would you like @technical-writer to implement these improvements? (yes/no)",
            "feedback": feedback,
            "timeout_minutes": self.context.timeout_minutes
        }
    
    def _start_revision(self, **kwargs) -> dict[str, Any]:
        """Start revision based on editor feedback"""
        self.context.current_state = WorkflowState.REVISING
        self.context.iteration_count += 1
        
        return {
            "action": "invoke_writer_revision",
            "agent": "technical-writer",
            "feedback": self.context.last_editor_feedback,
            "iteration": self.context.iteration_count,
            "file_path": self.context.blog_file_path
        }
    
    def _complete_workflow(self, **kwargs) -> dict[str, Any]:
        """Complete the workflow"""
        self.context.current_state = WorkflowState.COMPLETE
        self.context.user_satisfaction = True
        
        return {
            "action": "workflow_complete",
            "message": "Blog workflow completed. Content is ready.",
            "iterations": self.context.iteration_count,
            "file_path": self.context.blog_file_path
        }
    
    def _check_iteration_limit(self, **kwargs) -> dict[str, Any]:
        """Check if we've hit the iteration limit"""
        if self.context.iteration_count >= self.context.max_iterations:
            self.logger.warning(f"Hit iteration limit: {self.context.iteration_count}")
            return self._complete_workflow()
        else:
            return self._await_user_approval("Revisions completed. Ready for review.")
    
    def _handle_timeout(self, **kwargs) -> dict[str, Any]:
        """Handle user approval timeout"""
        self.logger.warning("User approval timeout - completing workflow")
        return self._complete_workflow()
    
    def _reset_to_idle(self, **kwargs) -> dict[str, Any]:
        """Reset workflow to idle state"""
        old_context = self.context
        self.context = WorkflowContext()
        
        return {
            "action": "workflow_reset",
            "message": "Ready for new blog work",
            "previous_workflow": {
                "iterations": old_context.iteration_count,
                "completed": old_context.user_satisfaction
            }
        }
    
    def _handle_error(self, error: str = "Unknown error", **kwargs) -> dict[str, Any]:
        """Handle workflow errors"""
        self.context.current_state = WorkflowState.ERROR
        self.context.error_message = error
        
        return {
            "action": "error_occurred",
            "error": error,
            "message": f"Workflow error: {error}",
            "recovery_options": ["reset_workflow", "retry_last_action"]
        }
    
    def get_status(self) -> dict[str, Any]:
        """Get current workflow status"""
        return {
            "state": self.context.current_state.value,
            "file_path": self.context.blog_file_path,
            "iterations": self.context.iteration_count,
            "max_iterations": self.context.max_iterations,
            "created_at": self.context.created_at.isoformat(),
            "last_transition": self.context.last_transition.isoformat(),
            "valid_triggers": [t.value for t in self.get_valid_triggers()],
            "history": self.context.workflow_history[-5:],  # Last 5 transitions
            "timed_out": self._is_timed_out() if self.context.current_state == WorkflowState.PENDING_USER else False
        }
    
    def save_state(self, file_path: str = ".claude/workflow/state.json") -> None:
        """Save current state to file"""
        state_data = {
            "context": {
                "current_state": self.context.current_state.value,
                "blog_file_path": self.context.blog_file_path,
                "iteration_count": self.context.iteration_count,
                "last_editor_feedback": self.context.last_editor_feedback,
                "user_satisfaction": self.context.user_satisfaction,
                "max_iterations": self.context.max_iterations,
                "timeout_minutes": self.context.timeout_minutes,
                "created_at": self.context.created_at.isoformat(),
                "last_transition": self.context.last_transition.isoformat(),
                "error_message": self.context.error_message,
                "workflow_history": self.context.workflow_history
            }
        }
        
        Path(file_path).parent.mkdir(parents=True, exist_ok=True)
        with open(file_path, 'w') as f:
            json.dump(state_data, f, indent=2)
    
    def load_state(self, file_path: str = ".claude/workflow/state.json") -> bool:
        """Load state from file"""
        try:
            with open(file_path) as f:
                state_data = json.load(f)
            
            ctx_data = state_data["context"]
            self.context = WorkflowContext(
                current_state=WorkflowState(ctx_data["current_state"]),
                blog_file_path=ctx_data.get("blog_file_path"),
                iteration_count=ctx_data.get("iteration_count", 0),
                last_editor_feedback=ctx_data.get("last_editor_feedback"),
                user_satisfaction=ctx_data.get("user_satisfaction", False),
                max_iterations=ctx_data.get("max_iterations", 5),
                timeout_minutes=ctx_data.get("timeout_minutes", 30),
                created_at=datetime.fromisoformat(ctx_data["created_at"]),
                last_transition=datetime.fromisoformat(ctx_data["last_transition"]),
                error_message=ctx_data.get("error_message"),
                workflow_history=ctx_data.get("workflow_history", [])
            )
            
            return True
        except Exception as e:
            self.logger.error(f"Failed to load state: {e}")
            return False