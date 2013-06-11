/*! index.js
 * 
 * Copyright (c) 2013 Travis Fischer
 */

/* vim: set tabstop=4 shiftwidth=4 softtabstop=4 expandtab: */

(function() {
    $(document).ready(function() {
        var init_articles = function() {
            var $articles = $('.articles');
            
            $articles.isotope({
                itemSelector : 'article', 
                layoutMode   : 'masonry', 
                masonry      : {
                    columnWidth : 50
                }
            });
        };
        
        $(".fancybox").fancybox({
            nextMethod  : 'zoomIn',
            nextSpeed   : 250,
            
            prevMethod  : false,
            padding     : 0, 
            
            helpers     : {
                overlay : {
                    css : {
                        background : 'rgba(58, 42, 45, 0.95)'
                    }
                }
            }, 
            
            afterShow   : function() {
                var bg = Processing.getInstanceById("background-canvas");
                
                if (!!bg) {
                    bg.noLoop();
                }
            }, 
            
            afterClose  : function() {
                var bg = Processing.getInstanceById("background-canvas");
                
                if (!!bg) {
                    bg.loop();
                }
            }
        });
        
        $('article').filter(function(i) {
            return (this.offsetHeight < this.scrollHeight);
        }).addClass('overflowed').each(function() {
            $(this).find('.view-full-article')[0].href = '/articles/' + this.id;
        });
        
        //$('#processing').width("100%").height("100%");
        init_articles();
    });
})();

