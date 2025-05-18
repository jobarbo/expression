// Import Three.js from CDN
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.module.js";

// Setup variables
const textContainer = document.getElementById("textContainer");
let easeFactor = 0.02;
let scene, camera, renderer, planeMesh;
let mousePosition = {x: 0.5, y: 0.5};
let targetMousePosition = {x: 0.5, y: 0.5};
let prevPosition = {x: 0.5, y: 0.5};

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
	function createTextTexture(text, font, size, color, fontWeight = "100") {
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");

		const canvasWidth = window.innerWidth * 2;
		const canvasHeight = window.innerHeight * 2;

		canvas.width = canvasWidth;
		canvas.height = canvasHeight;

		// Set canvas background to white for high contrast
		ctx.fillStyle = color || "#ffffff";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// Make text size more prominent
		const fontSize = size || Math.floor(canvasWidth / 4);

		ctx.fillStyle = "#000000"; // Darker text for better contrast
		ctx.font = `bold ${fontSize}px "Roobert", sans-serif`;
		console.log("Using font:", ctx.font);
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";

		ctx.imageSmoothingEnabled = true;
		ctx.imageSmoothingQuality = "high";

		const textMetrics = ctx.measureText(text);
		const textWidth = textMetrics.width;
		console.log("Text width:", textWidth, "Canvas width:", canvasWidth);

		// Increase scale factor to make text larger
		const scaleFactor = Math.min(1.5, (canvasWidth * 0.8) / textWidth);
		const aspectCorrection = canvasWidth / canvasHeight;

		ctx.setTransform(scaleFactor, 0, 0, scaleFactor / aspectCorrection, canvasWidth / 2, canvasHeight / 2);

		ctx.strokeStyle = "#1a1a1a";
		ctx.lineWidth = fontSize * 0.005;
		for (let i = 0; i < 3; i++) {
			ctx.strokeText(text, 0, 0);
		}
		ctx.fillText(text, 0, 0);

		// For debugging - append canvas to document to see what's being drawn
		/*
		canvas.style.position = "fixed";
		canvas.style.top = "10px";
		canvas.style.left = "10px";
		canvas.style.zIndex = "1000";
		canvas.style.width = "300px";
		canvas.style.height = "150px";
		canvas.style.border = "1px solid red";
		document.body.appendChild(canvas);
		*/

		return new THREE.CanvasTexture(canvas);
	}

	// Initialize the 3D scene
	function initializeScene(texture) {
		scene = new THREE.Scene();

		const aspectRatio = window.innerWidth / window.innerHeight;
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
				renderer.setSize(window.innerWidth, window.innerHeight);
				renderer.setPixelRatio(window.devicePixelRatio);

				textContainer.appendChild(renderer.domElement);

				// Start animation after everything is set up
				animateScene();
			})
			.catch((error) => {
				console.error("Error loading shaders:", error);
			});
	}

	function reloadTexture() {
		const newTexture = createTextTexture("EXPRESSION", "Roobert", null, "#ffffff", "100");
		if (planeMesh && planeMesh.material && planeMesh.material.uniforms) {
			planeMesh.material.uniforms.u_texture.value = newTexture;
		}
	}

	// Initialize with text texture
	initializeScene(createTextTexture("EXPRESSION", "Roobert", null, "#ffffff", "100"));

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
	textContainer.addEventListener("mousemove", handleMouseMove);
	textContainer.addEventListener("mouseenter", handleMouseEnter);
	textContainer.addEventListener("mouseleave", handleMouseLeave);

	function handleMouseMove(event) {
		easeFactor = 0.035;
		let rect = textContainer.getBoundingClientRect();
		prevPosition = {...targetMousePosition};

		targetMousePosition.x = (event.clientX - rect.left) / rect.width;
		targetMousePosition.y = (event.clientY - rect.top) / rect.height;
	}

	function handleMouseEnter(event) {
		easeFactor = 0.01;
		let rect = textContainer.getBoundingClientRect();

		mousePosition.x = targetMousePosition.x = (event.clientX - rect.left) / rect.width;
		mousePosition.y = targetMousePosition.y = (event.clientY - rect.top) / rect.height;
	}

	function handleMouseLeave() {
		easeFactor = 0.01;
		targetMousePosition = {...prevPosition};
	}

	// Handle window resize
	window.addEventListener("resize", onWindowResize, false);

	function onWindowResize() {
		const aspectRatio = window.innerWidth / window.innerHeight;
		camera.left = -1;
		camera.right = 1;
		camera.top = 1 / aspectRatio;
		camera.bottom = -1 / aspectRatio;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth, window.innerHeight);

		reloadTexture();
	}
}
