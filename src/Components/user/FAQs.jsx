import React, { useState } from "react";

// List of frequently asked questions
const faqlist = [
  {
    question: "What services do you offer?",
    answer:
      "We offer oil changes, brake repair, diagnostics, tire replacement, engine maintenance, and more.",
  },
  {
    question: "Do I need an appointment?",
    answer:
      "Appointments are recommended but walk-ins are welcome based on availability.",
  },
  {
    question: "How long does a typical service take?",
    answer:
      "Basic services like oil changes take around 30-45 minutes. Complex repairs may require more time.",
  },
  {
    question: "Can I track my service status online?",
    answer:
      "Yes! Once you book an appointment, you can track your service in real-time through your dashboard.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept credit/debit cards, UPI, mobile wallets, and cash.",
  },
];

export const FAQs=()=> {
    const [activeIndex, setActiveIndex] = useState(null);

    const toggleFAQ = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <div className="faq-page min-vh-100 d-flex flex-column align-items-center justify-content-start py-5 px-3">
            <h1 className="text-white fw-bold mb-4">Frequently Asked Questions</h1>

            <div className="faq-container">
                {faqlist.map((faq, index) => (
                    <div
                        key={index}
                        className={`faq-item ${activeIndex === index ? "active" : ""}`}
                    >
                        <div className="faq-question" onClick={() => toggleFAQ(index)}>
                            {faq.question}
                            <span className="toggle-icon">
                                {activeIndex === index ? "-" : "+"}
                            </span>
                        </div>

                        <div className="faq-answer">
                            <p>{faq.answer}</p>
                        </div>
                    </div>
                ))}
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
              0 0 15px rgba(255, 255, 255, 0.27),
              0 0 25px rgba(255, 255, 255, 0.5),
              0 0 40px rgba(255, 255, 255, 0.6);
          }
        }

        .faq-page {
          background: linear-gradient(135deg,rgb(143, 6, 6),rgb(148, 12, 12));
          background-size: 200% 200%;
          animation: sparkleBackground 12s ease-in-out infinite;
          color: red;
          font-family: 'Segoe UI', sans-serif;
        }

        .faq-container {
          background-color: #fff;
          color: #frenchblue;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
          border-radius: 20px;
          padding: 30px;
          max-width: 800px;
          width: 100%;
          animation: sparkleShadow 3s ease-in-out infinite;
        }

        .faq-item {
          border-bottom: 1px solid #e0e0e0;
          padding: 15px 0;
          text-align: left;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .faq-item:hover {
          background: rgba(139, 120, 85, 0.71);
        }

        .faq-question {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .faq-answer {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s ease;
        }

        .faq-item.active .faq-answer {
          max-height: 200px;
          margin-top: 10px;
        }

        .faq-answer p {
          margin: 0;
          line-height: 1.5;
          color: #green;
        }

        .toggle-icon {
          font-size: 1.5rem;
          font-weight: bold;
        }

        @media (max-width: 600px) {
          .faq-container {
            padding: 20px;
          }

          .faq-question {
            font-size: 1rem;
          }

          .toggle-icon {
            font-size: 1.2rem;
          }
        }
      `}</style>
        </div>
    );
};
export default FAQs;
