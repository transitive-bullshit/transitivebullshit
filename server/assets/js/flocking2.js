/*! flocking2.js
 * 
 * Copyright (c) 2013 Travis Fischer
 */

/* vim: set tabstop=4 shiftwidth=4 softtabstop=4 expandtab: */
/* global $, Detector, Utils */

$(document).ready(function() {
    if (!Detector.webgl) Detector.addGetWebGLMessage();

    var container;
    var camera, scene, renderer, particles, geometry, materials = [], parameters, i, h, color;
    var mouseX = 0, mouseY = 0;

    var windowHalfX = window.innerWidth / 2;
    var windowHalfY = window.innerHeight / 2;

    var WIDTH = 128;
    var HEIGHT = WIDTH;
    var PARTICLES = WIDTH * WIDTH;
    var BOUNDS = 400, BOUNDS_HALF = BOUNDS / 2;

    var debug;
    var data, texture;

    console.log('total', PARTICLES);

    var simulator;
    var flipflop = true;
    var rtPosition1, rtPosition2, rtVelocity1, rtVelocity2;

    init();
    animate();
    onMouseDown();

    function init()
    {
        container = document.createElement('div');
        document.body.appendChild(container);

        camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 3000);
        camera.position.z = 400;

        scene = new THREE.Scene();

        geometry = getBufferParticleGeometry();

        renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);

        ////////
        simulator = new SimulatorRenderer(WIDTH, renderer);

        var dtPosition = generateDataTexture();
        var dtVelocity = generateVelocityTexture();

        rtPosition1 = simulator.getRenderTarget();
        rtPosition2 = rtPosition1.clone();
        rtVelocity1 = rtPosition1.clone();
        rtVelocity2 = rtPosition1.clone();

        simulator.renderTexture(dtPosition, rtPosition1);
        simulator.renderTexture(rtPosition1, rtPosition2);

        simulator.renderTexture(dtVelocity, rtVelocity1);
        simulator.renderTexture(rtVelocity1, rtVelocity2);

        simulator.velocityUniforms.testing.value = 0;

        /////////

        // Particle material

        particle_basic = THREE.ShaderLib['particle_basic'] = {
            uniforms:  THREE.UniformsUtils.merge([
                {
                    "lookup": { type: "t", value: null }
                },
                THREE.UniformsLib[ "particle" ],
                THREE.UniformsLib[ "shadowmap" ],
                {
                    "moocolor": { type: "vec3", value: new THREE.Color(0xffffff) }
                },

            ]),

            vertexShader: [
                "uniform sampler2D lookup;",

                "uniform float size;",
                "uniform float scale;",

                THREE.ShaderChunk[ "color_pars_vertex" ],
                THREE.ShaderChunk[ "shadowmap_pars_vertex" ],

                "void main() {",

                    THREE.ShaderChunk[ "color_vertex" ],

                    "vec2 lookupuv = position.xy + vec2(0.5 / 32.0, 0.5 / 32.0);",
                    "vec3 pos = texture2D(lookup, lookupuv).rgb;",

                    "vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);",

                    "#ifdef USE_SIZEATTENUATION",
                        "gl_PointSize = size * (scale / length(mvPosition.xyz));",
                    "#else",
                        "gl_PointSize = size;",
                    "#endif",

                    "gl_Position = projectionMatrix * mvPosition;",

                    THREE.ShaderChunk[ "worldpos_vertex" ],
                    THREE.ShaderChunk[ "shadowmap_vertex" ],

                "}"

            ].join("\n"),

            fragmentShader: [

                "uniform vec3 psColor;",
                "uniform float opacity;",

                THREE.ShaderChunk[ "color_pars_fragment" ],
                THREE.ShaderChunk[ "map_particle_pars_fragment" ],
                THREE.ShaderChunk[ "fog_pars_fragment" ],
                THREE.ShaderChunk[ "shadowmap_pars_fragment" ],

                "void main() {",

                    "gl_FragColor = vec4(psColor, opacity);",

                    THREE.ShaderChunk[ "map_particle_fragment" ],
                    THREE.ShaderChunk[ "alphatest_fragment" ],
                    THREE.ShaderChunk[ "color_fragment" ],
                    THREE.ShaderChunk[ "shadowmap_fragment" ],
                    THREE.ShaderChunk[ "fog_fragment" ],

                "}"

            ].join("\n")
        };

        material = new THREE.ParticleBasicMaterial({
            size: 35, 
            vertexColors: false,
            map: THREE.ImageUtils.loadTexture('/assets/img/flare.png'), 
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false, depthTest: false,
            uniforms: {
                'color': {}
            }
        });
        console.log(material);

        // material.map = rtPosition1;
        particle_basic.uniforms.lookup.value = rtPosition1;
        // material.uniforms.lookup.value = rtPosition1;

        particles = new THREE.ParticleSystem(geometry, material);
        scene.add(particles);

        plane = new THREE.PlaneGeometry(BOUNDS, BOUNDS, 1, 1);

        /*var frame = new THREE.Mesh(
            new THREE.CubeGeometry(BOUNDS, BOUNDS, BOUNDS),
            new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: true, depthWrite: false})
        );*/
        /*var frame = new THREE.Mesh(
            new THREE.SphereGeometry(BOUNDS_HALF, 10, 10),
            new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, depthWrite: false })
        );

        scene.add(frame);*/

        /*var debug = new THREE.Mesh(
         	plane,
         	new THREE.MeshBasicMaterial({
         		color: 0xffffff,
         		map: texture,
         		// wireframe: true rtTexturePos, texture
         		// transparent: true
         	})
        );

        scene.add(debug);*/

        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('mousedown', onMouseDown, false);
        document.addEventListener('mouseup', onMouseUp, false);
        document.addEventListener('touchstart', onDocumentTouchStart, false);
        document.addEventListener('touchmove', onDocumentTouchMove, false);

        //

        window.addEventListener('resize', onWindowResize, false);

        var effectController = {
            separation: 20.0,
            alignment: 20.0,
            cohesion: 45.0,
            freedom: 0.75
        };

        var valuesChanger = function() {
            simulator.velocityUniforms.separationDistance.value = effectController.separation;
            simulator.velocityUniforms.alignmentDistance.value = effectController.alignment;
            simulator.velocityUniforms.cohesionDistance.value = effectController.cohesion;
            simulator.velocityUniforms.freedomFactor.value = effectController.freedom;
        };

        valuesChanger();
    }

    function onWindowResize()
    {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function onDocumentMouseMove(event)
    {
        mouseX = event.clientX - windowHalfX;
        mouseY = event.clientY - windowHalfY;
    }

    function onDocumentTouchStart(event)
    {
        if (event.touches.length === 1) {
            event.preventDefault();

            mouseX = event.touches[ 0 ].pageX - windowHalfX;
            mouseY = event.touches[ 0 ].pageY - windowHalfY;
        }
    }

    function onDocumentTouchMove(event)
    {
        if (event.touches.length === 1) {
            event.preventDefault();

            mouseX = event.touches[ 0 ].pageX - windowHalfX;
            mouseY = event.touches[ 0 ].pageY - windowHalfY;
        }
    }

    //

    function animate()
    {
        requestAnimationFrame(animate);

        render();
    }

    var timer = 0;

    function render()
    {
        timer += 0.01;

        // simulationShader.uniforms.timer.value = timer;

        var debugTime = false && Math.random() < 0.1;

        debugTime && console.time('simulate');

        if (flipflop) {
            simulator.renderVelocity(rtPosition1, rtVelocity1, rtVelocity2);
            simulator.renderPosition(rtPosition1, rtVelocity2, rtPosition2);
            if (material.uniforms)
                material.uniforms.lookup.value = rtPosition2;
        } else {
            simulator.renderVelocity(rtPosition2, rtVelocity2, rtVelocity1);
            simulator.renderPosition(rtPosition2, rtVelocity1, rtPosition1);
            if (material.uniforms)
                material.uniforms.lookup.value = rtPosition1;
        }

        flipflop = !flipflop;

        debugTime && console.timeEnd('simulate');

        var time = Date.now() * 0.00005;

        camera.position.x += (mouseX - camera.position.x) * 0.05;
        camera.position.y += (- mouseY - camera.position.y) * 0.05;

        camera.lookAt(scene.position);

        debugTime && console.time('render');

        renderer.render(scene, camera);

        debugTime && console.timeEnd('render');
    }
    
    /*window.kick = function() {
        material.size = 200;
    };
    
    window.offKick = function() {
        material.size = 35;
    };*/
    
    window.update = function(value) {
        var max = 15;
        var min = 5;
        
        material.size = Math.max(min, Math.min(max, min + (max - min) * value));
    };
    
    function onMouseDown()
    {
        simulator.velocityUniforms.testing.value = 1;
        var h = Math.random();
        material.uniforms.psColor.value.setHSV(h , 0.9, 0.9);
    }

    function onMouseUp()
    {
        simulator.velocityUniforms.testing.value = 0;
    }

    function generateDataTexture()
    {
        var x, y, z;

        var w = WIDTH, h = WIDTH;

        var a = new Float32Array(PARTICLES * 4);

        for (var k = 0; k < PARTICLES; k++) {
            x = Math.random() * BOUNDS - BOUNDS_HALF;
            y = Math.random() * BOUNDS - BOUNDS_HALF;
            z = Math.random() * BOUNDS - BOUNDS_HALF;

            a[ k*4 + 0 ] = x;
            a[ k*4 + 1 ] = y;
            a[ k*4 + 2 ] = z;
            a[ k*4 + 3 ] = 1;
        }

        var texture = new THREE.DataTexture(a, WIDTH, WIDTH, THREE.RGBAFormat, THREE.FloatType);
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.needsUpdate = true;
        texture.flipY = false;
        console.log(texture);

        return texture;
    }

    function generateVelocityTexture()
    {
        var x, y, z;

        var w = WIDTH, h = WIDTH;

        var a = new Float32Array(PARTICLES * 4);

        for (var k = 0; k < PARTICLES; k++) {
            x = Math.random() - 0.5;
            y = Math.random() - 0.5;
            z = Math.random() - 0.5;

            a[ k*4 + 0 ] = x * 10;
            a[ k*4 + 1 ] = y * 10;
            a[ k*4 + 2 ] = z * 10;
            a[ k*4 + 3 ] = 1;
        }

        var texture = new THREE.DataTexture(a, WIDTH, WIDTH, THREE.RGBAFormat, THREE.FloatType);
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.needsUpdate = true;
        texture.flipY = false;
        console.log(texture);

        return texture;
    }

    function getBufferParticleGeometry()
    {
        var particles = PARTICLES;

        var geometry = new THREE.BufferGeometry();
        geometry.attributes = {
            position: {
                itemSize: 3,
                array: new Float32Array(particles * 3),
                numItems: particles * 3
            },
            color: {
                itemSize: 3,
                array: new Float32Array(particles * 3),
                numItems: particles * 3
            }
        }

        var positions = geometry.attributes.position.array;
        var colors = geometry.attributes.color.array;

        var color = new THREE.Color();

        var n = 1000, n2 = n / 2; // particles spread in the cube

        for (var i = 0; i < positions.length; i += 3) {
            var j = ~~(i / 3);

            // positions

            var x = (j % WIDTH) / WIDTH;
            var y = Math.floor(j / WIDTH) / HEIGHT;
            var z = Math.random() * n - n2;
            
            /*x = Utils.getRandom(-1, 1);
            y = Utils.getRandom(-1, 1);
            z = Utils.getRandom(-1, 1);
            
            var r = n2 / Math.sqrt(x * x + y * y + z * z);
            
            x *= r;
            y *= r;
            z *= r;*/
            
            positions[ i ]     = x;
            positions[ i + 1 ] = y;
            positions[ i + 2 ] = z;
        }

        geometry.computeBoundingSphere();
        return geometry;
    }
});

