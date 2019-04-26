module View exposing (root)

import Bootstrap.Badge as Badge
import Bootstrap.Button as Button
import Bootstrap.ButtonGroup as ButtonGroup
import Bootstrap.Form.Radio as Radio
import Bootstrap.Form.Textarea as Textarea
import Bootstrap.Grid as Grid
import Bootstrap.Grid.Col as Col
import Bootstrap.Grid.Row as Row
import Bootstrap.Modal as Modal
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
        , Textarea.rows 3
        , Textarea.onInput SourceInputUpdated
        , Textarea.attrs [ placeholder "Paste your source code here" ]
        , Textarea.value model.sourceInput
        ]


matchTemplateInput : Model -> Html Msg
matchTemplateInput model =
    Textarea.textarea
        [ Textarea.id "match_template"
        , Textarea.rows 3
        , Textarea.onInput MatchTemplateInputUpdated
        , Textarea.attrs [ placeholder "Match Template" ]
        , Textarea.value model.matchTemplateInput
        ]


ruleInput : Model -> Html Msg
ruleInput model =
    Textarea.textarea
        [ Textarea.id "rule"
        , Textarea.rows 1
        , Textarea.onInput RuleInputUpdated
        , Textarea.attrs [ placeholder "where true" ]
        , Textarea.value model.ruleInput
        ]


ruleDisplaySyntaxErrors : Model -> Html Msg
ruleDisplaySyntaxErrors model =
    Html.p
        [ Html.Attributes.class "rule-syntax-errors" ]
        [ text model.ruleSyntaxErrors ]


rewriteTemplateInput : Model -> Html Msg
rewriteTemplateInput model =
    Textarea.textarea
        [ Textarea.id "rewrite"
        , Textarea.rows 3
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
                -- we set the text in index.html to synchronize highlighting
                [ text "" ]
            ]
        ]


highlightableRewriteResult : Model -> Html Msg
highlightableRewriteResult model =
    Html.div
        [ Html.Attributes.class "context2" ]
        [ Html.pre [ Html.Attributes.class "rewrite-box" ]
            [ Html.code [ Html.Attributes.id "listing2" ]
                -- we set the text in index.html to synchronize highlighting
                [ text "" ]
            ]
        ]


languageSelection : String -> Model -> List LanguageExtension -> Html Msg
languageSelection header_text model languages =
    div [ class "language_selection" ]
        ([ h6 [] [ text header_text ] ]
            ++ Radio.radioList "languageRadios"
                (languages
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
    div [ class "substitution_kind" ]
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
                    "Just Matches"
                ]
        )


footerShareLink : Model -> Grid.Column Msg
footerShareLink model =
    Grid.col [ Col.md8 ]
        [ h3 [] <|
            [ Button.button [ Button.small, Button.warning, Button.onClick ShareLinkClicked ] [ text "Share Link" ]
            ]
                ++ (if model.prettyUrl == "" then
                        []

                    else
                        [ Badge.badgeWarning [ Spacing.ml1, Html.Attributes.id "copyableLink" ] [ text model.prettyUrl ]
                        , Button.button
                            [ Button.small
                            , Button.outlineWarning

                            --, Button.attrs [ class "fa fa-copy" ]
                            , Button.onClick CopyShareLinkClicked
                            ]
                            [ text model.copyButtonText ]
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


halves : List LanguageExtension -> ( List LanguageExtension, List LanguageExtension )
halves l =
    let
        newl =
            List.indexedMap (\i x -> ( i, x )) l

        n =
            (List.length l // 2) + 2

        -- + 4
        ( left, right ) =
            List.partition (\( i, _ ) -> i < n) newl
    in
    ( List.map (\( _, x ) -> x) left, List.map (\( _, x ) -> x) right )


modal : Model -> Html Msg
modal model =
    let
        language =
            let
                s =
                    LanguageExtension.toString model.language
            in
            if s == ".generic" then
                ""

            else
                s
    in
    Modal.config CloseModal
        |> Modal.large
        |> Modal.h4 [] [ text ("Run on all " ++ language ++ " files in the current directory") ]
        |> Modal.body []
            [ Grid.containerFluid []
                [ Grid.row []
                    [ Grid.col [ Col.md3 ] []
                    , Grid.col [ Col.md6 ]
                        [ Html.pre []
                            [ Html.code []
                                [ text model.modalText ]
                            ]
                        ]
                    ]
                ]
            ]
        |> Modal.footer []
            [ Button.button
                [ Button.outlineSecondary
                , Button.attrs [ class "fa fa-copy" ]
                , Button.onClick CopyTerminalCommandClicked
                , Button.block
                ]
                []

            {- , Button.button
               [ Button.outlinePrimary
               , Button.attrs []
               , Button.onClick CloseModal
               , Button.small
               ]
               [ text "Close" ]
            -}
            ]
        |> Modal.view model.modalVisibility


sourcePage : Model -> Html Msg
sourcePage model =
    let
        ( left, right ) =
            halves LanguageExtension.all
    in
    Grid.containerFluid []
        [ br [] []
        , Grid.row []
            [ Grid.col [ Col.md10 ]
                [ Grid.row [ Row.rightMd ]
                    -- changing to md12 makes this flush on left
                    [ Grid.col [ Col.md11 ]
                        [ Grid.row []
                            [ Grid.col [ Col.md6 ]
                                [ highlightableSourceListing model
                                , br [] []
                                , matchTemplateInput model
                                , br [] []
                                , ruleInput model
                                ]
                            , Grid.col [ Col.md6 ]
                                [ highlightableRewriteResult model
                                , br [] []
                                , rewriteTemplateInput model
                                , br [] []
                                , ruleDisplaySyntaxErrors model
                                ]
                            ]
                        , Grid.row []
                            [ Grid.col [ Col.md12 ]
                                [ br [] []
                                , sourceInput model
                                ]
                            ]
                        , br [] []
                        , Grid.row []
                            [ footerShareLink model

                            --                            , Grid.col [ Col.md1 ] []
                            , Grid.col [ Col.md2 ]
                                [ ButtonGroup.buttonGroup [ ButtonGroup.small ]
                                    [ ButtonGroup.button
                                        [ Button.secondary
                                        , Button.small
                                        , Button.onClick ShowModal
                                        ]
                                        [ text "Run in Terminal" ]
                                    , ButtonGroup.button
                                        [ Button.outlineSecondary
                                        , Button.small
                                        , Button.attrs [ class "fa fa-copy" ]
                                        , Button.onClick CopyTerminalCommandClicked
                                        ]
                                        []
                                    ]
                                ]
                            , footerServerConnected model
                            ]
                        ]
                    ]
                ]
            , Grid.col [ Col.md2 ]
                [ substitutionKindSelection model
                , br [] []
                , h6 [] [ text "Language" ]
                , Grid.row []
                    [ Grid.col [ Col.md6 ] [ languageSelection "" model left ]
                    , Grid.col [ Col.md6 ] [ languageSelection "" model right ]
                    ]
                ]
            ]
        , br [] []
        , modal model
        ]


root : Model -> Html Msg
root model =
    case model.page of
        SourcePage ->
            sourcePage model

        NotFound ->
            pageNotFound
