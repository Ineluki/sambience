TODO
====

 - find and handle @TODOs

Design
------


Features
--------

 - song duration and timeline feedback
 - save playlist mode in playlist
 - status after reload not set (current song)

 - list transition for playlist songs
 - click effect for control btns
 - fav icon(s?)
 - config for server (DB location, type; allowed file endings)
 - non-existing files create status msg error and skip playback
 - single add btn instead of dbl-click, similar to remove btn

Bugs
----

 - adding single files from index not working, only folders
 - loaded data not refreshed when scan updates meta-data, currently have to restart server process (index, loaded playlists)
 - search for eternal, cannot add files or deepest folder
 - playback error after several min: Error: stdout maxBuffer exceeded