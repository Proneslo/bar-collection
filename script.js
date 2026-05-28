async function loadData() {
  try {
    const response = await fetch(sheetUrl);
    const csv = await response.text();

    const rows = csv.trim().split('\n').map(row => row.split(','));

    const headers = rows[0].map(h => h.trim().toLowerCase());
    const data = rows.slice(1);

    const tbody = document.querySelector('#collectionTable tbody');
    const stats = document.getElementById('stats');

    function normalize(text) {
      return text
        .toLowerCase()
        .replace(/ё/g, 'е')
        .replace(/й/g, 'и')
        .replace(/[^a-zа-я0-9 ]/gi, '');
    }

    function renderTable(filter = '') {
      tbody.innerHTML = '';

      const normalizedFilter = normalize(filter);

      const filtered = data.filter(row => {
        const combined = normalize(row.join(' '));

        return combined.includes(normalizedFilter);
      });

      filtered.forEach(row => {
        const tr = document.createElement('tr');

        const name = row[headers.indexOf('name')] || '';
        const category = row[headers.indexOf('category')] || '';
        const volume = row[headers.indexOf('volume')] || '';
        const status = row[headers.indexOf('status')] || '';

        tr.innerHTML = `
          <td>${name}</td>
          <td>${category}</td>
          <td>${volume}</td>
          <td class="${status.toLowerCase().includes('есть') ? 'available' : 'missing'}">
            ${status}
          </td>
        `;

        tbody.appendChild(tr);
      });

      stats.innerText = `Найдено бутылочек: ${filtered.length}`;
    }

    renderTable();

    document.getElementById('searchInput').addEventListener('input', (e) => {
      renderTable(e.target.value);
    });

  } catch (error) {
    console.error(error);
    document.body.innerHTML =
      "<h2 style='color:red;text-align:center'>Ошибка загрузки Google Таблицы</h2>";
  }
}

loadData();