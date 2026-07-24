// =============================================
// CLASSE PRINCIPAL - TaskManager
// =============================================

class TaskManager {
    constructor() {
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
        this.loadTheme();  // Carrega o tema antes de bindEvents
        this.bindEvents();
        this.render();
        this.updateUI();
        this.setupPWA();
        this.setupConnectionListeners();
        
        console.log('✅ App inicializado com sucesso!');
    }

    // =============================================
    // MÉTODOS DE CARREGAMENTO
    // =============================================

    loadTasks() {
        try {
            const saved = localStorage.getItem('tasks');
            this.tasks = saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Erro ao carregar tarefas:', e);
            this.tasks = [];
        }
    }

    saveTasks() {
        try {
            localStorage.setItem('tasks', JSON.stringify(this.tasks));
            this.updateUI();
        } catch (e) {
            console.error('Erro ao salvar tarefas:', e);
        }
    }

    loadProfile() {
        try {
            const saved = localStorage.getItem('profile');
            if (saved) this.profile = JSON.parse(saved);
        } catch (e) {
            console.error('Erro ao carregar perfil:', e);
        }
    }

    saveProfile() {
        try {
            localStorage.setItem('profile', JSON.stringify(this.profile));
            this.updateProfileUI();
        } catch (e) {
            console.error('Erro ao salvar perfil:', e);
        }
    }

    // =============================================
    // MÉTODOS DE TEMA (CORRIGIDOS)
    // =============================================

