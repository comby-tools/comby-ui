module Configuration exposing (rewriteServer, thisDomain)


thisDomain : String
thisDomain =
    "http://127.0.0.1:%%%thisDomainPort%%%"


rewriteServer : String
rewriteServer =
    "%%%rewriteServer%%%"
