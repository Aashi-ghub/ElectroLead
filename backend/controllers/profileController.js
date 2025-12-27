import pool from '../config/database.js';
import cloudinary from '../config/cloudinary.js';
import multer from 'multer';
import { Readable } from 'stream';

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, PNG allowed.'));
    }
  },
}).single('document');

// GET /api/profile
export const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, name, phone, role, city, state, company_name, kyc_status, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get documents
    const docsResult = await pool.query(
      'SELECT id, document_type, file_url, uploaded_at FROM user_documents WHERE user_id = $1 ORDER BY uploaded_at DESC',
      [req.user.id]
    );

    // Get active subscription (for sellers)
    const subResult = await pool.query(
      `SELECT plan_type, start_date, end_date, status 
       FROM subscriptions 
       WHERE user_id = $1 AND status = 'active' AND end_date >= CURRENT_DATE
       ORDER BY created_at DESC LIMIT 1`,
      [req.user.id]
    );

    res.json({
      user: result.rows[0],
      documents: docsResult.rows,
      subscription: subResult.rows[0] || null,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// PUT /api/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, city, state, company_name } = req.body;

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (phone !== undefined) {
      updateFields.push(`phone = $${paramCount++}`);
      values.push(phone);
    }
    if (city !== undefined) {
      updateFields.push(`city = $${paramCount++}`);
      values.push(city);
    }
    if (state !== undefined) {
      updateFields.push(`state = $${paramCount++}`);
      values.push(state);
    }
    if (company_name !== undefined) {
      updateFields.push(`company_name = $${paramCount++}`);
      values.push(company_name);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(req.user.id);
    const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);

    res.json({ message: 'Profile updated successfully', user: result.rows[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// POST /api/profile/upload-kyc
export const uploadKyc = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const { document_type } = req.body;

      if (!document_type) {
        return res.status(400).json({ error: 'Document type required' });
      }

      // Upload to Cloudinary
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'electrolead/kyc',
          allowed_formats: ['pdf', 'jpg', 'png'],
        },
        async (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return res.status(500).json({ error: 'File upload failed' });
          }

          try {
            // Save to database
            const dbResult = await pool.query(
              `INSERT INTO user_documents (user_id, document_type, file_url, cloudinary_public_id)
               VALUES ($1, $2, $3, $4)
               RETURNING *`,
              [req.user.id, document_type, result.secure_url, result.public_id]
            );

            res.status(201).json({
              message: 'Document uploaded successfully',
              document: dbResult.rows[0],
            });
          } catch (dbError) {
            console.error('Database error:', dbError);
            // Try to delete from Cloudinary if DB insert fails
            cloudinary.uploader.destroy(result.public_id).catch(console.error);
            res.status(500).json({ error: 'Failed to save document' });
          }
        }
      );

      // Convert buffer to stream
      const bufferStream = new Readable();
      bufferStream.push(req.file.buffer);
      bufferStream.push(null);
      bufferStream.pipe(uploadStream);
    } catch (error) {
      console.error('Upload KYC error:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  });
};



