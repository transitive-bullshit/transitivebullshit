/*! origami.js
 * 
 * Copyright (c) 2013 Travis Fischer
 * 
 * Animated GLSL visualization based off of Jonathan McCabe's Origami Butterfly.
 * (http://www.generatorx.no/20060413/jonathan-mccabe/)
 */

/* vim: set tabstop=4 shiftwidth=4 softtabstop=4 expandtab: */
/* global $, Detector, Utils */

$(document).ready(function() {
    if (!Detector.webgl) Detector.addGetWebGLMessage();
    
    var foldsVel, foldsData, foldsTexture, foldsShader;
    var renderer, camera, scene;
    var container;
    
    var options = {
        size    : 32, 
        animate : true, 
        saturation : 0.6, 
    };
    
    var stopped = true;
    var dirty   = true;
    
    init();
    animate();
    
    function init()
    {
        container = document.createElement('div');
        document.body.appendChild(container);

        renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);
        
        window.addEventListener('resize', onWindowResize, false);
        container.addEventListener('click',  function() {
            reset();
        });
        
        initGUI();
        reset();
    }
    
    function reset()
    {
        stopped = true;
        
        camera = new THREE.Camera();
        camera.position.z = 1;
        
        var gl = renderer.getContext();
        
        if (!gl.getExtension("OES_texture_float")) {
            alert("No OES_texture_float support for float textures!");
            return;
        }
        
        if (gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) == 0) {
            alert("No support for vertex shader textures!");
            return;
        }
        
        var hsv_to_rgb = document.getElementById('shaderHSVToRGB').textContent;
        foldsTexture = genTexture();
        
        var fold = 
            "uniform vec2 resolution;\n" + 
            "uniform sampler2D folds;\n" + 
            "uniform float saturation;\n" + 
            "\n" + 
            hsv_to_rgb + 
            "\n" + 
            "void main() {\n" + 
            "    vec2 uv = gl_FragCoord.xy / resolution.xy;\n" + 
            "    vec2 pos = vec2(0.0);\n" + 
            "    float sum = 0.0;\n" + 
            "\n" + 
            "    vec4 fold;\n" + 
            "    vec2 f, u, x, UV, UV2;\n" + 
            "    float w;\n" + 
            "\n";
        
        var diff = 1.0 / options.size;
        for (var i = 0; i < options.size; ++i) {
            var f = "\n" + 
                "fold = texture2D(folds, vec2(" + i * diff + ", 0.0));\n" + 
                "f = normalize(fold.zw - fold.xy);\n" + 
                "u = normalize(uv - fold.xy);\n" + 
                "x = fold.xy + f * dot(u, f);\n" + 
                "UV = uv - 2.0 * (uv - x);\n" + 
                "w = 1.0 / length(UV - uv);\n" + 
                "pos += UV * w;\n" + 
                "sum += w;\n" + 
                "\n";
            
            fold += f;
        }
        
        fold += 
            "   pos /= sum;\n" + 
            "   gl_FragColor = hsv_to_rgb(mod(pos.x, 1.0), saturation, pow(mod(pos.y, 1.0), 0.5), 1.0);\n" + 
            "}";
        
        foldsShader = new THREE.ShaderMaterial({
            uniforms        : {
                resolution  : { type: "v2", value: new THREE.Vector2(window.innerWidth, window.innerHeight) }, 
                folds       : { type: "t", value: foldsTexture }, 
                saturation  : { type: "f", value: options.saturation }, 
            }, 
            vertexShader    : document.getElementById('vertexShader').textContent,
            fragmentShader  : fold, 
        });
        
        scene = new THREE.Scene();
        var mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), foldsShader);
        scene.add(mesh);
        
        dirty   = true;
        stopped = false;
    }
    
    function genTexture()
    {
        var size = options.size;
        foldsData = new Float32Array(size * size * 4);
        foldsVel  = new Float32Array(size * size * 4);
        var velAmount = 0.001;
        
        for (var i = 0; i < size; ++i) {
            for (var j = 0; j < size; ++j) {
                var o = 4 * (i * size + j);
                
                foldsData[o + 0] = Utils.getRandom(0, 1);
                foldsData[o + 1] = Utils.getRandom(0, 1);
                foldsData[o + 2] = Utils.getRandom(0, 1);
                foldsData[o + 3] = Utils.getRandom(0, 1);
                
                foldsVel[o + 0] = Utils.getRandom(-velAmount, velAmount);
                foldsVel[o + 1] = Utils.getRandom(-velAmount, velAmount);
                foldsVel[o + 2] = Utils.getRandom(-velAmount, velAmount);
                foldsVel[o + 3] = Utils.getRandom(-velAmount, velAmount);
            }
        }
        
        var texture = new THREE.DataTexture(foldsData, size, size, THREE.RGBAFormat, THREE.FloatType);
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.needsUpdate = true;
        texture.flipY = false;
        
        return texture;
    }
    
    function initGUI()
    {
        var gui = new dat.GUI();
        gui.add(options, 'size', [ 1, 2, 4, 8, 16, 32, 64, 128, 256 ]).onChange(reset);
        gui.add(options, 'animate');
        gui.add(options, 'saturation', 0.0, 1.0).step(0.001).onChange(function(value) {
            foldsShader.uniforms.saturation.value = value;
        });
    }
    
    function onWindowResize()
    {
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    function animate()
    {
        requestAnimationFrame(animate);
        
        if (!stopped) {
            var debugTime = false && Math.random() < 0.1;
            
            debugTime && console.time('update');
            update();
            debugTime && console.endTime('update');
            
            debugTime && console.time('render');
            render();
            debugTime && console.endTime('render');
        }
    }
    
    function clamp(v, min, max)
    {
        return Math.max(min, Math.min(max, v));
    }
    
    function update()
    {
        if (!options.animate) {
            return;
        }
        
        var amount = 0.0001;
        var velMax = 0.005;
        var posMax = 1.0;
        
        for (var i = 0; i < options.size; ++i) {
            var offset = 4 * i;
            for (var j = 0; j < 4; ++j) {
                foldsVel[offset  + j] = clamp(foldsVel[offset + j] + Utils.getRandom(-amount, amount), -velMax, velMax);
                
                foldsData[offset + j] += foldsVel[offset + j];
                
                if (foldsData[offset + j] > posMax) {
                    foldsVel[offset + j] = -Math.abs(foldsVel[offset + j]);
                } else if (foldsData[offset + j] < 0) {
                    foldsVel[offset + j] = Math.abs(foldsVel[offset + j]);
                }
            }
        }
        
        foldsTexture.needsUpdate = true;
        dirty = true;
    }
    
    function render()
    {
        if (dirty) {
            renderer.render(scene, camera);
            dirty = false;
        }
    }
});

