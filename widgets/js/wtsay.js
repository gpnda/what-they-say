/*!
 *
 *     JS скрипт, который подключается с чужих сайтов к нашему эндпоинту,
 *     чтобы получать оттуда данные и отображать их на своих сайтах.
 *
 *     Например, можно вставить такой код на свой сайт:
 *     <script src="https://lumcode.ru/widgets/js/wtsay.js" defer></script>
 *     <div class="wtsay-widget" data-id="example1.ru"></div>
 * 
 */

(function() {
  'use strict';

  // Встраиваем стили для горизонтального скролирования отзывов
  const styles = `
    .wtsay-list {
      display: flex;
      flex-direction: row;
      gap: 15px;
      overflow-x: auto;
      overflow-y: hidden;
      padding: 10px 0;
      scroll-behavior: smooth;
    }

    .wtsay-list::-webkit-scrollbar {
      height: 8px;
    }

    .wtsay-list::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }

    .wtsay-list::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 4px;
    }

    .wtsay-list::-webkit-scrollbar-thumb:hover {
      background: #555;
    }

    .wtsay-item {
      flex: 0 0 300px;
      min-width: 300px;
      background-color: white;
      border-left: 4px solid #007bff;
      padding: 12px;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: box-shadow 0.3s ease;
    }

    .wtsay-item:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .wtsay-author {
      font-weight: bold;
      color: #007bff;
      margin-bottom: 5px;
    }

    .wtsay-content {
      color: #555;
      margin-bottom: 8px;
      overflow-wrap: break-word;
    }

    .wtsay-date {
      font-size: 0.85em;
      color: #999;
    }

    .wtsay-error {
      color: #d9534f;
      padding: 10px;
      background-color: #f8d7da;
      border-radius: 4px;
    }
  `;

  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  // Получаем базовый URL эндпоинта
  // Автоматически определяем адрес эндпоинта на основе текущего хоста
  const scriptUrl = document.currentScript?.src || '';
  const scriptHost = scriptUrl.split('/widgets/')[0] || window.location.origin;
  const ENDPOINT = window.WTSAY_ENDPOINT || (scriptHost + '/api/reviews.php');

  // Функция для загрузки и отображения виджета
  async function loadWidget(element) {
    try {
      // Получаем ID или другой идентификатор виджета из атрибутов элемента
      const widgetId = element.getAttribute('data-id');

      // Если нет ID, пропускаем
      if (!widgetId) {
        console.warn('Widget element without data-id attribute');
        return;
      }

      // Делаем запрос к эндпоинту с параметром widgetId (domain)
      const url = `${ENDPOINT}/?id=${encodeURIComponent(widgetId)}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Отображаем данные внутри элемента
      displayWidgetData(element, data);
    } catch (error) {
      console.error('Error loading widget:', error);
      element.innerHTML = '<div class="wtsay-error">Ошибка при загрузке данных</div>';
    }
  }

  // Функция для отображения данных
  function displayWidgetData(element, data) {
    element.innerHTML = '';
    
    if (Array.isArray(data)) {
      // Если это массив (например, список комментариев)
      const list = document.createElement('div');
      list.className = 'wtsay-list';
      
      data.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'wtsay-item';
        
        const avatarHtml = item.avatar 
          ? `<img src="${escapeHtml(item.avatar)}" alt="Avatar" style="width:32px;height:32px;border-radius:50%;margin-right:8px;vertical-align:middle;">`
          : '';
        
        itemDiv.innerHTML = `
          <div style="display:flex;align-items:center;margin-bottom:8px;">
            ${avatarHtml}
            <div class="wtsay-author">${escapeHtml(item.author)}</div>
          </div>
          <div class="wtsay-rating" style="font-size:0.9em;color:#ffa500;margin-bottom:5px;">★ ${escapeHtml(item.rating)}</div>
          <div class="wtsay-content">${escapeHtml(item.content)}</div>
          <div class="wtsay-date">${new Date(item.date).toLocaleString()}</div>
        `;
        list.appendChild(itemDiv);
      });
      
      element.appendChild(list);
    } else if (typeof data === 'object') {
      // Если это объект
      const div = document.createElement('div');
      div.className = 'wtsay-content';
      div.innerHTML = JSON.stringify(data);
      element.appendChild(div);
    } else {
      element.textContent = data;
    }
  }

  // Утилита для экранирования HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Инициализация при загрузке DOM
  function init() {
    const widgets = document.querySelectorAll('.wtsay-widget');
    
    if (widgets.length === 0) {
      console.log('No wtsay-widget elements found');
      return;
    }

    widgets.forEach(widget => {
      loadWidget(widget);
    });
  }

  // Если DOM уже загружен, инициализируем сразу
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();