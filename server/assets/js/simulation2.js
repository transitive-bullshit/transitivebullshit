
function SimulatorRenderer(WIDTH, renderer) {
	WIDTH = WIDTH || 4;
	var camera = new THREE.Camera();
	camera.position.z = 1;

	// Init RTT stuff
	gl = renderer.getContext();

	if(!gl.getExtension("OES_texture_float")) {
		alert("No OES_texture_float support for float textures!");
		return;
	}

	if(gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) == 0) {
		alert("No support for vertex shader textures!");
		return;
	}

	var scene = new THREE.Scene();

	var uniforms = {
		time: { type: "f", value: 1.0 },
		resolution: { type: "v2", value: new THREE.Vector2(WIDTH, WIDTH) },
		texture: { type: "t", value: null },
		// Inputs
	};

	var material = new THREE.ShaderMaterial({
		uniforms: uniforms,
		vertexShader: document.getElementById('vertexShader').textContent,
		fragmentShader: document.getElementById('fragmentShader').textContent

	});

	var mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);

	var positionShader = new THREE.ShaderMaterial({
		uniforms: {
			time: { type: "f", value: 1.0 },
			resolution: { type: "v2", value: new THREE.Vector2(WIDTH, WIDTH) },
			texturePosition: { type: "t", value: null },
			textureVelocity: { type: "t", value: null },
		},
		vertexShader: document.getElementById('vertexShader').textContent,
		fragmentShader: document.getElementById('fragmentShaderPosition').textContent
	});

	var velocityShader = new THREE.ShaderMaterial({
		uniforms: {
			time: { type: "f", value: 1.0 },
			resolution: { type: "v2", value: new THREE.Vector2(WIDTH, WIDTH) },
			texturePosition: { type: "t", value: null },
			textureVelocity: { type: "t", value: null },
			testing: { type: "f", value: 0.0 },
			separationDistance: { type: "f", value: 1.0 },
			alignmentDistance: { type: "f", value: 1.0 },
			cohesionDistance: { type: "f", value: 1.0 },
			freedomFactor: { type: "f", value: 1.0 },
		},
		vertexShader: document.getElementById('vertexShader').textContent,
		fragmentShader: document.getElementById('fragmentShaderVelocity').textContent
	});

	this.velocityUniforms = velocityShader.uniforms;

	scene.add(mesh);

	this.getRenderTarget = function() {
		var renderTarget = new THREE.WebGLRenderTarget(WIDTH, WIDTH, {
			wrapS: THREE.RepeatWrapping,
			wrapT: THREE.RepeatWrapping,
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			format: THREE.RGBAFormat,
			type: THREE.FloatType,
			stencilBuffer: false
		});

		return renderTarget;
	}

	// this.render2 = function(renderer) {
	// 	mesh.material = material2;
	// 	uniforms.texture.value = renderTarget;
	// 	// mesh.material.needsUpdate = true;
	// 	renderer.render(scene, camera, renderTarget2, false);
	// 	this.target = renderTarget2;
	// }

	// this.render3 = function(renderer) {
	// 	uniforms.texture.value = renderTarget2;
	// 	renderer.render(scene, camera, renderTarget, false);
	// 	this.target = renderTarget;
	// }

	// passThroughRender(input, target)
	// Takes a texture, and render out as another texture
	// aka. renderToTexture()

	this.renderTexture = function(input, output) {
		uniforms.texture.value = input;
		renderer.render(scene, camera, output)
		this.output = output;
	}

	this.renderPosition = function(position, velocity, output) {
		mesh.material = positionShader;
		positionShader.uniforms.texturePosition.value = position;
		positionShader.uniforms.textureVelocity.value = velocity;
		renderer.render(scene, camera, output);
		this.output = output;
	}

	this.renderVelocity = function(position, velocity, output) {
		mesh.material = velocityShader;
		velocityShader.uniforms.texturePosition.value = position;
		velocityShader.uniforms.textureVelocity.value = velocity;
		velocityShader.uniforms.time.value = performance.now();
		// Date
		renderer.render(scene, camera, output);
		this.output = output;
	}
}

