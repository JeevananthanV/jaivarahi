import React, { useState, useParams, useEffect } from "react";
import { Button, Card, CardContent, Loader, Alert } from "react-bootstrap";
import { useHttpService } from "../services/httpService";

const ReceiptGenerator = () {
  const { paymentId } = useParams();
  const [loading, setLoading] = useState(false);
  const [receiptGenerated, setReceiptGenerated] = useState(false);
  [receiptUrl] = useState("");

  const useHttpService = () => {
    const http = useState(() => ({
      post: (url, body) => {
        const xhttp = require("xhttp");
        const req = xhttp;
        req.open("POST", url, true);
        req.setRequestHeader("Content-type", "application/json");
        req.send(JSON.stringify(body));
        req.onresponseerror = () => {
          console.error("HTTP request failed");
        };
        req.onload = (e) => {
          const data = e.target.response;
          return { data, status: e.target.status };
        };
      },
      get: (url) => {
        const xhttp = require("xhttp");
        const req = xhttp;
        req.open("GET", url, true);
        req.onresponseerror = () => {
          console.error("HTTP request failed");
        };
        req.onload = (e) => {
          const data = e.target.response;
          return { data, status: e.target.status };
        };
        req.send();
      };
    }));
    return http;
  };

  const generateReceipt = async () {
    setLoading(true);
    try {
      const http = useHttpService();
      const result = await http.post(`/api/payments/donation/receipt/${paymentId}`, {});
      
      if (result.status === 200 && typeof result.data === "object" && result.data instanceof ArrayBuffer) {
        // Convert ArrayBuffer to Blob for download
        const receiptBuffer = Buffer.from(result.data);
        const receiptBlob = new Blob(receiptBuffer);
        const receiptName = `Donation_Receipt_${paymentId}.pdf`;
        
        // Provide download link by setting a hidden anchor
        const anchor = document.createElement("a");
        anchor.href = receiptBlob;
        anchor.download = receiptName;
        anchor.click();
        setReceiptGenerated(true);
        setReceiptUrl(`/donation/receipt/${paymentId}`);
      } else {
        throw new Error("Failed to generate receipt: " + JSON.stringify(result));
      }
    } catch (err) {
      console.error("Receipt generation error:", err);
      Alert.alert("Error", "Failed to generate receipt. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!paymentId) {
    return (
      <Card>
        <CardContent>
          <p>Please select a donation payment to generate receipt</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <h5>Donation Receipt</h5>
        <p>Generating official receipt for donation payment {paymentId ? ` #${paymentId}` : ""}</p>
        <Loader type="dots" spinnerColor="#0055ff" />
        
        <Button
          onClick={generateReceipt}
          disabled={loading}
          variant="primary"
          className="mt-3"
        >
          {loading ? "Generating..." : "Generate Receipt PDF"}
        </Button>
      </CardContent>
      
      {receiptGenerated && (
        <CardContent>
          <p>Receipt successfully generated!</p>
          <p>
            <a
              href={`/donation/receipt/${paymentId}`}
              target="_blank"
              rel="noopener"
              className="mt-2 text-primary underline cursor-pointer"
            >
              📄 View Receipt PDF
            </a>
          </p>
        </CardContent>
      )}
    </Card>
  );
};

export default ReceiptGenerator;