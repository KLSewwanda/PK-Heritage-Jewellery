/* ================================================================
   PK Heritage Jewellery - Main JavaScript
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // ---- State ----
    let currentSlide = 0;
    let isAnimating = false;
    const totalSlides = document.querySelectorAll('.slide').length;
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.indicator');
    const navLinks = document.querySelectorAll('.nav-link');
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    // ---- Loading Screen ----
    createLoadingScreen();

    // ---- Initialize ----
    function init() {
        slides[0].classList.add('active');
        addSparkles();
        setupEventListeners();
        setupImageErrorHandlers();
    }

    // ---- Loading Screen ----
    function createLoadingScreen() {
        const loadingScreen = document.createElement('div');
        loadingScreen.className = 'loading-screen';
        loadingScreen.id = 'loadingScreen';
        loadingScreen.innerHTML = `
            <div class="loading-logo">PK Heritage</div>
            <div class="loading-bar">
                <div class="loading-bar-fill"></div>
            </div>
        `;
        document.body.prepend(loadingScreen);

        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            init();
            setTimeout(() => {
                loadingScreen.remove();
                animateSlideIn(0);
            }, 800);
        }, 2200);
    }

    // ---- Helper: Check if slide can scroll ----
    function getActiveSlide() {
        return slides[currentSlide];
    }

    function isSlideAtTop(slide) {
        return slide.scrollTop <= 5;
    }

    function isSlideAtBottom(slide) {
        // scrollTop + clientHeight >= scrollHeight means fully scrolled
        return slide.scrollTop + slide.clientHeight >= slide.scrollHeight - 5;
    }

    function slideHasOverflow(slide) {
        return slide.scrollHeight > slide.clientHeight + 10;
    }

    // ---- Event Listeners ----
    let edgeScrollCount = 0; // Consecutive scrolls at edge before changing slide

    function setupEventListeners() {
        // Mouse wheel navigation — allows inner scrolling
        document.addEventListener('wheel', (e) => {
            // If modal is open, don't navigate slides
            if (document.querySelector('.modal.active')) return;

            const slide = getActiveSlide();
            const hasOverflow = slideHasOverflow(slide);

            if (hasOverflow) {
                const scrollingDown = e.deltaY > 0;
                const scrollingUp = e.deltaY < 0;

                if (scrollingDown && isSlideAtBottom(slide)) {
                    edgeScrollCount++;
                    if (edgeScrollCount >= 3) {
                        e.preventDefault();
                        edgeScrollCount = 0;
                        nextSlide();
                    }
                    return;
                } else if (scrollingUp && isSlideAtTop(slide)) {
                    edgeScrollCount++;
                    if (edgeScrollCount >= 3) {
                        e.preventDefault();
                        edgeScrollCount = 0;
                        prevSlide();
                    }
                    return;
                } else {
                    // Still scrolling inside the slide — allow normal scroll
                    edgeScrollCount = 0;
                    return;
                }
            }

            // No overflow — navigate slides directly
            e.preventDefault();
            edgeScrollCount = 0;
            if (e.deltaY > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }, { passive: false });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (document.querySelector('.modal.active') && e.key !== 'Escape') return;

            const slide = getActiveSlide();
            const hasOverflow = slideHasOverflow(slide);

            switch (e.key) {
                case 'ArrowDown':
                    if (hasOverflow && !isSlideAtBottom(slide)) return; // let it scroll
                    e.preventDefault();
                    nextSlide();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    nextSlide();
                    break;
                case 'ArrowUp':
                    if (hasOverflow && !isSlideAtTop(slide)) return; // let it scroll
                    e.preventDefault();
                    prevSlide();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    prevSlide();
                    break;
                case 'Escape':
                    closeOrderModal();
                    break;
            }
        });

        // Touch navigation — allows inner scrolling
        let touchStartY = 0;
        let touchEndY = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            touchEndY = e.changedTouches[0].screenY;
            const diff = touchStartY - touchEndY;

            if (Math.abs(diff) < 50) return; // too small

            const slide = getActiveSlide();
            const hasOverflow = slideHasOverflow(slide);

            if (hasOverflow) {
                if (diff > 0 && !isSlideAtBottom(slide)) return; // swiping up but not at bottom
                if (diff < 0 && !isSlideAtTop(slide)) return;   // swiping down but not at top
            }

            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }, { passive: true });

        // Indicator clicks
        indicators.forEach((ind) => {
            ind.addEventListener('click', () => {
                const slideIndex = parseInt(ind.dataset.slide);
                goToSlide(slideIndex);
            });
        });

        // Nav link clicks
        navLinks.forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const slideIndex = parseInt(link.dataset.slide);
                goToSlide(slideIndex);
                closeMenu();
            });
        });

        // Hamburger menu
        hamburger.addEventListener('click', toggleMenu);

        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
                closeMenu();
            }
        });
    }

    // ---- Slide Navigation ----
    function nextSlide() {
        if (currentSlide < totalSlides - 1) {
            goToSlide(currentSlide + 1);
        }
    }

    function prevSlide() {
        if (currentSlide > 0) {
            goToSlide(currentSlide - 1);
        }
    }

    function goToSlide(index) {
        if (index === currentSlide || isAnimating || index < 0 || index >= totalSlides) return;

        isAnimating = true;
        edgeScrollCount = 0;

        // Remove active from current
        slides[currentSlide].classList.remove('active');

        // Set new slide
        currentSlide = index;
        slides[currentSlide].scrollTop = 0; // Reset scroll position
        slides[currentSlide].classList.add('active');

        // Update indicators
        updateIndicators();
        // Update nav
        updateNavLinks();
        // Update navbar style
        updateNavbar();
        // Trigger animations
        animateSlideIn(currentSlide);

        setTimeout(() => {
            isAnimating = false;
        }, 900);
    }

    // Expose for HTML onclick
    window.scrollToSlide = (index) => goToSlide(index);

    function updateIndicators() {
        indicators.forEach((ind, i) => {
            ind.classList.toggle('active', i === currentSlide);
        });
    }

    function updateNavLinks() {
        navLinks.forEach((link, i) => {
            link.classList.toggle('active', i === currentSlide);
        });
    }

    function updateNavbar() {
        navbar.classList.toggle('scrolled', currentSlide > 0);
    }

    // ---- Slide-In Animations ----
    function animateSlideIn(index) {
        const slide = slides[index];
        const fadeElements = slide.querySelectorAll('.fade-in');

        // Reset all
        fadeElements.forEach(el => el.classList.remove('visible'));

        // Stagger add visible class
        fadeElements.forEach((el, i) => {
            const delay = parseInt(el.dataset.delay || 0);
            setTimeout(() => {
                el.classList.add('visible');
            }, 150 + (delay * 100) + (i * 80));
        });
    }

    // ---- Mobile Menu ----
    function toggleMenu() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    }

    function closeMenu() {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }

    // ---- Sparkle Particles ----
    function addSparkles() {
        const heroSlide = document.getElementById('home');
        const sparkleCount = 20;

        for (let i = 0; i < sparkleCount; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.left = Math.random() * 100 + '%';
            sparkle.style.top = Math.random() * 100 + '%';
            sparkle.style.animationDelay = Math.random() * 3 + 's';
            sparkle.style.animationDuration = (2 + Math.random() * 3) + 's';
            sparkle.style.width = (2 + Math.random() * 4) + 'px';
            sparkle.style.height = sparkle.style.width;
            heroSlide.appendChild(sparkle);
        }
    }

    // ---- Image Error Handling ----
    function setupImageErrorHandlers() {
        const images = document.querySelectorAll('.item-image img');
        images.forEach(img => {
            img.addEventListener('error', function () {
                this.style.display = 'none';
            });

            // Handle already broken images
            if (img.complete && img.naturalWidth === 0) {
                img.style.display = 'none';
            }
        });
    }

    // ================================================================
    // ORDER FORM MODAL
    // ================================================================
    const orderModal = document.getElementById('orderModal');
    const orderForm = document.getElementById('orderForm');
    const successMessage = document.getElementById('successMessage');
    const itemNameInput = document.getElementById('itemName');

    // Open modal
    window.openOrderModal = function (itemName) {
        orderModal.classList.add('active');
        itemNameInput.value = itemName || '';
        orderForm.style.display = 'flex';
        successMessage.classList.remove('visible');
        document.body.style.overflow = 'hidden';

        // Reset form
        orderForm.reset();
        itemNameInput.value = itemName || '';
        clearErrors();
    };

    // Close modal
    window.closeOrderModal = function () {
        orderModal.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => {
            orderForm.reset();
            orderForm.style.display = 'flex';
            successMessage.classList.remove('visible');
            clearErrors();
        }, 400);
    };

    // Form validation
    function validateForm() {
        let isValid = true;
        clearErrors();

        const name = document.getElementById('customerName');
        const email = document.getElementById('customerEmail');
        const phone = document.getElementById('customerPhone');

        // Name validation
        if (!name.value.trim()) {
            showError('nameError', 'Please enter your full name');
            isValid = false;
        } else if (name.value.trim().length < 2) {
            showError('nameError', 'Name must be at least 2 characters');
            isValid = false;
        }

        // Email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.value.trim()) {
            showError('emailError', 'Please enter your email address');
            isValid = false;
        } else if (!emailPattern.test(email.value)) {
            showError('emailError', 'Please enter a valid email address');
            isValid = false;
        }

        // Phone validation
        const phonePattern = /^[\d\s\-+()]{7,15}$/;
        if (!phone.value.trim()) {
            showError('phoneError', 'Please enter your phone number');
            isValid = false;
        } else if (!phonePattern.test(phone.value)) {
            showError('phoneError', 'Please enter a valid phone number');
            isValid = false;
        }

        return isValid;
    }

    function showError(id, message) {
        const errorEl = document.getElementById(id);
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.add('visible');
        }
    }

    function clearErrors() {
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
            el.classList.remove('visible');
        });
    }

    // Form submission
    if (orderForm) {
        orderForm.addEventListener('submit', function (e) {
            e.preventDefault();

            if (!validateForm()) return;

            // Simulate submission with a brief delay
            const submitBtn = orderForm.querySelector('.submit-button');
            submitBtn.textContent = 'Processing...';
            submitBtn.disabled = true;

            setTimeout(() => {
                // Show success message
                orderForm.style.display = 'none';
                successMessage.classList.add('visible');

                // Reset button
                submitBtn.textContent = 'Submit Order';
                submitBtn.disabled = false;
            }, 1200);
        });
    }

    // ---- Real-time form validation feedback ----
    const formInputs = document.querySelectorAll('#orderForm input:not([readonly])');
    formInputs.forEach(input => {
        input.addEventListener('blur', function () {
            // Validate individual field on blur
            const errorId = this.id.replace('customer', '').toLowerCase() + 'Error';
            const errorEl = document.getElementById(errorId);
            if (!errorEl) return;

            if (!this.value.trim()) {
                showError(errorId, `Please enter your ${this.previousElementSibling.textContent.replace(' *', '').toLowerCase()}`);
            } else {
                errorEl.textContent = '';
                errorEl.classList.remove('visible');
            }
        });

        input.addEventListener('input', function () {
            const errorId = this.id.replace('customer', '').toLowerCase() + 'Error';
            const errorEl = document.getElementById(errorId);
            if (errorEl && errorEl.classList.contains('visible') && this.value.trim()) {
                errorEl.textContent = '';
                errorEl.classList.remove('visible');
            }
        });
    });

    // ================================================================
    // CUSTOM DESIGN FORM — File Upload & Submission
    // ================================================================
    const customForm = document.getElementById('customDesignForm');
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('customFileInput');
    const uploadPreview = document.getElementById('uploadPreview');
    const customSuccess = document.getElementById('customSuccessMessage');
    let uploadedFiles = [];
    const MAX_FILES = 5;
    const MAX_SIZE_MB = 10;

    if (uploadZone && fileInput) {
        // Click to upload
        uploadZone.addEventListener('click', () => fileInput.click());

        // File input change
        fileInput.addEventListener('change', () => {
            handleFiles(fileInput.files);
            fileInput.value = ''; // Reset so same file can be re-selected
        });

        // Drag and drop events
        ['dragenter', 'dragover'].forEach(evt => {
            uploadZone.addEventListener(evt, (e) => {
                e.preventDefault();
                e.stopPropagation();
                uploadZone.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach(evt => {
            uploadZone.addEventListener(evt, (e) => {
                e.preventDefault();
                e.stopPropagation();
                uploadZone.classList.remove('drag-over');
            });
        });

        uploadZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            handleFiles(files);
        });
    }

    function handleFiles(files) {
        for (const file of files) {
            if (uploadedFiles.length >= MAX_FILES) {
                alert(`Maximum ${MAX_FILES} files allowed.`);
                break;
            }
            if (!file.type.startsWith('image/')) {
                alert(`"${file.name}" is not an image file.`);
                continue;
            }
            if (file.size > MAX_SIZE_MB * 1024 * 1024) {
                alert(`"${file.name}" exceeds ${MAX_SIZE_MB}MB limit.`);
                continue;
            }
            uploadedFiles.push(file);
            addPreview(file, uploadedFiles.length - 1);
        }
        updateUploadZoneText();
    }

    function addPreview(file, index) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const div = document.createElement('div');
            div.className = 'preview-item';
            div.dataset.index = index;
            div.innerHTML = `
                <img src="${e.target.result}" alt="${file.name}">
                <button class="preview-remove" title="Remove" onclick="removeUploadedFile(${index})">&times;</button>
            `;
            uploadPreview.appendChild(div);
        };
        reader.readAsDataURL(file);
    }

    window.removeUploadedFile = function (index) {
        uploadedFiles[index] = null;
        const el = uploadPreview.querySelector(`[data-index="${index}"]`);
        if (el) el.remove();
        updateUploadZoneText();
    };

    function updateUploadZoneText() {
        const activeCount = uploadedFiles.filter(f => f !== null).length;
        const titleEl = uploadZone.querySelector('.upload-title');
        if (activeCount > 0) {
            titleEl.textContent = `${activeCount} file${activeCount > 1 ? 's' : ''} selected`;
        } else {
            titleEl.textContent = 'Upload Reference Images';
        }
    }

    // Custom form validation
    function validateCustomForm() {
        let isValid = true;
        clearErrors();

        const name = document.getElementById('customName');
        const contact = document.getElementById('customContact');
        const type = document.getElementById('jewelleryType');
        const desc = document.getElementById('designDescription');

        if (!name.value.trim()) {
            showError('customNameError', 'Please enter your name');
            isValid = false;
        }

        if (!contact.value.trim()) {
            showError('customContactError', 'Please enter your phone or email');
            isValid = false;
        } else {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const phonePattern = /^[\d\s\-+()]{7,15}$/;
            if (!emailPattern.test(contact.value) && !phonePattern.test(contact.value)) {
                showError('customContactError', 'Please enter a valid phone or email');
                isValid = false;
            }
        }

        if (!type.value) {
            isValid = false; // Select will show native validation
        }

        if (!desc.value.trim()) {
            showError('designDescError', 'Please describe your design idea');
            isValid = false;
        } else if (desc.value.trim().length < 10) {
            showError('designDescError', 'Please provide more detail (min 10 characters)');
            isValid = false;
        }

        return isValid;
    }

    // Custom form submission
    if (customForm) {
        customForm.addEventListener('submit', function (e) {
            e.preventDefault();

            if (!validateCustomForm()) return;

            const btn = document.getElementById('customSubmitBtn');
            btn.querySelector('.btn-text').textContent = 'Submitting...';
            btn.disabled = true;

            setTimeout(() => {
                customForm.style.display = 'none';
                customSuccess.classList.add('visible');
                btn.querySelector('.btn-text').textContent = 'Submit Custom Request \u2726';
                btn.disabled = false;
            }, 1500);
        });
    }

    // Reset custom form
    window.resetCustomForm = function () {
        if (customForm) {
            customForm.reset();
            customForm.style.display = 'flex';
            customSuccess.classList.remove('visible');
            uploadedFiles = [];
            uploadPreview.innerHTML = '';
            updateUploadZoneText();
            clearErrors();
        }
    };

    // Clear errors on input for custom form fields
    ['customName', 'customContact', 'designDescription'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', function () {
                const errorId = id + 'Error';
                const errEl = document.getElementById(errorId);
                if (errEl && errEl.classList.contains('visible') && this.value.trim()) {
                    errEl.textContent = '';
                    errEl.classList.remove('visible');
                }
            });
        }
    });
});

