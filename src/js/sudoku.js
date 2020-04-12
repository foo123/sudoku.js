/**
*
*   Sudoku.js
*   @version: @@VERSION@@
*   @dependencies: Classy.js, PublishSubscribe, Asynchronous.js, jQuery
*
*   Sudoku Builder in JavaScript
*   https://foo123.github.io/
*
*   (light-weight and scaled-down version of CrossWord.js, professional Crossword Builder in JavaScript, by same author)
*
**/
"use strict";
var
Sudoku = { }
,_jQuery_ = ('function' === typeof jQuery ? jQuery : function( ){ })
,_Asynchronous_ = ('function' === typeof Asynchronous ? Asynchronous : {isThread: function(){return false;}, path: function(){return {file:null, path:null};}})
;
!function(Sudoku, Classy, PublishSubscribe, Asynchronous, $, undef) {
"use strict";

var PROTO = "prototype", HAS = 'hasOwnProperty', stdMath = Math
    ,OP = Object[PROTO], AP = Array[PROTO], FP = Function[PROTO]
    ,round = stdMath.round, rand = stdMath.random

    ,rnd = function( m, M ) { return round( (M-m)*rand() + m ); }

    ,array = function( n ) { return new Array(n); }
    // adapted from https://github.com/foo123/Abacus
    ,n_array = function n_array( dims ) {
        var len = dims.shift( ),
            a = len ? new Array( len ) : [ ], i
        ;
        if ( dims.length ) for (i=0; i<len; i++) a[ i ] = n_array( dims.slice(0) );
        return a;
    }
    ,range = function range( n, options, shuffled )  {
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
    ,operate = function operate( a, f, f0 ) {
        var i, l=a.length, r=l&15, q=r&1, fv=q?f(f0,a[0]):f0;
        for (i=q; i<r; i+=2)  fv = f(f(fv,a[i]),a[i+1]);
        for (i=r; i<l; i+=16) fv = f(f(f(f(f(f(f(f(f(f(f(f(f(f(f(f(fv,a[i]),a[i+1]),a[i+2]),a[i+3]),a[i+4]),a[i+5]),a[i+6]),a[i+7]),a[i+8]),a[i+9]),a[i+10]),a[i+11]),a[i+12]),a[i+13]),a[i+14]),a[i+15]);
        return fv;
    }
    ,filter = function filter( a, f, ref ) {
        var i, l=a.length, r=l&15, q=r&1, fv=[];
        if ( arguments.length > 2 )
        {
        if ( q && f.call(ref, a[0]) ) fv.push(a[0]);
        for (i=q; i<r; i+=2)
        {
            if ( f.call(ref, a[i  ]) ) fv.push(a[i  ]);
            if ( f.call(ref, a[i+1]) ) fv.push(a[i+1]);
        }
        for (i=r; i<l; i+=16)
        {
            if ( f.call(ref, a[i  ]) ) fv.push(a[i  ]);
            if ( f.call(ref, a[i+1]) ) fv.push(a[i+1]);
            if ( f.call(ref, a[i+2]) ) fv.push(a[i+2]);
            if ( f.call(ref, a[i+3]) ) fv.push(a[i+3]);
            if ( f.call(ref, a[i+4]) ) fv.push(a[i+4]);
            if ( f.call(ref, a[i+5]) ) fv.push(a[i+5]);
            if ( f.call(ref, a[i+6]) ) fv.push(a[i+6]);
            if ( f.call(ref, a[i+7]) ) fv.push(a[i+7]);
            if ( f.call(ref, a[i+8]) ) fv.push(a[i+8]);
            if ( f.call(ref, a[i+9]) ) fv.push(a[i+9]);
            if ( f.call(ref, a[i+10]) ) fv.push(a[i+10]);
            if ( f.call(ref, a[i+11]) ) fv.push(a[i+11]);
            if ( f.call(ref, a[i+12]) ) fv.push(a[i+12]);
            if ( f.call(ref, a[i+13]) ) fv.push(a[i+13]);
            if ( f.call(ref, a[i+14]) ) fv.push(a[i+14]);
            if ( f.call(ref, a[i+15]) ) fv.push(a[i+15]);
        }
        }
        else
        {
        if ( q && f(a[0]) ) fv.push(a[0]);
        for (i=q; i<r; i+=2)
        {
            if ( f(a[i  ]) ) fv.push(a[i  ]);
            if ( f(a[i+1]) ) fv.push(a[i+1]);
        }
        for (i=r; i<l; i+=16)
        {
            if ( f(a[i  ]) ) fv.push(a[i  ]);
            if ( f(a[i+1]) ) fv.push(a[i+1]);
            if ( f(a[i+2]) ) fv.push(a[i+2]);
            if ( f(a[i+3]) ) fv.push(a[i+3]);
            if ( f(a[i+4]) ) fv.push(a[i+4]);
            if ( f(a[i+5]) ) fv.push(a[i+5]);
            if ( f(a[i+6]) ) fv.push(a[i+6]);
            if ( f(a[i+7]) ) fv.push(a[i+7]);
            if ( f(a[i+8]) ) fv.push(a[i+8]);
            if ( f(a[i+9]) ) fv.push(a[i+9]);
            if ( f(a[i+10]) ) fv.push(a[i+10]);
            if ( f(a[i+11]) ) fv.push(a[i+11]);
            if ( f(a[i+12]) ) fv.push(a[i+12]);
            if ( f(a[i+13]) ) fv.push(a[i+13]);
            if ( f(a[i+14]) ) fv.push(a[i+14]);
            if ( f(a[i+15]) ) fv.push(a[i+15]);
        }
        }
        return fv;
    }
    // http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
    ,shuffle = function shuffle( a, copied ) {
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
    ,shufflex = function shufflex( a, o, copied ) {
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

    ,isWorker: Asynchronous.isThread( null, true )
    ,Path: Asynchronous.path( ModuleFactory__Sudoku.moduleUri )

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
    ,operate: operate
    ,filter: filter
    ,shuffle: shuffle
    ,shufflex: shufflex
    ,clamp: clamp
    ,randi: rnd
    ,randf: function(m, M) { return (M-m)*rand() + m; }
    ,randomItem: function( a ) { return a && a.length ? a[ rnd(0, a.length-1) ] : null; }
});

}(Sudoku, Classy, PublishSubscribe, _Asynchronous_, _jQuery_ );