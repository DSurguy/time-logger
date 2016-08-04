#### Time Logger
This application is intended to support strict time-entry policies imposed in an office setting by allowing users to quickly log tasks when changing between them.

## Intended Features

 - Keyboard Shortcut for quick entry
 - Tab-Entry for snippets (e.g. "tt" ->TAB-> "Total Time")
 - Prompt + Auto-Fill for frequent entries
 - Store Exact Times
 - Export rounded time (15, 5, etc min increments)

##Changelog
###1.0.0
######Entry
 - Global Shortcut
  - Hard-Coded to WIN+SHIFT+L for now
 - Success Toast
 - Local Database
  - Stored in app data
  - `(process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + 'Library/Preferences' : '/var/local'))+'/time-logger'`
######Log
 - Accessable from right-click of tray icon
 - Displays records by date, past dates selectable
 - Two display modes: raw and rounded
  - Rounded displays times and hour diffs rounded to 15 minutes
  - Raw displays full timestamps down to the second
######Options
 - Success Toast Display Time
  - Configure how long the success message appears when creating entries