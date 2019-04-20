module Controller exposing (getMatches, getRewrite, init, loadInitialStaticState, log, matchEndpoint, rewriteEndpoint, subscriptions, update)

import Configuration
import Http exposing (..)
import Json.Decode exposing (..)
import Json.Encode exposing (..)
import JsonRequest
import JsonResult
import LanguageExtension
import Mock exposing (..)
import Navigation exposing (Location)
import Ports
import SubstitutionKind
import Token
import Types exposing (..)


matchEndpoint : String
matchEndpoint =
    Configuration.rewriteServer ++ "/match"


rewriteEndpoint : String
rewriteEndpoint =
    Configuration.rewriteServer ++ "/rewrite"


log : String -> a -> a
log s a =
    Debug.log s a


getShortUrl : Model -> Cmd Msg
getShortUrl model =
    let
        languageInput =
            LanguageExtension.toString model.language

        rule =
            if String.length model.ruleInput == 0 then
                "where true"

            else
                model.ruleInput

        substitutionKindInput =
            SubstitutionKind.toString model.substitutionKind

        json =
            JsonRequest.jsonRewriteRequest
                model.sourceInput
                model.matchTemplateInput
                rule
                model.rewriteTemplateInput
                languageInput
                substitutionKindInput

        urlToShorten =
            Configuration.thisDomain
                ++ "/index.html#"
                ++ encodeUri json

        v =
            Json.Encode.string urlToShorten
                |> Json.Encode.encode 0

        _ =
            log "getShortUrl" v

        myRequest =
            request
                { method = "POST"
                , headers = [ header "Authorization" Token.t ]
                , url = "https://api-ssl.bitly.com/v4/bitlinks"
                , body = stringBody "application/json" ("{\"long_url\": " ++ v ++ "}")
                , expect = expectString
                , timeout = Nothing
                , withCredentials = False
                }
    in
    Http.send ShortenUrlResult myRequest


getMatches : String -> String -> String -> LanguageExtension -> Cmd Msg
getMatches sourceInput matchTemplateInput ruleInput languageInput =
    let
        language =
            LanguageExtension.toString languageInput

        rule =
            if String.length ruleInput == 0 then
                "where true"

            else
                ruleInput

        json =
            JsonRequest.jsonMatchRequest
                sourceInput
                matchTemplateInput
                rule
                language

        _ =
            log "getMatches:" json
    in
    Http.send MatchesResult <|
        Http.post
            matchEndpoint
            (Http.stringBody "text/plain" json)
            JsonResult.matchResultDecoder


getRewrite : String -> String -> String -> String -> LanguageExtension -> SubstitutionKind -> Cmd Msg
getRewrite sourceInput matchTemplateInput ruleInput rewriteTemplateInput languageInput substitutionKindInput =
    let
        language =
            LanguageExtension.toString languageInput

        rule =
            if String.length ruleInput == 0 then
                "where true"

            else
                ruleInput

        substitutionKind =
            SubstitutionKind.toString substitutionKindInput

        json =
            JsonRequest.jsonRewriteRequest
                sourceInput
                matchTemplateInput
                rule
                rewriteTemplateInput
                language
                substitutionKind

        _ =
            log "getRewrite" json
    in
    Http.send RewriteResult <|
        Http.post
            rewriteEndpoint
            (Http.stringBody "text/plain" json)
            JsonResult.rewriteResultDecoder


loadInitialStaticState : Flags -> Location -> Model
loadInitialStaticState flags location =
    let
        result =
            let
                s =
                    location.hash
                        -- drop the #
                        |> String.dropLeft 1
                        |> decodeUri
                        |> Maybe.withDefault ""
            in
            case Json.Decode.decodeString JsonRequest.jsonRewriteRequestDecoder s of
                Ok s ->
                    s

                Err e ->
                    JsonRequest.defaultRewriteRequest

        language =
            LanguageExtension.ofString result.language

        substitutionKind =
            SubstitutionKind.ofString result.substitutionKind
    in
    { page = SourcePage
    , matchResult =
        { matches = []
        , source = ""
        }
    , sourceInput = result.source
    , matchTemplateInput = result.match
    , ruleInput = result.rule
    , ruleSyntaxErrors = ""
    , rewriteTemplateInput = result.rewrite
    , rewriteResult =
        { in_place_substitutions = []
        , rewritten_source = ""
        }
    , debug = False
    , url = ""
    , serverConnected = False
    , language = language
    , substitutionKind = substitutionKind
    , copyButtonText = "Copy"
    }


