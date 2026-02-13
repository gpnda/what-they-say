<?php

// Установка заголовков CORS для работы со скриптом на других сайтах
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

// Подключаем классы для работы с БД
require_once __DIR__ . '/../libs/Database.php';
require_once __DIR__ . '/../libs/Managers.php';

try {
    // Получаем widget ID из параметра ?id= или из URL пути
    $widget_id = $_GET['id'] ?? null;

    if (!$widget_id) {
        // Альтернативно проверяем URL пути /widget/{id}
        $request_uri = $_SERVER['REQUEST_URI'];
        $path = parse_url($request_uri, PHP_URL_PATH);
        if (preg_match('/\/widget\/([^\/\?]+)/', $path, $matches)) {
            $widget_id = $matches[1];
        }
    }

    // Получаем параметры из GET
    $visibleOnly = isset($_GET['visible']) ? (bool)$_GET['visible'] : true;
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $perPage = isset($_GET['per_page']) ? max(1, min(100, (int)$_GET['per_page'])) : 10;
    $offset = ($page - 1) * $perPage;

    $reviews_data = [];
    $meta = [
        'page' => $page,
        'per_page' => $perPage,
        'total' => 0,
        'total_pages' => 0,
        'has_more' => false
    ];

    if ($widget_id) {
        // Получаем менеджер отзывов
        $reviewManager = new ReviewManager();
        $projectManager = new ProjectManager();

        // Ищем проект по домену
        $project = $projectManager->getByDomain($widget_id);

        if ($project) {
            // Получаем общее количество отзывов
            $totalCount = $reviewManager->getTotalCountByProjectId($project['id'], $visibleOnly);
            $totalPages = ceil($totalCount / $perPage);
            
            // Получаем отзывы проекта с пагинацией
            $reviews = $reviewManager->getByProjectId($project['id'], $visibleOnly, $perPage, $offset);

            // Преобразуем данные в формат, совместимый с wtsay.js
            foreach ($reviews as $review) {
                $reviews_data[] = [
                    "author" => $review['reviewer_name'],
                    "content" => $review['text'],
                    "date" => $review['date'] . "Z",  // Добавляем Z для ISO 8601
                    "rating" => (int)$review['rating'],
                    "id" => "rev_" . $review['id'],
                    "source" => $review['source'],
                    "avatar" => $review['reviewer_avatar']
                ];
            }

            // Обновляем мета-данные
            $meta['total'] = $totalCount;
            $meta['total_pages'] = $totalPages;
            $meta['has_more'] = $page < $totalPages;
        }
    }

    // Возвращаем данные с метаинформацией в формате JSON
    $response = [
        'data' => $reviews_data,
        'meta' => $meta
    ];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    // В случае ошибки возвращаем пустой массив
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}




