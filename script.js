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
// COMMENTS SYSTEM - LOCALSTORAGE + PRE-LOADED
// ========================
let isAdmin = false;
const ADMIN_PASSWORD = 'skyadmin2026';

// Pre-loaded sample comments (these show for ALL visitors)
const PRELOADED_COMMENTS = [
    {
        id: 'pre-1',
        name: 'James M.',
        text: 'Absolutely incredible experience. Ariana is professional, warm, and knows exactly how to make you feel comfortable. The massage was therapeutic and the company was unforgettable. Will definitely book again!',
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
        isPreloaded: true
    },
    {
        id: 'pre-2',
        name: 'Anonymous',
        text: 'The 2-hour session was worth every penny. The nuru massage was out of this world. She is truly skilled and makes you feel like the only person in the room. Highly recommend!',
        date: new Date(Date.now() - 86400000 * 5).toISOString(),
        isPreloaded: true
    },
    {
        id: 'pre-3',
        name: 'D.',
        text: 'Discreet, classy, and absolutely stunning. The GFE experience felt genuine and natural. Ariana is a rare gem. Five stars all the way.',
        date: new Date(Date.now() - 86400000 * 8).toISOString(),
        isPreloaded: true
    },
    {
        id: 'pre-4',
        name: 'Mr. K',
        text: 'I have been to many providers, but Ariana stands out. Her attention to detail, her conversation, and her skills are unmatched. The full night experience was magical.',
        date: new Date(Date.now() - 86400000 * 12).toISOString(),
        isPreloaded: true
    },
    {
        id: 'pre-5',
        name: 'Rico',
        text: 'First time booking and I was nervous, but Ariana made me feel at ease immediately. The bodyrub was heavenly and her personality is even better. Already planning my next visit.',
        date: new Date(Date.now() - 86400000 * 15).toISOString(),
        isPreloaded: true
    },
    {
        id: 'pre-6',
        name: 'T. Williams',
        text: 'The VIP treatment is no joke. Every detail was perfect from start to finish. She is the definition of luxury companionship. Worth every single dollar.',
        date: new Date(Date.now() - 86400000 * 18).toISOString(),
        isPreloaded: true
    },
    {
        id: 'pre-7',
        name: 'Mystery Guest',
        text: 'Cam session was fire. She is responsive, creative, and knows how to keep things exciting even through a screen. Custom content was delivered fast and exceeded expectations.',
        date: new Date(Date.now() - 86400000 * 21).toISOString(),
        isPreloaded: true
    },
    {
        id: 'pre-8',
        name: 'L.',
        text: 'The domination session was exactly what I needed. Safe, consensual, and thrilling. She reads your energy perfectly and knows when to push and when to hold back. A true professional.',
        date: new Date(Date.now() - 86400000 * 25).toISOString(),
        isPreloaded: true
    }
];

// Get all comments (preloaded + user-submitted from localStorage)
function getAllComments() {
    const userComments = JSON.parse(localStorage.getItem('skyComments')) || [];
    // Combine preloaded + user comments, sort by date newest first
    const all = [...PRELOADED_COMMENTS, ...userComments];
    all.sort((a, b) => new Date(b.date) - new Date(a.date));
    return all;
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

// Render comments for homepage (latest 3)
function renderHomepageComments() {
    const list = document.getElementById('commentsList');
    const seeMoreCount = document.getElementById('seeMoreCount');

    if (!list) return;

    const comments = getAllComments();

    if (seeMoreCount) {
        const extraCount = Math.max(0, comments.length - 3);
        seeMoreCount.textContent = extraCount > 0 ? extraCount : '';
        seeMoreCount.style.display = extraCount > 0 ? 'inline-flex' : 'none';
    }

    if (comments.length === 0) {
        list.innerHTML = '<div class="no-comments"><i class="fas fa-comments"></i><p>No reviews yet. Be the first to share your experience!</p></div>';
        return;
    }

    const latestComments = comments.slice(0, 3);
    list.innerHTML = latestComments.map((comment) => `
        <div class="comment-item" data-id="${comment.id}">
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
                        ${!comment.isPreloaded ? `
                        <button class="edit-btn" onclick="editComment('${comment.id}')" title="Edit">
                            <i class="fas fa-pen"></i>
                        </button>
                        ` : ''}
                        <button onclick="deleteComment('${comment.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                ` : ''}
            </div>
            <div class="comment-text">${escapeHtml(comment.text)}</div>
        </div>
    `).join('');
}

// Submit comment (localStorage)
const commentForm = document.getElementById('commentForm');
if (commentForm) {
    commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('commentName').value.trim();
        const text = document.getElementById('commentText').value.trim();

        if (!name || !text) return;

        const submitBtn = commentForm.querySelector('.submit-btn');
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitBtn.disabled = true;

        // Simulate network delay for realism
        setTimeout(() => {
            const userComments = JSON.parse(localStorage.getItem('skyComments')) || [];
            userComments.unshift({
                id: 'user-' + Date.now(),
                name: name,
                text: text,
                date: new Date().toISOString(),
                isPreloaded: false
            });
            localStorage.setItem('skyComments', JSON.stringify(userComments));

            showToast('Review submitted successfully!', 'success');
            commentForm.reset();

            if (document.getElementById('allCommentsList')) {
                renderAllComments();
            } else {
                renderHomepageComments();
            }

            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Review';
            submitBtn.disabled = false;
        }, 800);
    });
}

function deleteComment(id) {
    if (!isAdmin) return;
    if (!confirm('Are you sure you want to delete this review?')) return;

    // Check if it's a preloaded comment
    const preloadedIndex = PRELOADED_COMMENTS.findIndex(c => c.id === id);
    if (preloadedIndex !== -1) {
        PRELOADED_COMMENTS.splice(preloadedIndex, 1);
    } else {
        // Remove from localStorage
        let userComments = JSON.parse(localStorage.getItem('skyComments')) || [];
        userComments = userComments.filter(c => c.id !== id);
        localStorage.setItem('skyComments', JSON.stringify(userComments));
    }

    showToast('Review deleted successfully', 'success');
    if (document.getElementById('allCommentsList')) {
        renderAllComments();
    } else {
        renderHomepageComments();
    }
}

function editComment(id) {
    if (!isAdmin) return;

    const allComments = getAllComments();
    const comment = allComments.find(c => c.id === id);
    if (!comment) return;

    const newText = prompt('Edit review:', comment.text);
    if (newText === null || newText.trim() === '') return;

    if (comment.isPreloaded) {
        comment.text = newText.trim();
    } else {
        let userComments = JSON.parse(localStorage.getItem('skyComments')) || [];
        const userComment = userComments.find(c => c.id === id);
        if (userComment) {
            userComment.text = newText.trim();
            localStorage.setItem('skyComments', JSON.stringify(userComments));
        }
    }

    showToast('Review updated successfully', 'success');
    if (document.getElementById('allCommentsList')) {
        renderAllComments();
    } else {
        renderHomepageComments();
    }
}

function clearAllComments() {
    if (!isAdmin) return;
    if (!confirm('Are you sure you want to delete ALL user reviews? Preloaded reviews will remain.')) return;

    localStorage.removeItem('skyComments');
    showToast('All user reviews cleared', 'info');
    if (document.getElementById('allCommentsList')) {
        renderAllComments();
    } else {
        renderHomepageComments();
    }
}

function loadSampleComments() {
    if (!isAdmin) return;
    showToast('Sample comments are already pre-loaded!', 'info');
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
            renderAllComments();
        } else {
            renderHomepageComments();
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
        renderAllComments();
    } else {
        renderHomepageComments();
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
    renderHomepageComments();
}
