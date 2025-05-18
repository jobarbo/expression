document.addEventListener("DOMContentLoaded", function () {
	// Get the canvas and container elements
	const canvas = document.getElementById("shader-canvas");
	const container = document.getElementById("canvas-container");
	const title = document.getElementById("title");

	// Set up WebGL
	const gl = canvas.getContext("webgl", {
		antialias: true,
		alpha: true,
		preserveDrawingBuffer: false,
	});

	if (!gl) {
		console.error("WebGL not supported");
		return;
	}

	// Get device pixel ratio
	const devicePixelRatio = window.devicePixelRatio || 1;

	// Track mouse position
	let mouseX = 0;
	let mouseY = 0;

	// Shader sources will be loaded from files
	let vsSource = "";
	let fsSource = "";

	// Initialize shader program when both shaders are loaded
	Promise.all([fetch("vertex.glsl").then((response) => response.text()), fetch("fragment.glsl").then((response) => response.text())])
		.then(([vertexShader, fragmentShader]) => {
			vsSource = vertexShader;
			fsSource = fragmentShader;

			// Initialize WebGL with loaded shaders
			initWebGL();
		})
		.catch((error) => {
			console.error("Error loading shaders:", error);
		});

	// Initialize WebGL with the loaded shaders
	function initWebGL() {
		// Initialize shader program
		const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

		// Collect all the info needed to use the shader program
		const programInfo = {
			program: shaderProgram,
			attribLocations: {
				vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
				textureCoord: gl.getAttribLocation(shaderProgram, "aTextureCoord"),
			},
			uniformLocations: {
				uSampler: gl.getUniformLocation(shaderProgram, "uSampler"),
				uResolution: gl.getUniformLocation(shaderProgram, "uResolution"),
				uMouse: gl.getUniformLocation(shaderProgram, "uMouse"),
				uPixelationRadius: gl.getUniformLocation(shaderProgram, "uPixelationRadius"),
				uPixelSize: gl.getUniformLocation(shaderProgram, "uPixelSize"),
				uTime: gl.getUniformLocation(shaderProgram, "uTime"),
				uDevicePixelRatio: gl.getUniformLocation(shaderProgram, "uDevicePixelRatio"),
			},
		};

		// Set up the buffers for our rectangle
		const buffers = initBuffers(gl);

		// Create a texture to render to
		const texture = setupTexture(gl);

		// Animation time
		let time = 0;
		let lastFrameTime = 0;

		// Resize canvas to match container size and account for DPI
		function resizeCanvas() {
			const rect = container.getBoundingClientRect();
			const titleRect = title.getBoundingClientRect();

			// Set the display size (CSS pixels)
			canvas.style.width = rect.width + "px";
			canvas.style.height = titleRect.height + "px";

			// Set the actual size in memory (scaled for high DPI)
			canvas.width = Math.floor(rect.width * devicePixelRatio);
			canvas.height = Math.floor(titleRect.height * devicePixelRatio);

			// Position the canvas as an overlay exactly matching the h1 element
			canvas.style.position = "absolute";
			canvas.style.top = titleRect.top - container.getBoundingClientRect().top + "px";
			canvas.style.left = "0";

			// Update the viewport to match the new canvas size
			gl.viewport(0, 0, canvas.width, canvas.height);

			// Render scene
			renderScene();
		}

		// Handle mouse movement
		document.addEventListener("mousemove", function (event) {
			const rect = canvas.getBoundingClientRect();

			// Calculate normalized coordinates (0.0 to 1.0)
			mouseX = (event.clientX - rect.left) / rect.width;
			// Y coordinate needs to be flipped for WebGL coordinate system
			mouseY = 1.0 - (event.clientY - rect.top) / rect.height;
		});

		// Handle window resize
		window.addEventListener("resize", resizeCanvas);

		// Initial size setup
		resizeCanvas();

		// Animation loop
		function animate(currentTime) {
			// Convert time to seconds
			currentTime *= 0.001;
			const deltaTime = currentTime - lastFrameTime;
			lastFrameTime = currentTime;

			// Update animation time
			time += deltaTime;

			// Render the scene
			renderScene();

			// Request next frame
			requestAnimationFrame(animate);
		}

		// Start animation loop
		requestAnimationFrame(animate);

		// Draw the scene
		function renderScene() {
			// Capture the current state of the page to the texture
			updateTexture(gl, texture);

			// Clear canvas
			gl.clearColor(0.0, 0.0, 0.0, 0.0);
			gl.clearDepth(1.0);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

			// Use our shaders
			gl.useProgram(programInfo.program);

			// Set up the vertex attributes
			setVertexAttributes(gl, buffers, programInfo);

			// Set uniforms
			gl.uniform2f(programInfo.uniformLocations.uResolution, canvas.width, canvas.height);
			gl.uniform2f(programInfo.uniformLocations.uMouse, mouseX, mouseY);
			gl.uniform1f(programInfo.uniformLocations.uPixelationRadius, 100.0 * devicePixelRatio); // Increased radius for wider effect area
			gl.uniform1f(programInfo.uniformLocations.uPixelSize, 10.0); // Larger pixel size for more pronounced pixelation
			gl.uniform1f(programInfo.uniformLocations.uTime, time); // Animation time
			gl.uniform1f(programInfo.uniformLocations.uDevicePixelRatio, devicePixelRatio); // Pass device pixel ratio to shader

			// Tell WebGL to use our texture
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

			// Draw the rectangle
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		}

		// Create html2canvas instance and update texture
		function updateTexture(gl, texture) {
			// Temporarily hide the canvas to capture what's behind it
			canvas.style.visibility = "hidden";

			// Use canvas 2D context
			const tempCanvas = document.createElement("canvas");
			tempCanvas.width = canvas.width;
			tempCanvas.height = canvas.height;
			const ctx = tempCanvas.getContext("2d", {alpha: true, willReadFrequently: true});

			// Set the canvas scale to match device pixel ratio
			ctx.scale(devicePixelRatio, devicePixelRatio);

			// Clear the canvas with transparent background
			ctx.clearRect(0, 0, tempCanvas.width / devicePixelRatio, tempCanvas.height / devicePixelRatio);

			// Set matching styles for the text
			const titleStyle = window.getComputedStyle(title);
			ctx.font = titleStyle.font;
			ctx.fillStyle = titleStyle.color;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";

			// Apply text shadow matching the original
			if (titleStyle.textShadow) {
				ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
				ctx.shadowBlur = 8 * devicePixelRatio;
				ctx.shadowOffsetX = 0;
				ctx.shadowOffsetY = 4 * devicePixelRatio;
			}

			// Draw text in the center of the canvas (right-side up)
			// Since canvas is now at the same height as the h1, center text horizontally only
			ctx.fillText(title.textContent, tempCanvas.width / (2 * devicePixelRatio), tempCanvas.height / (2 * devicePixelRatio));

			// Update WebGL texture with this canvas
			gl.bindTexture(gl.TEXTURE_2D, texture);

			// Always use FLIP_Y to ensure the texture is oriented correctly in WebGL
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tempCanvas);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

			// Make canvas visible again
			canvas.style.visibility = "visible";
		}
	}

	// Initialize shader program
	function initShaderProgram(gl, vsSource, fsSource) {
		const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
		const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

		const shaderProgram = gl.createProgram();
		gl.attachShader(shaderProgram, vertexShader);
		gl.attachShader(shaderProgram, fragmentShader);
		gl.linkProgram(shaderProgram);

		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
			console.error("Unable to initialize the shader program: " + gl.getProgramInfoLog(shaderProgram));
			return null;
		}

		return shaderProgram;
	}

	// Create and compile a shader
	function loadShader(gl, type, source) {
		const shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);

		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.error("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
			gl.deleteShader(shader);
			return null;
		}

		return shader;
	}

	// Initialize the buffers for the rectangle
	function initBuffers(gl) {
		// Create position buffer
		const positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

		// Rectangle covering the entire canvas
		const positions = [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0];

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

		// Create texture coordinate buffer
		const textureCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

		const textureCoordinates = [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0];

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

		return {
			position: positionBuffer,
			textureCoord: textureCoordBuffer,
		};
	}

	// Set up the vertex attributes for the shaders
	function setVertexAttributes(gl, buffers, programInfo) {
		// Position attribute
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
		gl.vertexAttribPointer(
			programInfo.attribLocations.vertexPosition,
			2, // 2 components per vertex
			gl.FLOAT,
			false,
			0,
			0
		);
		gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

		// Texture coordinate attribute
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
		gl.vertexAttribPointer(
			programInfo.attribLocations.textureCoord,
			2, // 2 components per vertex
			gl.FLOAT,
			false,
			0,
			0
		);
		gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
	}

	// Create and set up a texture
	function setupTexture(gl) {
		const texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);

		// Default to use FLIP_Y for consistency
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

		// Fill with a single pixel until we load the image
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));

		// Set texture parameters
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

		// Reset FLIP_Y
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

		return texture;
	}
});
