/*! turing.js
 * 
 * Copyright (c) 2013 Travis Fischer
 * 
 * Based off of Jonathon McCabe's paper 'Cyclic Symmetric Multi-Scale Turing Patterns
 * (http://www.jonathanmccabe.com/Cyclic_Symmetric_Multi-Scale_Turing_Patterns.pdf)
 * 
 * Resources:
 *   * http://www.jonathanmccabe.com/Cyclic_Symmetric_Multi-Scale_Turing_Patterns.pdf
 *   * http://www.wblut.com/2011/07/13/mccabeism-turning-noise-into-a-thing-of-beauty/
 *   * http://softologyblog.wordpress.com/2011/07/05/multi-scale-turing-patterns/
 * 
 * TODO:
 *   * switch to using ALPHA textures instead of RGBA
 *   * optimize multi-pass blur diffusion
 *   * look into replacing inefficient readPixels for grid normalization
 *      * could use offset instead of division for storing oo.z with better precision
 *   * HUD with data.GUI
 *      * options.size
 *      * toggle view individual layers
 *      * multi-pass blur constant
 *      * proper GL resource cleanup
 */

/* vim: set tabstop=4 shiftwidth=4 softtabstop=4 expandtab: */
/* global $, Detector, Utils */

var TuringData = Class.extend(
{
    init : function(renderer, size, levels) {
        this.renderer = renderer;
        this.size   = size;
        this.levels = levels;
        
        this.format = THREE.RGBAFormat;
        this.type   = THREE.FloatType;
        
        this.camera = new THREE.Camera();
        this.camera.position.z = 1;
        
        var gl = this.renderer.getContext();
        
        if (!gl.getExtension("OES_texture_float")) {
            alert("No OES_texture_float support for float textures!");
            return;
        }
        
        if (gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) == 0) {
            alert("No support for vertex shader textures!");
            return;
        }
        
        this.scene = new THREE.Scene();
        
        this.materials = {
            texture : new THREE.ShaderMaterial({
                uniforms        : {
                    resolution  : { type: "v2", value: new THREE.Vector2(this.size, this.size) }, 
                    texture     : { type: "t", value: null }, 
                }, 
                vertexShader    : document.getElementById('vertexShader').textContent,
                fragmentShader  : document.getElementById('fragmentShader').textContent
            }), 
            
            blurH : new THREE.ShaderMaterial({
                uniforms: {
                    resolution  : { type: "v2", value: new THREE.Vector2(this.size, this.size) },
                    texture     : { type: "t", value: null }, 
                },
                vertexShader    : document.getElementById('vertexShader').textContent,
                fragmentShader  : document.getElementById('fragmentShaderBlurH').textContent
            }), 
            
            blurV : new THREE.ShaderMaterial({
                uniforms: {
                    resolution  : { type: "v2", value: new THREE.Vector2(this.size, this.size) },
                    texture     : { type: "t", value: null }, 
                },
                vertexShader    : document.getElementById('vertexShader').textContent,
                fragmentShader  : document.getElementById('fragmentShaderBlurV').textContent
            }), 
            
            compH : new THREE.ShaderMaterial({
                uniforms: {
                    resolution  : { type: "v2", value: new THREE.Vector2(this.size, this.size) },
                    source1     : { type: "t", value: null }, 
                    source2     : { type: "t", value: null }, 
                    radius      : { type: "f", value: 1.0 }, 
                },
                vertexShader    : document.getElementById('vertexShader').textContent,
                fragmentShader  : document.getElementById('fragmentShaderCompH').textContent
            }), 
            
            compV : new THREE.ShaderMaterial({
                uniforms: {
                    resolution  : { type: "v2", value: new THREE.Vector2(this.size, this.size) },
                    source1     : { type: "t", value: null }, 
                    source2     : { type: "t", value: null }, 
                    radius      : { type: "f", value: 1.0 }, 
                },
                vertexShader    : document.getElementById('vertexShader').textContent,
                fragmentShader  : document.getElementById('fragmentShaderCompV').textContent
            }), 
            
            compM : new THREE.ShaderMaterial({
                uniforms: {
                    resolution  : { type: "v2", value: new THREE.Vector2(this.size, this.size) },
                    source1     : { type: "t", value: null }, 
                    source2     : { type: "t", value: null }, 
                },
                vertexShader    : document.getElementById('vertexShader').textContent,
                fragmentShader  : document.getElementById('fragmentShaderCompM').textContent
            }), 
            
            compX : new THREE.ShaderMaterial({
                uniforms: {
                    resolution  : { type: "v2", value: new THREE.Vector2(this.size, this.size) },
                    source1     : { type: "t", value: null }, 
                    source2     : { type: "t", value: null }, 
                },
                vertexShader    : document.getElementById('vertexShader').textContent,
                fragmentShader  : document.getElementById('fragmentShaderCompX').textContent
            }), 
            
            updateGrid : new THREE.ShaderMaterial({
                uniforms: {
                    resolution  : { type: "v2", value: new THREE.Vector2(this.size, this.size) },
                    
                    levels      : { type: "f", value: levels }, 
                    
                    p0Variation : { type: "t", value: null }, 
                    p1Variation : { type: "t", value: null }, 
                    p2Variation : { type: "t", value: null }, 
                    p3Variation : { type: "t", value: null }, 
                    p4Variation : { type: "t", value: null }, 
                    
                    p0Activator : { type: "t", value: null }, 
                    p1Activator : { type: "t", value: null }, 
                    p2Activator : { type: "t", value: null }, 
                    p3Activator : { type: "t", value: null }, 
                    p4Activator : { type: "t", value: null }, 
                    
                    p0Inhibitor : { type: "t", value: null }, 
                    p1Inhibitor : { type: "t", value: null }, 
                    p2Inhibitor : { type: "t", value: null }, 
                    p3Inhibitor : { type: "t", value: null }, 
                    p4Inhibitor : { type: "t", value: null }, 
                    
                    p0SS        : { type: "f", value: 1.0 }, 
                    p1SS        : { type: "f", value: 1.0 }, 
                    p2SS        : { type: "f", value: 1.0 }, 
                    p3SS        : { type: "f", value: 1.0 }, 
                    p4SS        : { type: "f", value: 1.0 }, 
                },
                vertexShader    : document.getElementById('vertexShader').textContent,
                fragmentShader  : document.getElementById('fragmentShaderUpdateGrid').textContent
            }), 
            
            renderGrid : new THREE.ShaderMaterial({
                uniforms: {
                    resolution  : { type: "v2", value: new THREE.Vector2(this.size, this.size) },
                    source      : { type: "t", value: null }, 
                },
                vertexShader    : document.getElementById('vertexShader').textContent,
                fragmentShader  : document.getElementById('fragmentShaderRenderGrid').textContent
            }), 
            
            normalizeGrid : new THREE.ShaderMaterial({
                uniforms: {
                    resolution  : { type: "v2", value: new THREE.Vector2(this.size, this.size) },
                    source      : { type: "t", value: null }, 
                    minimum     : { type: "f", value: -1.0 }, 
                    invRange    : { type: "f", value: 1.0 }, 
                },
                vertexShader    : document.getElementById('vertexShader').textContent,
                fragmentShader  : document.getElementById('fragmentShaderNormalizeGrid').textContent
            }), 

        };
        
	    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.materials.texture);
	    this.scene.add(this.mesh);
        
        this.rtTemp  = this._genRenderTarget();
        this.rtTemp2 = this.genRenderTarget();
    }, 
    
    _genRenderTarget : function()
    {
        return new THREE.WebGLRenderTarget(this.size, this.size, {
            wrapS           : THREE.RepeatWrapping, 
            wrapT           : THREE.RepeatWrapping, 
            minFilter       : THREE.NearestFilter, 
            magFilter       : THREE.NearestFilter, 
            format          : this.format, 
            type            : this.type, 
            stencilBuffer   : false
        });
	}, 
    
    genRenderTarget : function()
    {
        return this.rtTemp.clone();
    }, 
    
    genTexture : function()
    {
        var size = this.size;
        var a = new Float32Array(size * size * 4);
        
        for (var i = 0; i < size; ++i) {
            for (var j = 0; j < size; ++j) {
                var o = 4 * (i * size + j);
                
                a[o + 0] = Utils.getRandom(-1, 1);
                a[o + 1] = Utils.getRandom(-1, 1);
                a[o + 2] = Utils.getRandom(-1, 1);
                a[o + 3] = 1.0;
            }
        }
        
        var texture = new THREE.DataTexture(a, size, size, this.format, this.type);
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.needsUpdate = true;
        texture.flipY = false;
        
        return texture;
    }, 
    
    renderTexture : function(tInput, rtOutput)
    {
        this.materials.texture.uniforms.texture.value = tInput;
        
        return this.render(this.materials.texture, rtOutput);
    }, 
    
    render : function(material, rt)
    {
        this.mesh.material = material || this.materials.texture;
        
        return this.renderer.render(this.scene, this.camera, rt);
    }, 
    
    blur : function(rtSource, rtDest, radius)
    {
        var max = radius / 9;
        
        // expensive multipass blur filter to simulate larger blur radii
        for (var i = 0; i < max; ++i) {
            // horizontal blur pass
            this.materials.blurH.uniforms.texture.value = rtSource;
            
            this.render(this.materials.blurH, this.rtTemp);
            
            // vertical blur pass
            this.materials.blurV.uniforms.texture.value = this.rtTemp;
            
            // set dest render target only on last iteration
            var dest = (i >= max - 1 ? rtDest : this.rtTemp2);
            this.render(this.materials.blurV, dest);
            
            // previous dest render target will become blur source texture next iteration
            rtSource = dest;
        }
    }, 
    
    sampleVariation : function(rtActivator, rtInhibitor, rtVariation)
    {
        // horizontal comparison pass
        this.materials.compH.uniforms.source1.value = rtActivator;
        this.materials.compH.uniforms.source2.value = rtInhibitor;
        
        this.render(this.materials.compH, this.rtTemp);
        
        // vertical comparison pass
        this.materials.compV.uniforms.source1.value = rtActivator;
        this.materials.compV.uniforms.source2.value = rtInhibitor;
        
        this.render(this.materials.compV, this.rtTemp2);
        
        // merge pass
        this.materials.compM.uniforms.source1.value = this.rtTemp;
        this.materials.compM.uniforms.source2.value = this.rtTemp2;
        
        this.render(this.materials.compM, rtVariation);
    }, 
});

