document.documentElement.classList.add('js');

// Locate the theme control and read the user's saved or system preference.
const themeToggle = document.querySelector('.theme-toggle');
const themeIcon = themeToggle?.querySelector('i');
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('#nav-menu');
const backToTop = document.querySelector('.back-to-top');
const footer = document.querySelector('footer');
let savedTheme = null;
try {
	savedTheme = localStorage.getItem('theme');
} catch {
	// Storage can be blocked (e.g. some private modes); fall back to the system preference.
}
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Keep the document theme, button label, state, and icon synchronized.
function setTheme(theme) {
	const isDark = theme === 'dark';

	document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
	themeToggle?.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
	themeToggle?.setAttribute('aria-pressed', String(isDark));
	themeIcon?.classList.toggle('bx-sun', isDark);
	themeIcon?.classList.toggle('bx-moon', !isDark);
}

// Apply the saved preference, falling back to the operating system preference.
setTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

// Switch themes and remember the user's choice when the button is pressed.
themeToggle?.addEventListener('click', () => {
	const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';

	setTheme(nextTheme);
	try {
		localStorage.setItem('theme', nextTheme);
	} catch {
		// The choice still applies for this visit even if it can't be saved.
	}
});

// Open or close the mobile navigation and keep its accessible state updated.
function setMenuState(isOpen) {
	navMenu?.classList.toggle('is-open', isOpen);
	menuToggle?.setAttribute('aria-expanded', String(isOpen));
	menuToggle?.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
	menuToggle?.querySelector('i')?.classList.toggle('bx-x', isOpen);
	menuToggle?.querySelector('i')?.classList.toggle('bx-menu', !isOpen);
}

menuToggle?.addEventListener('click', () => {
	setMenuState(!navMenu?.classList.contains('is-open'));
});

navMenu?.querySelectorAll('a').forEach((link) => {
	link.addEventListener('click', () => setMenuState(false));
});

document.addEventListener('keydown', (event) => {
	if (event.key === 'Escape') {
		setMenuState(false);
	}
});

// Move decorative figures gently according to each section's position in the viewport.
const decoratedSections = document.querySelectorAll('main section');
let figureFrameRequested = false;

function updateFigureParallax() {
	decoratedSections.forEach((section) => {
		const bounds = section.getBoundingClientRect();
		const distanceFromCenter = window.innerHeight / 2 - (bounds.top + bounds.height / 2);
		const shift = Math.max(-18, Math.min(18, distanceFromCenter * 0.04));

		section.style.setProperty('--figure-shift', `${shift}px`);
	});
	figureFrameRequested = false;
}

window.addEventListener('scroll', () => {
	if (!figureFrameRequested && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		window.requestAnimationFrame(updateFigureParallax);
		figureFrameRequested = true;
	}
}, { passive: true });

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
	updateFigureParallax();
}

// Layout-reading scroll checks share one handler and run at most once per animation frame.
const scrollChecks = [];
let scrollChecksRequested = false;

function runScrollChecks() {
	scrollChecks.forEach((check) => check());
	scrollChecksRequested = false;
}

function requestScrollChecks() {
	if (!scrollChecksRequested) {
		window.requestAnimationFrame(runScrollChecks);
		scrollChecksRequested = true;
	}
}

window.addEventListener('scroll', requestScrollChecks, { passive: true });
window.addEventListener('resize', requestScrollChecks);

// Show the floating control after the user has moved away from the top.
scrollChecks.push(() => {
	const footerInView = footer ? footer.getBoundingClientRect().top < window.innerHeight : false;

	backToTop?.classList.toggle('is-visible', window.scrollY > 500 && !footerInView);
});

if (footer && 'IntersectionObserver' in window) {
	const footerObserver = new IntersectionObserver(([entry]) => {
		backToTop?.classList.toggle('is-footer-visible', entry.isIntersecting);
	}, { threshold: 0.05 });

	footerObserver.observe(footer);
}

