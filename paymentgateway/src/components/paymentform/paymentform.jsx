import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import './paymentform.css';

const Paymentform = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const formData = location.state?.formData;

  const [form, setForm] = useState({
    formId: "BIS-001",
    formName: "BIS Payment",
    modeOfPayment: "",
    gstType: "",
    applicationFee: 0,
    enterAmount: "",
    totalFee: 0,
    balanceAmount: ""
  });

  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setIsRazorpayLoaded(true);
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  useEffect(() => {
    const entered = parseFloat(form.enterAmount) || 0;
    const total = parseFloat(form.totalFee) || 0;
    const remaining = total - entered;

    if (form.modeOfPayment === "partial") {
      setForm((prev) => ({
        ...prev,
        balanceAmount: remaining.toFixed(2)
      }));
    } else if (form.modeOfPayment === "full") {
      setForm((prev) => ({
        ...prev,
        enterAmount: total.toFixed(2),
        balanceAmount: "0.00"
      }));
    }
  }, [form.enterAmount, form.modeOfPayment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));

    if (name === "gstType") {
      const fee = {
        prop: 1000,
        part: 1500,
        com: 2000
      }[value];
      setForm((prev) => ({
        ...prev,
        applicationFee: fee,
        totalFee: fee,
        enterAmount: "",
        balanceAmount: ""
      }));
    }
  };

  const handlePayment = (e) => {
    e.preventDefault();
    if (!isRazorpayLoaded) {
      return alert("Razorpay SDK not loaded yet.");
    }

    const amount = parseFloat(form.enterAmount);
    if (isNaN(amount) || amount < 200) {
      return alert("Minimum payment of ₹200 is required.");
    }

    const razor = new window.Razorpay({
      key: "rzp_test_B9S8hmIWzP4YGf", // Replace with your Razorpay test/live key
      amount: amount * 100,
      currency: "INR",
      name: "24HR7 Commerce Pvt Ltd.",
      description: "BIS Payment",
      handler: function () {
        alert("Payment Successful!");
        navigate("/receiptform", {
          state: { formData, paymentDetails: form }
        });
      }
    });

    razor.open();
  };

  return (
    <div className="payment-container">
      <form className="payment-box" onSubmit={handlePayment}>
        <h2>Make Payment</h2>

        <label>Form ID:</label>
        <input type="text" value={form.formId} readOnly />

        <label>Form Name:</label>
        <input type="text" value={form.formName} readOnly />

        <label>Select GST Type:</label>
        <select name="gstType" value={form.gstType} onChange={handleChange} required>
          <option value="">-- Select --</option>
          <option value="prop">Proprietor</option>
          <option value="part">Partnership</option>
          <option value="com">Company</option>
        </select>

        <label>Select Mode of Payment:</label>
        <select name="modeOfPayment" value={form.modeOfPayment} onChange={handleChange} required>
          <option value="">-- Select --</option>
          <option value="partial">Partial</option>
          <option value="full">Full</option>
        </select>

        <label>Enter Amount:</label>
        <input
          type="number"
          name="enterAmount"
          value={form.enterAmount}
          onChange={handleChange}
          disabled={form.modeOfPayment === "full"}
        />

        <label>Application Fee:</label>
        <input type="text" value={form.applicationFee} readOnly />

        <label>Total Fee:</label>
        <input type="text" value={form.totalFee} readOnly />

        <label>Balance Amount:</label>
        <input type="text" value={form.balanceAmount} readOnly />

        <button type="submit">Make Payment</button>
        <button type="button" onClick={() => navigate(-1)}>Cancel</button>
      </form>
    </div>
  );
};

export default Paymentform;
