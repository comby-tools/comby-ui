module Controller exposing (getMatches, getRewrite, init, loadInitialStaticState, log, matchEndpoint, rewriteEndpoint, subscriptions, update)

import Bootstrap.Modal as Modal
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


debug : Bool
debug =
    False


terminalCommand : Model -> String -> String
terminalCommand model extra_option =
    let
        languageFilter =
            let
                s =
                    LanguageExtension.toString model.language
            in
            if s == ".generic" then
                "*"

            else
                s

        matchTemplate =
            "COMBY_M=$(cat <<\"MATCH\"\n"
                ++ model.matchTemplateInput
                ++ "\nMATCH\n)\n"

        ( rewriteTemplateEnv, rewriteVar ) =
            if model.rewriteTemplateInput == "" then
                ( "", "''" )

            else
                ( "COMBY_R=$(cat <<\"REWRITE\"\n"
                    ++ model.rewriteTemplateInput
                    ++ "\nREWRITE\n)\n"
                , "$COMBY_R"
                )

        ( ruleEnv, rule ) =
            if model.ruleInput == "where true" then
                ( "", "" )

            else
                ( "COMBY_RULE=$(cat <<\"RULE\"\n"
                    ++ model.ruleInput
                    ++ "\nRULE\n)\n"
                , " -rule $COMBY_RULE"
                )

        zeroInstall =
            "# the next line installs comby if you need it :)\n"
                ++ "bash <(curl -sL 0.comby.dev) && \\\n"

        text =
            if model.matchTemplateInput == "" then
                "First enter a match template :)"

            else
                matchTemplate ++ rewriteTemplateEnv ++ ruleEnv ++ zeroInstall ++ "comby $COMBY_M " ++ rewriteVar ++ " " ++ rule ++ " " ++ languageFilter ++ " " ++ "-stats" ++ extra_option
    in
    text


matchEndpoint : String
matchEndpoint =
    Configuration.rewriteServer ++ "/match"


rewriteEndpoint : String
rewriteEndpoint =
    Configuration.rewriteServer ++ "/rewrite"


log : String -> a -> ()
log s a =
    if debug then
        let
            _ =
                Debug.log s a
        in
        ()

    else
        ()


jsonFromModel : Model -> String
jsonFromModel model =
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
    in
    JsonRequest.jsonRewriteRequest
        model.sourceInput
        model.matchTemplateInput
        rule
        model.rewriteTemplateInput
        languageInput
        substitutionKindInput
        0


getShortUrl : Model -> Cmd Msg
getShortUrl model =
    let
        urlToShorten =
            Configuration.thisDomain
                ++ "/index.html#"
                ++ encodeUri (jsonFromModel model)

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


getMatches : String -> String -> String -> LanguageExtension -> Int -> Cmd Msg
getMatches sourceInput matchTemplateInput ruleInput languageInput id =
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
                id

        _ =
            log "getMatches:" json
    in
    Http.send MatchesResult <|
        Http.post
            matchEndpoint
            (Http.stringBody "text/plain" json)
            JsonResult.matchResultDecoder


