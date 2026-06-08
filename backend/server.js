const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const db = require('./database');
require('dotenv').config();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// ============ AUTHENTICATION ============
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  console.log(`Login attempt received`);
  
  db.get(
    `SELECT id, email, role, fullname, is_premium, phone, dateOfBirth, profileImage FROM users
     WHERE email = ? AND password = ?`,
    [email, password],
    (err, user) => {
      if (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
        return;
      }
      
      if (user) {
        console.log(`✅ Login successful for user ID: ${user.id}`);
        res.json({ 
          success: true, 
          role: user.role,
          user: {
            id: user.id,
            email: user.email,
            fullname: user.fullname,
            role: user.role,
            is_premium: user.is_premium,
            phone: user.phone,
            dateOfBirth: user.dateOfBirth,
            profileImage: user.profileImage
          }
        });
      } else {
        console.log(`❌ Login failed - invalid credentials`);
        res.json({ success: false, message: 'Invalid email or password' });
      }
    }
  );
});

app.post('/api/register', (req, res) => {
  const { fullname, email, password, role, phone, dateOfBirth } = req.body;
  console.log(`Registration attempt: ${email}`);
  
  db.get("SELECT id FROM users WHERE email = ?", [email], (err, row) => {
    if (err) {
      console.error('Database error:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
      return;
    }
    
    if (row) {
      console.log(`❌ Registration failed: Email ${email} already exists`);
      res.json({ success: false, message: 'Email already exists. Please use a different email.' });
      return;
    }
    
    db.run(
      `INSERT INTO users (email, password, role, fullname, phone, dateOfBirth) VALUES (?, ?, ?, ?, ?, ?)`,
      [email, password, role || 'customer', fullname || email, phone || null, dateOfBirth || null],
      function(err) {
        if (err) {
          console.error('Error creating user:', err.message);
          res.status(500).json({ success: false, message: 'Error creating account' });
          return;
        }
        
        console.log(`✅ New user registered: ${email} (ID: ${this.lastID})`);
        res.json({ success: true, message: 'Account created successfully! Please login.', userId: this.lastID });
      }
    );
  });
});

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ image_url: `/uploads/${req.file.filename}` });
});

// ============ MOVIES CRUD ============
app.get('/api/movies', (req, res) => {
  db.all("SELECT * FROM movies ORDER BY id DESC", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/movies/:id', (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM movies WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Movie not found' });
      return;
    }
    res.json(row);
  });
});

