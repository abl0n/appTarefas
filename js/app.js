// =============================================
// FUNÇÕES AUXILIARES (UTILS)
// =============================================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    if (!toast) {
        console.warn('Toast element not found');
        return;
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

function formatAddressDisplay(address) {
    if (!address) return '';
    const parts = [];
    if (address.logradouro) parts.push(address.logradouro);
    if (address.bairro) parts.push(address.bairro);
    if (address.cidade) parts.push(address.cidade);
    if (address.uf) parts.push(address.uf);
    if (address.cep) parts.push(`CEP: ${address.cep}`);
    return parts.join(' - ');
}

// =============================================
// CLASSE PRINCIPAL - TaskManager
// =============================================

class TaskManager {
    constructor() {
        console.log('🔧 Inicializando TaskManager...');

        // Estado
        this.tasks = [];
        this.currentFilter = 'all';
        this.selectedAddress = null;
        this.editingTaskId = null;
        this.isDarkMode = false;
        this.deferredPrompt = null;

        // Configurações
        this.profile = {
            name: 'Usuário',
            email: 'usuario@email.com',
            avatar: '👤'
        };

        // Inicialização
        this.loadTasks();
        this.loadProfile();
        this.initializeDOM();
        this.loadTheme();
        this.bindEvents();
        this.render();
        this.updateUI();
        this.setupPWA();
        this.setupConnectionListeners();

        console.log(`✅ App inicializado com ${this.tasks.length} tarefas!`);
        console.log(`🌙 Modo escuro: ${this.isDarkMode ? 'Ativado' : 'Desativado'}`);
    }

    // =============================================
    // MÉTODOS DE CARREGAMENTO
    // =============================================

    loadTasks() {
        try {
            const saved = localStorage.getItem('tasks');
            if (saved) {
                this.tasks = JSON.parse(saved);
                console.log(`📋 ${this.tasks.length} tarefas carregadas`);
            } else {
                this.tasks = [];
                console.log('📭 Nenhuma tarefa salva');
            }
        } catch (e) {
            console.error('❌ Erro ao carregar tarefas:', e);
            this.tasks = [];
        }
    }

    saveTasks() {
        try {
            localStorage.setItem('tasks', JSON.stringify(this.tasks));
            this.updateUI();
        } catch (e) {
            console.error('❌ Erro ao salvar tarefas:', e);
        }
    }

    loadProfile() {
        try {
            const saved = localStorage.getItem('profile');
            if (saved) {
                this.profile = JSON.parse(saved);
                console.log('👤 Perfil carregado:', this.profile.name);
            }
        } catch (e) {
            console.error('❌ Erro ao carregar perfil:', e);
        }
    }

    saveProfile() {
        try {
            localStorage.setItem('profile', JSON.stringify(this.profile));
            this.updateProfileUI();
        } catch (e) {
            console.error('❌ Erro ao salvar perfil:', e);
        }
    }

    // =============================================
    // MÉTODOS DE TEMA
    // =============================================

    loadTheme() {
        try {
            const savedTheme = localStorage.getItem('theme');
            console.log('📂 Tema salvo:', savedTheme);

            if (savedTheme === 'light') {
                this.isDarkMode = false;
                this.applyLightMode();
            } else if (savedTheme === 'dark') {
                this.isDarkMode = true;
                this.applyDarkMode();
            } else {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                console.log('🌓 Preferência do sistema:', prefersDark ? 'escuro' : 'claro');
                this.isDarkMode = prefersDark;
                if (prefersDark) {
                    this.applyDarkMode();
                } else {
                    this.applyLightMode();
                }
            }
        } catch (e) {
            console.error('❌ Erro ao carregar tema:', e);
            this.isDarkMode = true;
            this.applyDarkMode();
        }
    }

    applyDarkMode() {
        console.log('🌙 Aplicando modo escuro...');
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');

        if (this.darkModeIcon) this.darkModeIcon.textContent = '☀️';
        if (this.darkModeLabel) this.darkModeLabel.textContent = 'Modo Claro';

        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.content = '#0F172A';

        this.isDarkMode = true;
        localStorage.setItem('theme', 'dark');
        console.log('✅ Modo escuro aplicado');
    }

    applyLightMode() {
        console.log('☀️ Aplicando modo claro...');
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');

        if (this.darkModeIcon) this.darkModeIcon.textContent = '🌙';
        if (this.darkModeLabel) this.darkModeLabel.textContent = 'Modo Escuro';

        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.content = '#F1F5F9';

        this.isDarkMode = false;
        localStorage.setItem('theme', 'light');
        console.log('✅ Modo claro aplicado');
    }

    toggleTheme() {
        console.log('🔄 Alternando tema...');
        if (this.isDarkMode) {
            this.applyLightMode();
            showToast('☀️ Modo claro ativado');
        } else {
            this.applyDarkMode();
            showToast('🌙 Modo escuro ativado');
        }
    }

    // =============================================
    // MÉTODOS DE DOM
    // =============================================

