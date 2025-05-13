# Text Pixelation Shader

A simple demo that applies a pixelation effect on text when hovering over it with your mouse. The effect creates a circular pixelated area around the mouse cursor.

## Features

- WebGL shader-based pixelation effect
- Responsive design
- The pixelation intensity increases closer to the mouse cursor
- Works with any text content
- Clean separation of shader code into separate files

## File Structure

- `index.html` - Main HTML file
- `shader.js` - JavaScript that initializes WebGL and handles effects
- `vertex.glsl` - Vertex shader code
- `fragment.glsl` - Fragment shader code with the pixelation effect

## How It Works

The demo uses WebGL shaders to create the pixelation effect:

1. An HTML5 canvas is placed over the text element
2. The text is rendered to a texture
3. A fragment shader applies the pixelation effect around the mouse position
4. The effect radius and pixel size can be customized

## Usage

Simply open `index.html` in a modern web browser and hover over the text to see the pixelation effect in action.

## Customization

You can adjust the effect by modifying these parameters in the `shader.js` file:

- `uPixelationRadius`: Controls the size of the affected area (in pixels)
- `uPixelSize`: Controls the size of the pixelation blocks

Or you can directly edit the fragment shader in `fragment.glsl` to achieve more complex effects.

## Requirements

- A modern web browser with WebGL support
- A web server to serve the files (due to fetch API usage)

## Local Development

Due to browser security restrictions, you'll need to serve these files from a local web server rather than opening the HTML file directly. You can use:

```
python3 -m http.server
```

Or any other simple local server.

## License

MIT