app.post('/api/movies', (req, res) => {
  const { title, description, genre, stock, price_week, price_month, release_year, rating, image_url } = req.body;
  
  db.run(
    `INSERT INTO movies (title, description, genre, stock, price_week, price_month, release_year, rating, image_url) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, description, genre || 'Action', stock || 1, price_week || 9.99, price_month || 29.99, release_year, rating, image_url || null],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true, id: this.lastID, message: 'Movie added successfully' });
    }
  );
});

app.put('/api/movies/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, stock, price_week, price_month, release_year, rating, is_upcoming, is_free, image_url } = req.body;
  
  db.run(
    `UPDATE movies SET 
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      stock = COALESCE(?, stock),
      price_week = COALESCE(?, price_week),
      price_month = COALESCE(?, price_month),
      release_year = COALESCE(?, release_year),
      rating = COALESCE(?, rating),
      is_upcoming = COALESCE(?, is_upcoming),
      is_free = COALESCE(?, is_free),
      image_url = COALESCE(?, image_url)
     WHERE id = ?`,
    [title, description, stock, price_week, price_month, release_year, rating, is_upcoming, is_free, image_url, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Movie not found' });
        return;
      }
      res.json({ success: true, message: 'Movie updated successfully' });
    }
  );
});

app.delete('/api/movies/:id', (req, res) => {
  const { id } = req.params;
  
  db.run("DELETE FROM movies WHERE id = ?", [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Movie not found' });
      return;
    }
    res.json({ success: true, message: 'Movie deleted successfully' });
  });
});

// ============ RESERVATIONS API ============

// Add payment status columns (run once via separate script)

app.post('/api/reserve', (req, res) => {
  const { userId, movieId } = req.body;
  console.log('📝 Reserve request:', { userId, movieId });
  
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 48);
  
  db.run(
    `INSERT INTO reservations (user_id, movie_id, expires_at, status, payment_status) VALUES (?, ?, ?, ?, ?)`,
    [userId, movieId, expiresAt.toISOString(), 'active', 'pending'],
    function(err) {
      if (err) {
        console.error('Error creating reservation:', err.message);
        res.status(500).json({ success: false, message: 'Failed to create reservation' });
        return;
      }
      
      db.run(`UPDATE movies SET stock = stock - 1 WHERE id = ?`, [movieId]);
      
      res.json({ success: true, message: 'Movie reserved for 48 hours!', reservationId: this.lastID, expiresAt: expiresAt.toISOString() });
    }
  );
});

app.get('/api/reservations/:userId', (req, res) => {
  const { userId } = req.params;
  
  db.all(`
    SELECT r.*, m.title, m.image_url, m.price_week 
    FROM reservations r
    JOIN movies m ON r.movie_id = m.id
    WHERE r.user_id = ? AND r.status = 'active' AND datetime(r.expires_at) > datetime('now')
    ORDER BY r.reserved_at DESC
  `, [userId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/reservation/status/:id', (req, res) => {
  const { id } = req.params;
  
  db.get(`SELECT payment_status, payment_method FROM reservations WHERE id = ?`, [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row || { payment_status: 'pending', payment_method: null });
  });
});

app.post('/api/reservation/confirm-payment', (req, res) => {
  const { reservationId, paymentMethod } = req.body;
  
  db.run(`UPDATE reservations SET payment_status = 'paid', payment_method = ? WHERE id = ?`, [paymentMethod, reservationId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true, message: 'Payment confirmed!' });
  });
});

app.post('/api/reservation/mark-cash', (req, res) => {
  const { reservationId } = req.body;
  
  db.run(`UPDATE reservations SET payment_status = 'cash', payment_method = 'cash' WHERE id = ?`, [reservationId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true, message: 'Reservation marked for cash payment' });
  });
});

app.delete('/api/reservation/:id', (req, res) => {
  const { id } = req.params;
  
  db.get("SELECT movie_id FROM reservations WHERE id = ? AND status = 'active'", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (row) {
      db.run("UPDATE movies SET stock = stock + 1 WHERE id = ?", [row.movie_id]);
    }
    
    db.run("UPDATE reservations SET status = 'cancelled' WHERE id = ?", [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true, message: 'Reservation cancelled' });
    });
  });
});

// ============ ADMIN APIs ============
app.get('/api/users', (req, res) => {
  db.all("SELECT id, email, role, fullname, is_premium, phone, dateOfBirth, profileImage, created_at FROM users", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/admin/reservations', (req, res) => {
  db.all(`
    SELECT r.*, m.title, m.image_url, u.fullname as customer_name, u.email as customer_email
    FROM reservations r
    JOIN movies m ON r.movie_id = m.id
    JOIN users u ON r.user_id = u.id
    WHERE r.status = 'active' AND datetime(r.expires_at) > datetime('now')
    ORDER BY r.reserved_at DESC
  `, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/admin/rentals', (req, res) => {
  db.all(`
    SELECT r.*, m.title, m.image_url, u.fullname as customer_name, u.email as customer_email
    FROM rentals r
    JOIN movies m ON r.movie_id = m.id
    JOIN users u ON r.user_id = u.id
    WHERE r.status = 'active'
    ORDER BY r.created_at DESC
  `, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/admin/rentals/history', (req, res) => {
  db.all(`
    SELECT r.*, m.title, m.image_url, u.fullname as customer_name, u.email as customer_email
    FROM rentals r
    JOIN movies m ON r.movie_id = m.id
    JOIN users u ON r.user_id = u.id
    WHERE r.status = 'returned' OR r.status = 'completed' OR r.rental_type = 'purchase'
    ORDER BY r.created_at DESC
    LIMIT 50
  `, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/admin/reservations/:id/receive', (req, res) => {
  const { id } = req.params;
  const { rentalType } = req.body;
  
  db.get(`
    SELECT r.*, m.price_week, m.price_month, m.title, m.stock
    FROM reservations r
    JOIN movies m ON r.movie_id = m.id
    WHERE r.id = ? AND r.status = 'active'
  `, [id], (err, reservation) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!reservation) {
      res.status(404).json({ error: 'Reservation not found or already processed' });
      return;
    }
    
    const startDate = new Date();
    let endDate = new Date();
    let totalPrice = 0;
    let rental_type = rentalType;
    let status = 'active';
    
    if (rentalType === 'week') {
      endDate.setDate(endDate.getDate() + 7);
      totalPrice = reservation.price_week;
    } else if (rentalType === 'month') {
      endDate.setMonth(endDate.getMonth() + 1);
      totalPrice = reservation.price_month;
    } else if (rentalType === 'buy') {
      endDate = startDate;
      totalPrice = reservation.price_month * 2;
      rental_type = 'purchase';
      status = 'purchased';
    }
    
    db.run(`
      INSERT INTO rentals (user_id, movie_id, rental_type, start_date, end_date, status, total_price)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [reservation.user_id, reservation.movie_id, rental_type, startDate.toISOString(), endDate.toISOString(), status, totalPrice],
    function(err) {
      if (err) {
        console.error('Error creating record:', err.message);
        res.status(500).json({ error: err.message });
        return;
      }
      
      db.run(`UPDATE reservations SET status = 'completed' WHERE id = ?`, [id], (err) => {
        if (err) {
          console.error('Error updating reservation:', err.message);
        }
        
        res.json({ 
          success: true, 
          message: rentalType === 'buy' ? `"${reservation.title}" purchased successfully!` : `"${reservation.title}" rented successfully!`,
          rentalId: this.lastID,
          endDate: endDate.toISOString()
        });
      });
    });
  });
});

