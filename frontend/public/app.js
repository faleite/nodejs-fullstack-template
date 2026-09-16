async function checkBackendHealth() {
  const badge = document.getElementById('statusBadge');
  if (!badge) return;

  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    
    if (data.status === 'ok') {
      badge.className = 'alert alert-success d-inline-block px-4 py-2';
      badge.innerHTML = `<strong>Backend Conectado:</strong> Status OK em ${new Date(data.timestamp).toLocaleTimeString()}`;
    } else {
      throw new Error('Status diferente de OK');
    }
  } catch (err) {
    badge.className = 'alert alert-danger d-inline-block px-4 py-2';
    badge.innerHTML = '<strong>Erro de Conexão:</strong> Não foi possível comunicar com a API backend.';
  }
}

// Executa a checagem assim que o script for carregado
checkBackendHealth();
