##########################
# Author: Kevin Kao      #
##########################
#!/bin/bash

echo "Welcome to moocRP setup. Creating file directory structure..."
# Grab this script's absolute filepath to its directory
SCRIPT_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

DATASET_FOLDERS=( "encrypted" "extracted" "non_pii" "pii" )
VISUAL_FOLDERS=(tmp archives)
LOG_FILES=(production.log development.log)

for folder in "${DATASET_FOLDERS[@]}"; do CREATE="$SCRIPT_PATH/../../datasets/${folder}"; echo "Creating $CREATE"; mkdir -p "$CREATE"; done
for folder in "${VISUAL_FOLDERS[@]}"; do CREATE="$SCRIPT_PATH/../../visualizations/${folder}"; echo "Creating $CREATE"; mkdir -p "$CREATE"; done

mkdir -p "$SCRIPT_PATH/../logs"
for files in "${LOG_FILES[@]}"; do CREATE="$SCRIPT_PATH/../logs/${files}"; "Creating $CREATE"; touch "$CREATE"; done
