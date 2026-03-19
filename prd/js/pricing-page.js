document.addEventListener("DOMContentLoaded", function () {
    
    const prHeroSection = document.querySelector('.section_hero_pricing');

    // Plans monthly/ yearly toggle
    if (prHeroSection) {
        console.log("running pricing page");

        const planSwitchContainer = prHeroSection.querySelector('.calculator-switch-container');
        const switchEl = prHeroSection.querySelector('.calculator-switch-container-inner');
        const planBlock = prHeroSection.querySelectorAll('.pricing_calculator_content_wrapper_inner');

        switchEl.addEventListener('click', function () {

            let priceSetting;

            // switch to MONTHLY Plan
            if (planSwitchContainer.classList.contains('annually-on')) {
                planSwitchContainer.classList.remove('annually-on');
                priceSetting = 'monthly-price';

            } else {
                // switch to YEARLY Plan
                planSwitchContainer.classList.add('annually-on');
                priceSetting = 'yearly-monthly-price';
            }

            planBlock.forEach((block) => {

                let priceOutput = block.querySelector('.price-output');
                let updatedPrice = block.getAttribute(priceSetting);

                // animate to the new value
                gsap.to(priceOutput, {
                    innerText: updatedPrice,
                    duration: 0.5,
                    ease: "power1.inOut",
                    snap: { innerText: 1 },
                    onUpdate: function () {
                        priceOutput.innerText = `${priceOutput.innerText}`;
                    }
                });
            });


        });
    }

    const tableHeadWrapper = document.querySelector('.pr_tb_head_wrapper_desktop');
    if (tableHeadWrapper) {
        ScrollTrigger.create({
            trigger: tableHeadWrapper,
            start: 'top top',
            onEnter: () => {
                tableHeadWrapper.classList.add('sticky-bg');
            },
            onLeaveBack: () => {
                tableHeadWrapper.classList.remove('sticky-bg');
            },
        });
    }


    // Table Tabs in mobile
    if (window.innerWidth <= 767 && tableHeadWrapper) {
        const filterBtns = document.querySelectorAll('.pr_tb_head.mobile .pr_tb_head_pl_name');

        // get single row example (for reference)
        const tableContentListItemColsContainer = document.querySelector('.pr_tb_content_rows_col.row');
        // get n children (this will allow for dynamic if later more plans are added or removed)
        const rowsPerCol = tableContentListItemColsContainer.childElementCount;

        // get all product rows (across all table calls)
        const tableContentListItemCols = document.querySelectorAll('.pr_tb_content_rows.col');
        let activeBtn = null;
        let activeIndex = null;

        const getPlanActionButtonList = document.querySelectorAll('.pr_tb_head_wrapper_mobile .pr_tb_head_mobile_btn_wrapper');


        // add event listeners for each filter button
        filterBtns.forEach((filterBtn, i) => {
            filterBtn.addEventListener('click', function (e) {

                // reset active button (filter button and 'get plan' button)
                if (activeBtn !== null && activeBtn !== this) {
                    activeBtn.classList.remove('active');
                    getPlanActionButtonList[activeIndex].classList.remove('show');
                }

                this.classList.add('active');
                activeBtn = this;
                activeIndex = i;

                tableContentListItemCols.forEach((col, colIndex) => {
                    // check for columns starting at index = i every [rowsPerCol] amount
                    if ((colIndex - i) % rowsPerCol === 0 && colIndex >= i) {
                        col.classList.add('show');
                    } else {
                        col.classList.remove('show');
                    }
                });

                // update visibility of current Plan action button
                getPlanActionButtonList[activeIndex].classList.add('show');

            });
        });

        // set first filter button as active on load
        filterBtns[0].click();

    }

    // table visibility Toggle button
    const toggleBtn = document.querySelector('.view_plans_btn_wrapper');
    const tableWrapper = document.querySelector('.pr_tb_wrapper');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            console.log("click");

            if (toggleBtn.classList.contains('content-hidden')) {
                toggleBtn.classList.remove('content-hidden');

                if (tableWrapper) {
                    tableWrapper.classList.remove('hidden');
                }
            } else {
                toggleBtn.classList.add('content-hidden');

                if (tableWrapper) {
                    tableWrapper.classList.add('hidden');
                }
            }
        });
    }

});