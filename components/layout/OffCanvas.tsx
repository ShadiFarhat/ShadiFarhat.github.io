import Link from 'next/link'

export default function OffCanvas({ isOffCanvas, handleOffCanvas }: any) {
	return (
		<>
			{/* offCanvas-menu */}
			<div className={`offCanvas__info ${isOffCanvas ? 'active' : ''}`}>
					<div className="offCanvas__close-icon menu-close" onClick={handleOffCanvas}>
						<button><i className="ri-close-line" /></button>
					</div>
					<div className="offCanvas__logo mb-5">
						<h3 className="mb-0">Get in touch</h3>
					</div>
					<div className="offCanvas__side-info mb-30">
						<div className="contact-list mb-30">
							<p className="fs-6 fw-medium text-200 mb-5">I'm always excited to take on new projects and collaborate with innovative minds.</p>
							<div className="mb-3">
								<span className="text-400 fs-5">Phone Number</span>
								<p className="mb-0">+961 76 938 653</p>
							</div>
							<div className="mb-3">
								<span className="text-400 fs-5">Email</span>
								<p className="mb-0">shadifarhat98@gmail.com</p>
							</div>
				
							<div className="mb-3">
								<span className="text-400 fs-5">Address</span>
								<p className="mb-0">Lebanon - Beirut</p>
							</div>
						</div>
						<div className="contact-list">
							<p className="text-400 fs-5 mb-2">Social</p>
							<div className="d-md-flex d-none gap-3">
								<Link href="http://facebook.com/shadi.farhat.10" target='_blank'>
									<i className="ri-facebook-circle-fill fs-18" />
								</Link>
								<Link href="https://api.whatsapp.com/send/?phone=96176938653&text&type=phone_number&app_absent=0" target='_blank'>
									<i className="ri-whatsapp-fill fs-18" />
								</Link>
								<Link href="https://www.linkedin.com/in/shadi-farhat-61043a204/" target='_blank'>
									<i className="ri-linkedin-fill fs-18" />
								</Link>
								<Link href="https://github.com/ShadiFarhat" target='_blank'>
									<i className="ri-github-fill fs-18" />
								</Link>
							</div>
						</div>
					</div>
				</div>
			<div className={`offCanvas__overly ${isOffCanvas ? 'active' : ''}`}  onClick={handleOffCanvas}/>
		</>
	)
}
