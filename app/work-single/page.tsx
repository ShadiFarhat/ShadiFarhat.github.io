
import Layout from "@/components/layout/Layout"
import Link from "next/link"
import CountUp from "react-countup"
export default function WorkSingle() {

	return (
		<>

			<Layout headerStyle={1} footerStyle={1}>
				<div>
					<section className="section-work-single section-padding">
						<div className="container">
							<div className="row">
								<div className="col-lg-8 mx-lg-auto mb-lg-0">
									<div className="text-center">
										<Link href="" className="btn btn-gradient d-inline-block text-uppercase">
											work details
										</Link>
										<h3 className="ds-3 mt-3 mb-4 text-dark">
											Maliks - Internal HR Application
										</h3>
										<p className="text-300 fs-5 mb-0">
										Developed an intuitive and visually appealing HR app interface. This design allows users to easily manage tasks such as leave requests, employee records, and performance reviews all in one place.</p>
									</div>
								</div>
								<div className="d-flex flex-wrap justify-content-center gap-4 py-8">
									<div className="bg-6 px-5 py-3 rounded-2">
										<p className="text-300 mb-0">Client</p>
										<h6>Maliks Lebanon</h6>
									</div>
									<div className="bg-6 px-5 py-3 rounded-2">
										<p className="text-300 mb-0">Start</p>
										<h6>01 Nov 2024</h6>
									</div>
									<div className="bg-6 px-5 py-3 rounded-2">
										<p className="text-300 mb-0">Complete</p>
										<h6>01 Mar 2025</h6>
									</div>
									<div className="bg-6 px-5 py-3 rounded-2">
										<p className="text-300 mb-0">Services</p>
										<h6>HR Managment System</h6>
									</div>
									<div className="bg-6 px-5 py-3 rounded-2">
										<p className="text-300 mb-0">Website</p>
										<h6>maliksportal.com</h6>
									</div>
								</div>
								<img src="/assets/imgs/work/img-background.png" alt="" />
								<div className="col-lg-8 mx-lg-auto mt-8">
									<h5 className="fs-5 fw-medium">Description</h5>
									<p className="text-300">
									PeoplePulse is a comprehensive HR management app designed to provide organizations with a seamless and efficient human resources experience. The project involved creating an intuitive and visually appealing interface, ensuring that HR professionals can effortlessly manage employee records, performance, badge maker, chart generator, transfer and rotation systems, new joiner training tracking, and more within a single platform. The primary goal was to enhance overall HR operations, making workforce management simple and effective.</p>
									<h5 className="fs-5 fw-medium mt-4">Key Features</h5>
									<ul>
										<li>
											<p className="text-dark fw-bold">User-Centric Interface: <span className="text-300 fw-medium">Designed a clean and intuitive interface that allows HR professionals to navigate the system with ease, ensuring a smooth experience.
											</span></p>
										</li>
										<li>
											<p className="text-dark fw-bold">Comprehensive Employee Management: <span className="text-300 fw-medium">Integrated features for managing employee records, performance reviews, badge creation, and more in one place.
											</span></p>
										</li>
										<li>
											<p className="text-dark fw-bold">Dynamic Chart Generator: <span className="text-300 fw-medium">Developed an interactive chart tool that visualizes key HR metrics and performance trends.</span></p>
										</li>
										<li>
											<p className="text-dark fw-bold">Transfer & Rotation System: <span className="text-300 fw-medium">Implemented a seamless system for managing employee transfers and rotations. <span className="text-dark fw-bold">Data are safe and user data is protected.</span></span></p>
										</li>
										<li>
											<p className="text-dark fw-bold">New Joiner Training Tracking: <span className="text-300 fw-medium">Incorporated tools to track and manage new employee training and onboarding processes.</span></p>
										</li>
									</ul>
									<h5 className="fs-5 fw-medium mt-4">Technologies Used</h5>
									<ul>
										<li>
											<p className="text-dark fw-bold">Front-End: <span className="text-300 fw-medium">HTML, CSS, and JavaScript for building a responsive and engaging user interface.
											</span></p>
										</li>
										<li>
											<p className="text-dark fw-bold">Back-End: <span className="text-300 fw-medium">Laravel for robust server-side logic and efficient data handling.</span></p>
										</li>
										<li>
											<p className="text-dark fw-bold">Database: <span className="text-300 fw-medium">MySQL for reliable data storage and retrieval.</span></p>
										</li>
									</ul>
									<h5 className="fs-5 fw-medium mt-4">Design Highlights</h5>
									<ul>
										<li>
											<p className="text-dark fw-bold">Visual Appeal: <span className="text-300 fw-medium">Emphasized a modern, visually appealing design with high-quality visuals and a professional color palette.</span></p>
										</li>
										<li>
											<p className="text-dark fw-bold">Usability: <span className="text-300 fw-medium">Ensured a user-friendly layout with clear icons, concise labels, and an intuitive navigation structure.</span></p>
										</li>
										<li>
											<p className="text-dark fw-bold">Responsive Design: <span className="text-300 fw-medium">Developed the app to be fully responsive across devices, ensuring a consistent user experience.</span></p>
										</li>
									</ul>
								</div>
							</div>
						</div>
					</section>
					{/* Contact 1*/}
					<section id="contact" className="section-contact-1 bg-1000 position-relative pt-150 pb-lg-250 pb-150 overflow-hidden">
				<div className="container position-relative z-1">
					<h3 className="ds-3 mt-3 mb-3 text-primary-1">Get in touch</h3>
					<span className="fs-5 fw-medium text-200">
						I'm always excited to take on new projects and collaborate with innovative minds. If you
						<br />
						have a project in mind or just want to chat about design, feel free to reach out!
					</span>
					<div className="row mt-8">
						<div className="col-lg-4 d-flex flex-column">
							<div className="d-flex align-items-center mb-4 position-relative d-inline-flex">
								<div className="bg-white icon-flip position-relative icon-shape icon-xxl border-linear-2 border-2 rounded-4">
									<i className="ri-phone-fill text-primary-1 fs-26" />
								</div>
								<div className="ps-3">
									<span className="text-400 fs-5">Phone Number</span>
									<h6 className="mb-0">+961 76 938 653</h6>
								</div>
								<Link href="tel:+961 76 938 653"  className="position-absolute top-0 start-0 w-100 h-100" />
							</div>
							<div className="d-flex align-items-center mb-4 position-relative d-inline-flex">
								<div className="bg-white icon-flip position-relative icon-shape icon-xxl border-linear-2 border-2 rounded-4">
									<i className="ri-mail-fill text-primary-1 fs-26" />
								</div>
								<div className="ps-3">
									<span className="text-400 fs-5">Email</span>
									<h6 className="mb-0">shadifarhat98@gmail.com</h6>
								</div>
								<Link href="mailto:shadifarhat98@gmail.com"  className="position-absolute top-0 start-0 w-100 h-100" />
							</div>

							<div className="d-flex align-items-center mb-4 position-relative d-inline-flex">
								<div className="bg-white icon-flip position-relative icon-shape icon-xxl border-linear-2 border-2 rounded-4">
									<i className="ri-map-2-fill text-primary-1 fs-26" />
								</div>
								<div className="ps-3">
									<span className="text-400 fs-5">Address</span>
									<h6 className="mb-0">Lebanon - Beirut</h6>
								</div>
								<Link href="https://g.co/kgs/zdk71C4" target="_blank" className="position-absolute top-0 start-0 w-100 h-100" />
							</div>
						</div>
						<div className="col-lg-7 offset-lg-1 ps-lg-0 pt-5 pt-lg-0">
							<div className="position-relative">
								<div className="position-relative z-2">
									<h3>Leave a messge</h3>
									<form action="#">
										<div className="row mt-3">
											<div className="col-md-6 ">
												<label className="mb-1 mt-3 text-dark" htmlFor="name">Your name <span className="text-primary-1">*</span></label>
												<input type="text" className="form-control border rounded-3" id="name" name="name" placeholder="John Doe" aria-label="username" />
											</div>
											<div className="col-md-6">
												<label className="mb-1 mt-3 text-dark" htmlFor="email">Email address <span className="text-primary-1">*</span></label>
												<input type="text" className="form-control border rounded-3" id="email" name="email" placeholder="contact.john@gmail.com" aria-label="email" />
											</div>
											<div className="col-md-6">
												<label className="mb-1 mt-3 text-dark" htmlFor="phone">Your phone <span className="text-primary-1">*</span></label>
												<input type="text" className="form-control border rounded-3" id="phone" name="phone" placeholder="+01 234 567 89" aria-label="phone" />
											</div>
											<div className="col-md-6">
												<label className="mb-1 mt-3 text-dark" htmlFor="subject">Subject <span className="text-primary-1">*</span></label>
												<input type="text" className="form-control border rounded-3" id="subject" name="subject" placeholder="I want to contact for...." aria-label="subject" />
											</div>
											<div className="col-12">
												<label className="mb-1 mt-3 text-dark" htmlFor="message">Message <span className="text-primary-1">*</span></label>
												<textarea className="form-control border rounded-3 pb-10" id="message" name="message" placeholder="Your message here...." aria-label="With textarea" />
											</div>
											<div className="col-12">
												<button type="submit" className="btn btn-gradient mt-3">
													Send Message
													<i className="ri-arrow-right-up-line" />
												</button>
											</div>
										</div>
									</form>
								</div>
								<div className="z-0 bg-primary-dark rectangle-bg z-1 rounded-3" />
							</div>
						</div>
					</div>
				</div>
				<div className="scroll-move-right position-absolute bottom-0 start-50 translate-middle-x bg-900 overflow-hidden">
					<div className="wow img-custom-anim-top">
						<h3 className="stroke fs-280 text-lowercase text-900 mb-0 lh-1">iam.shadi.tech</h3>
					</div>
				</div>
			</section>
				</div>

			</Layout>
		</>
	)
}