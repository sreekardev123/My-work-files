import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './bisform.css';

const Bisform = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    file: null,
    username: '',
    password: '',
    comment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get file type
      let fileType = null;
      if (formData.file) {
        fileType = formData.file.type || 'unknown';
      }

      // Debug logging
      console.log('📁 File Debug Info:');
      console.log('  - File object:', formData.file);
      console.log('  - File name:', formData.file?.name);
      console.log('  - File type:', formData.file?.type);
      console.log('  - File size:', formData.file?.size);

      // Prepare data for backend
      const submitData = {
        username: formData.username,
        password: formData.password,
        fileName: formData.file ? formData.file.name : null,
        fileType: fileType,
        filePath: formData.file ? `/uploads/${formData.file.name}` : null,
        comment: formData.comment
      };

      console.log('📤 Data being sent to backend:', submitData);

      // Send data to backend
      const response = await fetch('http://localhost:5000/api/bis-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });

      const result = await response.json();

      if (result.success) {
        alert("Form submitted successfully!");
        
        // Navigate to payment form with both form data and backend response
        navigate("/paymentform", { 
          state: { 
            formData,
            bisFormData: result.data // Backend response data
          } 
        });
      } else {
        alert("Failed to submit form: " + result.message);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert("Error submitting form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bisform-container">
      <form className="bisform-box" onSubmit={handleSubmit}>
        <h2>BIS</h2>

        <label>Existing Registration Certification:</label>
        <input type="file" name="file" onChange={handleChange} />

        <div className="credentials-box">
          <p><strong>User Name Password if available</strong></p>
          <label>User Name:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <label>Comment:</label>
        <textarea
          name="comment"
          rows="3"
          placeholder="Add your comment here..."
          value={formData.comment}
          onChange={handleChange}
        ></textarea>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'SUBMIT'}
        </button>
      </form>
    </div>
  );
};

export default Bisform;
