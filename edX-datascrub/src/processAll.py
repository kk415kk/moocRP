#!/usr/bin/env python

import sys, os, csv

if __name__ == '__main__':
  info_file = sys.argv[1]
  clfile = open(info_file, 'rU')
  clreader = csv.reader(clfile)
  for cname, start, end in clreader:
    os.system("processLogData.py " + cname + " " + start + " " + end)
    os.system("transformOneLog.sh " + cname + ".log " + info_file[:info_file.rfind('/')] + "/" + cname + "_axis.csv")
