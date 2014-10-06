#!/bin/bash
# Transform one json log into nicely formatted csv log.

# The script takes 1 argument:
# argument 1: name of log file to be processed.

echo transform begins...
log=$1
csv=${log:0:`expr length $log - 4`}.csv
makePersonClick.py $log $2 $csv
echo transform ends...