#!/bin/bash

if [ -z "$1" ]; then
    echo "Put the port you want to serve on in argument 1 (how about 2222)"
    exit 1
fi

if [ -z "$2" ]; then
    echo "Put the port of your local rewrite server 2 (good chance it's 8888)"
    exit 1
fi

if [ ! -f "Token.elm" ]; then
    cat <<EOF > Token.elm
module Token exposing (t)


t : String
t =
    ""
EOF
fi

sed -i.bak -e "s/%%%thisDomainPort%%%/$1/" Configuration.elm
sed -i.bak -e "s/%%%rewriteServer%%%/$2/" Configuration.elm

rm *.bak
