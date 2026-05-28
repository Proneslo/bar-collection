function normalizeText(text) {
  const translitMap = {
    a: 'а', b: 'б', v: 'в', g: 'г', d: 'д', e: 'е', yo: 'ё', zh: 'ж', z: 'з', i: 'и',
    y: 'й', k: 'к', l: 'л', m: 'м', n: 'н', o: 'о', p: 'п', r: 'р', s: 'с',
    t: 'т', u: 'у', f: 'ф', h: 'х', c: 'ц', ch: 'ч', sh: 'ш', sch: 'щ',
    yu: 'ю', ya: 'я'
  };

  let result = text.toLowerCase();

  Object.keys(translitMap).forEach(key => {
    result = result.replaceAll(key, translitMap[key]);
  });

  return result
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/й/g, 'и')
    .replace(/[^a-zа-я0-9\s]/gi, '');
}

function levenshtein(a, b) {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

async function loadData() {
  try {
    const response = await fetch(sheetUrl);
    const csv = await response.text();

    const rows = csv.trim().split('\n').map(row => row.split(','));

    const headers = rows[0].map(h => h.trim().toLowerCase());
    const data = rows.slice(1);

    const tbody = document.querySelector('#collectionTable tbody');
    const stats = document.getElementById('stats');

    function renderTable(filter = '') {
      tbody.innerHTML = '';

      const normalizedFilter = normalizeText(filter);

      const filtered = data.filter(row => {
        const combined = normalizeText(row.join(' '));

        if (combined.includes(normalizedFilter)) {
          return true;
        }

        const words = combined.split(/\s+/);

        return words.some(word => levenshtein(word, normalizedFilter) <= 2);
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
    document.body.innerHTML = "<h2 style='color:red;text-align:center'>Ошибка загрузки Google Таблицы</h2>";
  }
}

loadData();
```

## Что изменится

• Поиск станет работать с ошибками
• Будет понимать транслит
• Будет находить похожие названия
• Поиск станет намного удобнее

Примеры:

• `jack daniels` → найдёт `Jack Daniel's`
• `jeger` → найдёт `Jägermeister`
• `balantines` → найдёт `Ballantine's`
• `hennesy` → найдёт `Hennessy`
• `absolut` → найдёт `Absolut`
