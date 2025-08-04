/**
 * Uploads a file to the server
 * @param {File} file - The file to upload
 * @returns {Promise<Object>} The server response
 */
export async function UploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

/**
 * Invokes the Language Learning Model (LLM) with the given prompt
 * @param {string} prompt - The prompt to send to the LLM
 * @param {Object} options - Additional options for the LLM call
 * @returns {Promise<string>} The LLM's response
 */
export async function InvokeLLM(prompt, options = {}) {
  try {
    const response = await fetch('/api/llm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        ...options,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`LLM request failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error invoking LLM:', error);
    throw error;
  }
}

/**
 * Saves a note to the database
 * @param {Object} note - The note to save
 * @returns {Promise<Object>} The saved note with ID
 */
export async function SaveNote(note) {
  try {
    const response = await fetch('/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(note),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save note: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving note:', error);
    throw error;
  }
}

export default {
  UploadFile,
  InvokeLLM,
  SaveNote,
};