app.put('/api/admin/rentals/:id/return', (req, res) => {
  const { id } = req.params;
  
  db.get(`SELECT movie_id FROM rentals WHERE id = ? AND status = 'active'`, [id], (err, rental) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!rental) {
      res.status(404).json({ error: 'Rental not found or already returned' });
      return;
    }
    
    db.run(`UPDATE movies SET stock = stock + 1 WHERE id = ?`, [rental.movie_id]);
    
    db.run(`UPDATE rentals SET status = 'returned' WHERE id = ?`, [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      res.json({ success: true, message: 'Movie returned successfully!' });
    });
  });
});

app.get('/api/admin/customers/search', (req, res) => {
  const { q } = req.query;
  
  if (!q || q.length < 2) {
    res.json([]);
    return;
  }
  
  db.all(`
    SELECT id, fullname, email, is_premium, phone 
    FROM users 
    WHERE role = 'customer' AND (fullname LIKE ? OR email LIKE ?)
    LIMIT 10
  `, [`%${q}%`, `%${q}%`], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/admin/customers/:userId/reservations', (req, res) => {
  const { userId } = req.params;
  
  db.all(`
    SELECT r.*, m.title, m.image_url, m.price_week, m.price_month
    FROM reservations r
    JOIN movies m ON r.movie_id = m.id
    WHERE r.user_id = ? AND r.status = 'active' AND datetime(r.expires_at) > datetime('now')
    ORDER BY r.reserved_at DESC
  `, [userId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const { fullname, phone, dateOfBirth, role, password, profileImage } = req.body;
  
  let query = `UPDATE users SET 
    fullname = COALESCE(?, fullname),
    phone = COALESCE(?, phone),
    dateOfBirth = COALESCE(?, dateOfBirth)`;
  let params = [fullname, phone, dateOfBirth];
  
  if (profileImage) {
    query += `, profileImage = COALESCE(?, profileImage)`;
    params.push(profileImage);
  }
  
  if (role) {
    query += `, role = COALESCE(?, role)`;
    params.push(role);
  }
  
  if (password) {
    query += `, password = COALESCE(?, password)`;
    params.push(password);
  }
  
  query += ` WHERE id = ?`;
  params.push(id);
  
  db.run(query, params, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true, message: 'User updated successfully' });
  });
});

app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  
  db.get("SELECT role FROM users WHERE id = ?", [id], (err, user) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    if (user.role === 'admin') {
      res.status(400).json({ error: 'Cannot delete admin account' });
      return;
    }
    
    db.run("DELETE FROM users WHERE id = ?", [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true, message: 'User deleted successfully' });
    });
  });
});