backToTop?.addEventListener('click', () => {
	window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Project gallery state: filters, carousel controls, and the card data source used to render each entry.
const projectFilters = document.querySelectorAll('.project-filter');
const projectGallery = document.querySelector('#project-gallery');
const projectCarousel = document.querySelector('.project-gallery');
const projectCarouselWindow = document.querySelector('.project-gallery-window');
const projectCarouselPrev = document.querySelector('.project-carousel-prev');
const projectCarouselNext = document.querySelector('.project-carousel-next');
const projectData = [
	// Add new portfolio items here. Each object creates one project card automatically.
	// Current category set: all, technical, web, operations, media.
	// Use operations for workflow, admin systems, inbox/process improvements, reporting work, and other operational tooling.
	// Use media for content-focused or visual showcase work; keep the filter list lean and only add more categories if they become truly needed.
	// Required fields: title, category, categoryLabel, description, tags.
	// Optional fields: highlight, previewImage, previewClass, previewLabel, icon, status, link, linkLabel, placeholder.
	// If previewImage exists, clicking the card opens that image in a centered lightbox.
	{
		title: 'Inbox & Calendar Management',
		category: 'operations',
		categoryLabel: 'Admin & Operations',
		description: 'Fifteen emails triaged against client rules: an emergency escalated, a phishing attempt caught, and a conflict-free week scheduled across time zones.',
		highlight: 'Shows the judgment calls I keep manual, like catching a phishing attempt.',
		tags: ['Google Calendar', 'Email Triage', 'Scheduling'],
		previewClass: 'project-preview-portfolio',
		icon: 'bx bx-calendar',
		previewImage: 'resources/images/samples/inbox-calendar-management.webp',
		status: 'Sample work · fictional client',
		link: 'resources/samples/inbox-calendar-management.pdf',
		linkLabel: 'View document'
	},
	{
		title: 'Document Prep Package',
		category: 'operations',
		categoryLabel: 'Admin & Operations',
		description: 'Three branded, reusable Word templates for a property manager: a welcome letter, a maintenance request form, and a move-in checklist.',
		highlight: 'Reflects my law firm work drafting documents from templates.',
		tags: ['Microsoft Word', 'Templates', 'Documentation'],
		previewClass: 'project-preview-portfolio',
		icon: 'bx bx-file',
		previewImage: 'resources/images/samples/document-prep-package.webp',
		status: 'Sample work · fictional client',
		link: 'resources/samples/document-prep-package.pdf',
		linkLabel: 'View document'
	},
	{
		title: 'Tenant Records Cleanup',
		category: 'operations',
		categoryLabel: 'Admin & Operations',
		description: 'A messy shared tenant list cleaned into one traceable record set, with duplicates merged and uncertain values flagged instead of guessed.',
		highlight: 'Shows how I handle messy data: flag what\'s uncertain, never guess or delete.',
		tags: ['Microsoft Excel', 'Data Cleanup', 'Validation'],
		previewClass: 'project-preview-portfolio',
		icon: 'bx bx-spreadsheet',
		previewImage: 'resources/images/samples/tenant-records-cleanup.webp',
		status: 'Sample work · fictional client',
		link: 'resources/samples/tenant-records-cleanup.pdf',
		linkLabel: 'View document'
	},
	{
		title: 'Research Brief: Maintenance Tool',
		category: 'operations',
		categoryLabel: 'Admin & Operations',
		description: 'A recommendation-first brief comparing three maintenance request tools on price, ease of use, and limits, with dated sources.',
		highlight: 'Builds on my legislation research, where every claim had to match a source.',
		tags: ['Google Docs', 'Research', 'Reporting'],
		previewClass: 'project-preview-portfolio',
		icon: 'bx bx-search-alt',
		previewImage: 'resources/images/samples/research-brief-maintenance-tool.webp',
		status: 'Sample work · fictional client',
		link: 'resources/samples/research-brief-maintenance-tool.pdf',
		linkLabel: 'View document'
	},
	{
		title: 'Hiraya Coffee House: Seasonal Drink Poster',
		category: 'media',
		categoryLabel: 'Design & Media',
		description: 'A launch poster for an ube latte, with soft lavender tones and a warm, hand-drawn feel.',
		tags: ['Canva', 'Poster Design', 'Food & Beverage'],
		previewClass: 'project-preview-portfolio',
		icon: 'bx bx-image',
		previewImage: 'resources/images/posters/hiraya-coffee-house.webp',
		status: 'Sample work · fictional brand'
	},
	{
		title: 'Luntian Plant Studio: Weekend Sale Poster',
		category: 'media',
		categoryLabel: 'Design & Media',
		description: 'A sale poster that leads with the offer, set in calm greens with a clear weekend-only date line.',
		tags: ['Canva', 'Poster Design', 'Retail'],
		previewClass: 'project-preview-portfolio',
		icon: 'bx bx-image',
		previewImage: 'resources/images/posters/luntian-plant-studio.webp',
		status: 'Sample work · fictional brand'
	},
	{
		title: 'Tala Bakeshop: Bakery Poster',
		category: 'media',
		categoryLabel: 'Design & Media',
		description: 'A morning-bake poster for ensaymada, with a vintage bakeshop frame and a clear pre-order call to action.',
		tags: ['Canva', 'Poster Design', 'Bakery'],
		previewClass: 'project-preview-portfolio',
		icon: 'bx bx-image',
		previewImage: 'resources/images/posters/tala-bakeshop.webp',
		status: 'Sample work · fictional brand'
	},
	{
		title: 'Ghidra-GDB Integration',
		category: 'technical',
		categoryLabel: 'Research & Development',
		description: 'A reverse engineering workflow designed to reduce manual switching between Ghidra and GDB.',
		tags: ['Python', 'Ghidra', 'GDB'],
		previewClass: 'project-preview-thesis',
		previewLabel: 'Preview placeholder',
		icon: 'bx bx-code-block',
		previewImage: null,
		status: 'Case study coming soon',
		link: '#',
		linkLabel: 'Explore'
	},
	{
		title: 'Personal Portfolio',
		category: 'web',
		categoryLabel: 'Web & Presentation',
		description: 'A responsive portfolio that brings together technical experience, remote support, and operations work.',
		tags: ['HTML', 'CSS', 'JavaScript'],
		previewClass: 'project-preview-portfolio',
		previewLabel: 'Preview placeholder',
		icon: 'bx bx-layout',
		status: 'Live project in progress',
		link: 'https://clexievere.github.io/',
		linkLabel: 'Explore'
	},
	{
		title: 'Workflow Automation Pilot',
		category: 'technical',
		categoryLabel: 'Systems & Ops',
		description: 'Streamlining internal processes with repeated task handling, cleaner steps, and stronger documentation.',
		tags: ['Python', 'Automation', 'Operations'],
		previewClass: 'project-preview-portfolio',
		previewLabel: 'Automation preview',
		icon: 'bx bx-cog',
		status: 'Concept in progress',
		link: '#',
		linkLabel: 'Explore'
	}
];
let projectCards = [];
let projectCarouselIndex = 0;
let activeProjectFilter = 'all';

// Centered preview modal used when a card with an image is clicked.
const projectLightbox = document.createElement('div');
projectLightbox.className = 'project-lightbox';
projectLightbox.setAttribute('aria-hidden', 'true');
projectLightbox.innerHTML = `
	<div class="project-lightbox__panel" role="dialog" aria-modal="true" aria-label="Project preview">
		<button class="project-lightbox__close" type="button" aria-label="Close project preview">×</button>
		<img class="project-lightbox__image" src="" alt="Project preview" />
	</div>
`;
document.body.appendChild(projectLightbox);

function closeProjectLightbox() {
	projectLightbox.classList.remove('is-open');
	projectLightbox.setAttribute('aria-hidden', 'true');
	projectLightbox.querySelector('.project-lightbox__image').src = '';
	projectLightbox.querySelector('.project-lightbox__image').alt = 'Project preview';
}

function openProjectLightbox(imageSrc, altText) {
	if (!imageSrc) return;

	const lightboxImage = projectLightbox.querySelector('.project-lightbox__image');
	lightboxImage.src = imageSrc;
	lightboxImage.alt = altText || 'Project preview';
	projectLightbox.classList.add('is-open');
	projectLightbox.setAttribute('aria-hidden', 'false');
}

projectLightbox.addEventListener('click', (event) => {
	if (event.target === projectLightbox) {
		closeProjectLightbox();
	}
});

projectLightbox.querySelector('.project-lightbox__close').addEventListener('click', closeProjectLightbox);

document.addEventListener('keydown', (event) => {
	if (event.key === 'Escape' && projectLightbox.classList.contains('is-open')) {
		closeProjectLightbox();
	}
});

function renderProjects(selectedCategory = 'all') {
	if (!projectGallery) return;

	activeProjectFilter = selectedCategory;
	const filteredProjects = projectData.filter((project) => selectedCategory === 'all' || project.category === selectedCategory);

	// Rebuild the gallery from the data array so new cards can be added without editing the section markup.

	projectGallery.innerHTML = filteredProjects.map((project) => `
		<article class="project-card${project.placeholder ? ' project-card-placeholder' : ''}" data-category="${project.category}">
			<div class="project-preview ${project.previewClass}" aria-hidden="true">
				<div class="preview-browser-bar"><i></i><i></i><i></i></div>
				${project.previewImage ? `
					<img class="project-preview-image" src="${project.previewImage}" alt="${project.title} preview" width="935" height="1210" loading="lazy" decoding="async" />
				` : `
					<i class="${project.icon}"></i>
					<span>${project.previewLabel}</span>
				`}
			</div>
			<div class="project-card-content">
				<p class="project-category">${project.categoryLabel}</p>
				<h3>${project.title}</h3>
				<p>${project.description}</p>
				${project.highlight ? `<p class="project-highlight">${project.highlight}</p>` : ''}
				<ul class="project-tags" aria-label="Project details">
					${project.tags.map((tag) => `<li>${tag}</li>`).join('')}
				</ul>
				<div class="project-card-footer">
					<span class="project-link-placeholder">${project.status}</span>
					${project.link && project.link !== '#' ? `
						<a class="project-explore-link" href="${project.link}" target="_blank" rel="noopener noreferrer">${project.linkLabel || 'Explore'}</a>
					` : ''}
				</div>
			</div>
		</article>
	`).join('');

	projectCards = [...projectGallery.querySelectorAll('.project-card')];
	projectCards.forEach((card, index) => {
		card.classList.add('is-visible');
		card.style.setProperty('--project-entry-x', index % 2 === 0 ? '42px' : '-42px');
		card.classList.toggle('is-clickable', Boolean(card.querySelector('.project-preview-image')));

		// Cards with media open in the modal; the Explore button remains a separate link action.
		card.setAttribute('tabindex', card.querySelector('.project-preview-image') ? '0' : '-1');
		card.setAttribute('role', card.querySelector('.project-preview-image') ? 'button' : 'article');
		card.setAttribute('aria-label', card.querySelector('.project-preview-image') ? `Open ${card.querySelector('h3')?.textContent || 'project'} preview` : 'Project card');

		card.addEventListener('click', (event) => {
			if (event.target.closest('.project-explore-link')) return;
			const image = card.querySelector('.project-preview-image');
			if (!image) return;
			openProjectLightbox(image.src, image.alt);
		});

		card.addEventListener('keydown', (event) => {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				const image = card.querySelector('.project-preview-image');
				if (image) openProjectLightbox(image.src, image.alt);
			}
		});
	});

	projectCarouselIndex = 0;
	updateProjectCarousel();
}

function updateProjectCarousel() {
	if (!projectCarousel || !projectCarouselWindow || !projectCards.length) return;

	// Keep the carousel aligned to the first card width and visible item count for smooth scrolling.
	const galleryStyle = window.getComputedStyle(projectCarousel);
	const gap = Number.parseFloat(galleryStyle.columnGap || galleryStyle.gap || '0');
	const firstCardWidth = projectCards[0].getBoundingClientRect().width;
	const stepWidth = firstCardWidth + gap;
	const maxVisible = Math.max(1, Math.min(projectCards.length, Math.floor((projectCarouselWindow.clientWidth + gap) / stepWidth)));
	const maxIndex = Math.max(0, projectCards.length - maxVisible);

	projectCarouselIndex = Math.min(projectCarouselIndex, maxIndex);
	projectCarousel.style.transform = `translateX(-${projectCarouselIndex * stepWidth}px)`;

	if (projectCards.length <= maxVisible) {
		projectCarouselPrev?.classList.add('is-hidden');
		projectCarouselNext?.classList.add('is-hidden');
		return;
	}

	projectCarouselPrev?.classList.toggle('is-hidden', projectCarouselIndex === 0);
	projectCarouselNext?.classList.toggle('is-hidden', projectCarouselIndex >= maxIndex);
}

projectFilters.forEach((filterButton) => {
	filterButton.addEventListener('click', () => {
		const selectedCategory = filterButton.dataset.filter;

		projectFilters.forEach((button) => {
			const isActive = button === filterButton;
			button.classList.toggle('is-active', isActive);
			button.setAttribute('aria-pressed', String(isActive));
		});

		renderProjects(selectedCategory);
	});
});

projectCarouselPrev?.addEventListener('click', () => {
	if (projectCarouselIndex > 0) {
		projectCarouselIndex -= 1;
		updateProjectCarousel();
	}
});

projectCarouselNext?.addEventListener('click', () => {
	if (!projectCards.length) return;

	const galleryStyle = window.getComputedStyle(projectCarousel);
	const gap = Number.parseFloat(galleryStyle.columnGap || galleryStyle.gap || '0');
	const firstCardWidth = projectCards[0].getBoundingClientRect().width;
	const stepWidth = firstCardWidth + gap;
	const maxVisible = Math.max(1, Math.min(projectCards.length, Math.floor((projectCarouselWindow.clientWidth + gap) / stepWidth)));
	const maxIndex = Math.max(0, projectCards.length - maxVisible);

	if (projectCarouselIndex < maxIndex) {
		projectCarouselIndex += 1;
		updateProjectCarousel();
	}
});

window.addEventListener('resize', updateProjectCarousel);
renderProjects(activeProjectFilter);

// Switch between the available service panels and keep the section state in sync.
const serviceTabs = document.querySelectorAll('.service-tab');
const servicePanels = document.querySelectorAll('.service-panel');

serviceTabs.forEach((tab) => {
	tab.addEventListener('click', () => {
		const selectedService = tab.dataset.service;

		serviceTabs.forEach((button) => {
			const isActive = button === tab;
			button.classList.toggle('is-active', isActive);
			button.setAttribute('aria-selected', String(isActive));
		});

		servicePanels.forEach((panel) => {
			const isVisible = panel.dataset.servicePanel === selectedService;
			panel.classList.toggle('is-active', isVisible);
			if (isVisible) {
				panel.removeAttribute('hidden');
			} else {
				panel.setAttribute('hidden', 'hidden');
			}
		});
	});
});

// Reveal sections and longer About subsections as they enter the viewport.
const revealTargets = document.querySelectorAll([
	'main section:not(#hero)',
	'.about-facts > div',
	'.about-details > div',
	'.about-timeline .timeline-item'
].join(', '));
const servicesSection = document.querySelector('#services');
const skillSection = document.querySelector('#skills');
const toolsSection = document.querySelector('#tools');
let previousScrollY = window.scrollY;
let scrollDirection = 'down';

window.addEventListener('scroll', () => {
	scrollDirection = window.scrollY < previousScrollY ? 'up' : 'down';
	previousScrollY = window.scrollY;
}, { passive: true });

if ('IntersectionObserver' in window) {
	const revealObserver = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.remove('is-visible', 'is-returning');
				void entry.target.offsetWidth;
				entry.target.classList.add(scrollDirection === 'up' ? 'is-returning' : 'is-visible');
			} else {
				entry.target.classList.remove('is-visible', 'is-returning');
			}
		});
	}, { rootMargin: '-8% 0px -18% 0px', threshold: 0.12 });

	revealTargets.forEach((target) => {
		target.classList.add('scroll-reveal');
		revealObserver.observe(target);
	});

	if (servicesSection) {
		const updateServicesReveal = () => {
			const rect = servicesSection.getBoundingClientRect();
			const isVisibleInViewport = rect.top < window.innerHeight * 0.9 && rect.bottom > window.innerHeight * 0.15;

			servicesSection.classList.toggle('is-visible', isVisibleInViewport);
		};

		updateServicesReveal();
		scrollChecks.push(updateServicesReveal);
	}

	[skillSection, toolsSection].forEach((section) => {
		if (!section) return;

		const updateGridReveal = () => {
			const rect = section.getBoundingClientRect();
			const isVisibleInViewport = rect.top < window.innerHeight * 0.9 && rect.bottom > window.innerHeight * 0.25;

			section.classList.toggle('is-visible', isVisibleInViewport);
		};

		updateGridReveal();
		scrollChecks.push(updateGridReveal);
	});
} else {
	revealTargets.forEach((target) => target.classList.add('is-visible'));
	if (servicesSection) {
		servicesSection.classList.add('is-visible');
	}
	if (skillSection) {
		skillSection.classList.add('is-visible');
	}
	if (toolsSection) {
		toolsSection.classList.add('is-visible');
	}
}

