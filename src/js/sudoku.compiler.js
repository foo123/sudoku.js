/**
*
* Sudoku.Compiler Base Class
* Finds solutions for a given crossword/puzzle Grid
*
**/
!function(Sudoku, undef){
@@USE_STRICT@@

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

}(Sudoku);