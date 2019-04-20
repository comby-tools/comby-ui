module JsonResult exposing (BindingValue, Environment, JsonMatchResult, JsonRewriteResult, Location, Match, bindingDecoder, defaultLocation, environmentDecoder, locationDecoder, matchDecoder, matchResultDecoder, rewriteResultDecoder)

import Http exposing (..)
import Json.Decode exposing (..)


type alias Location =
    { offset : Int
    , line : Int
    , column : Int
    }


defaultLocation : Location
defaultLocation =
    { offset = 0
    , line = 0
    , column = 0
    }


type alias Range =
    { start : Location
    , end : Location
    }


type alias BindingValue =
    { variable : String
    , value : String
    , range : Range
    }


type alias Environment =
    List BindingValue


type alias Match =
    { range : Range
    , environment : Environment
    , matched : String
    }


type alias JsonMatchResult =
    { matches : List Match
    , source : String
    }


type alias InPlaceSubstitution =
    { range : Range
    , environment : Environment
    , replacement_content : String
    }


type alias JsonRewriteResult =
    { in_place_substitutions : List InPlaceSubstitution
    , rewritten_source : String
    }


locationDecoder : Json.Decode.Decoder Location
locationDecoder =
    Json.Decode.map3 Location
        (field "offset" Json.Decode.int)
        (field "line" Json.Decode.int)
        (field "column" Json.Decode.int)


rangeDecoder : Json.Decode.Decoder Range
rangeDecoder =
    Json.Decode.map2 Range
        (field "start" locationDecoder)
        (field "end" locationDecoder)


bindingDecoder : Json.Decode.Decoder BindingValue
bindingDecoder =
    Json.Decode.map3
        BindingValue
        (field "variable" Json.Decode.string)
        (field "value" Json.Decode.string)
        (field "range" rangeDecoder)


environmentDecoder : Json.Decode.Decoder Environment
environmentDecoder =
    Json.Decode.list bindingDecoder


matchDecoder : Json.Decode.Decoder Match
matchDecoder =
    Json.Decode.map3 Match
        (field "range" rangeDecoder)
        (field "environment" environmentDecoder)
        (field "matched" Json.Decode.string)


matchResultDecoder : Json.Decode.Decoder JsonMatchResult
matchResultDecoder =
    Json.Decode.map2 JsonMatchResult
        (field "matches" (Json.Decode.list matchDecoder))
        (field "source" Json.Decode.string)


inPlaceSubstitutionDecoder : Json.Decode.Decoder InPlaceSubstitution
inPlaceSubstitutionDecoder =
    Json.Decode.map3 InPlaceSubstitution
        (field "range" rangeDecoder)
        (field "environment" environmentDecoder)
        (field "replacement_content" Json.Decode.string)


rewriteResultDecoder : Json.Decode.Decoder JsonRewriteResult
rewriteResultDecoder =
    Json.Decode.map2 JsonRewriteResult
        (field "in_place_substitutions" (Json.Decode.list inPlaceSubstitutionDecoder))
        (field "rewritten_source" Json.Decode.string)
