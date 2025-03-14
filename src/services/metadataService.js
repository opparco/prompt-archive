// In a real application, this would make API calls to your backend
// For now, we'll simulate this with local data

// Function to fetch all image metadata
export const fetchAllMetadata = async () => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real application, you would replace this with a fetch call:
    // const response = await fetch('/api/metadata');
    // return await response.json();
    
    return sampleData;
  } catch (error) {
    console.error('Error fetching metadata:', error);
    throw new Error('Failed to fetch metadata');
  }
};

// Function to search metadata
export const searchMetadata = async (query) => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // In a real application, you would replace this with a fetch call:
    // const response = await fetch(`/api/metadata/search?q=${encodeURIComponent(query)}`);
    // return await response.json();
    
    const lowerCaseQuery = query.toLowerCase();
    return sampleData.filter(item => 
      item.metadata.toLowerCase().includes(lowerCaseQuery)
    );
  } catch (error) {
    console.error('Error searching metadata:', error);
    throw new Error('Failed to search metadata');
  }
};

// Function to parse metadata string into structured format
export const parseMetadataString = (metadataString) => {
  if (!metadataString) return {};
  
  const result = {};
  
  // Split by commas that are not within quotes
  const parts = metadataString.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
  
  parts.forEach(part => {
    const colonIndex = part.indexOf(':');
    if (colonIndex > 0) {
      const key = part.substring(0, colonIndex).trim();
      const value = part.substring(colonIndex + 1).trim();
      
      // Remove quotes if present
      const cleanValue = value.startsWith('"') && value.endsWith('"') 
        ? value.substring(1, value.length - 1) 
        : value;
      
      result[key] = cleanValue;
    }
  });
  
  return result;
};

// Function to extract tags and keywords from metadata
export const extractKeywords = (metadata) => {
  const parsed = typeof metadata === 'string' 
    ? parseMetadataString(metadata)
    : metadata;
  
  const keywords = new Set();
  
  // Extract model name
  if (parsed.Model) {
    keywords.add(parsed.Model);
  }
  
  // Extract from prompt
  if (parsed.Prompt) {
    const promptWords = parsed.Prompt
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3) // Only words longer than 3 characters
      .slice(0, 10); // Limit to first 10 significant words
    
    promptWords.forEach(word => keywords.add(word));
  }
  
  // Add sampler
  if (parsed.Sampler) {
    keywords.add(parsed.Sampler);
  }
  
  return Array.from(keywords);
};

// Sample data structure (would come from your backend)
const sampleData = [
  {
    id: '1',
    imagePath: '/b/src/10000/10000.jpg',
    metadata: 'Steps: 20, Sampler: Euler a, CFG scale: 7, Seed: 1234567890, Size: 512x512, Model hash: abcdef123456, Model: stable_diffusion, Prompt: a beautiful landscape with mountains and lake, Negative prompt: bad quality, blurry'
  },
  {
    id: '2',
    imagePath: '/b/src/10001/10001.jpg',
    metadata: 'Steps: 25, Sampler: DPM++ 2M Karras, CFG scale: 8, Seed: 987654321, Size: 768x768, Model hash: 123abc456def, Model: deliberate_v2, Prompt: portrait of a woman with blue eyes, Negative prompt: deformed, ugly, bad anatomy'
  },
  {
    id: '3',
    imagePath: '/b/src/10002/10002.jpg',
    metadata: 'Steps: 30, Sampler: DDIM, CFG scale: 9, Seed: 555555555, Size: 1024x576, Model hash: 789xyz123abc, Model: dreamshaper_8, Prompt: futuristic city with flying cars and neon lights, Negative prompt: poor quality, low resolution'
  },
  {
    id: '4',
    imagePath: '/b/src/10003/10003.jpg',
    metadata: 'Steps: 40, Sampler: LMS, CFG scale: 7.5, Seed: 123123123, Size: 640x640, Model hash: def456xyz789, Model: realistic_vision_v3, Prompt: cat sitting on a window sill, sunshine, cozy, Negative prompt: cartoon, illustration, drawing'
  },
];
