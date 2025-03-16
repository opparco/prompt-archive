"""
Library for extracting and parsing metadata from image files.
Designed to work with AI-generated images that contain prompt information.
"""

import re
import os
from typing import Dict, List, Optional, Any, Union, Tuple
from PIL import Image
import piexif
import piexif.helper

# Define supported file extensions as a constant
SUPPORTED_FILE_EXTENSIONS = ['.webp', '.png']

# Compile regex patterns for performance
EXTENSIONS_PATTERN = '|'.join(ext[1:] for ext in SUPPORTED_FILE_EXTENSIONS)  # extensions without dots
ID_SEED_PATTERN = re.compile(fr"(\d+)-(\d+)\.({EXTENSIONS_PATTERN})")

class MetadataExtractor:
    """
    Extracts and parses metadata from image files, specifically focused on
    AI-generated images with prompt information.
    """

    @staticmethod
    def read_info_from_image(im: Image.Image) -> str:
        """
        Extract raw metadata string from an image.
        
        Args:
            im: PIL Image object
            
        Returns:
            str: Raw metadata string or empty string if none found
        """
        items = (im.info or {}).copy()

        geninfo = items.pop('parameters', None)

        if "exif" in items:
            exif_data = items["exif"]
            try:
                exif = piexif.load(exif_data)
            except OSError:
                # memory / exif was not valid so piexif tried to read from a file
                exif = None
            exif_comment = (exif or {}).get("Exif", {}).get(piexif.ExifIFD.UserComment, b'')
            try:
                exif_comment = piexif.helper.UserComment.load(exif_comment)
            except ValueError:
                exif_comment = exif_comment.decode('utf8', errors="ignore")

            if exif_comment:
                geninfo = exif_comment
        elif "comment" in items:  # for gif
            geninfo = items["comment"].decode('utf8', errors="ignore")

        return geninfo or ""
    
    @staticmethod
    def extract_id_and_seed(filename: str) -> Tuple[Optional[int], Optional[int]]:
        """
        Extract ID and seed from filename based on the format "{id}-{seed}.ext".
        
        Args:
            filename: Name of the file
            
        Returns:
            Tuple of (ID, seed) or (None, None) if not found
        """
        match = ID_SEED_PATTERN.match(filename.lower())
        if match:
            return int(match.group(1)), int(match.group(2))
        return None, None
    
    @staticmethod
    def is_supported_file(filename: str) -> bool:
        """
        Check if the file has a supported extension.
        
        Args:
            filename: Name of the file
            
        Returns:
            bool: True if the file has a supported extension
        """
        ext = os.path.splitext(filename.lower())[1]
        return ext in SUPPORTED_FILE_EXTENSIONS
    
    @staticmethod
    def parse_metadata(raw_metadata: str) -> Dict[str, Any]:
        """
        Parse metadata string into structured format.
        
        Args:
            raw_metadata: Raw metadata string from image
            
        Returns:
            Dict containing parsed metadata
        """
        if not raw_metadata:
            return {
                "prompt": "",
                "prompt_words": [],
                "negative_prompt": "",
                "generation_params": {}
            }
            
        # Split parameters into lines
        lines = raw_metadata.splitlines()
        
        # Variables to store different parts of metadata
        prompt_lines = []
        negative_prompt_lines = []
        generation_params = {}
        
        # Parse parameters
        current_section = "prompt"  # Can be "prompt", "negative_prompt", or "params"
        
        for i, line in enumerate(lines):
            if line.startswith("Negative prompt:"):
                current_section = "negative_prompt"
                # Extract the negative prompt text from this line (if any)
                if len(line) > len("Negative prompt:"):
                    negative_text = line[len("Negative prompt:"):].strip()
                    if negative_text:
                        negative_prompt_lines.append(negative_text)
            elif current_section == "prompt":
                if line.strip():  # Only add non-empty lines
                    prompt_lines.append(line.strip())
            elif current_section == "negative_prompt":
                # Check if this line might be the start of generation parameters
                if line.strip() and any(param in line for param in ["Steps:", "Sampler:", "Seed:", "Size:", "Model:"]):
                    current_section = "params"
                    # Process this line as parameters
                    params = line.split(',')
                    for param in params:
                        param = param.strip()
                        if ":" in param:
                            key, value = param.split(':', 1)
                            generation_params[key.strip()] = value.strip()
                elif line.strip():  # This is still part of negative prompt
                    negative_prompt_lines.append(line.strip())
            elif current_section == "params":
                # Continue processing generation parameters
                params = line.split(',')
                for param in params:
                    param = param.strip()
                    if ":" in param:
                        key, value = param.split(':', 1)
                        generation_params[key.strip()] = value.strip()
        
        # Create the complete prompt and negative prompt text
        full_prompt = "\n".join(prompt_lines)
        full_negative_prompt = "\n".join(negative_prompt_lines)
        
        # Convert prompt into a list of words for search functionality
        prompt_words = []
        for line in prompt_lines:
            for word in re.split(r"[,]+", line):
                word = word.strip().lower()
                if word:
                    prompt_words.append(word)
        
        return {
            "prompt": full_prompt,
            "prompt_words": prompt_words,
            "negative_prompt": full_negative_prompt,
            "generation_params": generation_params
        }
    
    @classmethod
    def read_parameters(cls, filename: str) -> Dict[str, Any]:
        """
        Extract complete metadata from an image file.
        
        Args:
            filename: Path to the image file
            
        Returns:
            Dict containing structured metadata
        """
        try:
            with Image.open(filename) as im:
                raw_metadata = cls.read_info_from_image(im)
                parsed_data = cls.parse_metadata(raw_metadata)
                
                return {
                    "raw_metadata": raw_metadata,
                    **parsed_data
                }
        except Exception as e:
            print(f"Error reading {filename}: {e}")
        
        # Return empty structure if we couldn't read metadata
        return {
            "raw_metadata": "",
            "prompt": "",
            "prompt_words": [],
            "negative_prompt": "",
            "generation_params": {}
        }

# Convenience functions for direct use
def extract_id_and_seed(filename: str) -> Tuple[Optional[int], Optional[int]]:
    """Wrapper for MetadataExtractor.extract_id_and_seed"""
    return MetadataExtractor.extract_id_and_seed(filename)

def read_parameters(filename: str) -> Dict[str, Any]:
    """Wrapper for MetadataExtractor.read_parameters"""
    return MetadataExtractor.read_parameters(filename)

def parse_metadata(raw_metadata: str) -> Dict[str, Any]:
    """Wrapper for MetadataExtractor.parse_metadata"""
    return MetadataExtractor.parse_metadata(raw_metadata)

def read_info_from_image(im: Image.Image) -> str:
    """Wrapper for MetadataExtractor.read_info_from_image"""
    return MetadataExtractor.read_info_from_image(im)

def is_supported_file(filename: str) -> bool:
    """Wrapper for MetadataExtractor.is_supported_file"""
    return MetadataExtractor.is_supported_file(filename)

# For backward compatibility
def is_supported_image(filename: str) -> bool:
    """Alias for is_supported_file (deprecated)"""
    import warnings
    warnings.warn("is_supported_image is deprecated, use is_supported_file instead", DeprecationWarning, stacklevel=2)
    return is_supported_file(filename)
