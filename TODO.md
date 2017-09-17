TODO
====

 - find and handle @TODOs

Design
------


Features
--------

 - single add btn instead of dbl-click, similar to remove btn
 - index filter: if too many items, abort; for files only show if path matches not fullpath
 - auto sort after adding group but only that group
 - remove meta from db when playback recognizes file is gone

Bugs
----

 - loaded data not refreshed when scan updates meta-data, currently have to reload browser
 - additems with {"id":"variGGtK5oF0nxWU","value":["mnt","stormdisk","Music","Misc","Glenn Gould","Haydn: 6 Late Piano Sonats, Hob. XVI: 42, 48-52","cd 1","6 Late Piano Sonats, Hob. XVI: 42, 48-52 (Glenn Gould) (disc 1)-01-Piano Sonata in D major, Hob. XVI: 42: I. Andante con espressione.flac"],"type":"directory"} results in no items being added


Later Features
--------------

 - song duration and timeline feedback
 - save/change playlist grouping, sorting
 - non-existing files create status msg error and skip playback
 - list of files with incomplete metadata
 - write metadata to file from app
