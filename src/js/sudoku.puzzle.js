/**
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

}(Sudoku);