/*! test.js
 */

/* vim: set tabstop=4 shiftwidth=4 softtabstop=4 expandtab: */

// print function which the runtime will call
/*function print(text) {
  //document.getElementById('output').innerHTML += text + '<br>';
}

// Override the _show_image in freetype.js.
__Z10show_imagev = function() {
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  var image = ctx.getImageData(0, 0, canvas.width, canvas.height);

  var ptr = IHEAP[_image];
  for (var y = 0; y < canvas.height; y++) {
    for (var x = 0; x < canvas.width; x++) {
      var value = IHEAP[ptr + y*canvas.width + x];
      var base = (y*canvas.width + x)*4;
      image.data[base + 0] = value;
      image.data[base + 1] = value;
      image.data[base + 2] = value;
      image.data[base + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
};*/

function render(angle, text) {
  var canvas = document.getElementById('canvas');
  canvas.width  = 600;
  canvas.height = 200;
  
  //run(['/assets/fonts/LiberationSansBold.ttf', text, canvas.width.toString(), canvas.height.toString(), angle.toString()]); // will call _show_image, above
  //run(['font.ttf', text, canvas.width.toString(), canvas.height.toString(), angle.toString()]); // will call _show_image, above
}

$(function() {
    render(10, "hello world");
});

