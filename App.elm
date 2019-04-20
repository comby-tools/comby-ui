port module App exposing (main)

import Controller
import Navigation exposing (Location)
import Types exposing (..)
import View


main : Program Flags Model Msg
main =
    -- We use navigation to give us a location. It needs a constructor (message) which
    -- is fed to update on window change. Although we don't need to react to the message,
    -- we do need a location in init. I.e., No way to replace this with Html.programWithFlags
    Navigation.programWithFlags
        Types.OnLocationChange
        { view = View.root
        , update = Controller.update
        , subscriptions = Controller.subscriptions
        , init = Controller.init
        }
