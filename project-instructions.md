# TactiMon Project Management Instructions

## Project Documents
Always include these documents at the start of each conversation with Claude:

1. **Project README** (`game-readme`)
   - Core game design and technical specifications
   - Updates as features are implemented or modified
   - Keeps track of overall project structure

2. **Development Workflow** (`dev-workflow`)
   - Step-by-step development process
   - Testing strategies
   - Best practices for working with Claude

3. **Code Repository** (`code-base`)
   - Implemented and tested components
   - File structure matching the project setup
   - Updated as new components are added/modified

## Starting Each Conversation

1. **Initialize Context**
```
I'm working on the TactiMon project. Here are the current project documents:

[Paste latest versions of README, Development Workflow, and Code Repository]

I'm currently working on [Phase X, Step Y]. The last component we implemented was [component name].
```

2. **State Goals**
```
In this conversation, I want to:
1. [Specific goal]
2. [Specific goal]
3. [Any questions about previous implementations]
```

## Maintaining Code Repository
Format code updates as:
```
<code-base>
src/
├── components/
│   └── Grid.tsx
[Component code here]

├── hooks/
│   └── useMovement.ts
[Hook code here]
</code-base>
```

## Updating Project Documents

1. **For Design Changes**
```
Could you update the README to reflect [specific change]?
```

2. **For Workflow Updates**
```
Could you update the Development Workflow to include [new process/step]?
```

## Best Practices

1. **Keep Context Focused**
- Include only relevant code snippets
- Reference specific sections of documents
- Clearly state current phase and step

2. **Document Updates**
- Request updates to README when design changes
- Keep code repository current with working implementations
- Note any deviations from original plan

3. **Testing Documentation**
- Include test results with code updates
- Document any issues or limitations found
- Keep track of what's been verified

4. **Progressive Development**
- Complete each step before moving to next
- Document dependencies between components
- Keep track of technical debt

## Example Conversation Start
```
I'm working on the TactiMon project. Here are the current project documents:

[README content]
[Development Workflow content]
[Current code-base content]

I'm currently at Phase 1, Step 1: Basic Grid Display. We haven't implemented any components yet.

In this conversation, I want to:
1. Create the initial Grid component
2. Set up a test component to verify it works
3. Implement basic click handling
```

## Version Control Integration
- Note commit points in the conversation
- Document any changes that need to be committed
- Keep track of branch structure if using git

## Troubleshooting
If Claude seems to lose context:
1. Reinitialize with all project documents
2. Clearly state where you left off
3. Provide minimal reproduction of any issues

Remember: Claude's memory is limited to the current conversation, so always include necessary context at the start of each new conversation.
