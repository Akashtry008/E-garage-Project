import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    phone: ''
  })
  const [loading, setLoading] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData(prevData => ({
      ...prevData,
      [id]: value
    }))
    
    if (submitStatus) {
      setSubmitStatus(null)
    }
  }

  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/
    return re.test(email)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    setSubmitStatus(null)
    
    if (!formData.name.trim()) {
      toast.error('Please enter your name')
      return
    }
    
    if (!formData.email.trim() || !validateEmail(formData.email)) {
      toast.error('Please enter a valid email address')
      return
    }
    
    if (!formData.subject.trim()) {
      toast.error('Please enter a subject')
      return
    }
    
    if (!formData.message.trim()) {
      toast.error('Please enter your message')
      return
    }

    setLoading(true)
    console.log('Sending form data:', formData);

    try {
      const apiURL = 'http://localhost:8000/api/contact';
      console.log('Submitting to API URL:', apiURL);
      
      const response = await axios({
        method: 'post',
        url: apiURL,
        data: formData,
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('API Response:', response.data);
      
      if (response.data && response.data.status) {
        setSubmitStatus('success')
        toast.success('Message sent successfully! We will get back to you soon.')
        
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          phone: ''
        })
        
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setSubmitStatus('error')
        toast.error(response.data?.message || 'Failed to send message. Please try again.')
      }
    } catch (error) {
      console.error('Error sending contact message:', error)
      setSubmitStatus('error')
      
      if (error.response) {
        const errorMessage = error.response.data?.message || `Error ${error.response.status}: Failed to send message`;
        toast.error(errorMessage);
        console.log('Server error response:', error.response.data);
      } else if (error.request) {
        console.log('No response received:', error.request);
        toast.error('No response from server. Please check if the backend server is running and try again.');
      } else {
        console.log('Error in request setup:', error.message);
        toast.error('Failed to send message. Please try again later.');
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} />
      
      {submitStatus === 'success' && (
        <div className="alert alert-success text-center py-3" role="alert">
          <i className="fas fa-check-circle me-2"></i>
          Your message has been sent successfully! We will get back to you soon.
        </div>
      )}
      
      {submitStatus === 'error' && (
        <div className="alert alert-danger text-center py-3" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i>
          There was a problem sending your message. Please try again or contact us directly.
        </div>
      )}
      
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
              Contact
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
                  Contact
                </li>
              </ol>
            </nav>
          </div>
        </div>
      </div>
      {/* Page Header End */}
      {/* Contact Start */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="text-center wow fadeInUp" data-wow-delay="0.1s">
            <h6 className="text-primary text-uppercase">// Contact Us //</h6>
            <h1 className="mb-5">Contact For Any Query</h1>
          </div>
          <div className="row g-4">
            <div className="col-12">
              <div className="row gy-4">
                <div className="col-md-4">
                  <div className="bg-light d-flex flex-column justify-content-center p-4">
                    <h5 className="text-uppercase">// Booking //</h5>
                    <p className="m-0">
                      <i className="fa fa-envelope-open text-primary me-2" />
                      akashmakavana@mgail.com                    </p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="bg-light d-flex flex-column justify-content-center p-4">
                    <h5 className="text-uppercase">// General //</h5>
                    <p className="m-0">
                      <i className="fa fa-envelope-open text-primary me-2" />
                      testword2023@gmail.com
                    </p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="bg-light d-flex flex-column justify-content-center p-4">
                    <h5 className="text-uppercase">// Technical //</h5>
                    <p className="m-0">
                      <i className="fa fa-envelope-open text-primary me-2" />
                      pythond990@gmail.com
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6 wow fadeIn" data-wow-delay="0.1s">
              <iframe
                className="position-relative rounded w-100 h-100"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d235013.7484268767!2d72.41492729392517!3d23.02047410276073!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e848aba5bd449%3A0x4fcedd11614f6516!2sAhmedabad%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1743678419685!5m2!1sen!2sin"
                frameBorder={0}
                style={{ minHeight: 350, border: 0 }}
                allowFullScreen=""
                aria-hidden="false"
                tabIndex={0}
              />

            </div>
            <div className="col-md-6">
              <div className="wow fadeInUp" data-wow-delay="0.2s">
                <h4 className="mb-4">Send us a message</h4>
                
                {submitStatus === 'success' && (
                  <div className="alert alert-success mb-4">
                    Message sent successfully! We will get back to you soon.
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input
                          type="text"
                          className="form-control"
                          id="name"
                          placeholder="Your Name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                        <label htmlFor="name" style={{ color: "brown" }}>Your Name</label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          placeholder="Your Email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                        <label htmlFor="email" style={{ color: "brown" }}>Your Email</label>
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="form-floating">
                        <input
                          type="tel"
                          className="form-control"
                          id="phone"
                          placeholder="Your Phone Number (Optional)"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                        <label htmlFor="phone" style={{ color: "brown" }}>Your Phone (Optional)</label>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-floating">
                        <input
                          type="text"
                          className="form-control"
                          id="subject"
                          placeholder="Subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                        />
                        <label htmlFor="subject" style={{ color: "brown" }}>Subject</label>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-floating">
                        <textarea
                          className="form-control"
                          placeholder="Leave a message here"
                          id="message"
                          style={{ height: 120 }}
                          value={formData.message}
                          onChange={handleChange}
                          required
                        />
                        <label htmlFor="message" style={{ color: "brown" }}>Message</label>
                      </div>
                    </div>
                    <div className="col-12">
                      <button 
                        className="btn btn-primary w-100 py-3" 
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? (
                          <><i className="fas fa-spinner fa-spin me-2"></i>Sending...</>
                        ) : (
                          <>Send Message</>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Contact End */}

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


  )
}
