/**
*
*   Sudoku.js
*   @version: @@VERSION@@
*   @@DEPENDENCIES@@
*
*   Sudoku Builder in JavaScript
*   http://nikos-web-development.netai.net/
*
*   (light-weight and scaled-down version of CrossWord.js, professional Crossword Builder in JavaScript, by same author)
*
**/
var 
Sudoku = exports['@@MODULE_NAME@@'] = { }
,_jQuery_ = ('function' === typeof jQuery ? jQuery : function( ){ })
,_Asynchronous_ = ('function' === typeof Asynchronous ? Asynchronous : {isThread: function(){return false;}, path: function(){return {file:null, path:null};}})
;
!function(Sudoku, Classy, PublishSubscribe, Asynchronous, $, undef) {
    @@USE_STRICT@@
    
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
        
        VERSION: "@@VERSION@@"
        
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
    
}(Sudoku, Classy, PublishSubscribe, _Asynchronous_, _jQuery_ );