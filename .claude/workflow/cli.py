#!/usr/bin/env python3
"""
Blog Workflow CLI

Command-line interface for managing blog writer-editor workflows
using the FSM controller.
"""

import argparse
import json
import sys
from pathlib import Path
from typing import Dict, Any

# Add the workflow directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

from agent_controller import AgentController
from blog_fsm import WorkflowState, WorkflowTrigger


class BlogWorkflowCLI:
    """Command-line interface for blog workflow management"""
    
    def __init__(self):
        self.controller = AgentController()
        self.controller.load_workflow_state()
    
    def status(self) -> Dict[str, Any]:
        """Get current workflow status"""
        return self.controller.get_workflow_status()
    
    def start(self, content: str, file_path: str = None) -> Dict[str, Any]:
        """Start a new blog workflow"""
        return self.controller.start_blog_workflow(content, file_path)
    
    def approve(self) -> Dict[str, Any]:
        """Approve editor feedback"""
        result = self.controller.handle_user_response("yes")
        if result.get("action") != "error":
            # Execute the resulting action
            action_result = self.controller.execute_workflow_action(result)
            return action_result
        return result
    
    def reject(self) -> Dict[str, Any]:
        """Reject editor feedback"""
        result = self.controller.handle_user_response("no")
        if result.get("action") != "error":
            action_result = self.controller.execute_workflow_action(result)
            return action_result
        return result
    
    def reset(self) -> Dict[str, Any]:
        """Reset workflow to idle"""
        return self.controller.reset_workflow()
    
    def writer_done(self, file_path: str = None) -> Dict[str, Any]:
        """Signal that writer has completed work"""
        result = self.controller.handle_agent_completion("technical-writer", {
            "file_path": file_path or self.controller.fsm.context.blog_file_path
        })
        if result.get("action") != "error":
            return self.controller.execute_workflow_action(result)
        return result
    
    def editor_done(self, feedback: str = "") -> Dict[str, Any]:
        """Signal that editor has completed review"""
        result = self.controller.handle_agent_completion("blog-editor", {
            "feedback": feedback
        })
        if result.get("action") != "error":
            return self.controller.execute_workflow_action(result)
        return result
    
    def save_state(self, file_path: str = None) -> Dict[str, Any]:
        """Save current workflow state"""
        try:
            self.controller.save_workflow_state(file_path)
            return {"status": "success", "message": "Workflow state saved"}
        except Exception as e:
            return {"status": "error", "message": f"Failed to save state: {e}"}
    
    def load_state(self, file_path: str = None) -> Dict[str, Any]:
        """Load workflow state"""
        try:
            success = self.controller.load_workflow_state(file_path)
            if success:
                return {"status": "success", "message": "Workflow state loaded"}
            else:
                return {"status": "error", "message": "Failed to load workflow state"}
        except Exception as e:
            return {"status": "error", "message": f"Failed to load state: {e}"}
    
    def interactive_mode(self):
        """Run interactive workflow management"""
        print("🤖 Blog Workflow Controller - Interactive Mode")
        print("Type 'help' for available commands, 'quit' to exit\\n")
        
        while True:
            try:
                # Show current status
                status = self.status()
                current_state = status["state"]
                print(f"Current State: {current_state}")
                
                if current_state == "pending_user":
                    print("⏳ Waiting for your approval of editor feedback")
                    print("Commands: approve, reject, status")
                elif current_state == "idle":
                    print("💤 Ready for new blog work")
                    print("Commands: start, status, load")
                elif current_state == "complete":
                    print("✅ Workflow complete")
                    print("Commands: reset, status, save")
                else:
                    print(f"🔄 Workflow in progress ({current_state})")
                    print("Commands: status, writer-done, editor-done")
                
                # Get user input
                user_input = input("\\n> ").strip()
                
                if user_input.lower() in ["quit", "exit", "q"]:
                    break
                elif user_input.lower() == "help":
                    self._show_help()
                else:
                    result = self._handle_command(user_input)
                    self._display_result(result)
                    
                    # Auto-save state after each command
                    self.controller.save_workflow_state()
                
                print("-" * 50)
                
            except KeyboardInterrupt:
                print("\\n\\nExiting...")
                break
            except Exception as e:
                print(f"Error: {e}")
    
    def _handle_command(self, command: str) -> Dict[str, Any]:
        """Handle a single command"""
        parts = command.split(" ", 1)
        cmd = parts[0].lower()
        args = parts[1] if len(parts) > 1 else ""
        
        if cmd == "status":
            return self.status()
        elif cmd == "start":
            return self.start(args or "New blog post")
        elif cmd in ["approve", "yes", "y"]:
            return self.approve()
        elif cmd in ["reject", "no", "n"]:
            return self.reject()
        elif cmd == "reset":
            return self.reset()
        elif cmd == "writer-done":
            return self.writer_done(args or None)
        elif cmd == "editor-done":
            return self.editor_done(args or "")
        elif cmd == "save":
            return self.save_state(args or None)
        elif cmd == "load":
            return self.load_state(args or None)
        else:
            return {
                "status": "error",
                "message": f"Unknown command: {cmd}",
                "help": "Type 'help' for available commands"
            }
    
    def _display_result(self, result: Dict[str, Any]):
        """Display command result"""
        status = result.get("status", "unknown")
        
        if status == "success":
            print(f"✅ {result.get('message', 'Success')}")
        elif status == "error":
            print(f"❌ {result.get('message', 'Error occurred')}")
        elif status == "agent_invoked":
            agent = result.get("agent", "unknown")
            print(f"🚀 Invoked {agent} agent")
            print(f"Command: {result.get('command', 'N/A')}")
        elif status == "awaiting_user_input":
            print(f"⏳ {result.get('message', 'Waiting for input')}")
            if "feedback" in result:
                print(f"Feedback: {result['feedback'][:200]}...")
        elif status == "workflow_complete":
            print(f"🎉 {result.get('message', 'Workflow complete')}")
            print(f"Iterations: {result.get('iterations', 0)}")
        else:
            print(f"ℹ️  {result.get('message', json.dumps(result, indent=2))}")
    
    def _show_help(self):
        """Show help information"""
        help_text = """
Available Commands:

Workflow Control:
  start [content]     - Start new blog workflow with optional content
  approve / yes / y   - Approve editor feedback
  reject / no / n     - Reject editor feedback  
  reset              - Reset workflow to idle state

Agent Completion:
  writer-done [file]  - Signal writer completed (with optional file path)
  editor-done [feedback] - Signal editor completed (with optional feedback)

State Management:
  status             - Show current workflow status
  save [file]        - Save workflow state (optional file path)
  load [file]        - Load workflow state (optional file path)

Other:
  help               - Show this help
  quit / exit / q    - Exit interactive mode

Example Workflow:
1. start "My new blog about Python"
2. writer-done /path/to/draft.md
3. editor-done "Great content, fix typos in line 10"
4. approve
5. writer-done
6. reject (if satisfied with current version)
        """
        print(help_text)


