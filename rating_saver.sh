#!/bin/bash

echo `date` >> ~/last_run.txt

function save {
  id=$1
  mode=$2
  name=$3

  dirname=$name-$mode

  mkdir -p $dirname
  touch $dirname/last.html

  http http://dmc.alepoydes.com/score/$id/$mode > $dirname/current.html
  if `cmp -s $dirname/current.html $dirname/last.html`
  then
    echo "The same."
  else
    echo "Rating updated."
    cp $dirname/current.html $dirname/last.html
    cp $dirname/last.html "$dirname/`date +%Y-%m-%d-%H:%M.html`"
  fi
  echo Success for $id $mode $name
}

save 16 release mnr
save 16 debug mnr
