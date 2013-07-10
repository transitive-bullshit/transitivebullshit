/*! processing_three.js
 * 
 * Copyright (c) 2013 Travis Fischer
 * 
 * Three.js scene using Processing.js texture (PJSTexture)
 */

/* vim: set tabstop=4 shiftwidth=4 softtabstop=4 expandtab: */
/* global $, Detector, Utils */

$(document).ready(function() {
    if (!Detector.webgl) Detector.addGetWebGLMessage();
    
    var material, pjsTexture, renderer, camera, scene;
    var container;
    
    var options = {
        size    : 256, 
        animate : true, 
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
        
        pjsTexture = genTexture();
        
        material = new THREE.ShaderMaterial({
            uniforms        : {
                resolution  : { type: "v2", value: new THREE.Vector2(window.innerWidth, window.innerHeight) }, 
                texture     : { type: "t", value: pjsTexture }, 
            }, 
            vertexShader    : document.getElementById('vertexShader').textContent,
            fragmentShader  : document.getElementById('fragmentShader').textContent,
        });
        
        scene = new THREE.Scene();
        scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
        
        dirty   = true;
        stopped = false;
    }
    
    function genTexture()
    {
        var size = options.size;
        
        var texture = new THREE.PJSTexture("/assets/pde/primordial/primordial.pde", size, size, 
                                           THREE.RGBAFormat, THREE.UnsignedByteType);
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.needsUpdate = true;
        texture.flipY = true;
        
        return texture;
    }
    
    function initGUI()
    {
        var gui = new dat.GUI();
        gui.add(options, 'size', [ 32, 64, 128, 256, 512, 1024 ]).onChange(reset);
    }
    
    function onWindowResize()
    {
        renderer.setSize(window.innerWidth, window.innerHeight);
        
        material.uniforms.resolution.value = new THREE.Vector2(window.innerWidth, window.innerHeight);
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
        
        pjsTexture.needsUpdate = true;
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

