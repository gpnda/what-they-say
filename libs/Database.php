<?php

class Database
{
    private static $instance = null;
    private $connection;
    private $host;
    private $db_name;
    private $db_user;
    private $db_pass;
    private $charset;

    private function __construct()
    {
        // Загружаем переменные окружения из .env
        $this->loadEnv();
        
        try {
            $dsn = "mysql:host=" . $this->host . ";charset=" . $this->charset;
            $this->connection = new PDO($dsn, $this->db_user, $this->db_pass);
            $this->connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            die("Ошибка подключения: " . $e->getMessage());
        }
    }

    /**
     * Загружает переменные из .env файла
     */
    private function loadEnv()
    {
        $envFile = __DIR__ . '/../.env';
        
        if (!file_exists($envFile)) {
            die("Файл .env не найден: " . $envFile);
        }

        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        
        foreach ($lines as $line) {
            if (strpos($line, '#') === 0 || strpos($line, '=') === false) {
                continue;
            }
            
            [$key, $value] = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);

            switch ($key) {
                case 'DB_HOST':
                    $this->host = $value;
                    break;
                case 'DB_NAME':
                    $this->db_name = $value;
                    break;
                case 'DB_USER':
                    $this->db_user = $value;
                    break;
                case 'DB_PASS':
                    $this->db_pass = $value;
                    break;
                case 'DB_CHARSET':
                    $this->charset = $value;
                    break;
            }
        }
    }

    /**
     * Получает singleton экземпляр класса Database
     */
    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Получает PDO соединение
     */
    public function getConnection()
    {
        return $this->connection;
    }

    /**
     * Выбирает базу данных
     */
    public function selectDatabase($database = null)
    {
        $db = $database ?? $this->db_name;
        $this->connection->exec("USE `" . $db . "`");
    }

    /**
     * Создает базу данных если ее нет
     */
    public function createDatabase($database = null)
    {
        $db = $database ?? $this->db_name;
        try {
            $this->connection->exec("CREATE DATABASE IF NOT EXISTS `" . $db . "` CHARACTER SET " . $this->charset);
            $this->selectDatabase($db);
            return true;
        } catch (PDOException $e) {
            echo "Ошибка создания БД: " . $e->getMessage();
            return false;
        }
    }

    /**
     * Выполняет SQL запрос
     */
    public function query($sql, $params = [])
    {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            echo "Ошибка запроса: " . $e->getMessage();
            return false;
        }
    }

    /**
     * Получает все результаты запроса
     */
    public function fetchAll($sql, $params = [])
    {
        $stmt = $this->query($sql, $params);
        if ($stmt) {
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        return [];
    }

    /**
     * Получает один результат запроса
     */
    public function fetch($sql, $params = [])
    {
        $stmt = $this->query($sql, $params);
        if ($stmt) {
            return $stmt->fetch(PDO::FETCH_ASSOC);
        }
        return null;
    }

    /**
     * Вставляет данные и возвращает ID последней вставки
     */
    public function insert($table, $data)
    {
        $columns = implode('`, `', array_keys($data));
        $placeholders = implode(', ', array_fill(0, count($data), '?'));
        
        $sql = "INSERT INTO `" . $table . "` (`" . $columns . "`) VALUES (" . $placeholders . ")";
        
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute(array_values($data));
            return $this->connection->lastInsertId();
        } catch (PDOException $e) {
            echo "Ошибка вставки: " . $e->getMessage();
            return false;
        }
    }

    /**
     * Обновляет данные в таблице
     */
    public function update($table, $data, $where, $whereParams = [])
    {
        $set = [];
        foreach ($data as $key => $value) {
            $set[] = "`" . $key . "` = ?";
        }
        
        $sql = "UPDATE `" . $table . "` SET " . implode(', ', $set) . " WHERE " . $where;
        
        $params = array_merge(array_values($data), $whereParams);
        
        return $this->query($sql, $params);
    }

    /**
     * Удаляет данные из таблицы
     */
    public function delete($table, $where, $params = [])
    {
        $sql = "DELETE FROM `" . $table . "` WHERE " . $where;
        return $this->query($sql, $params);
    }

    /**
     * Получает количество записей
     */
    public function count($table, $where = '', $params = [])
    {
        $sql = "SELECT COUNT(*) as count FROM `" . $table . "`";
        
        if (!empty($where)) {
            $sql .= " WHERE " . $where;
        }
        
        $result = $this->fetch($sql, $params);
        return $result['count'] ?? 0;
    }
}
?>
