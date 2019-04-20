module Types exposing (Flags, LanguageExtension(..), Model, Msg(..), Page(..), SubstitutionKind(..))

import Http
import JsonResult exposing (JsonMatchResult)
import Navigation exposing (Location)


type alias Flags =
    {}


type Page
    = SourcePage
    | NotFound


type LanguageExtension
    = Generic
    | Cpp
    | Go
    | Python
    | Bash
    | Html


type SubstitutionKind
    = InPlace
    | NewlineSeparated


type alias Model =
    { page : Page
    , matchResult : JsonResult.JsonMatchResult
    , matchTemplateInput : String
    , ruleInput : String
    , ruleSyntaxErrors : String
    , rewriteTemplateInput : String
    , sourceInput : String
    , rewriteResult : JsonResult.JsonRewriteResult
    , debug : Bool
    , url : String
    , serverConnected : Bool
    , language : LanguageExtension
    , substitutionKind : SubstitutionKind
    , copyButtonText : String
    }


type Msg
    = OnLocationChange Location
    | MatchTemplateInputUpdated String
    | SourceInputUpdated String
    | RuleInputUpdated String
    | RewriteTemplateInputUpdated String
    | LanguageInputUpdated LanguageExtension
    | SubstitutionKindInputUpdated SubstitutionKind
    | RewriteResult (Result Http.Error JsonResult.JsonRewriteResult)
    | MatchesResult (Result Http.Error JsonResult.JsonMatchResult)
    | ShareLinkClicked
    | CopyShareLinkClicked
    | ShortenUrlResult (Result Http.Error String)
