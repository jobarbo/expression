// p5.js implementation of text distortion effect
let myShader;
let textGraphics;
let expressionText;
let fontRegular;
let mousePos = {x: 0.5, y: 0.5};
let prevMousePos = {x: 0.5, y: 0.5};
let targetMousePos = {x: 0.5, y: 0.5};
let easeFactor = 0.02;
let canvas;
let vertShader;
let fragShader;

function preload() {
	// Preload the font and shader files
	fontRegular = loadFont("./RoobertTRIAL-Regular.ttf");
	vertShader = loadStrings("vertex.glsl");
	fragShader = loadStrings("fragment.glsl");
}

function setup() {
	// Get the text container element for dimensions
	const textContainer = document.querySelector("[data-expression-container]");
	expressionText = document.querySelector("[data-expression-text]").textContent;

	// Create canvas with the container dimensions
	canvas = createCanvas(textContainer.offsetWidth, textContainer.offsetHeight, WEBGL);
	canvas.parent(textContainer);

	// Set pixel density to match display
	pixelDensity(window.devicePixelRatio);

	// Create the shader using external files
	myShader = createShader(vertShader.join("\n"), fragShader.join("\n"));

	// Create text texture
	updateTextTexture();

	// Set initial mouse position
	mousePos = {x: 0.5, y: 0.5};
	prevMousePos = {x: 0.5, y: 0.5};
	targetMousePos = {x: 0.5, y: 0.5};
}

function draw() {
	// Set background
	background(12, 10);

	// Update mouse position with easing
	mousePos.x += (targetMousePos.x - mousePos.x) * easeFactor;
	mousePos.y += (targetMousePos.y - mousePos.y) * easeFactor;

	// Apply the shader
	shader(myShader);

	// Set shader uniforms
	myShader.setUniform("u_texture", textGraphics);
	myShader.setUniform("u_mouse", [mousePos.x, mousePos.y]);
	myShader.setUniform("u_prevMouse", [prevMousePos.x, prevMousePos.y]);
	myShader.setUniform("u_resolution", [width, height]);

	// Draw a rectangle covering the entire canvas
	push();
	translate(0, 0, 0);
	plane(width, height);
	pop();

	// Store current position for next frame
	prevMousePos = {...mousePos};
}

function updateTextTexture() {
	// Create an offscreen graphics buffer for the text
	textGraphics = createGraphics(width, height, P2D);
	textGraphics.pixelDensity(pixelDensity());
	textGraphics.clear();
	textGraphics.background(120, 11);

	// Set text style
	textGraphics.textFont(fontRegular);

	// Start with a large font size
	let fontSize = width;
	textGraphics.textSize(fontSize);

	// Measure text width and adjust size to fit canvas width
	let textWidth = textGraphics.textWidth(expressionText);
	let scaleFactor = (width / textWidth) * 1; // Full canvas width
	fontSize *= scaleFactor;

	// Apply the calculated font size
	textGraphics.textSize(fontSize);

	// Center the text
	textGraphics.textAlign(CENTER, CENTER);

	// Draw the text
	textGraphics.fill(0); // Black text
	textGraphics.text(expressionText, width / 2, height / 2.6);
}

function mouseMoved() {
	easeFactor = 0.1;

	// Convert mouse coordinates to normalized values (0 to 1)
	prevMousePos = {...targetMousePos};

	targetMousePos.x = mouseX / width;
	targetMousePos.y = mouseY / height;

	// Constrain values between 0 and 1
	targetMousePos.x = constrain(targetMousePos.x, 0, 1);
	targetMousePos.y = constrain(targetMousePos.y, 0, 1);

	return false; // Prevent default
}

function windowResized() {
	const textContainer = document.querySelector("[data-expression-container]");
	resizeCanvas(textContainer.offsetWidth, textContainer.offsetHeight);
	updateTextTexture();
}
