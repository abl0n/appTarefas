// =============================================
// FUNÇÕES AUXILIARES
// =============================================

/**
 * Escape HTML para prevenir XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Mostrar toast (notificação)
 */
function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

/**
 * Formatar endereço para exibição
 */
function formatAddressDisplay(address) {
    const parts = [];
    if (address.logradouro) parts.push(address.logradouro);
    if (address.bairro) parts.push(address.bairro);
    if (address.cidade) parts.push(address.cidade);
    if (address.uf) parts.push(address.uf);
    if (address.cep) parts.push(`CEP: ${address.cep}`);
    return parts.join(' - ');
}

/**
 * Gerar ID único
 */
function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}