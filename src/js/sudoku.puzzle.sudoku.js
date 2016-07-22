/**
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
        self.$super('constructor');
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
        self.$super('dispose');
        return self;
    },
    
    getSelector: function( ) {
        return '#'+this.id+'.crossword.sudoku';
    },
    
    getGridClasses: function( ) {
        var classes = this.$super('getGridClasses');
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
        var cssStyles = this.$super('getDefaultCssStyles', pzlSelector, styles, dims);
        
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
        self.$super("updateStyles", false);
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
        self.$super("updateDimensions", false);
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
        self.$super('clearCells', useCached);
        self.cells.filter( is_not_clue ).removeClass('no-notes');
        return self;
    },
    
    revealSolution: function( ) {
        var self = this;
        self.$super('revealSolution');
        self.cells.filter( is_not_clue ).addClass('no-notes');
        return self;
    },
    
    revealCell: function( cell ) {
        var self = this;
        cell = cell || self.currentInputCell || null;
        if ( cell && cell.length )
        {
            self.$super('revealCell', cell);
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
            self.$super('importTpl', jsonTpl);
        }
        return self;
    },
    
    exportTpl: function( ) {
        var self = this, 
            tpl = self.$super('exportTpl');
        if ( tpl ) tpl["dichromia"] = !!self.dichromia;
        return tpl;
    }
});

}(Sudoku);