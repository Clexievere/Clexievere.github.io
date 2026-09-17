document.documentElement.classList.add('js');

// Locate the theme control and read the user's saved or system preference.
const themeToggle = document.querySelector('.theme-toggle');
const themeIcon = themeToggle?.querySelector('i');
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('#nav-menu');
const backToTop = document.querySelector('.back-to-top');
const footer = document.querySelector('footer');
const savedTheme = localStorage.getItem('theme');
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
	localStorage.setItem('theme', nextTheme);
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

// Show the floating control after the user has moved away from the top.
window.addEventListener('scroll', () => {
	const footerInView = footer ? footer.getBoundingClientRect().top < window.innerHeight : false;

	backToTop?.classList.toggle('is-visible', window.scrollY > 500 && !footerInView);
}, { passive: true });

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
	// Optional fields: previewImage, previewClass, previewLabel, icon, status, link, linkLabel, placeholder.
	// If previewImage exists, clicking the card opens that image in a centered lightbox.
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
	},
	{
		title: 'Remote Workflow Project',
		category: 'operations',
		categoryLabel: 'Coming Next',
		description: 'A future case study showing how technical thinking can improve organization, support, or team operations.',
		tags: ['Operations', 'Automation', 'Support'],
		previewClass: 'project-preview-next',
		previewLabel: 'Next project slot',
		icon: 'bx bx-lock-alt',
		status: 'Details to be unlocked',
		link: '#',
		linkLabel: 'Explore',
		placeholder: true
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
					<img class="project-preview-image" src="${project.previewImage}" alt="${project.title} preview" />
				` : `
					<i class="${project.icon}"></i>
					<span>${project.previewLabel}</span>
				`}
			</div>
			<div class="project-card-content">
				<p class="project-category">${project.categoryLabel}</p>
				<h3>${project.title}</h3>
				<p>${project.description}</p>
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
		window.addEventListener('scroll', updateServicesReveal, { passive: true });
		window.addEventListener('resize', updateServicesReveal);
	}

	[skillSection, toolsSection].forEach((section) => {
		if (!section) return;

		const updateGridReveal = () => {
			const rect = section.getBoundingClientRect();
			const isVisibleInViewport = rect.top < window.innerHeight * 0.9 && rect.bottom > window.innerHeight * 0.25;

			section.classList.toggle('is-visible', isVisibleInViewport);
		};

		updateGridReveal();
		window.addEventListener('scroll', updateGridReveal, { passive: true });
		window.addEventListener('resize', updateGridReveal);
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
