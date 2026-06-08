const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database file
const dbPath = path.join(__dirname, 'movie.db');
const db = new sqlite3.Database(dbPath);

// Create tables
db.serialize(() => {
  // Users table
  db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    fullname TEXT,
    phone TEXT,
    dateOfBirth DATE,
    is_premium INTEGER DEFAULT 0,
    premium_expiry DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating users table:', err.message);
    } else {
      console.log('✅ Users table ready');
      
      // Check if we have any users
      db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
        if (err) {
          console.error('Error checking users:', err.message);
          return;
        }
        
        if (row.count === 0) {
          console.log('📝 Adding default users...');
          
          db.run(
            "INSERT INTO users (email, password, role, fullname) VALUES (?, ?, ?, ?)",
            ['admin@movie.com', 'admin123', 'admin', 'System Admin'],
            (err) => {
              if (err) console.error('Error adding admin:', err.message);
              else console.log('✅ Admin user added');
            }
          );
          
          db.run(
            "INSERT INTO users (email, password, role, fullname) VALUES (?, ?, ?, ?)",
            ['employee@movie.com', 'employee123', 'employee', 'John Employee'],
            (err) => {
              if (err) console.error('Error adding employee:', err.message);
              else console.log('✅ Employee user added');
            }
          );
        } else {
          console.log(`✅ ${row.count} users already exist`);
        }
      });
    }
  });

  // Movies table
  db.run(`
   CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    genre TEXT DEFAULT 'Action',
    image_url TEXT,
    stock INTEGER DEFAULT 1,
    price_week DECIMAL(10,2) DEFAULT 9.99,
    price_month DECIMAL(10,2) DEFAULT 29.99,
    is_upcoming INTEGER DEFAULT 0,
    is_free INTEGER DEFAULT 0,
    release_year INTEGER,
    rating DECIMAL(3,1),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating movies table:', err.message);
    } else {
      console.log('✅ Movies table ready');
      
      // Check if movies exist (but NO sample movies added automatically)
      db.get("SELECT COUNT(*) as count FROM movies", (err, row) => {
        if (err) {
          console.error('Error checking movies:', err.message);
          return;
        }
        
        if (row.count === 0) {
          console.log('📝 No movies yet. Admin can add movies from dashboard.');
        } else {
          console.log(`✅ ${row.count} movies already exist`);
        }
      });
    }
  });
//////
// Reservations table (48-hour pickup window)
db.run(`
  CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    movie_id INTEGER NOT NULL,
    reserved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    status TEXT DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (movie_id) REFERENCES movies(id)
  )
`, (err) => {
  if (err) {
    console.error('❌ Error creating reservations table:', err.message);
  } else {
    console.log('✅ Reservations table ready');
  }
});

  // Rentals table
  db.run(`
    CREATE TABLE IF NOT EXISTS rentals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      movie_id INTEGER NOT NULL,
      rental_type TEXT CHECK(rental_type IN ('week', 'month')),
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      status TEXT DEFAULT 'active',
      total_price DECIMAL(10,2),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (movie_id) REFERENCES movies(id)
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating rentals table:', err.message);
    } else {
      console.log('✅ Rentals table ready');
    }
  });
});

module.exports = db;