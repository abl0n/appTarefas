// =============================================
// FUNÇÕES AUXILIARES
// =============================================

/**
 * Escape HTML para prevenir XSS
 * @param {string} text - Texto a ser escapado
 * @returns {string} Texto escapado
 */
function escapeHtml(text) {
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

/**
 * Formatar endereço para exibição (versão simplificada)
 * @param {Object} address - Objeto com campos do endereço
 * @returns {string} Endereço formatado
 */
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

/**
 * Gerar ID único (para fallback)
 */
function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}