app.get('/api/user/rentals/:userId', (req, res) => {
  const { userId } = req.params;
  
  db.all(`
    SELECT r.*, m.title, m.image_url 
    FROM rentals r
    JOIN movies m ON r.movie_id = m.id
    WHERE r.user_id = ?
    ORDER BY r.created_at DESC
  `, [userId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/admin/purchased', (req, res) => {
  db.all(`
    SELECT r.*, m.title, m.image_url, u.fullname as customer_name, u.email as customer_email
    FROM rentals r
    JOIN movies m ON r.movie_id = m.id
    JOIN users u ON r.user_id = u.id
    WHERE r.rental_type = 'purchase' OR r.status = 'purchased'
    ORDER BY r.created_at DESC
  `, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/upload-profile', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ image_url: `/uploads/${req.file.filename}` });
});

// ============ PREMIUM SUBSCRIPTION APIs ============

app.get('/api/premium/plans', (req, res) => {
  const plans = [
    { id: 'monthly', name: 'Monthly Premium', price: 9.99, duration: 30, description: 'Access to premium movies and features' },
    { id: 'yearly', name: 'Yearly Premium', price: 99.99, duration: 365, description: 'Best value - save 16%' }
  ];
  res.json(plans);
});

app.post('/api/premium/subscribe', (req, res) => {
  const { userId, planId, paymentMethod } = req.body;
  
  const plans = {
    monthly: { price: 9.99, duration: 30, name: 'Monthly' },
    yearly: { price: 99.99, duration: 365, name: 'Yearly' }
  };
  
  const plan = plans[planId];
  if (!plan) {
    res.status(400).json({ error: 'Invalid plan' });
    return;
  }
  
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + plan.duration);
  
  const invoiceNumber = `INV-${Date.now()}-${userId}`;
  
  db.run(`
    INSERT INTO premium_subscriptions (user_id, subscription_type, payment_method, payment_status, amount, start_date, end_date, invoice_number)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [userId, planId, paymentMethod, paymentMethod === 'online' ? 'paid' : 'pending', plan.price, startDate.toISOString(), endDate.toISOString(), invoiceNumber],
  function(err) {
    if (err) {
      console.error('Error creating subscription:', err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (paymentMethod === 'online') {
      db.run(`UPDATE users SET is_premium = 1, premium_expiry = ? WHERE id = ?`, [endDate.toISOString(), userId]);
    }
    
    res.json({ 
      success: true, 
      message: paymentMethod === 'online' ? 'Premium activated successfully!' : 'Subscription created. Please pay in store.',
      subscriptionId: this.lastID,
      invoiceNumber: invoiceNumber,
      endDate: endDate.toISOString()
    });
  });
});

app.get('/api/premium/status/:userId', (req, res) => {
  const { userId } = req.params;
  
  db.get(`SELECT is_premium, premium_expiry FROM users WHERE id = ?`, [userId], (err, user) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    db.all(`SELECT * FROM premium_subscriptions WHERE user_id = ? ORDER BY created_at DESC`, [userId], (err, subscriptions) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      res.json({
        is_premium: user?.is_premium || 0,
        premium_expiry: user?.premium_expiry,
        subscriptions: subscriptions
      });
    });
  });
});

app.get('/api/admin/premium-subscribers', (req, res) => {
  db.all(`
    SELECT ps.*, u.fullname, u.email, u.phone
    FROM premium_subscriptions ps
    JOIN users u ON ps.user_id = u.id
    ORDER BY ps.created_at DESC
  `, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.put('/api/admin/premium/:id/confirm-payment', (req, res) => {
  const { id } = req.params;
  
  db.get(`SELECT user_id, end_date FROM premium_subscriptions WHERE id = ?`, [id], (err, subscription) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!subscription) {
      res.status(404).json({ error: 'Subscription not found' });
      return;
    }
    
    db.run(`UPDATE premium_subscriptions SET payment_status = 'paid' WHERE id = ?`, [id], (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      db.run(`UPDATE users SET is_premium = 1, premium_expiry = ? WHERE id = ?`, [subscription.end_date, subscription.user_id], (err) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        res.json({ success: true, message: 'Payment confirmed, premium activated!' });
      });
    });
  });
});

// ============ RATING SYSTEM APIs ============

app.post('/api/ratings', (req, res) => {
  const { userId, movieId, rating, review } = req.body;
  
  db.run(`
    INSERT INTO ratings (user_id, movie_id, rating, review)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id, movie_id) DO UPDATE SET
      rating = excluded.rating,
      review = excluded.review,
      created_at = CURRENT_TIMESTAMP
  `, [userId, movieId, rating, review], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    db.get(`SELECT AVG(rating) as avg, COUNT(*) as total FROM ratings WHERE movie_id = ?`, [movieId], (err, result) => {
      if (err) {
        console.error('Error updating average:', err);
      } else {
        db.run(`UPDATE movies SET average_rating = ?, total_ratings = ? WHERE id = ?`, 
          [result.avg || 0, result.total || 0, movieId]);
      }
    });
    
    res.json({ success: true, message: 'Rating submitted successfully' });
  });
});

app.get('/api/movies/:id/ratings', (req, res) => {
  const { id } = req.params;
  
  db.get(`SELECT average_rating, total_ratings FROM movies WHERE id = ?`, [id], (err, movie) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    db.all(`SELECT rating, review, u.fullname, r.created_at 
            FROM ratings r 
            JOIN users u ON r.user_id = u.id 
            WHERE r.movie_id = ? 
            ORDER BY r.created_at DESC 
            LIMIT 10`, [id], (err, reviews) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ ...movie, reviews });
    });
  });
});

app.get('/api/user-rating/:userId/:movieId', (req, res) => {
  const { userId, movieId } = req.params;
  
  db.get(`SELECT rating, review FROM ratings WHERE user_id = ? AND movie_id = ?`, [userId, movieId], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row || { rating: null, review: null });
  });
});

// ============ STRIPE PAYMENT ============
app.post('/api/create-payment-intent', async (req, res) => {
  const { amount, currency = 'usd', customerEmail } = req.body;
  
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency,
      receipt_email: customerEmail,
      metadata: {
        customer_email: customerEmail,
      },
    });
    
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/create-checkout-session', async (req, res) => {
  const { reservationId, amount, movieTitle, userId, customerEmail } = req.body;
  
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: movieTitle,
              description: 'Movie reservation payment',
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://192.168.1.114:3000/payment-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://192.168.1.114:3000/payment-cancel.html`,
      customer_email: customerEmail,
      metadata: {
        reservationId: reservationId.toString(),
        userId: userId.toString(),
      },
    });
    
    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/confirm-payment', async (req, res) => {
  const { sessionId } = req.body;
  
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      const reservationId = session.metadata.reservationId;
      const userId = session.metadata.userId;
      
      db.run(`UPDATE reservations SET payment_status = 'paid', payment_method = 'online' WHERE id = ?`, [reservationId], (err) => {
        if (err) {
          console.error('Error updating reservation:', err);
          return res.json({ success: false, error: err.message });
        }
        
        res.json({ success: true, message: 'Payment confirmed!' });
      });
    } else {
      res.json({ success: false, message: 'Payment not completed' });
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.json({ success: false, error: error.message });
  }
});

