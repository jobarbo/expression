// Import Three.js from CDN
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.module.js";

// Setup variables
const mainContainer = document.querySelector("[data-expression-container]");
const textContainer = document.querySelector("[data-expression-canvas]");
const textElement = document.querySelector("[data-expression-text]");
const expressionText = textElement.textContent;
const textSize = textElement.getAttribute("data-text-size");

// Remove any inline styles to let CSS handle the font size
textElement.removeAttribute("style");

let easeFactor = 0.02;
let scene, camera, renderer, planeMesh;
let mousePosition = {x: 0.5, y: 0.5};
let targetMousePosition = {x: 0.5, y: 0.5};
let prevPosition = {x: 0.5, y: 0.5};

let text_color = textElement.getAttribute("data-text-color");

let textContainerWidth = textContainer.clientWidth;
let textContainerHeight = textContainer.clientHeight;
let x_ratio_raw = 1;
let y_ratio_raw = textContainerWidth / textContainerHeight;
let pixelRatioX = x_ratio_raw * window.devicePixelRatio;
let pixelRatioY = y_ratio_raw * window.devicePixelRatio;

// Vertex shader will be loaded from external file
let vertexShader;

// Preload the font before initializing
const fontLoader = new FontFace("Roobert", "url(./RoobertTRIAL-Regular.ttf)");

// Wait for the font to load before initializing
fontLoader
	.load()
	.then((font) => {
		document.fonts.add(font);
		console.log("Font loaded successfully");
		initApp();
	})
	.catch((err) => {
		console.error("Font loading error:", err);
		// Initialize anyway as fallback
		initApp();
	});