    initializeDOM() {
        console.log('🔧 Inicializando DOM...');

        // Principais
        this.taskList = document.getElementById('taskList');
        this.filterBtns = document.querySelectorAll('.filter-btn');

        // Sidebar
        this.sidebar = document.getElementById('sidebar');
        this.sidebarOverlay = document.getElementById('sidebarOverlay');
        this.menuToggle = document.getElementById('menuToggle');
        this.profileName = document.getElementById('profileName');
        this.profileEmail = document.getElementById('profileEmail');
        this.profileAvatar = document.getElementById('profileAvatar');
        this.taskCount = document.getElementById('taskCount');

        // Modais
        this.taskModal = document.getElementById('taskModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.taskForm = document.getElementById('taskForm');
        this.taskInput = document.getElementById('taskInput');
        this.taskOrder = document.getElementById('taskOrder');
        this.taskObs = document.getElementById('taskObs');
        this.editTaskId = document.getElementById('editTaskId');
        this.modalSubmitBtn = document.getElementById('modalSubmitBtn');
        this.modalTaskClose = document.getElementById('modalTaskClose');
        this.fabAddTask = document.getElementById('fabAddTask');

        // Endereço
        this.modalAddressSearch = document.getElementById('modalAddressSearch');
        this.modalSearchBtn = document.getElementById('modalSearchBtn');
        this.modalSuggestions = document.getElementById('modalSuggestions');
        this.modalSelectedAddress = document.getElementById('modalSelectedAddress');
        this.modalSelectedText = document.getElementById('modalSelectedText');
        this.modalClearAddress = document.getElementById('modalClearAddress');

        // Perfil
        this.profileModal = document.getElementById('profileModal');
        this.modalProfileClose = document.getElementById('modalProfileClose');
        this.profileForm = document.getElementById('profileForm');
        this.modalName = document.getElementById('modalName');
        this.modalEmail = document.getElementById('modalEmail');
        this.modalAvatar = document.getElementById('modalAvatar');

        // Botões
        this.clearAllData = document.getElementById('clearAllData');
        this.exportDataBtn = document.getElementById('exportDataBtn');
        this.importFileInput = document.getElementById('importFileInput');
        this.archiveTasksBtn = document.getElementById('archiveTasksBtn');
        this.resetAppBtn = document.getElementById('resetAppBtn');
        this.darkModeToggle = document.getElementById('darkModeToggle');
        this.darkModeIcon = document.getElementById('darkModeIcon');
        this.darkModeLabel = document.getElementById('darkModeLabel');
        this.installAppMenu = document.getElementById('installAppMenu');
        this.logoutBtn = document.getElementById('logoutBtn');
        this.installBanner = document.getElementById('installBanner');
        this.installBtn = document.getElementById('installBtn');
        this.installClose = document.getElementById('installClose');

        // Header Actions
        this.headerWhatsApp = document.getElementById('headerWhatsApp');
        this.headerEmail = document.getElementById('headerEmail');

        // Status
        this.statusDot = document.getElementById('statusDot');
        this.statusText = document.getElementById('statusText');
        this.connectionStatus = document.getElementById('connectionStatus');
        this.connectionText = document.getElementById('connectionText');
        this.toast = document.getElementById('toast');

        // Contadores dos filtros
        this.countAll = document.getElementById('countAll');
        this.countPending = document.getElementById('countPending');
        this.countCompleted = document.getElementById('countCompleted');

        console.log('✅ DOM inicializado');
    }

    // =============================================
    // MÉTODOS DE UI
    // =============================================

    updateUI() {
        this.updateStats();
        this.updateSidebarStats();
        this.updateProfileUI();
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;

        if (this.countAll) this.countAll.textContent = total;
        if (this.countPending) this.countPending.textContent = pending;
        if (this.countCompleted) this.countCompleted.textContent = completed;
    }

    updateSidebarStats() {
        const pending = this.tasks.filter(t => !t.completed).length;
        if (this.taskCount) this.taskCount.textContent = pending;
    }

    updateProfileUI() {
        if (this.profileName) this.profileName.textContent = this.profile.name;
        if (this.profileEmail) this.profileEmail.textContent = this.profile.email;
        if (this.profileAvatar) this.profileAvatar.textContent = this.profile.avatar || '👤';
    }

    // =============================================
    // MÉTODOS DE RENDERIZAÇÃO
    // =============================================

    getFilteredTasks() {
        let filtered = this.tasks;
        switch (this.currentFilter) {
            case 'pending': filtered = filtered.filter(t => !t.completed); break;
            case 'completed': filtered = filtered.filter(t => t.completed); break;
            default: break;
        }
        return filtered;
    }

    render() {
        console.log('🔄 Renderizando...');

        const filteredTasks = this.getFilteredTasks();
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;

        if (this.countAll) this.countAll.textContent = total;
        if (this.countPending) this.countPending.textContent = pending;
        if (this.countCompleted) this.countCompleted.textContent = completed;

        if (!this.taskList) {
            console.error('❌ taskList não encontrado!');
            return;
        }

        if (filteredTasks.length === 0) {
            this.renderEmpty();
            return;
        }

        this.taskList.innerHTML = filteredTasks.map((task, index) => {
            const dateStr = task.createdAt ? task.createdAt.split(',')[0] : '';
            const titulo = task.text || 'Tarefa sem título';

            let obsHtml = '';
            if (task.obs && task.obs.trim()) {
                obsHtml = `
                    <div class="task-obs" data-expanded="false">
                        <span class="obs-label">obs:</span>
                        <span class="obs-content">${escapeHtml(task.obs)}</span>
                        <span class="obs-toggle">▼</span>
                    </div>
                `;
            }

            let addressHtml = '';
            if (task.endereco) {
                addressHtml = this.renderAddress(task.endereco);
            }

            const ordemDisplayValue = task.ordem ? task.ordem : task.id;

            return `
                <li class="task-item ${task.completed ? 'completed' : 'pending'}" 
                    data-id="${task.id}" data-index="${index}">
                    <div class="task-main">
                        <span class="drag-handle">⠿</span>
                        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                        <span class="task-title">${escapeHtml(titulo)}</span>
                        <div class="task-actions">
                            <button class="action-btn edit-btn" data-action="edit">✏️</button>
                            <button class="action-btn delete-btn" data-action="delete">✕</button>
                        </div>
                    </div>
                    <div class="task-meta-row">
                        <div class="task-meta-col">
                            <span class="meta-label">Ordem:</span>
                            <span class="meta-value">${escapeHtml(String(ordemDisplayValue))}</span>
                        </div>
                        <div class="task-meta-col">
                            <span class="meta-label">Data:</span>
                            <span class="meta-value">${escapeHtml(dateStr)}</span>
                        </div>
                    </div>
                    ${obsHtml}
                    ${addressHtml}
                </li>
            `;
        }).join('');

        this.setupDragAndDrop();
        this.setupActionButtons();
        this.setupObsExpand();
    }

    renderEmpty() {
        const messages = {
            'all': { icon: '📝', text: 'Nenhuma tarefa cadastrada', sub: 'Toque no botão ✚ para adicionar' },
            'pending': { icon: '🎉', text: 'Todas as tarefas foram concluídas!', sub: 'Parabéns! Você está em dia' },
            'completed': { icon: '📌', text: 'Nenhuma tarefa concluída', sub: 'Marque as tarefas como concluídas' }
        };
        const msg = messages[this.currentFilter] || messages.all;
        this.taskList.innerHTML = `
            <div class="empty-message">
                <span class="empty-icon">${msg.icon}</span>
                ${msg.text}
                <div class="empty-sub">${msg.sub}</div>
            </div>
        `;
    }

    // =============================================
    // MÉTODOS DE FORMATAÇÃO
    // =============================================

    formatAddressSimple(endereco) {
        if (!endereco) return '';
        const parts = [];

        // Mostrar logradouro completo (com número)
        if (endereco.logradouro) {
            parts.push(endereco.logradouro);
        }

        if (endereco.bairro) parts.push(endereco.bairro);
        if (endereco.cidade) parts.push(endereco.cidade);
        if (endereco.uf) parts.push(endereco.uf);

        return parts.join(' - ');
    }

    formatCoordinates(lat, lon) {
        if (!lat || !lon) return '';
        const latNum = parseFloat(lat);
        const lonNum = parseFloat(lon);
        if (isNaN(latNum) || isNaN(lonNum)) return '';
        return `${latNum.toFixed(6)}, ${lonNum.toFixed(6)}`;
    }

    copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                showToast('📋 Coordenadas copiadas!');
            }).catch(() => {
                this.fallbackCopy(text);
            });
        } else {
            this.fallbackCopy(text);
        }
    }

    fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            showToast('📋 Coordenadas copiadas!');
        } catch (e) {
            showToast('⚠️ Erro ao copiar');
        }
        document.body.removeChild(textarea);
    }

    // =============================================
    // MÉTODOS DE ENDEREÇO (RENDER)
    // =============================================

    renderAddress(endereco) {
        const enderecoStr = this.formatAddressSimple(endereco);
        const lat = endereco.lat || '';
        const lon = endereco.lon || '';
        const coords = this.formatCoordinates(lat, lon);
        const query = encodeURIComponent(coords || enderecoStr);

        const googleMapsUrl = lat && lon
            ? `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`
            : `https://www.google.com/maps/search/?api=1&query=${query}`;

        const wazeUrl = lat && lon
            ? `https://waze.com/ul?ll=${lat},${lon}&navigate=yes`
            : `https://waze.com/ul?q=${query}&navigate=yes`;

        let html = `<div class="address-row">`;
        html += `<span class="address-icon">📍</span>`;
        html += `<span class="address-text">${escapeHtml(enderecoStr)}</span>`;
        html += `<div class="address-actions">`;
        html += `<a href="${googleMapsUrl}" target="_blank" class="address-link google" title="Abrir no Google Maps">`;
        html += `<img src="img/google-maps.svg" alt="Google Maps" class="icon-svg">`;
        html += `</a>`;
        html += `<a href="${wazeUrl}" target="_blank" class="address-link waze" title="Abrir no Waze">`;
        html += `<img src="img/waze.svg" alt="Waze" class="icon-svg">`;
        html += `</a>`;
        html += `</div></div>`;

        if (coords) {
            html += `
                <div class="coord-container">
                    <span class="coord-label">📍</span>
                    <span class="coord-value" title="Clique para copiar">${coords}</span>
                    <button class="coord-copy" data-coords="${coords}" title="Copiar coordenadas">Copiar</button>
                </div>
            `;
        }

        return `<div class="task-address">${html}</div>`;
    }

    // =============================================
    // MÉTODOS DE BUSCA DE ENDEREÇO - CORRIGIDO
    // =============================================

    async buscarEndereco(query) {
        if (!query || query.trim().length < 3) {
            showToast('📝 Digite pelo menos 3 caracteres');
            this.modalSuggestions.classList.remove('active');
            return;
        }

        const coordRegex = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
        if (coordRegex.test(query.trim())) {
            const parts = query.trim().split(',').map(p => parseFloat(p.trim()));
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                const lat = parts[0];
                const lon = parts[1];
                const address = {
                    display_name: `Coordenadas: ${lat}, ${lon}`,
                    lat: lat,
                    lon: lon,
                    logradouro: `Coordenadas: ${lat}, ${lon}`,
                    bairro: '',
                    cidade: 'Localização',
                    uf: '',
                    cep: ''
                };
                this.selectAddressModal(address);
                this.modalSuggestions.classList.remove('active');
                return;
            }
        }

        this.modalSearchBtn.textContent = '⏳ Buscando...';
        this.modalSearchBtn.disabled = true;

        try {
            let url = 'https://nominatim.openstreetmap.org/search?format=json&limit=6&addressdetails=1&accept-language=pt-BR';
            url += `&q=${encodeURIComponent(query)}`;
            url += '&viewbox=-47.5,-22.5,-45.5,-24.5&bounded=1';

            const response = await fetch(url, {
                headers: { 'User-Agent': 'TaskApp/1.0' }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.length === 0) {
                const fallbackUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=6&countrycodes=br&addressdetails=1&accept-language=pt-BR`;
                const fallbackResponse = await fetch(fallbackUrl, {
                    headers: { 'User-Agent': 'TaskApp/1.0' }
                });
                const fallbackData = await fallbackResponse.json();

                if (fallbackData.length === 0) {
                    this.modalSuggestions.innerHTML = `
                        <div class="modal-suggestion-item" style="color: var(--text-muted); cursor: default; text-align: center;">
                            Nenhum endereço encontrado
                        </div>
                    `;
                    this.modalSuggestions.classList.add('active');
                    this.modalSearchBtn.textContent = '🔍 Buscar';
                    this.modalSearchBtn.disabled = false;
                    return;
                }

                this.renderSuggestions(fallbackData);
            } else {
                this.renderSuggestions(data);
            }
        } catch (error) {
            console.error('❌ Erro ao buscar endereço:', error);
            showToast('⚠️ Erro ao buscar endereço. Tente novamente.');
            this.modalSuggestions.classList.remove('active');
        } finally {
            this.modalSearchBtn.textContent = '🔍 Buscar';
            this.modalSearchBtn.disabled = false;
        }
    }

    renderSuggestions(data) {
        if (!data || data.length === 0) {
            this.modalSuggestions.innerHTML = `
                <div class="modal-suggestion-item" style="color: var(--text-muted); cursor: default; text-align: center;">
                    Nenhum endereço encontrado
                </div>
            `;
            this.modalSuggestions.classList.add('active');
            return;
        }

        this.modalSuggestions.innerHTML = data.map(item => {
            const icon = this.getAddressIcon(item.type);
            const coords = this.formatCoordinates(item.lat, item.lon);
            const displayName = item.display_name || '';
            const shortName = displayName.length > 60 ? displayName.substring(0, 60) + '...' : displayName;

            return `
                <div class="modal-suggestion-item" data-address='${JSON.stringify(item)}'>
                    <div class="suggestion-main">${icon} ${shortName}</div>
                    <div class="suggestion-detail">
                        ${this.formatAddressDetail(item)} 
                        ${coords ? '• ' + coords : ''}
                    </div>
                </div>
            `;
        }).join('');

        this.modalSuggestions.classList.add('active');

        this.modalSuggestions.querySelectorAll('.modal-suggestion-item').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                try {
                    const addressData = JSON.parse(el.dataset.address);
                    this.selectAddressModal(addressData);
                    this.modalSuggestions.classList.remove('active');
                } catch (err) {
                    console.error('Erro ao selecionar endereço:', err);
                    showToast('⚠️ Erro ao selecionar endereço');
                }
            });
        });
    }

    getAddressIcon(type) {
        const icons = {
            'administrative': '🏛️',
            'village': '🏘️',
            'town': '🏙️',
            'city': '🏙️',
            'state': '🗺️',
            'road': '🛤️',
            'building': '🏢',
            'house': '🏠',
            'amenity': '📍',
            'shop': '🛍️'
        };
        return icons[type] || '📍';
    }

    formatAddressDetail(item) {
        const parts = [];
        if (item.address?.road) parts.push(item.address.road);
        if (item.address?.suburb) parts.push(item.address.suburb);
        if (item.address?.city) parts.push(item.address.city);
        if (item.address?.state) parts.push(item.address.state);
        if (item.address?.postcode) parts.push(`CEP: ${item.address.postcode}`);
        return parts.join(' • ') || item.class;
    }

    // =============================================
    // MÉTODOS DE MODAL
    // =============================================

    clearModalAddress() {
        this.selectedAddress = null;
        this.modalSelectedAddress.classList.remove('active');
        this.modalAddressSearch.value = '';
        this.modalSuggestions.classList.remove('active');
    }

    selectAddressModal(addressData) {
        // Extrair número do logradouro
        let logradouroCompleto = addressData.address?.road || '';
        const houseNumber = addressData.address?.house_number || '';

        if (houseNumber && logradouroCompleto) {
            logradouroCompleto = `${logradouroCompleto}, ${houseNumber}`;
        } else if (houseNumber && !logradouroCompleto) {
            logradouroCompleto = houseNumber;
        }

        const address = {
            display_name: addressData.display_name,
            lat: addressData.lat,
            lon: addressData.lon,
            cep: addressData.address?.postcode || '',
            logradouro: logradouroCompleto,
            numero: houseNumber,
            bairro: addressData.address?.suburb || addressData.address?.neighbourhood || '',
            cidade: addressData.address?.city || addressData.address?.town || addressData.address?.village || '',
            uf: addressData.address?.state || '',
            pais: addressData.address?.country || 'Brasil'
        };

        this.selectedAddress = address;
        this.modalSelectedText.innerHTML = `
        <strong>📍 Endereço:</strong><br>
        ${this.formatAddressSimple(address)}
    `;
        this.modalSelectedAddress.classList.add('active');
        this.modalSuggestions.classList.remove('active');
        this.modalAddressSearch.value = address.display_name;
        showToast('✅ Endereço selecionado!');
    }

    // =============================================
    // MÉTODOS CRUD
    // =============================================

    addTask(text, endereco, ordem, obs) {
        if (!text || !text.trim()) {
            showToast('⚠️ Digite uma tarefa!');
            return false;
        }

        const task = {
            id: Date.now(),
            text: text.trim(),
            completed: false,
            createdAt: new Date().toLocaleString('pt-BR'),
            endereco: endereco || null,
            ordem: ordem || '',
            obs: obs || '',
            order: this.tasks.length
        };

        this.tasks.push(task);
        this.saveTasks();
        this.render();
        this.closeTaskModal();
        showToast(endereco ? `✅ "${task.text}" com endereço!` : `✅ "${task.text}" adicionada!`);
        return true;
    }

    updateTask(id, text, endereco, ordem, obs) {
        if (!text || !text.trim()) {
            showToast('⚠️ Digite uma tarefa!');
            return false;
        }

        const task = this.tasks.find(t => t.id === id);
        if (!task) {
            showToast('⚠️ Tarefa não encontrada');
            return false;
        }

        task.text = text.trim();
        task.endereco = endereco || null;
        task.ordem = ordem || '';
        task.obs = obs || '';

        this.saveTasks();
        this.render();
        this.closeTaskModal();
        showToast(`✅ "${task.text}" atualizada!`);
        return true;
    }

    deleteTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.saveTasks();
            this.render();
            showToast(`🗑️ "${task.text}" removida`);
        }
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
            showToast(`${task.completed ? '✅' : '⏳'} "${task.text}" ${task.completed ? 'concluída' : 'reaberta'}`);
        }
    }

    // =============================================
    // MÉTODOS DE GERENCIAMENTO DE DADOS
    // =============================================

    exportData() {
        if (this.tasks.length === 0) {
            showToast('📭 Nenhuma tarefa para exportar');
            return;
        }

        const data = {
            tasks: this.tasks,
            profile: this.profile,
            exportedAt: new Date().toISOString(),
            version: '3.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tarefas_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast(`📤 ${this.tasks.length} tarefas exportadas!`);
        this.closeSidebar();
    }

    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (!data.tasks || !Array.isArray(data.tasks)) {
                    showToast('⚠️ Arquivo inválido!');
                    return;
                }
                if (data.profile) {
                    this.profile = data.profile;
                    this.saveProfile();
                }
                const count = data.tasks.length;
                this.tasks = data.tasks;
                this.saveTasks();
                this.render();
                this.updateUI();
                showToast(`📥 ${count} tarefas importadas com sucesso!`);
            } catch (error) {
                showToast('⚠️ Erro ao ler o arquivo!');
                console.error('❌ Erro na importação:', error);
            }
        };
        reader.readAsText(file);
        this.importFileInput.value = '';
        this.closeSidebar();
    }

    archiveCompleted() {
        const completedTasks = this.tasks.filter(t => t.completed);
        if (completedTasks.length === 0) {
            showToast('📭 Nenhuma tarefa concluída para arquivar');
            return;
        }

        if (confirm(`📦 Arquivar ${completedTasks.length} tarefa(s) concluída(s)?`)) {
            const archiveData = {
                tasks: completedTasks,
                archivedAt: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(archiveData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `arquivo_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.tasks = this.tasks.filter(t => !t.completed);
            this.saveTasks();
            this.render();
            this.updateUI();
            showToast(`📦 ${completedTasks.length} tarefas arquivadas!`);
            this.closeSidebar();
        }
    }

    resetApp() {
        if (this.tasks.length === 0) {
            showToast('📭 Nenhuma tarefa para resetar');
            return;
        }

        if (confirm('🔄 Resetar o app? Todas as tarefas serão removidas.')) {
            this.tasks = [];
            this.saveTasks();
            this.profile = { name: 'Usuário', email: 'usuario@email.com', avatar: '👤' };
            this.saveProfile();
            this.render();
            this.updateUI();
            showToast('🔄 App resetado com sucesso!');
            this.closeSidebar();
        }
    }

    clearAllData() {
        const totalTasks = this.tasks.length;
        if (totalTasks === 0) {
            showToast('📭 Nenhuma tarefa para limpar');
            return;
        }

        if (confirm(`⚠️ Excluir ${totalTasks} tarefa(s)?`)) {
            this.tasks = [];
            this.saveTasks();
            this.render();
            this.updateUI();
            showToast(`🗑️ ${totalTasks} tarefa(s) removida(s)`);
            this.closeSidebar();
        }
    }

    // =============================================
    // MÉTODOS DE MODAL (ABRIR/FECHAR)
    // =============================================

    openTaskModal(taskId = null) {
        this.editingTaskId = taskId;
        this.clearModalAddress();

        if (taskId !== null) {
            const task = this.tasks.find(t => t.id === taskId);
            if (task) {
                this.modalTitle.textContent = '✏️ Editar Tarefa';
                this.modalSubmitBtn.textContent = '💾 Salvar Alterações';
                this.taskInput.value = task.text;
                this.taskOrder.value = task.ordem || '';
                this.taskObs.value = task.obs || '';
                this.editTaskId.value = taskId;
                if (task.endereco) {
                    this.selectedAddress = { ...task.endereco };
                    this.modalSelectedText.innerHTML = `
                        <strong>📍 Endereço:</strong><br>
                        ${this.formatAddressSimple(task.endereco)}
                    `;
                    this.modalSelectedAddress.classList.add('active');
                    this.modalAddressSearch.value = task.endereco.display_name || '';
                }
            }
        } else {
            this.modalTitle.textContent = '✚ Nova Tarefa';
            this.modalSubmitBtn.textContent = '✅ Adicionar Tarefa';
            this.taskInput.value = '';
            this.taskOrder.value = '';
            this.taskObs.value = '';
            this.editTaskId.value = '';
        }

        this.taskModal.classList.add('active');
        setTimeout(() => this.taskInput.focus(), 400);
        this.closeSidebar();
    }

    closeTaskModal() {
        this.taskModal.classList.remove('active');
        this.clearModalAddress();
        this.modalSuggestions.classList.remove('active');
        this.editingTaskId = null;
    }

    openProfileModal() {
        this.modalName.value = this.profile.name;
        this.modalEmail.value = this.profile.email;
        this.modalAvatar.textContent = this.profile.avatar || '👤';
        this.profileModal.classList.add('active');
        this.closeSidebar();
    }

    closeProfileModal() {
        this.profileModal.classList.remove('active');
    }

    // =============================================
    // MÉTODOS DE PWA
    // =============================================

    setupPWA() {
        if (localStorage.getItem('installBannerClosed')) {
            this.installBanner.classList.remove('show');
        }

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            if (!localStorage.getItem('installBannerClosed')) {
                this.installBanner.classList.add('show');
            }
        });

        window.addEventListener('appinstalled', () => {
            this.installBanner.classList.remove('show');
            localStorage.setItem('installBannerClosed', 'true');
            showToast('✅ App instalado com sucesso!');
        });

        this.installBtn.addEventListener('click', async () => {
            if (this.deferredPrompt) {
                this.deferredPrompt.prompt();
                const result = await this.deferredPrompt.userChoice;
                if (result.outcome === 'accepted') {
                    this.installBanner.classList.remove('show');
                    localStorage.setItem('installBannerClosed', 'true');
                    showToast('✅ App instalado!');
                }
                this.deferredPrompt = null;
            } else {
                showToast('📱 Use o menu do navegador para instalar');
            }
        });

        this.installClose.addEventListener('click', () => {
            this.installBanner.classList.remove('show');
            localStorage.setItem('installBannerClosed', 'true');
        });

        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.installBanner.classList.remove('show');
            if (this.installAppMenu) {
                this.installAppMenu.style.display = 'none';
            }
        }
    }

    // =============================================
    // MÉTODOS DE CONEXÃO
    // =============================================

    setupConnectionListeners() {
        window.addEventListener('online', () => {
            this.updateConnectionUI(true);
            showToast('🌐 Conexão restaurada!');
        });

        window.addEventListener('offline', () => {
            this.updateConnectionUI(false);
            showToast('📶 Modo offline ativado');
        });
    }

    updateConnectionUI(isOnline) {
        if (isOnline) {
            this.connectionStatus.className = 'connection-status online';
            this.connectionText.textContent = '🟢 Conectado';
            this.statusDot.className = 'dot online';
            this.statusText.textContent = 'Online';
        } else {
            this.connectionStatus.className = 'connection-status offline';
            this.connectionText.textContent = '🔴 Modo Offline';
            this.statusDot.className = 'dot offline';
            this.statusText.textContent = 'Offline';
        }
        this.connectionStatus.style.transform = 'translateY(0)';
        clearTimeout(this.statusTimeout);
        this.statusTimeout = setTimeout(() => {
            this.connectionStatus.style.transform = 'translateY(-100%)';
        }, 3000);
    }

    // =============================================
    // MÉTODOS DE SIDEBAR
    // =============================================

    toggleSidebar() {
        this.sidebar.classList.toggle('open');
        this.sidebarOverlay.classList.toggle('active');
    }

    closeSidebar() {
        this.sidebar.classList.remove('open');
        this.sidebarOverlay.classList.remove('active');
    }

    // =============================================
    // MÉTODOS DE DRAG & DROP E AÇÕES
    // =============================================

    setupDragAndDrop() {
        const items = this.taskList.querySelectorAll('.task-item');
        items.forEach(item => {
            item.addEventListener('mousedown', (e) => {
                if (e.target.closest('.task-checkbox') || e.target.closest('.action-btn')) return;
            });
        });
    }

    setupActionButtons() {
        this.taskList.querySelectorAll('[data-action="edit"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const taskItem = btn.closest('.task-item');
                if (taskItem) {
                    this.openTaskModal(parseInt(taskItem.dataset.id));
                }
            });
        });

        this.taskList.querySelectorAll('[data-action="delete"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const taskItem = btn.closest('.task-item');
                if (taskItem) {
                    this.deleteTask(parseInt(taskItem.dataset.id));
                }
            });
        });

        document.querySelectorAll('.coord-copy').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const coords = btn.dataset.coords;
                if (coords) {
                    this.copyToClipboard(coords);
                    btn.classList.add('copied');
                    setTimeout(() => {
                        btn.classList.remove('copied');
                    }, 2000);
                }
            });
        });
    }

    setupObsExpand() {
        document.querySelectorAll('.task-obs').forEach(el => {
            el.addEventListener('click', function (e) {
                e.stopPropagation();
                const isExpanded = this.dataset.expanded === 'true';
                const toggle = this.querySelector('.obs-toggle');

                if (isExpanded) {
                    this.classList.remove('expanded');
                    this.dataset.expanded = 'false';
                    toggle.textContent = '▼';
                } else {
                    this.classList.add('expanded');
                    this.dataset.expanded = 'true';
                    toggle.textContent = '▲';
                }
            });
        });
    }

    // =============================================
    // MÉTODOS DE COMPARTILHAMENTO
    // =============================================

    shareWhatsApp() {
        if (this.tasks.length === 0) {
            showToast('📭 Nenhuma tarefa para compartilhar');
            return;
        }

        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;

        let message = '📋 *Minhas Tarefas*\n';
        message += `📊 Total: ${total} | ✅ Concluídas: ${completed} | ⏳ Pendentes: ${pending}\n\n`;
        message += '━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━\n\n';

        this.tasks.forEach((task, index) => {
            const status = task.completed ? '✅' : '⏳';
            const numero = (index + 1).toString().padStart(2, '0');
            let titulo = `${numero}. ${status} ${task.text}`;
            if (task.ordem) titulo = `${numero}. ${status} [#${task.ordem}] ${task.text}`;
            message += `${titulo}\n`;
            if (task.obs) message += `   📝 ${task.obs}\n`;
            if (task.endereco) {
                const enderecoStr = this.formatAddressSimple(task.endereco);
                if (enderecoStr) message += `   📍 ${enderecoStr}\n`;
            }
            message += '\n';
        });

        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
        showToast('📤 Abrindo WhatsApp para compartilhar');
    }

    shareEmail() {
        if (this.tasks.length === 0) {
            showToast('📭 Nenhuma tarefa para compartilhar');
            return;
        }

        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;

        let subject = encodeURIComponent('Minhas Tarefas - Relatório');
        let body = '';

        body += '📋 Minhas Tarefas\n';
        body += `📊 Total: ${total} | ✅ Concluídas: ${completed} | ⏳ Pendentes: ${pending}\n\n`;
        body += '━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━\n\n';

        this.tasks.forEach((task, index) => {
            const status = task.completed ? '✅' : '⏳';
            const numero = (index + 1).toString().padStart(2, '0');
            let titulo = `${numero}. ${status} ${task.text}`;
            if (task.ordem) titulo = `${numero}. ${status} [#${task.ordem}] ${task.text}`;
            body += `${titulo}\n`;
            if (task.obs) body += `   📝 ${task.obs}\n`;
            if (task.endereco) {
                const enderecoStr = this.formatAddressSimple(task.endereco);
                if (enderecoStr) body += `   📍 ${enderecoStr}\n`;
            }
            body += '\n';
        });

        const mailtoUrl = `mailto:?subject=${subject}&body=${encodeURIComponent(body)}`;
        window.open(mailtoUrl, '_blank');
        showToast('📧 Abrindo cliente de email');
    }

    // =============================================
    // MÉTODOS DE CONFIGURAÇÃO
    // =============================================

    showStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;
        const withAddress = this.tasks.filter(t => t.endereco).length;
        showToast(`📊 Total: ${total} | ✅ Concluídas: ${completed} | ⏳ Pendentes: ${pending} | 📍 Com endereço: ${withAddress}`);
        this.closeSidebar();
    }

    // =============================================
    // MÉTODOS DE EVENTOS
    // =============================================

    bindEvents() {
        console.log('🔧 Vinculando eventos...');

        if (this.headerWhatsApp) {
            this.headerWhatsApp.addEventListener('click', () => {
                this.shareWhatsApp();
            });
            console.log('✅ WhatsApp button bound');
        }

        if (this.headerEmail) {
            this.headerEmail.addEventListener('click', () => {
                this.shareEmail();
            });
            console.log('✅ Email button bound');
        }

        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', () => this.toggleSidebar());
        }
        if (this.sidebarOverlay) {
            this.sidebarOverlay.addEventListener('click', () => this.closeSidebar());
        }

        if (this.darkModeToggle) {
            this.darkModeToggle.addEventListener('click', () => this.toggleTheme());
        }

        document.querySelectorAll('.menu-item[data-page]').forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                if (page === 'profile') this.openProfileModal();
                else if (page === 'stats') this.showStats();
                else if (page === 'tasks') {
                    document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                    this.closeSidebar();
                }
            });
        });

        if (this.profileAvatar) {
            this.profileAvatar.addEventListener('click', () => this.openProfileModal());
        }
        if (this.profileForm) {
            this.profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = this.modalName.value.trim();
                const email = this.modalEmail.value.trim();
                if (!name || !email) {
                    showToast('⚠️ Preencha todos os campos');
                    return;
                }
                this.profile.name = name;
                this.profile.email = email;
                this.saveProfile();
                this.closeProfileModal();
                showToast('✅ Perfil atualizado!');
            });
        }
        if (this.modalProfileClose) {
            this.modalProfileClose.addEventListener('click', () => this.closeProfileModal());
        }
        if (this.profileModal) {
            this.profileModal.addEventListener('click', (e) => {
                if (e.target === this.profileModal) this.closeProfileModal();
            });
        }

        if (this.exportDataBtn) {
            this.exportDataBtn.addEventListener('click', () => this.exportData());
        }
        if (this.importFileInput) {
            this.importFileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) this.importData(e.target.files[0]);
            });
        }
        if (this.archiveTasksBtn) {
            this.archiveTasksBtn.addEventListener('click', () => this.archiveCompleted());
        }
        if (this.resetAppBtn) {
            this.resetAppBtn.addEventListener('click', () => this.resetApp());
        }
        if (this.clearAllData) {
            this.clearAllData.addEventListener('click', () => this.clearAllData());
        }

        if (this.fabAddTask) {
            this.fabAddTask.addEventListener('click', () => this.openTaskModal());
        }

        if (this.modalTaskClose) {
            this.modalTaskClose.addEventListener('click', () => this.closeTaskModal());
        }
        if (this.taskModal) {
            this.taskModal.addEventListener('click', (e) => {
                if (e.target === this.taskModal) this.closeTaskModal();
            });
        }

        // Busca de endereço - APENAS BOTÃO E ENTER
        if (this.modalSearchBtn) {
            this.modalSearchBtn.addEventListener('click', () => {
                this.buscarEndereco(this.modalAddressSearch.value);
            });
        }
        if (this.modalAddressSearch) {
            this.modalAddressSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.buscarEndereco(this.modalAddressSearch.value);
                }
            });
        }

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.modal-address-section')) {
                this.modalSuggestions.classList.remove('active');
            }
        });
        if (this.modalClearAddress) {
            this.modalClearAddress.addEventListener('click', () => this.clearModalAddress());
        }

        if (this.taskForm) {
            this.taskForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const endereco = this.selectedAddress ? { ...this.selectedAddress } : null;
                const ordem = this.taskOrder.value.trim();
                const obs = this.taskObs.value.trim();
                const text = this.taskInput.value.trim();
                const editId = parseInt(this.editTaskId.value);
                if (editId) {
                    this.updateTask(editId, text, endereco, ordem, obs);
                } else {
                    this.addTask(text, endereco, ordem, obs);
                }
            });
        }

        if (this.taskList) {
            this.taskList.addEventListener('click', (e) => {
                if (e.target.classList.contains('task-checkbox')) {
                    const taskItem = e.target.closest('.task-item');
                    if (taskItem) {
                        this.toggleTask(parseInt(taskItem.dataset.id));
                    }
                }
            });
        }

        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.filter;
                this.render();
            });
        });

        let touchStartX = 0;
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        document.addEventListener('touchend', (e) => {
            if (touchStartX - e.changedTouches[0].screenX > 80 && this.sidebar.classList.contains('open')) {
                this.closeSidebar();
            }
        }, { passive: true });

        console.log('✅ Eventos vinculados');
    }
}

// =============================================
// INICIALIZAÇÃO
// =============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM carregado, iniciando app...');
    const app = new TaskManager();
    console.log('✅ App organizado e inicializado!');
    window.app = app;
});