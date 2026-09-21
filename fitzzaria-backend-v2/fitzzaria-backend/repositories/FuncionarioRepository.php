<?php
require_once __DIR__ . '/../config/Database.php';

class FuncionarioRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function buscarPorEmail(string $email): ?array
    {
        $stmt = $this->db->prepare(
            "SELECT id, nome, email, senha_hash FROM funcionarios WHERE email = :email LIMIT 1"
        );
        $stmt->execute([':email' => mb_strtolower(trim($email))]);
        $row = $stmt->fetch();
        return $row ?: null;
    }
}
