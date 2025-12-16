/**
 * SalesFlow Logic
 * Handles CRUD operations and UI updates
 */

// Constants
const STORAGE_KEY = 'salesflow_items';

// State
let items = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let editingId = null;

// DOM Elements
const modal = document.getElementById('itemModal');
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelBtn = document.getElementById('cancelBtn');
const saleForm = document.getElementById('saleForm');
const modalTitle = document.getElementById('modalTitle');
const tableBody = document.getElementById('salesById');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const refreshBtn = document.getElementById('refreshBtn');

// Dashboard Stat Elements
const totalRevenueEl = document.getElementById('totalRevenue');
const totalItemsEl = document.getElementById('totalItems');
const avgSaleEl = document.getElementById('avgSale');

// Format Currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
};

// Save to LocalStorage
const saveToStorage = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    updateStats();
};

// Update Dashboard Statistics
const updateStats = () => {
    const totalItems = items.length;
    const totalRevenue = items.reduce((sum, item) => sum + parseFloat(item.price), 0);
    const avgSale = totalItems > 0 ? totalRevenue / totalItems : 0;

    totalItemsEl.textContent = totalItems;
    totalRevenueEl.textContent = formatCurrency(totalRevenue);
    avgSaleEl.textContent = formatCurrency(avgSale);
};

// Render Items to Table
const renderItems = (filterText = '') => {
    tableBody.innerHTML = '';
    
    const filteredItems = items.filter(item => 
        item.name.toLowerCase().includes(filterText.toLowerCase()) || 
        item.category.toLowerCase().includes(filterText.toLowerCase())
    );

    if (filteredItems.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        
        // Sort by newest first (assuming date added concept, or just array order reversal)
        // Here we just reverse for display so newest is top
        [...filteredItems].reverse().forEach(item => {
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td>
                    <div style="font-weight: 500;">${item.name}</div>
                </td>
                <td><span style="color: var(--text-muted);">${item.category}</span></td>
                <td>${new Date(item.date).toLocaleDateString()}</td>
                <td style="font-weight: 600;">${formatCurrency(item.price)}</td>
                <td>
                    <span class="status-badge ${item.status.toLowerCase()}">${item.status}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="table-btn edit" onclick="openEditModal('${item.id}')">
                            <i class="ri-pencil-line"></i>
                        </button>
                        <button class="table-btn delete" onclick="deleteItem('${item.id}')">
                            <i class="ri-delete-bin-line"></i>
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }
};

// Modal Functions
const openModal = () => {
    modal.classList.add('active');
};

const closeModal = () => {
    modal.classList.remove('active');
    saleForm.reset();
    editingId = null;
    modalTitle.textContent = 'Add New Sale';
};

const openEditModal = (id) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    editingId = id;
    modalTitle.textContent = 'Edit Sale';
    
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemCategory').value = item.category;
    document.getElementById('itemPrice').value = item.price;
    
    // Set radio button
    const radioBtn = document.querySelector(`input[name="status"][value="${item.status}"]`);
    if(radioBtn) radioBtn.checked = true;

    openModal();
};

// CRUD Operations
const handleFormSubmit = (e) => {
    e.preventDefault();
    
    const name = document.getElementById('itemName').value;
    const category = document.getElementById('itemCategory').value;
    const price = parseFloat(document.getElementById('itemPrice').value);
    const status = document.querySelector('input[name="status"]:checked').value;

    if (editingId) {
        // Update
        items = items.map(item => {
            if (item.id === editingId) {
                return { ...item, name, category, price, status };
            }
            return item;
        });
    } else {
        // Create
        const newItem = {
            id: Date.now().toString(), // Simple ID generation
            name,
            category,
            price,
            status,
            date: new Date().toISOString()
        };
        items.push(newItem);
    }

    saveToStorage();
    renderItems(searchInput.value);
    closeModal();
};

const deleteItem = (id) => {
    if(confirm('Are you sure you want to delete this record?')) {
        items = items.filter(item => item.id !== id);
        saveToStorage();
        renderItems(searchInput.value);
    }
};

// Event Listeners
openModalBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);
saleForm.addEventListener('submit', handleFormSubmit);

searchInput.addEventListener('input', (e) => {
    renderItems(e.target.value);
});

refreshBtn.addEventListener('click', () => {
    renderItems(searchInput.value);
    // Add a spin animation class momentarily
    refreshBtn.querySelector('i').style.animation = 'spin 1s linear';
    setTimeout(() => {
        refreshBtn.querySelector('i').style.animation = 'none';
    }, 1000);
});

// Initialize
// Add keyframes for refresh spin if not in CSS
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
`;
document.head.appendChild(styleSheet);

// Expose functions to window for onclick handlers in HTML
window.openEditModal = openEditModal;
window.deleteItem = deleteItem;

// Initial Draw
updateStats();
renderItems();
