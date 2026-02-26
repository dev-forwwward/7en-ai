// Always start at top (incl. Safari BFCache/back-forward)
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

window.addEventListener('pageshow', (e) => {
	// When coming from bfcache, browsers restore scroll no matter what.
	if (e.persisted) {
		window.scrollTo(0, 0);
	}
});

document.addEventListener("DOMContentLoaded", function () {
	// -------------------------
	// LENIS init (global)
	// -------------------------
	window.lenis = new Lenis({ smooth: true, autoRaf: false });

	// ✅ HARD reset scroll immediately (both native + Lenis)
	window.scrollTo(0, 0);
	lenis.scrollTo(0, { immediate: true });

	// ✅ Make sure Lenis doesn't "snap back" to an old target value
	lenis.stop();
	lenis.scrollTo(0, { immediate: true });
	lenis.start();

	window.addEventListener("load", () => {
		// Run after images/fonts/layout settle
		window.scrollTo(0, 0);
		lenis.scrollTo(0, { immediate: true });

		// If any triggers refresh here, do it AFTER forcing top
		ScrollTrigger.refresh(true);

		// One more microtask/frame to beat Safari jumps
		requestAnimationFrame(() => {
			window.scrollTo(0, 0);
			lenis.scrollTo(0, { immediate: true });
		});
	});

	// ✅ Lenis scrolls on <html>
	const SCROLLER = document.documentElement;

	// ✅ Proxy ScrollTrigger to Lenis
	ScrollTrigger.scrollerProxy(SCROLLER, {
		scrollTop(value) {
			if (arguments.length) {
				lenis.scrollTo(value, { immediate: true });
			} else {
				return (
					lenis.scroll ??
					lenis.animatedScroll ??
					lenis.targetScroll ??
					SCROLLER.scrollTop
				);
			}
		},
		getBoundingClientRect() {
			return { top: 0, left: 0, width: innerWidth, height: innerHeight };
		},
		pinType: "fixed"
	});

	// ✅ Make ALL ScrollTriggers use the same scroller
	ScrollTrigger.defaults({ scroller: SCROLLER });

	// Keep in sync
	lenis.on("scroll", ScrollTrigger.update);
	ScrollTrigger.addEventListener("refresh", () => {
		if (typeof lenis.resize === "function") lenis.resize();
	});

	// Drive Lenis via GSAP ticker
	gsap.ticker.add((time) => lenis.raf(time * 1000));
	gsap.ticker.lagSmoothing(0);




	// -------------------------
	// NAVBAR (GLOBAL, RESPONSIVE)
	// -------------------------
	const navbar = document.querySelector(".navbar-wrapper");

	if (navbar) {
		const mmNav = gsap.matchMedia();

		mmNav.add(
			{
				desktop: "(min-width: 992px)",
				mobile: "(max-width: 991px)"
			},
			(context) => {
				const { desktop, mobile } = context.conditions;

				// initial state
				gsap.set(navbar, desktop
					? { yPercent: -100, opacity: 1 }
					: { opacity: 0 }
				);

				// animate in
				gsap.to(navbar, desktop
					? {
						yPercent: 0,
						duration: 1,
						ease: "power2.out"
					}
					: {
						opacity: 1,
						duration: 0.4,
						ease: "power2.out"
					}
				);

				// cleanup on breakpoint change
				return () => {
					gsap.killTweensOf(navbar);
				};
			}
		);
	}

	// -------------------------
	// HELPERS: rebuild reveals (homepage needs this after pin)
	// -------------------------
	function killRevealTriggers() {
		ScrollTrigger.getAll().forEach((st) => {
			if (st?.vars?.id && String(st.vars.id).startsWith("reveal-")) {
				st.kill();
			}
		});

		// allow re-init
		document
			.querySelectorAll('[data-reveal="true"], [data-reveal-group]')
			.forEach((el) => {
				delete el.dataset.revealInited;
			});
	}

	// -------------------------
	// Homepage hero (only if exists)
	// -------------------------
	const hero = document.querySelector(".section_hero_hp");

	// ✅ Not homepage: init reveals immediately and exit
	if (!hero) {
		initReveals(SCROLLER);
		setTimeout(() => ScrollTrigger.refresh(), 100);
		return;
	}

	// -------------------------
	// HOMEPAGE HERO INTRO LOCK
	// -------------------------
	let scrollLocked = true;
	lenis.stop();

	const preventScroll = (e) => {
		if (!scrollLocked) return;
		e.preventDefault();
		e.stopImmediatePropagation();
		return false;
	};

	window.addEventListener("wheel", preventScroll, { passive: false });
	window.addEventListener("touchmove", preventScroll, { passive: false });

	const preventKeys = (e) => {
		if (!scrollLocked) return;
		if (
			["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Space", "Home", "End"].includes(
				e.code
			)
		) {
			e.preventDefault();
		}
	};
	window.addEventListener("keydown", preventKeys);

	// -------------------------
	// Elements
	// -------------------------
	const human = hero.querySelector(".s_hhp_human_img");
	const title = hero.querySelector(".s_hhp_content_1");
	const divider = hero.querySelector(".divider");
	const imageRec = hero.querySelector(".s_hhp_mask_recognition");
	const text = hero.querySelectorAll(".font-instrument-serif-italic");
	const bg = hero.querySelector(".s_hhp_overlay_bg_image");
	const circle = hero.querySelector(".s_hhp_c2_steps_circle");
	const svgCircle = document.getElementById("c2_svg_circle");
	const circleChild = hero.querySelectorAll(".s_hhp_c2_steps_circle > div");

	const radius = 199;
	const circumference = 2 * Math.PI * radius;
	svgCircle.style.strokeDasharray = circumference;
	svgCircle.style.strokeDashoffset = circumference;

	const items = [title, divider, imageRec, text, circle, circleChild, bg];

	// Prevent first paint flash + establish initial state for hero
	gsap.set(items, { opacity: 0 });
	gsap.set(title, { y: 24 });
	gsap.set(divider, { width: "0%" });
	gsap.set(circle, { scale: 0.5 });
	gsap.set(human, { scale: 1.2 });


	// -------------------------
	// INTRO TIMELINE (responsive)
	// -------------------------
	const mm = gsap.matchMedia();

	mm.add(
		{
			desktop: "(min-width: 992px)",
			mobile: "(max-width: 991px)"
		},
		(context) => {
			const { desktop } = context.conditions;

			const introTL = gsap.timeline({ defaults: { ease: "power2.out" } });

			introTL
				.to(human, { scale: 1, duration: 1.5, ease: "power1.out"})
				.to(
					divider,
					{
						opacity: 1,
						width: desktop ? "85%" : "45%",
						duration: 2
					},
					"<+.2"
				)
				.to(text, { opacity: 1 }, "<+1.2")
				.to(circle, { opacity: 1, scale: 1, duration: 2 }, "<-1")
				.to(imageRec, { opacity: 1, duration: 1 }, "<+1")
				.to(title, { opacity: 1, y: 0, duration: 1 }, "<-.1")
				.to(bg, { opacity: 1, duration: 1 }, "<-.3")
				.add(() => {
					// unlock scroll
					scrollLocked = false;
					lenis.start();

					// create pinned scroll timeline
					createScrollTimeline();

					// ✅ Important order:
					// 1) refresh after pin is created
					ScrollTrigger.refresh();

					// 2) build reveals using the final layout (post-pin)
					killRevealTriggers();
					initReveals(SCROLLER);

					// 3) refresh again so reveal starts are correct
					ScrollTrigger.refresh();

					// cleanup listeners
					window.removeEventListener("wheel", preventScroll);
					window.removeEventListener("touchmove", preventScroll);
					window.removeEventListener("keydown", preventKeys);
				});

			return () => introTL.kill();
		}
	);

	// -------------------------
	// SCROLL TIMELINE (responsive)
	// -------------------------
	function createScrollTimeline() {
		const mmScroll = gsap.matchMedia();

		mmScroll.add(
			{
				desktop: "(min-width: 992px)",
				mobile: "(max-width: 991px)"
			},
			(context) => {
				const { desktop } = context.conditions;

				const scrollTL = gsap.timeline({
					scrollTrigger: {
						trigger: hero,
						scroller: SCROLLER,
						start: "top top",
						end: "+=450%",
						pin: true,
						scrub: true,
						invalidateOnRefresh: true,
						anticipatePin: 1
					}
				});

				scrollTL
					.to(divider, { width: "0%", duration: 0.5 })
					.to(text, { opacity: 0 }, "<+.25")
					.to(imageRec, { opacity: 0 }, "<")
					//   .to(
					//     ".s_hhp_overlay_bg_blur_bottom",
					//     {
					//       height: desktop ? "50%" : "20%"
					//     },
					//     "<"
					//   )
					//   .to(
					//     ".s_hhp_overlay_bg_blur_top",
					//     {
					//       height: desktop ? "60%" : "35%"
					//     },
					//     "<"
					//   )
					.to(
						title,
						{ y: `-=${window.innerHeight}*1.2`, duration: 1, ease: "linear" },
						"<-.2"
					)
					.to(human, { filter: "blur(18px)", duration: 1, ease: "power2.out" }, "-=.9")
					.to(human, { delay: 0.4, opacity: 0, duration: 1.15, ease: "power2.out" }, "<")
					.to(title, { opacity: 0, duration: 0.5, ease: "power2.out" }, "<")
					.to(
						".s_hhp_overlay_bg_gradient-copy",
						{ opacity: 0, duration: 2, ease: "power2.out" },
						"<-.1"
					)
					.to(
						".s_hhp_overlay_bg_blur_top, .s_hhp_overlay_bg_blur_bottom",
						{ height: "22%", ease: "power2.out" },
						"<"
					)
					.to(
						circle,
						{
							width: desktop ? "34.375rem" : "84vw",
							height: desktop ? "34.375rem" : "84vw",
							duration: desktop ? 0.5 : 0.45,
							ease: "power3.out",
							onStart: () => circle.classList.add("expand"),
							onReverseComplete: () => circle.classList.remove("expand")
						},
						"<-.01"
					)
					.to(
						circleChild,
						{
							opacity: 1,
							duration: 0.8,
							stagger: 0.15,
							ease: "power2.out",
							onStart: () => circle.classList.add("reduce-opacity"),
							onReverseComplete: () => circle.classList.remove("reduce-opacity")
						},
						"<"
					)
					.to(".s_hhp_c2_text_block_container:nth-child(1)", { opacity: 1, duration: 0.1 }, "-=.15")
					.fromTo(
						svgCircle,
						{ strokeDashoffset: circumference },
						{ strokeDashoffset: 0, duration: 2, ease: "none" },
						"<-.5"
					)
					.to(".s_hhp_overlay_bg_blur_top, .s_hhp_overlay_bg_blur_bottom",
						{ opacity: 0, duration: 1, ease: "power2.out" },
						"<-1"
					)
					.to(".s_hhp_c2_text_block_container:nth-child(1)", { opacity: 0, duration: 0.05, ease: "none" }, "-=1.45")
					.to(".s_hhp_c2_text_block_container:nth-child(2)", { opacity: 1, duration: 0.05, ease: "none" }, "-=1.4")
					.to(".s_hhp_c2_text_block_container:nth-child(2)", { opacity: 0, duration: 0.05, ease: "none" }, "-=.9")
					.to(".s_hhp_c2_text_block_container:nth-child(3)", { opacity: 1, duration: 0.05, ease: "none" }, "-=.85")
					.to(".s_hhp_c2_text_block_container:nth-child(3)", { opacity: 0, duration: 0.05, ease: "none" }, "-=0.48")
					.to(".s_hhp_c2_text_block_container:nth-child(4)", { opacity: 1, duration: 0.05, ease: "none" }, "-=0.44")
					.to({}, { duration: 0.4 });

				return () => scrollTL.kill();
			}
		);
	}
});