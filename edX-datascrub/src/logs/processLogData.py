#!/usr/bin/env python

''' 
Take the log files from all servers between startDate and endDate,
and generate a log file for each course in the given input list.

Command line arguments:
1) a list of class names to be processed, seperated by ',' WITHOUT whitespace.
   Class name is in school-class-term format. E.g. BerkeleyX-CS191x-Spring_2013.
2) start date in YYYY-MM-DD format
3) end date in YYYY-MM-DD format

@auther: mangpo
'''

import sys, os, glob

if __name__ == '__main__':
    names = sys.argv[1]
    start = sys.argv[2]
    end = sys.argv[3]

    (yy1,mm1,dd1) = [int(x) for x in start.split('-')]
    (yy2,mm2,dd2) = [int(x) for x in end.split('-')]

    # Clear unknownLogs
    logFiles = glob.glob('prod*')
    for d in logFiles:
        os.system("rm %s/unknownLogs" % d)

    first = True

    # Divide a long period into multiple week periods to reduce sorting time
    while yy1 < yy2 or mm1 < mm2 or dd1 < dd2:
        (y,m,d) = (yy1,mm1,dd1)
        if d >= 31:
            if m >= 12:
                y = y+1
                m = 1
                d = 1
            else:
                m = m+1
                d = 1
        else:
            d = d+7
        if y >= yy2 and m >= mm2 and d > mm2:
            (y,m,d) = (yy2,mm2,dd2)

        if first:
            command = "processSmallLogData.sh %s %04d-%02d-%02d %04d-%02d-%02d" % (names,yy1,mm1,dd1,y,m,d)
            first = False
        else:
            command = "processSmallLogData.sh %s - %04d-%02d-%02d" % (names,y,m,d)
            

        print command
        status = os.system(command)

        if status == 0:
            (yy1,mm1,dd1) = (y,m,d+1)
        else:
            exit(status)
        
        
