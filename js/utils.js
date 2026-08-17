// =============================================
// UTILS.JS - FUNÇÕES AUXILIARES OTIMIZADAS
// =============================================

/**
 * Escape HTML para prevenir XSS
 * @param {string} text - Texto a ser escapado
 * @returns {string} Texto escapado
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Mostrar toast (notificação)
 * @param {string} message - Mensagem a ser exibida
 * @param {number} duration - Duração em ms (padrão 3000)
 */
function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    if (!toast) {
        console.warn('[Toast] Elemento não encontrado');
        return;
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

/**
 * Gerar ID único (fallback para quando Date.now() não é suficiente)
 * @returns {string} ID único
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * Validar se um objeto é um endereço válido
 * @param {Object} address 
 * @returns {boolean}
 */
function isValidAddress(address) {
    if (!address || typeof address !== 'object') return false;
    const hasLat = address.lat !== undefined && address.lat !== null && !isNaN(address.lat);
    const hasLon = address.lon !== undefined && address.lon !== null && !isNaN(address.lon);
    const hasLogradouro = address.logradouro && address.logradouro.trim().length > 0;
    return hasLat && hasLon || hasLogradouro;
}

/**
 * Formatar coordenadas para exibição
 * @param {number|string} lat 
 * @param {number|string} lon 
 * @returns {string}
 */
function formatCoordinates(lat, lon) {
    if (lat === undefined || lon === undefined || lat === null || lon === null) return '';
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    if (isNaN(latNum) || isNaN(lonNum)) return '';
    return `${latNum.toFixed(6)}, ${lonNum.toFixed(6)}`;
}

/**
 * Copiar texto para clipboard com fallback
 * @param {string} text 
 * @param {Function} showToastFn - Função de toast para feedback
 */
function copyToClipboard(text, showToastFn = showToast) {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            if (showToastFn) showToastFn('📋 Copiado para a área de transferência!');
        }).catch(() => {
            fallbackCopy(text, showToastFn);
        });
    } else {
        fallbackCopy(text, showToastFn);
    }
}

function fallbackCopy(text, showToastFn) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        if (showToastFn) showToastFn('📋 Copiado para a área de transferência!');
    } catch (e) {
        if (showToastFn) showToastFn('⚠️ Erro ao copiar');
    }
    document.body.removeChild(textarea);
}

/**
 * Debounce para funções que não devem ser chamadas com muita frequência
 * @param {Function} fn 
 * @param {number} delay 
 * @returns {Function}
 */
function debounce(fn, delay = 300) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
}