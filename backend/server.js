const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config({ path: './config.env' });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'payment_gateway',
  port: process.env.DB_PORT || 3306
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.message);
    return;
  }
  console.log('✅ MySQL connected successfully');
  
  // Create database if not exists
  db.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'payment_gateway'}`, (err) => {
    if (err) {
      console.error('❌ Database creation failed:', err.message);
      return;
    }
    console.log('✅ Database ready');
    
    // Use the database
    db.query(`USE ${process.env.DB_NAME || 'payment_gateway'}`, (err) => {
      if (err) {
        console.error('❌ Database selection failed:', err.message);
        return;
      }
      
      // Create tables
      createTables();
    });
  });
});

// Create tables function
function createTables() {
  // BIS Forms table
  const createBisFormsTable = `
    CREATE TABLE IF NOT EXISTS bis_forms (
      id INT AUTO_INCREMENT PRIMARY KEY,
      form_id VARCHAR(255) NOT NULL UNIQUE,
      existing_registration_certificate VARCHAR(255) COMMENT 'File name of uploaded certificate',
      file_type VARCHAR(100) COMMENT 'MIME type of uploaded file (e.g., application/pdf, image/jpeg)',
      file_path VARCHAR(500) COMMENT 'Storage path of uploaded file',
      username VARCHAR(255) NOT NULL COMMENT 'User name from BIS form',
      password VARCHAR(255) COMMENT 'Password from BIS form',
      comment TEXT COMMENT 'User comments from BIS form',
      status ENUM('pending', 'submitted', 'approved', 'rejected') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  // Receipts table
  const createReceiptsTable = `
    CREATE TABLE IF NOT EXISTS receipts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      receipt_id VARCHAR(255) NOT NULL UNIQUE,
      bis_form_id INT,
      username VARCHAR(255) NOT NULL,
      form_id VARCHAR(255) NOT NULL,
      total_fee DECIMAL(10,2) NOT NULL,
      paid_amount DECIMAL(10,2) NOT NULL,
      balance_amount DECIMAL(10,2) NOT NULL,
      payment_mode VARCHAR(50),
      gst_type VARCHAR(50),
      ip_address VARCHAR(45),
      receipt_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (bis_form_id) REFERENCES bis_forms(id) ON DELETE SET NULL
    )
  `;

  db.query(createBisFormsTable, (err) => {
    if (err) {
      console.error('❌ BIS forms table creation failed:', err.message);
      return;
    }
    console.log('✅ BIS forms table created');
    
    db.query(createReceiptsTable, (err) => {
      if (err) {
        console.error('❌ Receipts table creation failed:', err.message);
        return;
      }
      console.log('✅ Receipts table created');
      console.log('🎉 All tables ready!');
    });
  });
}

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Store BIS form data
app.post('/api/bis-form', (req, res) => {
  const { username, password, fileName, fileType, filePath, comment } = req.body;
  const formId = `BIS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Debug logging
  console.log('📝 BIS Form Submission Debug:');
  console.log('  - Username:', username);
  console.log('  - File Name:', fileName);
  console.log('  - File Type:', fileType);
  console.log('  - File Path:', filePath);
  console.log('  - Comment:', comment);

  const query = `
    INSERT INTO bis_forms (form_id, existing_registration_certificate, file_type, file_path, username, password, comment, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'submitted')
  `;

  db.query(query, [formId, fileName, fileType, filePath, username, password, comment], (err, result) => {
    if (err) {
      console.error('❌ BIS form save error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to save BIS form',
        error: err.message
      });
    }

    console.log('✅ BIS form saved successfully with ID:', result.insertId);
    console.log('  - Form ID:', formId);
    console.log('  - File Type stored:', fileType);

    res.status(201).json({
      success: true,
      message: 'BIS form saved successfully',
      data: {
        formId: formId,
        bisFormId: result.insertId,
        username: username
      }
    });
  });
});

// Get BIS form by ID
app.get('/api/bis-form/:formId', (req, res) => {
  const { formId } = req.params;

  const query = 'SELECT * FROM bis_forms WHERE form_id = ?';
  
  db.query(query, [formId], (err, results) => {
    if (err) {
      console.error('❌ BIS form fetch error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch BIS form',
        error: err.message
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'BIS form not found'
      });
    }

    res.json({
      success: true,
      data: results[0]
    });
  });
});

// Store receipt data
app.post('/api/receipt', (req, res) => {
  const { 
    bisFormId, 
    username, 
    formId, 
    totalFee, 
    paidAmount, 
    balanceAmount, 
    paymentMode, 
    gstType, 
    ipAddress 
  } = req.body;
  
  const receiptId = `REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const query = `
    INSERT INTO receipts (receipt_id, bis_form_id, username, form_id, total_fee, paid_amount, balance_amount, payment_mode, gst_type, ip_address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [
    receiptId, 
    bisFormId, 
    username, 
    formId, 
    totalFee, 
    paidAmount, 
    balanceAmount, 
    paymentMode, 
    gstType, 
    ipAddress
  ], (err, result) => {
    if (err) {
      console.error('❌ Receipt save error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to save receipt',
        error: err.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Receipt saved successfully',
      data: {
        receiptId: receiptId,
        receiptDbId: result.insertId,
        username: username,
        formId: formId
      }
    });
  });
});

// Get receipt by ID
app.get('/api/receipt/:receiptId', (req, res) => {
  const { receiptId } = req.params;

  const query = 'SELECT * FROM receipts WHERE receipt_id = ?';
  
  db.query(query, [receiptId], (err, results) => {
    if (err) {
      console.error('❌ Receipt fetch error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch receipt',
        error: err.message
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    res.json({
      success: true,
      data: results[0]
    });
  });
});

// Get all BIS forms
app.get('/api/bis-forms', (req, res) => {
  const query = 'SELECT * FROM bis_forms ORDER BY created_at DESC';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ BIS forms fetch error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch BIS forms',
        error: err.message
      });
    }

    res.json({
      success: true,
      data: results
    });
  });
});

// Get all receipts
app.get('/api/receipts', (req, res) => {
  const query = 'SELECT * FROM receipts ORDER BY created_at DESC';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Receipts fetch error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch receipts',
        error: err.message
      });
    }

    res.json({
      success: true,
      data: results
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 API endpoints ready!`);
});

module.exports = app;
