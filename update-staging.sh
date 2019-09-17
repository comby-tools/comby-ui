#!/bin/bash

cp staging/* .
make clean &> /dev/null
make prod
cp elm.js docs
cp dark-theme/custom.css docs
git add docs
git commit -m "docs updated"

# get rid of configuration
git checkout -- .
