#!/usr/bin/env python      

'''                                                                                Check that 
1) start date is '-' if that course has already been processed.
2) end date is after the end date of the previous run. 

This script is useful if processSmallLogData.sh is executed manually.

@auther: mangpo                                                                    
'''


import os, sys

def get_class_list():
    if os.path.isfile('ClassList.csv'):
        f = open('ClassList.csv','r')
        courses = {}
        for line in f:
            tokens = line.split(',')
            if len(tokens) == 3:
                (course,start,end) = tokens
                courses[course] = (start,end)
        f.close()
        return courses
    else:
        return {}

def write_class_list(courses):
    f = open('NewClassList.csv','w')
    for course in courses:
        (start,end) = courses[course]
        f.write(course + "," + start + "," + end + "\n")
    f.close()

def same_or_before(start,date):
    if start[0] > date[0]:
        return False
    elif start[0] < date[0]:
        return True
    elif start[1] > date[1]:
        return False
    elif start[1] < date[1]:
        return True
    else:
        return start[2] <= date[2]

if __name__ == '__main__':
    names = sys.argv[1].split(',')
    startDate = sys.argv[2]
    endDate = sys.argv[3]

    if endDate == "-":
        print "Abort:", cl, "illegal end date."
        exit(1)

    class_list = get_class_list()
    dates = {}
    newStartDate = startDate
    newEndDate = endDate
    for cl in names:
        if cl in class_list:
            (oldStartDate,oldEndDate) = class_list[cl]
            if oldEndDate >= endDate:
                print "Abort:", cl, "logs have already been processed until", oldEndDate
                exit(1)
            elif not(startDate == "-"):
                print "Abort:", cl,"logs have already been processed."
                print "Use \'-\' for \'start date\' to continue processing from the latest date."
                exit(1)

            class_list[cl] = (oldStartDate, endDate)
            (yy,mm,dd) = oldEndDate.split('-')
            newStartDate = "%s-%s-%02d" % (yy,mm,int(dd)+1)
            dates[cl] = (newStartDate, newEndDate)
        else:
            if startDate == "-":
                print "Abort:", cl, "logs have NOT been processed before. Start date cannot be \'-\'"
                exit(1)

            class_list[cl] = (startDate, endDate)
            dates[cl] = (startDate,endDate)

    for cl in dates:
        (start,end) = dates[cl]
        if not(start == newStartDate):
            print "Cannot process this group of courses together because of the dates."
            print dates
            exit(1)

    print class_list
    write_class_list(class_list)
    f = open("dates.txt","w")
    f.write(newStartDate + "\n")
    f.write(newEndDate + "\n")
    f.close()
