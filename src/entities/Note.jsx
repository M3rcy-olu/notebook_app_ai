export class Note {
  static STORAGE_KEY = 'notability-notes';

  static _load() {
    try {
      const raw = localStorage.getItem(Note.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Failed to load notes', e);
      return [];
    }
  }

  static _save(notes) {
    localStorage.setItem(Note.STORAGE_KEY, JSON.stringify(notes));
  }

  static _sort(notes, sort) {
    if (!sort) return notes;
    const [order, field] = sort.startsWith('-') ? ['desc', sort.slice(1)] : ['asc', sort];
    return [...notes].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];
      if (aVal === bVal) return 0;
      if (order === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });
  }

  static list(sort) {
    const notes = Note._load();
    return Promise.resolve(Note._sort(notes, sort));
  }

  static get(id) {
    const notes = Note._load();
    const note = notes.find(n => n.id === id);
    return Promise.resolve(note);
  }

  static create(data) {
    const notes = Note._load();
    const newNote = { id: Date.now().toString(), ...data };
    notes.push(newNote);
    Note._save(notes);
    return Promise.resolve(newNote);
  }

  static update(id, data) {
    const notes = Note._load();
    const idx = notes.findIndex(n => n.id === id);
    if (idx !== -1) {
      notes[idx] = { ...notes[idx], ...data };
      Note._save(notes);
      return Promise.resolve(notes[idx]);
    }
    return Promise.reject(new Error('Note not found'));
  }

  static delete(id) {
    const notes = Note._load().filter(n => n.id !== id);
    Note._save(notes);
    return Promise.resolve();
  }
}
