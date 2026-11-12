@echo off
setlocal
cd /d "%~dp0"
set "SEGMENTER_VSROOT="
set "SEGMENTER_VSWHERE=%ProgramFiles(x86)%\Microsoft Visual Studio\Installer\vswhere.exe"
if exist "%SEGMENTER_VSWHERE%" (
  for /f "usebackq delims=" %%I in (`"%SEGMENTER_VSWHERE%" -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath`) do set "SEGMENTER_VSROOT=%%I"
)
if not defined SEGMENTER_VSROOT exit /b 1
call "%SEGMENTER_VSROOT%\Common7\Tools\VsDevCmd.bat" -arch=x64
if errorlevel 1 exit /b %errorlevel%
cl /nologo /std:c++17 /utf-8 /EHsc /O2 /W4 segment.cpp /Fe:segment.exe
exit /b %errorlevel%
