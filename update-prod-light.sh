#!/bin/bash

cp prod/* .
make clean
make prod
cp elm.js docs
git add docs
git commit -m "docs updated"

# get rid of prod configuration
git checkout -- .
