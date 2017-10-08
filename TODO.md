TODO
====

Design
------


Features
--------


Bugs
----

 - loaded data not refreshed when scan updates meta-data, currently have to reload browser
 - firefox caches page, resulting in e.g. missing pl tab until F5
 - SSE unreliable in ffs
 - next group in random song mode causes stop (working as intended but could be better)


Later Features
--------------

 - song duration and timeline feedback
 - save/change playlist grouping, sorting
 - non-existing files create status msg error and skip playback
 - remove meta from db when playback recognizes file is gone
 - list of files with incomplete metadata
 - write metadata to file from app
 - better UI performance for playlists > 1000 items
 - support for mongodb storage
 - playback statistics