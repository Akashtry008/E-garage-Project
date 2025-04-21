import React from "react";
import "../../assets/css/experience.css"; // Link to external styles

export const Experience = () => {
  const features = [
    {
      title: "Quality Servicing",
      content: `Every car deserves elite care. We treat every vehicle like our own, ensuring every nut, bolt, and system is checked thoroughly.
      Our multi-point inspection process guarantees nothing is overlooked, and our quality assurance team double-checks every step before your car returns to you.`,
    },
    {
      title: "Expert Workers",
      content: `Our technicians aren’t just experienced — they’re masters of their craft.
      Trained across multiple brands and certified in modern diagnostics, they blend mechanical expertise with tech-savvy solutions.
      Many have been with us for over a decade, delivering consistent quality service to returning clients.`,
    },
    {
      title: "Modern Equipment",
      content: `We believe in staying future-ready. From computerized alignment machines to advanced engine diagnostic tools, we invest in cutting-edge equipment.
      This allows faster, more accurate servicing while reducing human error and ensuring your car runs smoothly, safely, and efficiently.`,
    },
  ];

  return (
    <div className="experience-container">
      <div className="experience-heading fadeInDown">
        15 Years of Experience in Auto Servicing
      </div>

      <div className="experience-intro fadeInUp">
        Our journey started over a decade and a half ago, grounded in the belief that auto servicing should go beyond repairs — it should offer trust, transparency, and true craftsmanship.
        <br /><br />
        We've evolved from a small garage to a state-of-the-art service center with thousands of satisfied customers. Our team continually updates skills, tools, and systems to stay ahead in the ever-changing auto industry.
      </div>

      <div className="experience-features">
        {features.map((feature, index) => (
          <div
            key={index}
            className="feature-card sparkle bounceIn feature-delay"
            style={{
              animationDelay: `${index * 0.3}s`,
              animationFillMode: "forwards",
            }}
          >
            <h2 className="feature-title pulse">{feature.title}</h2>
            <p className="feature-content">{feature.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Experience;