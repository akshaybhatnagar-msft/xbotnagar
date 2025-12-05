#!/usr/bin/env python3
"""
BotNagar Autonomous Feature Builder
Runs daily to research, design, and implement new features
"""

import os
import sys
import json
import logging
import subprocess
from datetime import datetime
from pathlib import Path
import anthropic
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
log_dir = Path(__file__).parent / "logs"
log_dir.mkdir(exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_dir / "feature_builder.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Configuration
REPO_ROOT = Path(__file__).parent.parent
API_KEY = os.getenv("ANTHROPIC_API_KEY")
MODEL = "claude-sonnet-4-20250514"

if not API_KEY:
    logger.error("ANTHROPIC_API_KEY not found in environment")
    sys.exit(1)

# Initialize Anthropic client
client = anthropic.Anthropic(api_key=API_KEY)


def find_gh_command():
    """Find gh CLI path for cron compatibility"""
    possible_paths = [
        os.path.expanduser("~/.local/bin/gh"),
        "/usr/local/bin/gh",
        "/usr/bin/gh"
    ]

    for path in possible_paths:
        if os.path.isfile(path) and os.access(path, os.X_OK):
            return path

    # Try which command
    try:
        result = subprocess.run(
            ["which", "gh"],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError:
        return "gh"


GH_COMMAND = find_gh_command()
logger.info(f"Using gh command: {GH_COMMAND}")


def run_command(cmd, cwd=None):
    """Execute shell command and return output"""
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            cwd=cwd or REPO_ROOT,
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        logger.error(f"Command failed: {cmd}")
        logger.error(f"Error: {e.stderr}")
        raise


def ensure_clean_state():
    """Ensure we're on main branch and up to date"""
    logger.info("Ensuring clean git state...")
    run_command("git checkout main")
    run_command("git pull origin main --rebase")
    logger.info("✓ On main branch and up to date")


def get_completed_features():
    """Load list of completed features"""
    tracking_file = REPO_ROOT / "BotNagarAuto" / "completed_features.txt"
    if tracking_file.exists():
        with open(tracking_file, 'r') as f:
            return set(line.strip() for line in f if line.strip())
    return set()


def mark_feature_completed(feature_id):
    """Mark feature as completed"""
    tracking_file = REPO_ROOT / "BotNagarAuto" / "completed_features.txt"
    with open(tracking_file, 'a') as f:
        f.write(f"{feature_id}\n")
    logger.info(f"✓ Marked feature {feature_id} as completed")


def research_and_ideate():
    """Use Claude to research web trends and generate feature idea"""
    logger.info("🔍 Researching current web trends and generating feature idea...")

    # Read current app state
    readme_path = REPO_ROOT / "README.md"
    readme_content = readme_path.read_text() if readme_path.exists() else ""

    completed = get_completed_features()

    prompt = f"""You are an autonomous feature designer for BotNagar, a neon terminal brutalist AI chat application.

Current app overview:
{readme_content[:1000]}

Already implemented features: {', '.join(completed) if completed else 'None yet'}

Your task:
1. Think about current web development trends, AI chat interfaces, and user experience improvements
2. Design ONE small but impactful feature that:
   - Takes 1-3 hours to implement
   - Enhances the user experience
   - Fits the neon terminal brutalist aesthetic
   - Is unique and creative
   - Can be implemented with React/JavaScript/CSS

Examples of good features:
- Keyboard shortcuts overlay (Cmd+K style)
- Message export to markdown/JSON
- Dark/light theme toggle (keeping the neon aesthetic)
- Voice input using Web Speech API
- Code syntax highlighting improvements
- Message search functionality
- Conversation history sidebar
- Copy code button on code blocks
- Typing speed indicator
- Message reactions/bookmarks

Return a JSON object with this structure:
{{
  "feature_id": "kebab-case-id",
  "title": "Feature Title",
  "description": "Detailed description of what this feature does and why it's valuable",
  "category": "UX|UI|Performance|Accessibility|Developer",
  "complexity": "small|medium",
  "files_to_modify": ["src/components/ChatInterface.jsx"],
  "files_to_create": ["src/components/NewComponent.jsx"],
  "technical_approach": "Brief explanation of how to implement this"
}}

Be creative and innovative. Choose something that will make BotNagar stand out!"""

    try:
        response = client.messages.create(
            model=MODEL,
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}]
        )

        content = response.content[0].text
        logger.info(f"Claude response length: {len(content)} chars")

        # Extract JSON from response
        if "```json" in content:
            json_str = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            json_str = content.split("```")[1].split("```")[0].strip()
        else:
            json_str = content.strip()

        feature = json.loads(json_str)
        logger.info(f"✓ Generated feature idea: {feature['title']}")
        return feature

    except Exception as e:
        logger.error(f"Failed to generate feature idea: {e}")
        raise


