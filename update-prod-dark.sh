#!/bin/bash

cp prod/* .
make clean &> /dev/null
make prod
cp elm.js docs
cp dark-theme/custom.css docs
cp index.html docs
git add docs
git commit -m "docs updated"

# get rid of prod configuration
git checkout -- .
