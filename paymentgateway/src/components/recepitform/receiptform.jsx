import React, { useRef, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import './receiptform.css';
import logo from '../../assets/logo (1).jpg';
import companyLogo from '../../assets/mycpmpanylogo.jpeg';

const Receiptform = () => {
  const { state } = useLocation();
  const { payData, formId, username } = state || {};
  const printableRef = useRef(null);
  const [ip, setIp] = useState("");

  const now = new Date();
  const currentDate = now.toLocaleDateString("en-GB");
  const currentTime = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  });

  const totalFee = payData?.totalFee || 0;
  const paidAmount = payData?.modeOfPayment === "full" ? totalFee : payData?.enterAmount;
  const balanceAmount = payData?.balanceAmount || 0;

  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => setIp(data.ip));
  }, []);

  useEffect(() => {
    const downloadPDF = async () => {
      const input = printableRef.current;
      if (!input) return;
      const canvas = await html2canvas(input);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, width, height);
      pdf.save(`Payment_Receipt_${formId || "Unknown"}.pdf`);
    };
    setTimeout(downloadPDF, 1000);
  }, []);

  const ReceiptSection = ({ copyLabel }) => (
    <div className="receipt-box">
      <div className="header">
        <h3>{copyLabel}</h3>
        <div className="company-info">
          <img src={logo} alt="Company Logo" className="logo" />
          <div className="text-info">
            <h2>24HR7 COMMERCE PVT LTD</h2>
            <p>Plot no 34, Saideep Nilayam, Second Floor</p>
            <p>Opp. Petrol Pump, Mansoorabad, 500068</p>
          </div>
          <img src={companyLogo} alt="Trust Mark" className="trust-logo" />
        </div>
      </div>

      <h3 className="section-title">PAYMENT TRANSACTION DETAILS HISTORY</h3>
      <div className="meta-info">
        <p><strong>Date:</strong> {currentDate}</p>
        <p><strong>Time:</strong> {currentTime}</p>
        <p><strong>Name:</strong> {username || "N/A"}</p>
        <p><strong>Client id:</strong> {formId || "N/A"}</p>
      </div>

      <p className="form-name">BIS REGISTRATION</p>

      {/* Display Payment Details */}
      {payData && (
        <div className="payment-details">
          <h4>Payment Details:</h4>
          <p><strong>Form Name:</strong> {payData.formName || "N/A"}</p>
          <p><strong>GST Type:</strong> {payData.gstType || "N/A"}</p>
          <p><strong>Payment Mode:</strong> {payData.modeOfPayment || "N/A"}</p>
          <p><strong>Application Fee:</strong> ₹{payData.applicationFee || 0}</p>
        </div>
      )}

      <table className="receipt-table">
        <thead>
          <tr>
            <th>Receipt No</th>
            <th>Date</th>
            <th>Total Amount</th>
            <th>Paid Amount</th>
            <th>Balance Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>01</td>
            <td>{currentDate}</td>
            <td>₹{parseFloat(totalFee).toFixed(2)}</td>
            <td>₹{parseFloat(paidAmount).toFixed(2)}</td>
            <td>₹{parseFloat(balanceAmount).toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <div className="signatures">
        <p>Receiver Signature: __________</p>
        <p>Client Signature: __________</p>
      </div>
      <p className="ip">IP Address: {ip || "Fetching..."}</p>
    </div>
  );

  return (
    <div className="receipt-container" ref={printableRef}>
      <ReceiptSection copyLabel="ORIGINAL" />
      <hr className="divider" />
      <ReceiptSection copyLabel="DUPLICATE" />
    </div>
  );
};

export default Receiptform;
