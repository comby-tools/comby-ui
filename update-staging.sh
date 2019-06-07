#!/bin/bash

cp staging/* .
make clean
make prod
cp elm.js docs
cp dark-theme/custom.css
git add docs
git commit -m "docs updated"

# get rid of prod configuration
git checkout -- .
