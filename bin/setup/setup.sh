##########################
# Author: Kevin Kao      #
##########################
#!/bin/bash

echo "------------------------------------------------------------------"
echo "| Welcome to moocRP setup. Creating file directory structure...  |"
echo "------------------------------------------------------------------"
echo ""

# Grab this script's absolute filepath to its directory
SCRIPT_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

DATASET_FOLDERS=( "encrypted" "extracted" "available" "available/non_pii" "available/pii" )
ANALYTIC_FOLDERS=("tmp" "archives")
LOG_FILES=(production.log development.log)
DATA_SCRIPTS=( "analytics" )

DATABASE_SETUP=db_setup.sql

ERRORS=0

for folder in "${DATASET_FOLDERS[@]}"; do CREATE="$SCRIPT_PATH/../../../datasets/${folder}"; echo "[x] Creating $CREATE"; mkdir -p "$CREATE"; done
for folder in "${ANALYTIC_FOLDERS[@]}"; do CREATE="$SCRIPT_PATH/../../../analytics/${folder}"; echo "[x] Creating $CREATE"; mkdir -p "$CREATE"; done
for folder in "${DATA_SCRIPTS[@]}"; do CREATE="$SCRIPT_PATH/../../../data_scripts/${folder}"; echo "[x] Creating $CREATE"; mkdir -p "$CREATE"; done


mkdir -p "$SCRIPT_PATH/../../logs"

for files in "${LOG_FILES[@]}"
do 
  CREATE="$SCRIPT_PATH/../../logs/${files}" 
  echo "[x] Creating $CREATE"

  if [ ! -e "$CREATE" ] ; then
    touch "$CREATE"
  fi

  if [ ! -w "$CREATE" ] ; then
    echo "Unable to write to $CREATE - run this script as sudo"
    COUNTER=$((COUNTER + 1))
    continue
  fi
done

echo ""
echo "Setting up MySQL database..."
printf "Please enter your MySQL username: "
read -e mysqlUser

printf "Please enter your MySQL password: "
read -e -s mysqlPass
echo ""

printf "Ignore WARNING message from MySQL: "
$(mysql -u $mysqlUser -p$mysqlPass < "$SCRIPT_PATH/$DATABASE_SETUP")

echo ""

if [[ $COUNTER -gt "0" ]] ; then
  echo "Setup encountered $COUNTER error(s)"
  exit 1
fi
echo "==== Setup was successful ===="
exit 0
