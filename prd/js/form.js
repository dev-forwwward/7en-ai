document.addEventListener("DOMContentLoaded", () => {

    // Form validation
    if (document.querySelector('.section_contact_form')) {
        $("form").each(function (e) {
            $.validator.addMethod("letters", function (value, element) {
                return this.optional(element) || value == value.match(/^[a-zA-Z\s]*$/);
            });
            $.validator.addMethod("customEmail", function (value, element) {
                return (
                    this.optional(element) || /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(value)
                );
            });
            $(this).validate({
                rules: {
                    youremail: {
                        required: true,
                        email: true,
                        customEmail: true, // Add the customEmail validation
                    }
                },
                messages: {
                    youremail:
                        "Please specify a valid email address <span class='email-example'>(e.g.: user@example.com)</span>"
                },
                errorPlacement: function (error, element) {
                    error.insertAfter(element); // Ensures errors appear below the correct field
                    setTimeout(() => {
                        error[0].classList.add("show");
                    }, 200);
                },
            });
        });
    }

    // Radio Button
    document.querySelectorAll('.s_cfo_radio_elm').forEach((input) => {
        input.addEventListener('change', () => {
            // Remove selected class from all s_cfo_radio elements
            document.querySelectorAll('.s_cfo_radio').forEach((radio) => {
            radio.classList.remove('selected');
            });

            // Add selected class to the parent .s_cfo_radio of the checked input
            const parent = input.closest('.s_cfo_radio');
            if (parent) {
            parent.classList.add('selected');
            }
        });
    });


});