/**
*
* Sudoku.SudokuCompiler Class
* Finds solutions for a given sudoku
*
**/
!function(Sudoku, undef){
@@USE_STRICT@@

var isWorker = Sudoku.isWorker,
    round = Math.round, min = Math.min, ceil = Math.ceil,
    shuffle = Sudoku.shuffle, shuffle_extended = Sudoku.shufflex, 
    filter = Sudoku.filter, operate = Sudoku.operate,
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
                squ = squares[cell.squ]; empties = filter( squ, is_empty ); 
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
                        operate( rows[s.row].concat(cols[s.col]), filter_and_map_clue, j );
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
        clues = shuffle( filter( cells, is_clue ) );
        empties = filter( cells, is_empty );
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
        empties = filter( cells, is_empty );
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
                    empty = filter( cells, is_empty );//merge_unique_by_key('index', empties, symcell?[cell,symcell]:[cell]);
                    
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
                    empties = filter( cells, is_empty );//merge_unique_by_key('index', empties, symcell?[cell,symcell]:[cell]);
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