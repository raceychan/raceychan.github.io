#!/usr/bin/env python3
"""
Example Usage of Blog Workflow FSM

Demonstrates how to use the workflow controller for
managing blog writer-editor cycles.
"""

from agent_controller import AgentController
from blog_fsm import WorkflowState, WorkflowTrigger


def example_basic_workflow():
    """Basic workflow example"""
    print("=== Basic Workflow Example ===\\n")
    
    # Create controller
    controller = AgentController()
    
    # Start workflow
    print("1. Starting blog workflow...")
    result = controller.start_blog_workflow(
        user_input="Write a blog about Python decorators",
        file_path="drafts/decorators_blog.md"
    )
    print(f"Result: {result}\\n")
    
    # Simulate writer completion
    print("2. Writer completes draft...")
    result = controller.handle_agent_completion("technical-writer", {
        "file_path": "drafts/decorators_blog.md"
    })
    action_result = controller.execute_workflow_action(result)
    print(f"Result: {action_result}\\n")
    
    # Simulate editor completion
    print("3. Editor provides feedback...")
    result = controller.handle_agent_completion("blog-editor", {
        "feedback": "Great content! Please fix typos in lines 10-15 and add more examples."
    })
    action_result = controller.execute_workflow_action(result)
    print(f"Result: {action_result}\\n")
    
    # User approves changes
    print("4. User approves changes...")
    result = controller.handle_user_response("yes")
    action_result = controller.execute_workflow_action(result)
    print(f"Result: {action_result}\\n")
    
    # Writer completes revisions
    print("5. Writer completes revisions...")
    result = controller.handle_agent_completion("technical-writer", {
        "file_path": "drafts/decorators_blog.md"
    })
    action_result = controller.execute_workflow_action(result)
    print(f"Result: {action_result}\\n")
    
    # User is satisfied, rejects further changes
    print("6. User rejects further changes (satisfied)...")
    result = controller.handle_user_response("no")
    action_result = controller.execute_workflow_action(result)
    print(f"Final Result: {action_result}\\n")


def example_status_monitoring():
    """Example of status monitoring"""
    print("=== Status Monitoring Example ===\\n")
    
    controller = AgentController()
    
    # Check initial status
    status = controller.get_workflow_status()
    print(f"Initial status: {status['state']}")
    print(f"Valid triggers: {status['valid_triggers']}\\n")
    
    # Start workflow and check status
    controller.start_blog_workflow("Test blog")
    status = controller.get_workflow_status()
    print(f"After starting: {status['state']}")
    print(f"File: {status['file_path']}")
    print(f"Iterations: {status['iterations']}/{status['max_iterations']}\\n")


def example_state_persistence():
    """Example of saving and loading state"""
    print("=== State Persistence Example ===\\n")
    
    # Create and configure workflow
    controller = AgentController()
    controller.start_blog_workflow("Persistent blog", "test.md")
    
    # Save state
    print("1. Saving workflow state...")
    controller.save_workflow_state()
    print("State saved.\\n")
    
    # Create new controller and load state
    print("2. Creating new controller and loading state...")
    new_controller = AgentController()
    loaded = new_controller.load_workflow_state()
    print(f"State loaded successfully: {loaded}")
    
    # Verify state was restored
    status = new_controller.get_workflow_status()
    print(f"Restored state: {status['state']}")
    print(f"Restored file: {status['file_path']}\\n")


def example_error_handling():
    """Example of error handling"""
    print("=== Error Handling Example ===\\n")
    
    controller = AgentController()
    
    # Try invalid transition
    print("1. Attempting invalid transition...")
    result = controller.handle_user_response("yes")  # No workflow started
    print(f"Error result: {result}\\n")
    
    # Start workflow and try invalid user response
    controller.start_blog_workflow("Test")
    print("2. Invalid user response...")
    result = controller.handle_user_response("maybe")
    print(f"Invalid response result: {result}\\n")


def example_iteration_limits():
    """Example of iteration limit safety"""
    print("=== Iteration Limit Example ===\\n")
    
    controller = AgentController()
    
    # Set low iteration limit for demo
    controller.fsm.context.max_iterations = 2
    
    print("Starting workflow with max 2 iterations...")
    controller.start_blog_workflow("Test blog")
    
    # Simulate multiple revision cycles
    for i in range(4):  # Try more than the limit
        print(f"\\nIteration {i+1}:")
        
        # Writer completes
        result = controller.handle_agent_completion("technical-writer", {"file_path": "test.md"})
        controller.execute_workflow_action(result)
        
        # Editor provides feedback
        result = controller.handle_agent_completion("blog-editor", {"feedback": f"Feedback {i+1}"})
        action_result = controller.execute_workflow_action(result)
        
        if action_result.get("status") == "workflow_complete":
            print("Workflow auto-completed due to iteration limit!")
            break
        
        # User approves
        result = controller.handle_user_response("yes")
        controller.execute_workflow_action(result)
        
        status = controller.get_workflow_status()
        print(f"Current iterations: {status['iterations']}/{status['max_iterations']}")


if __name__ == "__main__":
    print("🤖 Blog Workflow FSM Examples\\n")
    
    try:
        example_basic_workflow()
        print("\\n" + "="*60 + "\\n")
        
        example_status_monitoring()
        print("\\n" + "="*60 + "\\n")
        
        example_state_persistence()
        print("\\n" + "="*60 + "\\n")
        
        example_error_handling()
        print("\\n" + "="*60 + "\\n")
        
        example_iteration_limits()
        
    except Exception as e:
        print(f"Example error: {e}")
    
    print("\\n✅ All examples completed!")