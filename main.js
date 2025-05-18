// Import VFX from CDN with the correct URL
import {VFX} from "https://cdn.jsdelivr.net/npm/@vfx-js/core/+esm";

document.addEventListener("DOMContentLoaded", () => {
	// Initialize VFX instance
	const vfx = new VFX();

	// Get the title element
	const titleElement = document.getElementById("title");

	// Track animation state
	let currentAnimation = null;

	// Add pixelate effect with 0 initial intensity (no pixelation)
	const effect = vfx.add(titleElement, {
		shader: "pixelate",
		params: {
			pixelSize: 0, // Start with no pixelation
			amount: 1,
		},
	});

	// Add hover event listeners
	titleElement.addEventListener("mouseenter", () => {
		// Cancel any ongoing animation
		if (currentAnimation) {
			cancelAnimationFrame(currentAnimation);
		}

		// Animate pixelation on hover
		const duration = 400; // Animation duration in ms
		const startTime = Date.now();
		const startValue = effect.params.pixelSize || 0;
		const endValue = 12; // Final pixel size

		function animate() {
			const elapsed = Date.now() - startTime;
			const progress = Math.min(elapsed / duration, 1);
			const pixelSize = startValue + (endValue - startValue) * progress;

			// Update the effect parameter
			effect.params.pixelSize = pixelSize;

			if (progress < 1) {
				currentAnimation = requestAnimationFrame(animate);
			} else {
				currentAnimation = null;
			}
		}

		animate();
	});

	titleElement.addEventListener("mouseleave", () => {
		// Cancel any ongoing animation
		if (currentAnimation) {
			cancelAnimationFrame(currentAnimation);
		}

		// Animate back to normal
		const duration = 600; // Animation duration in ms
		const startTime = Date.now();
		const startValue = effect.params.pixelSize;
		const endValue = 0; // No pixelation

		function animate() {
			const elapsed = Date.now() - startTime;
			const progress = Math.min(elapsed / duration, 1);
			const pixelSize = startValue + (endValue - startValue) * progress;

			// Update the effect parameter
			effect.params.pixelSize = pixelSize;

			if (progress < 1) {
				currentAnimation = requestAnimationFrame(animate);
			} else {
				currentAnimation = null;
				// Force exact 0 value
				effect.params.pixelSize = 0;
			}
		}

		animate();
	});

	console.log("VFX-JS initialized with pixelate shader");
});
