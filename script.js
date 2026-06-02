async function loadData() {
  try {
    const response = await fetch(sheetUrl);
    const csv = await response.text();

    // Нормальный разбор CSV
    const rows = csv
      .trim()
      .split('\n')
      .map(row =>
        row
          .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
          .map(cell => cell.replace(/^"|"$/g, '').trim())
      );

    const headers = rows[0].map(h => h.trim().toLowerCase());
    const data = rows.slice(1);

    const grid = document.getElementById('collectionGrid');
    const stats = document.getElementById('stats');

    function normalize(text = '') {
      const translitMap = {
        а:'a', б:'b', в:'v', г:'g', д:'d', е:'e', ё:'e',
        ж:'zh', з:'z', и:'i', й:'y', к:'k', л:'l',
        м:'m', н:'n', о:'o', п:'p', р:'r', с:'s',
        т:'t', у:'u', ф:'f', х:'h', ц:'ts',
        ч:'ch', ш:'sh', щ:'sch', ы:'y',
        э:'e', ю:'yu', я:'ya'
      };

      text = text.toLowerCase();

      let result = '';

      for (const char of text) {
        result += translitMap[char] || char;
      }

      return result.replace(/[^a-z0-9а-яё ]/gi, '');
    }

    function renderTable(filter = '') {
      grid.innerHTML = '';

      const normalizedFilter = normalize(filter);

      const filtered = data.filter(row => {
        const combined = normalize(row.join(' '));
        return combined.includes(normalizedFilter);
      });

      filtered.forEach(row => {
        const name =
          row[headers.indexOf('name')] || '';

        const category =
          row[headers.indexOf('category')] || '';

        const volume =
          row[headers.indexOf('volume')] || '';

        const status =
          row[headers.indexOf('status')] || '';

        const photo =
          row[headers.indexOf('photo')] || '';

        const card = document.createElement('div');
        card.className = 'card';

        card.innerHTML = `
          <img
            src="${photo}"
            alt="${name}"
            loading="lazy"
            onerror="this.onerror=null;this.src='https://placehold.co/300x300?text=No+Photo';"
          >

          <div class="card-content">
            <div class="card-title">${name}</div>

            <div class="card-info">
              📦 ${category}
            </div>

            <div class="card-info">
              📏 ${volume}
            </div>

            <div class="${
              status.toLowerCase().includes('налич')
                ? 'available'
                : 'missing'
            }">
              ${status}
            </div>
          </div>
        `;

        grid.appendChild(card);
      });

      stats.textContent =
        `Найдено бутылочек: ${filtered.length}`;
    }

    renderTable();

    document
      .getElementById('searchInput')
      .addEventListener('input', e => {
        renderTable(e.target.value);
      });

  } catch (error) {
    console.error(error);

    document.body.innerHTML = `
      <h2 style="text-align:center;color:red">
        Ошибка загрузки Google Таблицы
      </h2>
    `;
  }
}

loadData();
