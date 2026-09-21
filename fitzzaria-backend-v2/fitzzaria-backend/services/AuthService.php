<?php
require_once __DIR__ . '/../repositories/FuncionarioRepository.php';

class AuthService
{
    private FuncionarioRepository $funcionarios;

    public function __construct()
    {
        $this->funcionarios = new FuncionarioRepository();
    }

    public function login(string $email, string $senha): array
    {
        $funcionario = $this->funcionarios->buscarPorEmail($email);

        if (!$funcionario || !password_verify($senha, $funcionario['senha_hash'])) {
            throw new RuntimeException('E-mail ou senha inválidos.', 401);
        }

        if (session_status() !== PHP_SESSION_ACTIVE) {
            session_start();
        }

        session_regenerate_id(true);
        $_SESSION['funcionario_id'] = (int) $funcionario['id'];
        $_SESSION['funcionario_nome'] = $funcionario['nome'];
        $_SESSION['funcionario_email'] = $funcionario['email'];
        $_SESSION['login_em'] = date('c');

        return [
            'id' => (int) $funcionario['id'],
            'nome' => $funcionario['nome'],
            'email' => $funcionario['email'],
        ];
    }

    public function logout(): void
    {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            session_start();
        }
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params['path'], $params['domain'],
                $params['secure'], $params['httponly']
            );
        }
        session_destroy();
    }

    public function usuarioAtual(): ?array
    {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            session_start();
        }
        if (empty($_SESSION['funcionario_id'])) {
            return null;
        }

        return [
            'id' => (int) $_SESSION['funcionario_id'],
            'nome' => $_SESSION['funcionario_nome'],
            'email' => $_SESSION['funcionario_email'],
            'loginEm' => $_SESSION['login_em'] ?? null,
        ];
    }

    public function exigirLogin(): array
    {
        $usuario = $this->usuarioAtual();
        if ($usuario === null) {
            throw new RuntimeException('Autenticação necessária.', 401);
        }
        return $usuario;
    }
}
