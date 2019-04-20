module SubstitutionKind exposing (ofString, toString)

import Types exposing (..)


ofString : String -> SubstitutionKind
ofString s =
    case s of
        "newline_separated" ->
            NewlineSeparated

        "in_place" ->
            InPlace

        _ ->
            InPlace


toString : SubstitutionKind -> String
toString s =
    case s of
        InPlace ->
            "in_place"

        NewlineSeparated ->
            "newline_separated"
