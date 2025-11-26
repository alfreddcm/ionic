<?php

namespace App\Models;

use CodeIgniter\Model;

class UserModel extends Model
{
    protected $table            = 'users';
    protected $primaryKey        = 'id';
    protected $useAutoIncrement  = true;
    protected $returnType        = 'array';
    protected $useSoftDeletes    = false;
    protected $protectFields     = true;
    protected $allowedFields     = ['name', 'username', 'email', 'password'];

    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
    protected $deletedField  = 'deleted_at';

    protected $validationRules      = [];
    protected $validationMessages   = [];
    protected $skipValidation       = false;
    protected $cleanValidationRules = true;

    protected $allowCallbacks = true;
    protected $beforeInsert   = ['hashPassword'];
    protected $afterInsert    = [];
    protected $beforeUpdate   = ['hashPassword'];
    protected $afterUpdate    = [];
    protected $beforeFind     = [];
    protected $afterFind      = [];
    protected $beforeDelete   = [];
    protected $afterDelete    = [];

    protected function hashPassword(array $data)
    {
        if (isset($data['data']['password'])) {
            $data['data']['password'] = password_hash($data['data']['password'], PASSWORD_DEFAULT);
        }
        return $data;
    }

    public function findUserByEmail($email)
    {
        return $this->where('email', $email)->first();
    }

    public function findUserByEmailOrName($emailOrName)
    {
        return $this->groupStart()
                    ->where('email', $emailOrName)
                    ->orWhere('username', $emailOrName)
                    ->groupEnd()
                    ->first();
    }

    public function verifyPassword($emailOrName, $password)
    {
        $user = $this->findUserByEmailOrName($emailOrName);
        if ($user && password_verify($password, $user['password'])) {
            return $user;
        }
        return false;
    }
}
