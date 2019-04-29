#!/bin/bash

LIBS="elm-core elm-html elm-http elm-bootstrap elm-navigation url-parser json-extra"

rm ALL.txt 2> /dev/null
for l in $LIBS; do rm -rf $l; done

# BSD3
mkdir elm-core && \
wget -P elm-core https://raw.githubusercontent.com/elm/core/master/LICENSE

mkdir elm-html && \
wget -P elm-html https://raw.githubusercontent.com/elm/html/1.0.0/LICENSE

mkdir elm-http && \
wget -P elm-http https://raw.githubusercontent.com/elm-lang/http/1.0.0/LICENSE

mkdir elm-bootstrap && \
wget -P elm-bootstrap https://raw.githubusercontent.com/rundis/elm-bootstrap/master/LICENSE

mkdir elm-navigation && \
wget -P elm-navigation https://raw.githubusercontent.com/elm-lang/navigation/master/LICENSE

mkdir url-parser && \
wget -P url-parser https://raw.githubusercontent.com/evancz/url-parser/master/LICENSE

# MIT
mkdir json-extra && \
wget -P json-extra https://raw.githubusercontent.com/elm-community/json-extra/master/LICENSE

for l in $LIBS; do
    F=$(ls $l | head -n 1)
    echo "LICENSE FOR $l:" >> ALL.txt
    echo "" >> ALL.txt
    cat $l/$F >> ALL.txt
    echo "" >> ALL.txt
done
