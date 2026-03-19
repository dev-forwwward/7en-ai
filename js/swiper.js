
document.addEventListener("DOMContentLoaded", function () {
    const pad2 = n => String(n).padStart(2, "0");

    // Collect tags from the real slides (ignore loop clones)
    const baseSlides = Array.from(
        document.querySelectorAll(".slider-why-ai .swiper-slide")
    ).filter(s => !s.classList.contains("swiper-slide-duplicate"));
    const TAGS = baseSlides.map(s => s.dataset.tag || "");

    // SVG circle geometry (keep in sync with CSS/SVG below)
    const R = 20;                                     // radius
    const C = 2 * Math.PI * R;                        // circumference

    function updateActiveBullet(sw) {
        if (!sw.pagination || !sw.pagination.bullets) return;
        sw.pagination.bullets.forEach((b, i) => {
            b.classList.toggle("is-active", i === sw.realIndex);
        });
    }

    function resetAllProgress(sw) {
        if (!sw.pagination || !sw.pagination.bullets) return;
        sw.pagination.bullets.forEach(b => {
            const prog = b.querySelector(".progress");
            if (prog) prog.style.strokeDashoffset = C;    // empty ring
        });
    }

    // Init Hero Tab Swiper - AI Agent page
    var agHeroSwiper = new Swiper(".agent-tab-swiper", {
        effect: "fade",
        fadeEffect: { crossFade: true },
        grabCursor: true,
        pagination: true,
        breakpoints: {
            767: {
                grabCursor: false,
                allowTouchMove: false,
            },
        },
        pagination: {
            el: ".agent-tab-swiper-pagination",
            clickable: true,
        },
        centeredSlides: true,
        slidesPerView: 1,
        spaceBetween: 0,
        autoplay: false,
        loop: true,
        // ── CURRENT: disableOnInteraction:false so autoplay survives tab clicks ──
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        // ── PREVIOUS: disableOnInteraction:true — autoplay stopped on tab click.
        //    Swiper fires its internal interaction handler AFTER the click handler,
        //    so calling autoplay.start() inside the click was always overridden.
        // autoplay: {
        //     delay: 5000,
        //     disableOnInteraction: true,
        // },
        // ─────────────────────────────────────────────────────────────────────────
        on: {
            init() {
                const tabs = document.querySelectorAll('.agent-tab');
                if (window.innerWidth > 767) {
                    tabs.forEach((tab, index) => {
                        tab.addEventListener('click', () => {
                            this.slideToLoop(index);
                        });
                    });
                }

                // Update active state when slide changes
                this.on('slideChange', () => {
                    tabs.forEach(tab => tab.classList.remove('tab-active'));
                    // console.log("realIndex", this.realIndex);
                    tabs[this.realIndex].classList.add('tab-active');
                });
            },
        }
    });

    // Init 'Why' Swiper - AI Agent page
    var swiper = new Swiper(".slider-why-ai", {
        effect: "fade",
        fadeEffect: { crossFade: true },
        grabCursor: false,
        centeredSlides: true,
        slidesPerView: 1,
        spaceBetween: 0,
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        navigation: {
            nextEl: ".swiper-change-slide .swiper-next",
            prevEl: ".swiper-change-slide .swiper-prev",
        },
        pagination: {
            el: ".whyai-bullets .swiper-pagination",
            clickable: true,
            renderBullet: function (index, className) {
                const num = pad2(index + 1);
                const tag = TAGS[index] || "";
                // we set dasharray & initial dashoffset inline to ensure correct geometry
                return `
          <button class="${className} bullet" type="button" aria-label="Go to slide ${num}">
            <span class="bullet__ring" aria-hidden="true">
              <svg viewBox="0 0 44 44" width="44" height="44" role="img" aria-hidden="true" focusable="false">
                <circle class="fill"     r="${R}" cx="22" cy="22" />
                <circle class="progress" r="${R}" cx="22" cy="22"
                        style="stroke-dasharray:${C};stroke-dashoffset:${C}" />
              </svg>
              <span class="bullet__num font-instrument-serif-italic">${num}</span>
            </span>
            <span class="bullet__tag font-instrument-serif-italic">${tag}</span>
          </button>`;
            },
        },
        on: {
            init(sw) {
                updateActiveBullet(sw);
                resetAllProgress(sw);

                const swiperBullets = document.querySelectorAll('button.bullet');
                const swiperBulletsDotNav = document.querySelector('.bullets_swiper_dots_nav');

                // append navigation dot corresponding to total number of bullet buttons
                // must take into account already-existing 'bullets_swiper_dot' element (for reference)
                if (swiperBullets.length > 0) {
                    for (let i = 0; i < swiperBullets.length - 1; i++) {
                        let newDot = document.createElement("div");
                        newDot.classList.add('bullets_swiper_dot');
                        swiperBulletsDotNav.appendChild(newDot);
                    }

                    document.querySelectorAll('.bullets_swiper_dot').forEach((dot, index) => {
                        dot.addEventListener('click', () => {
                            swiperBullets[index].click();
                        });
                    });
                }
            },
            slideChangeTransitionStart(sw) {
                updateActiveBullet(sw);
                resetAllProgress(sw);
            },
            autoplayTimeLeft(sw, time, progressLeft) {
                // progressLeft: 1 → just started, 0 → will change now
                const active = sw.pagination?.bullets?.[sw.realIndex];
                const progEl = active?.querySelector(".progress");
                if (progEl) {
                    // Fill from empty to full: dashoffset C → 0
                    progEl.style.strokeDashoffset = (C * progressLeft).toFixed(2);
                }

                const navDots = document.querySelectorAll('.bullets_swiper_dot');
                navDots.forEach((dot) => {
                    dot.classList.remove('is-active');
                });

                navDots[sw.realIndex].classList.add('is-active');
            }
        }
    });


});











// document.addEventListener("DOMContentLoaded", function () {

//     var swiper = new Swiper(".slider-why-ai", {
//         effect: 'fade',
//         fadeEffect: {
//             crossFade: true, // optional: smooth transition
//         },
//         grabCursor: false,
//         centeredSlides: true,
//         slidesPerView: 1,
//         spaceBetween: 0,
//         loop: true,
//         navigation: {
//             nextEl: ".swiper-change-slide .swiper-next",
//             prevEl: ".swiper-change-slide .swiper-prev",
//         },
//     });

// });





