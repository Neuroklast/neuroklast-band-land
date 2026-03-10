#!/bin/bash
cat /tmp/styles_original.css | grep -v "^function" > /tmp/styles_clean.css
