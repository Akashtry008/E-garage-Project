import React from 'react'
import { Link } from 'react-router-dom'

export const Booking = () => {
  return (

    <>
      {/* Spinner Start */}
      {/* <div
    id="spinner"
    className="show bg-white position-fixed translate-middle w-100 vh-100 top-50 start-50 d-flex align-items-center justify-content-center"
  >
    <div
      className="spinner-border text-primary"
      style={{ width: "3rem", height: "3rem" }}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  </div> */}
      {/* Spinner End */}
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
          <Link to="/BookAppointment" style={{ fontSize: "15px", alignContent: "center" }} className="btn btn-primary py-4 px-lg-3 d-none d-lg-block">
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
              Booking
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
                  Booking
                </li>
              </ol>
            </nav>
          </div>
        </div>
      </div>
      {/* Page Header End */}

      <>
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
                    Eirmod sed tempor lorem ut dolores. Aliquyam sit sadipscing kasd
                    ipsum. Dolor ea et dolore et at sea ea at dolor, justo ipsum duo
                    rebum sea invidunt voluptua. Eos vero eos vero ea et dolore eirmod
                    et. Dolores diam duo invidunt lorem. Elitr ut dolores magna sit.
                    Sea dolore sanctus sed et. Takimata takimata sanctus sed.
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
                      <div className="col-12">
                        <Link to="/BookAppointment"><button
                          className="btn btn-secondary w-100 py-3"
                          type="submit"
                        >
                          Book Now
                        </button></Link>
                      </div>
                    {/* </div> */}
                  {/* </form> */}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Booking End */}
        {/* Call To Action Start */}
        <div className="container-xxl py-5 wow fadeInUp" data-wow-delay="0.1s">
          <div className="container">
            <div className="row g-4">
              <div className="col-lg-8 col-md-6">
                <h6 className="text-primary text-uppercase">// Call To Action //</h6>
                <h1 className="mb-4">Have Any Pre Booking Question?</h1>
                <p className="mb-0">
                  Lorem diam ea sit dolor labore. Clita et dolor erat sed est lorem
                  sed et sit. Diam sed duo magna erat et stet clita ea magna ea sed,
                  sit labore magna lorem tempor justo rebum dolores. Eos dolor sea
                  erat amet et, lorem labore lorem at dolores. Stet ea ut justo et,
                  clita et et ipsum diam.
                </p>
              </div>
              <div className="col-lg-4 col-md-6">
                <div className="bg-primary d-flex flex-column justify-content-center text-center h-100 p-4">
                  <h3 className="text-white mb-4">
                    <i className="fa fa-phone-alt me-3" />
                    +91 8238932290
                  </h3>
                  <Link to="/contact" className="btn btn-secondary py-3 px-5">
                    Contact Us
                    <i className="fa fa-arrow-right ms-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Call To Action End */}

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
                      ©{" "}
                      <Link to="/" className="border-bottom" >
                        E-Garage Service Platform
                      </Link>
                      , All Right Reserved.
                    </div>
                    <div className="col-md-6 text-center text-md-end">
                      <div className="footer-menu">
                        <Link to="/">Home</Link>
                        {/* <Link to="">Cookies</Link> */}
                        <Link to="">Help</Link>
                        <Link to="">FQAs</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Footer End */}
            {/* Back to Top */}
            {/* <Link to="/" className="btn btn-lg btn-primary btn-lg-square back-to-top">
              <i className="bi bi-arrow-up" />
            </Link> */}
            <button
              className="btn btn-lg btn-primary btn-lg-square back-to-top"
              style={{ position: "fixed", zIndex: 10, alignItems: "center", paddingRight: "35px" }}
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <i className="bi bi-arrow-up" />
            </button> 
            {/* JavaScript Libraries */}
            {/* Template Javascript */}
      </>


    </>



  )
}