var TuringPattern = Class.extend(
{
    init : function(data, ar, ir, ss)
    {
        this.data = data;
        this.size = data.size;
        this.ar   = ar;
        this.ir   = ir;
        this.ss   = ss;
        
        { // init gpgpu render targets
            var dtActivator  = this.data.genTexture();
            var dtInhibitor  = this.data.genTexture();
            var dtVariation  = this.data.genTexture();
            
            this.rtActivator = this.data.genRenderTarget();
            this.rtInhibitor = this.data.genRenderTarget();
            this.rtVariation = this.data.genRenderTarget();
            
            this.data.renderTexture(dtActivator, this.rtActivator);
            this.data.renderTexture(dtInhibitor, this.rtInhibitor);
            this.data.renderTexture(dtVariation, this.rtVariation);
        }
    }, 
    
    _diffuse : function(rtGrid)
    {
        this.data.blur(rtGrid, this.rtActivator, this.ar);
        this.data.blur(rtGrid, this.rtInhibitor, this.ir);
    }, 
    
    _sampleVariation : function()
    {
        this.data.sampleVariation(this.rtActivator, this.rtInhibitor, this.rtVariation);
    }, 
    
    update : function(rtGrid)
    {
        this._diffuse(rtGrid);
        this._sampleVariation();
    }, 
});

