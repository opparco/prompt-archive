# Image Grouping REST API Server

This project provides a REST API for grouping WebP images by consecutive seed numbers and extracting embedded metadata such as prompts and generation parameters.

## Components

- **webp_metadata_library.py**: A reusable library for extracting and parsing metadata from WebP images
- **api_server.py**: Flask-based REST API server that uses the library
- **test_api.py**: Script for testing the API endpoints

## Features

- Extract complete metadata from WebP files (prompts, negative prompts, generation parameters)
- Group files by consecutive seed numbers
- View directory structure and file counts
- RESTful API for accessing image data
- Optimized for AI-generated images with embedded prompt information
- Directory traversal protection with base directory enforcement

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/image-api-server.git
cd image-api-server
```

2. Install required packages:
```bash
pip install -r requirements.txt
```

## Usage

### Running the API Server

```bash
python api_server.py --base-dir /path/to/images --port 5000 --host 0.0.0.0 --debug
```

Options:
- `--base-dir`: Base directory containing images (required)
- `--port`: Port to run the server on (default: 5000)
- `--host`: Host to run the server on (default: 0.0.0.0)
- `--debug`: Run in debug mode (useful during development)

### Security Notes

The API server has built-in protection against directory traversal attacks:
- All paths are validated against the base directory
- Clients cannot access files outside the specified base directory
- Relative paths are automatically resolved to prevent path manipulation

### Testing the API

The `test_api.py` script allows you to test all API endpoints:

```bash
python test_api.py /relative/path/within/base-dir
```

Note: When testing, ensure the path argument is within the server's base directory.

### API Endpoints

#### Get Image Groups
```
GET /api/groups?directory={relative_path}
```
Returns all image groups in the specified directory (relative to base-dir).

#### Get Image
```
GET /api/images/{filepath}?directory={relative_path}
```
Serves an image file.

#### Get Image Metadata
```
GET /api/metadata/{filepath}?directory={relative_path}
```
Returns the metadata for a specific image.

#### List Directories
```
GET /api/directories?path={relative_path}
```
Lists available directories and WebP file counts.

### Using the Metadata Library Directly

You can use the metadata library independently in your own projects:

```python
from webp_metadata_library import read_parameters, extract_id_and_seed

# Extract metadata from an image
metadata = read_parameters('path/to/image.webp')
print(f"Prompt: {metadata['prompt']}")
print(f"Negative Prompt: {metadata['negative_prompt']}")
print(f"Generation Parameters: {metadata['generation_params']}")

# Extract ID and seed from filename
id, seed = extract_id_and_seed('1234-5678.webp')
print(f"ID: {id}, Seed: {seed}")
```

## React Client

This API is designed to work with a React + Vite client. See the API documentation for implementation examples.

## License

[MIT](LICENSE)
