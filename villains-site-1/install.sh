#!/bin/bash
# Install script that avoids npm cache permission issues

# Create local cache directory
mkdir -p .npm-cache
mkdir -p .npm-global

# Install with local cache
npm install --cache .npm-cache --prefix .npm-global

echo "Installation complete!"