// Mark reservation as received (removes from customer view)
app.put('/api/admin/reservations/:id/mark-received', (req, res) => {
  const { id } = req.params;
  
  db.run(`UPDATE reservations SET is_received = 1 WHERE id = ?`, [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true, message: 'Reservation marked as received' });
  });
});

// Create rental directly (for employee panel)
app.post('/api/rentals/create', (req, res) => {
  const { userId, movieId, rentalType, startDate, endDate, totalPrice, status } = req.body;
  
  db.run(`
    INSERT INTO rentals (user_id, movie_id, rental_type, start_date, end_date, status, total_price)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [userId, movieId, rentalType, startDate, endDate, status, totalPrice], function(err) {
    if (err) {
      console.error('Error creating rental:', err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true, rentalId: this.lastID });
  });
});

// ============ PUSH NOTIFICATION APIs ============

// Save push token
app.post('/api/save-push-token', (req, res) => {
  const { userId, pushToken } = req.body;
  
  db.run(`
    INSERT INTO push_tokens (user_id, token, created_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id, token) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
  `, [userId, pushToken], function(err) {
    if (err) {
      console.error('Error saving token:', err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true });
  });
});

// Send push notification to a specific user
async function sendPushNotification(userId, title, body, data = {}) {
  try {
    const tokens = await db.all(`SELECT token FROM push_tokens WHERE user_id = ?`, [userId]);
    
    for (const tokenRow of tokens) {
      const message = {
        to: tokenRow.token,
        sound: 'default',
        title: title,
        body: body,
        data: data,
      };
      
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
    }
    console.log(`📱 Notification sent to user ${userId}: ${title}`);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

// Test notification endpoint
app.post('/api/send-test-notification', async (req, res) => {
  const { userId } = req.body;
  await sendPushNotification(userId, '🎬 Test Notification', 'This is a test notification from Movie DB!');
  res.json({ success: true });
});

// Create push_tokens table
db.run(`
  CREATE TABLE IF NOT EXISTS push_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, token)
  )
`, (err) => {
  if (err) console.error('Error creating push_tokens table:', err.message);
  else console.log('✅ Push tokens table ready');
});

// Send notification to customer
app.post('/api/send-customer-notification', async (req, res) => {
  const { userId, title, body } = req.body;
  await sendPushNotification(userId, title, body);
  res.json({ success: true });
});


app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});