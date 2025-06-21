import React, { useRef, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import './receiptform.css';

const Receiptform = () => {
  const { state } = useLocation();
  const { formData, payData, formId, username } = state || {};
  const printableRef = useRef(null);
  const [ip, setIp] = useState("");
  // const navigate = useNavigate();

  const now = new Date();
  const currentDate = now.toLocaleDateString("en-GB");
  const currentTime = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const totalFee = payData?.totalFee || 0;
  const entered = payData?.enterAmount || 0;
  const paidAmount = payData?.modeOfPayment === "full" ? totalFee : entered;
  const balanceAmount = payData?.balanceAmount || 0;

  // Fetch user's IP address
  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((d) => setIp(d.ip))
      .catch(console.error);
  }, []);

  // Download receipt PDF after rendering
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

    setTimeout(downloadPDF, 1000); // Delay to allow rendering
  }, []);

  return (
    <div className="preview-container">
      <div ref={printableRef} className="receipt-wrapper">
        <h1>Payment Receipt</h1>

        <p><strong>Client ID:</strong> {formId || "N/A"}</p>
        <p><strong>Name:</strong> {username || "N/A"}</p>

        <h2>Form Submissions</h2>
        {formData ? (
          Object.entries(formData).map(([key, file]) => (
            <p key={key}>
              <strong>{key.replace(/([A-Z])/g, " $1")}:</strong> {file?.name || "Not provided"}
            </p>
          ))
        ) : (
          <p>No form data available.</p>
        )}

        <h2>Payment Details</h2>
        <p><strong>Form Name:</strong> {payData?.formName || "N/A"}</p>
        <p><strong>Total Fee:</strong> ₹{totalFee}</p>
        <p><strong>Paid Amount:</strong> ₹{paidAmount}</p>
        <p><strong>Balance:</strong> ₹{balanceAmount}</p>
        <p><strong>Payment Mode:</strong> {payData?.modeOfPayment || "N/A"}</p>

        <p><strong>Date:</strong> {currentDate}</p>
        <p><strong>Time:</strong> {currentTime}</p>
        <p><strong>IP Address:</strong> {ip || "Fetching..."}</p>
      </div>
    </div>
  );
};

export default Receiptform;
