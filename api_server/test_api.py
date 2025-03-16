"""
Test script for API server
Usage: python test_api.py <directory_path>
"""

import sys
import json
import requests
from pathlib import Path

API_BASE_URL = "http://localhost:5000/api"

def test_directories(path):
    """Test the directories listing endpoint"""
    print(f"\n--- Testing directories listing ({path}) ---")
    
    response = requests.get(f"{API_BASE_URL}/directories", params={"path": path})
    
    if response.status_code == 200:
        data = response.json()
        print(f"Current path: {data['current_path']}")
        print(f"WEBP files in current directory: {data['webp_files_in_current']}")
        print("Subdirectories:")
        
        for dir_info in data['directories']:
            print(f"  - {dir_info['name']} ({dir_info['webp_count']} WEBP files)")
            
        return True
    else:
        print(f"Error: {response.status_code} - {response.text}")
        return False

def test_groups(path):
    """Test the groups listing endpoint"""
    print(f"\n--- Testing groups listing ({path}) ---")
    
    response = requests.get(f"{API_BASE_URL}/groups", params={"directory": path})
    
    if response.status_code == 200:
        data = response.json()
        print(f"Total groups: {data['total_groups']}")
        
        for i, group in enumerate(data['groups']):
            print(f"\nGroup #{group['group_id']} ({len(group['images'])} images)")
            print(f"Prompt: {group['prompt'][:60]}..." if len(group['prompt']) > 60 else f"Prompt: {group['prompt']}")
            print(f"Negative prompt: {group['negative_prompt'][:60]}..." if len(group['negative_prompt']) > 60 else f"Negative prompt: {group['negative_prompt']}")
            print(f"Generation parameters count: {len(group['generation_params'])}")
            
            # Return the path of the first image (for use in the next test)
            if i == 0 and group['images']:
                return group['images'][0]['path']
        
        return None
    else:
        print(f"Error: {response.status_code} - {response.text}")
        return None

def test_metadata(path, image_path):
    """Test the metadata endpoint"""
    print(f"\n--- Testing metadata retrieval ({image_path}) ---")
    
    response = requests.get(f"{API_BASE_URL}/metadata/{image_path}", params={"directory": path})
    
    if response.status_code == 200:
        data = response.json()
        print(f"Filename: {data['filename']}")
        print(f"ID: {data['id']}")
        print(f"Seed: {data['seed']}")
        
        metadata = data['metadata']
        print(f"\nPrompt: {metadata['prompt'][:60]}..." if len(metadata['prompt']) > 60 else f"\nPrompt: {metadata['prompt']}")
        print(f"Negative prompt: {metadata['negative_prompt'][:60]}..." if len(metadata['negative_prompt']) > 60 else f"Negative prompt: {metadata['negative_prompt']}")
        
        print("\nGeneration parameters:")
        for key, value in metadata['generation_params'].items():
            print(f"  - {key}: {value}")
            
        return True
    else:
        print(f"Error: {response.status_code} - {response.text}")
        return False

def test_image(path, image_path):
    """Test the image retrieval endpoint"""
    print(f"\n--- Testing image retrieval ({image_path}) ---")
    
    response = requests.get(f"{API_BASE_URL}/images/{image_path}", params={"directory": path})
    
    if response.status_code == 200:
        print(f"Image retrieved successfully - Content-Type: {response.headers.get('Content-Type')}")
        print(f"Image size: {len(response.content)} bytes")
        return True
    else:
        print(f"Error: {response.status_code} - {response.text}")
        return False

def main():
    if len(sys.argv) < 2:
        print("Usage: python test_api.py <directory_path>")
        sys.exit(1)
        
    path = sys.argv[1]
    
    # if not Path(path).exists():
    #     print(f"Error: The specified path {path} does not exist.")
    #     sys.exit(1)
    
    print(f"Testing API server: {API_BASE_URL}")
    print(f"Target directory: {path}")
    
    # Test directories listing
    test_directories(path)
    
    # Test groups listing & get the first image path
    image_path = test_groups(path)
    
    if image_path:
        # Test metadata retrieval
        test_metadata(path, image_path)
        
        # Test image retrieval
        test_image(path, image_path)
    
    print("\nTests completed")

if __name__ == "__main__":
    main()
