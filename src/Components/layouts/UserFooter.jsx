import React from 'react'

export const UserFooter = () => {
  return (
    <>
      {/* Footer Start */}
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
                Location, City, Country
              </p>
              <p className="mb-2">
                <i className="fa fa-phone-alt me-3" />
                +012 345 67890
              </p>
              <p className="mb-2">
                <i className="fa fa-envelope me-3" />
                info@example.com
              </p>
              <div className="d-flex pt-2">
                <a className="btn btn-outline-light btn-social" href="">
                  <i className="fab fa-twitter" />
                </a>
                <a className="btn btn-outline-light btn-social" href="">
                  <i className="fab fa-facebook-f" />
                </a>
                <a className="btn btn-outline-light btn-social" href="">
                  <i className="fab fa-youtube" />
                </a>
                <a className="btn btn-outline-light btn-social" href="">
                  <i className="fab fa-linkedin-in" />
                </a>
              </div>
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
              <a className="btn btn-link" href="">
                Diagnostic Test
              </a>
              <a className="btn btn-link" href="">
                Engine Servicing
              </a>
              <a className="btn btn-link" href="">
                Tires Replacement
              </a>
              <a className="btn btn-link" href="">
                Oil Changing
              </a>
              <a className="btn btn-link" href="">
                Vacuam Cleaning
              </a>
            </div>
            <div className="col-lg-3 col-md-6">
              <h4 className="text-light mb-4">Newsletter</h4>
              <p>Dolor amet sit justo amet elitr clita ipsum elitr est.</p>
              <div className="position-relative mx-auto" style={{ maxWidth: 400 }}>
                <input
                  className="form-control border-0 w-100 py-3 ps-4 pe-5"
                  type="text"
                  placeholder="Your email"
                />
                <button
                  type="button"
                  className="btn btn-primary py-2 position-absolute top-0 end-0 mt-2 me-2"
                >
                  SignUp
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="copyright">
            <div className="row">
              <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
                ©{" "}
                <a className="border-bottom" href="https://freewebsitecode.com">
                  Your Site Name
                </a>
                , All Right Reserved. Designed By{" "}
                <a className="border-bottom" href="https://freewebsitecode.com">
                  Free Website Code
                </a>
              </div>
              <div className="col-md-6 text-center text-md-end">
                <div className="footer-menu">
                  <a href="">Home</a>
                  <a href="">Cookies</a>
                  <a href="">Help</a>
                  <a href="">FQAs</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Footer End */}
    </>
  )
}








// import React from 'react'
// import { UserNavbar } from './UserNavbar'
// import { Outlet } from 'react-router-dom'

// export const UserSidebar = () => {
//   return (
//     <>
//     <UserNavbar></UserNavbar>
//     <aside
//         className="app-sidebar bg-body-secondary shadow"
//         data-bs-theme="dark"
//       >
//         <div className="sidebar-brand">
//           {/*begin::Brand Link*/}
//           <a href="./index.html" className="brand-link">
//             {/*begin::Brand Image*/}
//             <img
//               src="../../dist/assets/img/AdminLTELogo.png"
//               alt="AdminLTE Logo"
//               className="brand-image opacity-75 shadow"
//             />
//             {/*end::Brand Image*/}
//             {/*begin::Brand Text*/}
//             <span className="brand-text fw-light">AdminLTE 4</span>
//             {/*end::Brand Text*/}
//           </a>
//           {/*end::Brand Link*/}
//         </div>

//         <div
//           className=""
//           data-overlayscrollbars-viewport="scrollbarHidden overflowXHidden overflowYScroll"
//           tabIndex={-1}
//           style={{
//             marginRight: "-16px",
//             marginBottom: "-16px",
//             marginLeft: 0,
//             top: "-8px",
//             right: "auto",
//             left: "-8px",
//             width: "calc(100% + 16px)",
//             padding: 8,
//           }}
//         >
//           <nav className="mt-2">
//             {/*begin::Sidebar Menu*/}
//             <ul
//               className="nav sidebar-menu flex-column"
//               data-lte-toggle="treeview"
//               role="menu"
//               data-accordion="false"
//             >
//               <li className="nav-item menu-open">
//                 <a href="#" className="nav-link active">
//                   <i className="nav-icon bi bi-speedometer" />
//                   <p>
//                     Dashboard
//                     <i className="nav-arrow bi bi-chevron-right" />
//                   </p>
//                 </a>
//                 <ul className="nav nav-treeview">
//                   <li className="nav-item">
//                     <a href="./index.html" className="nav-link active">
//                       <i className="nav-icon bi bi-circle" />
//                       <p>Dashboard v1</p>
//                     </a>
//                   </li>
//                   <li className="nav-item">
//                     <a href="./index2.html" className="nav-link">
//                       <i className="nav-icon bi bi-circle" />
//                       <p>Dashboard v2</p>
//                     </a>
//                   </li>
//                   <li className="nav-item">
//                     <a href="./index3.html" className="nav-link">
//                       <i className="nav-icon bi bi-circle" />
//                       <p>Dashboard v3</p>
//                     </a>
//                   </li>
//                 </ul>
//               </li>
//               <li className="nav-item">
//                 <a href="./generate/theme.html" className="nav-link">
//                   <i className="nav-icon bi bi-palette" />
//                   <p>Theme Generate</p>
//                 </a>
//               </li>
//               <li className="nav-item">
//                 <a href="#" className="nav-link">
//                   <i className="nav-icon bi bi-box-seam-fill" />
//                   <p>
//                     Widgets
//                     <i className="nav-arrow bi bi-chevron-right" />
//                   </p>
//                 </a>
//                 <ul className="nav nav-treeview">
//                   <li className="nav-item">
//                     <a href="./widgets/small-box.html" className="nav-link">
//                       <i className="nav-icon bi bi-circle" />
//                       <p>Small Box</p>
//                     </a>
//                   </li>
//                   <li className="nav-item">
//                     <a href="./widgets/info-box.html" className="nav-link">
//                       <i className="nav-icon bi bi-circle" />
//                       <p>info Box</p>
//                     </a>
//                   </li>
//                   <li className="nav-item">
//                     <a href="./widgets/cards.html" className="nav-link">
//                       <i className="nav-icon bi bi-circle" />
//                       <p>Cards</p>
//                     </a>
//                   </li>
//                 </ul>
//               </li>
//             </ul>
//             {/*end::Sidebar Menu*/}
//           </nav>
//         </div>
//       </aside>
//       <main className='app-mian'>
//         <Outlet></Outlet>
//       </main>
//     </>
//   )
// }
