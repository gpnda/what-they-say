<?php

require_once __DIR__ . '/Database.php';

class ProjectManager
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->db->selectDatabase();
    }

    /**
     * Получает все проекты
     */
    public function getAll()
    {
        return $this->db->fetchAll("SELECT * FROM projects ORDER BY created_at DESC");
    }

    /**
     * Получает проект по ID
     */
    public function getById($id)
    {
        return $this->db->fetch("SELECT * FROM projects WHERE id = ?", [$id]);
    }

    /**
     * Получает проект по домену
     */
    public function getByDomain($domain)
    {
        return $this->db->fetch("SELECT * FROM projects WHERE domain = ?", [$domain]);
    }

    /**
     * Создает новый проект
     */
    public function create($domain)
    {
        return $this->db->insert('projects', ['domain' => $domain]);
    }

    /**
     * Удаляет проект
     */
    public function delete($id)
    {
        // Сначала удаляем все отзывы проекта
        $this->db->delete('reviews', 'project_id = ?', [$id]);
        
        // Затем удаляем сам проект
        return $this->db->delete('projects', 'id = ?', [$id]);
    }
}

class ReviewManager
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->db->selectDatabase();
    }

    /**
     * Получает все отзывы проекта
     */
    public function getByProjectId($projectId, $visibleOnly = false)
    {
        $sql = "SELECT * FROM reviews WHERE project_id = ?";
        $params = [$projectId];

        if ($visibleOnly) {
            $sql .= " AND visible = 1";
        }

        $sql .= " ORDER BY date DESC";

        return $this->db->fetchAll($sql, $params);
    }

    /**
     * Получает отзыв по ID
     */
    public function getById($id)
    {
        return $this->db->fetch("SELECT * FROM reviews WHERE id = ?", [$id]);
    }

    /**
     * Получает отзывы по источнику
     */
    public function getBySource($projectId, $source, $visibleOnly = false)
    {
        $sql = "SELECT * FROM reviews WHERE project_id = ? AND source = ?";
        $params = [$projectId, $source];

        if ($visibleOnly) {
            $sql .= " AND visible = 1";
        }

        $sql .= " ORDER BY date DESC";

        return $this->db->fetchAll($sql, $params);
    }

    /**
     * Получает отзывы в определенном рейтинге
     */
    public function getByRating($projectId, $rating, $visibleOnly = false)
    {
        $sql = "SELECT * FROM reviews WHERE project_id = ? AND rating = ?";
        $params = [$projectId, $rating];

        if ($visibleOnly) {
            $sql .= " AND visible = 1";
        }

        $sql .= " ORDER BY date DESC";

        return $this->db->fetchAll($sql, $params);
    }

    /**
     * Создает новый отзыв
     */
    public function create($projectId, $source, $reviewerName, $text, $rating, $reviewerAvatar = null, $date = null, $visible = 1)
    {
        $data = [
            'project_id' => $projectId,
            'source' => $source,
            'date' => $date ?? date('Y-m-d H:i:s'),
            'reviewer_name' => $reviewerName,
            'text' => $text,
            'rating' => max(0, min(5, $rating)), // Ограничиваем рейтинг от 0 до 5
            'visible' => $visible
        ];

        if ($reviewerAvatar !== null) {
            $data['reviewer_avatar'] = $reviewerAvatar;
        }

        return $this->db->insert('reviews', $data);
    }

    /**
     * Обновляет отзыв
     */
    public function update($id, $data)
    {
        // Валидация рейтинга
        if (isset($data['rating'])) {
            $data['rating'] = max(0, min(5, $data['rating']));
        }

        return $this->db->update('reviews', $data, 'id = ?', [$id]);
    }

    /**
     * Удаляет отзыв
     */
    public function delete($id)
    {
        return $this->db->delete('reviews', 'id = ?', [$id]);
    }

    /**
     * Изменяет видимость отзыва
     */
    public function toggleVisibility($id)
    {
        $review = $this->getById($id);
        if ($review) {
            return $this->update($id, ['visible' => $review['visible'] ? 0 : 1]);
        }
        return false;
    }

    /**
     * Получает статистику по проекту
     */
    public function getStats($projectId, $visibleOnly = false)
    {
        $sql = "SELECT 
                    COUNT(*) as total,
                    AVG(rating) as avg_rating,
                    SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as count_5_star,
                    SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as count_4_star,
                    SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as count_3_star,
                    SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as count_2_star,
                    SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as count_1_star
                FROM reviews 
                WHERE project_id = ?";

        $params = [$projectId];

        if ($visibleOnly) {
            $sql .= " AND visible = 1";
        }

        $result = $this->db->fetch($sql, $params);

        if ($result) {
            $result['avg_rating'] = $result['avg_rating'] ? round($result['avg_rating'], 2) : 0;
        }

        return $result;
    }

    /**
     * Получает все уникальные источники для проекта
     */
    public function getSources($projectId)
    {
        return $this->db->fetchAll(
            "SELECT DISTINCT source FROM reviews WHERE project_id = ? ORDER BY source ASC",
            [$projectId]
        );
    }
}
?>
