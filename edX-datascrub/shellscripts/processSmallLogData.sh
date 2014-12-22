# Process all of the log data from an edX dump. This script will result in a small (weekly) log for each course in the given list.

# The script takes 3 parameters:
# 1) a list of class names to be processed, seperated by ',' WITHOUT whitespace. 
#    Class name is in school-class-term format. E.g. BerkeleyX-CS191x-Spring_2013. 
# 2) the day from which the log entries are to be processed in YYYY-MM-DD format.
# 3) the last day from which the log entries are to be processed in YYYY-MM-DD format.


checkDates.py $1 $2 $3

if [ "$?" = "0" ]; then
# Separate out the log entries in each directory by the class.
    for line in `ls | grep prod`;
    do
	echo $line
	cd $line
	separateClassLogs.py $1
	cd ..
    done
    
# Build a log for the week for each of the classes, writing the log to the current directory
# TODO: this part can be run in parallel
    courses=$(echo $1 | tr "," "\n")
    
    for x in $courses
    do
	buildWeekLog.py $x
    done
    
    mv NewClassList.csv ClassList.csv
fi
    
    