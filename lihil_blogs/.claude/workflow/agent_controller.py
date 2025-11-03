"""
Agent Controller for Blog Workflow FSM

Provides integration between the FSM and Claude Code agents,
handling agent invocations and workflow orchestration.
"""

import subprocess
import json
from pathlib import Path
from typing import Dict, Any, Optional
from blog_fsm import BlogWorkflowFSM, WorkflowTrigger


class AgentController:
    """
    Controller that integrates FSM with Claude Code agents.
    
    Handles agent invocations, workflow orchestration, and
    communication between FSM states and agent actions.
    """
    
    def __init__(self, fsm: Optional[BlogWorkflowFSM] = None):
        self.fsm = fsm or BlogWorkflowFSM()
        self.agent_commands = {
            "technical-writer": self._invoke_technical_writer,
            "blog-editor": self._invoke_blog_editor
        }
    
    def start_blog_workflow(self, user_input: str, file_path: str = None) -> Dict[str, Any]:
        """
        Start a new blog workflow
        
        Args:
            user_input: User's content or blog request
            file_path: Optional path to existing blog file
            
        Returns:
            Workflow result with action and next steps
        """
        return self.fsm.transition(
            WorkflowTrigger.USER_REQUEST_BLOG,
            user_input=user_input,
            file_path=file_path
        )
    
    def handle_agent_completion(self, agent_name: str, result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handle completion of an agent task
        
        Args:
            agent_name: Name of the completed agent
            result: Result data from the agent
            
        Returns:
            Next workflow action
        """
        if agent_name == "technical-writer":
            if self.fsm.current_state.value == "writing":
                return self.fsm.transition(
                    WorkflowTrigger.WRITER_COMPLETES_DRAFT,
                    file_path=result.get("file_path")
                )
            elif self.fsm.current_state.value == "revising":
                return self.fsm.transition(
                    WorkflowTrigger.WRITER_COMPLETES_REVISIONS,
                    file_path=result.get("file_path")
                )
        
        elif agent_name == "blog-editor":
            return self.fsm.transition(
                WorkflowTrigger.EDITOR_PROVIDES_FEEDBACK,
                feedback=result.get("feedback", "")
            )
        
        return {"action": "unknown_completion", "agent": agent_name}
    
    def handle_user_response(self, response: str) -> Dict[str, Any]:
        """
        Handle user response to workflow prompts
        
        Args:
            response: User's response (yes/no/etc)
            
        Returns:
            Next workflow action
        """
        response_lower = response.lower().strip()
        
        if response_lower in ["yes", "y", "approve", "accept"]:
            return self.fsm.transition(WorkflowTrigger.USER_APPROVES_CHANGES)
        elif response_lower in ["no", "n", "reject", "decline"]:
            return self.fsm.transition(WorkflowTrigger.USER_REJECTS_CHANGES)
        else:
            return {
                "action": "invalid_response",
                "message": "Please respond with 'yes' or 'no'",
                "valid_responses": ["yes", "no", "y", "n"]
            }
    
    def execute_workflow_action(self, action_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the action returned by FSM transition
        
        Args:
            action_result: Result from FSM transition
            
        Returns:
            Execution result
        """
        action = action_result.get("action")
        
        if action == "invoke_writer":
            return self._invoke_technical_writer(action_result)
        elif action == "invoke_editor":
            return self._invoke_blog_editor(action_result)
        elif action == "invoke_writer_revision":
            return self._invoke_technical_writer_revision(action_result)
        elif action == "request_user_approval":
            return self._request_user_approval(action_result)
        elif action == "workflow_complete":
            return self._handle_workflow_complete(action_result)
        elif action == "workflow_reset":
            return self._handle_workflow_reset(action_result)
        elif action == "error":
            return self._handle_error(action_result)
        else:
            return {"status": "no_action", "result": action_result}
    
    def _invoke_technical_writer(self, action_data: Dict[str, Any]) -> Dict[str, Any]:
        """Invoke the technical writer agent"""
        user_input = action_data.get("input", "")
        file_path = action_data.get("file_path")
        
        # Create agent invocation command
        agent_prompt = f"@technical-writer {user_input}"
        
        return {
            "status": "agent_invoked",
            "agent": "technical-writer",
            "command": agent_prompt,
            "file_path": file_path,
            "message": "Technical writer agent has been invoked"
        }
    
    def _invoke_blog_editor(self, action_data: Dict[str, Any]) -> Dict[str, Any]:
        """Invoke the blog editor agent"""
        file_path = action_data.get("file_path")
        message = action_data.get("message", f"Please review {file_path}")
        
        agent_prompt = f"@blog-editor {message}"
        
        return {
            "status": "agent_invoked", 
            "agent": "blog-editor",
            "command": agent_prompt,
            "file_path": file_path,
            "message": "Blog editor agent has been invoked"
        }
    
    def _invoke_technical_writer_revision(self, action_data: Dict[str, Any]) -> Dict[str, Any]:
        """Invoke technical writer for revisions"""
        feedback = action_data.get("feedback", "")
        file_path = action_data.get("file_path")
        iteration = action_data.get("iteration", 1)
        
        agent_prompt = f"@technical-writer Please implement the following editor feedback for {file_path}:\\n{feedback}"
        
        return {
            "status": "agent_invoked",
            "agent": "technical-writer",
            "command": agent_prompt,
            "file_path": file_path,
            "iteration": iteration,
            "message": f"Technical writer implementing feedback (iteration {iteration})"
        }
    
    def _request_user_approval(self, action_data: Dict[str, Any]) -> Dict[str, Any]:
        """Request user approval for editor feedback"""
        feedback = action_data.get("feedback", "")
        timeout_minutes = action_data.get("timeout_minutes", 30)
        
        return {
            "status": "awaiting_user_input",
            "message": action_data.get("message"),
            "feedback": feedback,
            "timeout_minutes": timeout_minutes,
            "prompt": "Would you like to implement these improvements? (yes/no)"
        }
    
    def _handle_workflow_complete(self, action_data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle workflow completion"""
        return {
            "status": "workflow_complete",
            "message": action_data.get("message"),
            "iterations": action_data.get("iterations", 0),
            "file_path": action_data.get("file_path"),
            "next_actions": ["reset_workflow", "request_new_changes"]
        }
    
    def _handle_workflow_reset(self, action_data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle workflow reset"""
        return {
            "status": "workflow_reset",
            "message": action_data.get("message"),
            "ready_for": "new_blog_request"
        }
    
    def _handle_error(self, action_data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle workflow errors"""
        return {
            "status": "error",
            "error": action_data.get("error"),
            "message": action_data.get("message"),
            "recovery_options": action_data.get("recovery_options", [])
        }
    
    def get_workflow_status(self) -> Dict[str, Any]:
        """Get current workflow status"""
        fsm_status = self.fsm.get_status()
        
        # Add controller-specific status
        fsm_status.update({
            "controller_ready": True,
            "available_commands": list(self.agent_commands.keys())
        })
        
        return fsm_status
    
    def reset_workflow(self) -> Dict[str, Any]:
        """Reset the workflow to idle state"""
        return self.fsm.transition(WorkflowTrigger.RESET_WORKFLOW)
    
    def handle_timeout(self) -> Dict[str, Any]:
        """Handle user approval timeout"""
        return self.fsm.transition(WorkflowTrigger.TIMEOUT)
    
    def save_workflow_state(self, file_path: str = None) -> None:
        """Save current workflow state"""
        if file_path is None:
            file_path = ".claude/workflow/controller_state.json"
        
        # Save FSM state
        self.fsm.save_state()
        
        # Save controller state
        controller_state = {
            "fsm_state_file": ".claude/workflow/state.json",
            "controller_version": "1.0.0",
            "available_agents": list(self.agent_commands.keys())
        }
        
        Path(file_path).parent.mkdir(parents=True, exist_ok=True)
        with open(file_path, 'w') as f:
            json.dump(controller_state, f, indent=2)
    
    def load_workflow_state(self, file_path: str = None) -> bool:
        """Load workflow state"""
        if file_path is None:
            file_path = ".claude/workflow/controller_state.json"
        
        try:
            # Load FSM state
            fsm_loaded = self.fsm.load_state()
            
            # Load controller state if exists
            if Path(file_path).exists():
                with open(file_path) as f:
                    controller_state = json.load(f)
                # Could restore controller-specific settings here
            
            return fsm_loaded
        except Exception as e:
            print(f"Failed to load workflow state: {e}")
            return False


# Convenience functions for common operations
def create_workflow_controller() -> AgentController:
    """Create a new workflow controller instance"""
    return AgentController()


def start_blog_workflow(user_input: str, file_path: str = None) -> Dict[str, Any]:
    """Quick start function for blog workflow"""
    controller = create_workflow_controller()
    return controller.start_blog_workflow(user_input, file_path)


def get_workflow_status() -> Dict[str, Any]:
    """Quick status check function"""
    controller = create_workflow_controller()
    controller.load_workflow_state()  # Load existing state if available
    return controller.get_workflow_status()