// // NOTE: DISABLED

// document.addEventListener("DOMContentLoaded", () => {

//     const section = document.querySelector(".section_months_setup");
//     if (section) {

//         const wrapper = section.querySelector(".sms_content_wrapper");
//         let wordsWrap = document.querySelector(".sms_words_wrapper");
//         const words = gsap.utils.toArray(".sms_words_wrapper .sms_word_outer");

//         const travel = () => Math.max(0, (wrapper?.scrollHeight || 0) - window.innerHeight);

//         setTimeout(() => {

//             // --- 2) Show the months block when the section's CENTER hits viewport BOTTOM
//             ScrollTrigger.create({
//                 trigger: section,
//                 start: "top 60%",
//                 end: "bottom top",
//                 onEnter: () => wordsWrap.classList.add("is-visible"),
//                 onEnterBack: () => wordsWrap.classList.add("is-visible"),
//                 onLeave: () => wordsWrap.classList.remove("is-visible"),
//                 onLeaveBack: () => wordsWrap.classList.remove("is-visible")
//             });

//             // --- 3) Pin the section for the inner content scroll
//             ScrollTrigger.create({
//                 trigger: ".sms_bg_main_trigger",
//                 start: "top top",
//                 end: () => { return `+=${section.offsetHeight}px` },
//                 pin: ".sms_bg_main",
//                 // markers: {
//                 //     startColor: "blue",
//                 //     endColor: "blue"
//                 // },
//                 pinSpacing: false,
//                 invalidateOnRefresh: true
//             });

//             ScrollTrigger.create({
//                 trigger: ".section_months_setup .sms_-content_2 h2",
//                 start: "top bottom",
//                 end: "+=100%",
//                 pin: false,
//                 // markers: {
//                 //     startColor: "yellow",
//                 //     endColor: "yellow"
//                 // },
//                 pinSpacing: false,
//                 invalidateOnRefresh: true,
//                 onEnter: () => {
//                     // init dountdown
//                     countdown();
//                 },
//                 once: true
//             });
//         }, 800);

//         // Countdown
//         const timerDiv = document.querySelector('.sms_word_text.countdown');
//         let timeText = timerDiv.textContent;

//         // parse the time string into hours, minutes, seconds
//         function parseTime(timeString) {
//             const parts = timeString.split(':');
//             const hours = parseInt(parts[0], 10);
//             const minutes = parseInt(parts[1], 10);
//             const seconds = parseInt(parts[2], 10);

//             // convert everything to total seconds
//             return hours * 3600 + minutes * 60 + seconds;
//         }

//         // format back to HH:MM:SS
//         function formatTime(totalSeconds) {
//             const hours = Math.floor(totalSeconds / 3600);
//             const minutes = Math.floor((totalSeconds % 3600) / 60);
//             const seconds = totalSeconds % 60;

//             return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
//         }

//         // get initial time in seconds
//         let totalSeconds = parseTime(timeText);
//         let reachedZero = false;

//         // set target time for toast (5mins [in s] after countdown starts)
//         const toastTargetTime = totalSeconds - 300;
//         let toastTriggered = false;

//         // toast message
//         const toastContainer = document.querySelector('.months_set_msg_container_outer');

//         function countdown() {

//             gsap.set(timerDiv, { opacity: 0 });
//             gsap.to(timerDiv, { opacity: .5 });

//             setInterval(() => {
//                 if (!reachedZero) {
//                     totalSeconds--;
//                 }

//                 timerDiv.textContent = formatTime(totalSeconds);

//                 // check if countdown has reached 00:00:00
//                 if (totalSeconds < 1 && !reachedZero) {
//                     clearInterval(countdown);
//                     timerDiv.textContent = "00:00:00";
//                     reachedZero = true;

//                     console.log("Countdown finished!");
//                     return
//                 }

//                 // check if 5mins have passed since countdown began
//                 if (totalSeconds <= toastTargetTime && !toastTriggered) {
//                     toastContainer.attributes['display-ready'].value = "5";
//                     toastTriggered = true;
//                 }

//             }, 1000)
//         };

//         toastContainer.querySelector('.toast_close_btn_container').addEventListener('click', () => {
//             toastContainer.attributes['display-ready'].value = "false";
//         });

//         // --- 5) Switch months starting at "center bottom", with a small lead-in before 1st word
//         const EARLY_VH = 0; // already using center-bottom; keep 0 unless you want extra pre-roll
//         let wordsTotal = () => EARLY_VH * window.innerHeight + travel();

//         const tlWords = gsap.timeline({
//             defaults: { ease: "none" },
//             scrollTrigger: {
//                 trigger: section,
//                 // start: "center bottom",              // start when months first become visible
//                 // end: () => "+=" + wordsTotal(),

//                 start: "top 60%",
//                 end: `+=${window.innerHeight * 0.8}px`,

//                 scrub: true,
//                 invalidateOnRefresh: true,
//             }
//         });

//         // Make the 1st word easier to see: add a slight delay (lead-in) before it fully appears.
//         const N = Math.max(1, words.length);
//         const seg = 1 / N;
//         const leadIn = 0; //Math.min(0.01, seg * 0.1); // ~1% of the sequence (clamped)
//         const showFrac = 1;                       // visible portion per word
//         const hideFrac = 0;                       // fade-out

//         gsap.set(words, { opacity: 0 });

//         words.forEach((el, i) => {
//             // First word starts after the lead-in; others follow normally
//             const baseStart = i * seg;
//             const start = i === 0 ? baseStart + leadIn : baseStart;
//             const showDur = seg * showFrac - (i === 0 ? leadIn : 0); // keep total length consistent
//             const hideDur = seg * hideFrac;

//             tlWords.to(el, {
//                 opacity: 1,
//                 duration: 0.05 //Math.max(0.0001, showDur)
//             }, start);
//             if (i < N - 1) {
//                 tlWords.to(el, { opacity: 0, duration: hideDur }, start + Math.max(0, showDur));
//             }
//         });



//         // TOAST VISIBILITY HANDLER (IN DEV)
//         const afterCountdownSection = document.querySelector('.section_agents_automate');
//         if (afterCountdownSection) {
//             ScrollTrigger.create({
//                 trigger: afterCountdownSection,
//                 start: "top bottom+=400px",
//                 end: "+=80%",
//                 // markers: true,
//                 onEnter: () => {
//                     console.log("VISIBLE");
//                     toastContainer.classList.add('show');
//                 },
//                 onEnterBack: () => {
//                     console.log("VISIBLE AGAIN");
//                     toastContainer.classList.add('show');
//                 },
//                 onLeave: () => {
//                     console.log("GOODBYE");
//                     toastContainer.classList.remove('show');
//                 },
//                 onLeaveBack: () => {
//                     console.log("GOODBYE AGAIN");
//                     toastContainer.classList.remove('show');
//                 }
//             })
//         }


//     } // if (section)
// });