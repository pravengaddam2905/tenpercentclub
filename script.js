// Mobile menu toggle
const menuBtn = document.getElementById('menuBtn');
const menu = document.getElementById('menu');
if (menuBtn) {
  menuBtn.addEventListener('click', () => menu.classList.toggle('open'));
}

// Close menu on link click (mobile)
document.querySelectorAll('#menu a').forEach(a => {
  a.addEventListener('click', () => menu.classList.remove('open'));
});

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Simple demo contact form: opens mail client with the message
const form = document.getElementById('contactForm');
const note = document.getElementById('formNote');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const subject = encodeURIComponent('New inquiry from website');
    const body = encodeURIComponent(
      `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || ''}\n\nMessage:\n${data.message}`
    );
    // Replace with your email address:
    window.location.href = `mailto:praveen@example.com?subject=${subject}&body=${body}`;
    note.textContent = 'Opening your email app… To capture leads automatically, connect this form to Formspree/Getform.';
  });
}