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

  // Pixel-perfect CSS из beautiful_review_design.txt
  const reviewWidgetCSS = `
    .wtsay-widget {
            max-width: 800px;
            margin: 0 auto;
        }

        .wtsay-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .wtsay-item {
            background: #ffffff;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            transition: box-shadow 0.3s ease;
            position: relative;
        }

        .wtsay-item:hover {
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .wtsay-item-head {
            margin-bottom: 16px;
        }

        .wtsay-info {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .wtsay-avatar {
            flex-shrink: 0;
        }

        .wtsay-title {
            flex: 1;
        }

        .wtsay-title-first-line {
            margin-bottom: 0px;
        }

        .wtsay-title-second-line {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .wtsay-item-text {
            font-size: 15px;
            line-height: 1.6;
            color: #2c3e50;
        }

        .wtsay-info-block {
            font-size: 15px;
            line-height: 1.6;
            color: #2c3e50;
            margin-bottom: 16px;
            padding: 12px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #4CAF50;
        }

        .wtsay-person {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
        }

        .wtsay-profile-img-block {
            flex-shrink: 0;
        }

        .wtsay-profile-img {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #e0e0e0;
        }

        .wtsay-text-block {
            flex-grow: 1;
        }

        .wtsay-name {
            font-weight: 600;
            font-size: 16px;
            color: #1a1a1a;
        }

        .wtsay-date {
            font-size: 13px;
            color: #757575;
            font-style: italic;
            position: absolute;
            top: 20px;
            right: 20px;
        }

        .wtsay-rating {
            font-size: 18px;
            color: #FFD700;
            letter-spacing: 2px;
            user-select: none;
            line-height: 18px;
        }

        .wtsay-source {
            font-size: 12px;
            color: #9e9e9e;
            padding-left: 8px;
            border-left: 1px solid #e0e0e0;
        }

        .wtsay-pagination {
            margin-top: 24px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
        }

        .wtsay-stats {
            font-size: 14px;
            color: #757575;
            text-align: center;
        }

        .wtsay-load-more {
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px 32px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .wtsay-load-more:hover {
            background: #45a049;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
            transform: translateY(-1px);
        }

        .wtsay-load-more:active {
            transform: translateY(0);
        }

        .wtsay-load-more:disabled {
            background: #cccccc;
            cursor: not-allowed;
            transform: none;
        }

        .wtsay-load-more.wtsay-loading {
            opacity: 0.7;
        }

        .wtsay-spinner {
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: wtsay-spin 0.8s linear infinite;
        }

        @keyframes wtsay-spin {
            to {
                transform: rotate(360deg);
            }
        }

        .wtsay-error {
            color: #d32f2f;
            text-align: center;
            padding: 20px;
            background: #ffebee;
            border-radius: 8px;
            font-size: 14px;
        }

        @media (max-width: 640px) {
            .wtsay-date-time {
                display: none;
            }
            
            .wtsay-load-more {
                width: 100%;
                justify-content: center;
            }
        }
  `;
  // Вставка стилей
  const styleSheet = document.createElement('style');
  styleSheet.textContent = reviewWidgetCSS;
  document.head.appendChild(styleSheet);

  // Получаем базовый URL эндпоинта
  // Автоматически определяем адрес эндпоинта на основе текущего хоста
  const scriptUrl = document.currentScript?.src || '';
  const scriptHost = scriptUrl.split('/widgets/')[0] || window.location.origin;
  const ENDPOINT = window.WTSAY_ENDPOINT || (scriptHost + '/api/reviews.php');

  // Хранилище состояния для каждого виджета
  const widgetStates = new WeakMap();

  // Функция для загрузки и отображения виджета
  async function loadWidget(element, page = 1, append = false) {
    try {
      // Получаем ID или другой идентификатор виджета из атрибутов элемента
      const widgetId = element.getAttribute('data-id');

      // Если нет ID, пропускаем
      if (!widgetId) {
        console.warn('Widget element without data-id attribute');
        return;
      }

      // Инициализируем состояние виджета при первой загрузке
      if (!widgetStates.has(element)) {
        const perPage = parseInt(element.getAttribute('data-per-page')) || 10;
        widgetStates.set(element, {
          currentPage: 0,
          perPage: perPage,
          hasMore: false,
          loading: false,
          totalCount: 0
        });
      }

      const state = widgetStates.get(element);

      // Предотвращаем множественные одновременные запросы
      if (state.loading) {
        return;
      }

      state.loading = true;
      updateLoadMoreButton(element, true);

      // Делаем запрос к эндпоинту с параметрами пагинации
      const url = `${ENDPOINT}/?id=${encodeURIComponent(widgetId)}&page=${page}&per_page=${state.perPage}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Обновляем состояние
      state.currentPage = result.meta.page;
      state.hasMore = result.meta.has_more;
      state.totalCount = result.meta.total;
      state.loading = false;

      // Отображаем данные внутри элемента
      displayWidgetData(element, result.data, append);
      updatePagination(element);
    } catch (error) {
      console.error('Error loading widget:', error);
      const state = widgetStates.get(element);
      if (state) state.loading = false;
      
      if (!append) {
        element.innerHTML = '<div class="wtsay-error">Ошибка при загрузке данных</div>';
      }
    }
  }

  // Функция для отображения данных
  function displayWidgetData(element, data, append = false) {
    if (!append) {
      element.innerHTML = '';
    }

    // Pixel-perfect HTML шаблон для одного отзыва
    function getReviewHTML(item) {
      // Форматирование даты и времени
      const dateObj = new Date(item.date);
      const dateValue = dateObj.toLocaleDateString('ru-RU');
      const timeValue = dateObj.toLocaleTimeString('ru-RU');
      
      return `
        <div class="wtsay-item-head">
          <div class="wtsay-info">
            <div class="wtsay-avatar">
              ${item.avatar ? `<img class="wtsay-profile-img" src="${escapeHtml(item.avatar)}" alt="Avatar">` : ''}
            </div>
            <div class="wtsay-title">
              <div class="wtsay-title-first-line">
                <div class="wtsay-name">${escapeHtml(item.author)}</div>
              </div>
              <div class="wtsay-title-second-line">
                ${item.rating ? `<div class="wtsay-rating" data-rating="${escapeHtml(item.rating)}"></div>` : ''}
                ${item.source ? `<div class="wtsay-source">${escapeHtml(item.source)}</div>` : ''}
              </div>
            </div>
          </div>
          <div class="wtsay-date">
            <span class="wtsay-date-value">${dateValue}</span><span class="wtsay-date-separator">, </span><span class="wtsay-date-time">${timeValue}</span>
          </div>
        </div>
        <div class="wtsay-item-text">
          ${escapeHtml(item.content)}
        </div>
      `;
    }
    if (Array.isArray(data)) {
      let list = element.querySelector('.wtsay-list');
      
      // Создаем список при первой загрузке
      if (!list) {
        list = document.createElement('div');
        list.className = 'wtsay-list';
        element.appendChild(list);
      }

      // Добавляем отзывы
      data.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'wtsay-item';
        itemDiv.innerHTML = getReviewHTML(item);
        list.appendChild(itemDiv);
      });
    } else if (typeof data === 'object') {
      const div = document.createElement('div');
      div.className = 'wtsay-item';
      div.innerHTML = getReviewHTML(data);
      element.appendChild(div);
    } else {
      element.textContent = data;
    }
    
    // Заполняем рейтинги звездами
    element.querySelectorAll('.wtsay-rating[data-rating]').forEach(ratingElement => {
      const rating = parseInt(ratingElement.dataset.rating) || 0;
      ratingElement.textContent = generateStars(rating);
    });
  }

  // Утилита для экранирования HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Создание или обновление UI пагинации
  function updatePagination(element) {
    const state = widgetStates.get(element);
    if (!state) return;

    let paginationContainer = element.querySelector('.wtsay-pagination');
    
    // Создаем контейнер пагинации если его нет
    if (!paginationContainer) {
      paginationContainer = document.createElement('div');
      paginationContainer.className = 'wtsay-pagination';
      element.appendChild(paginationContainer);
    }

    paginationContainer.innerHTML = '';

    // Показываем статистику
    const loadedCount = element.querySelectorAll('.wtsay-item').length;
    const stats = document.createElement('div');
    stats.className = 'wtsay-stats';
    stats.textContent = `Показано ${loadedCount} из ${state.totalCount}`;
    paginationContainer.appendChild(stats);

    // Показываем кнопку "Загрузить ещё" только если есть еще отзывы
    if (state.hasMore) {
      const loadMoreBtn = document.createElement('button');
      loadMoreBtn.className = 'wtsay-load-more';
      loadMoreBtn.innerHTML = '<span class="wtsay-load-more-text">Загрузить ещё</span>';
      
      loadMoreBtn.addEventListener('click', () => {
        loadWidget(element, state.currentPage + 1, true);
      });

      paginationContainer.appendChild(loadMoreBtn);
    }
  }

  // Обновление состояния кнопки загрузки
  function updateLoadMoreButton(element, loading) {
    const button = element.querySelector('.wtsay-load-more');
    if (!button) return;

    if (loading) {
      button.classList.add('wtsay-loading');
      button.disabled = true;
      button.innerHTML = '<span class="wtsay-spinner"></span><span class="wtsay-load-more-text">Загрузка...</span>';
    } else {
      button.classList.remove('wtsay-loading');
      button.disabled = false;
      button.innerHTML = '<span class="wtsay-load-more-text">Загрузить ещё</span>';
    }
  }

  /**
   * Генерирует звезды на основе рейтинга
   * @param {number} rating - Рейтинг от 0 до 5
   * @returns {string} Строка со звездами
   */
  function generateStars(rating) {
      // Убедимся что рейтинг в допустимых пределах
      rating = Math.max(0, Math.min(5, Math.floor(rating)));
      
      const filledStar = '★';
      const emptyStar = '☆';
      
      // Генерируем заполненные звезды
      const filled = filledStar.repeat(rating);
      // Генерируем пустые звезды
      const empty = emptyStar.repeat(5 - rating);
      
      return filled + empty;
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