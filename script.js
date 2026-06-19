// ========================
// THEME TOGGLE
// ========================
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('i');
let isDark = false;

// Default to light theme
document.documentElement.setAttribute('data-theme', 'light');
themeIcon.className = 'fas fa-sun';

themeToggle.addEventListener('click', () => {
    isDark = !isDark;
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    themeIcon.className = isDark ? 'fas fa-moon' : 'fas fa-sun';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// Load saved theme (default light if none saved)
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    isDark = true;
    document.documentElement.setAttribute('data-theme', 'dark');
    themeIcon.className = 'fas fa-moon';
}

// ========================
// PARTICLES BACKGROUND
// ========================
const particlesContainer = document.getElementById('particles');
for (let i = 0; i < 30; i++) {
    const dot = document.createElement('div');
    dot.style.cssText = `
        position: absolute;
        width: ${Math.random() * 4 + 2}px;
        height: ${Math.random() * 4 + 2}px;
        background: var(--accent);
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        opacity: ${Math.random() * 0.5 + 0.1};
        animation: float ${Math.random() * 10 + 10}s ease-in-out infinite;
        animation-delay: ${Math.random() * 5}s;
    `;
    particlesContainer.appendChild(dot);
}

// Add float animation
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0%, 100% { transform: translateY(0) translateX(0); }
        25% { transform: translateY(-20px) translateX(10px); }
        50% { transform: translateY(-10px) translateX(-10px); }
        75% { transform: translateY(-30px) translateX(5px); }
    }
