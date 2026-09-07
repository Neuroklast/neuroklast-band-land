@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "ROOT=%~dp0.."
if "%~1"=="" (
  set "SRC=%ROOT%\public\brand\websitebg.mp4"
) else (
  set "SRC=%~1"
)

for %%I in ("%SRC%") do set "SRC=%%~fI"

if not exist "%SRC%" (
  echo Source not found: "%SRC%"
  exit /b 1
)

for %%I in ("%SRC%") do (
  set "OUT=%%~dpnI.scrub.mp4"
)

where ffmpeg >nul 2>&1
if errorlevel 1 (
  echo ffmpeg not found in PATH
  exit /b 1
)

echo Encoding scroll-scrub MP4 (1080p, all keyframes)
echo   in:  %SRC%
echo   out: %OUT%

ffmpeg -hide_banner -y -i "%SRC%" ^
  -an ^
  -vf "scale=min(1920\,iw):-2" ^
  -c:v libx264 -preset fast -crf 26 ^
  -pix_fmt yuv420p -profile:v high -level 4.1 ^
  -g 1 -keyint_min 1 -sc_threshold 0 -bf 0 ^
  -movflags +faststart ^
  "%OUT%"

if errorlevel 1 exit /b 1
echo Done: "%OUT%"
endlocal
