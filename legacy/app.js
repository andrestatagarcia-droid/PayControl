// State Management
let state = {
    services: [],
    sources: [],
    transactions: []
};

const API_URL = ''; // Same origin

// DOM Elements
const views = document.querySelectorAll('.view');
const navBtns = document.querySelectorAll('.nav-btn');
const modalOverlay = document.getElementById('modal-container');
const modalForm = document.getElementById('modal-form');
const modalTitle = document.getElementById('modal-title');
const currentDateEl = document.getElementById('current-date');

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
});

async function initApp() {
    updateDateDisplay();
    await loadState();
    renderDashboard();
    renderTransactions();
    renderServices();
    renderSources();
}

async function loadState() {
    try {
        const [servicesRes, sourcesRes, transRes] = await Promise.all([
            fetch('/api/services'),
            fetch('/api/sources'),
            fetch('/api/transactions')
        ]);
        state.services = await servicesRes.json();
        state.sources = await sourcesRes.json();
        state.transactions = await transRes.json();
    } catch (err) {
        console.error('Error loading state:', err);
    }
}

function updateDateDisplay() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateEl.textContent = new Date().toLocaleDateString('es-ES', options);
}

function setupEventListeners() {
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetView = btn.getAttribute('data-view');
            switchView(targetView);
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    document.querySelector('.close-modal').onclick = closeModal;
    window.onclick = (e) => { if (e.target == modalOverlay) closeModal(); };

    document.getElementById('open-entry-modal').onclick = () => openModal('transaction');
    document.getElementById('open-service-modal').onclick = () => openModal('service');
    document.getElementById('open-source-modal').onclick = () => openModal('source');

    modalForm.onsubmit = handleFormSubmit;
}

function switchView(viewId) {
    views.forEach(view => {
        view.classList.remove('active');
        if (view.id === viewId) view.classList.add('active');
    });
}