$(document).ready(function() {
    if (!Detector.webgl) Detector.addGetWebGLMessage();
    
    var container;
    var renderer;
    
    var options = {
        'levels' : 4, 
        'size'   : 128, 
    };
    
    var levels = [
        {
            'activator r' : 100.0, 
            'inhibitor r' : 200.0, 
            'ss' : 0.05, 
        }, 
        {
            'activator r' : 50.0, 
            'inhibitor r' : 100.0, 
            'ss' : 0.04, 
        }, 
        {
            'activator r' : 10.0, 
            'inhibitor r' : 20.0, 
            'ss' : 0.03, 
        }, 
        {
            'activator r' : 5.0, 
            'inhibitor r' : 10.0, 
            'ss' : 0.02, 
        }, 
        {
            'activator r' : 2.0, 
            'inhibitor r' : 4.0, 
            'ss' : 0.01, 
        }
    ];
    
    var data, patterns;
    var stopped = true;
    
    var rtGrid;
    
    var pixels = null;
    var gl = null;
    var fb = null;
    
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
        
        pixels = null;
        gl = null;
        fb = null;
        
        data = new TuringData(renderer, options.size, options.levels);
        patterns = [];
        
        // TODO: current blur uses radius / 9 so these last two patterns are too small to have 
        // variations between activator and inhibitor
        for (var i = 0; i < options.levels; ++i) {
            var level = levels[i];
            var pattern = new TuringPattern(data, 
                                            level['activator r'], 
                                            level['inhibitor r'], 
                                            level['ss']);
            
            patterns.push(pattern);
        }
        
        initGrid();
        
        stopped = false;
    }
    
    function initGrid()
    {
        dtGrid = data.genTexture();
        rtGrid = data.genRenderTarget();
        
        data.renderTexture(dtGrid, rtGrid);
    }
    
    function initGUI()
    {
        var gui = new dat.GUI();
        gui.add(options, 'size', [ 16, 32, 64, 128, 256, 512, 1024 ]).onChange(reset);
        gui.add(options, 'levels', 1, 4).step(1).onChange(reset);
        
        for (var i = 0; i < options.levels; ++i) {
            var folder = gui.addFolder('Level ' + (i + 1));
            var level  = levels[i];
            
            for (var key in level) {
                if (level.hasOwnProperty(key)) {
                    var c = folder.add(level, key, 0.0, 300.0);
                    if (key === 'ss') {
                        c.step(0.001).min(0.001).max(0.5);
                    }
                    
                    c.onChange(function(value) {
                        level[key] = value;
                        reset();
                    });
                }
            }
        }
    }
    
    function onWindowResize()
    {
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    function animate()
    {
        var debugTime = false && Math.random() < 0.1;
        
        requestAnimationFrame(animate);
        
        if (!stopped) {
            debugTime && console.time('update');
            update();
            debugTime && console.endTime('update');
            
            debugTime && console.time('render');
            render();
            debugTime && console.endTime('render');
        }
    }
    
    function update()
    {
        for (var i = 0; i < patterns.length; ++i) {
            patterns[i].update(rtGrid);
        }
    }
    
    function render()
    {
        for (var i = 0; i < patterns.length; ++i) {
            var pattern = patterns[i];
            
            data.materials.updateGrid.uniforms['p' + i + 'Variation'].value = pattern.rtVariation;
            data.materials.updateGrid.uniforms['p' + i + 'Activator'].value = pattern.rtActivator;
            data.materials.updateGrid.uniforms['p' + i + 'Inhibitor'].value = pattern.rtInhibitor;
            data.materials.updateGrid.uniforms['p' + i + 'SS'].value        = pattern.ss;
        }
        
        data.render(data.materials.updateGrid, data.rtTemp);
        
        data.materials.compX.uniforms.source1.value = data.rtTemp;
        data.materials.compX.uniforms.source2.value = rtGrid;
        
        data.render(data.materials.compX, data.rtTemp2);
        
        if (!gl) {
            gl = renderer.getContext();
            fb = gl.createFramebuffer();
            pixels = new Uint8Array(options.size * options.size * 4);
        }
        
        if (!!gl) {
            // TODO: there has to be a more efficient way of doing this than via readPixels...
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, data.rtTemp2.__webglTexture, 0);
            
            if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE) {
                // HACK: we're pickling a single float value in every 4 bytes 
                // because webgl currently doesn't support reading gl.FLOAT 
                // textures.
                gl.readPixels(0, 0, options.size, options.size, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
                
                var max = -100, min = 100;
                
                for (var i = 0; i < options.size; ++i) {
                    for (var j = 0; j < options.size; ++j) {
                        var o = 4 * (i * options.size + j);
                        var x = pixels[o + 0];
                        var y = pixels[o + 1] / 255.0;
                        var z = pixels[o + 2] / 255.0;
                        
                        var v = (x <= 1 ? -1.0 : 1.0) * y;
                        if (z > 0.0) { v /= z; }
                        
                        max = Math.max(max, v);
                        min = Math.min(min, v);
                    }
                }
                
                data.materials.compM.uniforms.source1.value = data.rtTemp;
                data.materials.compM.uniforms.source2.value = rtGrid;
                
                data.render(data.materials.compM, data.rtTemp2);
                
                data.materials.normalizeGrid.uniforms.source.value   = data.rtTemp2;
                data.materials.normalizeGrid.uniforms.minimum.value  = min;
                data.materials.normalizeGrid.uniforms.invRange.value = 1.0 / (0.5 * (max - min));
                
                data.render(data.materials.normalizeGrid, rtGrid);
            }
        }
        
        data.materials.renderGrid.uniforms.source.value = rtGrid;
        //data.materials.renderGrid.uniforms.source.value = patterns[0].rtVariation;
        data.render(data.materials.renderGrid);
    }
});

