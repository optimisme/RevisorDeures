class App {
  constructor() {
    this.practicaId = null;
    this.init();
  }

  async init() {
    await this.loadPractiques();
    this.setupEventListeners();
  }

  setupEventListeners() {
    const btnNovaPractica = document.getElementById('btn-nova-practica');
    if (btnNovaPractica) {
      btnNovaPractica.addEventListener('click', () => this.mostrarFormPractica());
    }

    const btnTornar = document.getElementById('btn-tornar');
    if (btnTornar) {
      btnTornar.addEventListener('click', () => this.tornarLlistaPractiques());
    }

    const formEntrega = document.getElementById('form-entrega');
    if (formEntrega) {
      formEntrega.addEventListener('submit', (e) => this.handleEnviarEntrega(e));
    }

    const btnNovaPracticaDetail = document.getElementById('btn-nou-criteri');
    if (btnNovaPracticaDetail) {
      btnNovaPracticaDetail.addEventListener('click', () => this.mostrarFormCriteri());
    }
  }

  async loadPractiques() {
    try {
      const resposta = await fetch('/api/practiques');
      const practiques = await resposta.json();
      this.renderPractiques(practiques);
    } catch (error) {
      console.error('Error carregant pràctiques:', error);
      document.getElementById('practiques-list').innerHTML = 
        '<p class="error">Error carregant pràctiques</p>';
    }
  }

  renderPractiques(practiques) {
    const container = document.getElementById('practiques-list');
    
    if (practiques.length === 0) {
      container.innerHTML = '<p class="loading">No hi ha pràctiques</p>';
      return;
    }

    container.innerHTML = practiques.map(p => `
      <div class="practica-card" data-id="${p.id}" onclick="app.mostrarDetallPractica('${p.id}')">
        <div class="card-header">
          <h3>${p.nom}</h3>
          <div>
            <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); app.editarPractica('${p.id}')">
              Editar
            </button>
            <button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); app.eliminarPractica('${p.id}')">
              Eliminar
            </button>
          </div>
        </div>
        <div class="card-body">
          <p>${p.descripcio || 'Sense descripció'}</p>
        </div>
        <div class="card-footer">
          <span>Clicar per veure detalls</span>
        </div>
      </div>
    `).join('');
  }

  async mostrarFormPractica() {
    const nom = prompt('Nom de la nova pràctica:');
    if (!nom) return;

    const descripcio = prompt('Descripció (opcional):');

    try {
      const resposta = await fetch('/api/practiques', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom,
          descripcio: descripcio || '',
        }),
      });

      if (!resposta.ok) {
        throw new Error('Error creant pràctica');
      }

      await this.loadPractiques();
    } catch (error) {
      console.error(error);
      alert('Error creant pràctica');
    }
  }

  async editarPractica(id) {
    this.practicaId = id;
    await this.mostrarDetallPractica(id);
  }

  async eliminarPractica(id) {
    if (!confirm('Estàs segur que vols eliminar aquesta pràctica?')) return;

    try {
      const resposta = await fetch(`/api/practiques/${id}`, {
        method: 'DELETE',
      });

      if (!resposta.ok) {
        throw new Error('Error eliminant pràctica');
      }

      await this.loadPractiques();
    } catch (error) {
      console.error(error);
      alert('Error eliminant pràctica');
    }
  }

  async mostrarDetallPractica(id) {
    try {
      const resposta = await fetch(`/api/practiques/${id}`);
      const practica = await resposta.json();

      document.getElementById('practica-nom').textContent = practica.nom;
      document.getElementById('practiques').classList.add('hidden');
      document.getElementById('practica-detail').classList.remove('hidden');

      this.practicaId = id;
      await this.loadCriteris(id);
      await this.loadEntregues(id);
    } catch (error) {
      console.error('Error carregant detall:', error);
    }
  }

  async loadCriteris(practicaId) {
    try {
      const resposta = await fetch(`/api/practiques/${practicaId}/criteris`);
      const criteris = await resposta.json();
      this.renderCriteris(criteris);
    } catch (error) {
      console.error('Error carregant criteris:', error);
      document.getElementById('criteria-list').innerHTML = 
        '<p class="error">Error carregant criteris</p>';
    }
  }

  renderCriteris(criteris) {
    const container = document.getElementById('criteria-list');
    
    if (criteris.length === 0) {
      container.innerHTML = '<p class="loading">No hi ha criteris</p>';
      return;
    }

    container.innerHTML = criteris.map(c => `
      <div class="criteri-card">
        <div class="card-header">
          <h4>Criteri ${c.posicio}</h4>
          <button class="btn btn-danger btn-sm" onclick="app.eliminarCriteri('${c.id}')">
            Eliminar
          </button>
        </div>
        <div class="card-body">
          <p>${c.text}</p>
        </div>
      </div>
    `).join('');
  }

  async mostrarFormCriteri() {
    const text = prompt('Text del nou criteri:');
    if (!text) return;

    try {
      const resposta = await fetch(`/api/practiques/${this.practicaId}/criteris`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          posicio: 1,
        }),
      });

      if (!resposta.ok) {
        throw new Error('Error creant criteri');
      }

      await this.loadCriteris(this.practicaId);
    } catch (error) {
      console.error(error);
      alert('Error creant criteri');
    }
  }

  async eliminarCriteri(id) {
    if (!confirm('Estàs segur que vols eliminar aquest criteri?')) return;

    try {
      const resposta = await fetch(`/api/criteris/${id}`, {
        method: 'DELETE',
      });

      if (!resposta.ok) {
        throw new Error('Error eliminant criteri');
      }

      await this.loadCriteris(this.practicaId);
    } catch (error) {
      console.error(error);
      alert('Error eliminant criteri');
    }
  }

  async loadEntregues(practicaId) {
    try {
      const resposta = await fetch(`/api/entregues/${practicaId}`);
      const entregues = await resposta.json();
      this.renderEntregues(entregues);
    } catch (error) {
      console.error('Error carregant entregues:', error);
      document.getElementById('entregues-list').innerHTML = 
        '<p class="error">Error carregant entregues</p>';
    }
  }

  renderEntregues(entregues) {
    const container = document.getElementById('entregues-list');
    
    if (entregues.length === 0) {
      container.innerHTML = '<p class="loading">No hi ha entregues</p>';
      return;
    }

    container.innerHTML = entregues.map(e => `
      <div class="entrega-card">
        <div class="card-header">
          <h4>${e.urlRepo}</h4>
          <span class="status-badge status-${e.estat}">${e.estat}</span>
        </div>
        <div class="card-body">
          <p>Enviada el: ${new Date(e.createdAt).toLocaleDateString('ca-ES')}</p>
        </div>
      </div>
    `).join('');
  }

  async handleEnviarEntrega(e) {
    e.preventDefault();
    
    const urlRepo = document.getElementById('url-repo').value;
    if (!urlRepo) {
      alert('Introdueix una URL de repositori');
      return;
    }

    try {
      const resposta = await fetch('/api/entregues/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urlRepo,
          practicaId: this.practicaId,
        }),
      });

      if (!resposta.ok) {
        throw new Error('Error creant entrega');
      }

      alert('Entrega enviada correctament');
      document.getElementById('url-repo').value = '';
      await this.loadEntregues(this.practicaId);
    } catch (error) {
      console.error(error);
      alert('Error creant entrega');
    }
  }

  tornarLlistaPractiques() {
    document.getElementById('practica-detail').classList.add('hidden');
    document.getElementById('practiques').classList.remove('hidden');
    this.practicaId = null;
  }
}

const app = new App();
