#!/bin/bash
# Set input and output files
INPUT_FILE="doc_build_output_raw.json"
OUTPUT_FILE="doc_build_output_pretty.txt"

# Define ANSI color codes
RESET='\033[0m'          # Reset color
RED='\033[0;31m'         # Red for errors
GREEN='\033[0;32m'       # Green for info
YELLOW='\033[0;33m'      # Yellow for warnings
BLUE='\033[0;34m'        # Blue for debug
TURQUOISE='\033[0;36m'   # Turquoise for messages

# Filter JSON lines from the input file
echo "Filtering JSON lines..."
grep '^{.*}$' "$INPUT_FILE" > filtered_logs.json

# Process the JSON file
echo "Processing JSON logs..."
jq -r \
  --arg RESET "$RESET" \
  --arg RED "$RED" \
  --arg GREEN "$GREEN" \
  --arg YELLOW "$YELLOW" \
  --arg BLUE "$BLUE" \
  --arg TURQUOISE "$TURQUOISE" '
  # Filter entries with a valid source and worktree
  select(.source.worktree != null) |
  "\(.level | ascii_upcase |
    if . == "DEBUG" then $BLUE
    elif . == "INFO" then $GREEN
    elif . == "WARN" then $YELLOW
    elif . == "ERROR" then $RED
    else $RESET end
  )\(.level | ascii_upcase)\($RESET): \($TURQUOISE)\(.msg)\($RESET)
  Source: \(.source.worktree | sub("^/home/runner/work/isyfact.github.io/isyfact.github.io/"; "")) (branch: \(.source.refname))
  File: \(.file.path | sub("^/home/runner/work/isyfact.github.io/isyfact.github.io/"; "")):\(.file.line // "N/A")\n"
  ' filtered_logs.json > "$OUTPUT_FILE"

# Echo each line with color
while IFS= read -r line; do
  # Use echo to interpret escape sequences
  echo -e "$line"
done < "$OUTPUT_FILE"