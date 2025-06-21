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

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Show alert
    alert("Form submitted successfully!");

    // Navigate to /paymentform and pass formData
    navigate("/paymentform", { state: { formData } });
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

        <button type="submit">SUBMIT</button>
      </form>
    </div>
  );
};

export default Bisform;
