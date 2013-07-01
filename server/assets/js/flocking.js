/*! flocking.js
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

    var WIDTH = 32;
    var HEIGHT = WIDTH;
    var PARTICLES = WIDTH * WIDTH;
    var BOUNDS = 400, BOUNDS_HALF = BOUNDS / 2;

    var debug;
    var data, texture;

    console.log('total', PARTICLES);

    // 8 -> 64
    // 16 -> 256
    // 32 -> 1024 -> 60fps
    // 64 -> 24fps

    var simulator;
    var flipflop = true;
    var rtPosition1, rtPosition2, rtVelocity1, rtVelocity2;

    init();
    animate();

    function init()
    {
        container = document.createElement('div');
        document.body.appendChild(container);

        camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 3000);
        camera.position.z = 400;

        scene = new THREE.Scene();

        geometry = new THREE.Geometry();

        // Replacement for ParticleBasicMaterial
        for (var i = 0, l = WIDTH * HEIGHT; i < l; i ++) {
            var vertex = new THREE.Vector3();
            vertex.x = (i % WIDTH) / WIDTH ;
            vertex.y = Math.floor(i / WIDTH) / HEIGHT;
            geometry.vertices.push(vertex);
        }

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

        simulator.velocityUniforms.testing.value = 10;

        /////////

        // Particle material

        material = new THREE.ShaderMaterial({
            uniforms: {
                "map": { type: "t", value: null },
                "width": { type: "f", value: WIDTH },
                "height": { type: "f", value: HEIGHT },
                "pointColor": { type: "v4", value: new THREE.Vector4(0.25, 0.50, 1.0, 0.25) },
                "pointSize": { type: "f", value: 1 }
            },
            vertexShader: document.getElementById('vs-particles').textContent,
            fragmentShader: document.getElementById('fs-particles').textContent,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            depthTest: false,
            transparent: true
        });

        material.uniforms.map.value = rtPosition1;

        // material.needsUpdate = true;

        particles = new THREE.ParticleSystem(geometry, material);
        scene.add(particles);

        plane = new THREE.PlaneGeometry(BOUNDS, BOUNDS, 1, 1);

        cube = new THREE.Mesh(
            new THREE.CubeGeometry(BOUNDS, BOUNDS, BOUNDS),
            new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: true})
        );

        scene.add(cube);

        // debug = new THREE.Mesh(
        // 	plane,
        // 	new THREE.MeshBasicMaterial({
        // 		color: 0xffffff,
        // 		map: texture,
        // 		// wireframe: true rtTexturePos, texture
        // 		// transparent: true
        // 		// transparent: true
        // 	})
        //);

        // scene.add(debug);

        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('mousedown', onMouseDown, false);
        document.addEventListener('mouseup', onMouseUp, false);
        document.addEventListener('touchstart', onDocumentTouchStart, false);
        document.addEventListener('touchmove', onDocumentTouchMove, false);

        //

        window.addEventListener('resize', onWindowResize, false);
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

        if (flipflop) {
            simulator.renderVelocity(rtPosition1, rtVelocity1, rtVelocity2);
            simulator.renderPosition(rtPosition1, rtVelocity2, rtPosition2);
            material.uniforms.map.value = rtPosition2;
        } else {
            simulator.renderVelocity(rtPosition2, rtVelocity2, rtVelocity1);
            simulator.renderPosition(rtPosition2, rtVelocity1, rtPosition1);
            material.uniforms.map.value = rtPosition1;
        }

        flipflop = !flipflop;

        var time = Date.now() * 0.00005;

        camera.position.x += (mouseX - camera.position.x) * 0.05;
        camera.position.y += (- mouseY - camera.position.y) * 0.05;

        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }

    function onMouseDown()
    {
        simulator.velocityUniforms.testing.value = 0;
    }

    function onMouseUp()
    {
        simulator.velocityUniforms.testing.value = 1;
    }

    function generateDataTexture()
    {
        var x, y, z;

        var w = WIDTH, h = WIDTH;

        var a = new Float32Array(PARTICLES * 4);

        for (var k = 0; k < PARTICLES; k++) {
            // x = ~~(k / w) / w;
            // x = k / PARTICLES;
            // y = x;
            // z = x;
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
});