`;
document.head.appendChild(style);

// ========================
// SCROLL REVEAL
// ========================
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.1 });

revealElements.forEach(el => revealObserver.observe(el));

// ========================
// NAVBAR SCROLL EFFECT
// ========================
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.3)';
    } else {
        navbar.style.boxShadow = 'none';
    }
});

// ========================
// COMMENTS SYSTEM
// ========================
let comments = JSON.parse(localStorage.getItem('skyComments')) || [];
let isAdmin = false;
const ADMIN_PASSWORD = 'skyadmin2026'; // Change this password!

function renderComments() {
    const list = document.getElementById('commentsList');
    if (comments.length === 0) {
        list.innerHTML = `
            <div class="no-comments">
                <i class="fas fa-comments"></i>
                <p>No reviews yet. Be the first to share your experience!</p>
            </div>
        `;
        return;
    }

    list.innerHTML = comments.map((comment, index) => `
        <div class="comment-item" data-index="${index}">
            <div class="comment-header">
                <div class="comment-author">
                    <div class="comment-avatar">${comment.name.charAt(0).toUpperCase()}</div>
                    <div class="comment-meta">
                        <h4>${escapeHtml(comment.name)}</h4>
                        <time>${formatDate(comment.date)}</time>
                    </div>
                </div>
                ${isAdmin ? `
                    <div class="comment-actions">
                        <button class="edit-btn" onclick="editComment(${index})" title="Edit">
                            <i class="fas fa-pen"></i>
                        </button>
                        <button onclick="deleteComment(${index})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                ` : ''}
            </div>
            <div class="comment-text">${escapeHtml(comment.text)}</div>
        </div>
    `).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

document.getElementById('commentForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('commentName').value.trim();
    const text = document.getElementById('commentText').value.trim();

    if (!name || !text) return;

    comments.unshift({
        name,
        text,
        date: new Date().toISOString()
    });

    localStorage.setItem('skyComments', JSON.stringify(comments));
    renderComments();
    document.getElementById('commentForm').reset();
    showToast('Review submitted successfully!', 'success');
});

function deleteComment(index) {
    if (!isAdmin) return;
    if (confirm('Are you sure you want to delete this review?')) {
        comments.splice(index, 1);
        localStorage.setItem('skyComments', JSON.stringify(comments));
        renderComments();
        showToast('Review deleted successfully', 'success');
    }
}

function editComment(index) {
    if (!isAdmin) return;
    const comment = comments[index];
    const newText = prompt('Edit review:', comment.text);
    if (newText !== null && newText.trim() !== '') {
        comments[index].text = newText.trim();
        localStorage.setItem('skyComments', JSON.stringify(comments));
        renderComments();
        showToast('Review updated successfully', 'success');
    }
}

function clearAllComments() {
    if (!isAdmin) return;
    if (confirm('Are you sure you want to delete ALL reviews? This cannot be undone.')) {
        comments = [];
        localStorage.setItem('skyComments', JSON.stringify(comments));
        renderComments();
        showToast('All reviews cleared', 'info');
    }
}

function loadSampleComments() {
    if (!isAdmin) return;
    const sampleComments = [
        { name: 'James M.', text: 'Absolutely incredible experience. Ariana is professional, warm, and knows exactly how to make you feel comfortable. The massage was therapeutic and the company was unforgettable. Will definitely book again!', date: new Date(Date.now() - 86400000 * 2).toISOString() },
        { name: 'Anonymous', text: 'The 2-hour session was worth every penny. The nuru massage was out of this world. She is truly skilled and makes you feel like the only person in the room. Highly recommend!', date: new Date(Date.now() - 86400000 * 5).toISOString() },
        { name: 'D.', text: 'Discreet, classy, and absolutely stunning. The GFE experience felt genuine and natural. Ariana is a rare gem. Five stars all the way.', date: new Date(Date.now() - 86400000 * 8).toISOString() },
        { name: 'Mr. K', text: 'I have been to many providers, but Ariana stands out. Her attention to detail, her conversation, and her skills are unmatched. The full night experience was magical.', date: new Date(Date.now() - 86400000 * 12).toISOString() }
    ];
    comments = [...sampleComments, ...comments];
    localStorage.setItem('skyComments', JSON.stringify(comments));
    renderComments();
    showToast('Sample reviews loaded', 'success');
}

// ========================
// ADMIN SYSTEM
// ========================
const adminBtn = document.getElementById('adminBtn');
const adminModal = document.getElementById('adminModal');
const adminPanel = document.getElementById('adminPanel');

adminBtn.addEventListener('click', () => {
    if (isAdmin) {
        logoutAdmin();
    } else {
        adminModal.classList.add('active');
        document.getElementById('adminPassword').focus();
    }
});

function closeAdminModal() {
    adminModal.classList.remove('active');
    document.getElementById('adminPassword').value = '';
}

function loginAdmin() {
    const password = document.getElementById('adminPassword').value;
    if (password === ADMIN_PASSWORD) {
        isAdmin = true;
        adminBtn.textContent = 'Logout';
        adminBtn.style.background = 'var(--danger)';
        adminPanel.classList.add('active');
        closeAdminModal();
        renderComments();
        showToast('Admin mode activated', 'success');
    } else {
        showToast('Incorrect password', 'error');
        document.getElementById('adminPassword').value = '';
        document.getElementById('adminPassword').focus();
    }
}

function logoutAdmin() {
    isAdmin = false;
    adminBtn.textContent = 'Admin';
    adminBtn.style.background = '';
    adminPanel.classList.remove('active');
    renderComments();
    showToast('Logged out successfully', 'info');
}

// Close modal on overlay click
adminModal.addEventListener('click', (e) => {
    if (e.target === adminModal) closeAdminModal();
});

// Enter key on password field
document.getElementById('adminPassword').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loginAdmin();
});

// ========================
// TOAST NOTIFICATIONS
// ========================
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const icon = toast.querySelector('i');

    toast.className = `toast ${type}`;
    toastMessage.textContent = message;

    if (type === 'success') icon.className = 'fas fa-check-circle';
    else if (type === 'error') icon.className = 'fas fa-times-circle';
    else icon.className = 'fas fa-info-circle';

    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ========================
// SMOOTH SCROLL FOR NAV LINKS
// ========================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ========================
// INITIAL RENDER
// ========================
renderComments();

// ========================
// GALLERY LIGHTBOX
// ========================
const galleryItems = document.querySelectorAll('.gallery-item');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');
let currentImageIndex = 0;
const galleryImages = Array.from(galleryItems).map(item => item.querySelector('img').src);

galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        currentImageIndex = index;
        openLightbox(galleryImages[index]);
    });
});

function openLightbox(src) {
    lightboxImg.src = src;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

function showPrevImage() {
    currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    lightboxImg.src = galleryImages[currentImageIndex];
}

function showNextImage() {
    currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
    lightboxImg.src = galleryImages[currentImageIndex];
}

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); showPrevImage(); });
lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); showNextImage(); });
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrevImage();
    if (e.key === 'ArrowRight') showNextImage();
});
