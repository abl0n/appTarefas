// =============================================
// APP.JS - TASK MANAGER (VERSÃO FINAL COMPLETA + MELHORIAS)
// =============================================

// ===== CONSTANTE DE DESVIOS (GLOBAL) =====
const CODIGOS_DESVIO = [
    { codigo: "00", descricao: "Executado" },
    { codigo: "01", descricao: "Parada técnica" },
    { codigo: "02", descricao: "Falta de material" },
    { codigo: "03", descricao: "Falta de pessoal" },
    { codigo: "04", descricao: "Condições climáticas" },
    { codigo: "08", descricao: "Deslocamento" },
    { codigo: "13", descricao: "Almoço/Janta" }
];

// ===== LISTA DE ATIVIDADES DE MANUTENÇÃO =====
const ATIVIDADES_MANUTENCAO = [
    "Abastecimento de odorante",
    "Acompanhar obras",
    "ADM",
    "Apoio equipe Comgás",
    "Apoio equipe interna",
    "Apoio equipe terceira",
    "AVG CRM / ECP / válvula / etc",
    "AVG de City Gate",
    "AVG irregularidades",
    "AVG LKG",
    "AVG pressão",
    "AVG pressão interna",
    "AVG reclamação",
    "Bloquear ECP / VGB / CRM",
    "Check list de start",
    "Comissionamento",
    "Comunicado sala de controle",
    "Controle de estoque",
    "Desligar gás",
    "Entrega / retirada de equipamentos e materiais",
    "Entrega / retirada de viatura",
    "Fechar / abrir",
    "Inspeção de VB",
    "Instalar lacre",
    "Instalar TAG",
    "Instalar venteo",
    "Integração",
    "Lavagem VB / CRM / ECP / etc",
    "Limpeza e organização de viatura",
    "Manobrar tramos City Gate",
    "Manobrar tramos ECP / CRM / CM / etc",
    "Manobrar válvula",
    "Manutenção de tampa ECP",
    "Manutenção em bancada",
    "Manutenção nível A",
    "Manutenção nível B",
    "Manutenção nível C",
    "Manutenção de válvula",
    "Monitorar pressão",
    "Passagem de PIG",
    "Projeto 4.0",
    "Recomissionamento de rede",
    "Relatório fotográfico",
    "Relatório técnico / check list",
    "Religar gás",
    "Remanejamento de rede",
    "Renovação de CRM / ECP / etc",
    "Retirada CRM / CM / CR / etc",
    "Retirar água da caixa",
    "RVC",
    "Start CRM / ECP / etc",
    "Teste de CRC",
    "Treinamento",
    "Troca de componente",
    "Troca de conexão",
    "Troca de datalogger",
    "Troca de equipamento",
    "Troca de kit",
    "Troca de medidor",
    "Outro"
];

class TaskManager {
    constructor() {
        console.log('🔧 Inicializando TaskManager...');
        this.tasks = [];
        this.currentFilter = 'all';
        this.selectedAddress = null;
        this.editingTaskId = null;
        this.isDarkMode = false;
        this.deferredPrompt = null;
        this.editingRdoId = null;
        this.profile = {
            name: 'Usuário',
            email: 'usuario@email.com',
            avatar: '👤',
            nomeEmpresa: '',
            logotipo: '',
            equipe: '',
            escala: '',
            tecnico1: '',
            registro1: '',
            tecnico2: '',
            registro2: '',
            prefixo: '',
            tipoVeiculo: '',
            jornadaInicio: '08:00',
            jornadaFim: '17:00',
            jornadaDuracao: '09:00'
        };
        this.historicoAtividades = this.carregarHistorico();
        this.loadTasks();
        this.loadProfile();
        this.initializeDOM();
        this.loadTheme();
        this.bindEvents();
        this.render();
        this.updateUI();
        this.setupPWA();
        this.setupConnectionListeners();
        console.log(`✅ App inicializado com ${this.tasks.length} atividades!`);
    }

    // =============================================
    // MÉTODOS DE HISTÓRICO DE ATIVIDADES
    // =============================================
    carregarHistorico() {
        try {
            const data = localStorage.getItem('historicoAtividades');
            return data ? JSON.parse(data) : [];
        } catch { return []; }
    }

    salvarHistorico(historico) {
        localStorage.setItem('historicoAtividades', JSON.stringify(historico));
    }

    atualizarHistorico(atividade) {
        if (!atividade || typeof atividade !== 'string') return;
        let hist = this.carregarHistorico();
        hist = hist.filter(item => item !== atividade);
        hist.unshift(atividade);
        if (hist.length > 5) hist = hist.slice(0, 5);
        this.salvarHistorico(hist);
        this.historicoAtividades = hist;
    }

    // =============================================
    // MÉTODOS DE CARREGAMENTO (COM VALIDAÇÃO JSON)
    // =============================================
    loadTasks() {
        try {
            const saved = localStorage.getItem('tasks');
            this.tasks = [];
            if (saved) {
                try {
                    this.tasks = JSON.parse(saved);
                    if (!Array.isArray(this.tasks)) {
                        console.warn('⚠️ tasks não é um array, reiniciando.');
                        this.tasks = [];
                    }
                } catch (e) {
                    console.error('❌ JSON inválido em tasks:', e);
                    this.tasks = [];
                }
            }
            console.log(`📋 ${this.tasks.length} atividades carregadas`);
        } catch (e) {
            console.error('❌ Erro ao carregar atividades:', e);
            this.tasks = [];
        }
    }

    saveTasks() {
        try {
            localStorage.setItem('tasks', JSON.stringify(this.tasks));
            this.updateUI();
        } catch (e) {
            console.error('❌ Erro ao salvar atividades:', e);
        }
    }

