# Prompt Archive - AI Image Generation Prompt Management App

This project is a web application that allows users to easily browse and manage prompts and parameters embedded in output image files from AI image generation tools such as Stable Diffusion WebUI.

## Features

- Display of prompt information embedded in WebP and PNG images
- Directory structure browsing
- Search functionality based on prompt content
- Grouping of consecutively generated images (automatic grouping by seed number)
- Detailed display of prompts, negative prompts, and generation parameters
- RPG-style user interface

## Architecture

The project is a React-based web application that communicates with the [prompt-vault](https://github.com/opparco/prompt-vault) API server to access and process image metadata.

## Setup Instructions

### Prerequisites

- Node.js 18.0 or higher
- npm/yarn

### Frontend Setup

1. Navigate to the project root directory.

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the API endpoint in your environment:
   ```bash
   cp .env.example .env
   # Edit .env with your API endpoint
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Access the application in your browser at `http://localhost:5173`.

## Usage

1. Select a directory you want to browse from the sidebar on the left.
2. Image thumbnails will be displayed in the gallery view.
3. Click on an image to view its prompt and generation parameters in detail.
4. Use the search bar at the top to search for specific keywords within prompts.

## Security

The application implements security features to prevent unauthorized access:
- API authentication and authorization
- Secure communication with the API server
- Input validation and sanitization

## Project Structure

### Frontend (React)

- `src/App.jsx` - Routing and main application structure
- `src/pages/RPGImageGallery.jsx` - Main gallery page
- `src/components/` - RPG-style UI elements and functional components
- `src/services/apiClient.js` - Service for communicating with the prompt-vault API

## Customization

- `src/components/RPGWindow.jsx` - Customize UI styles
- `src/services/apiClient.js` - Adjust API communication settings

## License

[MIT](LICENSE)

## Contributing

Please report bugs or feature requests through Issues. Pull requests are also welcome.

---

This application is designed to streamline your AI image generation workflow and make it easier to organize and reuse prompts.
