/**
*
* Sudoku.Factory Class
*
**/
!function(Sudoku, undef) {
"use strict";

var HAS = 'hasOwnProperty',
    fromJSON = JSON.parse,
    transformProperty = null,

    // http://davidwalsh.name/add-rules-stylesheets
    addCSSRule = function( style, selector, rules, index ) {
        if ( "insertRule" in style.sheet )
        {
            style.sheet.insertRule( selector + "{" + rules + "}", index );
            return style.sheet.cssRules[ index ];
        }
        else if ( "addRule" in style.sheet )
        {
            style.sheet.addRule( selector, rules, index );
            return style.sheet.rules[ index ];
        }
    },

    addCSS = function( style, css ) {
        if ( "object" === typeof css )
        {
            var n, declaration, i = 0;
            for (n in css)
            {
                if ( css[HAS](n) )
                {
                    declaration = css[ n ];
                    declaration.css = addCSSRule( style, declaration.selector, [].concat(declaration.rules).join('; '), i++ );
                }
            }
        }
        return css;
    },

    getCSS = function( style ) {
        var css = [], sheet = style.sheet, i,
            rules = sheet.cssRules ? sheet.cssRules : sheet.rules;
        for (i=0; i<rules.length; i++) css.push(rules[i].cssText ? rules[i].cssText : rules.style.cssText);
        return css.join("\n");
    },

    createStyleSheet = function( media, css ) {
        // Create the <style> tag
        var style = document.createElement("style");
        // Add a media (and/or media query) here if you'd like!
        style.setAttribute("media", media || "all");
        style.setAttribute("type", "text/css");
        // WebKit hack :(
        style.appendChild( document.createTextNode("") );
        // Add the <style> element to the page
        document.head.appendChild( style );
        if ( css ) addCSS( style, css );
        return style;
    },

    disposeStyleSheet = function( style ) {
        if ( style ) document.head.removeChild( style );
    },

    Factory;

Factory = Sudoku.Factory = Sudoku.StaticClass({

    GRIDS: {}

    ,getGrid: function( type ) {
        type = type ? type.toUpperCase( ) : null;
        if ( !!type && Factory.GRIDS[HAS](type) ) return new Factory.GRIDS[ type ]( );
        return null;
    }

    ,getCompiler: function( grid ) {
        if ( Sudoku.Compiler && grid )
        {
            if ( 'SUDOKU' === grid.type && Sudoku.SudokuCompiler )
                return new Sudoku.SudokuCompiler( grid );
        }
        return null;
    }

    ,importTpl: function( jsonTpl/*, options*/ ) {
        var sudoku = Factory.getGrid( jsonTpl ? (jsonTpl.type || null) : null ) || null;
        if ( sudoku ) sudoku.importTpl( jsonTpl/*, options || {}*/ );
        return sudoku;
    }

    ,createStyleSheet: createStyleSheet

    ,disposeStyleSheet: disposeStyleSheet

    ,addCSS: addCSS

    ,getCSS: getCSS

    ,getTransformProperty: function( el ) {
        if ( !transformProperty )
        {
            var style = el.style,
                suffix = "Transform",
                testProperties = [
                    "transform",
                    "O" + suffix,
                    "ms" + suffix,
                    "Webkit" + suffix,
                    "Moz" + suffix
                ],
                i = testProperties.length
            ;

            // test different vendor prefixes of these properties
            while ( i-- )
            {
                if ( style[HAS](testProperties[ i ]) )
                {
                    transformProperty = testProperties[ i ];
                    break;
                }
            }
        }
        return transformProperty;
    }

    ,getElement: function( element ) {
        element = element || 'div';
        var tag, id, className, el,
            idPos = element.indexOf('#'),
            classPos = element.indexOf('.')
        ;

        if ( idPos > -1 )
        {
            tag = element.slice( 0, idPos );
            element = element.slice( idPos );
            classPos -= idPos;
        }
        else if ( classPos > -1 )
        {
            tag = element.slice( 0, classPos );
            element = element.slice( classPos );
        }
        else tag = element;
        if ( '#' === element.charAt(0) )
        {
            if ( classPos > -1 )
            {
                id = element.slice( 1, classPos );
                element = element.slice( classPos );
            }
            else
            {
                id = element.slice( 1 );
            }
        }
        else id = null;
        if ( '.' === element.charAt(0) ) className = element.slice( 1 ).split('.').join(' ');
        else className = null;
        el = document.createElement(tag.length ? tag : 'div');
        if ( id ) el.id = id; if ( className ) el.className = className;
        return el;
    }
});

}(Sudoku);