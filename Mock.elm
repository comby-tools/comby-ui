module Mock exposing (default, empty, match, matchTemplate, rewrite, rewriteOutput, rewriteTemplate, source)

import JsonResult exposing (..)
import Types exposing (..)


source : String
source =
    "this here don't match\nif derp == true {\n  return true\n}\nreturn false\n..."


matchTemplate : String
matchTemplate =
    "if :[1] {\n  return true\n}\nreturn false"


match : JsonMatchResult
match =
    { matches = []
    , source = ""
    }


rewrite : JsonRewriteResult
rewrite =
    { in_place_substitutions = []
    , rewritten_source = ""
    }


rewriteTemplate : String
rewriteTemplate =
    "return (:[1])"


rewriteOutput : JsonRewriteResult
rewriteOutput =
    { in_place_substitutions = []
    , rewritten_source = ""
    }


default : Model -> Model
default model =
    { model
        | matchResult = match
        , rewriteResult = rewriteOutput
        , matchTemplateInput = matchTemplate
        , rewriteTemplateInput = rewriteTemplate
        , sourceInput = source
    }


empty : Model -> Model
empty model =
    { model
        | matchResult =
            { matches = []
            , source = ""
            }
        , rewriteResult =
            { in_place_substitutions = []
            , rewritten_source = ""
            }
    }
