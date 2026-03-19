document.addEventListener("DOMContentLoaded", function () {
    // Move images to the left panel for desktop layout
    (function setupLeftPanelImages() {
        if (window.innerWidth <= 991) return;

        const section = document.querySelector('.s_faq_c2');
        if (!section) return;

        const leftPanel = section.querySelector('.max-width-full:first-child');
        const rightPanel = section.querySelector('.max-width-full:last-child');
        const accordionItems = section.querySelectorAll('.accordion__item-faq');

        if (!leftPanel || !rightPanel || accordionItems.length === 0) return;

        // Apply two-column layout directly as inline styles
        Object.assign(section.style, {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: '4rem'
        });

        Object.assign(leftPanel.style, {
            width: '50%',
            flexShrink: '0',
            position: 'relative',
            top: '0',
            alignSelf: 'flex-start'
        });

        Object.assign(rightPanel.style, {
            flex: '1',
            minWidth: '0'
        });

        leftPanel.classList.add('s_faq_c2-left-panel');

        // Move each accordion's image into the left panel with stacking styles
        accordionItems.forEach(function (item, index) {
            const imgWrapper = item.querySelector('.img-wrapper');
            if (!imgWrapper) return;

            imgWrapper.dataset.accordionImgIndex = index;
            leftPanel.appendChild(imgWrapper);

            // First image stays in normal flow to give the panel its height;
            // all others are stacked absolutely on top of it.
            Object.assign(imgWrapper.style, {
                position: index === 0 ? 'relative' : 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                opacity: '0',
                zIndex: '0',
                transition: 'opacity 0.4s ease'
            });

            // Override Webflow's absolute positioning on the img element itself
            const img = imgWrapper.querySelector('.faq-info-img');
            if (img) {
                Object.assign(img.style, {
                    position: 'static',
                    width: '100%',
                    inset: 'auto'
                });
            }
        });

        // Show the image that corresponds to the active accordion
        function syncActiveImage() {
            const imgWrappers = leftPanel.querySelectorAll('.img-wrapper');
            const activeItem = section.querySelector('.accordion__item-faq.is-active-accordion');
            const activeIndex = activeItem
                ? Array.from(accordionItems).indexOf(activeItem)
                : -1;

            imgWrappers.forEach(function (wrapper) {
                const idx = parseInt(wrapper.dataset.accordionImgIndex, 10);
                const isActive = idx === activeIndex;
                wrapper.style.opacity = isActive ? '1' : '0';
                wrapper.style.zIndex = isActive ? '2' : '0';
                wrapper.classList.toggle('is-active', isActive);
            });
        }

        syncActiveImage();

        // Watch for accordion state changes
        const observer = new MutationObserver(syncActiveImage);
        accordionItems.forEach(function (item) {
            observer.observe(item, { attributes: true, attributeFilter: ['class'] });
        });
    })();

    // Mobile: scroll the clicked accordion item into view
    if (window.innerWidth <= 991) {
        document.querySelectorAll('button.accordion__item-header-2').forEach(function (button) {
            button.addEventListener('click', function () {
                var item = button.closest('.accordion__item-faq');
                if (!item) return;

                // Capture direction BEFORE the accordion opens/closes and shifts the layout
                var scrollingDown = item.getBoundingClientRect().top >= 0;

                // Defer until the accordion animation (200ms max-height transition) has finished
                setTimeout(function () {
                    var targetY = item.getBoundingClientRect().top + window.scrollY;
                    if (!scrollingDown) targetY -= 40;
                    window.scrollTo({ top: targetY, behavior: 'smooth' });
                }, 100);
            });
        });
    }

    const accordionButtons = document.querySelectorAll('button.accordion__item-header-2');
    const timelineDuration = 8;

    // check if accordion elements exist
    if (accordionButtons.length > 0 && window.innerWidth > 991) {
        let currentIndex = 0;

        // Function to handle the current accordion item
        function cycleAccordion() {
            // Get the current button
            const currentButton = accordionButtons[currentIndex];

            // Simulate click on the current button
            currentButton.click();

            // get current button line
            const faqLine = currentButton.parentElement.querySelector('.accordion__item-faq-line');

            if (faqLine) {
                gsap.fromTo(faqLine,
                    {
                        width: '0%'
                    },
                    {
                        width: '100%',
                        duration: timelineDuration,
                        ease: 'none'
                    }
                );
            }

            // index checker
            currentIndex++;
            if (currentIndex >= accordionButtons.length) {
                currentIndex = 0;
            }
        }

        // first init cycle on page load
        cycleAccordion();

        // add cycle do looping interval
        const accordionInterval = setInterval(cycleAccordion, timelineDuration * 1000);

        // store the interval ID globally so it can be cleared
        window.accordionCycleInterval = accordionInterval;

        // stop auto-cycling when manually clicked
        accordionButtons.forEach((button, index) => {
            button.addEventListener('click', function (e) {

                // only stop auto-cycling for actual user clicks, ignore simulated clicks
                if(!e.isTrusted) {
                    return;
                }

                // stop the auto-cycling when user intentionally clicks accordion buttons
                clearInterval(accordionInterval);
                clearInterval(window.accordionCycleInterval);
                window.accordionCycleInterval = null;


                // check if any accordion is active after a short delay (to allow for state changes)
                setTimeout(() => {
                    const hasActiveAccordion = Array.from(accordionButtons).some(btn =>
                        btn.parentElement.classList.contains('is-active-accordion')
                    );

                    if (!hasActiveAccordion) {
                        // resume accoridon cycling
                        currentIndex = 0;
                        cycleAccordion();
                        
                        // restart the interval
                        window.accordionCycleInterval = setInterval(cycleAccordion, timelineDuration*1000);
                    }
                }, 1500); // small delay to allow DOM updates - wait 1.5s before resuming cycle animation 
            });
        });
    }
});