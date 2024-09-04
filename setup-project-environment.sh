#!/bin/bash
# This script sets up the project environment for local testing and development of the Antora documentation.

# Exit immediately if a command exits with a non-zero status.
set -e

# Define color variables
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to clone a repository if it doesn't already exist
clone_repo() {
  local url=$1
  local directory=$2
  local branch=$3
  if [ ! -d "$directory/.git" ]; then
    echo "Cloning $directory..."
    git clone -b "$branch" "$url" "$directory"
  else
    echo "$directory already exists; skipping clone."
  fi
}

# Function to set up Git LFS in a directory
setup_git_lfs() {
  local directory=$1
  echo "Setting up Git LFS for $directory..."
  (cd "$directory" && git lfs install && git lfs pull)
}

# Function to check if Maven needs to run and generate templates
generate_templates() {
  local pom_directory=$1
  if [ ! -d "$pom_directory/target" ]; then
    if [ -f "$pom_directory/pom.xml" ]; then
      echo "Generating templates for $pom_directory..."
      mvn --batch-mode --errors --fail-at-end -T 1C -f "$pom_directory" package
    else
      echo "pom.xml not found in $pom_directory; skipping template generation."
    fi
  else
    echo "/target directory already exists in $pom_directory; skipping template generation."
  fi
}

# Function to install npm dependencies if they are not already installed
install_npm_dependencies() {
  echo -e "${BLUE}Checking for npm dependencies...${NC}"
  if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
  else
    echo "Dependencies already installed; skipping."
  fi
}

# Function to print build instructions
print_build_instructions() {
  echo -e "${GREEN}To build the Antora documentation locally, use the following commands:${NC}"
  echo -e "${BLUE}For a standard local build:${NC}"
  echo "  npm run build:local"
  echo -e "${BLUE}For a local build with JSON logs:${NC}"
  echo "  npm run build:local-json"
}

# Function

# Main Script Execution

# Clone the repositories
echo -e "${BLUE}Cloning repositories...${NC}"
clone_repo https://github.com/IsyFact/isy-documentation.git ../isy-documentation master
clone_repo https://github.com/IsyFact/isyfact-standards.git ../isyfact-standards master
clone_repo https://github.com/IsyFact/isyfact-standards.git ../isyfact-standards-3.x release/3.x
clone_repo https://github.com/IsyFact/isyfact-standards.git ../isyfact-standards-3.0.x release/3.0.1
clone_repo https://github.com/IsyFact/isy-web.git ../isy-web master
clone_repo https://github.com/IsyFact/isy-angular-widgets.git ../isy-angular-widgets main
clone_repo https://github.com/IsyFact/isy-bedienkonzept.git ../isy-bedienkonzept main
clone_repo https://github.com/IsyFact/isy-datetime.git ../isy-datetime develop
clone_repo https://github.com/IsyFact/isy-sonderzeichen.git ../isy-sonderzeichen develop

# Set up Git LFS
echo -e "${BLUE}Setting up Git LFS...${NC}"
setup_git_lfs ../isyfact-standards
setup_git_lfs ../isyfact-standards-3.x
setup_git_lfs ../isyfact-standards-3.0.x
setup_git_lfs ../isy-documentation
setup_git_lfs ../isy-web
setup_git_lfs ../isy-angular-widgets
setup_git_lfs ../isy-bedienkonzept
setup_git_lfs ../isy-datetime
setup_git_lfs ../isy-sonderzeichen

# Generate templates
generate_templates ../isyfact-standards/isyfact-standards-doc
generate_templates ../isyfact-standards-3.x/isyfact-standards-doc
generate_templates ../isyfact-standards-3.0.x/isyfact-standards-doc

# Install npm dependencies
install_npm_dependencies

# Print Antora build instructions
print_build_instructions
