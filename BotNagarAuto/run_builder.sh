#!/bin/bash
# Wrapper script to run feature builder with virtual environment

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd "$SCRIPT_DIR"

# Activate virtual environment
source venv/bin/activate

# Run the feature builder
python feature_builder.py

# Capture exit code
EXIT_CODE=$?

# Deactivate virtual environment
deactivate

exit $EXIT_CODE