    loadTheme() {
        try {
            // Verifica se há preferência salva
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'light') {
                this.isDarkMode = false;
                this.applyLightMode();
            } else if (savedTheme === 'dark') {
                this.isDarkMode = true;
                this.applyDarkMode();
            } else {
                // Se não houver preferência, usa o sistema
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                this.isDarkMode = prefersDark;
                if (prefersDark) {
                    this.applyDarkMode();
                } else {
                    this.applyLightMode();
                }
            }
        } catch (e) {
            console.error('Erro ao carregar tema:', e);
            this.isDarkMode = true;
            this.applyDarkMode();
        }
    }

    applyDarkMode() {
        document.body.classList.remove('light-mode');
        this.darkModeIcon.textContent = '☀️';
        this.darkModeLabel.textContent = 'Modo Claro';
        document.querySelector('meta[name="theme-color"]').content = '#000000';
        this.isDarkMode = true;
        localStorage.setItem('theme', 'dark');
    }

    applyLightMode() {
        document.body.classList.add('light-mode');
        this.darkModeIcon.textContent = '🌙';
        this.darkModeLabel.textContent = 'Modo Escuro';
        document.querySelector('meta[name="theme-color"]').content = '#f0f2f5';
        this.isDarkMode = false;
        localStorage.setItem('theme', 'light');
    }

    toggleTheme() {
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
        // Principais
        this.taskList = document.getElementById('taskList');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.showingCount = document.getElementById('showingCount');
        this.pendingCount = document.getElementById('pendingCount');
        
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
        this.fabShareWhatsApp = document.getElementById('fabShareWhatsApp');
        this.darkModeToggle = document.getElementById('darkModeToggle');
        this.darkModeIcon = document.getElementById('darkModeIcon');
        this.darkModeLabel = document.getElementById('darkModeLabel');
        this.installAppMenu = document.getElementById('installAppMenu');
        this.logoutBtn = document.getElementById('logoutBtn');
        this.installBanner = document.getElementById('installBanner');
        this.installBtn = document.getElementById('installBtn');
        this.installClose = document.getElementById('installClose');
        
        // Status
        this.statusDot = document.getElementById('statusDot');
        this.statusText = document.getElementById('statusText');
        this.connectionStatus = document.getElementById('connectionStatus');
        this.connectionText = document.getElementById('connectionText');
        this.toast = document.getElementById('toast');
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
        if (this.pendingCount) this.pendingCount.textContent = pending;
    }

    updateSidebarStats() {
        const pending = this.tasks.filter(t => !t.completed).length;
        if (this.taskCount) this.taskCount.textContent = pending;
    }

    updateProfileUI() {
        this.profileName.textContent = this.profile.name;
        this.profileEmail.textContent = this.profile.email;
        this.profileAvatar.textContent = this.profile.avatar || '👤';
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
        const filteredTasks = this.getFilteredTasks();
        this.showingCount.textContent = filteredTasks.length;

        if (filteredTasks.length === 0) {
            this.renderEmpty();
            return;
        }

        this.taskList.innerHTML = filteredTasks.map((task, index) => {
            const metaParts = [];
            if (task.ordem) {
                metaParts.push(`<span class="meta-item"><span class="meta-label">#</span><span class="meta-value">${escapeHtml(task.ordem)}</span></span>`);
            }
            if (task.obs) {
                metaParts.push(`<span class="meta-item"><span class="meta-label">📝</span><span class="meta-value">${escapeHtml(task.obs)}</span></span>`);
            }
            const metaHtml = metaParts.length > 0 ? `<div class="task-meta">${metaParts.join('')}</div>` : '';

            return `
                <li class="task-item ${task.completed ? 'completed' : 'pending'}" 
                    data-id="${task.id}" data-index="${index}">
                    <div class="task-main">
                        <span class="drag-handle">⠿</span>
                        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                        <span class="task-text">${escapeHtml(task.text)}</span>
                        <span class="task-date">${task.createdAt || ''}</span>
                        <div class="task-actions">
                            <button class="action-btn edit-btn" data-action="edit">✏️</button>
                            <button class="action-btn delete-btn" data-action="delete">✕</button>
                        </div>
                    </div>
                    ${metaHtml}
                    ${task.endereco ? this.renderAddress(task.endereco) : ''}
                </li>
            `;
        }).join('');

        this.setupDragAndDrop();
        this.setupActionButtons();
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

    renderAddress(endereco) {
        const enderecoStr = endereco.display_name || formatAddressDisplay(endereco);
        const lat = endereco.lat || '';
        const lon = endereco.lon || '';
        const query = encodeURIComponent(enderecoStr);
        
        const googleMapsUrl = lat && lon 
            ? `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`
            : `https://www.google.com/maps/search/?api=1&query=${query}`;
        
        const wazeUrl = lat && lon
            ? `https://waze.com/ul?ll=${lat},${lon}&navigate=yes`
            : `https://waze.com/ul?q=${query}&navigate=yes`;

        return `
            <div class="task-address">
                <span class="address-icon">📍</span>
                <span class="address-text">${escapeHtml(enderecoStr)}</span>
                <div class="address-actions">
                    <a href="${googleMapsUrl}" target="_blank" class="address-link google">🗺️ Google</a>
                    <a href="${wazeUrl}" target="_blank" class="address-link waze">🚗 Waze</a>
                </div>
            </div>
        `;
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
        a.download = `tarefas_${new Date().toISOString().slice(0,10)}.json`;
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
                console.error('Erro na importação:', error);
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
            a.download = `arquivo_${new Date().toISOString().slice(0,10)}.json`;
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
    // MÉTODOS DE MODAL
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
                        ${formatAddressDisplay(task.endereco)}
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
    // MÉTODOS DE ENDEREÇO
    // =============================================

    clearModalAddress() {
        this.selectedAddress = null;
        this.modalSelectedAddress.classList.remove('active');
        this.modalAddressSearch.value = '';
        this.modalSuggestions.classList.remove('active');
    }

    selectAddressModal(addressData) {
        const address = {
            display_name: addressData.display_name,
            lat: addressData.lat,
            lon: addressData.lon,
            cep: addressData.address?.postcode || '',
            logradouro: addressData.address?.road || '',
            bairro: addressData.address?.suburb || addressData.address?.neighbourhood || '',
            cidade: addressData.address?.city || addressData.address?.town || addressData.address?.village || '',
            uf: addressData.address?.state || '',
            pais: addressData.address?.country || 'Brasil'
        };

        this.selectedAddress = address;
        this.modalSelectedText.innerHTML = `
            <strong>📍 Endereço:</strong><br>
            ${formatAddressDisplay(address)}
        `;
        this.modalSelectedAddress.classList.add('active');
        this.modalSuggestions.classList.remove('active');
        this.modalAddressSearch.value = address.display_name;
        showToast('✅ Endereço selecionado!');
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
    // MÉTODOS DE DRAG & DROP
    // =============================================

    setupDragAndDrop() {
        const items = this.taskList.querySelectorAll('.task-item');
        items.forEach(item => {
            item.addEventListener('mousedown', (e) => {
                if (e.target.closest('.task-checkbox') || e.target.closest('.action-btn')) return;
                // Iniciar drag
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
                const enderecoStr = task.endereco.logradouro || task.endereco.display_name || '';
                if (enderecoStr) message += `   📍 ${enderecoStr}\n`;
            }
            message += '\n';
        });

        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
        showToast('📤 Abrindo WhatsApp para compartilhar');
    }

    // =============================================
    // MÉTODOS DE BUSCA DE ENDEREÇO
    // =============================================

    async buscarEndereco(query) {
        if (!query || query.trim().length < 3) {
            this.modalSuggestions.classList.remove('active');
            return;
        }

        try {
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=br&addressdetails=1&accept-language=pt-BR`;
            const response = await fetch(url, { headers: { 'User-Agent': 'TaskApp/1.0' } });
            const data = await response.json();

            if (data.length === 0) {
                this.modalSuggestions.innerHTML = `<div class="modal-suggestion-item" style="color: var(--text-muted); cursor: default;">Nenhum endereço encontrado</div>`;
                this.modalSuggestions.classList.add('active');
                return;
            }

            this.modalSuggestions.innerHTML = data.map(item => {
                const icon = this.getAddressIcon(item.type);
                return `
                    <div class="modal-suggestion-item" data-address='${JSON.stringify(item)}'>
                        <div class="suggestion-main">${icon} ${item.display_name}</div>
                        <div class="suggestion-detail">${this.formatAddressDetail(item)}</div>
                    </div>
                `;
            }).join('');

            this.modalSuggestions.classList.add('active');

            this.modalSuggestions.querySelectorAll('.modal-suggestion-item').forEach(el => {
                el.addEventListener('click', () => {
                    this.selectAddressModal(JSON.parse(el.dataset.address));
                });
            });
        } catch (error) {
            console.error('Erro ao buscar endereço:', error);
            showToast('⚠️ Erro ao buscar endereço');
        }
    }

    getAddressIcon(type) {
        const icons = {
            'administrative': '🏛️', 'village': '🏘️', 'town': '🏙️', 'city': '🏙️',
            'state': '🗺️', 'road': '🛤️', 'building': '🏢', 'house': '🏠',
            'amenity': '📍', 'shop': '🛍️'
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
        // Sidebar
        this.menuToggle.addEventListener('click', () => this.toggleSidebar());
        this.sidebarOverlay.addEventListener('click', () => this.closeSidebar());

        // Dark Mode
        this.darkModeToggle.addEventListener('click', () => this.toggleTheme());

        // Menu items
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

        // Perfil
        this.profileAvatar.addEventListener('click', () => this.openProfileModal());
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
        this.modalProfileClose.addEventListener('click', () => this.closeProfileModal());
        this.profileModal.addEventListener('click', (e) => {
            if (e.target === this.profileModal) this.closeProfileModal();
        });

        // Ações de dados
        this.exportDataBtn.addEventListener('click', () => this.exportData());
        this.importFileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) this.importData(e.target.files[0]);
        });
        this.archiveTasksBtn.addEventListener('click', () => this.archiveCompleted());
        this.resetAppBtn.addEventListener('click', () => this.resetApp());
        this.clearAllData.addEventListener('click', () => this.clearAllData());

        // FABs
        this.fabAddTask.addEventListener('click', () => this.openTaskModal());
        this.fabShareWhatsApp.addEventListener('click', () => this.shareWhatsApp());

        // Modal Tarefa
        this.modalTaskClose.addEventListener('click', () => this.closeTaskModal());
        this.taskModal.addEventListener('click', (e) => {
            if (e.target === this.taskModal) this.closeTaskModal();
        });

        // Busca de endereço
        this.modalSearchBtn.addEventListener('click', () => {
            this.buscarEndereco(this.modalAddressSearch.value);
        });
        this.modalAddressSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.buscarEndereco(this.modalAddressSearch.value);
            }
        });
        let searchTimeout;
        this.modalAddressSearch.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            const query = this.modalAddressSearch.value;
            if (query.length >= 3) {
                searchTimeout = setTimeout(() => this.buscarEndereco(query), 800);
            } else {
                this.modalSuggestions.classList.remove('active');
            }
        });
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.modal-address-section')) {
                this.modalSuggestions.classList.remove('active');
            }
        });
        this.modalClearAddress.addEventListener('click', () => this.clearModalAddress());

        // Formulário
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

        // Checkbox
        this.taskList.addEventListener('click', (e) => {
            if (e.target.classList.contains('task-checkbox')) {
                const taskItem = e.target.closest('.task-item');
                if (taskItem) {
                    this.toggleTask(parseInt(taskItem.dataset.id));
                }
            }
        });

        // Filtros
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.filter;
                this.render();
            });
        });

        // Fechar sidebar com gesto
        let touchStartX = 0;
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        document.addEventListener('touchend', (e) => {
            if (touchStartX - e.changedTouches[0].screenX > 80 && this.sidebar.classList.contains('open')) {
                this.closeSidebar();
            }
        }, { passive: true });
    }
}

// =============================================
// INICIALIZAÇÃO
// =============================================

document.addEventListener('DOMContentLoaded', () => {
    const app = new TaskManager();
    console.log('✅ App organizado e inicializado!');
    window.app = app;
});