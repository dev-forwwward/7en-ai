document.addEventListener('DOMContentLoaded', function () {

    const calculatorContainer = document.querySelector(".calculator-container");

    if (calculatorContainer) {
        const config = {
            minValue: 0,
            maxValue: 1000,
            radius: 150,
            centerX: 151,
            centerY: 153,
            startAngle: 180,
            endAngle: 360,
            monthly: true,
            yearlyDiscount: .15 // assuming discount of 15%
        };

        const floorToTwo = (num) => Math.floor(num * 100) / 100;

        config.angleRange = config.endAngle - config.startAngle;


        // it is being assumed that 100 conversations cost about 25 CHF
        let pricePerConvo = 0.25;
        let price = 0;


        // init states
        let currentValue = 500;
        let animatedValue = 500;
        let isDragging = false;

        const valueNumberElement = document.getElementById('valueNumber');
        const dotElement = document.getElementById('dot');
        const dotTouchTarget = document.getElementById('dotTouchTarget');
        const filledArcElement = document.getElementById('filledArc');
        const priceOutput = document.querySelector('.calculator-price-output');
        const yearlyPriceOutput = document.querySelector('.calculator-yearly-price-output');

        if (window.innerWidth <= 767) {
            dotElement.setAttribute('r', '5');
        }

        const svg = dotElement.closest('svg');

        // convert value to angle
        function valueToAngle(val) {
            const normalizedValue = (val - config.minValue) / (config.maxValue - config.minValue);
            return config.startAngle + normalizedValue * config.angleRange;
        }

        // convert angle to value
        function angleToValue(angle) {
            let normalizedAngle = angle % 360;
            if (normalizedAngle < 0) normalizedAngle += 360;

            // limit value (180° to 360°)
            if (normalizedAngle > 0 && normalizedAngle < config.startAngle) {
                normalizedAngle = normalizedAngle < 90 ? config.endAngle : config.startAngle;
            }

            const angleProgress = normalizedAngle - config.startAngle;
            const normalizedValue = angleProgress / config.angleRange;
            return Math.round(Math.max(config.minValue, Math.min(config.maxValue, normalizedValue * (config.maxValue - config.minValue) + config.minValue)));
        }

        // convert angle to coordinates
        function angleToCoords(angle) {
            const rad = (angle * Math.PI) / 180;
            return {
                x: config.centerX + config.radius * Math.cos(rad),
                y: config.centerY + config.radius * Math.sin(rad)
            };
        }

        // get angle from mouse position
        function getAngleFromPosition(clientX, clientY) {
            const rect = svg.getBoundingClientRect();
            const x = clientX - rect.left - config.centerX;
            const y = clientY - rect.top - config.centerY;
            let angle = (Math.atan2(y, x) * 180) / Math.PI;
            if (angle < 0) angle += 360;
            return angle;
        }

        // init input arc path
        function createArcPath(startAngle, endAngle, r) {
            const start = angleToCoords(startAngle);
            const end = angleToCoords(endAngle);
            const largeArcFlag = (endAngle - startAngle) > 180 ? 1 : 0;

            return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
        }


        function updateFinalOutputPrice(value) {
            priceOutput.innerHTML = floorToTwo(value);
            let yearlyPrice = value * 12;
            yearlyPriceOutput.innerHTML = floorToTwo(yearlyPrice).toString().slice(0, 5);
        }

        // instant input update - no animation
        function updateGaugeInstant(value) {
            const currentAngle = valueToAngle(value);
            const dotPosition = angleToCoords(currentAngle);
            const filledArc = createArcPath(config.startAngle, currentAngle, config.radius);

            dotElement.setAttribute('cx', dotPosition.x);
            dotElement.setAttribute('cy', dotPosition.y);
            dotTouchTarget.setAttribute('cx', dotPosition.x);
            dotTouchTarget.setAttribute('cy', dotPosition.y);
            filledArcElement.setAttribute('d', filledArc);
            valueNumberElement.innerHTML = Math.round(value);

            // assumes price per MONTH by default
            price = value * pricePerConvo;

            // adjust if switched to YEARLY plan
            if (!config.monthly) {
                price = value * pricePerConvo * (1 - config.yearlyDiscount);
            }



            updateFinalOutputPrice(floorToTwo(price).toString().slice(0, 4));
        }

        // update input arc
        function updateGauge(animate = true) {
            // const currentAngle = valueToAngle(currentValue);
            // const dotPosition = angleToCoords(currentAngle);
            // const filledArc = createArcPath(config.startAngle, currentAngle, config.radius);

            // // dotElement.setAttribute('cx', dotPosition.x);
            // // dotElement.setAttribute('cy', dotPosition.y);

            // // filledArcElement.setAttribute('d', filledArc);

            // gsap.to(dotElement, {
            //     attr: {
            //         cx: dotPosition.x,
            //         cy: dotPosition.y
            //     },
            //     duration: 0.5,
            //     ease: "power2.out"
            // });

            // gsap.to(filledArcElement, {
            //     attr: {
            //         d: filledArc
            //     },
            //     duration: 0.5,
            //     ease: "power2.out"
            // });

            // valueNumberElement.innerHTML = currentValue;


            if (!animate || isDragging) {
                updateGaugeInstant(currentValue);
            } else {
                // animate to the new value
                gsap.to({ value: animatedValue }, {
                    value: currentValue,
                    duration: 0.5,
                    ease: "power2.out",
                    onUpdate: function () {
                        animatedValue = this.targets()[0].value;
                        updateGaugeInstant(animatedValue);
                    }
                });
            }

            updateFinalOutputPrice(price);


        }

        // set and update center text value
        function setValue(newValue, animate = true) {
            currentValue = Math.round(Math.max(config.minValue, Math.min(config.maxValue, newValue)));
            updateGauge(animate);
            // updateGauge(false);
        }

        // unified handler for drag start (mouse & touch)
        function handleDragStart(e) {
            isDragging = true;

            // clear active state from buttons
            clearActiveButtons();

            e.preventDefault();
        }

        function handleDragMove(e) {
            if (!isDragging) return;

            // get clientX and clientY from either mouse or touch event
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);

            const angle = getAngleFromPosition(clientX, clientY);
            const newValue = angleToValue(angle);

            // set value without animating, as we drag the input dot
            setValue(newValue, false);
        }

        function handleDragEnd() {
            isDragging = false;
            // sync animated value
            animatedValue = currentValue;
        }

        // init - no animation on page load
        animatedValue = currentValue;
        updateGauge(false);

        // // listen for mouse movement
        // dotTouchTarget.addEventListener('mousedown', handleDragStart);
        // window.addEventListener('mousemove', handleDragMove);
        // window.addEventListener('mouseup', handleDragEnd);

        // // listen for mobile tap and drag events
        // dotTouchTarget.addEventListener('touchstart', handleDragStart, { passive: false });
        // window.addEventListener('touchmove', handleDragMove, { passive: false });
        // window.addEventListener('touchend', handleDragEnd);
        // window.addEventListener('touchcancel', handleDragEnd);


        const calcBtns = document.querySelectorAll('.calculator-btn');
        const btnFeaturesOutputCollection = document.querySelectorAll('.calc_content_output_list');

        // btn action
        calcBtns.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                let btnValue = parseInt(btn.querySelector('.calculator-btn-text').innerText);
                setValue(btnValue);

                // clear active buttons before updating to current active button
                clearActiveButtons();

                btnFeaturesOutputCollection[index].classList.add('show');


                // update active button
                btn.classList.add('calculator-btn-active');
            });
        });

        // set '500' button to active on page load (default)
        calcBtns[2].click();


        const planSwitchContainer = document.querySelector('.calculator-switch-container');
        const planSwitch = document.querySelector('.calculator-switch-container-inner');

        if (planSwitch && planSwitchContainer) {
            planSwitch.addEventListener('click', () => {

                // switch to MONTHLY Plan
                if (planSwitchContainer.classList.contains('anually-on')) {
                    planSwitchContainer.classList.remove('anually-on');

                    config.monthly = true;
                } else {
                    // switch to YEARLY Plan
                    planSwitchContainer.classList.add('anually-on');

                    config.monthly = false;
                }

                // always update output value
                updateGauge(false);
                updateFinalOutputPrice(price);
            });
        }

        function clearActiveButtons() {
            document.querySelectorAll('.calculator-btn').forEach((btnEl, index) => {
                btnEl.classList.remove('calculator-btn-active');
                btnFeaturesOutputCollection[index].classList.remove('show');
            });
        }

    } // if calculatorContainer
});