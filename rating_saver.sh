#!/bin/bash

http http://dmc.alepoydes.com/score/16/release > current.html
if `cmp -s current.html last.html`
then
  echo "The same."
else
  echo "Rating updated."
  cp current.html last.html
  cp last.html "`date +%Y/%m/%d-%H:%M.html`"
fi
