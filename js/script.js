document.documentElement.classList.add('js');

// Locate the theme control and read the user's saved or system preference.
const themeToggle = document.querySelector('.theme-toggle');
const themeIcon = themeToggle?.querySelector('i');
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('#nav-menu');
const backToTop = document.querySelector('.back-to-top');
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
	backToTop?.classList.toggle('is-visible', window.scrollY > 500);
}, { passive: true });

backToTop?.addEventListener('click', () => {
	window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Filter project cards and bring the first matching category into view.
const projectFilters = document.querySelectorAll('.project-filter');
const projectCards = document.querySelectorAll('.project-card');

projectFilters.forEach((filterButton) => {
	filterButton.addEventListener('click', () => {
		const selectedCategory = filterButton.dataset.filter;
		let firstVisibleCard;

		projectFilters.forEach((button) => {
			const isActive = button === filterButton;

			button.classList.toggle('is-active', isActive);
			button.setAttribute('aria-pressed', String(isActive));
		});

		projectCards.forEach((card) => {
			const isVisible = selectedCategory === 'all' || card.dataset.category === selectedCategory;

			card.classList.toggle('is-filtered-out', !isVisible);
			if (isVisible && !firstVisibleCard) {
				firstVisibleCard = card;
			}
		});

		firstVisibleCard?.scrollIntoView({ behavior: 'smooth', block: 'center' });
	});
});

// Reveal sections as they enter the viewport without hiding content when JavaScript is unavailable.
const revealSections = document.querySelectorAll('main section:not(#hero)');

if ('IntersectionObserver' in window) {
	const revealObserver = new IntersectionObserver((entries, observer) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add('is-visible');
				observer.unobserve(entry.target);
			}
		});
	}, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });

	revealSections.forEach((section) => {
		section.classList.add('scroll-reveal');
		revealObserver.observe(section);
	});
} else {
	revealSections.forEach((section) => section.classList.add('is-visible'));
}
