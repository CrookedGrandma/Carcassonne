@echo off
cd ..\data\imgs
for %%i in (*.png) do ffmpeg -hide_banner -loglevel error -i "%%i" -vf "crop=105:105:2:2" "cropped\%%i"