def create_feature_branch(feature_id):
    """Create new git branch for feature"""
    import uuid
    guid = str(uuid.uuid4())[:8]
    branch_name = f"feature/{feature_id}-{guid}"

    logger.info(f"Creating branch: {branch_name}")
    run_command(f"git checkout -b {branch_name}")
    logger.info(f"✓ Created and switched to branch: {branch_name}")

    return branch_name


def implement_feature(feature):
    """Use Claude to implement the feature code"""
    logger.info(f"💻 Implementing feature: {feature['title']}...")

    log_dir = Path(__file__).parent / "logs"

    # Read relevant existing files
    files_context = {}
    for file_path in feature.get('files_to_modify', []):
        full_path = REPO_ROOT / file_path
        if full_path.exists():
            files_context[file_path] = full_path.read_text()

    prompt = f"""You are implementing a feature for BotNagar, a React-based AI chat app with neon terminal brutalist design.

Feature to implement:
Title: {feature['title']}
Description: {feature['description']}
Technical Approach: {feature['technical_approach']}

Files to modify: {', '.join(feature.get('files_to_modify', []))}
Files to create: {', '.join(feature.get('files_to_create', []))}

Current file contents:
{json.dumps(files_context, indent=2)}

Design aesthetic to maintain:
- Neon cyan (#00f0ff), neon green (#39ff14), neon pink (#ff10f0)
- JetBrains Mono font
- Terminal-style interface
- Glitch effects and scan lines
- Dark backgrounds

Your task:
1. Implement the complete feature with all necessary code
2. Ensure it integrates seamlessly with existing code
3. Maintain the neon terminal brutalist aesthetic
4. Add comments explaining key parts
5. Make it production-ready

Return your response using tool calls (not text). Use the 'write_files' tool with this schema:
- files: array of {{path: string, content: string}}
- implementation_notes: string

Provide COMPLETE file contents, not diffs or snippets."""

    # Define a tool for structured output
    tools = [{
        "name": "write_files",
        "description": "Write implementation files for the feature",
        "input_schema": {
            "type": "object",
            "properties": {
                "files": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "path": {"type": "string", "description": "File path relative to repository root"},
                            "content": {"type": "string", "description": "Complete file content"}
                        },
                        "required": ["path", "content"]
                    }
                },
                "implementation_notes": {
                    "type": "string",
                    "description": "Brief notes on what was implemented"
                }
            },
            "required": ["files", "implementation_notes"]
        }
    }]

    try:
        response = client.messages.create(
            model=MODEL,
            max_tokens=16000,  # Increased for larger file contents
            messages=[{"role": "user", "content": prompt}],
            tools=tools,
            tool_choice={"type": "tool", "name": "write_files"}
        )

        # Extract tool use from response
        tool_use = None
        for content in response.content:
            if content.type == "tool_use" and content.name == "write_files":
                tool_use = content
                break

        if not tool_use:
            raise ValueError("No tool_use found in response")

        result = tool_use.input
        logger.info(f"Tool use result keys: {list(result.keys())}")
        logger.info(f"Tool use result (first 500 chars): {str(result)[:500]}")

        # Check if result is empty or invalid
        if not result or 'files' not in result:
            logger.error("Tool call returned empty or invalid result")
            logger.error(f"Full response content: {[str(c)[:200] for c in response.content]}")
            logger.error(f"Stop reason: {response.stop_reason}")
            raise ValueError(f"Invalid tool call result - stop_reason: {response.stop_reason}")

        # Write files
        for file_data in result['files']:
            file_path = file_data['path']
            file_content = file_data['content']

            full_path = REPO_ROOT / file_path
            full_path.parent.mkdir(parents=True, exist_ok=True)
            full_path.write_text(file_content)
            logger.info(f"✓ Wrote {file_path}")

        logger.info(f"Implementation notes: {result['implementation_notes'][:200]}")

        return result

    except Exception as e:
        logger.error(f"Failed to implement feature: {e}")
        raise


