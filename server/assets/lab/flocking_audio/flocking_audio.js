/*! flocking_audio.js
 * 
 * Copyright (c) 2013 Travis Fischer
 */

/* vim: set tabstop=4 shiftwidth=4 softtabstop=4 expandtab: */
/* global $, Dancer, Utils */

(function() {
    $(document).ready(function() {
        var dancer, 
            kick, 
            AUDIO_FILE = '/assets/media/krossbow_remix';
        
        Dancer.setOptions({
            flashSWF : '/assets/js/lib/soundmanager2/soundmanager2.swf', 
            flashJS  : '/assets/js/lib/soundmanager2/soundmanager2.js'
        });
        
        var dancer  = new Dancer();
        dancer.load({ src : AUDIO_FILE, codecs : [ 'ogg', 'mp3' ] });
        
        var kick    = dancer.createKick({
            onKick : function () {
                //window.kick();
            },
            
            offKick : function() {
                //window.offKick();
            }
        });

        function loaded() {
            console.log("dancer loaded");
            
            kick.on();
            dancer.play();
        }
        
        !dancer.isLoaded() ? dancer.bind('loaded', loaded) : loaded();
        
        window.g_dancer = dancer;
        
        dancer.bind('update', function() {
            var magnitude = kick.maxAmplitude(kick.frequency);
            var value = TWEEN.Easing.Cubic.In(magnitude / kick.threshold);
            
            window.update(value);
        });
    });
})();

