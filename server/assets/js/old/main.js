
requirejs.config({
    paths : {
        'underscore' : 'libs/underscore/underscore.js', 
        'backbone'   : 'libs/backbone/backbone.js', 
        'jquery'     : 'libs/jquery/jquery.jquery-1.7.2.js', 
    }, 
    
    shim : {
        'underscore': {
            deps    : [ 'jquery' ], 
            exports : '_'
        }, 
        'backbone'  : {
            deps    : [ 'underscore', 'jquery' ], 
            exports : 'Backbone'
        }, 
    }
});

require(["jquery", "backbone"], 
function( jquery,   backbone)
{
    window.alert("HELLO require.js");
});

