// Sample initial data
const initialBooks = [
    { id: 1, title: "The Pragmatic Programmer", author: "Andy Hunt, Dave Thomas", qty: 3, available: true },
    { id: 2, title: "Clean Code", author: "Robert C. Martin", qty: 5, available: true },
    { id: 3, title: "Design Patterns", author: "Erich Gamma et al.", qty: 0, available: false },
    { id: 4, title: "The Hobbit", author: "J.R.R. Tolkien", qty: 2, available: true },
    { id: 5, title: "1984", author: "George Orwell", qty: 10, available: true }
];

// Initialize DB in localStorage if it doesn't exist
function initDB() {
    if (!localStorage.getItem('libraryBooks')) {
        localStorage.setItem('libraryBooks', JSON.stringify(initialBooks));
    }
}

// Get all books
function getBooks() {
    return JSON.parse(localStorage.getItem('libraryBooks')) || [];
}

// Save books
function saveBooks(books) {
    localStorage.setItem('libraryBooks', JSON.stringify(books));
}

// Handle Login Form
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        window.location.href = 'home.html';
    });
}

// Logout handler
function logout() {
    // Basic logout simulation
    window.location.href = 'index.html';
}

// Render Books List (for books.html)
function renderBooksList(searchTerm = '') {
    const grid = document.getElementById('booksGrid');
    const noResults = document.getElementById('noResults');
    if (!grid) return;

    let books = getBooks();
    if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        books = books.filter(b => b.title.toLowerCase().includes(lowerTerm) || b.author.toLowerCase().includes(lowerTerm));
    }

    grid.innerHTML = '';
    
    if (books.length === 0) {
        grid.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }

    grid.style.display = 'grid';
    noResults.style.display = 'none';

    books.forEach(book => {
        const statusBadge = book.qty > 0 
            ? `<span class="badge available">Available (${book.qty})</span>` 
            : `<span class="badge unavailable">Out of Stock</span>`;

        const card = document.createElement('div');
        card.className = 'glass-panel book-card';
        card.innerHTML = `
            <div class="book-cover-placeholder">📘</div>
            <div class="book-info">
                <h3>${book.title}</h3>
                <p class="author">${book.author}</p>
            </div>
            <div class="book-meta">
                ${statusBadge}
                <button class="btn btn-secondary" style="padding: 0.25rem 0.75rem; font-size: 0.8rem;" ${book.qty === 0 ? 'disabled' : ''}>Borrow</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Render Inventory Table (for manage-books.html)
function renderInventoryTable() {
    const tbody = document.getElementById('inventoryTbody');
    if (!tbody) return;

    const books = getBooks();
    tbody.innerHTML = '';

    books.forEach(book => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-weight: 500;">${book.title}</td>
            <td style="color: var(--text-muted);">${book.author}</td>
            <td>
                <div class="qty-control">
                    <button class="qty-btn" onclick="updateQty(${book.id}, -1)">-</button>
                    <span>${book.qty}</span>
                    <button class="qty-btn" onclick="updateQty(${book.id}, 1)">+</button>
                </div>
            </td>
            <td>
                <button class="btn btn-danger" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" onclick="deleteBook(${book.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Add New Book
function handleAddBook(e) {
    e.preventDefault();
    const title = document.getElementById('addTitle').value;
    const author = document.getElementById('addAuthor').value;
    const qty = parseInt(document.getElementById('addQty').value, 10);

    const books = getBooks();
    const newId = books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1;

    books.push({
        id: newId,
        title,
        author,
        qty,
        available: qty > 0
    });

    saveBooks(books);
    document.getElementById('addBookForm').reset();
    renderInventoryTable(); // Refresh table
}

// Update Book Qty
window.updateQty = function(id, change) {
    const books = getBooks();
    const bookIndex = books.findIndex(b => b.id === id);
    if (bookIndex > -1) {
        let newQty = books[bookIndex].qty + change;
        if (newQty < 0) newQty = 0;
        books[bookIndex].qty = newQty;
        books[bookIndex].available = newQty > 0;
        saveBooks(books);
        renderInventoryTable();
    }
};

// Delete Book
window.deleteBook = function(id) {
    if(confirm("Are you sure you want to delete this book?")) {
        let books = getBooks();
        books = books.filter(b => b.id !== id);
        saveBooks(books);
        renderInventoryTable();
    }
};

// Update dashboard stats
function updateDashboardStats() {
    const totalStatEl = document.getElementById('totalBooksStat');
    if (totalStatEl) {
        const books = getBooks();
        const total = books.reduce((sum, b) => sum + b.qty, 0);
        totalStatEl.textContent = total;
    }
}

// Global Init
initDB();
// If on home.html, update stats
updateDashboardStats();
