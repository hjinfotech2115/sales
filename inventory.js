/**
 * Inventory Management Logic
 */

const STORAGE_KEY_INVENTORY = 'salesflow_inventory';

// Initial State / Mock Data Function
const getInitialData = () => {
    const existing = localStorage.getItem(STORAGE_KEY_INVENTORY);
    if (existing) return JSON.parse(existing);

    // Default mock data if empty
    const mocks = [
        { id: '1', name: 'Office Chair', sku: 'FUR-101', category: 'Furniture', stock: 12, price: 149.99 },
        { id: '2', name: 'USB-C Cable', sku: 'ACC-202', category: 'Accessories', stock: 45, price: 9.99 },
        { id: '3', name: 'Monitor Stand', sku: 'ACC-305', category: 'Accessories', stock: 3, price: 29.50 }
    ];
    localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(mocks));
    return mocks;
};

let inventory = getInitialData();
let editingId = null;

// DOM
const tableBody = document.getElementById('inventoryTableBody');
const emptyState = document.getElementById('emptyState');
const modal = document.getElementById('inventoryModal');
const form = document.getElementById('inventoryForm');
const modalTitle = document.getElementById('modalTitle');

// Stats Elements
const totalProductsEl = document.getElementById('totalProducts');
const lowStockEl = document.getElementById('lowStockCount');
const inventoryValueEl = document.getElementById('inventoryValue');

// Helpers
const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const updateStats = () => {
    totalProductsEl.textContent = inventory.length;

    const lowStock = inventory.filter(i => parseInt(i.stock) < 5).length;
    lowStockEl.textContent = lowStock;
    if (lowStock > 0) lowStockEl.style.color = 'var(--danger-color)';
    else lowStockEl.style.color = 'var(--text-main)';

    const totalValue = inventory.reduce((sum, i) => sum + (i.price * i.stock), 0);
    inventoryValueEl.textContent = formatCurrency(totalValue);
};

const renderTable = (filter = '') => {
    tableBody.innerHTML = '';
    const filtered = inventory.filter(i =>
        i.name.toLowerCase().includes(filter.toLowerCase()) ||
        i.sku.toLowerCase().includes(filter.toLowerCase())
    );

    if (filtered.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        filtered.forEach(item => {
            const tr = document.createElement('tr');

            // Determine Status
            let statusBadge = '<span class="status-badge completed">In Stock</span>';
            if (item.stock == 0) statusBadge = '<span class="status-badge delete" style="background:#fecaca; color:#dc2626;">Out of Stock</span>';
            else if (item.stock < 5) statusBadge = '<span class="status-badge pending">Low Stock</span>';

            tr.innerHTML = `
                <td style="font-weight: 500;">${item.name}</td>
                <td style="color: var(--text-muted); font-size: 0.9em;">${item.sku}</td>
                <td>${item.category}</td>
                <td style="font-weight: 600;">${item.stock}</td>
                <td>${formatCurrency(item.price)}</td>
                <td>${statusBadge}</td>
                <td>
                    <div class="action-buttons">
                        <button class="table-btn edit" onclick="openEdit('${item.id}')"><i class="ri-pencil-line"></i></button>
                        <button class="table-btn delete" onclick="deleteItem('${item.id}')"><i class="ri-delete-bin-line"></i></button>
                    </div>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }
    updateStats();
};

const save = () => {
    localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(inventory));
    renderTable(document.getElementById('searchInput').value);
};

// Actions
const openModal = () => modal.classList.add('active');
const closeModal = () => {
    modal.classList.remove('active');
    form.reset();
    editingId = null;
    modalTitle.textContent = 'Add Product';
};

window.openEdit = (id) => {
    const item = inventory.find(i => i.id === id);
    if (!item) return;
    editingId = id;
    modalTitle.textContent = 'Edit Product';

    document.getElementById('itemName').value = item.name;
    document.getElementById('itemSku').value = item.sku;
    document.getElementById('itemCategory').value = item.category;
    document.getElementById('itemStock').value = item.stock;
    document.getElementById('itemPrice').value = item.price;

    openModal();
};

window.deleteItem = (id) => {
    if (confirm('Delete this product?')) {
        inventory = inventory.filter(i => i.id !== id);
        save();
    }
};

// Event Listeners
document.getElementById('openModalBtn').addEventListener('click', openModal);
document.getElementById('closeModalBtn').addEventListener('click', closeModal);
document.getElementById('cancelBtn').addEventListener('click', closeModal);

document.getElementById('searchInput').addEventListener('input', (e) => renderTable(e.target.value));

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
        name: document.getElementById('itemName').value,
        sku: document.getElementById('itemSku').value,
        category: document.getElementById('itemCategory').value,
        stock: parseInt(document.getElementById('itemStock').value),
        price: parseFloat(document.getElementById('itemPrice').value)
    };

    if (editingId) {
        inventory = inventory.map(i => i.id === editingId ? { ...i, ...data } : i);
    } else {
        inventory.push({ id: Date.now().toString(), ...data });
    }
    save();
    closeModal();
});

// CSV Export (Bonus dynamic feature)
document.getElementById('exportBtn').addEventListener('click', () => {
    const csvContent = "data:text/csv;charset=utf-8,"
        + "Name,SKU,Category,Stock,Price\n"
        + inventory.map(e => `${e.name},${e.sku},${e.category},${e.stock},${e.price}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "inventory_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// Init
renderTable();
