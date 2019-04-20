module JsonRequest exposing (defaultRewriteRequest, jsonMatchRequest, jsonRewriteRequest, jsonRewriteRequestDecoder)

import Json.Decode exposing (..)
import Json.Encode exposing (..)


type alias JsonRewriteRequest =
    { source : String
    , match : String
    , rule : String
    , rewrite : String
    , language : String
    , substitutionKind : String
    }


defaultRewriteRequest : JsonRewriteRequest
defaultRewriteRequest =
    { source = ""
    , match = ""
    , rule = "where true"
    , rewrite = ""
    , language = ".generic"
    , substitutionKind = ""
    }


jsonMatchRequest : String -> String -> String -> String -> String
jsonMatchRequest source match rule language =
    let
        value =
            Json.Encode.object
                [ ( "source", Json.Encode.string source )
                , ( "match", Json.Encode.string match )
                , ( "rule", Json.Encode.string rule )
                , ( "language", Json.Encode.string language )
                ]
    in
    Json.Encode.encode 0 value


jsonRewriteRequest source match rule rewrite language substitutionKind =
    let
        value =
            Json.Encode.object
                [ ( "source", Json.Encode.string source )
                , ( "match", Json.Encode.string match )
                , ( "rule", Json.Encode.string rule )
                , ( "rewrite", Json.Encode.string rewrite )
                , ( "language", Json.Encode.string language )
                , ( "substitution_kind", Json.Encode.string substitutionKind )
                ]
    in
    Json.Encode.encode 0 value


jsonRewriteRequestDecoder : Json.Decode.Decoder JsonRewriteRequest
jsonRewriteRequestDecoder =
    Json.Decode.map6 JsonRewriteRequest
        (field "source" Json.Decode.string)
        (field "match" Json.Decode.string)
        (field "rule" Json.Decode.string)
        (field "rewrite" Json.Decode.string)
        (field "language" Json.Decode.string)
        (field "substitution_kind" Json.Decode.string)
