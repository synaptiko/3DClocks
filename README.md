# [3D Clocks](https://synaptiko.github.io/3d-clocks/) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/synaptiko/3d-clocks/blob/master/LICENSE) [![Check code quality](https://github.com/synaptiko/3d-clocks/actions/workflows/check-code-quality.yml/badge.svg)](https://github.com/synaptiko/3d-clocks/actions/workflows/check-code-quality.yml)

This project creates a WebGL 3D visualization of clocks using Three.js and GLSL shaders. The visualization features multiple clocks with configurable count and camera angle interactions, which are rendered with a depth perspective and a smooth orbit control. The project is set up with Vite and makes use of the `volta` config for specifying Node and Yarn versions.

Additionally, this project is set up with a GitHub Actions workflow that automatically deploys the project to GitHub Pages.

The deployed project can be viewed at [https://synaptiko.github.io/3d-clocks/](https://synaptiko.github.io/3d-clocks/).

## Installation

1. Clone the repository:

```
git clone https://github.com/yourusername/3d-clocks.git
cd 3d-clocks
```

2. Install the dependencies:

```
yarn install
```

## Usage

- To run the project in development mode, use the following command:

```
yarn dev
```

- To format the code with Prettier and ESLint, use:

```
yarn format
```

- To check for linting and code style issues, use:

```
yarn lint
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
