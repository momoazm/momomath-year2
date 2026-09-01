Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c cd /d C:\Users\momo\momomath-year2 && npx vitest run > _vp12all.log 2>&1", 0, False
