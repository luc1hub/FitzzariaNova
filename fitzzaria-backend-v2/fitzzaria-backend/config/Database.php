<?php

// config/Database.php
// Responsável por criar e reutilizar a conexão com o banco via PDO.
// Padrão Singleton: garante que só existe UMA conexão durante toda a requisição.

class Database
{
    // ── Configurações de conexão ──────────────────────────────────────────
    private static string $host   = 'localhost';
    private static string $dbname = 'fitzzaria';
    private static string $user   = 'root';       // troque pelo usuário do seu ambiente
    private static string $pass   = '';           // troque pela senha do seu ambiente
    private static string $charset = 'utf8mb4';

    // ── Instância única (Singleton) ───────────────────────────────────────
    private static ?PDO $instance = null;

    // Construtor privado impede criar objetos com "new Database()"
    private function __construct() {}

    /**
     * Retorna a conexão PDO.
     * Na primeira chamada cria a conexão; nas seguintes reutiliza a mesma.
     */
    public static function getConnection(): PDO
    {
        if (self::$instance === null) {
            $dsn = "mysql:host=" . self::$host
                 . ";dbname=" . self::$dbname
                 . ";charset=" . self::$charset;

            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,   // lança exceções em erro
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,         // retorna arrays associativos
                PDO::ATTR_EMULATE_PREPARES   => false,                    // prepared statements reais
            ];

            try {
                self::$instance = new PDO($dsn, self::$user, self::$pass, $options);
            } catch (PDOException $e) {
                // Em produção: logar o erro em vez de exibir
                http_response_code(500);
                echo json_encode(['erro' => 'Falha na conexão com o banco de dados.']);
                exit;
            }
        }

        return self::$instance;
    }
}
