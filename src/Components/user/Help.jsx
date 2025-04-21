import React from "react";

export const Help = () => {
    return (
        <div className="help-page min-vh-100 d-flex flex-column align-items-center justify-content-center text-center px-3">
            <h1 className="text-white fw-bold mb-4">Need Help?</h1>
            <p className="lead text-white mb-4">
                We're here for you! Whether it's a booking issue, service inquiry, or general question —
                reach out and we'll sort it.
            </p>
            <div className="support-box bg-white p-4 rounded-4 text-danger" style={{ maxWidth: "600px", width: "100%" }}>
                <h4 className="mb-3">Contact Support</h4>
                <p><strong>Email:</strong> pythond990@gmail.com</p>
                <p><strong>Phone:</strong> +91 8238932290</p>
                <p><strong>Hours:</strong> Mon – Sat , 9 AM – 9 PM</p>
            </div>

            <style>{`
                @keyframes sparkleBackground {
                  0% { background-position: 0 0; }
                  100% { background-position: 100% 100%; }
                }

                @keyframes sparkleShadow {
                  0%, 100% {
                    box-shadow:
                          0 0 10px #238628,
              0 0 20px rgba(7, 206, 67, 0.98),
              0 0 30px rgba(20, 250, 12, 0.85);
                  }
                  50% {
                    box-shadow:
                      0 0 15px rgba(255, 255, 255, 0.3),
                      0 0 25px rgba(255, 255, 255, 0.5),
                      0 0 40px rgba(255, 255, 255, 0.6);
                  }
                }

                .help-page {
          background: linear-gradient(135deg,rgb(192, 7, 7), #4d0000);
                  background-size: 200% 200%;
                  animation: sparkleBackground 12s ease-in-out infinite;
                  color: #fff;
                  font-family: 'Segoe UI', sans-serif;
                }

                .support-box {
                  animation: sparkleShadow 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default Help;
