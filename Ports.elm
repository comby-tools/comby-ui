port module Ports exposing (clear, copyUrl, highlightMatchRanges, highlightRewriteRanges)

import JsonResult


port highlightMatchRanges : JsonResult.JsonMatchResult -> Cmd msg


port highlightRewriteRanges : JsonResult.JsonRewriteResult -> Cmd msg


port clear : () -> Cmd msg


port copyUrl : () -> Cmd msg
