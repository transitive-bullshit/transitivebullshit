var page    = require('webpage').create(), 
    system  = require('system'), 
    frames  = 600, 
    frame   = 0, 
    url;

if (system.args.length === 1) {
    console.log('Usage: ' + system.args[0] + ' <sketch>');
    sketch = 'primordial'
} else {
    sketch = system.args[1];
}

url = 'http://localhost:8000/processing?sketch=' + sketch + '&bare=True';

page.open(url, function () {
    page.includeJs("http:////ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js", function() {
        setTimeout(function() {
            var rect = page.evaluate(function() {
                $(".editor-column").hide();
                
                var $canvas = $("canvas");
                $canvas.css({ top : 0, left : 0, margin : '0' });
                
                return $canvas[0].getBoundingClientRect();
            });
            
            page.clipRect = rect;
            page.viewportSize = {
                width   : rect.width, 
                height  : rect.height
            };
            
            var capture = function() {
                var output = '.frame' + frame + '.png';
                
                console.log("" + sketch + ": rendering frame '" + frame + "' to '" + output + "'");
                page.render(output);
                
                if (++frame >= frames) {
                    phantom.exit();
                }
                
                setTimeout(capture, 50);
            };
            
            capture();
        }, 100);
    });
});

// ffmpeg -c:v png -r 10 -sameq -i ".frame%d.png" -y test.mp4

