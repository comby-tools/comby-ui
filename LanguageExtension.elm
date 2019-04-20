module LanguageExtension exposing (all, ofString, prettyName, toString)

import Types exposing (..)


all : List LanguageExtension
all =
    [ Generic
    , Cpp
    , Go
    , Python
    , Bash
    , Html
    ]


ofString : String -> LanguageExtension
ofString s =
    case s of
        ".c" ->
            Cpp

        ".go" ->
            Go

        ".py" ->
            Python

        ".sh" ->
            Bash

        ".html" ->
            Html

        _ ->
            Generic


prettyName : LanguageExtension -> String
prettyName s =
    case s of
        Generic ->
            "Generic"

        Cpp ->
            "C/C++"

        Go ->
            "Go"

        Python ->
            "Python"

        Bash ->
            "Bash"

        Html ->
            "HTML"


toString : LanguageExtension -> String
toString s =
    case s of
        Generic ->
            ".generic"

        Cpp ->
            ".c"

        Go ->
            ".go"

        Python ->
            ".py"

        Bash ->
            ".sh"

        Html ->
            ".html"