getRewrite : String -> String -> String -> String -> LanguageExtension -> SubstitutionKind -> Int -> Cmd Msg
getRewrite sourceInput matchTemplateInput ruleInput rewriteTemplateInput languageInput substitutionKindInput id =
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
                id

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
        , id = 0
        }
    , sourceInput = result.source
    , matchTemplateInput = result.match
    , ruleInput = result.rule
    , ruleSyntaxErrors = ""
    , rewriteTemplateInput = result.rewrite
    , rewriteResult =
        { in_place_substitutions = []
        , rewritten_source = ""
        , id = 0
        }
    , debug = False
    , url = ""
    , prettyUrl = ""
    , serverConnected = False
    , language = language
    , substitutionKind = substitutionKind
    , copyButtonLinkText = "fa fa-copy"
    , copyButtonTerminalText = "fa fa-copy"
    , copyButtonTextInPlace = "fa fa-copy"
    , currentRewriteResultId = 0
    , currentMatchResultId = 0
    , modalVisibility = Modal.hidden
    , modalText = ""
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
            model.currentMatchResultId
        , getRewrite
            model.sourceInput
            model.matchTemplateInput
            model.ruleInput
            model.rewriteTemplateInput
            model.language
            model.substitutionKind
            model.currentRewriteResultId
        ]
    )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    let
        new_model =
            { model
                | copyButtonLinkText = "fa fa-copy"
                , copyButtonTerminalText = "fa fa-copy"
            }
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

                currentMatchResultId =
                    model.currentMatchResultId + 1

                currentRewriteResultId =
                    model.currentRewriteResultId + 1

                new_model =
                    { model
                        | currentMatchResultId = currentMatchResultId
                        , currentRewriteResultId = currentRewriteResultId
                    }
            in
            ( { new_model | matchTemplateInput = matchTemplateInput }
            , Cmd.batch
                [ getMatches
                    new_model.sourceInput
                    matchTemplateInput
                    new_model.ruleInput
                    new_model.language
                    new_model.currentMatchResultId
                , getRewrite
                    new_model.sourceInput
                    matchTemplateInput
                    new_model.ruleInput
                    new_model.rewriteTemplateInput
                    new_model.language
                    new_model.substitutionKind
                    new_model.currentRewriteResultId
                ]
            )

        SourceInputUpdated sourceInput ->
            let
                _ =
                    log "SourceInputUpdated" sourceInput

                currentMatchResultId =
                    model.currentMatchResultId + 1

                currentRewriteResultId =
                    model.currentRewriteResultId + 1

                new_model =
                    { model
                        | currentMatchResultId = currentMatchResultId
                        , currentRewriteResultId = currentRewriteResultId
                    }
            in
            ( { new_model | sourceInput = sourceInput }
            , Cmd.batch
                [ getMatches
                    sourceInput
                    new_model.matchTemplateInput
                    new_model.ruleInput
                    new_model.language
                    new_model.currentMatchResultId
                , getRewrite
                    sourceInput
                    new_model.matchTemplateInput
                    new_model.ruleInput
                    new_model.rewriteTemplateInput
                    new_model.language
                    new_model.substitutionKind
                    new_model.currentRewriteResultId
                ]
            )

        RuleInputUpdated ruleInput ->
            let
                currentMatchResultId =
                    model.currentMatchResultId + 1

                currentRewriteResultId =
                    model.currentRewriteResultId + 1

                new_model =
                    { model
                        | currentMatchResultId = currentMatchResultId
                        , currentRewriteResultId = currentRewriteResultId
                    }
            in
            ( { new_model | ruleInput = ruleInput }
            , Cmd.batch
                [ getMatches
                    new_model.sourceInput
                    new_model.matchTemplateInput
                    ruleInput
                    new_model.language
                    new_model.currentMatchResultId
                , getRewrite
                    new_model.sourceInput
                    new_model.matchTemplateInput
                    ruleInput
                    new_model.rewriteTemplateInput
                    new_model.language
                    new_model.substitutionKind
                    new_model.currentRewriteResultId
                ]
            )

        RewriteTemplateInputUpdated rewriteTemplateInput ->
            let
                currentRewriteResultId =
                    model.currentRewriteResultId + 1

                new_model =
                    { model
                        | currentRewriteResultId = currentRewriteResultId
                    }
            in
            ( { new_model | rewriteTemplateInput = rewriteTemplateInput }
            , getRewrite
                new_model.sourceInput
                new_model.matchTemplateInput
                new_model.ruleInput
                rewriteTemplateInput
                new_model.language
                new_model.substitutionKind
                new_model.currentRewriteResultId
            )

        MatchesResult (Ok matchResult) ->
            let
                _ =
                    log "MatchResult" matchResult

                _ =
                    log "Resp Match id" matchResult.id

                _ =
                    log "current id match is" model.currentMatchResultId
            in
            if matchResult.id >= model.currentMatchResultId then
                ( { new_model
                    | matchResult = matchResult
                    , serverConnected = True
                    , ruleSyntaxErrors = ""
                    , currentMatchResultId = matchResult.id
                  }
                , Ports.highlightMatchRanges matchResult
                )

            else
                ( new_model, Cmd.none )

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
            let
                _ =
                    log "RewriteResult" rewriteResult

                _ =
                    log "Resp Rewrite id" rewriteResult.id

                _ =
                    log "current rewrite id is" model.currentMatchResultId
            in
            if rewriteResult.id >= model.currentRewriteResultId then
                ( { new_model
                    | rewriteResult = rewriteResult
                    , serverConnected = True
                    , ruleSyntaxErrors = ""
                    , currentRewriteResultId = rewriteResult.id
                  }
                , Ports.highlightRewriteRanges rewriteResult
                )

            else
                ( new_model, Cmd.none )

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
                    , Cmd.none
                    )

                _ ->
                    ( new_model
                    , Cmd.none
                    )

        ShareLinkClicked ->
            ( new_model
            , getShortUrl new_model
            )

        CopyShareLinkClicked ->
            ( { new_model
                | copyButtonLinkText = "fa fa-check"
              }
            , Ports.copyToClipboard model.url
            )

        ShortenUrlResult (Ok url) ->
            case Json.Decode.decodeString (field "id" Json.Decode.string) url of
                Ok url ->
                    ( { new_model
                        | url = url
                        , prettyUrl = url
                      }
                    , Cmd.none
                    )

                Err error ->
                    ( { new_model
                        | url = ""
                      }
                    , Cmd.none
                    )

        ShortenUrlResult (Err error) ->
            let
                _ =
                    log "Generate URL Error. Using long URL" error

                urlPath =
                    "index.html#"
                        ++ encodeUri (jsonFromModel model)

                fullUrl =
                    Configuration.thisDomain ++ "/" ++ urlPath
            in
            ( { new_model
                | url = fullUrl
                , prettyUrl = "Too much data for a short link. Copy for a long one :)"
              }
            , Navigation.modifyUrl urlPath
            )

        LanguageInputUpdated language ->
            let
                currentMatchResultId =
                    model.currentMatchResultId + 1

                currentRewriteResultId =
                    model.currentRewriteResultId + 1

                new_model =
                    { model
                        | currentMatchResultId = currentMatchResultId
                        , currentRewriteResultId = currentRewriteResultId
                    }
            in
            ( { new_model | language = language }
            , Cmd.batch
                [ getMatches
                    new_model.sourceInput
                    new_model.matchTemplateInput
                    new_model.ruleInput
                    language
                    new_model.currentMatchResultId
                , getRewrite
                    new_model.sourceInput
                    new_model.matchTemplateInput
                    new_model.ruleInput
                    new_model.rewriteTemplateInput
                    language
                    new_model.substitutionKind
                    new_model.currentRewriteResultId
                ]
            )

        SubstitutionKindInputUpdated substitutionKind ->
            let
                _ =
                    log "SubstitutionKindInputUpdated" substitutionKind

                currentMatchResultId =
                    model.currentMatchResultId + 1

                currentRewriteResultId =
                    model.currentRewriteResultId + 1

                new_model =
                    { model
                        | currentMatchResultId = currentMatchResultId
                        , currentRewriteResultId = currentRewriteResultId
                    }
            in
            ( { new_model | substitutionKind = substitutionKind }
            , Cmd.batch
                [ getMatches
                    new_model.sourceInput
                    new_model.matchTemplateInput
                    new_model.ruleInput
                    new_model.language
                    new_model.currentMatchResultId
                , getRewrite
                    new_model.sourceInput
                    new_model.matchTemplateInput
                    new_model.ruleInput
                    new_model.rewriteTemplateInput
                    new_model.language
                    substitutionKind
                    new_model.currentRewriteResultId
                ]
            )

        CloseModal ->
            ( { model | modalVisibility = Modal.hidden }
            , Cmd.none
            )

        CopyTerminalCommandClicked ->
            let
                text =
                    terminalCommand model ""
            in
            ( { model
                | copyButtonTextInPlace = "fa fa-copy"
                , copyButtonTerminalText = "fa fa-check"
                , copyButtonLinkText = "fa fa-copy"
                , modalText = text
              }
            , Ports.copyToClipboard text
            )

        CopyTerminalCommandInPlaceClicked ->
            let
                text =
                    terminalCommand model " -i"
            in
            ( { model
                | copyButtonTextInPlace = "fa fa-check"
                , copyButtonTerminalText = "fa fa-copy"
                , modalText = text
              }
            , Ports.copyToClipboard text
            )

        ShowModal ->
            let
                text =
                    terminalCommand model ""
            in
            ( { model
                | modalText = text
                , modalVisibility = Modal.shown
                , copyButtonTextInPlace = "fa fa-copy"
              }
            , Cmd.none
            )


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        []
