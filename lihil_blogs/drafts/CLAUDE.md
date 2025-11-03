# Blog Drafts Workflow

This directory contains draft blog posts and follows a structured workflow to transform initial ideas into high-quality technical content.

## Workflow Process

### 1. Draft Creation
Create a draft file with your raw ideas:
- **Thesis statements**: Core arguments or points you want to make
- **Random thoughts**: Scattered ideas, examples, or observations
- **Structure ideas**: Rough outline or section concepts
- **Code snippets**: Example code that might be relevant
- **References**: Links, articles, or concepts to explore

### 2. Content Development (technical-writer agent)
The technical-writer agent will:
- Review your draft ideas and thesis statements
- Help structure the content into a coherent blog post
- Develop each section collaboratively with you
- Create proper introduction, body, and conclusion
- Generate or improve code examples following Python 3.10+ guidelines
- Maintain a casual, developer-friendly tone

### 3. Editorial Review (blog-editor agent)
The blog-editor agent will:
- Review the complete draft for logic errors and flow
- Check grammar, syntax, and readability
- Validate all code examples for correctness
- Verify technical accuracy of claims and concepts
- Ensure proper formatting and consistency
- Suggest improvements while preserving your voice

### 4. Final Output
The result is a polished technical blog post ready for publication.

## File Naming Convention

Use descriptive names for your draft files:
- `draft_dependency_injection_patterns.md`
- `draft_python_async_performance.md` 
- `draft_web_framework_comparison.md`

## Example Draft Structure

```markdown
# Draft: [Your Topic]

## Core Thesis
- Main argument or point you want to prove
- Why this matters to developers

## Key Ideas
- Bullet points of concepts to cover
- Examples or analogies that came to mind
- Problems this solves

## Code Examples (rough)
```python
# Rough code snippets or pseudocode
```

## Random Thoughts
- Any scattered ideas
- Questions to explore
- Related concepts
```

## Usage Instructions

1. **Create your draft**: Write a `.md` file with your ideas in this folder
2. **Invoke technical-writer**: Ask to develop the draft into a full blog post
3. **Invoke blog-editor**: Ask to review and refine the completed draft
4. **Iterate**: Make adjustments based on feedback
5. **Publish**: Move the final version to your blog platform

The two sub agents will collaborate to transform your rough ideas into publication-ready technical content.