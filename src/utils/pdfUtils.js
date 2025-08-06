import { jsPDF } from 'jspdf';

/**
 * Converts a note to a PDF document
 * @param {Object} note - The note to convert to PDF
 * @returns {Blob} - The PDF as a Blob
 */
export const noteToPdf = (note) => {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Set document properties
  doc.setProperties({
    title: note.title || 'Untitled Note',
    subject: 'Exported Note',
    author: 'Notability App',
    keywords: 'note, export',
    creator: 'Notability App'
  });

  // Add title
  doc.setFontSize(22);
  doc.text(note.title || 'Untitled Note', 14, 22);
  
  // Add metadata
  doc.setFontSize(12);
  doc.setTextColor(100);
  
  if (note.created_date) {
    const createdDate = new Date(note.created_date).toLocaleString();
    doc.text(`Created: ${createdDate}`, 14, 32);
  }
  
  if (note.last_modified) {
    const modifiedDate = new Date(note.last_modified).toLocaleString();
    doc.text(`Last Modified: ${modifiedDate}`, 14, 38);
  }
  
  if (note.notebook) {
    doc.text(`Notebook: ${note.notebook}`, 14, 44);
  }
  
  // Add a line separator
  doc.setDrawColor(200);
  doc.setLineWidth(0.5);
  doc.line(14, 50, doc.internal.pageSize.width - 14, 50);
  
  // Add content
  doc.setTextColor(0);
  doc.setFontSize(12);
  
  // Check if content is an object (like from a rich text editor) or plain text
  let contentText = '';
  if (typeof note.content === 'string') {
    contentText = note.content;
  } else if (note.content && typeof note.content === 'object') {
    // Handle rich text content (simplified)
    contentText = Object.values(note.content).join('\n');
  }
  
  // Split the content into pages
  const pageHeight = doc.internal.pageSize.height - 60; // Leave some margin
  const splitText = doc.splitTextToSize(contentText, 180); // 180 is the max width
  
  let y = 60; // Start below the header
  
  // Add content with pagination
  for (let i = 0; i < splitText.length; i++) {
    if (y > pageHeight) {
      doc.addPage();
      y = 20; // Reset Y position for new page
    }
    doc.text(splitText[i], 14, y);
    y += 7; // Line height
  }
  
  // Convert to Blob for download
  const pdfBlob = doc.output('blob');
  return pdfBlob;
};

/**
 * Creates a filename for a note PDF
 * @param {Object} note - The note
 * @returns {string} - The filename
 */
export const getPdfFilename = (note) => {
  const title = (note.title || 'untitled_note')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, '')
    .trim()
    .replace(/\s+/g, '_');
  
  return `${title}.pdf`;
};
