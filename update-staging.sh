#!/bin/bash

cp staging/* .
<<<<<<< HEAD
make clean
make prod
cp elm.js docs
=======
make clean &> /dev/null
make prod
cp elm.js docs
cp dark-theme/custom.css docs
>>>>>>> staging
git add docs
git commit -m "docs updated"

# get rid of prod configuration
git checkout -- .
