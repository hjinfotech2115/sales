/**
 * Customer Management Logic
 */

const STORAGE_KEY_CUSTOMERS = 'salesflow_customers';

const getInitialCustomers = () => {
    const existing = localStorage.getItem(STORAGE_KEY_CUSTOMERS);
    if (existing) return JSON.parse(existing);

    // Mocks
    const mocks = [
        { id: '1', name: 'John Doe', email: 'john@example.com', phone: '+1 234 567 8900', status: 'Active', joined: '2023-11-20' },
        { id: '2', name: 'Jane Smith', email: 'jane@studio.design', phone: '+1 987 654 3210', status: 'Active', joined: '2023-12-01' }
    ];
    localStorage.setItem(STORAGE_KEY_CUSTOMERS, JSON.stringify(mocks));
    return mocks;
};

let customers = getInitialCustomers();
let editingId = null;

const tableBody = document.getElementById('customerTableBody');
const emptyState = document.getElementById('emptyState');
const modal = document.getElementById('customerModal');
const countEl = document.getElementById('customerCount');

const renderTable = (filter = '') => {
    tableBody.innerHTML = '';
    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(filter.toLowerCase()) ||
        c.email.toLowerCase().includes(filter.toLowerCase())
    );

    countEl.textContent = `${filtered.length} Customer${filtered.length !== 1 ? 's' : ''}`;

    if (filtered.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        filtered.forEach(item => {
            const tr = document.createElement('tr');
            const statusClass = item.status === 'Active' ? 'completed' : 'pending';

            tr.innerHTML = `
                <td>
                    <div style="display:flex; align-items:center; gap:0.75rem;">
                        <div style="width:32px; height:32px; background:#e0e7ff; border-radius:50%; display:flex; align-items:center; justify-content:center; color:var(--primary-color); font-weight:600; font-size:0.8em;">
                            ${item.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span style="font-weight: 500;">${item.name}</span>
                    </div>
                </td>
                <td style="color:var(--text-muted);">${item.email}</td>
                <td>${item.phone}</td>
                <td><span class="status-badge ${statusClass}" style="${statusClass === 'pending' ? 'background:#f1f5f9; color:#64748b' : ''}">${item.status}</span></td>
                <td>${item.joined}</td>
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
};

const save = () => {
    localStorage.setItem(STORAGE_KEY_CUSTOMERS, JSON.stringify(customers));
    renderTable(document.getElementById('searchInput').value);
};

// Actions
const openModal = () => modal.classList.add('active');
const closeModal = () => {
    modal.classList.remove('active');
    document.getElementById('customerForm').reset();
    editingId = null;
    document.getElementById('modalTitle').textContent = 'New Customer';
};

window.openEdit = (id) => {
    const item = customers.find(c => c.id === id);
    if (!item) return;
    editingId = id;
    document.getElementById('modalTitle').textContent = 'Edit Customer';
    document.getElementById('custName').value = item.name;
    document.getElementById('custEmail').value = item.email;
    document.getElementById('custPhone').value = item.phone;
    document.getElementById('custStatus').value = item.status;
    openModal();
};

window.deleteItem = (id) => {
    if (confirm('Remove this customer?')) {
        customers = customers.filter(c => c.id !== id);
        save();
    }
};

document.getElementById('openModalBtn').addEventListener('click', openModal);
document.getElementById('closeModalBtn').addEventListener('click', closeModal);
document.getElementById('cancelBtn').addEventListener('click', closeModal);
document.getElementById('searchInput').addEventListener('input', (e) => renderTable(e.target.value));

document.getElementById('customerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
        name: document.getElementById('custName').value,
        email: document.getElementById('custEmail').value,
        phone: document.getElementById('custPhone').value,
        status: document.getElementById('custStatus').value
    };

    if (editingId) {
        customers = customers.map(c => c.id === editingId ? { ...c, ...data } : c);
    } else {
        const d = new Date();
        const joined = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        customers.push({ id: Date.now().toString(), ...data, joined });
    }
    save();
    closeModal();
});

renderTable();