def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(description="Blog Workflow Controller")
    parser.add_argument("--interactive", "-i", action="store_true", 
                       help="Run in interactive mode")
    
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # Status command
    subparsers.add_parser("status", help="Get workflow status")
    
    # Start command
    start_parser = subparsers.add_parser("start", help="Start new workflow")
    start_parser.add_argument("content", help="Blog content or description")
    start_parser.add_argument("--file", "-f", help="Existing file path")
    
    # User response commands
    subparsers.add_parser("approve", help="Approve editor feedback")
    subparsers.add_parser("reject", help="Reject editor feedback")
    
    # Agent completion commands
    writer_parser = subparsers.add_parser("writer-done", help="Writer completed")
    writer_parser.add_argument("--file", "-f", help="File path")
    
    editor_parser = subparsers.add_parser("editor-done", help="Editor completed")
    editor_parser.add_argument("feedback", nargs="?", default="", help="Editor feedback")
    
    # State management
    subparsers.add_parser("reset", help="Reset workflow")
    
    save_parser = subparsers.add_parser("save", help="Save state")
    save_parser.add_argument("--file", "-f", help="Save file path")
    
    load_parser = subparsers.add_parser("load", help="Load state")
    load_parser.add_argument("--file", "-f", help="Load file path")
    
    args = parser.parse_args()
    
    cli = BlogWorkflowCLI()
    
    if args.interactive or not args.command:
        cli.interactive_mode()
        return
    
    # Handle specific commands
    result = None
    
    if args.command == "status":
        result = cli.status()
    elif args.command == "start":
        result = cli.start(args.content, args.file)
    elif args.command == "approve":
        result = cli.approve()
    elif args.command == "reject":
        result = cli.reject()
    elif args.command == "writer-done":
        result = cli.writer_done(args.file)
    elif args.command == "editor-done":
        result = cli.editor_done(args.feedback)
    elif args.command == "reset":
        result = cli.reset()
    elif args.command == "save":
        result = cli.save_state(args.file)
    elif args.command == "load":
        result = cli.load_state(args.file)
    
    if result:
        cli._display_result(result)


if __name__ == "__main__":
    main()