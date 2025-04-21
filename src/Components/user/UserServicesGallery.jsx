import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '../../assets/css/style.css';
import '../../assets/css/bootstrap.min.css';

export const UserServicesGallery = () => {
  // Add refs for each service car animation
  const carRefs = useRef([]);
  const [isHovering, setIsHovering] = useState(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [autoRotate, setAutoRotate] = useState(true);

  // Service data with prices and images
  const services = [
    {
      id: 1,
      name: "Diagnostic Test",
      price: 999,
      description: "Complete vehicle diagnostics using advanced computerized systems to identify issues accurately.",
      image: "img/service-1.jpg",
      carImage: "img/carousel-1.png",
      features: [
        "Engine performance analysis",
        "Electronic system check",
        "Vehicle health report",
        "OBD scanner diagnostics"
      ],
      duration: "45-60 minutes"
    },
    {
      id: 2,
      name: "Engine Servicing",
      price: 1499,
      description: "Comprehensive engine service to ensure optimal performance and longevity of your vehicle's heart.",
      image: "img/service-2.jpg",
      carImage: "img/carousel-2.png",
      features: [
        "Engine tune-up",
        "Spark plug replacement",
        "Fuel system cleaning",
        "Belt and hose inspection"
      ],
      duration: "2-3 hours"
    },
    {
      id: 3,
      name: "Tires Replacement",
      price: 2999,
      description: "Expert tire replacement service with alignment check to ensure smooth and safe driving experience.",
      image: "img/service-3.jpg",
      carImage: "img/carousel-1.png",
      features: [
        "Premium tire options",
        "Wheel alignment",
        "Tire balancing",
        "Valve stem replacement"
      ],
      duration: "1-2 hours"
    },
    {
      id: 4,
      name: "Oil Changing",
      price: 499,
      description: "Professional oil change service using high-quality lubricants to keep your engine running smoothly.",
      image: "img/service-4.jpg",
      carImage: "img/carousel-2.png",
      features: [
        "Premium oil options",
        "Oil filter replacement",
        "Fluid level check",
        "Multi-point inspection"
      ],
      duration: "30-45 minutes"
    }
  ];

  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Open service detail modal
  const openServiceDetail = (service) => {
    console.log("Opening modal for service:", service.name);
    setSelectedService(service);
    setIsModalOpen(true);
    // Pause auto rotation when modal is open
    setAutoRotate(false);
  };

  // Close service detail modal
  const closeModal = () => {
    setIsModalOpen(false);
    // Resume auto rotation when modal is closed
    setAutoRotate(true);
  };

  // Add this console log to debug modal state
  useEffect(() => {
    console.log("Modal state:", isModalOpen, "Selected service:", selectedService);
  }, [isModalOpen, selectedService]);

  // 3D rotation effect for car images
  const handleMouseMove = (e, index) => {
    if (!carRefs.current[index]) return;
    
    const card = carRefs.current[index];
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate rotation based on mouse position
    const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 15;
    const rotateX = -((e.clientY - centerY) / (rect.height / 2)) * 15;
    
    // Update hover state for specific car
    if (isHovering !== index) {
      setIsHovering(index);
    }
    
    // Update rotation
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovering(null);
  };

  // Auto rotation animation for cars
  useEffect(() => {
    let rotationInterval;
    
    if (autoRotate) {
      rotationInterval = setInterval(() => {
        const timestamp = Date.now() / 1000;
        const rotateY = Math.sin(timestamp) * 10;
        const rotateX = Math.cos(timestamp) * 5;
        setRotation({ x: rotateX, y: rotateY });
      }, 50);
    }
    
    return () => {
      if (rotationInterval) clearInterval(rotationInterval);
    };
  }, [autoRotate]);

  // Ensure body overflow is managed for modal
  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isModalOpen]);

  // Car animation variants for framer-motion
  const carVariants = {
    hover: {
      scale: 1.1,
      rotateZ: 0,
      transition: { 
        type: "spring", 
        stiffness: 300,
        damping: 10
      }
    },
    rest: {
      scale: 1,
      rotateZ: 0,
      transition: { 
        type: "spring", 
        stiffness: 300,
        damping: 20
      }
    }
  };

  // Animation for modal car
  const modalCarVariants = {
    initial: { opacity: 0, scale: 0.8, y: 20 },
    animate: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.3,
        type: "spring",
        stiffness: 200
      }
    },
    exit: { opacity: 0, scale: 0.8, y: 20 }
  };

  return (
    <>
      {/* Topbar Start */}
      <div className="container-fluid bg-light p-0">
        <div className="row gx-0 d-none d-lg-flex">
          <div className="col-lg-7 px-5 text-start">
            <div className="h-100 d-inline-flex align-items-center py-3 me-4">
              <small className="fa fa-map-marker-alt text-primary me-2" />
              <small>Ahmedabad, Gujarat, India</small>
            </div>
            <div className="h-100 d-inline-flex align-items-center py-3">
              <small className="far fa-clock text-primary me-2" />
              <small>Mon - Fri : 09.00 AM - 09.00 PM</small>
            </div>
          </div>
          <div className="col-lg-5 px-5 text-end">
            <div className="h-100 d-inline-flex align-items-center py-3 me-4">
              <small className="fa fa-phone-alt text-primary me-2" />
              <small>+91 8238932290</small>
            </div>
            <div className="h-100 d-inline-flex align-items-center">
              <Link className="btn btn-sm-square bg-white text-primary me-1" to="https://www.facebook.com/profile.php?id=100045644162842">
                <i className="fab fa-facebook-f" />
              </Link>
              <Link className="btn btn-sm-square bg-white text-primary me-1" to="https://www.linkedin.com/in/akash-mistry-08969b269/">
                <i className="fab fa-linkedin-in" />
              </Link>
              <Link className="btn btn-sm-square bg-white text-primary me-0" to="https://www.instagram.com/akxshh.08?igsh=MTNwempobm5tMWpuOA==">
                <i className="fab fa-instagram" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* Topbar End */}
      
      {/* Navbar Start */}
      <nav className="navbar navbar-expand-lg bg-white navbar-light shadow sticky-top p-0">
        <Link to="/"
          className="navbar-brand d-flex align-items-center px-4 px-lg-5"
        >
          <h2 className="m-0 text-primary">
            <i className="fa fa-car me-2" />
            E-Garage
          </h2>
        </Link>
        <button
          type="button"
          className="navbar-toggler me-3"
          data-bs-toggle="collapse"
          data-bs-target="#navbarCollapse"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarCollapse">
          <div className="navbar-nav ms-auto p-2 p-lg-0">
            <Link to="/" className="nav-item nav-link">
              <i className="fa fa-home me-1" />
              Home</Link>

            <Link to="/about" className="nav-item nav-link">
              <i className="fa fa-user me-1" />
              About
            </Link>
            <Link to="/UserServices" className="nav-item nav-link">
              <i className="fa fa-cog me-1" />
              Services
            </Link>
            <div className="nav-item dropdown">
              <Link to="#"
                className="nav-link dropdown-toggle"
                data-bs-toggle="dropdown"
              >
                <i className="fa fa-file-alt me-1" />
                Pages
              </Link>
              <div className="dropdown-menu fade-up m-0">
                <Link to="/booking" className="dropdown-item">
                  <i className="fa fa-calendar-check me-1" />
                  Booking
                </Link>
                <Link to="/UserServices" className="dropdown-item">
                  <i className="fa fa-tools me-1" />
                  Services
                </Link>
              </div>
            </div>
            <Link to="/contact" className="nav-item nav-link">
              <i className="fa fa-envelope me-1" />
              Contact
            </Link>
          </div>
          <Link to="/BookService" style={{ fontSize: "15px", alignContent: "center" }} className="btn btn-primary py-4 px-lg-3 d-none d-lg-block">
            <i className="fa fa-user-clock me-1" />Get Appointment
          </Link>
        </div>
      </nav>
      {/* Navbar End */}

      {/* Page Header Start */}
      <div
        className="container-fluid page-header mb-5 p-0"
        style={{ backgroundImage: "url(img/carousel-bg-1.jpg)" }}
      >
        <div className="container-fluid page-header-inner py-5">
          <div className="container text-center">
            <h1 className="display-3 text-white mb-3 animated slideInDown">
              Services Gallery
            </h1>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb justify-content-center text-uppercase">
                <li className="breadcrumb-item">
                  <Link to="/">Home</Link>
                </li>
                <li
                  className="breadcrumb-item text-white active"
                  aria-current="page"
                >
                  Services Gallery
                </li>
              </ol>
            </nav>
          </div>
        </div>
      </div>
      {/* Page Header End */}

      {/* Services Gallery Start */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="text-center">
            <h6 className="text-primary text-uppercase mb-2">// Our Services Catalog //</h6>
            <h1 className="mb-5">Explore Our Services & Pricing</h1>
            <p className="mb-5">Browse our comprehensive catalog of automotive services with transparent pricing. Each service comes with detailed information, pricing, and images of the vehicles we service.</p>
          </div>

          <div className="row g-4">
            {services.map((service, index) => (
              <div key={service.id} className="col-lg-6 col-md-6 wow fadeInUp" data-wow-delay={`0.${service.id}s`}>
                <motion.div 
                  className="service-item position-relative overflow-hidden bg-light rounded h-100 d-flex flex-column"
                  whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="position-relative overflow-hidden">
                    <img 
                      className="img-fluid w-100" 
                      src={service.image} 
                      alt={service.name} 
                      style={{ height: '250px', objectFit: 'cover' }}
                    />
                    <div className="position-absolute top-0 end-0 m-3 py-2 px-3 bg-primary text-white rounded">
                      ₹{service.price}
                    </div>
                  </div>
                  <div className="text-center p-4 flex-grow-1 d-flex flex-column">
                    <h4 className="mb-3">{service.name}</h4>
                    <p>{service.description}</p>
                    <div className="mt-auto">
                      <div 
                        className="car-image-container my-3 car-3d-container"
                        ref={el => carRefs.current[index] = el}
                        onMouseMove={(e) => handleMouseMove(e, index)}
                        onMouseLeave={handleMouseLeave}
                        style={{ 
                          height: '120px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          perspective: '1000px'
                        }}
                      >
                        <motion.div
                          className="car-3d-wrapper"
                          animate={{
                            rotateX: isHovering === index ? rotation.x : autoRotate ? rotation.x : 0,
                            rotateY: isHovering === index ? rotation.y : autoRotate ? rotation.y : 0,
                            z: isHovering === index ? 50 : 0
                          }}
                          transition={{ 
                            type: "spring",
                            stiffness: 300,
                            damping: 15
                          }}
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transformStyle: 'preserve-3d'
                          }}
                        >
                          <motion.img 
                            src={service.carImage} 
                            alt={`${service.name} car`}
                            className="car-image"
                            style={{ 
                              maxHeight: '100%', 
                              maxWidth: '100%', 
                              objectFit: 'contain',
                              filter: 'drop-shadow(5px 10px 10px rgba(0,0,0,0.3))'
                            }}
                            variants={carVariants}
                            initial="rest"
                            whileHover="hover"
                            animate={isHovering === index ? "hover" : "rest"}
                          />
                        </motion.div>
                      </div>
                      <motion.button 
                        className="btn btn-primary py-2 px-4 mt-3"
                        onClick={() => {
                          console.log("Button clicked for service:", service.name);
                          openServiceDetail(service);
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        View Details
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Services Gallery End */}

      {/* Service Detail Modal */}
      {isModalOpen && selectedService && (
        <div 
          className="modal-overlay" 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={closeModal}
        >
          <div 
            className="modal-container" 
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              width: '100%',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header" style={{ padding: '15px 20px', backgroundColor: '#D81324', color: 'white', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h5 className="modal-title" style={{ margin: 0, fontSize: '1.25rem' }}>{selectedService.name}</h5>
              <button 
                type="button" 
                style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}
                onClick={closeModal}
              >
                &times;
              </button>
            </div>
            <div className="modal-body" style={{ padding: '20px' }}>
              <div className="row">
                <div className="col-md-6">
                  <img 
                    className="img-fluid rounded mb-3" 
                    src={selectedService.image} 
                    alt={selectedService.name} 
                    style={{ width: '100%', borderRadius: '4px' }}
                  />
                </div>
                <div className="col-md-6">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.75rem' }}>{selectedService.name}</h3>
                    <h3 style={{ margin: 0, fontSize: '1.75rem', color: '#D81324' }}>₹{selectedService.price}</h3>
                  </div>
                  <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>{selectedService.description}</p>
                  <div style={{ marginTop: '20px' }}>
                    <h5 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>Service Includes:</h5>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {selectedService.features.map((feature, index) => (
                        <li key={index} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                          <i className="fa fa-check" style={{ color: '#D81324', marginRight: '10px' }}></i> 
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ marginTop: '15px' }}>
                    <p><strong>Duration:</strong> {selectedService.duration}</p>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'center', marginTop: '30px', height: '150px', perspective: '1500px' }}>
                <div 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    animation: 'spin 10s linear infinite'
                  }}
                >
                  <img 
                    src={selectedService.carImage} 
                    alt={`${selectedService.name} car`}
                    style={{ 
                      maxHeight: '150px',
                      filter: 'drop-shadow(5px 10px 10px rgba(0,0,0,0.3))'
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ padding: '15px 20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
              <button 
                type="button" 
                style={{ 
                  padding: '8px 16px', 
                  backgroundColor: '#6c757d', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onClick={closeModal}
              >
                Close
              </button>
              <Link 
                to="/BookService" 
                style={{ 
                  padding: '8px 16px', 
                  backgroundColor: '#D81324', 
                  color: 'white', 
                  textDecoration: 'none', 
                  borderRadius: '4px',
                  display: 'inline-block'
                }}
              >
                Book This Service
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Footer Start */}
      <div
        className="container-fluid bg-dark text-light footer pt-5 mt-5"
      >
        <div className="container py-5">
          <div className="row g-5">
            <div className="col-lg-3 col-md-6">
              <h4 className="text-light mb-4">Address</h4>
              <p className="mb-2">
                <i className="fa fa-map-marker-alt me-3" />
                Ahmedabad, Gujarat, India
              </p>
              <p className="mb-2">
                <i className="fa fa-phone-alt me-3" />
                +91 8238932290
              </p>
              <p className="mb-2">
                <i className="fa fa-envelope me-3" />
                pythond990@gmail.com
              </p>
            </div>
            <div className="col-lg-3 col-md-6">
              <h4 className="text-light mb-4">Opening Hours</h4>
              <h6 className="text-light">Monday - Friday:</h6>
              <p className="mb-4">09.00 AM - 09.00 PM</p>
              <h6 className="text-light">Saturday - Sunday:</h6>
              <p className="mb-0">09.00 AM - 12.00 PM</p>
            </div>
            <div className="col-lg-3 col-md-6">
              <h4 className="text-light mb-4">Services</h4>
              <Link to="/DiagnosticTest" className="btn btn-link">
                Diagnostic Test
              </Link>
              <Link to="/EngineServicing" className="btn btn-link">
                Engine Servicing
              </Link>
              <Link to="/TiresReplacement" className="btn btn-link">
                Tires Replacement
              </Link>
              <Link to="/OilChanging" className="btn btn-link">
                Oil Changing
              </Link>
            </div>
            <div className="col-lg-3 col-md-6">
              <h4 className="text-light mb-4">Newsletter</h4>
              <p>The Garage Style Newsletter brings special offers, news, ideas, and sneak peeks directly to your Email.</p>
              <div className="position-relative mx-auto" style={{ maxWidth: 400 }}>
                <input
                  className="form-control border-0 w-100 py-3 ps-4 pe-5"
                  type="text"
                  placeholder="Your email"
                />
                <Link to="/SignUp"><button
                  style={{ alignItems: "center" }}
                  type="button"
                  className="btn btn-primary py-2 position-absolute top-0 end-0 mt-2 me-2"
                >
                  SignUp
                </button></Link>
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="copyright">
            <div className="row">
              <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
                © <Link to="/" className="border-bottom">E-Garage Service Platform</Link>, All Right Reserved.
              </div>
              <div className="col-md-6 text-center text-md-end">
                <div className="footer-menu">
                  <Link to="/" style={{ padding: "8px 12px", margin: "0 5px", display: "inline-block" }}>Home</Link>
                  <Link to="/help" style={{ padding: "8px 12px", margin: "0 5px", display: "inline-block" }}>Help</Link>
                  <Link to="/FAQs" style={{ padding: "8px 12px", margin: "0 5px", display: "inline-block" }}>FAQs</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Footer End */}

      {/* Back to Top */}
      <button
        className="btn btn-lg btn-primary btn-lg-square"
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          zIndex: 9999,
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
        }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <i className="fa fa-arrow-up" />
      </button>

      {/* Additional styles for the service gallery and 3D effects */}
      <style>
        {`
          .service-item {
            transition: all 0.3s ease;
            border: 1px solid #e9ecef;
          }
          
          .service-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
          }
          
          .car-image {
            transition: transform 0.3s ease;
            transform-style: preserve-3d;
            will-change: transform;
          }
          
          .car-3d-container {
            overflow: visible !important;
            background: radial-gradient(circle, rgba(240,240,240,0.5) 0%, rgba(255,255,255,0) 70%);
            border-radius: 10px;
            box-shadow: inset 0 0 20px rgba(0,0,0,0.05);
          }
          
          .car-3d-wrapper {
            transform-style: preserve-3d;
            will-change: transform;
          }
          
          .car-3d-modal-container {
            overflow: visible !important;
            background: radial-gradient(circle, rgba(240,240,240,0.5) 0%, rgba(255,255,255,0) 70%);
            border-radius: 10px;
            padding: 20px;
            margin-top: 30px;
            box-shadow: inset 0 0 30px rgba(0,0,0,0.05);
          }
          
          .car-image-modal {
            transform-style: preserve-3d;
            will-change: transform;
          }
          
          .modal-backdrop {
            background-color: rgba(0,0,0,0.7);
          }
          
          body.modal-open {
            overflow: hidden;
            padding-right: 17px;
          }
          
          /* Animation for price tag */
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          
          .service-item .position-absolute {
            animation: pulse 2s infinite;
          }
          
          /* 3D reflection effect */
          .car-image::after {
            content: '';
            position: absolute;
            bottom: -30%;
            left: 5%;
            width: 90%;
            height: 30%;
            background: linear-gradient(to bottom, rgba(0,0,0,0.2), transparent);
            transform: rotateX(180deg) scaleY(0.3);
            filter: blur(5px);
            opacity: 0.3;
            transform-origin: bottom;
            pointer-events: none;
          }
          
          /* Floating animation for cars in gallery */
          @keyframes floating {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
          
          .car-3d-wrapper {
            animation: floating 3s ease infinite;
          }
          
          /* Headlight effect */
          .car-image-modal::before {
            content: '';
            position: absolute;
            width: 10px;
            height: 10px;
            background: radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%);
            filter: blur(2px);
            z-index: 10;
            animation: headlight 10s linear infinite;
          }
          
          @keyframes headlight {
            0% { opacity: 0.7; }
            50% { opacity: 0.3; }
            100% { opacity: 0.7; }
          }

          @keyframes spin {
            from { transform: rotateY(0deg); }
            to { transform: rotateY(360deg); }
          }
        `}
      </style>
    </>
  );
};

export default UserServicesGallery; 