// Navigation overlay, active link + scroll reveal (no inline onclick).
const myNav = document.getElementById("myNav");
const openBtn = document.getElementById("openBtn");
const closeBtn = document.getElementById("closeBtn");

function openNav() {
	myNav.style.width = "100%";
}

function closeNav() {
	myNav.style.width = "0%";
}

openBtn.addEventListener("click", openNav);
closeBtn.addEventListener("click", closeNav);

const overlayLinks = document.querySelectorAll(".overlay-content a");
overlayLinks.forEach((link) => {
	link.addEventListener("click", closeNav);
});

// Solid header once past the hero.
const siteHeader = document.getElementById("siteHeader");

function syncHeader() {
	siteHeader.classList.toggle("scrolled", window.scrollY > 40);
}

window.addEventListener("scroll", syncHeader, { passive: true });
syncHeader();

// Duplicate career cards once so the row loops seamlessly (no inline onclick).
const journeyTrack = document.querySelector(".journey-track");

if (journeyTrack) {
	const stops = Array.from(journeyTrack.children);
	stops.forEach((stop) => {
		const clone = stop.cloneNode(true);
		clone.setAttribute("aria-hidden", "true");
		journeyTrack.appendChild(clone);
	});
}

// Duplicate achievement cards once so that row loops seamlessly too.
const recordsTrack = document.querySelector(".records-track");

if (recordsTrack) {
	const cards = Array.from(recordsTrack.children);
	cards.forEach((card) => {
		const clone = card.cloneNode(true);
		clone.setAttribute("aria-hidden", "true");
		recordsTrack.appendChild(clone);
	});
}

// Highlight the nav link of the section in view.
const navLinks = document.querySelectorAll(".navigation .links");
const sections = document.querySelectorAll("main section[id]");

if ("IntersectionObserver" in window && sections.length > 0) {
	const navObserver = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					navLinks.forEach((a) => {
						a.classList.toggle(
							"active",
							a.getAttribute("href") === "#" + entry.target.id
						);
					});
				}
			});
		},
		{ rootMargin: "-40% 0px -55% 0px" }
	);
	sections.forEach((s) => navObserver.observe(s));
}

// Soft reveal on scroll (career cards excluded so the whole moving
// row stays fully visible and travels simultaneously).
// Soft reveal on scroll (moving rows excluded so they stay fully
// visible and travel simultaneously).
const revealTargets = document.querySelectorAll(
	".bio-center, .bio-left, .bio-right, blockquote, .legacy-text, .legacy-sign"
);
revealTargets.forEach((el) => el.classList.add("reveal"));

if ("IntersectionObserver" in window) {
	const revealObserver = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add("visible");
					revealObserver.unobserve(entry.target);
				}
			});
		},
		{ threshold: 0.12 }
	);
	revealTargets.forEach((el) => revealObserver.observe(el));
} else {
	revealTargets.forEach((el) => el.classList.add("visible"));
}
