// ========================
// CONFIG - REPLACE THIS URL AFTER GOOGLE SHEETS SETUP
// ========================
const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbwQe71imCcY5_YIIkneNKH6QAa3KrpgsrRyqOLVuxjUcNxeqNOOyVrcwUNWuny64cXy/exec';

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
if (particlesContainer) {
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
}

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
if (navbar) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.3)';
        } else {
            navbar.style.boxShadow = 'none';
        }
    });
}

// ========================
// COMMENTS SYSTEM - GOOGLE SHEETS
// ========================
let isAdmin = false;
const ADMIN_PASSWORD = 'skyadmin2026';

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

// Load comments for homepage (latest 3)
async function loadHomepageComments() {
    const list = document.getElementById('commentsList');
    const seeMoreCount = document.getElementById('seeMoreCount');

    if (!list) return;

    list.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading reviews...</div>';

    try {
        const response = await fetch(SHEET_API_URL + '?action=getComments');
        const data = await response.json();

        if (data.success) {
            const comments = data.comments;
            seeMoreCount.textContent = comments.length > 3 ? comments.length - 3 : 0;

            if (comments.length === 0) {
                list.innerHTML = '<div class="no-comments"><i class="fas fa-comments"></i><p>No reviews yet. Be the first to share your experience!</p></div>';
                return;
            }

            // Show only latest 3
            const latestComments = comments.slice(0, 3);
            list.innerHTML = latestComments.map((comment) => `
                <div class="comment-item" data-id="${comment.id}">
                    <div class="comment-header">
                        <div class="comment-author">
                            <div class="comment-avatar">${comment.name.charAt(0).toUpperCase()}</div>
                            <div class="comment-meta">
                                <h4>${escapeHtml(comment.name)}</h4>
                                <time>${formatDate(comment.timestamp)}</time>
                            </div>
                        </div>
                        ${isAdmin ? `
                            <div class="comment-actions">
                                <button class="edit-btn" onclick="editComment('${comment.id}')" title="Edit">
                                    <i class="fas fa-pen"></i>
                                </button>
                                <button onclick="deleteComment('${comment.id}')" title="Delete">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        ` : ''}
                    </div>
                    <div class="comment-text">${escapeHtml(comment.text)}</div>
                </div>
            `).join('');
        } else {
            list.innerHTML = '<div class="no-comments"><i class="fas fa-exclamation-circle"></i><p>Could not load reviews. Please try again later.</p></div>';
        }
    } catch (err) {
        list.innerHTML = '<div class="no-comments"><i class="fas fa-exclamation-circle"></i><p>Could not load reviews. Please check your connection.</p></div>';
    }
}

// Submit comment to Google Sheets
const commentForm = document.getElementById('commentForm');
if (commentForm) {
    commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('commentName').value.trim();
        const text = document.getElementById('commentText').value.trim();

        if (!name || !text) return;

        const submitBtn = commentForm.querySelector('.submit-btn');
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitBtn.disabled = true;

        try {
            const response = await fetch(SHEET_API_URL + '?action=addComment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, text })
            });

            const data = await response.json();

            if (data.success) {
                showToast('Review submitted successfully!', 'success');
                commentForm.reset();
                // Reload comments
                if (document.getElementById('allCommentsList')) {
                    loadAllComments();
                } else {
                    loadHomepageComments();
                }
            } else {
                showToast('Failed to submit review. Please try again.', 'error');
            }
        } catch (err) {
            showToast('Network error. Please check your connection.', 'error');
        } finally {
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Review';
            submitBtn.disabled = false;
        }
    });
}

async function deleteComment(id) {
    if (!isAdmin) return;
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
        const response = await fetch(SHEET_API_URL + '?action=deleteComment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });

        const data = await response.json();

        if (data.success) {
            showToast('Review deleted successfully', 'success');
            if (document.getElementById('allCommentsList')) {
                loadAllComments();
            } else {
                loadHomepageComments();
            }
        } else {
            showToast('Failed to delete review', 'error');
        }
    } catch (err) {
        showToast('Network error', 'error');
    }
}

