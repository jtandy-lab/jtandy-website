/* ═══════════════════════════════
   JTANDY — V4 Interactions
   Minimal · Fast · No bloat
   ═══════════════════════════════ */
(function () {
    'use strict';

    /* Scroll reveal */
    const io = new IntersectionObserver(
        (entries) => entries.forEach((e) => {
            if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
        }),
        { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
    );
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

    /* Mobile nav */
    const burger = document.getElementById('headerBurger');
    const nav = document.getElementById('headerNav');
    if (burger && nav) {
        burger.addEventListener('click', () => {
            burger.classList.toggle('is-active');
            nav.classList.toggle('is-open');
            document.body.style.overflow = nav.classList.contains('is-open') ? 'hidden' : '';
        });
        nav.querySelectorAll('a').forEach((a) =>
            a.addEventListener('click', () => {
                burger.classList.remove('is-active');
                nav.classList.remove('is-open');
                document.body.style.overflow = '';
            })
        );
    }

    /* Smooth scroll for anchor links */
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
        a.addEventListener('click', (e) => {
            const target = document.querySelector(a.getAttribute('href'));
            if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        });
    });

    /* Dark header over hero */
    const header = document.getElementById('header');
    const hero = document.querySelector('.hero');
    if (header && hero) {
        const updateHeader = () => {
            const heroBottom = hero.getBoundingClientRect().bottom;
            header.classList.toggle('header--dark', heroBottom > 72);
        };
        updateHeader();
        window.addEventListener('scroll', updateHeader, { passive: true });
    }

    /* Form handling */
    document.querySelectorAll('form').forEach((form) => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            /* Audit form → redirect to thank-you page */
            if (form.id === 'auditForm') {
                window.location.href = 'thank-you.html';
                return;
            }

            /* Lead Website enquiry form → n8n webhook */
            if (form.id === 'leadWebsiteForm') {
                const name = form.querySelector('#lwe-name');
                const email = form.querySelector('#lwe-email');
                const phone = form.querySelector('#lwe-phone');
                const situation = form.querySelector('#lwe-situation');
                const btn = form.querySelector('#lweSubmitBtn');
                const errorBanner = document.getElementById('lweSubmitError');
                const successEl = document.getElementById('lweFormSuccess');

                /* Reset errors */
                form.querySelectorAll('.lwe-form-error').forEach(el => el.style.display = 'none');
                form.querySelectorAll('.lwe-form-input, .lwe-form-textarea').forEach(el => el.style.borderColor = '');
                if (errorBanner) errorBanner.style.display = 'none';

                /* Validate */
                let valid = true;
                if (!name.value.trim()) {
                    document.getElementById('lwe-name-error').style.display = 'block';
                    name.style.borderColor = '#DC2626';
                    valid = false;
                }
                if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
                    document.getElementById('lwe-email-error').style.display = 'block';
                    email.style.borderColor = '#DC2626';
                    valid = false;
                }
                if (!valid) return;

                /* Send to n8n webhook */
                const og = btn.textContent;
                btn.textContent = 'Sending…';
                btn.disabled = true;

                /* ── LIVE n8n webhook URL ── */
                const N8N_WEBHOOK_URL = 'https://n8n.jtandy.com/webhook/lead-website-enquiry';

                fetch(N8N_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        source: 'lead-website-enquiry',
                        name: name.value.trim(),
                        email: email.value.trim(),
                        phone: phone.value.trim() || '',
                        situation: situation.value.trim() || '',
                        submitted_at: new Date().toISOString()
                    })
                })
                    .then(res => {
                        if (!res.ok) throw new Error('Webhook returned ' + res.status);
                        /* Show success */
                        form.style.display = 'none';
                        if (successEl) successEl.classList.add('is-visible');
                        /* Redirect after a moment */
                        setTimeout(() => { window.location.href = 'thank-you.html'; }, 3000);
                    })
                    .catch(() => {
                        btn.textContent = og;
                        btn.disabled = false;
                        if (errorBanner) errorBanner.style.display = 'block';
                    });

                return;
            }

            /* Default form handling (contact, etc.) */
            const b = form.querySelector('button[type="submit"]');
            if (!b) return;
            const og = b.textContent;
            b.textContent = '✓ Received — I\'ll be in touch within 3 business days';
            b.style.background = '#16A34A';
            b.disabled = true;
            setTimeout(() => { b.textContent = og; b.style.background = ''; b.disabled = false; form.reset(); }, 6000);
        });
    });

    /* Active nav highlight */
    const page = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.header__nav a').forEach((a) => {
        if (a.getAttribute('href') === page) a.classList.add('active');
    });
})();
