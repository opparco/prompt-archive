# Image Grouping REST API Server

This project provides a REST API for grouping images (WebP, PNG, and other supported formats) by consecutive seed numbers and extracting embedded metadata such as prompts and generation parameters.

## Components

- **metadata_utils.py**: A reusable library for extracting and parsing metadata from supported image formats
- **api_server.py**: Flask-based REST API server that uses the library
- **test_api.py**: Script for testing the API endpoints

## Features

- Extract complete metadata from supported image formats (prompts, negative prompts, generation parameters)
- Group files by consecutive seed numbers
- View directory structure and file counts
- RESTful API for accessing image data
- Optimized for AI-generated images with embedded prompt information
- Directory traversal protection with base directory enforcement
- Easily extensible to support additional image formats by modifying a single constant
- Consistent image handling regardless of file format

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
Lists available directories and file counts for all supported image formats.

### Using the Metadata Library Directly

You can use the metadata library independently in your own projects:

```python
from metadata_utils import read_parameters, extract_id_and_seed, is_supported_file, SUPPORTED_FILE_EXTENSIONS

# Extract metadata from an image
metadata = read_parameters('path/to/image.webp')
print(f"Prompt: {metadata['prompt']}")
print(f"Negative Prompt: {metadata['negative_prompt']}")
print(f"Generation Parameters: {metadata['generation_params']}")

# Check what file extensions are supported
print(f"Supported file extensions: {', '.join(SUPPORTED_FILE_EXTENSIONS)}")

# Check if a file has a supported extension
if is_supported_file('image.png'):
    print("This file has a supported extension")

# Extract ID and seed from filename
id, seed = extract_id_and_seed('1234-5678.png')
print(f"ID: {id}, Seed: {seed}")
```

## Image Naming Convention

The server expects images to follow this naming convention:
`{id}-{seed}.ext`

Where:
- `id`: A numeric identifier
- `seed`: The generation seed (consecutive seeds will be grouped together)
- `ext`: File extension (currently supported: `.webp`, `.png`)

## Adding Support for Additional File Formats

To add support for additional image formats:

1. Open `metadata_utils.py`
2. Locate the `SUPPORTED_FILE_EXTENSIONS` constant at the top of the file
3. Add your new file extension to the list (e.g., `SUPPORTED_FILE_EXTENSIONS = ['.webp', '.png', '.jpg', '.jpeg']`)
4. That's it! The application will automatically handle the new format

## React Client

This API is designed to work with a React + Vite client. See the API documentation for implementation examples.

## License

[MIT](LICENSE)
