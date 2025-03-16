import os
import re
from pathlib import Path
from PIL import Image
from flask import Flask, request, jsonify, send_from_directory, abort
from flask_cors import CORS

# Import the metadata extraction library
from metadata_utils import extract_id_and_seed, read_parameters, is_supported_file, SUPPORTED_FILE_EXTENSIONS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes to work with React app

# Base directory will be set during startup
BASE_DIR = None

def is_safe_path(base_dir, requested_path):
    """
    Check if the requested path is safe (not trying to escape base_dir).
    
    Args:
        base_dir: The base directory that should contain all accessible files
        requested_path: The path requested by the client
        
    Returns:
        bool: True if path is safe, False otherwise
    """
    # Convert to absolute paths
    base_dir_abs = os.path.abspath(base_dir)
    requested_path_abs = os.path.abspath(os.path.join(base_dir, requested_path))
    
    # Check if the requested path is within the base directory
    return requested_path_abs.startswith(base_dir_abs)

def search_images(directory):
    """
    Search images in the specified directory and group files by consecutive seeds.
    """
    # Validate directory is within BASE_DIR
    if not is_safe_path(BASE_DIR, directory):
        raise ValueError(f"Access denied: {directory} is outside the base directory")
    
    # Use the absolute path for file operations
    abs_directory = os.path.join(BASE_DIR, directory)
    
    groups = []
    current_group = []
    previous_seed = None

    for root, _, files in os.walk(abs_directory):
        files.sort()  # Ensure consistent processing order
        for file in files:
            # Check if the file has a supported extension
            if is_supported_file(file):
                filepath = os.path.join(root, file)
                
                # Extract id and seed
                file_id, seed = extract_id_and_seed(file)
                if file_id is not None and seed is not None:
                    if previous_seed is not None and seed != previous_seed + 1:
                        # Close the current group and start a new one
                        if current_group:
                            groups.append(current_group)
                        current_group = []
                    previous_seed = seed
                    current_group.append(filepath)
                else:
                    # If id or seed is invalid, treat it as a separate group
                    if current_group:
                        groups.append(current_group)
                    current_group = [filepath]

    if current_group:
        groups.append(current_group)

    # Create JSON serializable data structure
    result_groups = []
    for i, group in enumerate(groups):
        if group:
            first_image = group[0]
            metadata = read_parameters(first_image)
            
            # Extract filename and seed info for display
            group_info = []
            for path in group:
                filename = os.path.basename(path)
                file_id, seed = extract_id_and_seed(filename)
                # Get path relative to the actual directory (not BASE_DIR)
                rel_path = os.path.relpath(path, abs_directory)
                group_info.append({
                    "filename": filename,
                    "path": rel_path,
                    "id": file_id,
                    "seed": seed
                })
            
            result_groups.append({
                "group_id": i + 1,
                "images": group_info,
                "prompt": metadata["prompt"],
                "prompt_words": metadata["prompt_words"],
                "negative_prompt": metadata["negative_prompt"],
                "generation_params": metadata["generation_params"],
                "raw_metadata": metadata["raw_metadata"]
            })
    
    return result_groups

@app.route('/api/groups', methods=['GET'])
def get_groups():
    """Get all image groups"""
    directory = request.args.get('directory', '')
    search_term = request.args.get('search', '').lower()  # Get the search term
    
    try:
        groups = search_images(directory)
        
        # Filter groups if a search term is specified
        if search_term:
            filtered_groups = []
            for group in groups:
                # Search in prompt or negative prompt
                if (search_term in group['prompt'].lower() or 
                    search_term in group['negative_prompt'].lower()):
                    filtered_groups.append(group)
            groups = filtered_groups
            
        return jsonify({
            "total_groups": len(groups),
            "groups": groups
        })
    except ValueError as e:
        return jsonify({"error": str(e)}), 403
    except FileNotFoundError:
        return jsonify({"error": f"Directory not found: {directory}"}), 404
    except Exception as e:
        return jsonify({"error": f"Error processing request: {str(e)}"}), 500

