/*! index.js
 * 
 * Copyright (c) 2013 Travis Fischer
 */

/* vim: set tabstop=4 shiftwidth=4 softtabstop=4 expandtab: */
/* global jQuery, $, Processing, Prism */

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
            
            var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
            
            if (isChrome) {
                var bg_canvas = '<canvas class="blur_8" id="background-canvas" data-processing-sources="/assets/pde/test/test.pde"></canvas>';
                
                $("#content").prepend(bg_canvas);
                new Processing($("#background-canvas")[0]);
            }
            
            $("a.nav").click(function() {
                var selector = $(this).attr('data-filter');
                $articles.isotope({ filter : selector });
                
                return false;
            });
            
            $("a.nav").css({
                left    : 80, 
                opacity : 0
            }).each(function(i) {
                $(this).delay(1000 + i * 200).animate({ left : 0, opacity : 1 }, 700, "easeOutBack");
            });
            
            setTimeout(function() {
                $articles.isotope("reLayout");
            }, 2000);
        };
        
        $('article').filter(function(i) {
            return (this.offsetHeight < this.scrollHeight);
        }).addClass('overflowed').each(function() {
            var link = $(this).find('.view-full-article')[0];
            link.href  = '/articles/' + this.id + ".html?ajax=True";
            link.title = $(this).find('.title').text();
        });
        
        var fancyBoxAfterShow = function() {
            var bg = Processing.getInstanceById("background-canvas");
            
            if (!!bg) {
                bg.noLoop();
            }
        };
        
        var fancyBoxAfterClose = function() {
            var bg = Processing.getInstanceById("background-canvas");
            
            if (!!bg) {
                bg.loop();
            }
        };
        
        var fancyBoxHelpers = {
            overlay : {
                css : {
                    background : 'rgba(58, 42, 45, 0.95)'
                }
            }
        };
        
        $(".fancybox").fancybox({
            nextMethod  : 'zoomIn',
            nextSpeed   : 250,
            
            prevMethod  : false,
            padding     : 0, 
            
            helpers     : fancyBoxHelpers, 
            
            afterShow   : fancyBoxAfterShow, 
            afterClose  : fancyBoxAfterClose
        });
        
        $(".fancybox_ajax").fancybox({
            autoSize    : false, 
            autoHeight  : true, 
            
            width       : '60%', 
            minWidth    : '480', 
            
            helpers     : fancyBoxHelpers, 
            
            afterShow   : function() {
                fancyBoxAfterShow();
                
                Prism.highlightAll2();
            }, 
            
            afterClose  : fancyBoxAfterClose
        });
        
        init_articles();
    });
})();