// Load the YouTube player only when the visitor asks for it.
document.querySelectorAll('.video-facade').forEach((facade) => {
	facade.addEventListener('click', () => {
		const iframe = document.createElement('iframe');

		iframe.src = `https://www.youtube-nocookie.com/embed/${facade.dataset.videoId}?autoplay=1`;
		iframe.title = facade.dataset.videoTitle || 'YouTube video';
		iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
		iframe.allowFullscreen = true;
		facade.replaceWith(iframe);
		iframe.focus();
	}, { once: true });
});

// Send the contact form in the background and confirm the result in a popup instead of leaving the page.
const contactForm = document.querySelector('.contact-form');
const formDialog = document.createElement('div');
formDialog.className = 'project-lightbox form-dialog';
formDialog.setAttribute('aria-hidden', 'true');
formDialog.innerHTML = `
	<div class="form-dialog__panel" role="dialog" aria-modal="true" aria-labelledby="form-dialog-title" aria-describedby="form-dialog-text">
		<i class="form-dialog__icon bx" aria-hidden="true"></i>
		<h3 class="form-dialog__title" id="form-dialog-title"></h3>
		<p class="form-dialog__text" id="form-dialog-text"></p>
		<button class="button button-primary form-dialog__ok" type="button">OK</button>
	</div>
`;
document.body.appendChild(formDialog);