    loadProfile() {
        try {
            const saved = localStorage.getItem('profile');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    this.profile = { ...this.profile, ...parsed };
                    console.log('👤 Perfil carregado:', this.profile.name);
                } catch (e) {
                    console.error('❌ JSON inválido no profile:', e);
                }
            }
        } catch (e) {
            console.error('❌ Erro ao carregar perfil:', e);
        }
    }

    saveProfile() {
        const profile = {
            name: this.modalName.value.trim(),
            email: this.modalEmail.value.trim(),
            avatar: this.modalAvatar.textContent || '👤',
            nomeEmpresa: document.getElementById('profileNomeEmpresa').value.trim(),
            logotipo: document.getElementById('profileLogotipoImg').src || '',
            equipe: document.getElementById('profileEquipe').value.trim(),
            escala: document.getElementById('profileEscala').value.trim(),
            tecnico1: document.getElementById('profileTecnico1').value.trim(),
            registro1: document.getElementById('profileRegistro1').value.trim(),
            tecnico2: document.getElementById('profileTecnico2').value.trim(),
            registro2: document.getElementById('profileRegistro2').value.trim(),
            prefixo: document.getElementById('profilePrefixo').value.trim(),
            tipoVeiculo: document.getElementById('profileTipoVeiculo').value.trim(),
            jornadaInicio: document.getElementById('profileJornadaInicio').value,
            jornadaFim: document.getElementById('profileJornadaFim').value,
            jornadaDuracao: document.getElementById('profileJornadaDuracao').value
        };
        this.profile = profile;
        localStorage.setItem('profile', JSON.stringify(profile));
        this.updateProfileUI();
        showToast('✅ Perfil atualizado!');
    }

    // =============================================
    // MÉTODOS DE TEMA
    // =============================================
    loadTheme() {
        try {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'light') {
                this.isDarkMode = false;
                this.applyLightMode();
            } else if (savedTheme === 'dark') {
                this.isDarkMode = true;
                this.applyDarkMode();
            } else {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
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
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
        if (this.darkModeIcon) this.darkModeIcon.textContent = '☀️';
        if (this.darkModeLabel) this.darkModeLabel.textContent = 'Modo Claro';
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.content = '#0F172A';
        this.isDarkMode = true;
        localStorage.setItem('theme', 'dark');
    }

    applyLightMode() {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        if (this.darkModeIcon) this.darkModeIcon.textContent = '🌙';
        if (this.darkModeLabel) this.darkModeLabel.textContent = 'Modo Escuro';
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.content = '#F1F5F9';
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
        console.log('🔧 Inicializando DOM...');

        // Perfil
        this.profileEquipe = document.getElementById('profileEquipe');
        this.profileEscala = document.getElementById('profileEscala');
        this.profileTecnico1 = document.getElementById('profileTecnico1');
        this.profileRegistro1 = document.getElementById('profileRegistro1');
        this.profileTecnico2 = document.getElementById('profileTecnico2');
        this.profileRegistro2 = document.getElementById('profileRegistro2');
        this.profilePrefixo = document.getElementById('profilePrefixo');
        this.profileTipoVeiculo = document.getElementById('profileTipoVeiculo');
        this.profileJornadaInicio = document.getElementById('profileJornadaInicio');
        this.profileJornadaFim = document.getElementById('profileJornadaFim');
        this.profileJornadaDuracao = document.getElementById('profileJornadaDuracao');
        this.profileNomeEmpresa = document.getElementById('profileNomeEmpresa');
        this.profileLogotipo = document.getElementById('profileLogotipo');
        this.profileLogotipoPreview = document.getElementById('profileLogotipoPreview');
        this.profileLogotipoImg = document.getElementById('profileLogotipoImg');
        this.profileLogotipoRemover = document.getElementById('profileLogotipoRemover');

        // Principais
        this.taskList = document.getElementById('taskList');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.sidebar = document.getElementById('sidebar');
        this.sidebarOverlay = document.getElementById('sidebarOverlay');
        this.menuToggle = document.getElementById('menuToggle');
        this.profileName = document.getElementById('profileName');
        this.profileEmail = document.getElementById('profileEmail');
        this.profileAvatar = document.getElementById('profileAvatar');
        this.taskCount = document.getElementById('taskCount');

        // Modal de atividade
        this.taskModal = document.getElementById('taskModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.taskForm = document.getElementById('taskForm');
        this.taskInput = document.getElementById('taskInput');
        this.taskOrder = document.getElementById('taskOrder');
        this.taskObs = document.getElementById('taskObs');
        this.taskDate = document.getElementById('taskDate');
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

        // Perfil modal
        this.profileModal = document.getElementById('profileModal');
        this.modalProfileClose = document.getElementById('modalProfileClose');
        this.profileForm = document.getElementById('profileForm');
        this.modalName = document.getElementById('modalName');
        this.modalEmail = document.getElementById('modalEmail');
        this.modalAvatar = document.getElementById('modalAvatar');

        // Botões de dados
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

        // Header
        this.headerWhatsApp = document.getElementById('headerWhatsApp');
        this.headerEmail = document.getElementById('headerEmail');
        this.headerMap = document.getElementById('headerMap');
        this.headerRDO = document.getElementById('headerRDO');

        // Status
        this.statusDot = document.getElementById('statusDot');
        this.statusText = document.getElementById('statusText');
        this.connectionStatus = document.getElementById('connectionStatus');
        this.connectionText = document.getElementById('connectionText');

        // Contadores
        this.countAll = document.getElementById('countAll');
        this.countPending = document.getElementById('countPending');
        this.countCompleted = document.getElementById('countCompleted');

        // Mapa
        this.mapContainer = document.getElementById('mapContainer');

        // Atividade
        this.activityTypeBtns = document.querySelectorAll('.activity-type-btn');
        this.manutencaoFields = document.getElementById('manutencaoFields');
        this.comissionamentoFields = document.getElementById('comissionamentoFields');
        this.rdoAtividadeSearch = document.getElementById('rdoAtividadeSearch');
        this.rdoAtividadeContainer = document.getElementById('rdoAtividadeContainer');
        this.rdoAtividadeEmpty = document.getElementById('rdoAtividadeEmpty');
        this.rdoAtividadeOutro = document.getElementById('rdoAtividadeOutro');
        this.rdoAtividadeDisplay = document.getElementById('rdoAtividadeDisplay');
        this.rdoAtividadeHidden = document.getElementById('rdoAtividadeHidden');
        this.rdoAtividadeComiss = document.getElementById('rdoAtividadeComiss');
        this.rdoOrdem = document.getElementById('rdoOrdem');
        this.rdoDataAtividade = document.getElementById('rdoDataAtividade');
        this.rdoObs = document.getElementById('rdoObs');
        this.rdoProjeto = document.getElementById('rdoProjeto');
        this.rdoPep = document.getElementById('rdoPep');
        this.rdoTu = document.getElementById('rdoTu');
        this.rdoPocc = document.getElementById('rdoPocc');

        // RDO Generator
        this.rdoDisplayEquipe = document.getElementById('rdoDisplayEquipe');
        this.rdoDisplayVeiculo = document.getElementById('rdoDisplayVeiculo');
        this.rdoDisplayUsuario1 = document.getElementById('rdoDisplayUsuario1');
        this.rdoDisplayUsuario2 = document.getElementById('rdoDisplayUsuario2');
        this.rdoDesviosContainer = document.getElementById('rdoDesviosContainer');
        this.rdoObservacao = document.getElementById('rdoObservacao');
        this.rdoGeneratorModal = document.getElementById('rdoGeneratorModal');
        this.rdoGeneratorClose = document.getElementById('rdoGeneratorClose');
        this.rdoGeneratorForm = document.getElementById('rdoGeneratorForm');
        this.rdoAddDesvioBtn = document.getElementById('rdoAddDesvioBtn');
        this.rdoTaskList = document.getElementById('rdoTaskList');
        this.rdoGeneratorSubmit = document.getElementById('rdoGeneratorSubmit');
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
        if (!this.taskList) {
            console.error('❌ taskList não encontrado!');
            return;
        }
        if (filteredTasks.length === 0) {
            this.renderEmpty();
            return;
        }

        this.taskList.innerHTML = filteredTasks.map((task, index) => {
            const dateStr = task.data ? task.data : (task.createdAt ? task.createdAt.split(',')[0] : '');
            const titulo = task.text ? escapeHtml(task.text) : 'Atividade sem título';
            const priorityClass = task.completed ? '' : `priority-${task.priority || 'planned'}`;
            const ordemDisplayValue = task.ordem ? task.ordem : task.id;

            let obsHtml = '';
            if (task.obs && task.obs.trim()) {
                obsHtml = `
                    <div class="task-obs" data-expanded="false">
                        <button type="button" class="obs-toggle" aria-label="Expandir observação" aria-expanded="false">▼</button>
                        <span class="obs-label">obs:</span>
                        <span class="obs-content">${escapeHtml(task.obs)}</span>
                    </div>
                `;
            }

            let addressHtml = '';
            if (task.endereco) {
                addressHtml = this.renderAddress(task.endereco);
            }

            return `
                <li class="task-item ${task.completed ? 'completed' : ''} ${priorityClass}" 
                    data-id="${task.id}" data-index="${index}">
                    <div class="task-main">
                        <span class="drag-handle">⠿</span>
                        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                        <span class="task-title">
                            ${!task.completed ? `<span class="task-priority-badge ${task.priority || 'planned'}"></span>` : ''}
                            ${titulo}
                        </span>
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

            'pending': { icon: '🎉', text: 'Todas as atividades foram concluídas!', sub: 'Parabéns! Você está em dia' },
            'completed': { icon: '📌', text: 'Nenhuma atividade concluída', sub: 'Marque as atividades como concluídas' },
            'all': { icon: '📝', text: 'Nenhuma atividade cadastrada', sub: 'Toque no botão ✚ para adicionar' }
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
        if (endereco.logradouro) parts.push(endereco.logradouro);
        if (endereco.bairro) parts.push(endereco.bairro);
        if (endereco.cidade) parts.push(endereco.cidade);
        if (endereco.uf) parts.push(endereco.uf);
        return parts.join(' - ');
    }

    formatCoordinates(lat, lon) {
        if (lat === undefined || lon === undefined || lat === null || lon === null) return '';
        const latNum = parseFloat(lat);
        const lonNum = parseFloat(lon);
        if (isNaN(latNum) || isNaN(lonNum)) return '';
        return `${latNum.toFixed(6)}, ${lonNum.toFixed(6)}`;
    }

    copyToClipboard(text) {
        if (!text) return;
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
        const lat = endereco.lat ?? '';
        const lon = endereco.lon ?? '';
        const coords = this.formatCoordinates(lat, lon);
        const query = encodeURIComponent(coords || enderecoStr);
        const hasCoords = Boolean(coords);

        const googleMapsUrl = hasCoords
            ? `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`
            : `https://www.google.com/maps/search/?api=1&query=${query}`;

        const wazeUrl = hasCoords
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
        if (hasCoords) {
            html += `<button type="button" class="address-link share-location" data-coords="${coords}" title="Copiar coordenadas" aria-label="Copiar coordenadas">`;
            html += `<img src="img/share_location.svg" alt="Copiar localização" class="icon-svg">`;
            html += `</button>`;
        }
        html += `</div></div>`;

        return `<div class="task-address">${html}</div>`;
    }

    // =============================================
    // MÉTODOS DE BUSCA DE ENDEREÇO (com tratamento de erro)
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

                this.modalSearchBtn.textContent = '⏳ Buscando endereço...';
                this.modalSearchBtn.disabled = true;

                try {
                    const reverseUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&accept-language=pt-BR`;
                    const response = await fetch(reverseUrl, {
                        headers: { 'User-Agent': 'TaskApp/1.0' }
                    });

                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                    const data = await response.json();

                    if (data && data.address) {
                        const addr = data.address;
                        const logradouro = addr.road || addr.pedestrian || addr.footway || addr.path || '';
                        const houseNumber = addr.house_number || '';
                        const logradouroCompleto = logradouro + (houseNumber ? `, ${houseNumber}` : '');

                        const address = {
                            display_name: data.display_name || `Coordenadas: ${lat}, ${lon}`,
                            lat: lat,
                            lon: lon,
                            cep: addr.postcode || '',
                            logradouro: logradouroCompleto || `Coordenadas: ${lat}, ${lon}`,
                            numero: houseNumber,
                            bairro: addr.suburb || addr.neighbourhood || addr.district || '',
                            cidade: addr.city || addr.town || addr.village || addr.municipality || '',
                            uf: addr.state || addr.region || '',
                            pais: addr.country || 'Brasil'
                        };

                        this.selectAddressModal(address);
                        showToast(`✅ Endereço encontrado: ${logradouroCompleto || 'Localização'}`);
                    } else {
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
                        showToast('📍 Coordenada adicionada (endereço não encontrado)');
                    }
                } catch (error) {
                    console.warn('⚠️ Erro no reverse geocoding:', error);
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
                    showToast('📍 Coordenada adicionada (sem endereço)');
                } finally {
                    this.modalSearchBtn.textContent = '🔍 Buscar';
                    this.modalSearchBtn.disabled = false;
                    this.modalSuggestions.classList.remove('active');
                }
                return;
            }
        }

        this.modalSearchBtn.textContent = '⏳ Buscando...';
        this.modalSearchBtn.disabled = true;

        try {
            let url = 'https://nominatim.openstreetmap.org/search?format=json&limit=10&addressdetails=1&accept-language=pt-BR';
            url += `&q=${encodeURIComponent(query)}`;
            url += '&viewbox=-47.5,-22.5,-45.5,-24.5&bounded=1';

            const response = await fetch(url, {
                headers: { 'User-Agent': 'TaskApp/1.0' }
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();

            if (data.length === 0) {
                const fallbackUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&countrycodes=br&addressdetails=1&accept-language=pt-BR`;
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
                <div class="modal-suggestion-item" style="color: var(--text-muted); cursor: default; text-align: center; padding: 8px;">
                    Nenhum endereço encontrado
                </div>
            `;
            this.modalSuggestions.classList.add('active');
            return;
        }

        // Remove duplicatas (mesma rua + número + bairro + cidade)
        const uniqueResults = [];
        const seen = new Set();
        data.forEach(item => {
            const road = item.address?.road || '';
            const houseNumber = item.address?.house_number || '';
            const suburb = item.address?.suburb || item.address?.neighbourhood || '';
            const city = item.address?.city || item.address?.town || item.address?.village || '';
            const key = `${road}|${houseNumber}|${suburb}|${city}`.toLowerCase().trim();
            if (!seen.has(key)) {
                seen.add(key);
                uniqueResults.push(item);
            }
        });

        // Limita a 6 resultados para não sobrecarregar
        const topResults = uniqueResults.slice(0, 6);

        if (topResults.length === 0) {
            this.modalSuggestions.innerHTML = `
                <div class="modal-suggestion-item" style="color: var(--text-muted); cursor: default; text-align: center; padding: 8px;">
                    Nenhum endereço único encontrado
                </div>
            `;
            this.modalSuggestions.classList.add('active');
            return;
        }

        // Renderiza cada sugestão com apenas rua, bairro, município (e UF)
        this.modalSuggestions.innerHTML = topResults.map(item => {
            const road = item.address?.road || '';
            const houseNumber = item.address?.house_number || '';
            const suburb = item.address?.suburb || item.address?.neighbourhood || '';
            const city = item.address?.city || item.address?.town || item.address?.village || '';
            const state = item.address?.state || '';

            // Monta a linha principal: Rua, Número - Bairro, Cidade - UF
            let addressLine = road;
            if (houseNumber) addressLine += `, ${houseNumber}`;
            if (suburb) addressLine += ` - ${suburb}`;
            if (city) addressLine += `, ${city}`;
            if (state) addressLine += ` - ${state}`;

            // Se ainda estiver muito longo, corta (opcional)
            const shortName = addressLine.length > 60 ? addressLine.substring(0, 60) + '…' : addressLine;

            return `
                <div class="modal-suggestion-item" data-address='${JSON.stringify(item)}'>
                    <span class="suggestion-icon">📍</span>
                    <span class="suggestion-text">${shortName}</span>
                </div>
            `;
        }).join('');

        // Ativa o container e define altura com scroll
        this.modalSuggestions.classList.add('active');
        // Altura fixa com scroll (ajuste conforme necessário)
        this.modalSuggestions.style.maxHeight = '180px';
        this.modalSuggestions.style.overflowY = 'auto';

        // Evento de clique em cada item
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
        let logradouroCompleto = addressData.logradouro || addressData.address?.road || '';
        const houseNumber = addressData.address?.house_number || addressData.numero || '';

        if (houseNumber && logradouroCompleto) {
            logradouroCompleto = `${logradouroCompleto}, ${houseNumber}`;
        } else if (houseNumber && !logradouroCompleto) {
            logradouroCompleto = houseNumber;
        }

        const address = {
            display_name: addressData.display_name || '',
            lat: addressData.lat || '',
            lon: addressData.lon || '',
            cep: addressData.address?.postcode || addressData.cep || '',
            logradouro: logradouroCompleto,
            numero: houseNumber,
            bairro: addressData.address?.suburb || addressData.address?.neighbourhood || addressData.bairro || '',
            cidade: addressData.address?.city || addressData.address?.town || addressData.address?.village || addressData.cidade || '',
            uf: addressData.address?.state || addressData.uf || '',
            pais: addressData.address?.country || addressData.pais || 'Brasil'
        };

        this.selectedAddress = address;
        this.modalSelectedText.innerHTML = `
            <strong>📍 Endereço:</strong><br>
            ${this.formatAddressSimple(address)}
        `;
        this.modalSelectedAddress.classList.add('active');
        this.modalSuggestions.classList.remove('active');
        this.modalAddressSearch.value = address.display_name || address.logradouro;
        showToast('✅ Endereço selecionado!');
    }

    // =============================================
    // MÉTODOS DE ROTA
    // =============================================
    calculateOptimalRoute(waypoints) {
        if (waypoints.length <= 1) return waypoints;

        const unvisited = [...waypoints];
        const route = [];

        const centerLat = waypoints.reduce((sum, w) => sum + w.lat, 0) / waypoints.length;
        const centerLon = waypoints.reduce((sum, w) => sum + w.lon, 0) / waypoints.length;

        let closestIndex = 0;
        let closestDist = Infinity;
        unvisited.forEach((w, i) => {
            const dist = this.calculateDistance(centerLat, centerLon, w.lat, w.lon);
            if (dist < closestDist) {
                closestDist = dist;
                closestIndex = i;
            }
        });

        route.push(unvisited.splice(closestIndex, 1)[0]);

        while (unvisited.length > 0) {
            const last = route[route.length - 1];
            let nearestIndex = 0;
            let nearestDist = Infinity;

            unvisited.forEach((w, i) => {
                const dist = this.calculateDistance(last.lat, last.lon, w.lat, w.lon);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestIndex = i;
                }
            });

            route.push(unvisited.splice(nearestIndex, 1)[0]);
        }

        return route;
    }

    drawStraightRoute(map, optimizedRoute) {
        const routePoints = optimizedRoute.map(w => [w.lat, w.lon]);
        const totalDistance = this.calculateTotalDistance(optimizedRoute);
        const polyline = L.polyline(routePoints, {
            color: '#0052CC',
            weight: 4,
            opacity: 0.7,
            dashArray: '10, 10'
        }).addTo(map);
        polyline.bindPopup(`🔄 Rota (linha reta) • ${totalDistance.toFixed(1)} km total`);
        map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    }

    // =============================================
    // MÉTODOS CRUD
    // =============================================
    getSelectedPriority() {
        const selected = document.querySelector('input[name="taskPriority"]:checked');
        return selected ? selected.value : 'planned';
    }

    getSelectedActivityType() {
        const active = document.querySelector('.activity-type-btn.active');
        return active ? active.dataset.type : 'manutencao';
    }

    // ===== MÉTODOS PARA CHECKBOXES DE ATIVIDADES (COM HISTÓRICO) =====
    renderizarAtividades(filtro = '') {
        const container = this.rdoAtividadeContainer;
        const empty = this.rdoAtividadeEmpty;
        if (!container) return;

        const termo = filtro.toLowerCase().trim();
        let atividades = ATIVIDADES_MANUTENCAO;

        if (termo) {
            atividades = atividades.filter(atv => atv.toLowerCase().includes(termo));
        }

        // Ordenação por histórico
        const historico = this.carregarHistorico();
        const ordenadas = [...atividades].sort((a, b) => {
            const idxA = historico.indexOf(a);
            const idxB = historico.indexOf(b);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return a.localeCompare(b);
        });

        if (ordenadas.length === 0) {
            container.innerHTML = '';
            if (empty) empty.style.display = 'block';
            return;
        }
        if (empty) empty.style.display = 'none';

        const selecionados = this.getAtividadesSelecionadas();

        container.innerHTML = ordenadas.map(atv => {
            const isRecente = historico.slice(0, 5).includes(atv);
            return `
                <label class="checkbox-item" data-value="${atv}" ${isRecente ? 'data-recente="true"' : ''}>
                    <input type="checkbox" class="atividade-checkbox" value="${atv}" 
                        ${selecionados.includes(atv) ? 'checked' : ''}>
                    <span>${atv}</span>
                </label>
            `;
        }).join('');

        container.querySelectorAll('.atividade-checkbox').forEach(cb => {
            cb.addEventListener('change', () => {
                this.atualizarAtividade();
                if (cb.checked) {
                    this.atualizarHistorico(cb.value);
                }
            });
        });
    }

    getAtividadesSelecionadas() {
        const container = this.rdoAtividadeContainer;
        if (!container) return [];
        const checkboxes = container.querySelectorAll('.atividade-checkbox:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    atualizarAtividade() {
        const selecionados = this.getAtividadesSelecionadas();
        const outro = this.rdoAtividadeOutro ? this.rdoAtividadeOutro.value.trim() : '';
        let atividades = [...selecionados];
        if (outro) atividades.push(outro);
        const texto = atividades.join('; ');
        if (this.rdoAtividadeDisplay) this.rdoAtividadeDisplay.value = texto;
        if (this.rdoAtividadeHidden) this.rdoAtividadeHidden.value = texto;
    }

    atualizarCamposPorTipo(tipo) {
        if (tipo === 'comissionamento') {
            if (this.manutencaoFields) this.manutencaoFields.style.display = 'none';
            if (this.comissionamentoFields) this.comissionamentoFields.style.display = 'block';
            if (this.rdoAtividadeOutro) this.rdoAtividadeOutro.disabled = true;
        } else {
            if (this.manutencaoFields) this.manutencaoFields.style.display = 'block';
            if (this.comissionamentoFields) this.comissionamentoFields.style.display = 'none';
            if (this.rdoAtividadeOutro) this.rdoAtividadeOutro.disabled = false;
            this.renderizarAtividades(this.rdoAtividadeSearch?.value || '');
        }
    }

    addTask(text, endereco, ordem, obs, data) {
        const tipo = this.getSelectedActivityType();
        let atividadeTexto = '';
        if (tipo === 'comissionamento') {
            atividadeTexto = 'Comissionamento';
        } else {
            atividadeTexto = this.rdoAtividadeHidden ? this.rdoAtividadeHidden.value.trim() : '';
            if (!atividadeTexto) {
                showToast('⚠️ Selecione ou digite uma atividade!');
                return false;
            }
            const lista = atividadeTexto.split('; ').map(s => s.trim()).filter(s => s);
            lista.forEach(atv => this.atualizarHistorico(atv));
        }

        const priority = this.getSelectedPriority();

        const task = {
            id: Date.now(),
            text: atividadeTexto,
            completed: false,
            createdAt: new Date().toLocaleString('pt-BR'),
            data: data || '',
            endereco: endereco || null,
            ordem: ordem || '',
            obs: obs || '',
            priority: priority,
            tipoAtividade: tipo,
            projeto: this.rdoProjeto?.value || '',
            pep: this.rdoPep?.value || '',
            tu: this.rdoTu?.value || '',
            pocc: this.rdoPocc?.value || '',
            order: this.tasks.length
        };

        this.tasks.push(task);
        this.saveTasks();
        this.render();
        this.closeTaskModal();
        showToast(endereco
            ? `✅ Atividade "${task.text}" com endereço!`
            : `✅ Atividade "${task.text}" adicionada!`
        );
        return true;
    }

    updateTask(id, text, endereco, ordem, obs, data) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) {
            showToast('⚠️ Atividade não encontrada');
            return false;
        }

        const tipo = this.getSelectedActivityType();
        let atividadeTexto = '';
        if (tipo === 'comissionamento') {
            atividadeTexto = 'Comissionamento';
        } else {
            atividadeTexto = this.rdoAtividadeHidden ? this.rdoAtividadeHidden.value.trim() : '';
            if (!atividadeTexto) {
                showToast('⚠️ Selecione ou digite uma atividade!');
                return false;
            }
            const lista = atividadeTexto.split('; ').map(s => s.trim()).filter(s => s);
            lista.forEach(atv => this.atualizarHistorico(atv));
        }

        const priority = this.getSelectedPriority();

        task.text = atividadeTexto;
        task.endereco = endereco || null;
        task.ordem = ordem || '';
        task.obs = obs || '';
        task.data = data || '';
        task.priority = priority;
        task.tipoAtividade = tipo;
        task.projeto = this.rdoProjeto?.value || '';
        task.pep = this.rdoPep?.value || '';
        task.tu = this.rdoTu?.value || '';
        task.pocc = this.rdoPocc?.value || '';

        this.saveTasks();
        this.render();
        this.closeTaskModal();
        showToast(`✅ "${task.text}" atualizada!`);
        return true;
    }

    deleteTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) {
            showToast('⚠️ Atividade não encontrada');
            return;
        }
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        this.render();
        showToast(`🗑️ "${task.text}" removida`);
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
            showToast('📭 Nenhuma atividade para exportar');
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
        a.download = `atividades_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast(`📤 ${this.tasks.length} atividades exportadas!`);
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
                showToast(`📥 ${count} atividades importadas com sucesso!`);
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
            showToast('📭 Nenhuma atividade concluída para arquivar');
            return;
        }
        if (confirm(`📦 Arquivar ${completedTasks.length} atividade(s) concluída(s)?`)) {
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
            showToast(`📦 ${completedTasks.length} atividades arquivadas!`);
            this.closeSidebar();
        }
    }

    resetApp() {
        if (this.tasks.length === 0) {
            showToast('📭 Nenhuma atividade para resetar');
            return;
        }
        if (confirm('🔄 Resetar o app? Todas as atividades serão removidas.')) {
            this.tasks = [];
            this.saveTasks();
            this.profile = { name: 'Usuário', email: 'usuario@email.com', avatar: '👤', equipe: '', escala: '', tecnico1: '', registro1: '', tecnico2: '', registro2: '', prefixo: '', tipoVeiculo: '', jornadaInicio: '08:00', jornadaFim: '17:00', jornadaDuracao: '09:00' };
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
            showToast('📭 Nenhuma atividade para limpar');
            return;
        }
        if (confirm(`⚠️ Excluir ${totalTasks} atividade(s)?`)) {
            this.tasks = [];
            this.saveTasks();
            this.render();
            this.updateUI();
            showToast(`🗑️ ${totalTasks} atividade(s) removida(s)`);
            this.closeSidebar();
        }
    }

    // =============================================
    // MÉTODOS DE MODAL (ABRIR/FECHAR)
    // =============================================
    openTaskModal(taskId = null) {
        console.log('📂 Abrindo modal...', taskId);
        this.editingTaskId = taskId;
        this.clearModalAddress();

        if (taskId !== null) {
            const task = this.tasks.find(t => t.id === taskId);
            if (task) {
                this.modalTitle.textContent = '✏️ Editar Atividade';
                this.modalSubmitBtn.textContent = '💾 Salvar Alterações';

                const tipo = task.tipoAtividade || 'manutencao';
                this.activityTypeBtns.forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.type === tipo);
                });
                this.atualizarCamposPorTipo(tipo);

                this.rdoOrdem.value = task.ordem || '';
                this.rdoDataAtividade.value = task.data || '';
                this.rdoObs.value = task.obs || '';

                if (tipo === 'manutencao') {
                    const atividades = task.text ? task.text.split('; ').map(s => s.trim()) : [];
                    // Atualiza a lista com histórico antes de marcar
                    this.renderizarAtividades(this.rdoAtividadeSearch?.value || '');
                    const checkboxes = this.rdoAtividadeContainer?.querySelectorAll('.atividade-checkbox');
                    if (checkboxes) {
                        checkboxes.forEach(cb => {
                            cb.checked = atividades.includes(cb.value);
                        });
                    }
                    const noCheckbox = atividades.filter(item => !ATIVIDADES_MANUTENCAO.includes(item));
                    if (this.rdoAtividadeOutro) this.rdoAtividadeOutro.value = noCheckbox.join('; ');
                    this.atualizarAtividade();
                } else {
                    if (this.rdoAtividadeComiss) this.rdoAtividadeComiss.value = 'Comissionamento';
                    this.rdoProjeto.value = task.projeto || '';
                    this.rdoPep.value = task.pep || '';
                    this.rdoTu.value = task.tu || '';
                    this.rdoPocc.value = task.pocc || '';
                }

                const radios = document.querySelectorAll('input[name="taskPriority"]');
                radios.forEach(radio => {
                    radio.checked = (radio.value === (task.priority || 'planned'));
                });
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
            this.modalTitle.textContent = '✚ Nova Atividade';
            this.modalSubmitBtn.textContent = '✅ Adicionar Atividade';
            this.activityTypeBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.type === 'manutencao');
            });
            this.atualizarCamposPorTipo('manutencao');

            this.rdoOrdem.value = '';
            this.rdoDataAtividade.value = '';
            this.rdoObs.value = '';
            if (this.rdoAtividadeOutro) this.rdoAtividadeOutro.value = '';
            if (this.rdoAtividadeDisplay) this.rdoAtividadeDisplay.value = '';
            if (this.rdoAtividadeHidden) this.rdoAtividadeHidden.value = '';
            if (this.rdoAtividadeComiss) this.rdoAtividadeComiss.value = 'Comissionamento';
            this.rdoProjeto.value = '';
            this.rdoPep.value = '';
            this.rdoTu.value = '';
            this.rdoPocc.value = '';

            const radios = document.querySelectorAll('input[name="taskPriority"]');
            radios.forEach(radio => {
                radio.checked = (radio.value === 'planned');
            });
            this.editTaskId.value = '';
            this.selectedAddress = null;
            // Renderiza a lista com histórico
            this.renderizarAtividades('');
        }

        this.taskModal.classList.add('active');
        setTimeout(() => {
            if (this.rdoAtividadeSearch) this.rdoAtividadeSearch.focus();
        }, 400);
        this.closeSidebar();
    }

    closeTaskModal() {
        this.taskModal.classList.remove('active');
        this.clearModalAddress();
        this.modalSuggestions.classList.remove('active');
        this.editingTaskId = null;
        if (this.rdoAtividadeSearch) this.rdoAtividadeSearch.value = '';
        this.renderizarAtividades();
    }

    openProfileModal() {
        this.modalName.value = this.profile.name || '';
        this.modalEmail.value = this.profile.email || '';
        this.modalAvatar.textContent = this.profile.avatar || '👤';
        document.getElementById('profileEquipe').value = this.profile.equipe || '';
        document.getElementById('profileEscala').value = this.profile.escala || '';
        document.getElementById('profileTecnico1').value = this.profile.tecnico1 || '';
        document.getElementById('profileRegistro1').value = this.profile.registro1 || '';
        document.getElementById('profileTecnico2').value = this.profile.tecnico2 || '';
        document.getElementById('profileRegistro2').value = this.profile.registro2 || '';
        document.getElementById('profilePrefixo').value = this.profile.prefixo || '';
        document.getElementById('profileTipoVeiculo').value = this.profile.tipoVeiculo || '';
        document.getElementById('profileNomeEmpresa').value = this.profile.nomeEmpresa || '';
        document.getElementById('profileJornadaInicio').value = this.profile.jornadaInicio || '08:00';
        document.getElementById('profileJornadaFim').value = this.profile.jornadaFim || '17:00';
        const logotipo = this.profile.logotipo || '';
        if (logotipo) {
            document.getElementById('profileLogotipoImg').src = logotipo;
            document.getElementById('profileLogotipoPreview').style.display = 'block';
            document.getElementById('profileLogotipoRemover').style.display = 'inline';
        } else {
            document.getElementById('profileLogotipoPreview').style.display = 'none';
            document.getElementById('profileLogotipoRemover').style.display = 'none';
        }
        this.calcularDuracaoJornada();
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
    setupDragAndDrop() { }

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

        document.querySelectorAll('.share-location').forEach(btn => {
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
                    toggle.setAttribute('aria-label', 'Expandir observação');
                    toggle.setAttribute('aria-expanded', 'false');
                } else {
                    this.classList.add('expanded');
                    this.dataset.expanded = 'true';
                    toggle.textContent = '▲';
                    toggle.setAttribute('aria-label', 'Recolher observação');
                    toggle.setAttribute('aria-expanded', 'true');
                }
            });
        });
    }

    // =============================================
    // MÉTODOS DE COMPARTILHAMENTO E ESTATÍSTICAS
    // =============================================
    shareWhatsApp() {
        console.log('📤 Executando shareWhatsApp...');
        try {
            if (this.tasks.length === 0) {
                showToast('📭 Nenhuma atividade para compartilhar');
                console.log('📭 Nenhuma atividade');
                return;
            }

            const total = this.tasks.length;
            const completed = this.tasks.filter(t => t.completed).length;
            const pending = total - completed;

            let message = '📋 *Minhas Atividades*\n';
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

            const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
            console.log('📤 URL do WhatsApp:', url);

            const newWindow = window.open(url, '_blank');
            if (!newWindow) {
                console.warn('⚠️ Pop-up bloqueado! Redirecionando...');
                window.location.href = url;
            } else {
                showToast('📤 Abrindo WhatsApp...');
            }
        } catch (error) {
            console.error('❌ Erro no shareWhatsApp:', error);
            showToast('⚠️ Erro ao compartilhar no WhatsApp');
        }
    }

    shareEmail() {
        console.log('📤 Executando shareEmail...');
        try {
            if (this.tasks.length === 0) {
                showToast('📭 Nenhuma atividade para compartilhar');
                console.log('📭 Nenhuma atividade');
                return;
            }

            const total = this.tasks.length;
            const completed = this.tasks.filter(t => t.completed).length;
            const pending = total - completed;

            let subject = encodeURIComponent('Minhas Atividades - Relatório');
            let body = '';

            body += '📋 Minhas Atividades\n';
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
            console.log('📧 URL do Email:', mailtoUrl);

            const newWindow = window.open(mailtoUrl, '_blank');
            if (!newWindow) {
                console.warn('⚠️ Pop-up bloqueado! Redirecionando...');
                window.location.href = mailtoUrl;
            } else {
                showToast('📧 Abrindo cliente de email...');
            }
        } catch (error) {
            console.error('❌ Erro no shareEmail:', error);
            showToast('⚠️ Erro ao compartilhar por email');
        }
    }

    showStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;
        const withAddress = this.tasks.filter(t => t.endereco).length;
        showToast(`📊 Total: ${total} | ✅ Concluídas: ${completed} | ⏳ Pendentes: ${pending} | 📍 Com endereço: ${withAddress}`);
        this.closeSidebar();
    }

    // =============================================
    // MÉTODOS DE MAPA E ROTA
    // =============================================
    async showMap() {
        console.log('🗺️ Executando showMap...');
        try {
            const tasksWithAddress = this.tasks.filter(t => {
                const lat = parseFloat(t.endereco?.lat);
                const lon = parseFloat(t.endereco?.lon);
                return Number.isFinite(lat) && Number.isFinite(lon);
            });
            console.log(`📍 ${tasksWithAddress.length} tarefas com endereço`);

            if (tasksWithAddress.length === 0) {
                showToast('📍 Nenhuma atividade com endereço para mostrar no mapa');
                console.log('📍 Nenhuma atividade com endereço');
                return;
            }

            const container = this.mapContainer;
            if (!container) {
                console.error('❌ Map container not found');
                showToast('⚠️ Container do mapa não encontrado');
                return;
            }

            if (!window.L) {
                showToast('⚠️ Não foi possível carregar o mapa. Verifique sua conexão.');
                return;
            }

            if (window.map) {
                window.map.remove();
                window.map = null;
            }

            container.innerHTML = '';
            container.style.display = 'block';
            container.setAttribute('aria-hidden', 'false');

            let overlay = document.getElementById('mapOverlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'mapOverlay';
                overlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 9998;
                    background: rgba(0,0,0,0.5);
                    display: none;
                `;
                document.body.appendChild(overlay);
            }
            overlay.style.display = 'block';

            const headerMap = document.createElement('div');
            headerMap.style.cssText = `
                position: absolute;
                top: 12px;
                left: 12px;
                right: 12px;
                width: auto;
                z-index: 10000;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                padding: 10px 16px;
                border-radius: 12px;
                box-shadow: 0 4px 16px rgba(0,0,0,0.3);
                font-weight: 600;
                font-size: 13px;
                color: #fff;
                pointer-events: none;
                text-align: center;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;
                flex-wrap: wrap;
                border: 1px solid rgba(255,255,255,0.15);
            `;
            headerMap.innerHTML = `<span>📍 ${tasksWithAddress.length} ${tasksWithAddress.length === 1 ? 'ponto' : 'pontos'}</span>`;
            container.appendChild(headerMap);

            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '✕';
            closeBtn.style.cssText = `
                position: absolute;
                top: 16px;
                right: 16px;
                z-index: 10001;
                background: rgba(0,0,0,0.5);
                backdrop-filter: blur(4px);
                -webkit-backdrop-filter: blur(4px);
                border: none;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                font-size: 20px;
                cursor: pointer;
                color: #fff;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                transition: background 0.2s;
            `;
            closeBtn.onmouseover = () => { closeBtn.style.background = 'rgba(255,255,255,0.2)'; };
            closeBtn.onmouseout = () => { closeBtn.style.background = 'rgba(0,0,0,0.5)'; };
            closeBtn.onclick = () => {
                container.style.display = 'none';
                container.setAttribute('aria-hidden', 'true');
                overlay.style.display = 'none';
                if (window.map) {
                    window.map.remove();
                    window.map = null;
                }
            };
            container.appendChild(closeBtn);

            const centerLat = tasksWithAddress.reduce((sum, t) => sum + parseFloat(t.endereco.lat), 0) / tasksWithAddress.length;
            const centerLon = tasksWithAddress.reduce((sum, t) => sum + parseFloat(t.endereco.lon), 0) / tasksWithAddress.length;

            const map = L.map(container, {
                zoomControl: false,
                attributionControl: false,
                center: [centerLat, centerLon],
                zoom: 12
            });
            window.map = map;

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap'
            }).addTo(map);

            requestAnimationFrame(() => map.invalidateSize());

            L.control.zoom({ position: 'bottomright' }).addTo(map);

            const statusColors = {
                'completed': '#00C853',
                'planned': '#0052CC',
                'attention': '#F9A825',
                'critical': '#D32F2F'
            };

            const getTaskStatus = (task) => {
                if (task.completed) return 'completed';
                return task.priority || 'planned';
            };

            const markers = [];
            const waypoints = [];

            tasksWithAddress.forEach((task, index) => {
                const lat = parseFloat(task.endereco.lat);
                const lon = parseFloat(task.endereco.lon);
                const status = getTaskStatus(task);
                const color = statusColors[status] || statusColors.planned;

                const icon = L.divIcon({
                    className: 'custom-marker',
                    html: `
                        <div style="
                            background: ${color};
                            color: white;
                            border-radius: 50%;
                            width: 32px;
                            height: 32px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 14px;
                            font-weight: bold;
                            border: 2px solid white;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                        ">
                            ${index + 1}
                        </div>
                    `,
                    iconSize: [32, 32],
                    iconAnchor: [16, 16],
                    popupAnchor: [0, -20]
                });

                const marker = L.marker([lat, lon], { icon }).addTo(map);
                markers.push(marker);

                const statusLabel = {
                    'completed': '✅ Concluída',
                    'planned': '📌 Planejada',
                    'attention': '⚠️ Atenção',
                    'critical': '🚨 Crítica'
                }[status] || '📌 Planejada';

                const popupContent = `
                    <div style="max-width: 250px; padding: 4px;">
                        <strong>${index + 1}. ${escapeHtml(task.text)}</strong><br>
                        ${task.ordem ? `<small>Ordem: ${escapeHtml(task.ordem)}</small><br>` : ''}
                        ${task.data ? `<small>📅 Data: ${escapeHtml(task.data)}</small><br>` : ''}
                        <small>${escapeHtml(task.endereco.logradouro || task.endereco.display_name || '')}</small><br>
                        ${task.obs ? `<small>📝 ${escapeHtml(task.obs)}</small><br>` : ''}
                        <span style="
                            display: inline-block;
                            padding: 2px 8px;
                            border-radius: 12px;
                            font-size: 11px;
                            margin-top: 4px;
                            background: ${status === 'completed' ? '#E8F5E9' : status === 'critical' ? '#FDECEA' : status === 'attention' ? '#FFF8E1' : '#E6F0FF'};
                            color: ${color};
                            border: 1px solid ${color};
                        ">
                            ${statusLabel}
                        </span>
                    </div>
                `;
                marker.bindPopup(popupContent, { maxWidth: 280 });

                waypoints.push({
                    lat: lat,
                    lon: lon,
                    task: task,
                    index: index
                });
            });

            if (markers.length > 0) {
                const group = L.featureGroup(markers);
                map.fitBounds(group.getBounds(), { padding: [50, 50] });
            }

            if (waypoints.length > 1) {
                const optimizedRoute = this.calculateOptimalRoute(waypoints);
                const coordinates = optimizedRoute.map(w => `${w.lon},${w.lat}`).join(';');

                const loadingMsg = document.createElement('div');
                loadingMsg.style.cssText = `
                    position: absolute;
                    bottom: 120px;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 10000;
                    background: rgba(0,0,0,0.7);
                    color: white;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 14px;
                    pointer-events: none;
                `;
                loadingMsg.textContent = '⏳ Calculando rota...';
                container.appendChild(loadingMsg);

                try {
                    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;
                    const response = await fetch(osrmUrl);
                    const data = await response.json();

                    if (loadingMsg.parentNode) loadingMsg.remove();

                    if (data.code === 'Ok' && data.routes.length > 0) {
                        const routeCoords = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
                        const totalDistance = data.routes[0].distance / 1000;
                        const totalDuration = Math.round(data.routes[0].duration / 60);

                        const polyline = L.polyline(routeCoords, {
                            color: '#0052CC',
                            weight: 5,
                            opacity: 0.8,
                            smoothFactor: 1
                        }).addTo(map);

                        headerMap.innerHTML = `
                            <span>📍 ${tasksWithAddress.length} pontos</span>
                            <span>🚗 ${totalDistance.toFixed(1)} km</span>
                            <span>⏱️ ~${totalDuration} min</span>
                        `;

                        map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

                        const first = optimizedRoute[0];
                        L.marker([first.lat, first.lon], {
                            icon: L.divIcon({
                                className: 'start-marker',
                                html: `<div style="
                                    background: #00C853;
                                    color: white;
                                    border-radius: 50%;
                                    width: 24px;
                                    height: 24px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    font-size: 12px;
                                    border: 2px solid white;
                                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                                ">🏁</div>`,
                                iconSize: [24, 24],
                                iconAnchor: [12, 12]
                            })
                        }).addTo(map).bindPopup(`
                            <strong>🏁 Início</strong><br>
                            ${escapeHtml(first.task.text)}
                        `);

                        if (optimizedRoute.length > 1) {
                            const last = optimizedRoute[optimizedRoute.length - 1];
                            L.marker([last.lat, last.lon], {
                                icon: L.divIcon({
                                    className: 'end-marker',
                                    html: `<div style="
                                        background: #D32F2F;
                                        color: white;
                                        border-radius: 50%;
                                        width: 24px;
                                        height: 24px;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        font-size: 12px;
                                        border: 2px solid white;
                                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                                    ">🏁</div>`,
                                    iconSize: [24, 24],
                                    iconAnchor: [12, 12]
                                })
                            }).addTo(map).bindPopup(`
                                <strong>🏁 Fim</strong><br>
                                ${escapeHtml(last.task.text)}
                            `);
                        }

                    } else {
                        this.drawStraightRoute(map, optimizedRoute);
                        const totalDist = this.calculateTotalDistance(optimizedRoute);
                        headerMap.innerHTML = `
                            <span>📍 ${tasksWithAddress.length} pontos</span>
                            <span>🚗 ${totalDist.toFixed(1)} km (reta)</span>
                        `;
                        showToast('⚠️ Rota por ruas indisponível, usando linha reta');
                    }
                } catch (error) {
                    console.warn('⚠️ Erro ao buscar rota OSRM:', error);
                    if (loadingMsg.parentNode) loadingMsg.remove();
                    this.drawStraightRoute(map, optimizedRoute);
                    const totalDist = this.calculateTotalDistance(optimizedRoute);
                    headerMap.innerHTML = `
                        <span>📍 ${tasksWithAddress.length} pontos</span>
                        <span>🚗 ${totalDist.toFixed(1)} km (reta)</span>
                    `;
                    showToast('⚠️ Erro ao calcular rota, usando linha reta');
                }
            } else {
                headerMap.innerHTML = `<span>📍 ${tasksWithAddress.length} ponto</span>`;
                map.setView([waypoints[0].lat, waypoints[0].lon], 14);
            }

            this.closeSidebar();
            showToast(`🗺️ Mostrando ${tasksWithAddress.length} atividades no mapa`);
            console.log('🗺️ Mapa exibido com sucesso!');
        } catch (error) {
            console.error('❌ Erro no showMap:', error);
            showToast('⚠️ Erro ao carregar o mapa');
        }
    }

    calculateTotalDistance(route) {
        let total = 0;
        for (let i = 0; i < route.length - 1; i++) {
            total += this.calculateDistance(
                route[i].lat, route[i].lon,
                route[i + 1].lat, route[i + 1].lon
            );
        }
        return total;
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    toRad(degrees) {
        return degrees * (Math.PI / 180);
    }

    // =============================================
    // MÉTODOS RDO
    // =============================================
    openRDOGenerator() {
        console.log('📂 Abrindo gerador de RDO...');
        const profile = this.profile;

        const equipeField = document.getElementById('rdoDisplayEquipe');
        if (equipeField) {
            const equipe = profile.equipe || 'Não definido';
            const escala = profile.escala ? ` - Escala ${profile.escala}` : '';
            equipeField.value = equipe + escala;
            console.log('✅ Equipe:', equipeField.value);
        }

        const veiculoField = document.getElementById('rdoDisplayVeiculo');
        if (veiculoField) {
            const tipo = profile.tipoVeiculo || '';
            const prefixo = profile.prefixo || '';
            const veiculo = (tipo && prefixo) ? `${tipo} - ${prefixo} (Ativo)` : (tipo || prefixo || 'Não definido');
            veiculoField.value = veiculo;
            console.log('✅ Veículo:', veiculoField.value);
        }

        const usuario1Field = document.getElementById('rdoDisplayUsuario1');
        if (usuario1Field) {
            const nome1 = profile.tecnico1 || profile.name || 'Não definido';
            const reg1 = profile.registro1 ? ` (Registro: ${profile.registro1})` : '';
            usuario1Field.value = nome1 + reg1;
            console.log('✅ Técnico 1:', usuario1Field.value);
        }

        const usuario2Field = document.getElementById('rdoDisplayUsuario2');
        if (usuario2Field) {
            const nome2 = profile.tecnico2 || 'Não definido';
            const reg2 = profile.registro2 ? ` (Registro: ${profile.registro2})` : '';
            usuario2Field.value = nome2 + reg2;
            console.log('✅ Técnico 2:', usuario2Field.value);
        }

        this.loadTasksForRDO();
        this.clearDesvios();
        this.addDesvioRow();

        const obs = document.getElementById('rdoObservacao');
        if (obs) obs.value = '';

        const modal = document.getElementById('rdoGeneratorModal');
        if (modal) modal.classList.add('active');
        console.log('📂 Modal RDO aberto.');
    }

    loadTasksForRDO() {
        const container = this.rdoTaskList;
        if (!container) return;

        if (this.tasks.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted); padding: 12px;">Nenhuma atividade cadastrada.</p>';
            return;
        }

        container.innerHTML = this.tasks.map(task => {
            const date = task.data || (task.createdAt ? String(task.createdAt).split(',')[0] : 'Sem data');
            const order = task.ordem || 'Sem ordem';

            return `
                <label class="rdo-task-item">
                    <input type="checkbox" value="${task.id}" class="rdo-task-checkbox material-checkbox">
                    <span class="rdo-task-content">
                        <span class="rdo-task-title">${escapeHtml(task.text || 'Atividade sem título')}</span>
                        <span class="rdo-task-meta">
                            <span class="rdo-task-chip">Ordem: ${escapeHtml(String(order))}</span>
                            <span class="rdo-task-chip">Data: ${escapeHtml(String(date))}</span>
                        </span>
                    </span>
                </label>
            `;
        }).join('');
    }

    clearDesvios() {
        const container = this.rdoDesviosContainer;
        if (container) container.innerHTML = '';
    }

    addDesvioRow(inicio = '08:00', fim = '12:00', codigo = '00') {
        const container = this.rdoDesviosContainer;
        if (!container) return;

        const row = document.createElement('div');
        row.className = 'rdo-desvio-row';
        row.innerHTML = `
            <div class="rdo-field rdo-desvio-horario">
                <label><span aria-hidden="true">◷</span> Início</label>
                <input type="time" class="rdoDesvioInicio" value="${inicio}">
            </div>
            <div class="rdo-field rdo-desvio-horario">
                <label><span aria-hidden="true">◷</span> Fim</label>
                <input type="time" class="rdoDesvioFim" value="${fim}">
            </div>
            <div class="rdo-field rdo-desvio-codigo">
                <label><span aria-hidden="true">⌘</span> Código</label>
                <select class="rdoDesvioCodigo">
                    ${CODIGOS_DESVIO.map(c => `
                        <option value="${c.codigo}" ${c.codigo === codigo ? 'selected' : ''}>
                            ${c.codigo}
                        </option>
                    `).join('')}
                </select>
            </div>
            <div class="rdo-field rdo-desvio-actions">
                <button type="button" class="rdo-btn-remove-desvio" title="Remover desvio">🗑️</button>
            </div>
        `;
        container.appendChild(row);

        const select = row.querySelector('.rdoDesvioCodigo');
        if (select) {
            select.addEventListener('change', function () {
                const selected = this.value;
                const found = CODIGOS_DESVIO.find(c => c.codigo === selected);
                if (found) {
                    showToast(`📌 ${found.codigo} - ${found.descricao}`);
                } else {
                    showToast('Código não reconhecido');
                }
            });
        }

        row.querySelector('.rdo-btn-remove-desvio').addEventListener('click', () => {
            if (container.children.length > 1) {
                row.remove();
            } else {
                showToast('⚠️ Mantenha pelo menos um desvio.');
            }
        });
    }

    salvarRDO(event) {
        event.preventDefault();

        const checkboxes = document.querySelectorAll('.rdo-task-checkbox:checked');
        const tarefasIds = Array.from(checkboxes).map(cb => parseInt(cb.value));

        const desvioRows = document.querySelectorAll('.rdo-desvio-row');
        const desvios = Array.from(desvioRows).map(row => {
            const inicio = row.querySelector('.rdoDesvioInicio').value;
            const fim = row.querySelector('.rdoDesvioFim').value;
            const codigo = row.querySelector('.rdoDesvioCodigo').value;
            const descricao = CODIGOS_DESVIO.find(c => c.codigo === codigo)?.descricao || codigo;
            return { horaInicio: inicio, horaFim: fim, codigo, descricao };
        });

        const observacao = this.rdoObservacao ? this.rdoObservacao.value.trim() : '';
        const profile = this.profile;

        if (tarefasIds.length === 0) {
            showToast('⚠️ Selecione pelo menos uma atividade.');
            return;
        }
        if (desvios.length === 0) {
            showToast('⚠️ Adicione pelo menos um desvio.');
            return;
        }

        let rdos = JSON.parse(localStorage.getItem('rdos') || '[]');

        if (this.editingRdoId) {
            const index = rdos.findIndex(r => r.id === this.editingRdoId);
            if (index !== -1) {
                rdos[index] = {
                    ...rdos[index],
                    updatedAt: new Date().toISOString(),
                    data: new Date().toISOString().slice(0, 10),
                    equipe: profile.equipe || profile.name || '',
                    veiculo: (profile.tipoVeiculo || '') + ' ' + (profile.prefixo || ''),
                    tecnico1: profile.tecnico1 || profile.name || '',
                    registro1: profile.registro1 || '',
                    tecnico2: profile.tecnico2 || '',
                    registro2: profile.registro2 || '',
                    tarefas: tarefasIds,
                    desvios,
                    observacao,
                };
                showToast('✅ RDO atualizado!');
            } else {
                showToast('⚠️ RDO não encontrado para edição.');
                return;
            }
            this.editingRdoId = null;
        } else {
            const rdo = {
                id: Date.now(),
                createdAt: new Date().toISOString(),
                data: new Date().toISOString().slice(0, 10),
                equipe: profile.equipe || profile.name || '',
                veiculo: (profile.tipoVeiculo || '') + ' ' + (profile.prefixo || ''),
                tecnico1: profile.tecnico1 || profile.name || '',
                registro1: profile.registro1 || '',
                tecnico2: profile.tecnico2 || '',
                registro2: profile.registro2 || '',
                tarefas: tarefasIds,
                desvios,
                observacao,
            };
            rdos.push(rdo);
            showToast('✅ RDO salvo com sucesso!');
        }

        localStorage.setItem('rdos', JSON.stringify(rdos));

        document.querySelectorAll('.rdo-task-checkbox').forEach(cb => cb.checked = false);
        this.clearDesvios();
        this.addDesvioRow();
        if (this.rdoObservacao) this.rdoObservacao.value = '';
        if (this.rdoGeneratorModal) this.rdoGeneratorModal.classList.remove('active');
        const submitBtn = document.getElementById('rdoGeneratorSubmit');
        if (submitBtn) submitBtn.textContent = '💾 Salvar RDO';
    }

    listarRDOs() {
        const rdos = JSON.parse(localStorage.getItem('rdos') || '[]');
        if (rdos.length === 0) {
            showToast('📭 Nenhum RDO encontrado.');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal modal-rdo" style="max-width: 600px;">
                <div class="modal-header">
                    <h2>📂 Meus RDOs</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
                </div>
                <div style="max-height: 400px; overflow-y: auto; padding: 8px 0;">
                    ${rdos.map(r => {
            const dataHora = r.createdAt ? new Date(r.createdAt).toLocaleString('pt-BR') : r.data;
            return `
                            <div style="border-bottom: 1px solid var(--border-color, #eee); padding: 10px 0;">
                                <strong>${dataHora}</strong> - ${r.equipe} - ${(r.tarefas || []).length} atividades
                                <br><small>${r.observacao || 'Sem observação'}</small>
                                <div style="margin-top: 4px; display: flex; gap: 8px; flex-wrap: wrap;">
                                    <button class="rdo-btn secondary btn-editar-rdo" data-id="${r.id}" style="font-size:0.8rem; padding:4px 12px;">✏️ Editar</button>
                                    <button class="rdo-btn secondary btn-pdf-rdo" data-id="${r.id}" style="font-size:0.8rem; padding:4px 12px;">📄 Gerar PDF</button>
                                    <button class="rdo-btn secondary btn-excluir-rdo" data-id="${r.id}" style="font-size:0.8rem; padding:4px 12px; color: var(--danger, red);">🗑️ Excluir</button>
                                </div>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;
            const id = parseInt(target.dataset.id);
            if (isNaN(id)) return;

            if (target.classList.contains('btn-editar-rdo')) {
                this.editarRDO(id);
                modal.remove();
            } else if (target.classList.contains('btn-pdf-rdo')) {
                this.gerarPDFRDO(id);
            } else if (target.classList.contains('btn-excluir-rdo')) {
                this.excluirRDO(id);
                modal.remove();
            }
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    editarRDO(id) {
        const rdo = this.buscarRDO(id);
        if (!rdo) {
            showToast('⚠️ RDO não encontrado.');
            return;
        }

        this.openRDOGenerator();

        setTimeout(() => {
            const checkboxes = document.querySelectorAll('.rdo-task-checkbox');
            checkboxes.forEach(cb => {
                const taskId = parseInt(cb.value);
                cb.checked = rdo.tarefas.includes(taskId);
            });

            this.clearDesvios();
            if (rdo.desvios && rdo.desvios.length > 0) {
                rdo.desvios.forEach(d => {
                    this.addDesvioRow(d.horaInicio, d.horaFim, d.codigo);
                });
            } else {
                this.addDesvioRow();
            }

            const obs = document.getElementById('rdoObservacao');
            if (obs) obs.value = rdo.observacao || '';

            this.editingRdoId = id;

            const submitBtn = document.getElementById('rdoGeneratorSubmit');
            if (submitBtn) submitBtn.textContent = '💾 Atualizar RDO';

            console.log('✅ RDO carregado para edição:', rdo);
            showToast('✏️ Editando RDO...');
        }, 200);
    }

    // =============================================
    // MÉTODOS DE COMPARTILHAMENTO
    // =============================================
    exibirOpcoesCompartilhamento(id) {
        const rdo = this.buscarRDO(id);
        if (!rdo) return;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal modal-rdo" style="max-width: 420px; border-radius: 16px;">
                <div class="modal-header">
                    <h3>📤 Compartilhar RDO</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
                </div>
                <div style="text-align: center; padding: 16px 0;">
                    <p style="margin-bottom: 16px;">Deseja compartilhar este RDO via WhatsApp ou Email?</p>
                    <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                        <button class="rdo-btn secondary" onclick="window.app.compartilharRDOWhatsApp(${id}); this.closest('.modal-overlay').remove();" style="padding: 10px 24px; font-size: 1rem; background: #25D366; color: white; border: none; border-radius: 30px;">
                            📱 WhatsApp
                        </button>
                        <button class="rdo-btn secondary" onclick="window.app.compartilharRDOEmail(${id}); this.closest('.modal-overlay').remove();" style="padding: 10px 24px; font-size: 1rem; background: #0052CC; color: white; border: none; border-radius: 30px;">
                            📧 Email
                        </button>
                        <button class="rdo-btn secondary" onclick="this.closest('.modal-overlay').remove();" style="padding: 10px 24px; font-size: 1rem; background: var(--bg-hover, #ccc); color: var(--text-primary, #000); border: none; border-radius: 30px;">
                            ✖ Fechar
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    compartilharRDOWhatsApp(id) {
        const rdo = this.buscarRDO(id);
        if (!rdo) return;
        const msg = `📋 *RDO - ${rdo.data}*\n` +
            `👥 Equipe: ${rdo.equipe}\n` +
            `🚛 Veículo: ${rdo.veiculo}\n` +
            `📌 Atividades: ${(rdo.tarefas || []).length}\n` +
            `📝 Obs: ${rdo.observacao || 'Sem observação'}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    }

    compartilharRDOEmail(id) {
        const rdo = this.buscarRDO(id);
        if (!rdo) return;
        const subject = `RDO - ${rdo.data}`;
        const body = `RDO - ${rdo.data}\n\n` +
            `Equipe: ${rdo.equipe}\n` +
            `Veículo: ${rdo.veiculo}\n` +
            `Atividades: ${(rdo.tarefas || []).length}\n` +
            `Obs: ${rdo.observacao || 'Sem observação'}`;
        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
    }

    buscarRDO(id) {
        const rdos = JSON.parse(localStorage.getItem('rdos') || '[]');
        const rdo = rdos.find(r => r.id === id);
        if (!rdo) {
            showToast('⚠️ RDO não encontrado.');
            return null;
        }
        return rdo;
    }

    excluirRDO(id) {
        let rdos = JSON.parse(localStorage.getItem('rdos') || '[]');
        rdos = rdos.filter(r => r.id !== id);
        localStorage.setItem('rdos', JSON.stringify(rdos));
        showToast('🗑️ RDO excluído com sucesso.');
    }

    calcularDuracaoJornada() {
        const inicio = document.getElementById('profileJornadaInicio').value;
        const fim = document.getElementById('profileJornadaFim').value;
        const duracao = document.getElementById('profileJornadaDuracao');
        if (inicio && fim) {
            const [hI, mI] = inicio.split(':').map(Number);
            const [hF, mF] = fim.split(':').map(Number);
            let totalMin = (hF * 60 + mF) - (hI * 60 + mI);
            if (totalMin < 0) totalMin += 1440;
            const horas = Math.floor(totalMin / 60);
            const minutos = totalMin % 60;
            duracao.value = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
        }
    }

    // =============================================
    // MÉTODO DE GERAÇÃO DE PDF (com campos de comissionamento)
    // =============================================
    gerarPDFRDO(id) {
        const profile = this.profile || {};
        const nomeEmpresa = profile.nomeEmpresa || 'EMPRESA DE GÁS';
        const logotipo = profile.logotipo || null;

        const rdos = JSON.parse(localStorage.getItem('rdos') || '[]');
        const rdo = rdos.find(r => r.id === id);
        if (!rdo) {
            showToast('⚠️ RDO não encontrado.');
            return;
        }

        // Buscar tarefas com todos os campos (incluindo comissionamento)
        const tarefasCompletas = (rdo.tarefas || []).map(taskId => {
            const task = this.tasks ? this.tasks.find(t => t.id === taskId) : null;
            if (!task) return null;
            return {
                text: task.text || '',
                ordem: task.ordem || '',
                endereco: task.endereco ? this.formatAddressSimple(task.endereco) : null,
                tipoAtividade: task.tipoAtividade || 'manutencao',
                projeto: task.projeto || '',
                pep: task.pep || '',
                tu: task.tu || '',
                pocc: task.pocc || ''
            };
        }).filter(t => t !== null);

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        const marginTop = 15;
        const marginBottom = 15;
        const marginLeft = 15;
        const marginRight = 15;
        const contentWidth = pageWidth - marginLeft - marginRight;

        let y = marginTop;

        const primaryColor = [2, 132, 199];
        const darkNeutral = [15, 23, 42];
        const secondaryText = [100, 116, 139];
        const cardBg = [248, 250, 252];
        const borderBg = [226, 232, 240];
        const fontFamily = 'helvetica';

        const drawCard = (x, y, w, h) => {
            doc.setFillColor(...cardBg);
            doc.setDrawColor(...borderBg);
            doc.setLineWidth(0.3);
            doc.roundedRect(x, y, w, h, 3, 3, 'FD');
        };

        const addSectionHeader = (title, currentY) => {
            doc.setFont(fontFamily, 'bold');
            doc.setFontSize(10);
            doc.setTextColor(...primaryColor);
            doc.text(title.toUpperCase(), marginLeft, currentY);
            doc.setDrawColor(...primaryColor);
            doc.setLineWidth(0.8);
            doc.line(marginLeft, currentY + 2, marginLeft + 25, currentY + 2);
            doc.setDrawColor(...borderBg);
            doc.setLineWidth(0.3);
            doc.line(marginLeft + 25, currentY + 2, pageWidth - marginRight, currentY + 2);
            return currentY + 8;
        };

        // ===== CABEÇALHO =====
        const headerHeight = 28;
        drawCard(marginLeft, y, contentWidth, headerHeight);

        let logoWidth = 22;
        let logoHeight = 22;
        let logoX = marginLeft + 4;
        let logoY = y + (headerHeight - logoHeight) / 2;

        if (logotipo) {
            try {
                doc.addImage(logotipo, 'JPEG', logoX, logoY, logoWidth, logoHeight);
            } catch (e) {
                console.warn('Erro ao adicionar logotipo:', e);
                doc.setFillColor(2, 132, 199);
                doc.roundedRect(logoX, logoY, logoWidth, logoHeight, 2, 2, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(10);
                doc.text('GÁS', logoX + logoWidth / 2, logoY + 13, { align: 'center' });
            }
        } else {
            logoWidth = 0;
        }

        const textStartX = logotipo ? logoX + logoWidth + 6 : marginLeft + 6;

        doc.setFont(fontFamily, 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...darkNeutral);
        doc.text(nomeEmpresa.toUpperCase(), textStartX, y + 11);

        doc.setFont(fontFamily, 'bold');
        doc.setFontSize(13);
        doc.setTextColor(...primaryColor);
        doc.text('RELATÓRIO DIÁRIO DE OPERAÇÕES', textStartX, y + 18);

        const dataVal = rdo.data || new Date().toISOString().slice(0, 10);
        const dataBoxWidth = 36;
        const dataBoxX = pageWidth - marginRight - dataBoxWidth - 4;

        doc.setFillColor(241, 245, 249);
        doc.roundedRect(dataBoxX, y + 5, dataBoxWidth, 18, 2, 2, 'F');

        doc.setFont(fontFamily, 'bold');
        doc.setFontSize(7);
        doc.setTextColor(...secondaryText);
        doc.text('DATA DE EMISSÃO', dataBoxX + dataBoxWidth / 2, y + 10, { align: 'center' });

        doc.setFontSize(9.5);
        doc.setTextColor(...darkNeutral);
        doc.text(dataVal, dataBoxX + dataBoxWidth / 2, y + 17, { align: 'center' });

        y += headerHeight + 10;

        // ===== DADOS DA EQUIPE =====
        y = addSectionHeader('Dados da Equipe & Recursos', y);

        const equipeHeight = 26;
        drawCard(marginLeft, y, contentWidth, equipeHeight);

        const col1X = marginLeft + 6;
        const col2X = marginLeft + (contentWidth / 2) + 4;

        const renderField = (label, val, x, fieldY) => {
            doc.setFont(fontFamily, 'bold');
            doc.setFontSize(7.5);
            doc.setTextColor(...secondaryText);
            doc.text(label.toUpperCase(), x, fieldY);
            doc.setFont(fontFamily, 'normal');
            doc.setFontSize(9.5);
            doc.setTextColor(...darkNeutral);
            doc.text(val || 'Não informado', x, fieldY + 5);
        };

        renderField('Equipe', rdo.equipe, col1X, y + 7);
        renderField('Veículo', rdo.veiculo, col1X, y + 17);

        const tec1 = (rdo.tecnico1 || 'N/A') + (rdo.registro1 ? ` (${rdo.registro1})` : '');
        const tec2 = (rdo.tecnico2 || 'N/A') + (rdo.registro2 ? ` (${rdo.registro2})` : '');

        renderField('Técnico Responsável (1)', tec1, col2X, y + 7);
        renderField('Técnico Auxiliar (2)', tec2, col2X, y + 17);

        y += equipeHeight + 10;

        // ===== ATIVIDADES EXECUTADAS =====
        y = addSectionHeader('Atividades Executadas', y);

        if (tarefasCompletas.length === 0) {
            drawCard(marginLeft, y, contentWidth, 12);
            doc.setFont(fontFamily, 'italic');
            doc.setFontSize(9);
            doc.setTextColor(...secondaryText);
            doc.text('Nenhuma atividade registrada para este período.', marginLeft + 6, y + 7.5);
            y += 18;
        } else {
            tarefasCompletas.forEach((item, index) => {
                const num = (index + 1).toString().padStart(2, '0');
                const hasOrdem = Boolean(item.ordem);
                const hasEndereco = Boolean(item.endereco);

                const itemText = item.text;
                const textWidth = contentWidth - 25;
                const lines = doc.splitTextToSize(itemText, textWidth);
                let itemH = Math.max(14, lines.length * 5 + (hasEndereco ? 8 : 4));

                // CORREÇÃO: verifica espaço para o card + campos de comissionamento
                let extraHeight = 0;
                if (item.tipoAtividade === 'comissionamento') {
                    const campos = [];
                    if (item.projeto) campos.push(`Projeto: ${item.projeto}`);
                    if (item.pep) campos.push(`PEP: ${item.pep}`);
                    if (item.tu) campos.push(`TU: ${item.tu}`);
                    if (item.pocc) campos.push(`POCC/S: ${item.pocc}`);
                    if (campos.length) extraHeight += 6;
                }
                if (hasEndereco) extraHeight += 5;
                itemH += extraHeight;

                if (y + itemH + 10 > pageHeight - marginBottom) {
                    doc.addPage();
                    y = marginTop;
                }

                drawCard(marginLeft, y, contentWidth, itemH);

                doc.setFont(fontFamily, 'bold');
                doc.setFontSize(10);
                doc.setTextColor(...primaryColor);
                doc.text(num, marginLeft + 5, y + 8);

                let currentX = marginLeft + 16;

                if (hasOrdem) {
                    const ordemStr = `OS #${item.ordem}`;
                    doc.setFillColor(224, 242, 254);
                    doc.roundedRect(currentX, y + 3.5, 20, 5.5, 1, 1, 'F');
                    doc.setFontSize(7);
                    doc.setFont(fontFamily, 'bold');
                    doc.setTextColor(3, 105, 161);
                    doc.text(ordemStr, currentX + 10, y + 7.5, { align: 'center' });
                    currentX += 23;
                }

                doc.setFont(fontFamily, 'normal');
                doc.setFontSize(9);
                doc.setTextColor(...darkNeutral);
                lines.forEach((line, lIdx) => {
                    doc.text(line, currentX, y + 7 + (lIdx * 5));
                });

                let endY = y + 7 + (lines.length * 5);

                // Campos de comissionamento
                if (item.tipoAtividade === 'comissionamento') {
                    const campos = [];
                    if (item.projeto) campos.push(`Projeto: ${item.projeto}`);
                    if (item.pep) campos.push(`PEP: ${item.pep}`);
                    if (item.tu) campos.push(`TU: ${item.tu}`);
                    if (item.pocc) campos.push(`POCC/S: ${item.pocc}`);
                    if (campos.length) {
                        const campoStr = campos.join(' | ');
                        doc.setFontSize(7);
                        doc.setTextColor(...secondaryText);
                        doc.text(campoStr, currentX, endY + 4);
                        endY += 6;
                    }
                }

                // CORREÇÃO: endereço sem emoji e com limpeza de espaços
                if (hasEndereco) {
                    const enderecoLimpo = item.endereco.replace(/\s+/g, ' ').trim(); // remove múltiplos espaços
                    doc.setFontSize(7);
                    doc.setTextColor(...secondaryText);
                    doc.text(enderecoLimpo, currentX, endY + 4);
                }

                y += itemH + 3;
            });
            y += 5;
        }

        // ===== OBSERVAÇÕES =====
        if (y + 25 > pageHeight - marginBottom) {
            doc.addPage();
            y = marginTop;
        }

        y = addSectionHeader('Observações de Campo', y);

        const obsText = rdo.observacao || 'Sem observações adicionais.';
        const obsLines = doc.splitTextToSize(obsText, contentWidth - 12);
        const obsHeight = Math.max(14, obsLines.length * 5 + 8);

        drawCard(marginLeft, y, contentWidth, obsHeight);

        doc.setFont(fontFamily, 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...darkNeutral);

        let obsY = y + 7;
        obsLines.forEach(line => {
            doc.text(line, marginLeft + 6, obsY);
            obsY += 5;
        });

        y += obsHeight + 10;

        // ===== DESVIOS =====
        if (y + 30 > pageHeight - marginBottom) {
            doc.addPage();
            y = marginTop;
        }

        y = addSectionHeader('Registro de Desvios & Ocorrências', y);

        if (!rdo.desvios || rdo.desvios.length === 0) {
            drawCard(marginLeft, y, contentWidth, 12);
            doc.setFont(fontFamily, 'italic');
            doc.setFontSize(9);
            doc.setTextColor(...secondaryText);
            doc.text('Nenhum desvio registrado no turno.', marginLeft + 6, y + 7.5);
            y += 18;
        } else {
            // CORREÇÃO: reposicionamento das colunas para melhor espaçamento
            const col1 = marginLeft + 4;
            const col2 = col1 + 14;
            const col3 = col2 + 20;
            const col4 = col3 + 22;
            const col5 = col4 + 28;
            const colWidths = [12, 18, 18, 24, contentWidth - (col5 - marginLeft) - 4];

            // Cabeçalho
            doc.setFillColor(241, 245, 249);
            doc.rect(marginLeft, y, contentWidth, 8, 'F');
            doc.setFont(fontFamily, 'bold');
            doc.setFontSize(7);
            doc.setTextColor(...secondaryText);

            const headers = ['Nº', 'INÍCIO', 'FIM', 'CÓDIGO', 'DESCRIÇÃO DA OCORRÊNCIA'];
            const headerX = [col1, col2, col3, col4, col5];
            headers.forEach((h, i) => {
                doc.text(h, headerX[i], y + 5.5);
            });

            y += 8;

            // Dados
            rdo.desvios.forEach((d, i) => {
                const num = (i + 1).toString().padStart(2, '0');
                const descLines = doc.splitTextToSize(d.descricao || '-', colWidths[4] - 2);
                const rowH = Math.max(10, descLines.length * 4.5 + 6);

                if (y + rowH > pageHeight - marginBottom) {
                    doc.addPage();
                    y = marginTop;
                    // redesenha cabeçalho na nova página
                    doc.setFillColor(241, 245, 249);
                    doc.rect(marginLeft, y, contentWidth, 8, 'F');
                    doc.setFont(fontFamily, 'bold');
                    doc.setFontSize(7);
                    doc.setTextColor(...secondaryText);
                    headers.forEach((h, idx) => {
                        doc.text(h, headerX[idx], y + 5.5);
                    });
                    y += 8;
                }

                if (i % 2 === 1) {
                    doc.setFillColor(250, 250, 250);
                    doc.rect(marginLeft, y, contentWidth, rowH, 'F');
                }

                doc.setFont(fontFamily, 'normal');
                doc.setFontSize(8);
                doc.setTextColor(...darkNeutral);

                doc.text(num, col1, y + 6);
                doc.text(d.horaInicio || '--:--', col2, y + 6);
                doc.text(d.horaFim || '--:--', col3, y + 6);

                // Código com badge
                if (d.codigo) {
                    doc.setFillColor(254, 243, 199);
                    doc.roundedRect(col4, y + 2, 18, 5.5, 1, 1, 'F');
                    doc.setFont(fontFamily, 'bold');
                    doc.setFontSize(7);
                    doc.setTextColor(146, 64, 14);
                    doc.text(d.codigo, col4 + 9, y + 5.5, { align: 'center' });
                } else {
                    doc.text('--', col4, y + 6);
                }

                doc.setFont(fontFamily, 'normal');
                doc.setFontSize(8);
                doc.setTextColor(...darkNeutral);
                descLines.forEach((l, lIdx) => {
                    doc.text(l, col5, y + 5.5 + (lIdx * 4.5));
                });

                doc.setDrawColor(...borderBg);
                doc.setLineWidth(0.2);
                doc.line(marginLeft, y + rowH, pageWidth - marginRight, y + rowH);

                y += rowH;
            });
        }

        // ===== RODAPÉ =====
        const pageCount = doc.internal.getNumberOfPages();
        const dataGeracao = new Date().toLocaleString('pt-BR');

        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFont(fontFamily, 'italic');
            doc.setFontSize(8);
            doc.setTextColor(...secondaryText);

            doc.setDrawColor(...borderBg);
            doc.setLineWidth(0.3);
            doc.line(marginLeft, pageHeight - marginBottom + 2, pageWidth - marginRight, pageHeight - marginBottom + 2);

            doc.text(`Gerado em: ${dataGeracao}`, marginLeft, pageHeight - marginBottom + 7);
            doc.text(`Página ${i} de ${pageCount}`, pageWidth - marginRight, pageHeight - marginBottom + 7, { align: 'right' });
        }

        // Salvar
        const dataRDO = rdo.data || new Date().toISOString().slice(0, 10);
        const dataClean = dataRDO.replace(/[/\\?%*:|"<>]/g, '-');
        const equipeClean = (rdo.equipe || 'equipe').replace(/\s+/g, '_');
        const createdAt = rdo.createdAt ? new Date(rdo.createdAt) : new Date();
        const hora = String(createdAt.getHours()).padStart(2, '0');
        const minuto = String(createdAt.getMinutes()).padStart(2, '0');
        const timestamp = `${hora}${minuto}`;
        const nomeArquivo = `RDO_${dataClean}_${equipeClean}_${timestamp}.pdf`;

        doc.save(nomeArquivo);

        if (typeof showToast === 'function') {
            showToast(`📄 PDF gerado: ${nomeArquivo}`);
        }

        this.exibirOpcoesCompartilhamento(id);
    }

    // =============================================
    // MÉTODOS DE EVENTOS
    // =============================================
    bindEvents() {
        console.log('🔧 Vinculando eventos...');

        // ----- Upload de logotipo -----
        if (this.profileLogotipo) {
            this.profileLogotipo.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                if (!file.type.startsWith('image/')) {
                    showToast('⚠️ Selecione uma imagem válida.');
                    this.profileLogotipo.value = '';
                    return;
                }
                if (file.size > 2 * 1024 * 1024) {
                    showToast('⚠️ A imagem deve ter no máximo 2MB.');
                    this.profileLogotipo.value = '';
                    return;
                }

                const reader = new FileReader();
                reader.onload = (ev) => {
                    const base64 = ev.target.result;
                    this.profileLogotipoImg.src = base64;
                    this.profileLogotipoPreview.style.display = 'block';
                    this.profileLogotipoRemover.style.display = 'inline';
                    this.profile.logotipo = base64;
                    showToast('✅ Logotipo carregado!');
                };
                reader.readAsDataURL(file);
            });
        }

        // ----- Remover logotipo -----
        if (this.profileLogotipoRemover) {
            this.profileLogotipoRemover.addEventListener('click', () => {
                this.profileLogotipoImg.src = '';
                this.profileLogotipoPreview.style.display = 'none';
                this.profileLogotipoRemover.style.display = 'none';
                this.profile.logotipo = '';
                this.profileLogotipo.value = '';
                showToast('🖼️ Logotipo removido');
            });
        }

        // ----- Busca de atividades (filtro em tempo real) -----
        if (this.rdoAtividadeSearch) {
            this.rdoAtividadeSearch.addEventListener('input', (e) => {
                this.renderizarAtividades(e.target.value);
            });
        }

        // ----- Header RDO -----
        if (this.headerRDO) {
            this.headerRDO.addEventListener('click', () => {
                this.openRDOGenerator();
            });
        }

        // ----- Tipo de atividade -----
        if (this.activityTypeBtns) {
            this.activityTypeBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.activityTypeBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const type = btn.dataset.type;
                    this.atualizarCamposPorTipo(type);
                });
            });
        }

        // ----- Campo "Outro" atualiza display -----
        if (this.rdoAtividadeOutro) {
            this.rdoAtividadeOutro.addEventListener('input', () => this.atualizarAtividade());
        }

        // ----- Jornada -----
        const jornadaInicio = document.getElementById('profileJornadaInicio');
        const jornadaFim = document.getElementById('profileJornadaFim');
        if (jornadaInicio && jornadaFim) {
            jornadaInicio.addEventListener('change', () => this.calcularDuracaoJornada());
            jornadaFim.addEventListener('change', () => this.calcularDuracaoJornada());
        }

        // ----- Header: WhatsApp -----
        if (this.headerWhatsApp) {
            this.headerWhatsApp.addEventListener('click', () => {
                console.log('📱 WhatsApp clicado!');
                this.shareWhatsApp();
            });
        } else {
            console.warn('⚠️ Elemento headerWhatsApp não encontrado!');
        }

        // ----- Header: Email -----
        if (this.headerEmail) {
            this.headerEmail.addEventListener('click', () => {
                console.log('📧 Email clicado!');
                this.shareEmail();
            });
        } else {
            console.warn('⚠️ Elemento headerEmail não encontrado!');
        }

        // ----- Header: Mapa -----
        if (this.headerMap) {
            this.headerMap.addEventListener('click', () => {
                console.log('🗺️ Mapa clicado!');
                this.showMap();
            });
        } else {
            console.warn('⚠️ Elemento headerMap não encontrado!');
        }

        // ----- Sidebar -----
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', () => this.toggleSidebar());
        }
        if (this.sidebarOverlay) {
            this.sidebarOverlay.addEventListener('click', () => this.closeSidebar());
        }

        // ----- Tema -----
        if (this.darkModeToggle) {
            this.darkModeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // ----- Menu -----
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

        // ----- Perfil -----
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

        // ----- Dados -----
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

        // ----- FAB -----
        if (this.fabAddTask) {
            this.fabAddTask.addEventListener('click', () => {
                console.log('✅ FAB clicado!');
                this.openTaskModal();
            });
        }

        // ----- Modal Tarefa -----
        if (this.modalTaskClose) {
            this.modalTaskClose.addEventListener('click', () => this.closeTaskModal());
        }
        if (this.taskModal) {
            this.taskModal.addEventListener('click', (e) => {
                if (e.target === this.taskModal) this.closeTaskModal();
            });
        }

        // ----- Busca Endereço -----
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

        // ----- Formulário de Atividade -----
        if (this.taskForm) {
            this.taskForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const endereco = this.selectedAddress ? { ...this.selectedAddress } : null;
                const ordem = this.rdoOrdem ? this.rdoOrdem.value.trim() : '';
                const obs = this.rdoObs ? this.rdoObs.value.trim() : '';
                const data = this.rdoDataAtividade ? this.rdoDataAtividade.value : '';
                const editId = parseInt(this.editTaskId.value);
                if (editId) {
                    this.updateTask(editId, '', endereco, ordem, obs, data);
                } else {
                    this.addTask('', endereco, ordem, obs, data);
                }
            });
        }

        // ----- Concluir Tarefa -----
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

        // ----- Menu Gerar RDO -----
        const menuGerarRDO = document.getElementById('menuGerarRDO');
        if (menuGerarRDO) {
            menuGerarRDO.addEventListener('click', () => {
                this.openRDOGenerator();
                this.closeSidebar();
            });
        }

        // ----- Menu Meus RDOs -----
        const menuMeusRDOs = document.getElementById('menuMeusRDOs');
        if (menuMeusRDOs) {
            menuMeusRDOs.addEventListener('click', () => {
                this.listarRDOs();
                this.closeSidebar();
            });
        }

        // ----- Fechar RDO Generator -----
        if (this.rdoGeneratorClose) {
            this.rdoGeneratorClose.addEventListener('click', () => {
                if (this.rdoGeneratorModal) this.rdoGeneratorModal.classList.remove('active');
            });
        }

        // ----- Submit RDO Generator -----
        if (this.rdoGeneratorForm) {
            this.rdoGeneratorForm.addEventListener('submit', (e) => this.salvarRDO(e));
        }

        // ----- Adicionar Desvio -----
        if (this.rdoAddDesvioBtn) {
            this.rdoAddDesvioBtn.addEventListener('click', () => {
                this.addDesvioRow('12:00', '13:00', '13');
            });
        }

        // ----- Filtros -----
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.filter;
                this.render();
            });
        });

        // ----- Instalação (PWA) -----
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            const menuInstall = document.getElementById('installMenuItem');
            if (menuInstall) menuInstall.style.display = 'flex';
        });

        document.getElementById('btnInstallApp')?.addEventListener('click', async () => {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                document.getElementById('installMenuItem').style.display = 'none';
            }
            deferredPrompt = null;
        });

        // ----- Gestão para fechar sidebar -----
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
    window.app = new TaskManager();
    console.log('✅ App organizado e inicializado!');
});