<?php

namespace App\Models;

use CodeIgniter\Model;

class WalletModel extends Model
{
    protected $table            = 'wallets';
    protected $primaryKey        = 'id';
    protected $useAutoIncrement  = true;
    protected $returnType        = 'array';
    protected $useSoftDeletes    = false;
    protected $protectFields     = true;
    protected $allowedFields     = ['user_id', 'walletname', 'amount', 'is_enabled'];

    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
    protected $deletedField  = 'deleted_at';

    protected $validationRules      = [
        'user_id'     => 'required|integer',
        'walletname'  => 'required|min_length[2]|max_length[100]',
        'amount'      => 'required|decimal',
        'is_enabled'  => 'permit_empty|in_list[0,1]'
    ];
    protected $validationMessages   = [];
    protected $skipValidation       = false;
    protected $cleanValidationRules = true;

    protected $allowCallbacks = true;
    protected $beforeInsert   = [];
    protected $afterInsert    = [];
    protected $beforeUpdate   = [];
    protected $afterUpdate    = [];
    protected $beforeFind     = [];
    protected $afterFind      = [];
    protected $beforeDelete   = [];
    protected $afterDelete    = [];

    public function getWalletsByUser($userId)
    {
        return $this->where('user_id', $userId)->findAll();
    }

    public function getEnabledWalletsByUser($userId)
    {
        return $this->where('user_id', $userId)
                    ->where('is_enabled', true)
                    ->findAll();
    }

    public function updateWalletBalance($walletId, $amount, $operation = 'subtract')
    {
        $wallet = $this->find($walletId);
        if (!$wallet) {
            return false;
        }

        $newAmount = $operation === 'add' 
            ? $wallet['amount'] + $amount 
            : $wallet['amount'] - $amount;

        return $this->update($walletId, ['amount' => $newAmount]);
    }
}
