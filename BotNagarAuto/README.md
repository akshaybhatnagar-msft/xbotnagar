# BotNagar Auto - Autonomous Feature Builder

An autonomous system that wakes up daily at 11:15 AM to research, design, and implement new features for BotNagar.

## How It Works

1. **Research Phase**: Uses Claude to analyze current web trends and generate creative feature ideas
2. **Implementation Phase**: Autonomously implements the feature with complete code
3. **Documentation Phase**: Creates comprehensive documentation
4. **Git Operations**: Creates branch, commits changes, opens PR, and auto-merges
5. **Tracking**: Marks feature as completed to avoid duplicates

## System Architecture

```
BotNagarAuto/
├── feature_builder.py          # Main autonomous agent
├── run_builder.sh             # Virtual environment wrapper
├── requirements.txt           # Python dependencies
├── completed_features.txt     # Tracking file
├── .env                       # API key (gitignored)
├── .env.example              # Template
├── scripts/
│   └── daily_feature_builder.sh  # Cron entry point
├── logs/
│   ├── feature_builder.log    # Main execution log
│   ├── cron.log              # Cron output
│   └── last_run.txt          # Daily rate limiting
├── features/                  # Feature documentation
│   └── {feature-id}.md
└── venv/                     # Python virtual environment
```

## Setup

### 1. Install Dependencies

The virtual environment is already set up. If you need to recreate it:

```bash
cd BotNagarAuto
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure API Key

The `.env` file is already configured with your Anthropic API key.

### 3. Set Up Cron Job

Add this line to your crontab:

```bash
crontab -e
```

Add:
```
15 11 * * * /home/akbhatna/repos/xbotnagar/BotNagarAuto/scripts/daily_feature_builder.sh
```

This runs every day at 11:15 AM.

### 4. Verify Cron Setup

```bash
# Test the script manually
/home/akbhatna/repos/xbotnagar/BotNagarAuto/scripts/daily_feature_builder.sh

# Check cron log
tail -f /home/akbhatna/repos/xbotnagar/BotNagarAuto/logs/cron.log
```

## Feature Selection Strategy

The autonomous agent:
- Researches current web trends and UX patterns
- Considers the neon terminal brutalist aesthetic
- Focuses on small, high-impact features (1-3 hours)
- Avoids duplicating existing features
- Chooses creative, innovative additions

Example features it might build:
- Keyboard shortcuts overlay
- Message export functionality
- Voice input integration
- Enhanced code syntax highlighting
- Message search
- Conversation history
- Copy code buttons
- Typing indicators
- Message reactions/bookmarks

## Git Workflow

For each feature:

1. Creates branch: `feature/{feature-id}-{guid}`
2. Implements code and commits: "feat: Implement {title}"
3. Adds documentation and commits: "docs: Add documentation for {title}"
4. Creates PR with detailed description
5. Auto-merges PR and deletes branch
6. Returns to main branch

## Monitoring

### Check Latest Run

```bash
# View last run date
cat BotNagarAuto/logs/last_run.txt

# View execution log
tail -50 BotNagarAuto/logs/feature_builder.log

# View cron log
tail -50 BotNagarAuto/logs/cron.log
```

### View Completed Features

```bash
cat BotNagarAuto/completed_features.txt
```

### View Feature Documentation

```bash
ls BotNagarAuto/features/
cat BotNagarAuto/features/{feature-id}.md
```

## Manual Execution

To run the feature builder manually:

```bash
cd /home/akbhatna/repos/xbotnagar
./BotNagarAuto/run_builder.sh
```

Or run directly:

```bash
cd /home/akbhatna/repos/xbotnagar/BotNagarAuto
source venv/bin/activate
python feature_builder.py
```

## Cost Estimation

- 2-3 API calls to Claude Sonnet 4 per feature
- Estimated cost: $0.05-0.15 per feature
- Monthly cost (30 features): ~$2-5

## Safety Features

- **Daily Rate Limiting**: Only runs once per day
- **Clean State Management**: Always returns to main branch
- **Error Handling**: Comprehensive try-catch with logging
- **Git Safety**: Never force-pushes, creates clean PRs
- **Duplicate Prevention**: Tracks completed features

## Troubleshooting

### Feature Builder Fails

1. Check logs: `tail -100 BotNagarAuto/logs/feature_builder.log`
2. Verify API key: `cat BotNagarAuto/.env`
3. Test gh CLI: `gh auth status`
4. Check git state: `git status`

### Cron Not Running

1. Check cron service: `systemctl status cron`
2. Verify crontab: `crontab -l`
3. Check permissions: `ls -la BotNagarAuto/scripts/`
4. View cron log: `cat BotNagarAuto/logs/cron.log`

### Manual Recovery

If the system gets stuck:

```bash
cd /home/akbhatna/repos/xbotnagar
git checkout main
git pull origin main
```

## Future Enhancements

Potential improvements to the autonomous system:
- Multi-day features (planning on day 1, implementation on day 2)
- A/B testing integration
- Performance monitoring
- User feedback collection
- Rollback capabilities
- Feature flag integration

## Technical Details

### Models Used
- **Research & Ideation**: Claude Sonnet 4 (8K tokens)
- **Implementation**: Claude Sonnet 4 (8K tokens)

### API Calls Per Feature
1. Research and ideate feature idea
2. Implement feature code
3. Generate documentation (embedded in implementation)

Total: 2-3 calls per feature

---

🤖 **BotNagar Auto**: Continuously improving your AI chat experience, one feature at a time.
