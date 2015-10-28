#!/bin/bash

set -ex

REPO="git@github.com:riyazdf/consoleJSON.git"

# Create a temp directory
DIR=`mktemp -d temp-clone-XXXXX`

# Clone the current repo into temp folder
git clone $REPO $DIR

# Move working directory into temp folder
cd $DIR

# Checkout and track the website branch
git checkout -t origin/website

# Delete source code files
rm -rf code/*

# Copy source files from real repo into new dir
cp ../consoleJSON.js code/.
cp ../test.html code/index.html
cp -R  data/ code/

# Stage all files in git and create a commit
git add .
git add -u
git commit -m "Website at $(date)"

# Push the new files up to GitHub
git push origin website

# Delete our temp folder
cd ..
rm -rf $DIR