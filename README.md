# WTSay – What They Say

> **Виджет отзывов для сайтов с централизованной системой управления**

[![PHP](https://img.shields.io/badge/PHP-7.4%2B-777BB4?logo=php&logoColor=white)](https://www.php.net/)
[![MySQL](https://img.shields.io/badge/MySQL-5.7%2B-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

**WTSay** — это виджет для встраивания отзывов на ваш сайт. Постраничная загрузка, адаптивность под мобильные устройства и простая интеграция в 2 строки кода.

🌐 **[Домашняя страница проекта →](https://lumcode.ru/what-they-say/)**

---

## 📋 Содержание

- [Возможности](#-возможности)
- [Быстрый старт для владельцев сайтов](#-быстрый-старт-для-владельцев-сайтов)
- [Структура проекта](#️-структура-проекта)
- [Установка для разработчиков](#-установка-для-разработчиков)
- [API документация](#-api-документация)
- [Технологии](#-технологии)
- [Безопасность](#-безопасность)
- [Лицензия](#-лицензия)

---

## ✨ Возможности

- ✅ **Простая интеграция** — всего 2 строки кода для подключения
- ✅ **Постраничная загрузка** — кнопка "Загрузить ещё"
- ✅ **Без зависимостей** — чистый JavaScript, не требует jQuery или React


---

## 🚀 Быстрый старт для владельцев сайтов

> **Для тех, кто просто хочет добавить отзывы на свой сайт**

### Шаг 1: Подключите скрипт

Добавьте эту строку в `<head>` или перед закрывающим тегом `</body>`:

```html
<script src="https://lumcode.ru/widgets/js/wtsay.js" defer></script>
```

### Шаг 2: Вставьте контейнер

Разместите этот код в любом месте страницы, где хотите видеть отзывы:

```html
<div class="wtsay-widget" data-id="ваш-сайт.ru"></div>
```

**Замените** `ваш-сайт.ru` на доменное имя вашего сайта (например, `example.com`).

### Настройки

| Атрибут | Описание | Пример |
|---------|----------|--------|
| `data-id` | Идентификатор вашего сайта (обязательно) | `data-id="example.com"` |
| `data-per-page` | Количество отзывов на странице (по умолчанию 10) | `data-per-page="5"` |

### Примеры использования

```html
<!-- Компактный виджет: 5 отзывов -->
<div class="wtsay-widget" data-id="example.com" data-per-page="5"></div>

<!-- Стандартный виджет: 10 отзывов (по умолчанию) -->
<div class="wtsay-widget" data-id="example.com"></div>

<!-- Расширенный виджет: 20 отзывов -->
<div class="wtsay-widget" data-id="example.com" data-per-page="20"></div>
```

### ❓ Что делать, если виджет не работает?

1. Убедитесь, что ваш сайт добавлен в систему WTSay
2. Проверьте правильность написания `data-id` (должен совпадать с вашим доменом)
3. Откройте консоль браузера (F12) и проверьте наличие ошибок
4. Убедитесь, что скрипт виджета успешно загрузился

---

## 🏗️ Структура проекта

```
wtsay/
├── api/
│   └── reviews.php          # REST API эндпоинт для получения отзывов
├── libs/
│   ├── Database.php         # Singleton-класс для работы с MySQL
│   └── Managers.php         # Бизнес-логика (ProjectManager, ReviewManager)
├── widgets/
│   └── js/
│       └── wtsay.js         # Клиентский JavaScript-виджет
├── example.html             # Демонстрация работы виджета
├── package.json             # NPM конфигурация (скрипт для dev-сервера)
└── .env                     # Конфигурация базы данных (НЕ в Git!)
```

### Описание компонентов

#### Backend (PHP + MySQL)

- **[api/reviews.php](api/reviews.php)** — REST API
  - Получение отзывов с пагинацией
  - CORS-заголовки для кросс-доменных запросов
  - Фильтрация по видимости
  - JSON-ответ с метаданными пагинации

- **[libs/Database.php](libs/Database.php)** — Слой базы данных
  - Singleton для управления PDO-соединением
  - Загрузка конфигурации из `.env`
  - CRUD методы: `fetchAll()`, `fetch()`, `insert()`, `update()`, `delete()`, `count()`
  - Защита от SQL-инъекций через Prepared Statements

- **[libs/Managers.php](libs/Managers.php)** — Бизнес-логика
  - **ProjectManager**: управление проектами/сайтами
  - **ReviewManager**: управление отзывами, статистика, пагинация

#### Frontend (JavaScript)

- **[widgets/js/wtsay.js](widgets/js/wtsay.js)** — Клиентский виджет
  - Автоматическое определение API-эндпоинта
  - Постраничная загрузка с кнопкой "Загрузить ещё"
  - Встроенные стили (CSS инжектируется автоматически)
  - WeakMap для изоляции состояния виджетов
  - Форматирование рейтингов звёздами
  - Адаптивный дизайн


---

## 🔧 Установка для разработчиков

> **Для тех, кто хочет развернуть собственный экземпляр WTSay**

### Требования

- PHP 7.4 или выше
- MySQL 5.7+ или MariaDB
- Веб-сервер (Apache/Nginx) или PHP встроенный сервер
- Composer (опционально)

### Шаг 1: Клонирование репозитория

```bash
git clone https://github.com/your-username/wtsay.git
cd wtsay
```

### Шаг 2: Настройка базы данных

Создайте файл `.env` в корне проекта:

```env
DB_HOST=localhost
DB_NAME=wtsay_db
DB_USER=root
DB_PASS=your_password
DB_CHARSET=utf8mb4
```

### Шаг 3: Создание таблиц

Выполните SQL-скрипт для создания базы данных и таблиц:

```sql
-- Создание базы данных
CREATE DATABASE IF NOT EXISTS wtsay_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE wtsay_db;

-- Таблица проектов (сайтов)
CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    domain VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_domain (domain)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица отзывов
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    source VARCHAR(100) DEFAULT 'manual',
    date DATETIME NOT NULL,
    reviewer_name VARCHAR(255) NOT NULL,
    reviewer_avatar VARCHAR(500),
    text TEXT NOT NULL,
    rating TINYINT NOT NULL CHECK (rating BETWEEN 0 AND 5),
    visible TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_project_visible (project_id, visible),
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Шаг 4: Добавление тестовых данных

```sql
-- Добавить проект
INSERT INTO projects (domain) VALUES ('example.com');

-- Добавить отзывы (замените 1 на ID вашего проекта)
INSERT INTO reviews (project_id, date, reviewer_name, reviewer_avatar, text, rating, visible)
VALUES 
    (1, '2026-01-15 10:30:00', 'Иван Петров', 'https://i.pravatar.cc/150?img=1', 'Отличный сервис! Всё работает быстро и стабильно.', 5, 1),
    (1, '2026-02-01 14:20:00', 'Мария Сидорова', 'https://i.pravatar.cc/150?img=2', 'Очень довольна качеством. Рекомендую всем!', 5, 1),
    (1, '2026-02-10 09:15:00', 'Алексей Иванов', 'https://i.pravatar.cc/150?img=3', 'Хороший продукт, но есть куда расти.', 4, 1);
```

### Шаг 5: Запуск сервера

#### Для локальной разработки:

```bash
npm start
# Сервер запустится на http://localhost:8000
```


## 📡 API документация

### Получение отзывов

**Эндпоинт:** `GET /api/reviews.php`

**Параметры запроса:**

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `domain` | string | Да | Домен сайта (например, `example.com`) |
| `page` | integer | Нет | Номер страницы (по умолчанию: 1) |
| `per_page` | integer | Нет | Количество отзывов на странице (по умолчанию: 10) |
| `visible` | boolean | Нет | Фильтр видимости: `true` — только видимые, `false` — только скрытые, без параметра — все |

**Пример запроса:**

```bash
curl "https://lumcode.ru/api/reviews.php?domain=example.com&page=1&per_page=10&visible=true"
```

**Пример ответа:**

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "source": "manual",
      "date": "2026-01-15 10:30:00",
      "reviewer_name": "Иван Петров",
      "reviewer_avatar": "https://i.pravatar.cc/150?img=1",
      "text": "Отличный сервис! Всё работает быстро и стабильно.",
      "rating": "5"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 10,
    "total": 45,
    "total_pages": 5,
    "has_more": true
  }
}
```

**Коды ответа:**

- `200` — Успешный запрос
- `400` — Отсутствует обязательный параметр `domain`
- `404` — Проект не найден
- `500` — Ошибка сервера

---


## 🔒 Безопасность

### ⚠️ Важные рекомендации для продакшена

1. **Защита `.env` файла**
   ```apache
   # .htaccess
   <Files ".env">
       Order allow,deny
       Deny from all
   </Files>
   ```

2. **HTTPS обязателен**
   - Используйте SSL-сертификат (Let's Encrypt)
   - Настройте редирект с HTTP на HTTPS

3. **Ограничение CORS**
   ```php
   // В api/reviews.php замените:
   header('Access-Control-Allow-Origin: *');
   // На:
   header('Access-Control-Allow-Origin: https://trusted-domain.com');
   ```

4. **Rate Limiting**
   - Добавьте ограничение частоты запросов к API
   - Используйте Nginx `limit_req_zone` или PHP-решения

5. **Валидация входных данных**
   - ✅ Уже реализована через PDO Prepared Statements
   - ✅ Валидация рейтинга (0-5) на уровне БД

6. **Регулярные обновления**
   - Следите за обновлениями PHP и MySQL
   - Используйте актуальные версии зависимостей

---

## 📄 Лицензия

Этот проект разработан [Lum](https://lum.ru/).

**Больше информации:**
- 🌐 [Домашняя страница проекта](https://lumcode.ru/what-they-say/)
- 📧 Контакты и поддержка: см. домашнюю страницу

---

## 🤝 Вклад в проект

Мы приветствуем вклад в развитие WTSay! Если вы нашли ошибку или хотите предложить улучшение:

1. Создайте Issue с описанием проблемы
2. Сделайте Fork репозитория
3. Создайте ветку для вашей функции (`git checkout -b feature/AmazingFeature`)
4. Закоммитьте изменения (`git commit -m 'Add some AmazingFeature'`)
5. Отправьте в ветку (`git push origin feature/AmazingFeature`)
6. Откройте Pull Request

---

## 📞 Поддержка

Если у вас возникли вопросы или проблемы:

- 📖 Прочитайте документацию на [домашней странице](https://lumcode.ru/what-they-say/)
- 🐛 Сообщите об ошибке через Issues
- 💡 Предложите новую функцию через Discussions

---

<div align="center">
  
**Сделано с ❤️ в [Lum](https://lum.ru)**

[Домашняя страница](https://lumcode.ru/what-they-say/) • [Демо](example.html) • [API Docs](#-api-документация)

</div>