function openModal(type, editId = null) {
    modalForm.innerHTML = '';
    modalForm.setAttribute('data-type', type);
    modalForm.setAttribute('data-edit-id', editId || '');
    
    if (type === 'service') {
        modalTitle.textContent = editId ? 'Editar Servicio' : 'Nuevo Servicio Recurrente';
        const data = editId ? state.services.find(s => s.id === editId) : {};
        modalForm.innerHTML = `
            <div class="form-group"><label>Empresa</label><input type="text" name="empresa" value="${data.empresa || ''}" required></div>
            <div class="form-group"><label>Servicio</label><input type="text" name="servicio" value="${data.servicio || ''}" required></div>
            <div class="form-group"><label>Número de Contrato</label><input type="text" name="contrato" value="${data.contrato || ''}"></div>
            <div class="form-group"><label>Categoría</label><input type="text" name="categoria" value="${data.categoria || ''}"></div>
            <div class="form-group"><label>Link de Pago</label><input type="url" name="link" value="${data.link || ''}"></div>
            <div class="form-group"><label>Comentarios</label><textarea name="comments">${data.comments || ''}</textarea></div>
        `;
    } else if (type === 'source') {
        modalTitle.textContent = editId ? 'Editar Fuente' : 'Nueva Fuente de Pago';
        const data = editId ? state.sources.find(s => s.id === editId) : {};
        modalForm.innerHTML = `
            <div class="form-group"><label>Nombre</label><input type="text" name="name" value="${data.name || ''}" required></div>
            <div class="form-group"><label>Tipo</label>
                <select name="type">
                    <option value="Banco" ${data.type === 'Banco' ? 'selected' : ''}>Banco</option>
                    <option value="Tarjeta" ${data.type === 'Tarjeta' ? 'selected' : ''}>Tarjeta</option>
                    <option value="Efectivo" ${data.type === 'Efectivo' ? 'selected' : ''}>Efectivo</option>
                </select>
            </div>
            <div class="form-group"><label>Saldo Actual</label><input type="number" step="0.01" name="balance" value="${data.balance || 0}"></div>
        `;
    } else if (type === 'transaction') {
        modalTitle.textContent = editId ? 'Editar Registro' : 'Nuevo Registro de Pago';
        const data = editId ? state.transactions.find(t => t.id === editId) : {};
        modalForm.innerHTML = `
            <div class="form-group">
                <label>Servicio (Autocompleta)</label>
                <input type="text" name="serviceName" id="transaction-service-input" list="services-datalist" value="${data.serviceName || ''}" required autocomplete="off">
                <datalist id="services-datalist">
                    ${state.services.map(s => `<option value="${s.servicio} (${s.empresa})" data-id="${s.id}">`).join('')}
                </datalist>
            </div>
            <div id="service-info-preview" class="info-box ${data.serviceName ? '' : 'hidden'}"></div>
            <div class="form-row">
                <div class="form-group"><label>Fecha</label><input type="date" name="date" value="${data.date || new Date().toISOString().split('T')[0]}" required></div>
                <div class="form-group"><label>Monto</label><input type="number" step="0.01" name="amount" value="${data.amount || ''}" required></div>
            </div>
            <div class="form-group"><label>Referencia</label><input type="text" name="reference" value="${data.reference || ''}"></div>
            <div class="form-group"><label>Fuente de Pago</label>
                <select name="sourceId" required>
                    <option value="">Seleccionar...</option>
                    ${state.sources.map(src => `<option value="${src.id}" ${data.sourceId === src.id ? 'selected' : ''}>${src.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label class="checkbox-label"><input type="checkbox" name="isDebt" ${data.isDebt ? 'checked' : ''}> Es Deuda (Pendiente)</label>
            </div>
        `;

        const serviceInput = document.getElementById('transaction-service-input');
        const preview = document.getElementById('service-info-preview');
        serviceInput.oninput = (e) => {
            const service = state.services.find(s => `${s.servicio} (${s.empresa})` === e.target.value);
            if (service) {
                preview.innerHTML = `<div class="preview-grid">
                    <span><strong>Empresa:</strong> ${service.empresa}</span>
                    <span><strong>Contrato:</strong> ${service.contrato || 'N/A'}</span>
                    <span><strong>Categoría:</strong> ${service.categoria || 'General'}</span>
                </div>`;
                preview.classList.remove('hidden');
            } else preview.classList.add('hidden');
        };
    }
    modalOverlay.classList.remove('hidden');
}

function closeModal() {
    modalOverlay.classList.add('hidden');
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(modalForm);
    const type = modalForm.getAttribute('data-type');
    const editId = modalForm.getAttribute('data-edit-id');
    const data = Object.fromEntries(formData.entries());
    
    if (type === 'transaction') {
        data.isDebt = formData.get('isDebt') === 'on';
        const service = state.services.find(s => `${s.servicio} (${s.empresa})` === data.serviceName);
        if (service) {
            data.empresa = service.empresa;
            data.contrato = service.contrato;
            data.categoria = service.categoria;
        }
    }

    data.id = editId || Date.now().toString();

    try {
        await fetch(`/api/${type}s`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        closeModal();
        await initApp();
    } catch (err) {
        alert('Error al guardar datos');
    }
}

window.deleteItem = async (type, id) => {
    if (confirm('¿Estás seguro de eliminar este elemento?')) {
        try {
            await fetch(`/api/${type}s/${id}`, { method: 'DELETE' });
            await initApp();
        } catch (err) {
            alert('Error al eliminar');
        }
    }
};

window.openModal = openModal;

function renderDashboard() {
    const total = state.sources.reduce((sum, s) => sum + parseFloat(s.balance || 0), 0);
    const pending = state.transactions.filter(t => t.isDebt).length;
    document.getElementById('total-balance').textContent = `$${total.toLocaleString()}`;
    document.getElementById('pending-payments').textContent = pending;

    const recentList = document.getElementById('recent-list');
    recentList.innerHTML = state.transactions.slice(-5).reverse().map(t => `
        <div class="activity-item">
            <span>${t.serviceName}</span>
            <span class="${t.amount < 0 ? 'text-danger' : 'text-success'}">$${Math.abs(t.amount).toLocaleString()}</span>
        </div>
    `).join('') || '<p class="text-dim">No hay actividad reciente</p>';
}

function renderTransactions() {
    const tbody = document.getElementById('transactions-body');
    tbody.innerHTML = state.transactions.map(t => {
        const source = state.sources.find(s => s.id === t.sourceId);
        return `<tr>
            <td>${t.date}</td>
            <td>${t.serviceName}</td>
            <td class="desktop-only">${t.reference || '-'}</td>
            <td style="font-weight: 600">$${parseFloat(t.amount).toLocaleString()}</td>
            <td><span class="badge">${source ? source.name : '-'}</span></td>
            <td>
                <button class="btn-icon" onclick="openModal('transaction', '${t.id}')">✏️</button>
                <button class="btn-icon" onclick="deleteItem('transaction', '${t.id}')">🗑️</button>
            </td>
        </tr>`;
    }).join('');
}

function renderServices() {
    const list = document.getElementById('services-list');
    list.innerHTML = state.services.map(s => `<li class="config-item">
        <div><strong>${s.servicio}</strong><p>${s.empresa} - ${s.contrato || 'N/A'}</p></div>
        <div>
            <button class="btn-sm" onclick="openModal('service', '${s.id}')">Editar</button>
            <button class="btn-sm text-danger" onclick="deleteItem('service', '${s.id}')">X</button>
        </div>
    </li>`).join('');
}

function renderSources() {
    const list = document.getElementById('sources-list');
    list.innerHTML = state.sources.map(s => `<li class="config-item">
        <div><strong>${s.name}</strong><p>${s.type} - $${parseFloat(s.balance).toLocaleString()}</p></div>
        <div>
            <button class="btn-sm" onclick="openModal('source', '${s.id}')">Editar</button>
            <button class="btn-sm text-danger" onclick="deleteItem('source', '${s.id}')">X</button>
        </div>
    </li>`).join('');
}
