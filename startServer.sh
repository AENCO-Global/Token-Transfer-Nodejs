#!/usr/bin/env bash
if [ ! -f package-lock.json ]
then
    echo "Begin setup"
    npm init -f
    npm install
    npm install -g nodemon
else
    echo "Nothing to Do"
fi

echo "run node app.js [wallet private key"