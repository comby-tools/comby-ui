module LanguageExtension exposing (all, ofString, prettyName, toString)

import Types exposing (..)


all : List LanguageExtension
all =
    [ Generic
    , Assembly
    , Bash
    , Cpp
    , Csharp
    , Clojure
    , CSS
    , Dart
    , Elm
    , Erlang
    , Elixir
    , Html
    , Haskell
    , Go
    , Java
    , Javascript
    , Json
    , Latex
    , OCaml
    , Php
    , Python
    , Reason
    , Ruby
    , Rust
    , Scala
    , SQL
    , Swift
    , XML
    , Text
    ]


ofString : String -> LanguageExtension
ofString s =
    case s of
        ".c" ->
            Cpp

        ".cs" ->
            Csharp

        ".clj" ->
            Clojure

        ".css" ->
            CSS

        ".dart" ->
            Dart

        ".elm" ->
            Elm

        ".erl" ->
            Erlang

        ".ex" ->
            Elixir

        ".html" ->
            Html

        ".xml" ->
            Html

        ".hs" ->
            Haskell

        ".go" ->
            Go

        ".java" ->
            Java

        ".js" ->
            Javascript

        ".json" ->
            Json

        ".ml" ->
            OCaml

        ".mli" ->
            OCaml

        ".php" ->
            Php

        ".py" ->
            Python

        ".re" ->
            Reason

        ".rei" ->
            Reason

        ".rb" ->
            Ruby

        ".rs" ->
            Rust

        ".s" ->
            Assembly

        ".asm" ->
            Assembly

        ".scala" ->
            Scala

        ".sql" ->
            SQL

        ".sh" ->
            Bash

        ".swift" ->
            Swift

        ".tex" ->
            Latex

        ".txt" ->
            Text

        ".bib" ->
            Latex

        _ ->
            Generic


prettyName : LanguageExtension -> String
prettyName s =
    case s of
        Generic ->
            "Generic"

        Bash ->
            "Bash"

        Cpp ->
            "C/C++"

        Csharp ->
            "C#"

        Clojure ->
            "Clojure"

        CSS ->
            "CSS"

        Dart ->
            "Dart"

        Elm ->
            "Elm"

        Erlang ->
            "Erlang"

        Elixir ->
            "Elixir"

        Html ->
            "HTML/XML"

        Haskell ->
            "Haskell"

        Go ->
            "Go"

        Java ->
            "Java"

        Javascript ->
            "JS/Typescript"

        Json ->
            "JSON"

        OCaml ->
            "OCaml"

        Php ->
            "PHP"

        Python ->
            "Python"

        Reason ->
            "Reason"

        Ruby ->
            "Ruby"

        Rust ->
            "Rust"

        Assembly ->
            "Assembly"

        Scala ->
            "Scala"

        SQL ->
            "SQL"

        Swift ->
            "Swift"

        Latex ->
            "Latex"

        Text ->
            "Text"

        XML ->
            "XML"


toString : LanguageExtension -> String
toString s =
    case s of
        Generic ->
            ".generic"

        Cpp ->
            ".c"

        Csharp ->
            ".cs"

        Clojure ->
            ".clj"

        CSS ->
            ".css"

        Dart ->
            ".dart"

        Elm ->
            ".elm"

        Erlang ->
            ".erl"

        Elixir ->
            ".ex"

        Html ->
            ".html"

        Haskell ->
            ".hs"

        Go ->
            ".go"

        Java ->
            ".java"

        Javascript ->
            ".js"

        Json ->
            ".json"

        OCaml ->
            ".ml"

        Php ->
            ".php"

        Python ->
            ".py"

        Reason ->
            ".re"

        Ruby ->
            ".rb"

        Rust ->
            ".rs"

        Assembly ->
            ".s"

        Scala ->
            ".scala"

        SQL ->
            ".sql"

        Bash ->
            ".sh"

        Swift ->
            ".swift"

        Latex ->
            ".tex"

        Text ->
            ".txt"

        XML ->
            ".xml"
