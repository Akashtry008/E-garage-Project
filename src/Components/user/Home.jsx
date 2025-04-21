import React from 'react'
import { Link } from "react-router-dom";
import "../../assets/css/style.css";
import "../../assets/css/bootstrap.min.css";
import axios from 'axios';

export const Home = () => {

  // Function to handle scrolling to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    // try {
    //   const response = await axios.post("/api/bookings", {
    //     name: formData.get('name'),
    //     phone: formData.get('phone'),
    //     email: formData.get('email'),
    //     date: formData.get('date'),
    //     time: formData.get('time'),
    //     service: formData.get('service'),
    //     notes: formData.get('notes')
    //   });

  //     if (response.status === 200) {
  //       // Handle success
  //       console.log("Booking successful!");
  //       // Reset form
  //       event.target.reset();
  //     }
  //   } catch (error) {
  //     console.error("Error submitting booking:", error);
  //   }
  };

  return (
    <>

      {/* 
      <div
        id="spinner"
        className="show bg-white position-fixed translate-middle w-100 vh-100 top-50 start-50 d-flex align-items-center justify-content-center"
      >
        <div
          className="spinner-border text-primary"
          style={{ width: "3rem", height: "3rem" }}
        >
          <span className="sr-only">Loading...</span>
        </div> */}

      {/* Spinner End  */}
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
            <Link to="/" className="nav-item nav-link ">
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
                <Link to="/NotFound" className="dropdown-item">
                  <i className="fa fa-exclamation-triangle me-1" />
                  404 Page
                </Link>
              </div>
            </div>
            <Link to="/contact" className="nav-item nav-link" style={{ cursor: "pointer" }}>
              <i className="fa fa-envelope me-1" />
              Contact
            </Link>
          </div>
          <Link to="/BookAppointment" style={{fontSize: "15px", alignContent: "center"}} className="btn btn-primary py-4 px-lg-3 d-none d-lg-block">
            <i className="fa fa-user-clock me-1" />Get Appointment
          </Link>
        </div>
      </nav>
      {/* Navbar End */}
      {/* Carousel Start */}
      <div className="container-fluid p-0 mb-5">
        <div
          id="header-carousel"
          className="carousel slide"
          data-bs-ride="carousel"
        >
          <div className="carousel-inner">
            <div className="carousel-item active">
              <img className="w-100" src="img/carousel-bg-1.jpg" alt="Image" />
              <div className="carousel-caption d-flex align-items-center">
                <div className="container">
                  <div className="row align-items-center justify-content-center justify-content-lg-start">
                    <div className="col-10 col-lg-7 text-center text-lg-start">
                      <h6 className="text-white text-uppercase mb-3 animated slideInDown">
                    // Car Servicing //
                      </h6>
                      <h1 className="display-3 text-white mb-4 pb-3 animated slideInDown">
                        Qualified Car Repair Service Center
                      </h1>
                      <Link to="/UserServicesGallery"
                        className="btn btn-primary py-3 px-5 animated slideInDown"
                      >
                        Learn More
                        <i className="fa fa-arrow-right ms-3" />
                      </Link>
                    </div>
                    <div className="col-lg-5 animated zoomIn">
                      <div className="car-image-wrapper">
                        <img className="img-fluid" src="img/carousel-1.png" alt="" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="carousel-item">
              <img className="w-100" src="img/carousel-bg-2.jpg" alt="Image" />
              <div className="carousel-caption d-flex align-items-center">
                <div className="container">
                  <div className="row align-items-center justify-content-center justify-content-lg-start">
                    <div className="col-10 col-lg-7 text-center text-lg-start">
                      <h6 className="text-white text-uppercase mb-3 animated slideInDown">
                    // Car Servicing //
                      </h6>
                      <h1 className="display-3 text-white mb-4 pb-3 animated slideInDown">
                        Qualified Car Wash Service Center
                      </h1>
                      <a
                        href=""
                        className="btn btn-primary py-3 px-5 animated slideInDown"
                      >
                        Learn More
                        <i className="fa fa-arrow-right ms-3" />
                      </a>
                    </div>
                    <div className="col-lg-5 animated zoomIn">
                      <div className="car-image-wrapper">
                        <img className="img-fluid" src="img/carousel-2.png" alt="" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#header-carousel"
            data-bs-slide="prev"
          >
            <span className="carousel-control-prev-icon" aria-hidden="true" />
            <span className="visually-hidden">Previous</span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#header-carousel"
            data-bs-slide="next"
          >
            <span className="carousel-control-next-icon" aria-hidden="true" />
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </div>
      {/* Carousel End */}
      {/* Service Start
      <div className="container-xxl py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="0.1s">
              <div className="d-flex py-5 px-4">
                <i className="fa fa-certificate fa-3x text-primary flex-shrink-0" />
                <div className="ps-4">
                  <h5 className="mb-3">Quality Servicing</h5>
                  <p>Diam dolor diam ipsum sit amet diam et eos erat ipsum</p>
                  <a className="text-secondary border-bottom" href="">
                    Read More
                  </a>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="0.1s">
              <div className="d-flex bg-light py-5 px-4">
                <i className="fa fa-users-cog fa-3x text-primary flex-shrink-0" />
                <div className="ps-4">
                  <h5 className="mb-3">Expert Workers</h5>
                  <p>Diam dolor diam ipsum sit amet diam et eos erat ipsum</p>
                  <a className="text-secondary border-bottom" href="">
                    Read More
                  </a>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="0.5s">
              <div className="d-flex py-5 px-4">
                <i className="fa fa-tools fa-3x text-primary flex-shrink-0" />
                <div className="ps-4">
                  <h5 className="mb-3">Modern Equipment</h5>
                  <p>Diam dolor diam ipsum sit amet diam et eos erat ipsum</p>
                  <a className="text-secondary border-bottom" href="">
                    Read More
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> */}
      {/* Service End */}
      {/* About Start */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-6 pt-4" style={{ minHeight: 400 }}>
              <div
                className="position-relative h-100 wow fadeIn"
                data-wow-delay="0.1s"
              >
                <img
                  className="position-absolute img-fluid w-100 h-100"
                  src="img/about.jpg"
                  style={{ objectFit: "cover" }}
                  alt=""
                />
                <div
                  className="position-absolute top-0 end-0 mt-n4 me-n4 py-4 px-5"
                  style={{ background: "rgba(0, 0, 0, .08)" }}
                >
                  <h1 className="display-4 text-white mb-0">
                    15 <span className="fs-4">Years</span>
                  </h1>
                  <h4 className="text-white">Experience</h4>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <h6 className="text-primary text-uppercase">// About Us //</h6>
              <h1 className="mb-4">
                <span className="text-primary">CarServ</span> Is The Best Place For
                Your Auto Care
              </h1>
              <p className="mb-4">
                When it comes to keeping your vehicle in peak condition, CarServ stands out as the trusted name in auto care. With a perfect blend of cutting-edge technology, certified professionals, and a customer-first approach.
              </p>
              <div className="row g-4 mb-3 pb-3">
                <div className="col-12 wow fadeIn" data-wow-delay="0.1s">
                  <div className="d-flex">
                    <div
                      className="bg-light d-flex flex-shrink-0 align-items-center justify-content-center mt-1"
                      style={{ width: 45, height: 45 }}
                    >
                      <span className="fw-bold text-secondary">01</span>
                    </div>
                    <div className="ps-3">
                      <h6>🔧 Comprehensive Services</h6>
                      <span>From oil changes and brake checks to engine diagnostics.</span>
                    </div>
                  </div>
                </div>
                <div className="col-12 wow fadeIn" data-wow-delay="0.3s">
                  <div className="d-flex">
                    <div
                      className="bg-light d-flex flex-shrink-0 align-items-center justify-content-center mt-1"
                      style={{ width: 45, height: 45 }}
                    >
                      <span className="fw-bold text-secondary">02</span>
                    </div>
                    <div className="ps-3">
                      <h6>👨‍🔧 Certified Experts</h6>
                      <span> they're factory-trained and certified, ensuring possible care.</span>
                    </div>
                  </div>
                </div>
                <div className="col-12 wow fadeIn" data-wow-delay="0.5s">
                  <div className="d-flex">
                    <div
                      className="bg-light d-flex flex-shrink-0 align-items-center justify-content-center mt-1"
                      style={{ width: 45, height: 45 }}
                    >
                      <span className="fw-bold text-secondary">03</span>
                    </div>
                    <div className="ps-3">
                      <h6>🚗 Customer Comfort & Convenience</h6>
                      <span>With a cozy waiting lounge and online appointment booking.</span>
                    </div>
                  </div>
                </div>
              </div>
              <Link to="/about" className="btn btn-primary py-3 px-5">
                READ MORE
                <i className="fa fa-arrow-right ms-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* About End */}
      {/* Fact Start */}
      <div className="container-fluid fact bg-dark my-5 py-5">
        <div className="container">
          <div className="row g-4">
            <div
              className="col-md-6 col-lg-3 text-center wow fadeIn"
              data-wow-delay="0.1s"
            >
              <i className="fa fa-check fa-2x text-white mb-3" />
              <h2 className="text-white mb-2" data-toggle="counter-up">
                1234
              </h2>
              <p className="text-white mb-0">Years Experience</p>
            </div>
            <div
              className="col-md-6 col-lg-3 text-center wow fadeIn"
              data-wow-delay="0.3s"
            >
              <i className="fa fa-users-cog fa-2x text-white mb-3" />
              <h2 className="text-white mb-2" data-toggle="counter-up">
                1234
              </h2>
              <p className="text-white mb-0">Expert Technicians</p>
            </div>
            <div
              className="col-md-6 col-lg-3 text-center wow fadeIn"
              data-wow-delay="0.5s"
            >
              <i className="fa fa-users fa-2x text-white mb-3" />
              <h2 className="text-white mb-2" data-toggle="counter-up">
                1234
              </h2>
              <p className="text-white mb-0">Satisfied Clients</p>
            </div>
            <div
              className="col-md-6 col-lg-3 text-center wow fadeIn"
              data-wow-delay="0.7s"
            >
              <i className="fa fa-car fa-2x text-white mb-3" />
              <h2 className="text-white mb-2" data-toggle="counter-up">
                1234
              </h2>
              <p className="text-white mb-0">Complete Projects</p>
            </div>
          </div>
        </div>
      </div>
      {/* Fact End */}
      {/* Service Start */}
      <div className="container-xxl service py-5">
        <div className="container">
          <div className="text-center wow fadeInUp" data-wow-delay="0.1s">
            <h6 className="text-primary text-uppercase">// Our Services //</h6>
            <h1 className="mb-5">Explore Our Services</h1>
          </div>
          <div className="row g-4 wow fadeInUp" data-wow-delay="0.3s">
            <div className="col-lg-4">
              <div className="nav w-100 nav-pills me-4">
                <button
                  className="nav-link w-100 d-flex align-items-center text-start p-4 mb-4 active"
                  data-bs-toggle="pill"
                  data-bs-target="#tab-pane-1"
                  type="button"
                >
                  <i className="fa fa-car-side fa-2x me-3" />
                  <Link to="/DiagnosticTest" className="m-0"><h4>Diagnostics Test</h4></Link>
                </button>
                <button
                  className="nav-link w-100 d-flex align-items-center text-start p-4 mb-4"
                  data-bs-toggle="pill"
                  data-bs-target="#tab-pane-2"
                  type="button"
                >
                  <i className="fa fa-car fa-2x me-3" />
                  <Link to="/EngineServicing"><h4>Engine Servicing</h4></Link>
                </button>
                <button
                  className="nav-link w-100 d-flex align-items-center text-start p-4 mb-4"
                  data-bs-toggle="pill"
                  data-bs-target="#tab-pane-3"
                  type="button"
                >
                  <i className="fa fa-cog fa-2x me-3" />
                  <Link to="/TiresReplacement" className="m-0"><h4>Tires Replacement</h4></Link>
                </button>
                <button
                  className="nav-link w-100 d-flex align-items-center text-start p-4 mb-0"
                  data-bs-toggle="pill"
                  data-bs-target="#tab-pane-4"
                  type="button"
                >
                  <i className="fa fa-oil-can fa-2x me-3" />
                  <Link to="/OilChanging" className="m-0"><h4>Oil Changing</h4></Link>
                </button>
              </div>
            </div>
            <div className="col-lg-8">
              <div className="tab-content w-100">
                <div className="tab-pane fade show active" id="tab-pane-1">
                  <div className="row g-4">
                    <div className="col-md-6" style={{ minHeight: 350 }}>
                      <div className="position-relative h-100">
                        <img
                          className="position-absolute img-fluid w-100 h-100"
                          src="img/service-1.jpg"
                          style={{ objectFit: "cover" }}
                          alt=""
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <h3 className="mb-3">
                        15 Years Of Experience In Auto Servicing
                      </h3>
                      <p className="mb-4">
                        We've evolved from a small garage to a state-of-the-art service center with thousands of satisfied customers. Our team continually updates skills, tools.

                      </p>
                      <p>
                        <i className="fa fa-check text-success me-3" />
                        Quality Servicing
                      </p>
                      <p>
                        <i className="fa fa-check text-success me-3" />
                        Expert Workers
                      </p>
                      <p>
                        <i className="fa fa-check text-success me-3" />
                        Modern Equipment
                      </p>
                      <Link to="/experience" className="btn btn-primary py-3 px-5 mt-3">
                        Read More
                        <i className="fa fa-arrow-right ms-3" />
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="tab-pane fade" id="tab-pane-2">
                  <div className="row g-4">
                    <div className="col-md-6" style={{ minHeight: 350 }}>
                      <div className="position-relative h-100">
                        <img
                          className="position-absolute img-fluid w-100 h-100"
                          src="img/service-2.jpg"
                          style={{ objectFit: "cover" }}
                          alt=""
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <h3 className="mb-3">
                        15 Years Of Experience In Auto Servicing
                      </h3>
                      <p className="mb-4">
                        We've evolved from a small garage to a state-of-the-art service center with thousands of satisfied customers. Our team continually updates skills, tools, and systems to stay ahead in the ever-changing auto industry.

                      </p>
                      <p>
                        <i className="fa fa-check text-success me-3" />
                        Quality Servicing
                      </p>
                      <p>
                        <i className="fa fa-check text-success me-3" />
                        Expert Workers
                      </p>
                      <p>
                        <i className="fa fa-check text-success me-3" />
                        Modern Equipment
                      </p>
                      <a href="" className="btn btn-primary py-3 px-5 mt-3">
                        Read More
                        <i className="fa fa-arrow-right ms-3" />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="tab-pane fade" id="tab-pane-3">
                  <div className="row g-4">
                    <div className="col-md-6" style={{ minHeight: 350 }}>
                      <div className="position-relative h-100">
                        <img
                          className="position-absolute img-fluid w-100 h-100"
                          src="img/service-3.jpg"
                          style={{ objectFit: "cover" }}
                          alt=""
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <h3 className="mb-3">
                        15 Years Of Experience In Auto Servicing
                      </h3>
                      <p className="mb-4">
                        We've evolved from a small garage to a state-of-the-art service center with thousands of satisfied customers. Our team continually updates skills, tools, and systems to stay ahead in the ever-changing auto industry.

                      </p>
                      <p>
                        <i className="fa fa-check text-success me-3" />
                        Quality Servicing
                      </p>
                      <p>
                        <i className="fa fa-check text-success me-3" />
                        Expert Workers
                      </p>
                      <p>
                        <i className="fa fa-check text-success me-3" />
                        Modern Equipment
                      </p>
                      <a href="" className="btn btn-primary py-3 px-5 mt-3">
                        Read More
                        <i className="fa fa-arrow-right ms-3" />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="tab-pane fade" id="tab-pane-4">
                  <div className="row g-4">
                    <div className="col-md-6" style={{ minHeight: 350 }}>
                      <div className="position-relative h-100">
                        <img
                          className="position-absolute img-fluid w-100 h-100"
                          src="img/service-4.jpg"
                          style={{ objectFit: "cover" }}
                          alt=""
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <h3 className="mb-3">
                        15 Years Of Experience In Auto Servicing
                      </h3>
                      <p className="mb-4">
                        Our journey started over a decade and a half ago, grounded in the belief that auto servicing should go beyond repairs — it should offer trust, transparency, and true craftsmanship.

                      </p>
                      <p>
                        <i className="fa fa-check text-success me-3" />
                        Quality Servicing
                      </p>
                      <p>
                        <i className="fa fa-check text-success me-3" />
                        Expert Workers
                      </p>
                      <p>
                        <i className="fa fa-check text-success me-3" />
                        Modern Equipment
                      </p>
                      <a href="" className="btn btn-primary py-3 px-5 mt-3">
                        Read More
                        <i className="fa fa-arrow-right ms-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Service End */}
      {/* Booking Start */}
      <div
        className="container-fluid bg-secondary booking my-5 wow fadeInUp"
        data-wow-delay="0.1s"
      >
        <div className="container">
          <div className="row gx-5">
            <div className="col-lg-6 py-5">
              <div className="py-5">
                <h1 className="text-white mb-4">
                  Certified and Award Winning Car Repair Service Provider
                </h1>
                <p className="text-white mb-0">
                  At the heart of our success is a deep commitment to quality, customer satisfaction, and automotive excellence. As a certified and award-winning car repair service provider, we are proud to be recognized for our outstanding workmanship, industry expertise, and integrity.
                </p>
              </div>
            </div>
            <div className="col-lg-6">
              <div
                className="bg-primary h-100 d-flex flex-column justify-content-center text-center p-5 wow zoomIn"
                data-wow-delay="0.6s"
              >
                <h1 className="text-white mb-4" style={{ fontSize: "2rem", fontFamily: "sans-serif" }}>Go to Booking Page to Book Your Appointment With Best Service Provider
                  <br /><i className="fa fa-car-side me-2" /></h1>
                {/* <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-12 col-sm-6">
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        placeholder="Name"
                        required
                      />
                    </div>
                    <div className="col-12 col-sm-6">
                      <input
                        type="text"
                        name="phone"
                        className="form-control"
                        placeholder="Phone"
                        required
                      />
                    </div>
                    <div className="col-12 col-sm-6">
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        placeholder="Email"
                        required
                      />
                    </div>
                    <div className="col-12 col-sm-6">
                      <input
                        type="date"
                        name="date"
                        className="form-control"
                        placeholder="Date"
                        required
                      />
                    </div>
                    <div className="col-12 col-sm-6">
                      <input
                        type="time"
                        name="time"
                        className="form-control"
                        placeholder="Time"
                        required
                      />
                    </div>
                    <div className="col-12 col-sm-6">
                      <input
                        type="text"
                        name="service"
                        className="form-control"
                        placeholder="Service"
                        required
                      />
                    </div>
                    <div className="col-12">
                      <textarea
                        name="notes"
                        className="form-control"
                        placeholder="Notes"
                        rows="3"
                      ></textarea>
                    </div> */}
                    <div className="col-12">
                      <Link to="/BookAppointment"><button
                        type="submit"
                        className="btn btn-secondary w-100 py-3"
                      >
                        Book Now
                      </button></Link>
                    </div>
                  {/* </div>
                </form> */}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Booking End */}
      {/* Footer Start  */}
      <div
        className="container-fluid bg-dark text-light footer pt-5 mt-5 wow fadeIn"
        data-wow-delay="0.1s"
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
                pythond990@gmail.com              </p>
              {/* <div className="d-flex pt-2">
                <a className="btn btn-outline-light btn-social" href="">
                  <i className="fab fa-twitter" />
                </a> */}
              {/* <a className="btn btn-outline-light btn-social" href="">
                  <i className="fab fa-facebook-f" />
                </a>
                <a className="btn btn-outline-light btn-social" href="">
                  <i className="fab fa-youtube" />
                </a>
                <a className="btn btn-outline-light btn-social" href="">
                  <i className="fab fa-linkedin-in" />
                </a> */}
              {/* </div> */}
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
                {/* <input
                  className="form-control border-0 w-100 py-3 ps-4 pe-5"
                  type="text"
                  placeholder="Your email"
                /> */}
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
                ©{" "}
                <Link to="/" className="border-bottom" onClick={(e) => {e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" })}}>
                  E-Garage Service Platform
                </Link>
                , All Right Reserved.
              </div>
              <div className="col-md-6 text-center text-md-end">
                <div className="footer-menu">
                  <Link 
                    to="/" 
                    onClick={(e) => {e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    style={{ padding: "8px 12px", margin: "0 5px", display: "inline-block" }}
                  >
                    Home
                  </Link>
                  {/* <Link to="">Cookies</Link> */}
                  <Link 
                    to="/help" 
                    style={{ padding: "8px 12px", margin: "0 5px", display: "inline-block" }}
                  >
                    Help
                  </Link>
                  <Link 
                    to="/FAQs" 
                    style={{ padding: "8px 12px", margin: "0 5px", display: "inline-block" }}
                  >
                    FAQs
                  </Link>
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
      {/* JavaScript Libraries */}
      {/* Template Javascript */}

    </>
  )
}