def create_documentation(feature, implementation):
    """Create FEATURE.md documentation"""
    logger.info("📝 Creating feature documentation...")

    doc_content = f"""# Feature: {feature['title']}

**Feature ID:** `{feature['feature_id']}`
**Category:** {feature['category']}
**Complexity:** {feature['complexity']}
**Date Added:** {datetime.now().strftime('%Y-%m-%d')}

## Description

{feature['description']}

## Technical Implementation

{feature['technical_approach']}

{implementation['implementation_notes']}

## Files Modified

{chr(10).join(f'- `{f}`' for f in feature.get('files_to_modify', []))}

## Files Created

{chr(10).join(f'- `{f}`' for f in feature.get('files_to_create', []))}

## Testing

To test this feature:
1. Run `npm run dev`
2. Navigate to the app
3. Look for the new feature and test its functionality

## Future Enhancements

This feature could be extended with:
- Additional configuration options
- More advanced functionality
- Integration with other features

---

🤖 Autonomously generated and implemented by BotNagar Auto on {datetime.now().strftime('%Y-%m-%d at %H:%M')}
"""

    doc_path = REPO_ROOT / "BotNagarAuto" / "features" / f"{feature['feature_id']}.md"
    doc_path.parent.mkdir(parents=True, exist_ok=True)
    doc_path.write_text(doc_content)

    logger.info(f"✓ Created documentation at {doc_path}")


def git_commit_and_push(message, branch_name):
    """Commit changes and push to remote"""
    logger.info(f"Committing: {message}")
    run_command("git add .")
    run_command(f'git commit -m "{message}"')
    run_command(f"git push -u origin {branch_name}")
    logger.info("✓ Committed and pushed")


def create_pull_request(feature, branch_name):
    """Create and auto-merge pull request"""
    logger.info("Creating pull request...")

    pr_title = f"feat: {feature['title']}"
    pr_body = f"""## {feature['title']}

**Category:** {feature['category']}
**Complexity:** {feature['complexity']}

### Description
{feature['description']}

### Technical Approach
{feature['technical_approach']}

### Files Changed
- Modified: {', '.join(feature.get('files_to_modify', []))}
- Created: {', '.join(feature.get('files_to_create', []))}

---

🤖 Autonomously generated with BotNagar Auto
Powered by Claude Sonnet 4"""

    # Create PR
    pr_command = f'{GH_COMMAND} pr create --title "{pr_title}" --body "{pr_body}" --base main --head {branch_name}'
    pr_url = run_command(pr_command)
    logger.info(f"✓ Created PR: {pr_url}")

    # Auto-merge
    logger.info("Auto-merging pull request...")
    merge_command = f'{GH_COMMAND} pr merge {pr_url} --merge --delete-branch'
    run_command(merge_command)
    logger.info("✓ Pull request merged and branch deleted")

    # Return to main
    run_command("git checkout main")
    run_command("git pull origin main --rebase")
    logger.info("✓ Returned to main branch")


def run():
    """Main execution flow"""
    logger.info("=" * 60)
    logger.info("BotNagar Autonomous Feature Builder Starting")
    logger.info("=" * 60)

    try:
        # Step 1: Ensure clean state
        ensure_clean_state()

        # Step 2: Research and generate feature idea
        feature = research_and_ideate()

        # Check if already completed
        if feature['feature_id'] in get_completed_features():
            logger.info(f"Feature {feature['feature_id']} already completed, regenerating...")
            feature = research_and_ideate()

        # Step 3: Create feature branch
        branch_name = create_feature_branch(feature['feature_id'])

        # Step 4: Implement feature
        implementation = implement_feature(feature)
        git_commit_and_push(f"feat: Implement {feature['title']}", branch_name)

        # Step 5: Create documentation
        create_documentation(feature, implementation)
        git_commit_and_push(f"docs: Add documentation for {feature['title']}", branch_name)

        # Step 6: Create and merge PR
        create_pull_request(feature, branch_name)

        # Step 7: Mark as completed
        mark_feature_completed(feature['feature_id'])

        logger.info("=" * 60)
        logger.info(f"✅ SUCCESS: Feature '{feature['title']}' implemented!")
        logger.info("=" * 60)

        return 0

    except Exception as e:
        logger.error(f"❌ FAILED: {str(e)}", exc_info=True)
        # Try to return to main branch
        try:
            run_command("git checkout main")
        except:
            pass
        return 1

    finally:
        # Always try to return to main
        try:
            run_command("git checkout main")
        except:
            pass


if __name__ == "__main__":
    sys.exit(run())
