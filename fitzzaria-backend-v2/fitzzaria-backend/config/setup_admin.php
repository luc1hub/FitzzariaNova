<?php
// Execute uma única vez pelo navegador/CLI e APAGUE este arquivo depois.
// Ex.: http://localhost/fitzzaria-backend/config/setup_admin.php
require_once __DIR__ . '/Database.php';

header('Content-Type: text/plain; charset=utf-8');

$email = 'funcionario@fitzzaria.com';
$senha = 'fitzzaria123';
$hash = password_hash($senha, PASSWORD_DEFAULT);

$db = Database::getConnection();
$stmt = $db->prepare(
    "UPDATE funcionarios SET senha_hash = :hash WHERE email = :email"
);
$stmt->execute([':hash' => $hash, ':email' => $email]);

echo $stmt->rowCount() > 0
    ? "Senha configurada para {$email}. Apague setup_admin.php agora.\n"
    : "Funcionário não encontrado. Importe o SQL primeiro.\n";
