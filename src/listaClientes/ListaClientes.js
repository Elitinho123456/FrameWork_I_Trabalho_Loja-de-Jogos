document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('http://localhost:5000/usuarios');
        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const tbody = document.getElementById('usuarios-body');
        const loading = document.getElementById('loading-message');

        loading.style.display = 'none';

        data.usuarios.forEach(usuario => {
            const row = document.createElement('tr');
            row.innerHTML = `
                        <td>${usuario.id}</td>
                        <td>${usuario.nome}</td>
                        <td>${usuario.email}</td>
                    `;
            tbody.appendChild(row);
        });

    } catch (error) {
        document.getElementById('loading-message').style.display = 'none';
        document.getElementById('error-message').textContent =
            `Erro ao carregar usuários: ${error.message}`;
    }
});