init : Flags -> Location -> ( Model, Cmd Msg )
init flags location =
    let
        _ =
            log "Flags" flags

        model =
            loadInitialStaticState flags location
    in
    ( model
    , Cmd.batch
        [ getMatches
            model.sourceInput
            model.matchTemplateInput
            model.ruleInput
            model.language
        , getRewrite
            model.sourceInput
            model.matchTemplateInput
            model.ruleInput
            model.rewriteTemplateInput
            model.language
            model.substitutionKind
        ]
    )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    let
        new_model =
            { model | copyButtonText = "Copy" }
    in
    case msg of
        -- we do not do anything on this; only need location when initializing,
        -- for #debug
        OnLocationChange location ->
            ( new_model, Cmd.none )

        MatchTemplateInputUpdated matchTemplateInput ->
            let
                _ =
                    log "MatchTemplateUpdated" matchTemplateInput
            in
            ( { new_model | matchTemplateInput = matchTemplateInput }
            , Cmd.batch
                [ getMatches
                    new_model.sourceInput
                    matchTemplateInput
                    new_model.ruleInput
                    new_model.language
                , getRewrite
                    new_model.sourceInput
                    matchTemplateInput
                    new_model.ruleInput
                    new_model.rewriteTemplateInput
                    new_model.language
                    new_model.substitutionKind
                ]
            )

        SourceInputUpdated sourceInput ->
            let
                _ =
                    log "SourceInputUpdated" sourceInput
            in
            ( { new_model | sourceInput = sourceInput }
            , Cmd.batch
                [ getMatches
                    sourceInput
                    new_model.matchTemplateInput
                    new_model.ruleInput
                    new_model.language
                , getRewrite
                    sourceInput
                    new_model.matchTemplateInput
                    new_model.ruleInput
                    new_model.rewriteTemplateInput
                    new_model.language
                    new_model.substitutionKind
                ]
            )

        RuleInputUpdated ruleInput ->
            ( { new_model | ruleInput = ruleInput }
            , Cmd.batch
                [ getMatches
                    new_model.sourceInput
                    new_model.matchTemplateInput
                    ruleInput
                    new_model.language
                , getRewrite
                    new_model.sourceInput
                    new_model.matchTemplateInput
                    ruleInput
                    new_model.rewriteTemplateInput
                    new_model.language
                    new_model.substitutionKind
                ]
            )

        RewriteTemplateInputUpdated rewriteTemplateInput ->
            ( { new_model | rewriteTemplateInput = rewriteTemplateInput }
            , getRewrite
                new_model.sourceInput
                new_model.matchTemplateInput
                new_model.ruleInput
                rewriteTemplateInput
                new_model.language
                new_model.substitutionKind
            )

        MatchesResult (Ok matchResult) ->
            let
                _ =
                    log "MatchResult" matchResult
            in
            ( { new_model
                | matchResult = matchResult
                , serverConnected = True
                , ruleSyntaxErrors = ""
              }
            , Ports.highlightMatchRanges matchResult
            )

        MatchesResult (Err error) ->
            let
                _ =
                    log "MatchResultError" error
            in
            case error of
                BadStatus s ->
                    let
                        _ =
                            log "MatchResultError body" s.body
                    in
                    ( { new_model
                        | ruleSyntaxErrors = s.body
                      }
                    , Ports.highlightMatchRanges Mock.match
                    )

                _ ->
                    ( new_model
                    , Ports.highlightMatchRanges Mock.match
                    )

        RewriteResult (Ok rewriteResult) ->
            ( { new_model
                | rewriteResult = rewriteResult
                , serverConnected = True
                , ruleSyntaxErrors = ""
              }
            , Ports.highlightRewriteRanges rewriteResult
            )

        RewriteResult (Err error) ->
            let
                _ =
                    log "RewriteResultError" error
            in
            case error of
                BadStatus s ->
                    let
                        _ =
                            log "RewriteResultError body" s.body
                    in
                    ( { new_model
                        | ruleSyntaxErrors = s.body
                      }
                    , Ports.highlightMatchRanges Mock.match
                    )

                _ ->
                    ( new_model
                    , Ports.highlightMatchRanges Mock.match
                    )

        ShareLinkClicked ->
            ( new_model
            , getShortUrl new_model
            )

        CopyShareLinkClicked ->
            ( { new_model
                | copyButtonText = "Copied!"
              }
            , Ports.copyUrl ()
            )

        ShortenUrlResult (Ok url) ->
            case Json.Decode.decodeString (field "id" Json.Decode.string) url of
                Ok url ->
                    ( { new_model
                        | url = url
                      }
                    , Cmd.none
                      -- Navigation.modifyUrl url
                    )

                Err _ ->
                    ( { new_model
                        | url = ""
                      }
                    , Cmd.none
                    )

        ShortenUrlResult (Err _) ->
            ( { new_model
                | url = ""
              }
            , Cmd.none
            )

        LanguageInputUpdated language ->
            ( { new_model | language = language }
            , Cmd.batch
                [ getMatches
                    new_model.sourceInput
                    new_model.matchTemplateInput
                    new_model.ruleInput
                    language
                , getRewrite
                    new_model.sourceInput
                    new_model.matchTemplateInput
                    new_model.ruleInput
                    new_model.rewriteTemplateInput
                    language
                    new_model.substitutionKind
                ]
            )

        SubstitutionKindInputUpdated substitutionKind ->
            let
                _ =
                    log "SubstitutionKindInputUpdated" substitutionKind
            in
            ( { new_model | substitutionKind = substitutionKind }
            , Cmd.batch
                [ getMatches
                    new_model.sourceInput
                    new_model.matchTemplateInput
                    new_model.ruleInput
                    new_model.language
                , getRewrite
                    new_model.sourceInput
                    new_model.matchTemplateInput
                    new_model.ruleInput
                    new_model.rewriteTemplateInput
                    new_model.language
                    substitutionKind
                ]
            )


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch []
