TODO
====

Design
------


Features
--------

 - after tab was in background (loop not running for some time) request updated status from server

Bugs
----

 - loaded data not refreshed when scan updates meta-data, currently have to reload browser
 - next group in random song mode causes stop (working as intended but could be better)
 - rng can hit same group/song twice in a row


Later Features
--------------

 - song duration and timeline feedback
 - save/change playlist grouping, sorting
 - non-existing files create status msg error and skip playback
 - remove meta from db when playback recognizes file is gone
 - list of files with incomplete metadata
 - write metadata to file from app
 - better UI performance for playlists > 1000 items
 - playback statistics