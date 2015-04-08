@echo off

rem ###################################################
rem #
rem #   The buildtools repository is at:
rem #   https://github.com/foo123/Beeld
rem #
rem ###################################################

rem python %BUILDTOOLS%\Beeld.py --config ".\beeld.config" --tasks bundle

rem php -f %BUILDTOOLS%\Beeld.php -- --config=".\beeld.config" --tasks=bundle

node %BUILDTOOLS%\Beeld.js --config ".\beeld.config" --tasks bundle
