@echo off

rem ###################################################
rem #
rem #   The buildtools repository is at:
rem #   https://github.com/foo123/Beeld
rem #
rem ###################################################

rem call python %BUILDTOOLS%\Beeld.py --config ".\beeld.config" --tasks minify
rem call python %BUILDTOOLS%\Beeld.py --config ".\beeld.config" --tasks minify_css --compiler cssmin

rem call php -f %BUILDTOOLS%\Beeld.php -- --config=".\beeld.config" --tasks=minify
rem call php -f %BUILDTOOLS%\Beeld.php -- --config=".\beeld.config" --tasks=minify_css --compiler=cssmin

node %BUILDTOOLS%\Beeld.js --config ".\beeld.config" --tasks minify
rem call node %BUILDTOOLS%\Beeld.js --config ".\beeld.config" --tasks minify_css --compiler cssmin
