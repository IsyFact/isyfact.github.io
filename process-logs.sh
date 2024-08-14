#!/bin/bash

set -e # Exit immediately if a command exits with a non-zero status

# Define ANSI color codes
RESET='\033[0m'          # Reset color
RED='\033[0;31m'         # Red for errors
GREEN='\033[0;32m'       # Green for info
YELLOW='\033[0;33m'      # Yellow for warnings
BLUE='\033[0;34m'        # Blue for debug
TURQUOISE='\033[0;36m'   # Turquoise for messages
PURPLE='\033[0;35m'      # Purple for source header

# Initialize variables to keep track of the current source and branch
current_source=""
current_branch=""

# Process the JSON logs from standard input
echo "Processing JSON logs..."
# Read each line from the filtered logs
grep '^{.*}$' | jq -c '. | select(.source.worktree != null)' | while IFS= read -r line; do
  # Extract the source and branch information
  source=$(echo "$line" | jq -r '.source.url' | awk -F'/' '{print $NF}')
  branch=$(echo "$line" | jq -r '.source.refname')

  # If the source or branch is missing, skip this line
  if [[ -z "$source" || -z "$branch" ]]; then
    continue
  fi

  # Check if the source or branch has changed
  if [[ "$source" != "$current_source" || "$branch" != "$current_branch" ]]; then
    # Update the current source and branch
    current_source="$source"
    current_branch="$branch"

    # Add a newline before the new source header
    if [[ -n "$current_source" || -n "$current_branch" ]]; then
      echo
    fi

    # Print the source header
    echo -e "${PURPLE}Source: $current_source (branch: $current_branch)$RESET"
  fi

  # Extract the log entry and format it with colors
  log_entry=$(echo "$line" | jq -r \
    --arg RESET "$RESET" \
    --arg RED "$RED" \
    --arg GREEN "$GREEN" \
    --arg YELLOW "$YELLOW" \
    --arg BLUE "$BLUE" \
    --arg TURQUOISE "$TURQUOISE" '
    "\(.level | ascii_upcase |
      if . == "DEBUG" then $BLUE
      elif . == "INFO" then $GREEN
      elif . == "WARN" then $YELLOW
      elif . == "ERROR" then $RED
      else $RESET end
    )\(.level | ascii_upcase)\($RESET): \($TURQUOISE)\(.msg)\($RESET)
  File: \(.file.path | sub("^/home/runner/work/isyfact.github.io/isyfact.github.io/"; "")):\(.file.line // "N/A")\n"
  ')

  # Print the formatted log entry
  echo -e "$log_entry\n"
done


