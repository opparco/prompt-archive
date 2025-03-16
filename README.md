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

The project consists of two main components:

1. **Python REST API Server**:
   - Metadata extraction from image files
   - Directory structure provision
   - Image grouping processing

2. **React Frontend Application**:
   - User interface
   - API communication and data display
   - Search functionality implementation

## Setup Instructions

### Prerequisites

- Python 3.6 or higher
- Node.js 18.0 or higher
- npm/yarn

### API Server Setup

1. Navigate to the api_server directory:
   ```bash
   cd api_server
   ```

2. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the API server (specify the directory where your images are stored):
   ```bash
   python api_server.py --base-dir /path/to/your/images --port 5000
   ```
   
   Example: Using Stable Diffusion WebUI's default output directory:
   ```bash
   python api_server.py --base-dir C:/path/to/stable-diffusion-webui/outputs/txt2img-images
   ```

### Frontend Setup

1. Navigate to the project root directory.

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Access the application in your browser at `http://localhost:5173`.

## Usage

1. Select a directory you want to browse from the sidebar on the left.
2. Image thumbnails will be displayed in the gallery view.
3. Click on an image to view its prompt and generation parameters in detail.
4. Use the search bar at the top to search for specific keywords within prompts.

## Security

The API server implements security features to prevent directory traversal attacks:
- All paths are validated against the base directory
- Clients cannot access files outside the specified base directory
- Relative paths are automatically resolved to prevent path manipulation

## Project Structure

### API Server (Python)

- `api_server.py` - Main Flask server
- `metadata_utils.py` - Library for extracting and parsing image metadata

### Frontend (React)

- `src/App.jsx` - Routing and main application structure
- `src/pages/RPGImageGallery.jsx` - Main gallery page
- `src/components/` - RPG-style UI elements and functional components
- `src/services/apiClient.js` - Service for communicating with the REST API

## Customization

- `src/components/RPGWindow.jsx` - Customize UI styles
- `api_server.py` - Adjust server behavior and grouping logic

## License

[MIT](LICENSE)

## Contributing

Please report bugs or feature requests through Issues. Pull requests are also welcome.

---

This application is designed to streamline your AI image generation workflow and make it easier to organize and reuse prompts.
