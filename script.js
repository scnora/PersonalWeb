// Mobile menu toggle
const menuIcon = document.querySelector('#menu-icon');
const navbar = document.querySelector('.navbar');

menuIcon.addEventListener('click', () => {
   navbar.classList.toggle('active');
   menuIcon.classList.toggle('bx-x'); // Changes icon to X when open
});

// Close menu when clicking on a nav link
const navLinks = document.querySelectorAll('.navbar a');
navLinks.forEach(link => {
   link.addEventListener('click', () => {
      navbar.classList.remove('active');
      menuIcon.classList.remove('bx-x');
   });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
   if (!navbar.contains(e.target) && !menuIcon.contains(e.target)) {
      navbar.classList.remove('active');
      menuIcon.classList.remove('bx-x');
   }
});

// Active link on scroll
const sections = document.querySelectorAll('section');
const navLinksAll = document.querySelectorAll('.navbar a');

window.addEventListener('scroll', () => {
   let current = '';
   
   sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (pageYOffset >= sectionTop - 200) {
         current = section.getAttribute('id');
      }
   });

   navLinksAll.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').includes(current)) {
         link.classList.add('active');
      }
   });
});