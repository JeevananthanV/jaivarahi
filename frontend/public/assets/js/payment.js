async function startPayment(amount) {
    try {
        const response = await fetch('/create_order.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: amount })
        });

        if (!response.ok) {
            throw new Error('Network response was not OK: ' + response.status);
        }

        const data = await response.json();

        if (!data.id) {
            throw new Error('Invalid order ID received from backend');
        }

        const options = {
            key: data.key,
            amount: data.amount,
            currency: data.currency,
            name: "Jaivarahi",
            description: "Transaction",
            order_id: data.id,
            handler: async function (response) {
                try {
                    const verifyResponse = await fetch('/api/payments/donation/verify-payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            amount: amount
                        })
                    });

                    const verifyData = await verifyResponse.json();

                    if (verifyData.success) {
                        alert("Payment verified successfully! Razorpay Payment ID: " + response.razorpay_payment_id);
                    } else {
                        alert("Payment verification failed: " + (verifyData.error || 'Unknown error'));
                    }
                } catch (err) {
                    console.error("Verification failed:", err);
                    alert("Payment verification failed. Please contact support.");
                }
            },
            prefill: {
                name: "",
                email: "",
                contact: ""
            },
            theme: {
                color: "#528FF0"
            }
        };

        const RazorpayConstructor = typeof window !== 'undefined' ? window.Razorpay : null;
        if (!RazorpayConstructor) {
            throw new Error('Razorpay SDK not loaded');
        }

        const rzp = new RazorpayConstructor(options);
        rzp.open();

    } catch (err) {
        console.error("Payment failed:", err);
        alert("Payment failed. Something went wrong. We are working on it.");
    }
}

if (typeof window !== 'undefined') {
    window.startPayment = startPayment;
}
