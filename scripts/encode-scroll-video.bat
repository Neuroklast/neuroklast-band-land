@echo off
setlocal EnableExtensions

if "%~1"=="" (
  set "SRC=%~dp0..\public\brand\websitebg.mp4"
) else (
  set "SRC=%~1"
)

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

echo Encoding scroll-scrub MP4
echo   in:  %SRC%
echo   out: %OUT%

ffmpeg -hide_banner -y -i "%SRC%" ^
  -an ^
  -c:v libx264 -preset fast -crf 26 ^
  -pix_fmt yuv420p -profile:v high -level 4.1 ^
  -g 1 -keyint_min 1 -sc_threshold 0 -bf 0 ^
  -movflags +faststart ^
  "%OUT%"

if errorlevel 1 exit /b 1
echo Done: "%OUT%"
endlocal
