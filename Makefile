all:
	elm-live --port=2222 -- App.elm --output=elm.js 

prod:
	elm-make App.elm --output elm.js

clean:
	rm elm.js

.PHONY: all prod clean
