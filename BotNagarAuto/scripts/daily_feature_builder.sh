#!/bin/bash
# Daily Feature Builder Entry Point
# Runs at 11:15 AM via cron to autonomously build new features

REPO_ROOT="/home/akbhatna/repos/xbotnagar"
LOG_DIR="$REPO_ROOT/BotNagarAuto/logs"
LAST_RUN_FILE="$LOG_DIR/last_run.txt"
CRON_LOG="$LOG_DIR/cron.log"

# Color codes for logging
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Function to log with timestamp and color
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    case $level in
        "SUCCESS")
            echo -e "${timestamp} ${GREEN}[SUCCESS]${NC} $message" | tee -a "$CRON_LOG"
            ;;
        "ERROR")
            echo -e "${timestamp} ${RED}[ERROR]${NC} $message" | tee -a "$CRON_LOG"
            ;;
        "INFO")
            echo -e "${timestamp} ${BLUE}[INFO]${NC} $message" | tee -a "$CRON_LOG"
            ;;
    esac
}

# Check if already run today
TODAY=$(date '+%Y-%m-%d')
if [ -f "$LAST_RUN_FILE" ]; then
    LAST_RUN=$(cat "$LAST_RUN_FILE")
    if [ "$LAST_RUN" == "$TODAY" ]; then
        log "INFO" "Already ran today ($TODAY), skipping..."
        exit 0
    fi
fi

log "INFO" "=========================================="
log "INFO" "BotNagar Auto Feature Builder Starting"
log "INFO" "=========================================="

# Run the feature builder
log "INFO" "Executing feature builder..."
cd "$REPO_ROOT"

if "$REPO_ROOT/BotNagarAuto/run_builder.sh"; then
    log "SUCCESS" "Feature builder completed successfully!"
    echo "$TODAY" > "$LAST_RUN_FILE"
    log "INFO" "Updated last run date to $TODAY"
else
    log "ERROR" "Feature builder failed with exit code $?"
    exit 1
fi

log "INFO" "=========================================="
log "SUCCESS" "Daily feature build complete!"
log "INFO" "=========================================="