function initApp() {
	// Function to create canvas texture with text
	function createTextTexture(text, font, size, color = "#000", fontWeight = "100") {
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");

		const containerWidth = textContainer.clientWidth;
		const containerHeight = textContainer.clientHeight;

		// Set canvas size based on container and pixel ratio for crisp rendering
		const canvasWidth = containerWidth * pixelRatioX;
		const canvasHeight = containerHeight * pixelRatioY;
		canvas.width = canvasWidth;
		canvas.height = canvasHeight;

		// Set canvas background to be transparent
		ctx.fillStyle = "transparent";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// Parse the size parameter to handle both px and vw units
		let fontSize;

		// First try to use the data-text-size attribute
		if (textSize) {
			if (textSize.endsWith("vw")) {
				const vwValue = parseFloat(textSize);
				fontSize = (containerWidth * vwValue) / 100;
			} else if (textSize.endsWith("px")) {
				fontSize = parseFloat(textSize);
			} else {
				fontSize = parseFloat(textSize); // Assume pixels if no unit specified
			}
		}
		// If no data-text-size, use the computed CSS font size
		else {
			const computedStyle = window.getComputedStyle(textElement);
			const cssFontSize = computedStyle.fontSize;
			// Convert the computed size to pixels
			fontSize = parseFloat(cssFontSize);
		}

		// Scale the font size by pixel ratio for crisp rendering
		const scaledFontSize = fontSize * pixelRatioX;

		ctx.fillStyle = color;
		ctx.font = `normal ${scaledFontSize}px "Roobert", sans-serif`;
		console.log("Original font size:", fontSize, "Scaled font size:", scaledFontSize);
		console.log("Using font:", ctx.font);
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";

		ctx.imageSmoothingEnabled = true;
		ctx.imageSmoothingQuality = "high";

		const textMetrics = ctx.measureText(text);
		const textWidth = textMetrics.width;
		console.log("Text width:", textWidth, "Canvas width:", canvasWidth);

		// Calculate scale factor to ensure text fits with padding
		const desiredPadding = 0.0; // No padding
		const availableWidth = canvasWidth * (1 - desiredPadding * 2);
		let scaleFactor = Math.min(1, availableWidth / textWidth);

		const aspectCorrection = canvasWidth / canvasHeight;

		ctx.setTransform(scaleFactor, 0, 0, scaleFactor / aspectCorrection, canvasWidth / 2, canvasHeight / 2);

		ctx.fillText(text, 0, 0);

		return new THREE.CanvasTexture(canvas);
	}

	// Initialize the 3D scene
	function initializeScene(texture) {
		scene = new THREE.Scene();

		const aspectRatio = textContainer.clientWidth / textContainer.clientHeight;
		camera = new THREE.OrthographicCamera(-1, 1, 1 / aspectRatio, -1 / aspectRatio, 0.1, 1000);
		camera.position.z = 1;

		// Load both shaders from external files
		Promise.all([fetch("vertex.glsl").then((response) => response.text()), fetch("fragment.glsl").then((response) => response.text())])
			.then(([vertexShaderCode, fragmentShaderCode]) => {
				// Store the vertex shader code
				vertexShader = vertexShaderCode;

				// Create shader uniforms
				let shaderUniforms = {
					u_mouse: {type: "v2", value: new THREE.Vector2()},
					u_prevMouse: {type: "v2", value: new THREE.Vector2()},
					u_texture: {type: "t", value: texture},
				};

				planeMesh = new THREE.Mesh(
					new THREE.PlaneGeometry(2, 2),
					new THREE.ShaderMaterial({
						uniforms: shaderUniforms,
						vertexShader: vertexShaderCode,
						fragmentShader: fragmentShaderCode,
					})
				);

				scene.add(planeMesh);

				renderer = new THREE.WebGLRenderer({antialias: true});
				renderer.setClearColor(0xffffff, 1);
				renderer.setSize(textContainer.clientWidth, textContainer.clientHeight);
				renderer.setPixelRatio(2);

				textContainer.appendChild(renderer.domElement);

				// Start animation after everything is set up
				animateScene();
			})
			.catch((error) => {
				console.error("Error loading shaders:", error);
			});
	}

	function reloadTexture() {
		const newTexture = createTextTexture(expressionText, "Roobert", null, text_color, "100");
		if (planeMesh && planeMesh.material && planeMesh.material.uniforms) {
			planeMesh.material.uniforms.u_texture.value = newTexture;
		}
	}

	// Initialize with text texture
	initializeScene(createTextTexture(expressionText, "Roobert", null, text_color, "100"));

	// Animation loop
	function animateScene() {
		requestAnimationFrame(animateScene);

		mousePosition.x += (targetMousePosition.x - mousePosition.x) * easeFactor;
		mousePosition.y += (targetMousePosition.y - mousePosition.y) * easeFactor;

		if (planeMesh && planeMesh.material && planeMesh.material.uniforms) {
			planeMesh.material.uniforms.u_mouse.value.set(mousePosition.x, 1.0 - mousePosition.y);
			planeMesh.material.uniforms.u_prevMouse.value.set(prevPosition.x, 1.0 - prevPosition.y);
		}

		if (renderer && scene && camera) {
			renderer.render(scene, camera);
		}
	}

	// Event handlers for mouse movement
	window.addEventListener("mousemove", handleMouseMove);
	window.addEventListener("mouseenter", handleMouseEnter);
	window.addEventListener("mouseleave", handleMouseLeave);

	function handleMouseMove(event) {
		easeFactor = 0.045;
		let rect = textContainer.getBoundingClientRect();
		prevPosition = {...targetMousePosition};

		// Calculate position relative to window
		targetMousePosition.x = (event.clientX - rect.left) / rect.width;
		targetMousePosition.y = (event.clientY - rect.top) / rect.height;

		// Clamp values between 0 and 1
		targetMousePosition.x = Math.max(0, Math.min(1, targetMousePosition.x));
		targetMousePosition.y = Math.max(0, Math.min(1, targetMousePosition.y));
	}

	function handleMouseEnter(event) {
		easeFactor = 0.025;
		let rect = textContainer.getBoundingClientRect();

		// Calculate position relative to window
		mousePosition.x = targetMousePosition.x = (event.clientX - rect.left) / rect.width;
		mousePosition.y = targetMousePosition.y = (event.clientY - rect.top) / rect.height;

		// Clamp values between 0 and 1
		mousePosition.x = Math.max(0, Math.min(1, mousePosition.x));
		mousePosition.y = Math.max(0, Math.min(1, mousePosition.y));
	}

	function handleMouseLeave() {
		// Instead of resetting, keep tracking the mouse position
		easeFactor = 0.01; // Slower easing when outside the container
	}

	// Handle window resize
	window.addEventListener("resize", onWindowResize, false);

	function onWindowResize() {
		const aspectRatio = textContainer.clientWidth / textContainer.clientHeight;
		camera.left = -1;
		camera.right = 1;
		camera.top = 1 / aspectRatio;
		camera.bottom = -1 / aspectRatio;
		camera.updateProjectionMatrix();

		renderer.setSize(textContainer.clientWidth, textContainer.clientHeight);

		// Ensure the font size is maintained with vw units
		if (textSize) {
			textElement.style.setProperty("font-size", textSize);
		}

		reloadTexture();
	}
}
