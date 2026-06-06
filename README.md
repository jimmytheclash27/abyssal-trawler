# Abyssal Trawler - Livewell Tank Animation

3D fish swimming animation in a livewell tank using Three.js and WebGL.

## Features

- **3D Fish Model**: Animated textured mesh model
- **Realistic Swimming**: Lissajous curve-based swimming patterns with natural rotations
- **Dynamic Camera**: Rotating camera view around the tank
- **Tank Environment**: Immersive aquatic scene with lighting and fog effects
- **Interactive Controls**: Pause/play and speed controls

## Project Structure

```
├── index.html           # Main HTML entry point
├── package.json         # Project dependencies
├── vite.config.js       # Build configuration
├── src/
│   └── main.js          # Three.js scene and animation logic
└── assets/
    └── models/
        └── textured_mesh.glb  # 3D fish model
```

## Setup & Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser at `http://localhost:3000`

## Controls

- **Spacebar**: Pause/Play animation
- **Arrow Up**: Increase swim speed
- **Arrow Down**: Decrease swim speed

## Animation Details

The fish follows a Lissajous curve pattern that creates natural swimming movements:
- **Horizontal motion**: Figure-8 pattern
- **Vertical motion**: Bobbing up and down
- **Rotation**: Fish automatically orients toward direction of movement
- **Tail animation**: Subtle side-to-side tail fin motion

## Technologies

- **Three.js**: 3D graphics library
- **Vite**: Fast build tool and dev server
- **WebGL**: Hardware-accelerated 3D rendering