@app.route('/api/images/<path:filepath>')
def serve_image(filepath):
    """Serve an image file"""
    directory = request.args.get('directory', '')
    
    # Create the full path relative to BASE_DIR
    dir_path = os.path.join(BASE_DIR, directory)
    full_path = os.path.join(dir_path, filepath)
    
    # Security check
    if not is_safe_path(BASE_DIR, os.path.join(directory, filepath)):
        return jsonify({"error": "Access denied"}), 403
    
    # Get the directory part and filename
    directory_part = os.path.dirname(full_path)
    filename = os.path.basename(filepath)
    
    if not os.path.exists(full_path):
        return jsonify({"error": "File not found"}), 404
    
    return send_from_directory(directory_part, filename)

@app.route('/api/metadata/<path:filepath>')
def get_image_metadata(filepath):
    """Get metadata for a specific image"""
    directory = request.args.get('directory', '')
    
    # Create the full path relative to BASE_DIR
    dir_path = os.path.join(BASE_DIR, directory)
    full_path = os.path.join(dir_path, filepath)
    
    # Security check
    if not is_safe_path(BASE_DIR, os.path.join(directory, filepath)):
        return jsonify({"error": "Access denied"}), 403
    
    if not os.path.exists(full_path):
        return jsonify({"error": "File not found"}), 404
    
    metadata = read_parameters(full_path)
    filename = os.path.basename(filepath)
    file_id, seed = extract_id_and_seed(filename)
    
    return jsonify({
        "filename": filename,
        "id": file_id,
        "seed": seed,
        "metadata": metadata
    })

@app.route('/api/directories', methods=['GET'])
def list_directories():
    """List available directories"""
    relative_path = request.args.get('path', '')
    
    # Create absolute path, ensuring it's within BASE_DIR
    abs_path = os.path.join(BASE_DIR, relative_path)
    
    # Security check
    if not is_safe_path(BASE_DIR, relative_path):
        return jsonify({"error": "Access denied"}), 403
    
    if not os.path.exists(abs_path):
        return jsonify({"error": "Path not found"}), 404
        
    try:
        directories = []
        total_images = 0
        
        for item in os.listdir(abs_path):
            item_path = os.path.join(abs_path, item)
            if os.path.isdir(item_path):
                # Count supported image files in this directory
                try:
                    # Count total supported files
                    dir_total = sum(1 for _ in os.listdir(item_path) if is_supported_file(_))
                    
                    # Calculate path relative to BASE_DIR for client use
                    rel_to_base = os.path.relpath(item_path, BASE_DIR)
                    
                    dir_info = {
                        "name": item,
                        "path": rel_to_base,
                        "total_images": dir_total
                    }
                    
                    directories.append(dir_info)
                except PermissionError:
                    # Skip directories we can't access
                    continue
            else:
                # Check if this file has a supported extension
                if is_supported_file(item):
                    total_images += 1
        
        # Calculate relative path for response
        rel_to_base = os.path.relpath(abs_path, BASE_DIR) if abs_path != BASE_DIR else ""
                
        # Build response
        response = {
            "current_path": rel_to_base,
            "directories": directories,
            "total_images_in_current": total_images
        }
            
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description="Image Grouping REST API Server")
    parser.add_argument("--port", type=int, default=5000, help="Port to run the server on")
    parser.add_argument("--host", default="0.0.0.0", help="Host to run the server on")
    parser.add_argument("--base-dir", required=True, help="Base directory for serving images (required)")
    parser.add_argument("--debug", action="store_true", help="Run in debug mode")
    args = parser.parse_args()
    
    # Set global BASE_DIR
    BASE_DIR = os.path.abspath(args.base_dir)
    if not os.path.exists(BASE_DIR):
        print(f"Error: Base directory '{BASE_DIR}' does not exist")
        exit(1)
    
    print(f"Starting server on http://{args.host}:{args.port}")
    print(f"Base directory: {BASE_DIR}")
    print(f"Supported file extensions: {', '.join(SUPPORTED_FILE_EXTENSIONS)}")
    app.run(host=args.host, port=args.port, debug=args.debug)
