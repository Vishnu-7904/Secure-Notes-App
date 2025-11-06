// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

function DashboardPage() {
  const navigate = useNavigate();
  
  // State for user data
  const [userEmail, setUserEmail] = useState('');
  
  // State for notes
  const [notes, setNotes] = useState([]); // All notes from API
  const [filteredNotes, setFilteredNotes] = useState([]); // Notes to display
  const [searchTerm, setSearchTerm] = useState(''); // For search bar
  
  // State for forms
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  // State for editing a note
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  // 1. Load data on page mount
  useEffect(() => {
    fetchProfile();
    fetchNotes();
  }, []);

  // 2. Filter notes whenever 'notes' or 'searchTerm' changes
  useEffect(() => {
    setFilteredNotes(
      notes.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [notes, searchTerm]);

  // --- API FUNCTIONS ---

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile');
      setUserEmail(response.data.email);
    } catch (err) { console.error(err); }
  };

  const fetchNotes = async () => {
    try {
      const response = await api.get('/notes');
      setNotes(response.data);
    } catch (err) {
      setError('Failed to fetch notes');
      console.error(err);
    }
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      setError('Title and content are required.');
      return;
    }
    try {
      await api.post('/notes', { title, content });
      setTitle('');
      setContent('');
      setError('');
      fetchNotes(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to create note');
      console.error(err);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await api.delete(`/notes/${noteId}`);
      fetchNotes(); // Refresh list
    } catch (err) {
      setError('Failed to delete note');
      console.error(err);
    }
  };

  // --- EDITING FUNCTIONS ---

  // Called when "Edit" button is clicked
  const startEditing = (note) => {
    setEditingNoteId(note._id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  // Called when "Cancel" is clicked
  const cancelEditing = () => {
    setEditingNoteId(null);
    setEditTitle('');
    setEditContent('');
  };

  // Called when "Save" is clicked
  const handleUpdateNote = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/notes/${editingNoteId}`, { title: editTitle, content: editContent });
      cancelEditing();
      fetchNotes();
    } catch (err) {
      setError('Failed to update note');
      console.error(err);
    }
  };

  // --- LOGOUT ---

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // --- RENDER ---

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 bg-white p-4 rounded shadow">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600">Welcome, {userEmail}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 mt-4 md:mt-0 font-bold text-white bg-red-600 rounded hover:bg-red-700 self-start md:self-auto"
          >
            Log Out
          </button>
        </div>

        {/* Create Note Form */}
        <div className="p-6 mb-8 bg-white rounded shadow-md">
          <h2 className="text-2xl font-bold mb-4">Create a New Note</h2>
          <form onSubmit={handleCreateNote} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 mt-1 border rounded shadow-sm focus:outline-none focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 mt-1 border rounded shadow-sm focus:outline-none focus:ring-indigo-500"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              className="px-4 py-2 font-bold text-white bg-indigo-600 rounded hover:bg-indigo-700"
            >
              Add Note
            </button>
          </form>
        </div>

        {/* Search and Notes List */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Notes</h2>
          
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 mb-4 border rounded shadow-sm focus:outline-none focus:ring-indigo-500"
          />

          {/* Notes List */}
          <div className="space-y-4">
            {filteredNotes.length === 0 ? (
              <p className="text-gray-500">
                {notes.length === 0 ? "You haven't created any notes yet." : "No notes match your search."}
              </p>
            ) : (
              filteredNotes.map((note) => (
                <div key={note._id} className="p-4 bg-white rounded shadow-md">
                  
                  {/* --- This is the Edit Form --- */}
                  {editingNoteId === note._id ? (
                    <form onSubmit={handleUpdateNote}>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full text-xl font-semibold mb-2 p-2 border rounded"
                      />
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full mt-2 p-2 text-gray-700 border rounded"
                        rows="4"
                      />
                      <div className="mt-4 space-x-2">
                        <button type="submit" className="px-3 py-1 text-sm text-white bg-green-500 rounded hover:bg-green-600">Save</button>
                        <button type="button" onClick={cancelEditing} className="px-3 py-1 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
                      </div>
                    </form>
                  ) : (
                    
                    /* --- This is the Note Display --- */
                    <div>
                      <h3 className="text-xl font-semibold">{note.title}</h3>
                      <p className="mt-2 text-gray-700 whitespace-pre-wrap">{note.content}</p>
                      <div className="mt-4 space-x-2">
                        <button
                          onClick={() => startEditing(note)}
                          className="px-3 py-1 text-sm font-medium text-white bg-yellow-500 rounded hover:bg-yellow-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note._id)}
                          className="px-3 py-1 text-sm font-medium text-white bg-red-500 rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;