async function editComment(id) {
    if (!isAdmin) return;

    // Find the comment text
    const commentText = prompt('Edit review:');
    if (commentText === null || commentText.trim() === '') return;

    try {
        const response = await fetch(SHEET_API_URL + '?action=editComment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, text: commentText.trim() })
        });

        const data = await response.json();

        if (data.success) {
            showToast('Review updated successfully', 'success');
            if (document.getElementById('allCommentsList')) {
                loadAllComments();
            } else {
                loadHomepageComments();
            }
        } else {
            showToast('Failed to update review', 'error');
        }
    } catch (err) {
        showToast('Network error', 'error');
    }
}

async function clearAllComments() {
    if (!isAdmin) return;
    if (!confirm('Are you sure you want to delete ALL reviews? This cannot be undone.')) return;

    // For Google Sheets, admin should clear manually or we can add a clear endpoint
    showToast('Please clear all rows from the Google Sheet manually.', 'info');
}

async function loadSampleComments() {
    if (!isAdmin) return;

    const sampleComments = [
        { name: 'James M.', text: 'Absolutely incredible experience. Ariana is professional, warm, and knows exactly how to make you feel comfortable. The massage was therapeutic and the company was unforgettable. Will definitely book again!' },
        { name: 'Anonymous', text: 'The 2-hour session was worth every penny. The nuru massage was out of this world. She is truly skilled and makes you feel like the only person in the room. Highly recommend!' },
        { name: 'D.', text: 'Discreet, classy, and absolutely stunning. The GFE experience felt genuine and natural. Ariana is a rare gem. Five stars all the way.' },
        { name: 'Mr. K', text: 'I have been to many providers, but Ariana stands out. Her attention to detail, her conversation, and her skills are unmatched. The full night experience was magical.' }
    ];

    for (const comment of sampleComments) {
        try {
            await fetch(SHEET_API_URL + '?action=addComment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(comment)
            });
        } catch (err) {
            console.error('Failed to add sample comment:', err);
        }
    }

    showToast('Sample reviews loaded', 'success');
    if (document.getElementById('allCommentsList')) {
        loadAllComments();
    } else {
        loadHomepageComments();
    }
}

// ========================
// HIDDEN ADMIN ACCESS
// ========================
let keySequence = [];
let keyTimer = null;
const SECRET_CODE = ['Shift', 'a', 'd', 'm', 'i', 'n'];

const adminModal = document.getElementById('adminModal');
const adminPanel = document.getElementById('adminPanel');

document.addEventListener('keydown', (e) => {
    keySequence.push(e.key);

    if (keyTimer) clearTimeout(keyTimer);
    keyTimer = setTimeout(() => {
        keySequence = [];
    }, 3000);

    if (keySequence.length > SECRET_CODE.length) {
        keySequence.shift();
    }

    if (keySequence.join(',') === SECRET_CODE.join(',')) {
        keySequence = [];
        if (isAdmin) {
            logoutAdmin();
        } else {
            adminModal.classList.add('active');
            document.getElementById('adminPassword').focus();
        }
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
        adminPanel.classList.add('active');
        closeAdminModal();
        if (document.getElementById('allCommentsList')) {
            loadAllComments();
        } else {
            loadHomepageComments();
        }
        showToast('Admin mode activated', 'success');
    } else {
        showToast('Incorrect password', 'error');
        document.getElementById('adminPassword').value = '';
        document.getElementById('adminPassword').focus();
    }
}

function logoutAdmin() {
    isAdmin = false;
    adminPanel.classList.remove('active');
    if (document.getElementById('allCommentsList')) {
        loadAllComments();
    } else {
        loadHomepageComments();
    }
    showToast('Logged out successfully', 'info');
}

if (adminModal) {
    adminModal.addEventListener('click', (e) => {
        if (e.target === adminModal) closeAdminModal();
    });
}

const adminPasswordInput = document.getElementById('adminPassword');
if (adminPasswordInput) {
    adminPasswordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') loginAdmin();
    });
}

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
// GALLERY LIGHTBOX
// ========================
const galleryItems = document.querySelectorAll('.gallery-item');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');

if (galleryItems.length > 0 && lightbox) {
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
}

// ========================
// INITIAL LOAD
// ========================
if (document.getElementById('commentsList')) {
    loadHomepageComments();
}
