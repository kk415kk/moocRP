#!/bin/bash
if [$# -eq 0]
  then NODE_ENV=development pm2 start app.js
  else NODE_ENV=$1 pm2 start app.js
fi