const formDialogMessages = {
	success: { icon: 'bx-check-circle', title: 'Message sent', text: 'Thanks for reaching out. I\'ll get back to you soon.' },
	error: { icon: 'bx-error-circle', title: 'Something went wrong', text: 'Your message wasn\'t sent. Please try again, or reach me on LinkedIn.' }
};

function openFormDialog(state) {
	const message = formDialogMessages[state];

	formDialog.classList.toggle('is-error', state === 'error');
	formDialog.querySelector('.form-dialog__icon').className = `form-dialog__icon bx ${message.icon}`;
	formDialog.querySelector('.form-dialog__title').textContent = message.title;
	formDialog.querySelector('.form-dialog__text').textContent = message.text;
	formDialog.classList.add('is-open');
	formDialog.setAttribute('aria-hidden', 'false');
	formDialog.querySelector('.form-dialog__ok').focus();
}

function closeFormDialog() {
	if (!formDialog.classList.contains('is-open')) return;

	formDialog.classList.remove('is-open');
	formDialog.setAttribute('aria-hidden', 'true');
	contactForm?.querySelector('[type="submit"]')?.focus();
}

formDialog.querySelector('.form-dialog__ok').addEventListener('click', closeFormDialog);
formDialog.addEventListener('click', (event) => {
	if (event.target === formDialog) {
		closeFormDialog();
	}
});
document.addEventListener('keydown', (event) => {
	if (event.key === 'Escape') {
		closeFormDialog();
	}
});

// Without fetch, the form falls back to a normal Formspree submission.
if (contactForm && 'fetch' in window) {
	contactForm.addEventListener('submit', async (event) => {
		event.preventDefault();

		const submitButton = contactForm.querySelector('[type="submit"]');
		const submitLabel = submitButton.textContent;

		submitButton.disabled = true;
		submitButton.textContent = 'Sending…';

		try {
			const response = await fetch(contactForm.action, {
				method: 'POST',
				body: new FormData(contactForm),
				headers: { Accept: 'application/json' }
			});

			if (!response.ok) throw new Error(`Form submission failed with status ${response.status}`);

			contactForm.reset();
			openFormDialog('success');
		} catch {
			openFormDialog('error');
		} finally {
			submitButton.disabled = false;
			submitButton.textContent = submitLabel;
		}
	});
}
