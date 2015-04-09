/**
*
*   Sudoku.js
*   @version: 0.10
*   @dependencies: Classy.js, PublishSubscribe, Asynchronous.js, jQuery
*
*   Sudoku Builder in JavaScript
*   http://nikos-web-development.netai.net/
*
*   (light-weight and scaled-down version of CrossWord.js, professional Crossword Builder in JavaScript, by same author)
*
**/!function ( root, name, deps, factory ) {
    "use strict";
    
    //
    // export the module umd-style (with deps bundled-in or external)
    
    // Get current filename/path
    function getPath( isNode, isWebWorker, isAMD, isBrowser, amdMod ) 
    {
        var f;
        if (isNode) return {file:__filename, path:__dirname};
        else if (isWebWorker) return {file:(f=self.location.href), path:f.split('/').slice(0, -1).join('/')};
        else if (isAMD&&amdMod&&amdMod.uri)  return {file:(f=amdMod.uri), path:f.split('/').slice(0, -1).join('/')};
        else if (isBrowser&&(f=document.getElementsByTagName('script'))&&f.length) return {file:(f=f[f.length - 1].src), path:f.split('/').slice(0, -1).join('/')};
        return {file:null,  path:null};
    }
    function getDeps( names, paths, deps, depsType, require/*offset*/ )
    {
        //offset = offset || 0;
        var i, dl = names.length, mods = new Array( dl );
        for (i=0; i<dl; i++) 
            mods[ i ] = (1 === depsType)
                    ? /* node */ (deps[ names[ i ] ] || require( paths[ i ] )) 
                    : (2 === depsType ? /* amd args */ /*(deps[ i + offset ])*/ (require( names[ i ] )) : /* globals */ (deps[ names[ i ] ]))
                ;
        return mods;
    }
    // load javascript(s) (a)sync using <script> tags if browser, or importScripts if worker
    function loadScripts( scope, base, names, paths, callback, imported )
    {
        var dl = names.length, i, rel, t, load, next, head, link;
        if ( imported )
        {
            for (i=0; i<dl; i++) if ( !(names[ i ] in scope) ) importScripts( base + paths[ i ] );
            return callback( );
        }
        head = document.getElementsByTagName("head")[ 0 ]; link = document.createElement( 'a' );
        rel = /^\./; t = 0; i = 0;
        load = function( url, cb ) {
            var done = 0, script = document.createElement('script');
            script.type = 'text/javascript'; script.language = 'javascript';
            script.onload = script.onreadystatechange = function( ) {
                if (!done && (!script.readyState || script.readyState == 'loaded' || script.readyState == 'complete'))
                {
                    done = 1; script.onload = script.onreadystatechange = null;
                    cb( );
                    head.removeChild( script ); script = null;
                }
            }
            if ( rel.test( url ) ) 
            {
                // http://stackoverflow.com/a/14781678/3591273
                // let the browser generate abs path
                link.href = base + url;
                url = link.protocol + "//" + link.host + link.pathname + link.search + link.hash;
            }
            // load it
            script.src = url; head.appendChild( script );
        };
        next = function( ) {
            if ( names[ i ] in scope )
            {
                if ( ++i >= dl ) callback( );
                else if ( names[ i ] in scope ) next( ); 
                else load( paths[ i ], next );
            }
            else if ( ++t < 30 ) { setTimeout( next, 30 ); }
            else { t = 0; i++; next( ); }
        };
        while ( i < dl && (names[ i ] in scope) ) i++;
        if ( i < dl ) load( paths[ i ], next );
        else callback( );
    }
    
    deps = deps || [[],[]];
    
    var isNode = ("undefined" !== typeof global) && ("[object global]" === {}.toString.call(global)),
        isBrowser = !isNode && ("undefined" !== typeof navigator), 
        isWebWorker = !isNode && ("function" === typeof importScripts) && (navigator instanceof WorkerNavigator),
        isAMD = ("function" === typeof define) && define.amd,
        isCommonJS = isNode && ("object" === typeof module) && module.exports,
        currentGlobal = isWebWorker ? self : root, currentPath = getPath( isNode, isWebWorker, isAMD, isBrowser ), m,
        names = [].concat(deps[0]), paths = [].concat(deps[1]), dl = names.length, i, requireJSPath, ext_js = /\.js$/i
    ;
    
    // commonjs, node, etc..
    if ( isCommonJS ) 
    {
        module.$deps = module.$deps || {};
        module.exports = module.$deps[ name ] = factory.apply( root, [{NODE:module}].concat(getDeps( names, paths, module.$deps, 1, require )) ) || 1;
    }
    
    // amd, requirejs, etc..
    else if ( isAMD && ("function" === typeof require) && ("function" === typeof require.specified) &&
        require.specified(name) ) 
    {
        if ( !require.defined(name) )
        {
            requireJSPath = { };
            for (i=0; i<dl; i++) 
                require.specified( names[ i ] ) || (requireJSPath[ names[ i ] ] = paths[ i ].replace(ext_js, ''));
            //requireJSPath[ name ] = currentPath.file.replace(ext_js, '');
            require.config({ paths: requireJSPath });
            // named modules, require the module by name given
            define( name, ["require", "exports", "module"].concat( names ), function( require, exports, module ) {
                return factory.apply( root, [{AMD:module}].concat(getDeps( names, paths, arguments, 2, require )) );
            });
        }
    }
    
    // browser, web worker, other loaders, etc.. + AMD optional
    else if ( !(name in currentGlobal) )
    {
        loadScripts( currentGlobal, currentPath.path + '/', names, paths, function( ){ 
            currentGlobal[ name ] = m = factory.apply( root, [{}].concat(getDeps( names, paths, currentGlobal )) ) || 1; 
            isAMD && define( name, ["require"], function( ){ return m; } );
        }, isWebWorker);
    }


}(  /* current root */          this, 
    /* module name */           "Sudoku",
    /* module dependencies */   [['Classy', 'PublishSubscribe', 'Asynchronous'], ['./classy.js', './publishsubscribe.js', './asynchronous.js']], 
    /* module factory */        function( exports, Classy, PublishSubscribe, Asynchronous ) {
        
    /* main code starts here */

/**
*
*   Sudoku.js
*   @version: 0.10
*   @dependencies: Classy.js, PublishSubscribe, Asynchronous.js, jQuery
*
*   Sudoku Builder in JavaScript
*   http://nikos-web-development.netai.net/
*
*   (light-weight and scaled-down version of CrossWord.js, professional Crossword Builder in JavaScript, by same author)
*
**/
var 
Sudoku = exports['Sudoku'] = { }
,_jQuery_ = ('function' === typeof jQuery ? jQuery : function( ){ })
,_Asynchronous_ = ('function' === typeof Asynchronous ? Asynchronous : {isThread: function(){return false;}, path: function(){return {file:null, path:null};}})
;
!function(Sudoku, Classy, PublishSubscribe, Asynchronous, $, undef) {
    "use strict";
    
    var PROTO = "prototype", HAS = 'hasOwnProperty'
        ,OP = Object[PROTO], AP = Array[PROTO], FP = Function[PROTO]
        ,round = Math.round, rand = Math.random
        
        ,rnd = function( m, M ) { return round( (M-m)*rand() + m ); }
        
        ,array = function( n ) { return new Array(n); }
        
        ,n_array = function n_array( dims ) {
            var len = dims.shift( ),
                a = len ? new Array( len ) : [ ], i
            ;
            if ( dims.length )
            {
                for (i=0; i<len; i++) a[ i ] = n_array( dims.slice(0) );
            }
            return a;
        }
        
        ,range = function( n, options, shuffled )  {
            var range, i;
            options = options || {};
            if ( options[HAS]('alphabet') && (n === options.alphabet.length) ) 
            {
                // string passed as alphabet, make array
                if ( alphabet.substr && alphabet.split ) range = alphabet.split("");
                else range = alphabet.slice();
            }
            else
            {
                range = new Array( n );
                if ( options[HAS]('value') )
                {
                    var v = options.value, is_arr_str = !!v.slice;
                    for (i=0; i<n; i++) {range[ i ] = is_arr_str ? v.slice() : v;}
                }
                else
                {
                    var start = options[HAS]('start') ? parseInt(options.start, 10) : 0,
                        step = options[HAS]('step') ? parseInt(options.step, 10) : 1,
                        istep = 0;
                    for (i=0; i<n; i++) {range[ i ] = istep+start; istep += step;}
                }
            }
            if ( true === shuffled ) range = shuffle( range );
            return range;
        }
        
        // Array multi - sorter utility
        // returns a sorter that can (sub-)sort by multiple (nested) fields 
        // each ascending or descending independantly
        // https://github.com/foo123/sinful.js
        ,sorter = function () {

            var arr = this, i, args = arguments, l = args.length,
                a, b, step, lt, gt,
                field, filter_args, sorter_args, desc, dir, sorter,
                ASC = '|^', DESC = '|v';
            // |^ after a (nested) field indicates ascending sorting (default), 
            // example "a.b.c|^"
            // |v after a (nested) field indicates descending sorting, 
            // example "b.c.d|v"
            if ( l )
            {
                step = 1;
                sorter = [];
                sorter_args = [];
                filter_args = []; 
                for (i=l-1; i>=0; i--)
                {
                    field = args[i];
                    // if is array, it contains a filter function as well
                    filter_args.unshift('f'+i);
                    if ( field.push )
                    {
                        sorter_args.unshift(field[1]);
                        field = field[0];
                    }
                    else
                    {
                        sorter_args.unshift(null);
                    }
                    dir = field.slice(-2);
                    if ( DESC === dir ) 
                    {
                        desc = true;
                        field = field.slice(0,-2);
                    }
                    else if ( ASC === dir )
                    {
                        desc = false;
                        field = field.slice(0,-2);
                    }
                    else
                    {
                        // default ASC
                        desc = false;
                    }
                    field = field.length ? '["' + field.split('.').join('"]["') + '"]' : '';
                    a = "a"+field; b = "b"+field;
                    if ( sorter_args[0] ) 
                    {
                        a = filter_args[0] + '(' + a + ')';
                        b = filter_args[0] + '(' + b + ')';
                    }
                    lt = desc ?(''+step):('-'+step); gt = desc ?('-'+step):(''+step);
                    sorter.unshift("("+a+" < "+b+" ? "+lt+" : ("+a+" > "+b+" ? "+gt+" : 0))");
                    step <<= 1;
                }
                // use optional custom filters as well
                return (new Function(
                        filter_args.join(','), 
                        'return function(a,b) { return ('+sorter.join(' + ')+'); };'
                        ))
                        .apply(null, sorter_args);
            }
            else
            {
                a = "a"; b = "b"; lt = '-1'; gt = '1';
                sorter = ""+a+" < "+b+" ? "+lt+" : ("+a+" > "+b+" ? "+gt+" : 0)";
                return new Function("a,b", 'return ('+sorter+');');
            }
        }
        // http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
        ,shuffle = function( a, copied ) {
            var N, perm, swap, ac;
            ac = true === copied ? a.slice() : a;
            N = ac.length;
            while ( N-- )
            { 
                perm = rnd( 0, N ); 
                swap = ac[ N ]; 
                ac[ N ] = ac[ perm ]; 
                ac[ perm ] = swap; 
            }
            // in-place or copy
            return ac;
        }
        // http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
        // variation to shuffle only parts of array
        // while leaving other parts unaltered
        ,shufflex = function( a, o, copied ) {
            var i, j, N, perm, swap, inc, ac;
            ac = true === copied ? a.slice() : a;
            o = o || {};
            if ( o[HAS]('included') && o.included.length )
            {
                inc = o.included;
            }
            else if ( o[HAS]('included_range') && o.included_range.length )
            {
                inc = []; i=0; j=0;
                while (i < a.length)
                {
                    if (j<o.included_range.length && (i>=o.included_range[j] && (j+1 >=o.included_range.length || i<=o.included_range[j+1]))) inc.push( i );
                    else j+=2;
                    i++;
                }
            }
            else if ( o[HAS]('excluded') && o.excluded.length )
            {
                inc = []; i=0; j=0;
                while (i < a.length)
                {
                    if (j>=o.excluded.length || i<o.excluded[j]) inc.push( i );
                    else j++;
                    i++;
                }
            }
            else if ( o[HAS]('excluded_range') && o.excluded_range.length )
            {
                inc = []; i=0; j=0;
                while (i < a.length)
                {
                    if (j<o.excluded_range.length && i>=o.excluded_range[j]) {i = j+1<o.excluded_range.length ? o.excluded_range[j+1] : i; j+=2;}
                    else inc.push( i );
                    i++;
                }
            }
            else
            {
                inc = [];
            }
            N = inc.length;
            while ( N-- )
            { 
                perm = rnd( 0, N ); 
                swap = ac[ inc[N] ]; 
                ac[ inc[N] ] = ac[ inc[perm] ]; 
                ac[ inc[perm] ] = swap; 
            }
            // in-place or copy
            return ac;
        }
        
        ,clamp = function( v, m, M ) {
            return ( v < m ) ? m : ((v > M) ? M : v);
        }
        
        ,_UUID = 0
    ;
        
    Classy.Merge( Sudoku, { 
        
        VERSION: "0.10"
        
        // dependencies
        ,Class: Classy.Class
        ,StaticClass: function( C ) { return Classy.Class(Classy.STATIC, C); }
        ,Asynchronous: Asynchronous
        ,PublishSubscribe: PublishSubscribe
        ,$: $
        
        ,isWorker: Asynchronous.isThread( )
        ,Path: Asynchronous.path( exports.AMD )
        
        ,UUID: function( NS ) {
            return [NS||'pzl', ++_UUID, new Date().getTime()].join('_');
        }
        
        ,LOCALE: { }
        
        ,setLocale: function( locales ) {
            if ( locales )
            {
                for (var key in locales )
                {
                    if ( locales[HAS](key) ) Sudoku.LOCALE[ key ] = locales[ key ];
                }
            }
        }
        
        ,clearLocale: function( ) {
            Sudoku.LOCALE = { };
        }
        
        ,locale: function( key ) {
            return key && Sudoku.LOCALE[HAS]( key ) ? Sudoku.LOCALE[ key ] : key;
        }
        
        // utilities
        ,array: array
        ,n_array: n_array
        ,range: range
        ,sorter: sorter
        ,shuffle: shuffle
        ,shufflex: shufflex
        ,clamp: clamp
        ,randi: rnd
        ,randf: function(m, M) { return (M-m)*rand() + m; }
        ,randomItem: function( a ) { return a && a.length ? a[ rnd(0, a.length-1) ] : null; }
    });
    
}(Sudoku, Classy, PublishSubscribe, _Asynchronous_, _jQuery_ );/**
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
    
}(Sudoku);/**
*
* Sudoku.Grid Class
* Represents a (generic) crossword grid and the operations/user interactions performed on the grid
*
**/
!function(Sudoku, undef){
    "use strict";
    
    var floor = Math.floor, round = Math.round, ceil = Math.ceil,
        min = Math.min, max = Math.max, abs = Math.abs, clamp = Sudoku.clamp, shuffle = Sudoku.shuffle,
        Factory = Sudoku.Factory, $ = Sudoku.$, extend = $.extend, UUID = Sudoku.UUID,
        getTransformProperty = Factory.getTransformProperty, getCSS = Factory.getCSS, 
        createStyleSheet = Factory.createStyleSheet, disposeStyleSheet = Factory.disposeStyleSheet,
        Element = Factory.getElement,
        //locale = Sudoku.locale, 
        CELL = 1, SEP = 2, IMAGE = 4, PLACEHOLDER = 8, CLUE = 16,
        SPACE_KEY = 32, DEL_KEY = 46, KEY_LEFT = 37, KEY_UP = 38, KEY_RIGHT = 39,  KEY_DOWN = 40,
        HORIZONTAL = 1, VERTICAL = 2, 
        ERRORCLASS = "notvalid", HIGHLIGHTCLASS = "highlighted", FOCUSEDCLASS = 'cell-focused',
        HIDE_CLUES = "hide-clues", HIDE_SOLUTION = "hide-solution",
        HAS = 'hasOwnProperty'
    ;
    
    // helpers
    function getRange( L, shuffled )
    {
        var a = new Array( L ), i;
        for (i=0; i<L; i++) a[ i ] = i;
        if ( shuffled ) a = shuffle( a );
        return a;
    }
    
    function cellInBounds( rows, columns )
    {
        return function( ){var c = this; return !!( 0 <= c.row && c.row < rows && 0 <= c.column && c.column < columns );};
    }

    function isCell( ) { return CELL === this.cellType; }
    
    function isSeparatorCell( ) { return SEP === this.cellType; }
    
    function highlightedCell( ) { return 0 < this.highlightType; }
    
    function isValidSolution( ) { return this.value === this.solution; }
    
    function revealCell( ) 
    { 
        var i = this;
        $(i).removeClass( ERRORCLASS );
        i.value = i.solution || "";
        return i;
    }    
    
    function clearCell( )
    { 
        var c = this;
        c.firstChild.value = "";
        return c;
    }
    
    function clearErrors( )
    { 
        var i = this;
        $(i).removeClass( ERRORCLASS );
        if ( i.value !== i.solution ) i.value = "";
        return i;
    }
    
    function highlightErrors( ) 
    {
        var i = this, $i = $(i);
        if ( i.value && i.value.length && i.solution )
        {
            if ( i.solution === i.value )
                $i.removeClass( ERRORCLASS );
            else if ( !$i.hasClass( ERRORCLASS ) )
                $i.addClass( ERRORCLASS );
        }
        else
        {
            $i.removeClass( ERRORCLASS );
        }
        return i;
    }
            
    function deHighlightErrors( ) 
    {
        var i = this;
        $(i).removeClass( ERRORCLASS );
        return i;
    }
    
    function highlightCell( ) 
    { 
        var c = this;
        if ( c.highlightType <= 0 )
        {
            c.highlightType = 1;
            $(c).addClass( HIGHLIGHTCLASS );
        }
    }
    
    function deHighlightCell( ) 
    { 
        var c = this;
        if ( c.highlightType > 0 )
        {
            c.highlightType = 0;
            $(c).removeClass( HIGHLIGHTCLASS );
        }
    }
    
    function toDefault( )
    {
        var c = this, $c = $(c);
        $c.removeClass('ui-selected default placeholder');
        if ( IMAGE === c.cellType )
        {
            c.cellType = CELL;
            $c.addClass('default');
        }
        return c;
    }
    
    function moveCursor( $cell, code, nowrap, gc, rows, columns )
    {
        nowrap = !(nowrap || false);
        var cell = $cell[ 0 ], $next, row = cell.row, column = cell.column;
        
        if ( false === code )
        {
            // get neighbor highlighted cell
            $next = $cell.nextAll('.cell.default').filter( highlightedCell );
            if ( $next.length ) $next.eq(0).children('input').focus();
        }
        
        else if ( KEY_UP === code )
        {
            $next = $cell.prevAll('.cell.default.column-'+column);
            while ( nowrap && !$next.length && column > 0 )
            {
                column--;
                if ( column >= 0 )
                {
                    $cell = gc.filter('.row-last.column-'+column);
                    if ( CELL === $cell[0].cellType )
                        $next = $cell;
                    else
                        $next = $cell.prevAll('.cell.default.column-'+column);
                }
            }
            if ( $next.length ) $next.eq(0).children('input').focus();
        }
        
        else if ( KEY_DOWN === code )
        {
            $next = $cell.nextAll('.cell.default.column-'+column);
            while ( nowrap && !$next.length && column < columns )
            {
                column++;
                if ( column < columns )
                {
                    $cell = gc.filter('.row-first.column-'+column);
                    if ( CELL === $cell[0].cellType )
                        $next = $cell;
                    else
                        $next = $cell.nextAll('.cell.default.column-'+column);
                }
            }
            if ( $next.length ) $next.eq(0).children('input').focus();
        }
        
        else if ( KEY_LEFT === code )
        {
            $next = $cell.prevAll('.cell.default.row-'+row);
            while ( nowrap && !$next.length && row > 0 )
            {
                row--;
                if ( row >= 0 )
                {
                    $cell = gc.filter('.column-last.row-'+row);
                    if ( CELL === $cell[0].cellType )
                        $next = $cell;
                    else
                        $next = $cell.prevAll('.cell.default.row-'+row);
                }
            }
            if ( $next.length ) $next.eq(0).children('input').focus();
        }
        
        else if ( KEY_RIGHT === code )
        {
            $next = $cell.nextAll('.cell.default.row-'+row);
            while ( nowrap && !$next.length && row < rows )
            {
                row++;
                if ( row < rows )
                {
                    $cell = gc.filter('.column-first.row-'+row);
                    if ( CELL === $cell[0].cellType )
                        $next = $cell;
                    else
                        $next = $cell.nextAll('.cell.default.row-'+row);
                }
            }
            if ( $next.length ) $next.eq(0).children('input').focus();
        }
        return $next;
    }
    
    // add this crossword type
    // Crossword Grid Class
    Sudoku.Grid = Sudoku.Class({extends: Object, implements: Sudoku.PublishSubscribe}, {
        
        // static
        __static__: {
            
            CELL: CELL,
            SEP: SEP,
            IMAGE: IMAGE,
            PLACEHOLDER: PLACEHOLDER,
            CLUE: CLUE,
            
            HORIZONTAL: HORIZONTAL, 
            VERTICAL: VERTICAL, 
            ERRORCLASS: ERRORCLASS, 
            HIGHLIGHTCLASS: HIGHLIGHTCLASS, 
            FOCUSEDCLASS: FOCUSEDCLASS,
            HIDE_CLUES: HIDE_CLUES, 
            HIDE_SOLUTION: HIDE_SOLUTION,
            
            DIRECTION_1: 256, 
            TOP_RIGHT_HOR: 257, 
            TOP_RIGHT_VER: 258, 
            TOP_LEFT_HOR: 259, 
            TOP_LEFT_VER: 300,
            
            DIRECTION_2: 512, 
            BOTTOM_LEFT_VER: 514, 
            BOTTOM_RIGHT_HOR: 513, 
            BOTTOM_LEFT_HOR: 515,
            
            CLEAR_DIRECTION_1: 1256,
            CLEAR_DIRECTION_2: 1512,
            CLEAR_DIRECTIONS: 2048,
            
            getRange: getRange,
            isCell: isCell,
            isSeparatorCell: isSeparatorCell,
            highlightedCell: highlightedCell,
            isValidSolution: isValidSolution,
            revealCell: revealCell,
            clearCell: clearCell,
            clearErrors: clearErrors,
            highlightCell: highlightCell,
            deHighlightCell: deHighlightCell,
            highlightErrors: highlightErrors,
            deHighlightErrors: deHighlightErrors,
            moveCursor: moveCursor
        },
        
        constructor: function( ) {
            var self = this;
            self.type = 'GRID';
            self.id = UUID( );
            self.selector = self.getSelector();
            self.dimensions = self.getDefaultDimensions( );
            self.styles = self.getDefaultStyles( );
            self.cssStyles = self.getDefaultCssStyles( self.selector, self.styles, self.dimensions );
            self.style = createStyleSheet( 'all', self.cssStyles );
            self.grid = null;
            self.cells = null;
            self.cellInputs = null;
            self.userMode = false;
            self.initPubSub( );
        },
        
        type: null,
        id: null,
        selector: null,
        grid: null,
        cells: null,
        style: null,
        styles: null,
        cssStyles: null,
        dimensions: null,
        alphabet: null,
        clues: null,
        cellInputs: null,
        currentInputCell: null,
        toggleErrorsHighlight: false,
        toggleHorizontalHighlight: true,
        userMode: false,
        highlightMode: false,
        
        dispose: function( ) {
            var self = this;
            self.type = null;
            self.id = null;
            self.selector = null;
            self.dimensions = null;
            self.alphabet = null;
            self.clues = null;
            self.currentInputCell = null;
            self.toggleErrorsHighlight = null;
            self.toggleHorizontalHighlight = null;
            self.cellInputs = null;
            self.cells = null;
            self.styles = null;
            self.cssStyles = null;
            disposeStyleSheet( self.style );
            self.style = null;
            if ( self.grid ) 
            {
                // http://stackoverflow.com/questions/768621/how-to-dispose-of-dom-elements-in-javascript-to-avoid-memory-leaks
                self.setSelectable( false, true ).setResizable( false, true );
                self.grid.off( );
                self.grid.children( ).remove( );
                self.grid.remove( );
            }
            self.grid = null;
            self.disposePubSub( );
            return self;
        },
        
        getCell: function( row, column ) {
            var index = arguments.length < 2 ? (row||0) : ((row || 0)*this.dimensions.columns + (column || 0));
            return this.cells.eq( index );
        },
        
        getRow: function( row, col1, col2 ) {
            var cols = this.dimensions.columns, r = (row||0)*cols;
            col1 = col1 || 0; col2 = col2 ? (col2+1) : cols;
            return this.cells.slice( r+col1, r+col2 );
        },
        
        getColumn: function( column, row1, row2 ) {
            var self = this, cells = self.cells, 
                rows = self.dimensions.rows, cols = self.dimensions.columns, 
                r, rc, rc0, col = $([])
            ;
            column = column || 0;
            row1 = row1 || 0;
            row2 = row2 || (rows-1);
            rc0 = row1*cols;
            for (r=row1,rc=rc0; r<=row2; r++,rc+=cols)
                col = col.add( cells.eq( rc + column ) );
            return col;
        },
        
        getCells: function( row1, column1, row2, column2 ) {
            var self = this, cells, r, c, rc, rc0, gc = self.cells, 
                columns = self.dimensions.columns, rows = self.dimensions.rows
            ;
            if ( !arguments.length )
            {
                return gc.slice( 0 );
            }
            else if ( arguments.length < 2 )
            {
                column1 = 0;
                row2 = rows-1;
                column2 = columns-1;
            }
            else if ( arguments.length < 3 )
            {
                row2 = rows-1;
                column2 = columns-1;
            }
            else if ( arguments.length < 4 )
            {
                column2 = columns-1;
            }
            
            if ( row1 > row2 )
            {
                // swap
                rc = row1;
                row1 = row2;
                row2 = rc;
            }
            if ( column1 > column2 )
            {
                // swap
                rc = column1;
                column1 = column2;
                column2 = rc;
            }
            row1 = clamp(row1, 0, rows-1);
            row2 = clamp(row2, 0, rows-1);
            column1 = clamp(column1, 0, columns-1);
            column2 = clamp(column2, 0, columns-1);
            
            // needed for $.slice
            column2 = column2+1;
            
            cells = $([]);
            rc0 = row1*columns;
            for (r=row1,rc=rc0; r<=row2; r++,rc+=columns)
            {
                cells = cells.add( gc.slice( rc + column1, rc + column2 ) );
            }
            return cells;
        },
        
        getRange: function( cells ) {
            var range, rm = Infinity, rM = -Infinity, cm = Infinity, cM = -Infinity;
            if ( cells && cells.length )
            {
                cells.each(function( ) {
                    var c = this, cr = c.row, cc = c.column;
                    if ( cr <= rm ) rm = cr;
                    if ( cr >= rM ) rM = cr;
                    if ( cc <= cm ) cm = cc;
                    if ( cc >= cM ) cM = cc;
                });
                range = [
                    {row: rm, column: cm},
                    {row: rM, column: cM}
                ];
            }
            else
            {
                range = [
                    {row: 0, column: 0},
                    {row: 0, column: 0}
                ];
            }
            return range;
        },
        
        getCellInputs: function( ) {
            var self = this;
            if ( !self.cellInputs ) self.cellInputs = self.cells.filter( isCell ).children( 'input' );
            return self.cellInputs;
        },
        
        setSelectable: function( enable, and_destroy ) {
            var self = this, grid = self.grid, isAlreadyCreated, isAlreadySelectable;
            
            if ( $.fn.selectable )
            {
                if ( grid )
                {
                    isAlreadyCreated = /*grid.hasClass('ui-selectable') &&*/ !!grid.data('ui-selectable');
                    isAlreadySelectable = isAlreadyCreated ? !grid.selectable( 'option', 'disabled' ) : false;
                    if ( enable )
                    {
                        if ( !isAlreadyCreated )
                        {
                            grid.selectable({ 
                                filter: '.cell',
                                autoRefresh: false
                            });
                        }
                        else if ( isAlreadyCreated && !isAlreadySelectable )
                        {
                            grid.selectable( 'option', 'disabled', false );
                        }
                    }
                    else 
                    {
                        if ( and_destroy && isAlreadyCreated )
                        {
                            grid.children( '.ui-selected' ).removeClass( 'ui-selected' );
                            grid.selectable( 'destroy' );
                        }
                        else if ( isAlreadySelectable && !and_destroy )
                        {
                            grid.children( '.ui-selected' ).removeClass( 'ui-selected' );
                            grid.selectable( 'option', 'disabled', true )
                                        .removeClass('ui-state-disabled')
                                        .attr('aria-disabled', "false")
                                    ;
                        }
                    }
                }
            }
            return self;
        },
        
        setResizable: function( enable, and_destroy ) {
            var self = this, grid = self.grid, 
                isAlreadyResizable, isAlreadyCreated,
                disableSelectable, enableSelectable
            ;
            
            if ( $.fn.resizable )
            {
                if ( grid )
                {
                    isAlreadyCreated = /*grid.hasClass('ui-resizable') &&*/ !!grid.data('ui-resizable');
                    isAlreadyResizable = isAlreadyCreated ? !grid.resizable('option', 'disabled') : false;
                    
                    if ( enable )
                    {
                        if ( !isAlreadyCreated )
                        {
                            disableSelectable = function( ) {
                                self.setSelectable( false );
                            };
                            enableSelectable = function( ) {
                                self.setSelectable( true );
                            };
                        
                            grid/*.on('resizestart', startResize)
                                .on('resizestop', stopResize)*/
                                .on('mousedown.resizablehandle', '>.ui-resizable-handle:not(.ui-resizable-image-handle)', disableSelectable)
                                .on('mouseup.resizablehandle', '>.ui-resizable-handle:not(.ui-resizable-image-handle)', enableSelectable)
                                .resizable({ 
                                    animate: false,
                                    aspectRatio: true,
                                    autoHide: true,
                                    handles: 'all',
                                    minHeight: 100,
                                    minWidth: 100,
                                    delay: 50,
                                    ghost: true,
                                    distance: 2,
                                    helper: "resizable-helper",
                                    grid: false,
                                    start: function( event, ui ) {
                                        disableSelectable( );
                                        grid.addClass('resizing');
                                    },
                                    stop: function( event, ui ) {
                                        var dims = self.dimensions, 
                                            cellSize = dims.cellSize,
                                            newCellSize = round( ui.size.width / dims.columns )
                                        ;
                                        //console.log([cellSize, newCellSize]);
                                        dims.cellSize = newCellSize;
                                        grid.removeClass('resizing');
                                        enableSelectable( );
                                        self.updateDimensions( );
                                    }
                                })
                            ;
                        }
                        else if ( isAlreadyCreated && !isAlreadyResizable )
                        {
                            grid.resizable('option', 'disabled', false);
                        }
                    }
                    else 
                    {
                        if ( and_destroy && isAlreadyCreated )
                        {
                            grid.resizable( 'destroy' )
                            .off('mousedown.resizablehandle mouseup.resizablehandle resizestart resizestop')
                            ;
                        }
                        else if ( isAlreadyResizable && !and_destroy )
                        {
                            grid.resizable('option', 'disabled', true)
                                        .removeClass('ui-state-disabled')
                                        .attr('aria-disabled', "false")
                                    ;
                        }
                    }
                }
            }
            return self;
        },
        
        setHighlightMode: function( bool ) {
            this.highlightMode = !!bool;
            return this;
        },
        
        handleInput: function( evt, input, prevval ) {
            var self = this, AB = self.alphabet, 
                val = input.value.toUpperCase( ), $input = $(input),
                rows = self.dimensions.rows, ret, cell,
                columns = self.dimensions.columns,
                moveDir = self.toggleHorizontalHighlight ? KEY_RIGHT : KEY_DOWN
            ;
            if ( val.length && 0 > AB.indexOf( val ) ) val = "";
            if ( self.toggleErrorsHighlight )
            {
                if ( input.solution && val.length && val !== input.solution )
                {
                    if ( !$input.hasClass( ERRORCLASS ) )
                        $input.addClass( ERRORCLASS );
                }
                else
                {
                    $input.removeClass( ERRORCLASS );
                }
            }
            input.value = val;
            
            // move cursor to next cell
            if ( val.length && -1 < AB.indexOf( val ) ) ret = moveCursor( $input.parent('.cell'), false, true, self.cells, rows, columns );
            else ret = $input.parent('.cell');
            if ( val !== prevval ) self.trigger( 'input', {input: input} );
            return ret;
        },
    
        handleKeyNav: function( evt, $cell ) {
            var self = this, dims = self.dimensions;
            return moveCursor( 
                $cell, 
                evt.which, 
                false, 
                self.cells, 
                dims.rows, 
                dims.columns 
            );
        },
        
        showClues: function( bool ) {
            var self = this, g = self.grid;
            bool = !arguments.length ? true : !!bool;
            if ( bool && g.hasClass( HIDE_CLUES ) ) g.removeClass( HIDE_CLUES );
            else if ( !bool && !g.hasClass( HIDE_CLUES ) ) g.addClass( HIDE_CLUES );
            return self;
        },
        
        showSolution: function( bool ) {
            var self = this, g = self.grid;
            bool = !arguments.length ? true : !!bool;
            if ( bool && g.hasClass( HIDE_SOLUTION ) ) g.removeClass( HIDE_SOLUTION );
            else if ( !bool && !g.hasClass( HIDE_SOLUTION ) ) g.addClass( HIDE_SOLUTION );
            return self;
        },
        
        enableUserMode: function( enable ) {
            var self = this, g = self.grid;
            if ( enable && !self.userMode )
            {
                g.addClass( 'user-mode' );
                self.setResizable( false );
                self.userMode = true;
                self.trigger( 'userMode', {userMode: true} );
            }
            else if ( !enable && self.userMode )
            {
                g.removeClass( 'user-mode' );
                self.setResizable( true );
                self.userMode = false;
                self.trigger( 'userMode', {userMode: false} );
            }
            return self;
        },
        
        scale: function( s ) {
            var self = this, grid = self.grid[0],
                transformProperty = getTransformProperty( grid );
            if ( arguments.length )
            {
                s = parseFloat(s, 10);
                grid.style[ transformProperty+'Origin' ] = 'center center';
                grid.style[ transformProperty ] = 'scale('+s+','+s+')';
            }
            else
            {
                grid.style[ transformProperty+'Origin' ] = 'center center';
                grid.style[ transformProperty ] = 'none';
            }
            return self;
        },
        
        build: function( dims ) {
            var self = this;
            self
                .buildGrid( dims )
                .onBuildComplete( )
                .trigger( 'build', null, 50 )
                .trigger( 'percentage', {percentage: self.getPercentage( )}, 100 )
            ;
            return self;
        },
        
        importTpl: function( jsonTpl ) {
            var self = this;
            if ( jsonTpl && jsonTpl[HAS]("dimensions") )
            {
                self
                    //.setDimensions( jsonTpl.dimensions )
                    .setStyles( jsonTpl.styles )
                    .buildGrid( jsonTpl.dimensions )
                ;
                
                if ( jsonTpl[HAS]('alphabet') && jsonTpl.alphabet && jsonTpl.alphabet.length ) 
                    self.setAlphabet( jsonTpl.alphabet );
                
                self
                    .onBuildComplete( )
                    .trigger( 'build', null, 50 )
                    .trigger( 'import', null, 100 )
                ;
            }
            return self;
        },
        
        exportTpl: function( ) {
            var self = this, g = self.grid, gc = self.cells,
                
                jsonTpl = {
                    "type": self.type,
                    
                    "alphabet": self.alphabet || null,
                    
                    "dimensions": extend({}, self.dimensions),
                    
                    "styles": extend({}, self.styles)
                }
            ;
            
            return jsonTpl;
        },
        
        revealSolution: function( ) {
            this.getCellInputs( ).each( revealCell );
            return this;
        },
        
        revealCells: function( cells ) {
            if ( cells && cells.length ) cells.children( 'input' ).each( revealCell );
            return this;
        },
        
        revealCell: function( cell ) {
            cell = cell || this.currentInputCell || null;
            if ( cell && cell.length && CELL === cell[ 0 ].cellType )
                revealCell.call( cell[ 0 ].firstChild );
            return this;
        },
        
        checkIsSolved: function( ) {
            var inputs = this.getCellInputs( );
            return inputs.filter( isValidSolution ).length === inputs.length;
        },
        
        getSolvedPercent: function( ) {
            var inputs = this.getCellInputs( );
            return inputs.filter( isValidSolution ).length / (inputs.length || 1);
        },
        
        highlightErrors: function( toggle ) {
            var self = this;
            self.toggleErrorsHighlight = !!toggle;
            self.getCellInputs( ).each( self.toggleErrorsHighlight ? highlightErrors : deHighlightErrors );
            return self;
        },
        
        clearErrors: function( ) {
            this.getCellInputs( ).each( clearErrors );
            return this;
        },
        
        getCssStyles: function( externalCss ) {
            externalCss = externalCss 
                    ? '<link rel="stylesheet" media="all" href="' + externalCss + '" />'
                    : ''
                ;
            return  externalCss + '<style type="text/css" media="all">'+getCSS( this.style )+'</style>';
        },
        
        setStyles: function( styles ) {
            var self = this, defaultStyles = self.getDefaultStyles( );
            self.styles = extend({}, self.styles || defaultStyles, styles);
            if ( !self.styles[HAS]("symbolColor") ) self.styles.symbolColor = defaultStyles.symbolColor;
            if ( !self.styles[HAS]("clueColor") ) self.styles.clueColor = defaultStyles.clueColor;
            return self;
        },
        
        setDimensions: function( dims ) {
            var self = this;
            self.dimensions = extend({}, self.dimensions || self.getDefaultDimensions( ), dims);
            return self;
        },
        
        updateStyles: function( andTrigger ) {
            var self = this, cssStyles = self.cssStyles, styles = self.styles;
            cssStyles.grid.css.style.borderColor = styles.outerBorderColor;
            cssStyles.grid.css.style.borderWidth = styles.outerBorderThickness + 'px';
            cssStyles.cell.css.style.backgroundColor = styles.cellColor;
            cssStyles.cell.css.style.borderColor = styles.borderColor;
            cssStyles.cell.css.style.borderStyle = styles.borderStyle;
            cssStyles.cell.css.style.color = styles.symbolColor;
            cssStyles.highlighted.css.style.backgroundColor = styles.highlightColor;
            if ( false !== andTrigger ) self.trigger( 'update-styles' );
            return self;
        },
        
        updateDimensions: function( andTrigger ) {
            var self = this, dims = self.dimensions, 
                styles = self.styles, cssStyles = self.cssStyles,
                d = dims.cellSize, di = round( 0.6*d ), 
                rows = dims.rows, columns = dims.columns,
                totalCells = rows*columns, r, c, prevRows, prevColumns,
                className, grid = self.grid, gridEl = grid[0], cells = self.cells,
                cellsInBounds = cellInBounds( rows, columns ),
                $last, cell, currentRows
            ;
            
            // update grid classes
            gridEl.className = gridEl.className
                .replace(/\bnumRows-(\d+)\b/, function(m, m1){ prevRows = parseInt(m1, 10); return 'numRows-'+rows; })
                .replace(/\bnumColumns-(\d+)\b/, function(m, m1){ prevColumns = parseInt(m1, 10); return 'numColumns-'+columns; })
                .replace(/\bsizeCell-\d+\b/, 'sizeCell-'+d)
            ;
            
            // remove any inlined width/height added by ui-resizable
            gridEl.style.width = '';
            gridEl.style.height = '';
            gridEl.style.left = '';
            gridEl.style.top = '';
            // update grid dimensions
            cssStyles.grid.css.style.width = (d*columns) + 'px';
            cssStyles.grid.css.style.height = (d*rows) + 'px';
            
            cssStyles.cell.css.style.width = d+'px';
            cssStyles.cell.css.style.height = d+'px';
            cssStyles.cell.css.style.fontSize = di+'px';
            
            // update grid cells
            cells.each(function( ) {
                var cell = this, $cell = $(cell),
                    col = cell.column, row = cell.row
                ;
                
                if ( row >= rows || col >= columns ) 
                {
                    $cell.remove( );
                }
                else
                {
                    $cell.removeClass('row-first row-last column-first column-last');
                    if ( 0 === row ) $cell.addClass('row-first');
                    if ( rows-1 === row ) $cell.addClass('row-last');
                    if ( 0 === col ) $cell.addClass('column-first');
                    if ( columns-1 === col ) $cell.addClass('column-last');
                    
                    cell.style.top = (row*d)+'px';
                    cell.style.left = (col*d)+'px';
                }
            });
            
            // add any additional rows/columns
            if ( columns > prevColumns )
            {
                currentRows = min( rows, prevRows );
                for(r=0; r<currentRows; r++)
                {
                    $last = grid.children('.cell.row-'+r).eq(-1);
                    
                    for(c=prevColumns; c<columns; c++)
                    {
                       cell = self.buildCell( r, c, d, 
                            'cell default row-' + r + ' column-' + c + (0==r ? ' row-first' : (rows-1==r ? ' row-last' : '')) + (0==c ? ' column-first' : (columns-1==c ? ' column-last' : ''))
                        );
                        $last = $(cell).insertAfter( $last );
                    }
                }
            }
            if ( rows > prevRows )
            {
                for(r=prevRows; r<rows; r++)
                {
                    for(c=0; c<columns; c++)
                    {
                       cell = self.buildCell( r, c, d, 
                            'cell default row-' + r + ' column-' + c + (0==r ? ' row-first' : (rows-1==r ? ' row-last' : '')) + (0==c ? ' column-first' : (columns-1==c ? ' column-last' : ''))
                        );
                        grid.append( cell );
                    }
                }
            }
            self.cells = grid.children( '.cell' );
            
            // update grid selectable
            if ( grid.hasClass('ui-selectable') ) 
            {
                grid.selectable( 'refresh' );
            }
            if ( false !== andTrigger ) 
            {
                self.trigger( 'update-dimensions' );
                self.trigger( 'percentage', {percentage: self.getPercentage( )}, 100 );
            }
            return self;
        },
        
        setAlphabet: function( alphabet ) {
            if ( alphabet && alphabet.length )
            {
                this.alphabet = alphabet.join ? alphabet.join('') : alphabet.slice();
            }
            return this;
        },
        
        // @override
        getHighlighted: function( ) {
            return this.cells.filter( highlightedCell );
        },
        
        // @override
        clearHighlighted: function( ) {
            this.cells.filter( highlightedCell ).each( clearCell );
            return this;
        },
        
        clearCells: function( useCached ) {
            var self = this;
            if ( true === useCached ) self.getCellInputs( ).val( "" );
            else self.cells.children( 'input' ).val( "" );
            return self;
        },
        
        // @override
        decorateCell: function( ) {
            return cell;
        },
        
        // @override
        highlightClue: function( ) {
            return this;
        },
        
        // @override
        addClue: function( ) {
            return this;
        },
        
        // @override
        addClues: function( ) {
            return this;
        },
        
        // @override
        clearClues: function( ) {
            return this;
        },
        
        clearGrid: function( useCached ) {
            this
                .clearCells( useCached )
                .clearClues( )
            ;
            return this;
        },
        
        buildGrid: function( dims ) {
            var self = this, r, c, grid, row, cell, styles, cssStyles, rows, columns, cellSize;
            
            dims = dims || {};
            
            if ( !self.dimensions ) self.dimensions = self.getDefaultDimensions( );
            if ( !self.styles ) self.styles = self.getDefaultStyles( );
            self.userMode = false;
            
            self.alphabet = self.alphabet || Sudoku.ALPHABET;
            if ( dims.rows ) self.dimensions.rows = dims.rows;
            if ( dims.columns ) self.dimensions.columns = dims.columns;
            if ( dims.cellSize ) self.dimensions.cellSize = dims.cellSize;
            rows = self.dimensions.rows;
            columns = self.dimensions.columns;
            cellSize = self.dimensions.cellSize;
            styles = self.styles;
            cssStyles = self.cssStyles;
            
            cssStyles.grid.css.style.width = (cellSize*columns) + 'px';
            cssStyles.grid.css.style.height = (cellSize*rows) + 'px';
            cssStyles.grid.css.style.borderColor = styles.outerBorderColor;
            cssStyles.grid.css.style.borderWidth = styles.outerBorderThickness + 'px';
            cssStyles.cell.css.style.backgroundColor = styles.cellColor;
            cssStyles.cell.css.style.borderColor = styles.borderColor;
            cssStyles.cell.css.style.borderStyle = styles.borderStyle;
            cssStyles.cell.css.style.width = cellSize+'px';
            cssStyles.cell.css.style.height = cellSize+'px';
            cssStyles.cell.css.style.fontSize = round( 0.6*cellSize )+'px';
            cssStyles.cell.css.style.color = styles.symbolColor;
            cssStyles.highlighted.css.style.backgroundColor = styles.highlightColor;
            
            grid = Element( 'div' + '#' + self.id + '.' + self.getGridClasses( ).join( '.' ) );
            grid.setAttribute('id', self.id);
            
            for (r=0; r<rows; r++)
            {
                for (c=0; c<columns; c++)
                {
                    cell = self.buildCell( r, c, cellSize, [
                        'cell default', 
                        'row-' + r + (0==r ? ' row-first' : (rows-1==r ? ' row-last' : '')),
                        'column-' + c  + (0==c ? ' column-first' : (columns-1==c ? ' column-last' : ''))
                    ].join(' '));
                    grid.appendChild( cell );
                }
            }
            
            self.grid = $( grid );
            self.cells = self.grid.children( '.cell' );
            return self;
        },
        
        buildCell: function( row, col, size, className ) {
            var cell = Element( 'div' ), input = Element( 'input' );
            
            cell.cellType = CELL;
            cell.highlightType = 0;
            cell.row = row;
            cell.column = col;
            cell.style.top = (row*size)+'px';
            cell.style.left = (col*size)+'px';
            
            input.solution = null;
            input.highlightType = 0;
            input.setAttribute( "type", "text" );
            input.setAttribute( "value", "" );
            input.setAttribute( "maxlength", "1" );
            
            cell.appendChild( input );
            
            if ( className ) cell.className = ''+className;
            return cell;
        },
        
        // @override
        onBuildComplete: function( ) {
            return this;
        },
        
        // @override
        getSelector: function( ) {
            return '#'+this.id+'.crossword';
        },
        
        // @override
        getGridClasses: function( ) {
            var dims = this.dimensions;
            return [ 'crossword', 'numRows-'+dims.rows, 'numColumns-'+dims.columns, 'sizeCell-'+dims.cellSize ];
        },
        
        // @override
        getDefaultDimensions: function( ) {
            return {
                rows: 10,
                columns: 10,
                cellSize: 76
            };
        },
        
        // @override
        getDefaultStyles: function( ) {
            return {
                cellColor: '#ffffff',
                sepColor: '#f2e941',
                placeholderColor: '#ffffff',
                highlightColor: '#dddddd',
                borderColor: '#7f7f7f',
                borderStyle: 'solid',
                outerBorderThickness: 1,
                outerBorderColor: '#aaaaaa',
                symbolColor: '#000000',
                clueColor: '#000000'
            };
        },
        
        // @override
        getDefaultCssStyles: function( pzlSelector, styles, dims ) {
            return {
                grid: {
                    selector: pzlSelector,
                    rules: [
                        'width: '+(dims.columns*dims.cellSize)+'px',
                        'height: '+(dims.rows*dims.cellSize)+'px',
                        'border-color: ' + styles.outerBorderColor,
                        'border-width: ' + styles.outerBorderThickness
                    ]
                },
                cell: {
                    selector: pzlSelector+' > .cell',
                    rules: [
                        'width: '+dims.cellSize+'px',
                        'height: '+dims.cellSize+'px',
                        'font-size: '+round(0.6*dims.cellSize)+'px',
                        'background-color: ' + styles.cellColor,
                        'border-color: ' + styles.borderColor,
                        'border-style: ' + styles.borderStyle,
                        'color: ' + styles.symbolColor
                    ]
                },
                highlighted: {
                    selector: pzlSelector+' > .cell.' + HIGHLIGHTCLASS,
                    rules: [
                        'background-color: ' + styles.highlightColor
                    ]
                }
            };
        },
        
        // @override
        getSeparatorClasses: function( classes ) {
            return '';
        },
        
        // @override
        getPercentage: function( ) {
            return 0;
        },
        
        // @override
        toDefaultCells: function( ) {
            return this;
        },
        
        // @override
        toPlaceholderCells: function( ) {
            return this;
        },
        
        // @override
        toSeparatorCells: function( ) {
            return this;
        },
        
        // @override
        setSolution: function( words ) {
            return this;
        },
        
        // @override
        setClues: function( ) {
            return this;
        },
        
        // @override
        checkCluesMissing: function( ) {
            return false;
        },
        
        toString: function( ) {
            return '[Sudoku.Puzzle type='+this.type+']';
        }
    });
    
}(Sudoku);/**
*
* Sudoku.Sudoku Class
* Represents a puzzle grid of 'sudoku' type
* Extends the generic crossword Grid and adds any extra functionality needed for sudoku puzzles
*
**/
!function(Sudoku, undef){
    "use strict";
    
    var $ = Sudoku.$, extend = $.extend,
        round = Math.round, min = Math.min, max = Math.max, locale = Sudoku.locale, getRange = Sudoku.range,
        Grid = Sudoku.Grid, moveCursor = Grid.moveCursor, 
        Factory = Sudoku.Factory, Element = Factory.getElement,
        CELL = Grid.CELL, CLUE = Grid.CLUE, 
        SPACE_KEY = 32, ESC_KEY = 27, KEY_LEFT = 37, KEY_UP = 38, KEY_RIGHT = 39,  KEY_DOWN = 40,
        HORIZONTAL = 1, VERTICAL = 2, 
        ERRORCLASS = Grid.ERRORCLASS, 
        HIGHLIGHTCLASS = Grid.HIGHLIGHTCLASS, 
        FOCUSEDCLASS = Grid.FOCUSEDCLASS,
        HAS = 'hasOwnProperty'
    ;
    
    function get_value( cell, index, cells ) { cell.index = index; return cell.val; }
    function is_clue( )  { return this.clue; }
    function is_not_clue( ) { return !this.clue; }
    function find_alternatives( cell, alphabet, clues ) 
    {
        var alts = alphabet.slice( 0 ), l = clues.length, k, clue, pos;
            
        if ( !l ) return alts;
        for (k=0; k<l; k++)
        {
            clue = clues[ k ];
            if ( ((cell.column === clue.column) ||
                (cell.row === clue.row) ||
                (cell.square === clue.square)) &&
                -1 < (pos=alts.indexOf( clue.firstChild.value ))
            )
            {
                alts[ pos ] = '';
            }
        }
        return alts;
    }
    function update_notes( sudoku )
    {
        var clues = sudoku.cells.filter( is_clue ), 
            inputs = sudoku.cells.filter( is_not_clue ),
            alphabet = sudoku.alphabet.split("")
        ;
        inputs.each(function( ) {
            var cell = this, $cell = $(cell), alts = find_alternatives( cell, alphabet, clues );
            $cell.find('.sticky-note').each(function( i ){
                if ( !!alts[ i ] ) $(this).removeClass('note-disabled');
                else $(this).addClass('note-disabled');
            });
            $cell.find('.note').each(function( i ){
                if ( !!alts[ i ] ) $(this).removeClass('note-disabled');
                else $(this).addClass('note-disabled');
            });
        });
    }

    // add this crossword type
    Sudoku.Sudoku = Sudoku.Factory.GRIDS['SUDOKU'] = Sudoku.Class(Grid, {
        
        constructor: function( ) {
            var self = this;
            self.$superv('constructor');
            self.type = 'SUDOKU';
            self.difficulty = 1;
            self.dichromia = false;
        },
        
        difficulty: 1,
        dichromia: false,
        
        dispose: function( ) {
            var self = this;
            self.difficulty = null;
            self.dichromia = null;
            self.$superv('dispose');
            return self;
        },
        
        getSelector: function( ) {
            return '#'+this.id+'.crossword.sudoku';
        },
        
        getGridClasses: function( ) {
            var classes = this.$superv('getGridClasses');
            classes.push('sudoku');
            return classes;
        },
        
        getDefaultDimensions: function( ) {
            return {
                rows: 9,
                columns: 9,
                subRows: 3,
                subColumns: 3,
                cellSize: 70
            };
        },
        
        getDefaultStyles: function( ) {
            return {
                cellColor: '#ffffff',
                sepColor: '#f2e941',
                placeholderColor: '#ffffff',
                highlightColor: '#dddddd',
                borderColor: '#7f7f7f',
                borderStyle: 'dashed',
                outerBorderThickness: 2,
                outerBorderColor: '#121212',
                symbolColor: '#608b03',
                clueColor: '#000000'
            };
        },
        
        getDefaultCssStyles: function( pzlSelector, styles, dims ) {
            var cssStyles = this.$superv('getDefaultCssStyles', [pzlSelector, styles, dims]);
            
            if ( cssStyles[HAS]("separator") ) delete cssStyles.separator;
            if ( cssStyles[HAS]("placeholder") ) delete cssStyles.placeholder;
            
            cssStyles.stickyNotes = {
                selector: pzlSelector+' > .cell .sticky-notes a.sticky-note:before',
                rules: [
                    'color: ' + styles.symbolColor
                ]
            };
            cssStyles.highlighted = {
                selector: [
                            pzlSelector+' > .cell:not(.clue):hover',
                            pzlSelector+' > .cell:not(.clue):focus'
                        ].join(','),
                rules: [
                    'background-color: ' + styles.highlightColor
                ]
            };
            cssStyles.cellClue = {
                selector: pzlSelector+' > .cell.clue',
                rules: [
                    'color: ' + styles.clueColor
                ]
            };
            cssStyles.cellSubRowLast = {
                selector: pzlSelector+' > .cell.subrow-last:not(.row-last)',
                rules: [
                    'border-bottom-color: ' + styles.outerBorderColor,
                    'border-bottom-width: ' + styles.outerBorderThickness + 'px',
                    'border-bottom-style: solid'
                ]
            };
            cssStyles.cellSubColLast = {
                selector: pzlSelector+' > .cell.subcolumn-last:not(.column-last)',
                rules: [
                    'border-right-color: ' + styles.outerBorderColor,
                    'border-right-width: ' + styles.outerBorderThickness + 'px',
                    'border-right-style: solid'
                ]
            };
            return cssStyles;
        },
        
        updateStyles: function( andTrigger ) {
            var self = this, cssStyles = self.cssStyles, styles = self.styles;
            self.$superv("updateStyles", [false]);
            cssStyles.cellClue.css.style.color = styles.clueColor;
            cssStyles.stickyNotes.css.style.color = styles.symbolColor;
            cssStyles.cellSubRowLast.css.style.borderBottomColor = styles.outerBorderColor;
            cssStyles.cellSubRowLast.css.style.borderBottomWidth = styles.outerBorderThickness + 'px';
            cssStyles.cellSubColLast.css.style.borderRightColor = styles.outerBorderColor;
            cssStyles.cellSubColLast.css.style.borderRightWidth = styles.outerBorderThickness + 'px';
            if ( false !== andTrigger ) self.trigger( 'update-styles' );
            return self;
        },
        
        updateDimensions: function( andTrigger ) {
            var self = this;
            self.$superv("updateDimensions", [false]);
            if ( false !== andTrigger ) self.trigger( 'update-dimensions' );
            return self;
        },
        
        enableNotes: function( bool ) {
            var self = this, g = self.grid;
            if ( self.userMode )
            {
                if ( bool ) 
                {
                    if ( !g.hasClass('notes') ) 
                    {
                        self.enableAllNotes( false );
                        g.addClass('notes');
                    }
                }
                else
                {
                    g.removeClass('notes');
                }
            }
            return self;
        },
        
        enableAllNotes: function( bool ) {
            var self = this, g = self.grid;
            if ( self.userMode )
            {
                if ( bool ) 
                {
                    if ( !g.hasClass('all-notes') ) 
                    {
                        self.enableNotes( false );
                        g.addClass('all-notes');
                    }
                }
                else
                {
                    g.removeClass('all-notes');
                }
            }
            return self;
        },
        
        clearNotes: function( ) {
            this.cells.removeClass('with-notes').find('.sticky-note.noted').removeClass('noted');
            return this;
        },
        
        handleInput: function( evt, input, prevval ) {
            var self = this, AB = self.alphabet, 
                val = input.value.toUpperCase( ), $input = $(input),
                rows = self.dimensions.rows,
                columns = self.dimensions.columns
            ;
            if ( val.length && 0 > AB.indexOf( val ) ) val = "";
            if ( self.toggleErrorsHighlight )
            {
                if ( input.solution && val.length && val !== input.solution )
                {
                    if ( !$input.hasClass( ERRORCLASS ) )
                        $input.addClass( ERRORCLASS );
                }
                else
                {
                    $input.removeClass( ERRORCLASS );
                }
            }
            input.value = val;
            if ( val !== prevval ) self.trigger( 'input', {input: input} );
        },
        
        buildGrid: function( dims ) {
            var self = this, r, c, grid, row, cell, styles, cssStyles,
                rows, columns, cellSize, subrows, subcolumns, 
                modr, modc, sj, sic, sicinc
            ;
            
            dims = dims || {};
            
            if ( !self.dimensions ) self.dimensions = self.getDefaultDimensions( );
            if ( !self.styles ) self.styles = self.getDefaultStyles( );
            self.userMode = false;
            
            if ( dims.rows ) self.dimensions.rows = dims.rows;
            if ( dims.columns ) self.dimensions.columns = dims.columns;
            if ( dims.subRows ) self.dimensions.subRows = dims.subRows;
            if ( dims.subColumns ) self.dimensions.subColumns = dims.subColumns;
            if ( dims.cellSize ) self.dimensions.cellSize = dims.cellSize;
            rows = self.dimensions.rows;
            columns = self.dimensions.columns;
            subrows = self.dimensions.subRows;
            subcolumns = self.dimensions.subColumns;
            cellSize = self.dimensions.cellSize;
            styles = self.styles;
            cssStyles = self.cssStyles;
            
            cssStyles.grid.css.style.width = (cellSize*columns) + 'px';
            cssStyles.grid.css.style.height = (cellSize*rows) + 'px';
            cssStyles.grid.css.style.borderColor = styles.outerBorderColor;
            cssStyles.grid.css.style.borderWidth = styles.outerBorderThickness + 'px';
            cssStyles.cell.css.style.backgroundColor = styles.cellColor;
            cssStyles.cell.css.style.borderColor = styles.borderColor;
            cssStyles.cell.css.style.borderStyle = styles.borderStyle;
            cssStyles.cell.css.style.width = cellSize+'px';
            cssStyles.cell.css.style.height = cellSize+'px';
            cssStyles.cell.css.style.fontSize = round( 0.6*cellSize )+'px';
            cssStyles.cell.css.style.color = styles.symbolColor;
            cssStyles.cellClue.css.style.color = styles.clueColor;
            cssStyles.stickyNotes.css.style.color = styles.symbolColor;
            cssStyles.highlighted.css.style.backgroundColor = styles.highlightColor;
            cssStyles.cellSubRowLast.css.style.borderBottomColor = styles.outerBorderColor;
            cssStyles.cellSubRowLast.css.style.borderBottomWidth = styles.outerBorderThickness + 'px';
            cssStyles.cellSubColLast.css.style.borderRightColor = styles.outerBorderColor;
            cssStyles.cellSubColLast.css.style.borderRightWidth = styles.outerBorderThickness + 'px';
            
            grid = Element( 'div' + '#' + self.id + '.' + self.getGridClasses( ).join( '.' ) );
            grid.setAttribute('id', self.id);
            
            sic = 0; sicinc = /*~~(columns/subcolumns)*/subrows;
            for (r=0; r<rows; r++)
            {
                modr = r % subrows;
                sj = 0;
                for (c=0; c<columns; c++)
                {
                    modc = c % subcolumns;
                    cell = self.buildCell( subrows, subcolumns, r, c, sic+sj, cellSize, [
                        'cell default', 
                        'row-' + r + (0==r ? ' row-first' : (rows-1==r ? ' row-last' : '')) + (0==modr ? ' subrow-first' : (subrows-1==modr ? ' subrow-last' : '')),
                        'column-' + c  + (0==c ? ' column-first' : (columns-1==c ? ' column-last' : ''))  + (0==modc ? ' subcolumn-first' : (subcolumns-1==modc ? ' subcolumn-last' : '')),
                        'square-' + (sic+sj)
                    ].join(' '));
                    
                    grid.appendChild( cell );
                    if (subcolumns-1 == modc)  sj++;
                }
                if (subrows-1 == modr) sic+=sicinc;
            }
            
            self.grid = $( grid );
            self.cells = self.grid.children( '.cell' );
            self.setDichromia( self.dichromia );
            
            // resizable grid
            self.setResizable( true, true );
                
            return self;
        },
        
        buildCell: function( subrows, subcolumns, row, col, squ, size, className ) {
            var cell = Element( 'div' ), input = Element( 'input' ),
                notes = Element( 'div.notes' ), stickynotes = Element( 'div.sticky-notes' ), 
                i, j, k, noterow, stickynoterow, note, stickynote,
                max_subcolumns = max(subcolumns, subrows),  min_subrows = min(subcolumns, subrows),
                nw = round( 100/max_subcolumns ), nfs = round( 2*nw )
            ;
            
            k = 0;
            for (i=0; i<min_subrows; i++)
            {
                noterow = Element( 'div.note-row' );
                stickynoterow = Element( 'div.note-row' );
                for (j=0; j<max_subcolumns; j++)
                {
                    note = Element( 'a.note' );
                    stickynote = Element( 'a.sticky-note' );
                    note.href = '#';
                    note.title = ' ';
                    note.style.fontSize = nfs + '%';
                    note.style.paddingBottom = note.style.width = nw + '%';
                    stickynote.href = '#';
                    stickynote.title = ' ';
                    stickynote.style.fontSize = nfs + '%';
                    stickynote.style.paddingBottom = stickynote.style.width = nw + '%';
                    noterow.appendChild( note );
                    stickynoterow.appendChild( stickynote );
                }
                notes.appendChild( noterow );
                stickynotes.appendChild( stickynoterow );
            }
            
            cell.cellType = CLUE;
            cell.highlightType = 0;
            cell.row = row;
            cell.column = col;
            cell.square = squ;
            cell.clue = true;
            cell.style.top = (row*size)+'px';
            cell.style.left = (col*size)+'px';
            
            input.solution = null;
            input.highlightType = 0;
            input.readOnly = false;
            input.setAttribute( "type", "text" );
            input.setAttribute( "value", "" );
            input.setAttribute( "maxlength", "1" );
            
            cell.appendChild( input );
            cell.appendChild( stickynotes );
            cell.appendChild( notes );
            
            if ( className ) cell.className = ''+className;
            return cell;
        },
        
        onBuildComplete: function( ) {
            var self = this, grid = self.grid;
            
            if ( $.fn.contextMenu )
            {
                // contextmenus(s) for separator cells
                grid.contextMenu({
                    
                    selector: '.cell', 
                    
                    items: {
                        "make-clue": {name: locale("MAKE_CLUE"), icon: "add-definition"},
                        "unmake-clue": {name: locale("UNMAKE_CLUE"), icon: "clear"}
                    },

                    callback: function(key, options) {
                        self.decorateCell( $(this), key );
                    }
                });
            }
            
            grid.on('keydown click focus', '.cell:not(.clue) > input', function( evt ){
                var input = evt.target, cell = $(input).closest( '.cell' ), 
                    code, prevcell, cells = self.cells, prevval;
                if ( CELL === cell[0].cellType )
                {
                    prevcell = self.currentInputCell;
                    self.currentInputCell = cell;
                    
                    if ( 'keydown' === evt.type )
                    {
                        code = evt.which;
                        // http://stackoverflow.com/a/5829387/3591273
                        //ch = String.fromCharCode((96 <= code && code <= 105)? code-48 : code).toUpperCase( );
                        
                        if ( ESC_KEY === code )
                        {
                            setTimeout(function( ) {
                                cells.removeClass('current');
                            }, 100);
                            
                            evt.preventDefault( );
                            evt.stopPropagation( );
                
                            return false;
                        }
                        
                        else if ( KEY_UP === code || KEY_DOWN === code || KEY_LEFT === code || KEY_RIGHT === code )
                        {
                            cells.removeClass('current');
                            
                            // grid navigation with keyboard
                            setTimeout(function( ) {
                                self.handleKeyNav( evt, cell );
                            }, 100);
                            
                            evt.preventDefault( );
                            evt.stopPropagation( );
                
                            return false;
                        }
                        
                        else
                        {
                            cells.removeClass('current');
                            
                            // digits input
                            prevval = input.value;
                            setTimeout(function( ) {
                                self.handleInput( evt, input, prevval );
                                if ( input.value.length ) cell.addClass('no-notes');
                                else cell.removeClass('no-notes');
                            }, 100);
                        }
                    }
                    else
                    {
                        if ( prevcell ) prevcell.removeClass( 'current' );
                    }
                }
            });
            
            grid.on('click', '.cell:not(.clue)', function( evt ){
                var cell = $(evt.target), prevcell;
                
                if ( CELL === cell[0].cellType )
                {
                    prevcell = self.currentInputCell;
                    self.currentInputCell = cell;
                    
                    if ( prevcell ) prevcell.removeClass( 'current' );
                    cell.addClass( 'current' );
                }
                evt.preventDefault( );
                evt.stopPropagation( );
    
                return false;
            });
            
            grid.on('click', '.cell:not(.clue) > .notes', function( evt ){
                $(evt.target).closest('.cell').removeClass( 'current' );
                evt.preventDefault( );
                evt.stopPropagation( );
                return false;
            });
            
            grid.on('click', '.cell:not(.clue) .note', function( evt ){
                var $note = $(evt.target), $cell = $note.closest('.cell'), 
                    input = $cell[0].firstChild, $input = $(input);
                
                $cell.removeClass('current');
                if ( !$note.hasClass('note-disabled') ) 
                {
                    if ( grid.hasClass('notes') )
                    {
                        if ( $cell.hasClass('no-notes') ) $cell.removeClass('no-notes');
                        var stickynote = $cell.find('.sticky-note[title="'+$note.attr('title')+'"]');
                        if ( stickynote.hasClass('noted') ) 
                        {
                            stickynote.removeClass('noted');
                            //if ( !$cell.find('.sticky-note.noted').length )
                        }
                        else 
                        {
                            stickynote.addClass('noted');
                            //$cell.addClass('with-notes');
                        }
                        $input.removeClass(ERRORCLASS).val('');
                        self.trigger( 'input', {input: input} );
                    }
                    else
                    {
                        input.value = $note.attr('title');
                        $cell.addClass('no-notes');
                        if ( self.toggleErrorsHighlight )
                        {
                            if ( input.value !== input.solution )
                            {
                                if ( !$input.hasClass( ERRORCLASS ) )
                                    $input.addClass( ERRORCLASS );
                            }
                            else
                            {
                                $input.removeClass( ERRORCLASS );
                            }
                        }
                        self.trigger( 'input', {input: input} );
                    }
                }
                evt.preventDefault( );
                evt.stopPropagation( );
                return false;
            });
            
            
            return self;
        },
        
        clearCells: function( useCached ) {
            var self = this;
            self.$superv('clearCells', [useCached]);
            self.cells.filter( is_not_clue ).removeClass('no-notes');
            return self;
        },
        
        revealSolution: function( ) {
            var self = this;
            self.$superv('revealSolution');
            self.cells.filter( is_not_clue ).addClass('no-notes');
            return self;
        },
        
        revealCell: function( cell ) {
            var self = this;
            cell = cell || self.currentInputCell || null;
            if ( cell && cell.length )
            {
                self.$superv('revealCell', [cell]);
                cell.addClass('no-notes');
            }
            return self;
        },
        
        decorateCell: function( $cell, key ) {
            var self = this, gridcell = $cell[0], digit = gridcell.firstChild;
            if ( 'make-clue' === key )
            {
                gridcell.clue = true;
                gridcell.cellType = CLUE;
                digit.readOnly = true;
                digit.value = digit.solution || '';
                digit.setAttribute("value", digit.solution || '');
                if ( !$cell.hasClass('clue') ) $cell.addClass( 'clue' );
            }
            else if ( 'unmake-clue' === key )
            {
                gridcell.clue = false;
                gridcell.cellType = CELL;
                digit.readOnly = false;
                digit.value = digit.solution || '';
                digit.setAttribute("value", digit.solution || '');
                $cell.removeClass( 'clue' );
            }
        },
        
        setAlphabet: function( alphabet ) {
            var self = this;
            if ( alphabet && alphabet.length >= self.dimensions.rows )
            {
                self.alphabet = alphabet.slice( 0, self.dimensions.rows );
            }
            else
            {
                self.alphabet = null;
            }
            return self;
        },
        
        setDichromia: function( bool ) {
            var self = this, g = self.grid;
            self.dichromia = bool = !!bool;
            if ( bool && !g.hasClass('dichromia') ) g.addClass('dichromia');
            else if ( !bool ) g.removeClass('dichromia');
            return self;
        },
        
        getRawGrid: function( ) {
            var self = this, i, l, cell, digit,
                r = self.dimensions.rows, c = self.dimensions.columns,
                l = r*c, grid
            ;
            
            grid = {
                 alphabet: self.alphabet ? self.alphabet.slice() : null
                ,difficulty: self.difficulty || 1
                ,cells: new Array( l )
                ,values: new Array( l )
                /*,row: null
                ,col: null
                ,squ: null*/
                ,rows: parseInt(r, 10)
                ,cols: parseInt(c, 10)
                ,subrows: parseInt(self.dimensions.subRows, 10)
                ,subcols: parseInt(self.dimensions.subColumns, 10)
            };
            self.cells.each(function( i ) {
                var cell = this
                grid.values[ i ] = cell.firstChild.solution || '';
                grid.cells[ i ] = {
                    index: i,
                    row: cell.row, col: cell.column, squ: cell.square,
                    clue: !!cell.clue
                };
            });
            return grid;
        },
        
        setRawGrid: function( grid ) {
            if ( !grid ) return this;
            var self = this, i, l, cell, digit, gridcell, $gridcell,
                r = self.dimensions.rows, c = self.dimensions.columns,
                l = r*c, cells, val, v, $cells = self.cells
            ;
            
            // fix prev grid format
            if ( !grid[HAS]('cells') )
            {
                grid.cells = grid.values; //delete grid.values;
                grid.values = grid.cells.map( get_value );
            }
            if ( grid[HAS]('subRows') )
            {
                grid.cols = grid.columns; delete grid.columns;
                grid.subrows = grid.subRows; delete grid.subRows;
                grid.subcols = grid.subColumns; delete grid.subColumns;
            }
            
            cells = grid.cells;
            if ( l === cells.length )
            {
                val = grid.values;
                self.difficulty = grid.difficulty || 1;
                if ( grid[HAS]('alphabet') )
                    self.alphabet = grid.alphabet.join ? grid.alphabet.join('') : (''+grid.alphabet);
                else if ( !self.alphabet ) 
                    self.alphabet = getRange(c,{start:1}).join('');
                
                // set on grid
                for (i=0; i<l; i++)
                {
                    cell = cells[ i ]; v = val[cell.index]; 
                    if ( "string" !== typeof v ) v = self.alphabet.charAt( v );
                    $gridcell = $cells.eq( i ); gridcell = $gridcell[ 0 ]; digit = gridcell.firstChild;
                    digit.solution = v;
                    gridcell.row = cell.row;
                    gridcell.column = cell.col;
                    gridcell.square = cell.squ;
                    gridcell.clue = !!cell.clue;
                    if ( gridcell.clue ) 
                    {
                        gridcell.cellType = CLUE;
                        digit.readOnly = true;
                        digit.value = v;
                        digit.setAttribute("value", v);
                        $gridcell.addClass( 'clue' );
                    }
                    else
                    {
                        gridcell.cellType = CELL;
                        digit.readOnly = false;
                        /*if ( !USERMODE ) digit.value = v;
                        else*/ digit.value = '';
                        $gridcell.removeClass( 'clue' );
                    }
                    $gridcell.find('.sticky-note').each(function( i ) {
                        this.title = self.alphabet.charAt( i );
                    });
                    $gridcell.find('.note').each(function( i ) {
                        this.title = self.alphabet.charAt( i );
                    });
                }
            }
            update_notes( self );
            return self;
        },
        
        importTpl: function( jsonTpl ) {
            var self = this;
            if ( jsonTpl && jsonTpl[HAS]("dimensions") )
            {
                self.dichromia = !!jsonTpl.dichromia;
                self.$superv('importTpl', [jsonTpl]);
            }
            return self;
        },
        
        exportTpl: function( ) {
            var self = this, 
                tpl = self.$superv('exportTpl');
            if ( tpl ) tpl["dichromia"] = !!self.dichromia;
            return tpl;
        }
    });
    
}(Sudoku);/**
*
* Sudoku.Compiler Base Class
* Finds solutions for a given crossword/puzzle Grid
*
**/
!function(Sudoku, undef){
    "use strict";
    
    //
    // Sudoku Compiler Base Class, implements/extends Asynchronous and PublishSubscribe
    var Compiler = Sudoku.Compiler = Sudoku.Class({
        extends: Sudoku.Asynchronous, implements: Sudoku.PublishSubscribe
        }, {
        __static__: {
            
            STATUS: {
                INIT: 0,
                RUNNING: 1,
                NOT_FOUND: 4,
                FOUND: 16
            },
            
            MODE: {
                AUTO: 0,
                NONE: 1,
                LINEAR: 2,
                EXPONENTIAL: 3
            }
        },
        
        constructor: function( component ) {
            var self = this;
            self.$superv( 'constructor', [100] );
            self.initPubSub( );
            self.component = component || 'Sudoku.Compiler';
            self.cutoff_mode = Compiler.MODE.AUTO;
            self.status = Compiler.STATUS.INIT;
            self.grid = null;
        },
        
        component: null,
        grid: null,
        status: null,
        liveUpdate: false,
        multiPass: true,
        timeLimit: 0,
        cutoff_mode: null,
        
        NUM_ALTERNATIVES: 5,
        MIN_ALTERNATIVES: 2,
        _NUM_ALTERNATIVES: 5,
        
        dispose: function( ) {
            var self = this;
            self.$superv( 'dispose' );
            self.disposePubSub( );
            self.component = null;
            self.grid = null;
            self.status = null;
            self.liveUpdate = null;
            self.multiPass = null;
            self.timeLimit = null;
            self.cutoff_mode = null;
            return self;
        },

        fork: function( ) {
            var self = this;
            self.unfork( true ).$superv( 'fork', [self.component, Sudoku.Path.file] );
            return self;
        },
        
        stop: function( explicit ) {
            var self = this, delay = 500;
            if ( self.$thread ) 
            {
                self.send( 'stop' );
                if ( true === explicit ) setTimeout(function(){self.unfork(true);}, delay); 
            }
            if ( self.$queue.length ) self.empty( );
            return self;
        },
        
        setGrid: function( grid ) {
            if ( grid ) this.grid = grid;
            return this;
        },
        
        // @override
        setSolution: function( ) {
            return this;
        },
        
        // @override
        clearSolution: function( ) {
            return this;
        },
        
        // @override
        compile: function( ) {
            return this;
        }
    });
    Compiler.RUN_MODE = Sudoku.Asynchronous.MODE;

}(Sudoku);/**
*
* Sudoku.SudokuCompiler Class
* Finds solutions for a given sudoku
*
**/
!function(Sudoku, undef){
    "use strict";
    
    var isWorker = Sudoku.isWorker,
        round = Math.round, min = Math.min, ceil = Math.ceil,
        shuffle = Sudoku.shuffle, shuffle_extended = Sudoku.shufflex, 
        clamp = Sudoku.clamp, array = Sudoku.array, range = Sudoku.range, 
        random = Math.random, rand = Sudoku.randi, randItem = Sudoku.randomItem, 
        Compiler = Sudoku.Compiler, 
        
        HAS = 'hasOwnProperty', PUT_FIRST = 'unshift', PUT_LAST = 'push',
        NONE = 0, UP = 1, DOWN = 2, LEFT = 4, RIGHT = 8,
        VERTICAL = UP | DOWN, HORIZONTAL = LEFT | RIGHT, 
        FORWARD = 1, REVERSE = -1, 
        SHIFT = 32, BLOCK = 64, GENERATE = 256, PERMUTE = 512, RANDOMIZE = 1024,
        
        // http://graphics.stanford.edu/~seander/bithacks.html#IntegerLogLookup
        // compute binary bitwise logarithm, using BINLOG lookup table + binary-search (a variation of dynamic programming)
        ArrayUint8 = 'undefined' !== typeof Uint8Array ? Uint8Array : Array,
        BINLOG_256 = new ArrayUint8([0, 0, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7]),
        
        is_clue = function( cell ) { return cell.clue; },
        is_empty = function( cell ) { return !cell.clue; },
        
        filter_and_map_clue = function(filtered, cell) {
            if ( cell.clue && (filtered.val[cell.index] === filtered.v) ) filtered.matches++;
            return filtered;
        },
        
        square = function( a, shuffled ) {
            var squ = a.slice(0);
            if ( true === shuffled ) squ = shuffle( squ );
            return squ;
        },
        
        array2d = function(a1d, rows, cols) {
            var a2d = array(rows), r, c;
            c = 0;
            for(r=0; r<rows; r++)
            {
                a2d[r] = a1d.slice(c,c+cols);
                c += cols;
            }
            return a2d;
        },
        
        array1d = function(a2d/*, rows, cols*/) {
            var a1d = [], r;
            for(r=0; r<a2d.length; r++)
            {
                a1d = a1d.concat( a2d[r] );
            }
            return a1d;
        },
        
        // various sudoku symmetry operations
        // in order to try generate ALL possible and valid sudoku configurations
        //
        shift = function( a2d, rows, cols, dir ) {
            var shifted = a2d, l = a2d.length, 
                i, line, tmp, d, direction;
            dir = dir || [];
            for (d=0; d<dir.length; d++)
            {
                direction = dir[ d ];
                
                if ( direction & LEFT ) // horizontal shift left
                {
                    tmp = shifted.slice(0);
                    for (i=0; i<l; i++)
                    {
                        if ( 0 === (i+1) % cols ) 
                        {
                            if (i+1-cols >= 0) shifted[i] = tmp[i+1-cols];
                        }
                        else if (i+1 < l) 
                        {
                            shifted[i] = tmp[i+1];
                        }
                    }
                }
                else if ( direction & RIGHT ) // horizontal shift right
                {
                    tmp = shifted.slice(0);
                    for (i=0; i<l; i++)
                    {
                        if ( 0 === (i+1) % cols ) 
                        {
                            if (i+1-cols >= 0) shifted[i+1-cols] = tmp[i];
                        }
                        else if (i+1 < l) 
                        {
                            shifted[i+1] = tmp[i];
                        }
                    }
                }
                else if ( direction & UP ) // vertical shift up
                {
                    shifted = [].concat(
                        shifted.slice(cols), 
                        shifted.slice(0, cols)
                    );
                }
                else if ( direction & DOWN ) // vertical shift down
                {
                    shifted = [].concat(
                        shifted.slice(-cols), 
                        shifted.slice(0, -cols)
                    );
                }
            }
            return shifted;
        },
        
        transpose = function( a2d, rows, cols, dir ) {
            if ( REVERSE !== dir && FORWARD !== dir ) return a2d;
            var r, c, rc, rct, i, l = a2d.length, transposed = array(l), is_reverse = REVERSE === dir;
            c=0; r=0; rc=0; rct=0;
            for (i=0; i<l; i++)
            {
                if ( c>=cols ) {c=0; r++; rc+=cols; rct=0;}
                transposed[rct+r] = a2d[is_reverse?(rc+cols-1-c):(rc+c)];
                c++; rct+=cols; 
            }
            return transposed;
        },
        
        mirror = function( a2d, rows, cols, dir ) {
            if ( !(VERTICAL & dir) && !(HORIZONTAL & dir) ) return a2d;
            var r, c, rc, i, l = a2d.length, mirrored = array(l), is_horizontal = !!(HORIZONTAL & dir);
            r=0; rc=0; c=0;
            for (i=0; i<l; i++)
            {
                if ( c>=cols ) {c=0; r++; rc+=cols;}
                mirrored[is_horizontal?(rc + cols-1-c):(l-cols-rc + c)] = a2d[rc + c];
                c++;
            }
            return mirrored;
        },
        
        permute = function( a, p ) {
            var i, l = a.length, permuted = array(l);
            for (i=0; i<l; i++) permuted[i] = a[p[i]];
            return permuted;
        },
        
        swap = function( a2d, rows, cols, r1, c1, r2, c2 ) {
            var tmp, i, cr1, cr2, cr = a2d.length;
            if ( r1 !== r2 )
            {
                cr1 = cols*r1; cr2 = cols*r2;
                for (i=0; i<cols; i++)
                {
                    tmp = a2d[cr1 + i];
                    a2d[cr1 + i] = a2d[cr2 + i];
                    a2d[cr2 + i] = tmp;
                }
            }
            if ( c1 !== c2 )
            {
                for (i=0; i<cr; i+=cols)
                {
                    tmp = a2d[i + c1];
                    a2d[i + c1] = a2d[i + c2];
                    a2d[i + c2] = tmp;
                }
            }
            return a2d;
        },
    
        reassign = function( a, p ) {
            var i, l = a.length, reassigned = array(l);
            for (i=0; i<l; i++) reassigned[i] = p[a[i]];
            return reassigned;
        },
        
        generate_shuffle2d = function( rows, cols, type, options ) {
            var permutations, i1, i2, i3, i4, shuffle_options, i, dice, tmp, 
                randomized = !!(type&RANDOMIZE), shuffler;
            
            if ( type & BLOCK )
            {
                permutations = shuffle( range( type & VERTICAL ? rows : cols ) );
            }
            else
            {
                if ( options )
                {
                    i1 = options.length > 0 ? options[0] : 0;
                    i2 = options.length > 1 ? options[1] : rows;
                    i3 = options.length > 2 ? options[2] : 0;
                    i4 = options.length > 3 ? options[3] : cols;
                    if ( options.length > 4 && options[4] )
                    {
                        shuffle_options = options[4];
                        shuffler = shuffle_extended;
                    }
                    else
                    {
                        shuffle_options = null;
                        shuffler = shuffle;
                    }
                }
                else
                {
                    i1 = 0;
                    i2 = rows;
                    i3 = 0;
                    i4 = cols;
                    shuffle_options = null;
                    shuffler = shuffle;
                }
                
                if ( type & VERTICAL )
                {
                    tmp = rows; 
                    rows = cols;
                    cols = tmp;
                    tmp = i1; 
                    i1 = i3;
                    i3 = tmp;
                    tmp = i2; 
                    i2 = i4;
                    i4 = tmp;
                }
            
                permutations = array( rows );
                for (i=0; i<rows; i++)
                {
                    permutations[i] = range( cols );
                    if ( i>=i1 && i<i2 ) 
                    {
                        if ( type & SHIFT ) 
                        {
                            if ( i>i1 ) permutations[i] = permutations[i-1].slice();
                        }
                        else
                        {
                            dice = randomized ? rows*random( ) : i;
                            if ( dice >= i && dice < i+1 ) 
                                permutations[i] = [].concat(
                                    permutations[i].slice(0,i3)
                                    ,shuffler( permutations[i].slice(i3,i4), shuffle_options )
                                    ,permutations[i].slice(i4)
                                );
                        }
                    }
                }
            }
            return permutations;
        },
        
        shuffle2d = function( a2d, rows, cols, type, permutations ) {
            var shuffled, transposed = 0, i1, i2, i3, i4, shuffle_options, i, dice, tmp, 
                randomized = !!(type&RANDOMIZE);
            
            if ( type & PERMUTE )
            {
                shuffled = a2d;
                if ( type & BLOCK )
                {
                    if ( type & HORIZONTAL ) 
                    {
                        transposed = 1;
                        shuffled = transpose( shuffled, rows, cols, FORWARD );
                        tmp = rows; 
                        rows = cols;
                        cols = tmp;
                    }
                    shuffled = array1d( permute( array2d( shuffled, rows, cols ), permutations ) );
                }
                else
                {
                    if ( type & VERTICAL ) 
                    {
                        transposed = 1;
                        shuffled = transpose( shuffled, rows, cols, FORWARD );
                        tmp = rows; 
                        rows = cols;
                        cols = tmp;
                    }
                    i1 = 0;
                    for (i=0; i<rows; i++)
                    {
                        i2 = i1+cols;
                        shuffled = [].concat(
                            shuffled.slice(0,i1)
                            ,permute( shuffled.slice(i1,i2), permutations[i] )
                            ,shuffled.slice(i2)
                        );
                        i1+=cols;
                    }
                }
                if ( transposed ) shuffled = transpose( shuffled, rows, cols, FORWARD );
            }
            else
            {
                shuffled = a2d;
                if ( type & VERTICAL ) 
                {
                    transposed = 1;
                    shuffled = transpose( shuffled, rows, cols, FORWARD );
                    tmp = rows; 
                    rows = cols;
                    cols = tmp;
                }
                i1 = 0;
                permutations = array(rows);
                for (i=0; i<rows; i++)
                {
                    permutations[i] = range( cols );
                    dice = randomized ? rows*random( ) : i;
                    if ( dice >= i && dice < i+1 ) 
                    {
                        permutations[i] = shuffle( permutations[i] );
                        i2 = i1+cols;
                        shuffled = [].concat(
                            shuffled.slice(0,i1)
                            ,permute( shuffled.slice(i1,i2), permutations[i] )
                            ,shuffled.slice(i2)
                        );
                    }
                    i1+=cols;
                }
                if ( transposed ) shuffled = transpose( shuffled, rows, cols, FORWARD );
            }
            return shuffled;
        },
        
        /*duplicates = function(grid) {
            var i, j, cells = grid.cells, val = grid.values, lc = cells.length,
                rows = grid.row, cols = grid.col, squares = grid.squ,
                cell, row, col, squ, r, c, s, rl = rows.length
            ;
            for (i=0; i<lc; i++)
            {
                cell = cells[ i ];
                row = rows[ cell.row ];
                col = cols[ cell.col ];
                squ = squares[ cell.squ ];
                for (j=0; j<rl; j++)
                {
                    r = row[j]; c = col[j]; s = squ[j];
                    if ( (r.index !== cell.index && val[r.index] === val[cell.index]) || // same row
                        (c.index !== cell.index && val[c.index] === val[cell.index]) || // same column
                        (s.index !== cell.index && val[s.index] === val[cell.index]) // same square
                    )
                    {
                        console.log('duplicates at: ' + ['square='+cell.squ, 'row='+cell.row, 'col='+cell.col].join(' | '));
                        return true;
                    }
                }
            }
            return false;
        },*/
        
        sudoku_grid = function( grid, unique ) {
            var r = grid.rows, c = grid.cols, l = r*c,
                sr = grid.subrows, sc = grid.subcols, 
                nsr = sc, nsc = sr, grid_squs, grid_rows, grid_cols,
                i, j, si, sj, sii, sjj, ii, k, index, cell,
                cells, values, basic_square, permutations, shuffle_range,
                shift_vert = [UP], shift_hor = [LEFT],
                randomized = false !== unique
            ;
            
            if ( randomized )
            {
                shift_vert = [randItem([UP,DOWN])];
                shift_hor = [randItem([LEFT,RIGHT])];
            }
            grid.alphabet_map = range( c );
            grid.cells = cells = array(l); grid.values = values = array(l);
            grid.squ = grid_squs = array(c); grid.row = grid_rows = array(c); grid.col = grid_cols = array(c);
            basic_square = array( nsc ); basic_square[ 0 ] = square( grid.alphabet_map );
            for (k=1; k<nsc; k++)
            {
                // shift the next sub-square random vertical shift
                basic_square[k] = shift(basic_square[k-1].slice(), sr, sc, shift_vert);
                // sub-shuffle the square in the other direction
                // in order to generate ALL possible sudoku configurations
                if ( randomized ) 
                    basic_square[k] = shuffle2d(basic_square[k], sr, sc, RANDOMIZE|HORIZONTAL);
            }
            
            for (si=0,sii=0; si<nsr; si++,sii+=sr)
            {
                for (sj=0,sjj=0; sj<nsc; sj++,sjj+=sc)
                {
                    ii = 0;
                    for (i=0; i<sr; i++)
                    {
                        for (j=0; j<sc; j++)
                        {
                            index = (sii+i)*c + sjj+j;
                            cells[ index ] = cell = {
                                index: index, squ: sii+sj, 
                                row: sii+i, col: sjj+j, 
                                squ_row: i, squ_col: j, 
                                row_index: sjj+j, col_index: sii+i, squ_index: ii,
                                clue: true, almost_clue: false,
                                alternatives: null
                            };
                            values[ index ] = basic_square[sj][ii];
                            if ( !grid_cols[cell.col] ) grid_cols[cell.col] = array(c); 
                            if ( !grid_rows[cell.row] ) grid_rows[cell.row] = array(c); 
                            if ( !grid_squs[cell.squ] ) grid_squs[cell.squ] = array(c);
                            grid_cols[cell.col][cell.col_index] = grid_rows[cell.row][cell.row_index] = grid_squs[cell.squ][ii] = cell;
                            ii++;
                        }
                    }
                }
                
                // shift the next row of sub-squares random horizontal shift
                basic_square[0] = shift(basic_square[0], sr, sc, shift_hor);
                // sub-shuffle the square in the other direction
                // in order to generate ALL possible sudoku configurations
                if ( randomized ) 
                {
                    permutations = generate_shuffle2d(sr, sc, RANDOMIZE|BLOCK|VERTICAL);
                    basic_square[0] = shuffle2d(basic_square[0], sr, sc, PERMUTE|BLOCK|VERTICAL, permutations);
                }
                for (k=1; k<nsc; k++)
                {
                    basic_square[k] = shift(basic_square[k], sr, sc, shift_hor);
                    if ( randomized ) basic_square[k] = shuffle2d(basic_square[k], sr, sc, PERMUTE|BLOCK|VERTICAL, permutations);
                }
            }
            //if ( duplicates(grid) ) console.log('duplicates after <generation>');
            
            // apply some more sudoku symmetries uniformly random to whole grid this time
            // to try generate ALL valid configurations with probability (i.e a unique grid)
            if ( randomized )
            {
                // random alphabet permutation
                grid.values = reassign( grid.values, shuffle( grid.alphabet_map, true ) );
                //if ( duplicates(grid) ) console.log('duplicates after <reassign>');
                
                // random (sub-)row/(sub-)column swaps
                for (i=0; i<r; i+=sr)
                {
                    for (j=0; j<c; j+=sc)
                    {
                        for (si=0; si<sr; si++)
                        {
                            for (sj=0; sj<sc; sj++)
                            {
                                swap( grid.values, r, c, 
                                    // generalization of Fisher-Yates-Knuth unbiased permutation
                                    i + si, j + sj, 
                                    i + rand(0, si), j + rand(0, sj) 
                                );
                            }
                        }
                    }
                }
                //if ( duplicates(grid) ) console.log('duplicates after <swap>');
                
                // random mirroring
                grid.values = mirror( grid.values, r, c, randItem([HORIZONTAL, NONE, VERTICAL]) );
                //if ( duplicates(grid) ) console.log('duplicates after <mirror>');
                
                // random transposition
                if ( (r === c) && (sr === sc) ) 
                {
                    grid.values = transpose( grid.values, r, c, randItem([REVERSE, NONE, FORWARD]) );
                    //if ( duplicates(grid) ) console.log('duplicates after <transpose>');
                }
            }
            
            return grid;
        },
        
        sudoku_stats = function( grid, difficulty, numLevels ) {
            //var min9x9Clues = 17;
            difficulty = clamp(difficulty, 1, numLevels) - 1; numLevels -= 1;
            var numElements = grid.cells.length, sudokuDim = grid.rows,
                diff2 = difficulty === numLevels ? difficulty-1 : difficulty,
                ratio = (numLevels - difficulty) / numLevels, 
                change = 0.35*sudokuDim, 
                t = 1-(numLevels-diff2) / numLevels,
                numClues = round( numElements * (/*(0.55-0.27)*/0.28*ratio + 0.27) ),
                numAlternatives = round(change*t*t*t + 0.4)
            ;
            return {
            num_clues_initial:  numElements,
            num_clues_final:    numClues,
            num_alternatives:   numAlternatives,
            min_alternatives:   numAlternatives,
            max_alternatives:   numAlternatives+2,
            avg_alternatives:   0,
            num_singles:        0,
            singles_ratio:      0,
            no_alternatives:    0
            };
        },
        
        compute_num_solutions = function( grid, empty, breakFast ) {
            var cells = grid.cells, val = grid.values, 
                rows = grid.row, cols = grid.col, squares = grid.squ,
                row, col, squ, r, c, s, i, j, r_v, c_v, s_v,
                entry, cell, cell_index, cell_val, 
                alt, alternatives, stack, sl,
                rl = rows.length, lc = cells.length, le = empty.length,
                numSolutions = 0, numConsistentSolutions = 0,
                cells_to_check = empty, lcc = le
            ;
            breakFast = false !== breakFast;
            // pre-allocate stacks and do "soft" push/pop operations (faster?)
            stack = le > 0 ? new Array( le ) : []; sl = 0;
            // recursion unrolled into iterative solution walking (faster)
            do
            {
                if ( 0 < le && sl < le )
                {
                    cell = empty[ sl ]; cell_index = cell.index;
                    // inline compute_cell_alternatives
                    // use bitwise arithmetic, faster?
                    alternatives = (((1 << rl)>>>0) - 1)>>>0;
                    row = rows[cell.row]; col = cols[cell.col]; squ = squares[cell.squ];
                    for (i=0; i<rl; i++)
                    {
                        r = row[i]; c = col[i]; s = squ[i];
                        if ( r.clue && r.index !== cell_index && (alternatives & (r_v = (1<<val[r.index])>>>0)) )
                        {
                            alternatives = (alternatives & ((~r_v)>>>0))>>>0;
                            if ( 0 === alternatives ) break;
                        }
                        if ( c.clue && c.index !== cell_index && (alternatives & (c_v = (1<<val[c.index])>>>0)) )
                        {
                            alternatives = (alternatives & ((~c_v)>>>0))>>>0;
                            if ( 0 === alternatives ) break;
                        }
                        if ( s.clue && s.index !== cell_index && (alternatives & (s_v = (1<<val[s.index])>>>0)) )
                        {
                            alternatives = (alternatives & ((~s_v)>>>0))>>>0;
                            if ( 0 === alternatives ) break;
                        }
                    }
                    // end inline compute_cell_alternatives
                    
                    if ( 0 === alternatives ) 
                    { 
                        if ( !sl ) return numSolutions; 
                        else
                        {
                            while ( sl > 0 && (entry=stack[sl-1]) && (0 === entry[1]) )
                            {
                                entry[ 0 ].clue = false;
                                val[entry[ 0 ].index] = entry[ 2 ];
                                stack[ --sl ] = undef;
                            }
                            if ( sl > 0 )
                            {
                                entry[ 0 ].clue = true; 
                                alternatives = entry[ 1 ];
                                alt = 0xFFFF0000&alternatives?(0xFF000000&alternatives?24+BINLOG_256[alternatives>>>24]:16+BINLOG_256[alternatives>>>16]):(0x0000FF00&alternatives?8+BINLOG_256[alternatives>>>8]:BINLOG_256[alternatives]);
                                entry[ 1 ] = (alternatives & (~((1<<alt)>>>0)>>>0))>>>0;
                                val[entry[ 0 ].index] = alt;
                            }
                            continue;
                        }
                    }
                    // binary bitwise logarithm
                    alt = 0xFFFF0000&alternatives?(0xFF000000&alternatives?24+BINLOG_256[alternatives>>>24]:16+BINLOG_256[alternatives>>>16]):(0x0000FF00&alternatives?8+BINLOG_256[alternatives>>>8]:BINLOG_256[alternatives]);
                    //alternatives = (alternatives & (~((1<<alt)>>>0)>>>0))>>>0;
                    stack[sl++] = [cell, (alternatives & (~((1<<alt)>>>0)>>>0))>>>0, val[cell_index]];
                    cell.clue = true; val[cell_index] = alt;
                }
                else
                {
                    // no empty cells left, 0 or 1 solution if grid is sudoku consistent
                    // inline compute_num_consistent_solutions
                    numConsistentSolutions = 1;
                    for (j=0; j<lcc; j++)
                    {
                        cell = cells_to_check[ j ]; cell_index = cell.index; cell_val = val[cell_index];
                        //        same  row,            column,         square
                        row = rows[cell.row]; col = cols[cell.col]; squ = squares[cell.squ];
                        for (i=0; i<rl; i++)
                        {
                            r = row[i]; c = col[i]; s = squ[i];
                            if ( 
                                (r.index !== cell_index && val[r.index] === cell_val) ||
                                (c.index !== cell_index && val[c.index] === cell_val) ||
                                (s.index !== cell_index && val[s.index] === cell_val) 
                            )
                            {
                                numConsistentSolutions = 0;
                                j = lcc; break; // break from both loops
                            }
                        }
                    }
                    // end inline compute_num_consistent_solutions
                    numSolutions += numConsistentSolutions;
                    
                    // break fast if numSolutions > 1
                    if (breakFast && numSolutions > 1) 
                    {
                        while ( sl > 0 )
                        {
                            entry = stack[--sl];
                            entry[ 0 ].clue = false;
                            val[entry[ 0 ].index] = entry[ 2 ];
                            stack[ sl ] = undef;
                        }
                        stack = null;
                        return numSolutions;
                    }
                    
                    while ( sl > 0 && (entry=stack[sl-1]) && (0 === entry[1]) )
                    {
                        entry[ 0 ].clue = false;
                        val[entry[ 0 ].index] = entry[ 2 ];
                        stack[--sl] = undef;
                    }
                    if ( sl > 0 )
                    {
                        entry[ 0 ].clue = true; 
                        alternatives = entry[ 1 ];
                        alt = 0xFFFF0000&alternatives?(0xFF000000&alternatives?24+BINLOG_256[alternatives>>>24]:16+BINLOG_256[alternatives>>>16]):(0x0000FF00&alternatives?8+BINLOG_256[alternatives>>>8]:BINLOG_256[alternatives]);
                        entry[ 1 ] = (alternatives & (~((1<<alt)>>>0)>>>0))>>>0;
                        val[entry[ 0 ].index] = alt;
                    }
                }
            } while ( sl > 0 );
            stack = null;
            return numSolutions;
        },
        
        compute_num_alternatives = function( grid, stats, empty_cells ) {
            var rl = grid.rows, alternatives, num_alternatives, ci, a, i, j,
                rows = grid.row, cols = grid.col, squares = grid.squ,
                row, col, squ, r, c, s, r_v, c_v, s_v, val = grid.values,
                le = empty_cells.length, cell, cell_index, 
                empties, num_empties, num_matches, sum, num_singles/*, no_alternatives*/; 
            
            sum = 0; num_singles = 0; //no_alternatives = 0;
            
            // compute current alternatives per empty cell
            // taking into account all sudoku symmetries
            // i.e both direct alternatives AND indirect alternatives ("hidden" singles)
            // correlates better with sudoku difficulty raters
            
            // compute direct alternatives (and possible singles)
            for (ci=0; ci<le; ci++)
            {
                cell = empty_cells[ci]; cell_index = cell.index;
                cell.almost_clue = false;
                // use bitwise arithmetic, faster?
                alternatives = (((1 << rl)>>>0) - 1)>>>0; num_alternatives = rl;
                row = rows[cell.row]; col = cols[cell.col]; squ = squares[cell.squ];
                for (i=0; i<rl; i++)
                {
                    r = row[i]; c = col[i]; s = squ[i];
                    if ( r.clue && r.index !== cell_index && (alternatives & (r_v = (1<<val[r.index])>>>0)) )
                    {
                        alternatives = (alternatives & ((~r_v)>>>0))>>>0;
                        num_alternatives--;
                        if ( 0 === alternatives ) break;
                    }
                    if ( c.clue && c.index !== cell_index && (alternatives & (c_v = (1<<val[c.index])>>>0)) )
                    {
                        alternatives = (alternatives & ((~c_v)>>>0))>>>0;
                        num_alternatives--;
                        if ( 0 === alternatives ) break;
                    }
                    if ( s.clue && s.index !== cell_index && (alternatives & (s_v = (1<<val[s.index])>>>0)) )
                    {
                        alternatives = (alternatives & ((~s_v)>>>0))>>>0;
                        num_alternatives--;
                        if ( 0 === alternatives ) break;
                    }
                }
                cell.current_alternatives = alternatives;
                cell.current_num_alternatives = num_alternatives;
                //if ( 1 === cell.current_num_alternatives ) cell.almost_clue = true;
            }
            
            // compute indirect alternatives  (i.e "hidden" singles)
            for (ci=0; ci<le; ci++)
            {
                cell = empty_cells[ci];
                if ( cell.current_num_alternatives > 1 )
                {
                    cell_index = cell.index;
                    squ = squares[cell.squ]; empties = squ.filter(is_empty); 
                    alternatives = cell.current_alternatives;
                    while (0 !== alternatives)
                    {
                        a = 0xFFFF0000&alternatives?(0xFF000000&alternatives?24+BINLOG_256[alternatives>>>24]:16+BINLOG_256[alternatives>>>16]):(0x0000FF00&alternatives?8+BINLOG_256[alternatives>>>8]:BINLOG_256[alternatives]);
                        alternatives = (alternatives & (~((1<<a)>>>0)>>>0))>>>0;
                        num_empties = empties.length; num_matches = 0;
                        for (i=0; i<empties.length; i++)
                        {
                            s = empties[i];
                            if ( s.index === cell_index ) 
                            {
                                num_empties--;
                                continue;
                            }
                            j = {matches: 0, val: val, v: a};
                            rows[s.row].concat(cols[s.col]).reduce(filter_and_map_clue, j);
                            if ( !j.matches ) break;
                            num_matches++;
                        }
                        // this value cannot be assigned anywhere else on same sub-square
                        // thus is hidden single and num of alternatives changes
                        if ( num_matches === num_empties ) 
                        {
                            cell.current_num_alternatives = 1;
                            break;
                        }
                    }
                }
                //if ( 1 === cell.current_num_alternatives ) cell.almost_clue = true;
                sum += cell.current_num_alternatives;
                if (1===cell.current_num_alternatives) num_singles += 1;
                //else if (0===cell.current_num_alternatives) no_alternatives += 1;
            }
                
            stats.avg_alternatives = le ? sum/le : 0;
            stats.num_singles = num_singles;
            stats.singles_ratio = le ? num_singles/le : 0;
            //stats.no_alternatives = no_alternatives;    
            return empty_cells;
        },
        
        // http://stackoverflow.com/questions/10488719/generating-a-sudoku-of-a-desired-difficulty/28699821#28699821
        sudokuAsyncSinglePass = function( grid, difficulty, symmetry ) {
            var numLevels = 5, numRemovals, cells, clues, empties, 
                stats, Sym, i, cl, c, sc, rows, cols
            ;
            
            stats = sudoku_stats( sudoku_grid( grid ), difficulty, numLevels );
            cells = grid.cells; cl = cells.length; rows = grid.rows; cols = grid.cols;
            // symmetrics
            Sym = array( cl );
            for (i=0; i<cl; i++)
            {
                c = cells[i];
                Sym[ i ] = [
                    c, /* cell */
                    cells[c.row*cols + cols-1-c.col], /* horizontal */
                    cells[(rows-1-c.row)*cols + c.col], /* vertical */
                    cells[(rows-1-c.row)*cols + cols-1-c.col] /* diagonal */
                ];
            }
            symmetry = 4 === symmetry ? randItem([1, 2, 3]) : symmetry;
            clues = shuffle( cells.filter( is_clue ) );
            empties = cells.filter( is_empty );
            stats.max_avg_alternatives = -10;
            // remove some initial clues at random
            // to speed-up further process and also create more randomized configurations
            numRemovals = ceil(0.1*clues.length);
            while ( numRemovals-- > 0 ) 
            {
                c = clues.shift( ); c.clue = false;
                if ( symmetry > 0 )
                {
                    sc = Sym[ c.index ][ symmetry ];
                    if ( sc.index !== c.index && sc.clue ) 
                    {
                        sc.clue = false;
                        clues[clues.indexOf(sc)] = clues[clues.length-1]; clues.pop( ); 
                        numRemovals--
                    }
                    else
                    {
                        sc = null;
                    }
                }
            }
            empties = cells.filter( is_empty );
            //console.log([stats.num_clues_initial, stats.num_clues_final].join(' -> '));
            //console.log([stats.min_alternatives, stats.max_alternatives].join(' -> '));
            
            // a no-backtracking algorithm to find desired sudoku
            // matching given difficulty (within a range margin)
            // with high probability it returns a sudoku configuration of desired difficulty
            return function( ) {
                var numClues = clues.length, cell, symcell, k, candidates = [], empty, 
                    avg_alternatives, min_alternatives, max_alternatives, entry;
                
                if ( numClues > stats.num_clues_final )
                {
                    min_alternatives = stats.min_alternatives; 
                    max_alternatives = stats.max_alternatives;
                    
                    for (k=0; k<numClues; k++)
                    {
                        cell = clues[ k ]; cell.clue = false;
                        symcell = symmetry > 0 ? Sym[ cell.index ][ symmetry ] : null;
                        if ( symcell && (symcell.index !== cell.index) && symcell.clue ) symcell.clue = false; 
                        else symcell = null;
                        
                        // use empty list ordered by index,
                        // for some reason using the empty_cells in compute_num_solutions
                        // instead of cells.filter(is_empty) takes much more time
                        // while the actual difference is just the ordering
                        empty = cells.filter( is_empty );//merge_unique_by_key('index', empties, symcell?[cell,symcell]:[cell]);
                        
                        // current configuration has unique consistent solution
                        if ( 1 === compute_num_solutions( grid, empty, true ) )
                        {
                            compute_num_alternatives(grid, stats, empty);
                            avg_alternatives = stats.avg_alternatives;
                            entry = [avg_alternatives, k, cell, symcell];
                            
                            // maintain an average range of alternatives per empty cell
                            // correlates to current sudoku difficulty (along with minimum number of clues)
                            if ( stats.max_avg_alternatives < min_alternatives )
                            {
                                if ( avg_alternatives >= stats.max_avg_alternatives ) 
                                {
                                    stats.max_avg_alternatives = avg_alternatives;
                                    candidates[PUT_FIRST]( entry );
                                }
                                else
                                {
                                    candidates[PUT_LAST]( entry );
                                }
                            }
                            else if ( avg_alternatives <= max_alternatives )
                            {
                                if ( avg_alternatives > stats.max_avg_alternatives ) stats.max_avg_alternatives = avg_alternatives;
                                if ( candidates.length )
                                {
                                    if ( avg_alternatives >= candidates[0][0] )
                                        candidates[PUT_FIRST]( entry );
                                    else
                                        candidates[PUT_LAST]( entry );
                                }
                                else
                                {
                                    candidates[PUT_FIRST]( entry );
                                }
                            }
                            else
                            {
                                candidates[PUT_LAST]( entry );
                            }
                        }
                        //empty = null;
                        cell.clue = true;
                        if ( symcell ) symcell.clue = true;
                    }
                    
                    // no further unique solution found for given grid && difficulty
                    // return any (sub-)solution up to now
                    if ( !candidates.length ) 
                    {
                        //console.log([clues.length, stats.max_avg_alternatives].join(' | '));
                        return true;
                    }
                    else
                    {
                        k = candidates[0][1]; cell = candidates[0][2]; symcell = candidates[0][3];
                        cell.clue = false;
                        clues[k] = clues[clues.length-1]; clues.pop( );
                        if ( symcell ) 
                        {
                            symcell.clue = false;
                            clues[clues.indexOf(symcell)] = clues[clues.length-1]; clues.pop( ); 
                        }
                        numClues = clues.length;
                        empties = cells.filter( is_empty );//merge_unique_by_key('index', empties, symcell?[cell,symcell]:[cell]);
                    }
                    // continue
                    if ( numClues > stats.num_clues_final ) return false;
                }
                //console.log([clues.length, stats.max_avg_alternatives].join(' | '));
                return true;
            };
        }
    ;
        
    //
    // Sudoku Sudoku Compiler Class
    Sudoku.SudokuCompiler = Sudoku.Class( Compiler, {
        
        constructor: function( grid ) {
            var self = this;
            
            self.$superv('constructor', ['Sudoku.SudokuCompiler']);
            
            if ( isWorker )
            {
                // use a shorter interval in worker compiler for faster performance
                self
                    .listen("generateSudoku", function(data){
                        self.send( "generateSudoku", {solution: sudoku_grid(data.data, true)} );
                    })
                    .listen("compile", function(data){
                        self.data = data.data;
                        self.solution = self.data;
                        self.compileAsync( );
                    })
                    .listen("stop", function(data){
                        // send any data up to now
                        self.stop( );
                    })
                    .listen("dispose", function(data){
                        self.stop( ).dispose( );
                        // end worker
                        close( );
                    })
                ;
            }
            else
            {
                self.grid = grid || null;
            }
        },
        
        solution: null,
        data: null,
        
        dispose: function( ) {
            var self = this;
            self.solution = null;
            self.data = null;
            self.$superv('dispose');
            return self;
        },

        compileAsync: function( generate ) {
            var self = this, dims = self.dimensions, start, end, completed;
            if ( isWorker )
            {
                completed = function( ) {
                    self.status = Compiler.STATUS.FOUND;
                    self.send('complete', {
                        status: self.status, 
                        solution: self.solution
                    });
                };
            }
            else
            {
                completed = function( ) {
                    end = new Date( ).getTime( );
                    if ( self.solution )
                    {
                        self.status = Compiler.STATUS.FOUND;
                        self.trigger('complete', {
                            status: self.status, 
                            duration: end - start
                        }, 5);
                    }
                    else
                    {
                        self.status = Compiler.STATUS.NOT_FOUND;
                        self.trigger( 'error', null, 5 );
                    }
                };                    
                
                start = new Date( ).getTime( );
            }
            
            self.stop( );
            if ( true === generate ) 
            {
                setTimeout(function( ) {
                    self.solution = sudoku_grid( self.data, true );
                    completed( );
                }, 20 );
            }
            else
            {
                self.steps(
                    self.until( true, sudokuAsyncSinglePass( self.data, self.data.difficulty, self.data.symmetry ) ),
                    completed
                ).interval( isWorker ? 15 : 40 ).run( Compiler.RUN_MODE.SEQUENCE );
            }
            return self;
        },
        
        compileWorker: function( generate ) {
            var self = this, start, end;
            
            start = new Date( ).getTime( );
            
            self.fork( )
                .listen('generateSudoku', function( data ) {
                    self.status = Compiler.STATUS.FOUND;
                    self.solution = data.solution
                    self.trigger('complete', {
                        status: self.status, 
                        duration: end - start
                    }, 5);
                    setTimeout(function( ) {
                        self.unfork( );
                    }, 500);
                })
                .listen('complete', function( data ) {
                    end = new Date( ).getTime( );
                    self.status = data.status;
                    if ( data.solution )
                    {
                        self.solution = data.solution;
                        self.trigger('complete', {
                            status: self.status, 
                            duration: end - start
                        }, 5);
                    }
                    else
                    {
                        self.trigger('error', null, 5);
                    }
                    setTimeout(function( ) {
                        self.unfork( );
                    }, 500);
                })
            ;
            if ( true === generate ) self.send('generateSudoku', { data: self.data });
            else self.send('compile', { data: self.data });
            return self;
        },
        
        setSolution: function( ) {
            var self = this;
            if ( self.grid && self.solution ) self.grid.setRawGrid( self.solution );
            return self;
        },
        
        clearSolution: function( ) {
            return this;
        },
        
        generateSudoku: function( asWorker ) {
            var self = this;
            self.solution = null;
            self.data = self.grid.getRawGrid( );
            if ( false !== asWorker ) self.compileWorker( true );
            else self.compileAsync( true );
            return self;
        },
        
        compile: function( asWorker, difficulty, symmetry ) {
            var self = this;
            self.solution = null;
            self.data = self.grid.getRawGrid( );
            self.data.difficulty = difficulty;
            self.data.symmetry = symmetry;
            if ( false !== asWorker ) self.compileWorker( );
            else self.compileAsync( );
            return self;
        }
    });
    
}(Sudoku);;    
    /* main code ends here */
    /* export the module */
    return exports["Sudoku"];
});