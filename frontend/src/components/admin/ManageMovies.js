import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ManageMovies() {
  const [movies, setMovies] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: 'Action',
    stock: 1,
    price_week: 9.99,
    price_month: 29.99,
    release_year: new Date().getFullYear(),
    rating: '',
    image_url: ''
  });

  const genres = ['Action', 'Comedy', 'Drama', 'Romance', 'Thriller', 'Sci-Fi'];

  const fetchMovies = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/movies');
      setMovies(response.data);
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formDataImage = new FormData();
    formDataImage.append('image', file);

    try {
      const response = await axios.post('http://localhost:5000/api/upload', formDataImage, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setFormData({
        ...formData,
        image_url: response.data.image_url
      });
      setSelectedImage(URL.createObjectURL(file));
      alert('✅ Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('❌ Failed to upload image');
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post('http://localhost:5000/api/movies', formData);
      alert('✅ Movie added successfully!');
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        genre: 'Action',
        stock: 1,
        price_week: 9.99,
        price_month: 29.99,
        release_year: new Date().getFullYear(),
        rating: '',
        image_url: ''
      });
      setSelectedImage(null);
      fetchMovies();
    } catch (error) {
      console.error('Error adding movie:', error);
      alert('❌ Failed to add movie.');
    }
    setLoading(false);
  };

  const handleEdit = (movie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title,
      description: movie.description || '',
      genre: movie.genre || 'Action',
      stock: movie.stock,
      price_week: movie.price_week,
      price_month: movie.price_month,
      release_year: movie.release_year || new Date().getFullYear(),
      rating: movie.rating || '',
      image_url: movie.image_url || ''
    });
    if (movie.image_url) {
      setSelectedImage(`http://localhost:5000${movie.image_url}`);
    }
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.put(`http://localhost:5000/api/movies/${editingMovie.id}`, formData);
      alert('✅ Movie updated successfully!');
      setShowEditModal(false);
      setEditingMovie(null);
      setFormData({
        title: '',
        description: '',
        genre: 'Action',
        stock: 1,
        price_week: 9.99,
        price_month: 29.99,
        release_year: new Date().getFullYear(),
        rating: '',
        image_url: ''
      });
      setSelectedImage(null);
      fetchMovies();
    } catch (error) {
      console.error('Error updating movie:', error);
      alert('❌ Failed to update movie.');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      try {
        await axios.delete(`http://localhost:5000/api/movies/${id}`);
        alert('✅ Movie deleted successfully!');
        fetchMovies();
      } catch (error) {
        console.error('Error deleting movie:', error);
        alert('❌ Failed to delete movie.');
      }
    }
  };

  const handleIncreaseStock = async (movieId, currentStock) => {
    const newStock = currentStock + 1;
    try {
      await axios.put(`http://localhost:5000/api/movies/${movieId}`, { stock: newStock });
      alert('✅ Stock increased!');
      fetchMovies();
    } catch (error) {
      console.error('Error increasing stock:', error);
      alert('❌ Failed to increase stock');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>🎬 Manage Movies</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '❌ Cancel' : '+ Add New Movie'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-4 shadow-sm">
          <div className="card-header bg-primary text-white">
            <h4 className="mb-0">Add New Movie</h4>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Movie Title *</label>
                  <input
                    type="text"
                    name="title"
                    className="form-control"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Genre *</label>
                  <select
                    name="genre"
                    className="form-select"
                    value={formData.genre}
                    onChange={handleInputChange}
                    required
                  >
                    {genres.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Release Year</label>
                  <input
                    type="number"
                    name="release_year"
                    className="form-control"
                    value={formData.release_year}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Rating (0-10)</label>
                  <input
                    type="number"
                    name="rating"
                    className="form-control"
                    step="0.1"
                    value={formData.rating}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-12 mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    className="form-control"
                    rows="3"
                    value={formData.description}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
                
                <div className="col-12 mb-3">
                  <label className="form-label">Movie Poster Image</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  {uploading && <small className="text-muted">Uploading...</small>}
                  {selectedImage && (
                    <div className="mt-2">
                      <img src={selectedImage} alt="Preview" style={{ height: '100px', borderRadius: '5px' }} />
                      <small className="text-success ms-2">✅ Image ready</small>
                    </div>
                  )}
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label">Stock Quantity</label>
                  <input
                    type="number"
                    name="stock"
                    className="form-control"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Price (Week) $</label>
                  <input
                    type="number"
                    name="price_week"
                    className="form-control"
                    step="0.01"
                    value={formData.price_week}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Price (Month) $</label>
                  <input
                    type="number"
                    name="price_month"
                    className="form-control"
                    step="0.01"
                    value={formData.price_month}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <button 
                type="submit" 
                className="btn btn-success"
                disabled={loading || uploading}
              >
                {loading ? 'Adding...' : '➕ Add Movie'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="row">
        {movies.length === 0 ? (
          <div className="alert alert-info text-center">
            No movies yet. Click "Add New Movie" to add your first movie.
          </div>
        ) : (
          movies.map((movie) => (
            <div key={movie.id} className="col-md-4 mb-3">
              <div className="card shadow-sm">
                {movie.image_url && (
                  <img 
                    src={`http://localhost:5000${movie.image_url}`} 
                    className="card-img-top"
                    alt={movie.title}
                    style={{ height: '200px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <div className="card-body">
                  <h5 className="card-title">{movie.title}</h5>
                  <span className="badge bg-info mb-2">{movie.genre || 'Action'}</span>
                  <p className="card-text small text-muted mt-2">
                    {movie.description?.substring(0, 100)}...
                  </p>
                  <div className="mb-2">
                    <span className="badge bg-warning text-dark">⭐ {movie.rating || 'N/A'}</span>
                    <span className="badge bg-secondary ms-1">📅 {movie.release_year}</span>
                    <span className="badge bg-success ms-1">📀 Stock: {movie.stock}</span>
                  </div>
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-warning btn-sm flex-grow-1"
                      onClick={() => handleEdit(movie)}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      className="btn btn-success btn-sm"
                      onClick={() => handleIncreaseStock(movie.id, movie.stock)}
                      title="Increase Stock"
                    >
                      +1 Stock
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(movie.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingMovie && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-warning text-dark">
                <h5 className="modal-title">✏️ Edit Movie: {editingMovie.title}</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <form onSubmit={handleUpdate}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Movie Title *</label>
                      <input
                        type="text"
                        name="title"
                        className="form-control"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Genre *</label>
                      <select
                        name="genre"
                        className="form-select"
                        value={formData.genre}
                        onChange={handleInputChange}
                        required
                      >
                        {genres.map(genre => (
                          <option key={genre} value={genre}>{genre}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Release Year</label>
                      <input
                        type="number"
                        name="release_year"
                        className="form-control"
                        value={formData.release_year}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Rating (0-10)</label>
                      <input
                        type="number"
                        name="rating"
                        className="form-control"
                        step="0.1"
                        value={formData.rating}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label">Description</label>
                      <textarea
                        name="description"
                        className="form-control"
                        rows="3"
                        value={formData.description}
                        onChange={handleInputChange}
                      ></textarea>
                    </div>
                    
                    <div className="col-12 mb-3">
                      <label className="form-label">Movie Poster Image</label>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                      {formData.image_url && !selectedImage && (
                        <div className="mt-2">
                          <img src={`http://localhost:5000${formData.image_url}`} alt="Current" style={{ height: '100px', borderRadius: '5px' }} />
                          <small className="text-muted ms-2">Current image</small>
                        </div>
                      )}
                      {selectedImage && (
                        <div className="mt-2">
                          <img src={selectedImage} alt="Preview" style={{ height: '100px', borderRadius: '5px' }} />
                          <small className="text-success ms-2">✅ New image ready</small>
                        </div>
                      )}
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label">Stock Quantity</label>
                      <input
                        type="number"
                        name="stock"
                        className="form-control"
                        value={formData.stock}
                        onChange={handleInputChange}
                        min="0"
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Price (Week) $</label>
                      <input
                        type="number"
                        name="price_week"
                        className="form-control"
                        step="0.01"
                        value={formData.price_week}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Price (Month) $</label>
                      <input
                        type="number"
                        name="price_month"
                        className="form-control"
                        step="0.01"
                        value={formData.price_month}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-warning" disabled={loading}>
                    {loading ? 'Saving...' : '💾 Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageMovies;