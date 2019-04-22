module View exposing (root)

import Bootstrap.Badge as Badge
import Bootstrap.Button as Button
import Bootstrap.Form.Radio as Radio
import Bootstrap.Form.Textarea as Textarea
import Bootstrap.Grid as Grid
import Bootstrap.Grid.Col as Col
import Bootstrap.Utilities.Spacing as Spacing
import Html exposing (..)
import Html.Attributes exposing (..)
import LanguageExtension
import Types exposing (..)


pageNotFound : Html Msg
pageNotFound =
    div []
        [ h1 [] [ text "Not found" ]
        , text "Sorry couldn't find that page"
        ]


sourceInput : Model -> Html Msg
sourceInput model =
    Textarea.textarea
        [ Textarea.id "source"
        , Textarea.rows 5
        , Textarea.onInput SourceInputUpdated
        , Textarea.attrs [ placeholder "Source Input" ]
        , Textarea.value model.sourceInput
        ]


matchTemplateInput : Model -> Html Msg
matchTemplateInput model =
    Textarea.textarea
        [ Textarea.id "match_template"
        , Textarea.rows 5
        , Textarea.onInput MatchTemplateInputUpdated
        , Textarea.attrs [ placeholder "Match Template" ]
        , Textarea.value model.matchTemplateInput
        ]


ruleInput : Model -> Html Msg
ruleInput model =
    Textarea.textarea
        [ Textarea.id "rule"
        , Textarea.rows 3
        , Textarea.onInput RuleInputUpdated
        , Textarea.attrs [ placeholder "where true" ]
        , Textarea.value model.ruleInput
        ]


ruleDisplaySyntaxErrors : Model -> Html Msg
ruleDisplaySyntaxErrors model =
    Textarea.textarea
        [ Textarea.id "ruleSyntaxError"
        , Textarea.rows 4
        , Textarea.attrs [ Html.Attributes.class "rule-syntax-errors" ]
        , Textarea.value model.ruleSyntaxErrors
        ]


rewriteTemplateInput : Model -> Html Msg
rewriteTemplateInput model =
    Textarea.textarea
        [ Textarea.id "rewrite"
        , Textarea.rows 5
        , Textarea.onInput RewriteTemplateInputUpdated
        , Textarea.attrs [ placeholder "Rewrite Template" ]
        , Textarea.value model.rewriteTemplateInput
        ]


highlightableSourceListing : Model -> Html Msg
highlightableSourceListing model =
    Html.div
        [ Html.Attributes.class "context" ]
        [ Html.pre [ Html.Attributes.class "source-box" ]
            [ Html.code [ Html.Attributes.id "listing" ]
                [ text model.matchResult.source ]
            ]
        ]


highlightableRewriteResult : Model -> Html Msg
highlightableRewriteResult model =
    Html.div
        [ Html.Attributes.class "context2" ]
        [ Html.pre [ Html.Attributes.class "rewrite-box" ]
            [ Html.code [ Html.Attributes.id "listing2" ]
                [ text model.rewriteResult.rewritten_source ]
            ]
        ]


languageSelection : Model -> Html Msg
languageSelection model =
    div []
        ([ h6 [] [ text "Language" ] ]
            ++ Radio.radioList "languageRadios"
                (LanguageExtension.all
                    |> List.map
                        (\l ->
                            let
                                radioChecked =
                                    if model.language == l then
                                        Radio.checked True

                                    else
                                        Radio.checked False
                            in
                            Radio.create
                                [ Radio.id (LanguageExtension.toString l)
                                , radioChecked
                                , Radio.onClick <| LanguageInputUpdated l
                                ]
                                (LanguageExtension.prettyName l)
                        )
                )
        )


substitutionKindSelection : Model -> Html Msg
substitutionKindSelection model =
    div []
        ([ h6 [] [ text "Substitution" ] ]
            ++ Radio.radioList "inPlaceMatchingRadios"
                [ Radio.create
                    [ Radio.id "InPlace"
                    , if model.substitutionKind == InPlace then
                        Radio.checked True

                      else
                        Radio.checked False
                    , Radio.onClick <| SubstitutionKindInputUpdated InPlace
                    ]
                    "In-place"
                , Radio.create
                    [ Radio.id "NewlineSeparated"
                    , if model.substitutionKind == NewlineSeparated then
                        Radio.checked True

                      else
                        Radio.checked False
                    , Radio.onClick <| SubstitutionKindInputUpdated NewlineSeparated
                    ]
                    "Newline-separated"
                ]
        )


footerShareLink : Model -> Grid.Column Msg
footerShareLink model =
    Grid.col [ Col.md8 ]
        [ h3 [] <|
            [ Button.button [ Button.small, Button.warning, Button.onClick ShareLinkClicked ] [ text "Share Link" ]
            ]
                ++ (if model.url == "" then
                        []

                    else
                        [ Badge.badgeWarning [ Spacing.ml1, Html.Attributes.id "copyableLink" ] [ text model.url ]
                        , Button.button [ Button.small, Button.outlineWarning, Button.attrs [], Button.onClick CopyShareLinkClicked ] [ text model.copyButtonText ]
                        ]
                   )
        ]


footerServerConnected : Model -> Grid.Column Msg
footerServerConnected model =
    Grid.col [ Col.md2 ]
        [ if model.serverConnected then
            Badge.pillSuccess
                [ Spacing.ml1
                , Html.Attributes.class "green-pill"
                , Html.Attributes.class "float-right"
                ]
                [ text "Server Connected" ]

          else
            Badge.pillDanger
                [ Spacing.ml1
                , Html.Attributes.class "red-pill"
                , Html.Attributes.class "float-right"
                ]
                [ text "No Server Connected" ]
        ]


sourcePage : Model -> Html Msg
sourcePage model =
    Grid.containerFluid []
        [ br [] []
        , Grid.row []
            [ Grid.col [ Col.md1 ] []
            , Grid.col [ Col.md5 ]
                [ highlightableSourceListing model
                , br [] []
                , matchTemplateInput model
                , br [] []
                , ruleInput model
                ]
            , Grid.col [ Col.md5 ]
                [ highlightableRewriteResult model
                , br [] []
                , rewriteTemplateInput model
                , br [] []
                , ruleDisplaySyntaxErrors model
                ]
            , Grid.col [ Col.md1 ]
                [ languageSelection model
                , br [] []
                , br [] []
                , substitutionKindSelection model
                ]
            ]
        , Grid.row []
            [ Grid.col [ Col.md1 ] []
            , Grid.col [ Col.md10 ]
                [ br [] []
                , sourceInput model
                ]
            , Grid.col [ Col.md1 ] []
            ]
        , br [] []
        , Grid.row []
            [ Grid.col [ Col.md1 ] []
            , footerShareLink model
            , footerServerConnected model
            , Grid.col [ Col.md1 ] []
            ]
        , br [] []
        ]


root : Model -> Html Msg
root model =
    case model.page of
        SourcePage ->
            sourcePage model

        NotFound ->
            pageNotFound
