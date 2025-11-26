<?php

namespace App\Models;

use CodeIgniter\Model;

class TransactionModel extends Model
{
    protected $table            = 'transactions';
    protected $primaryKey        = 'id';
    protected $useAutoIncrement  = true;
    protected $returnType        = 'array';
    protected $useSoftDeletes    = false;
    protected $protectFields     = true;
    protected $allowedFields     = ['user_id', 'wallet_id', 'categoryid', 'note', 'amount', 'balance_before', 'balance_after', 'transaction_type', 'transaction_date'];

    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
    protected $deletedField  = 'deleted_at';

    protected $validationRules      = [
        'user_id'          => 'required|integer',
        'wallet_id'        => 'required|integer',
        'amount'           => 'required|decimal',
        'transaction_type' => 'required|in_list[expense,add_funds,deduct_funds,update_balance]'
    ];
    protected $validationMessages   = [];
    protected $skipValidation       = false;
    protected $cleanValidationRules = true;

    protected $allowCallbacks = true;
    protected $beforeInsert   = ['setTransactionDate'];
    protected $afterInsert    = ['updateWalletBalance'];
    protected $beforeUpdate   = [];
    protected $afterUpdate    = [];
    protected $beforeFind     = [];
    protected $afterFind      = [];
    protected $beforeDelete   = [];
    protected $afterDelete    = [];

    protected function setTransactionDate(array $data)
    {
        if (!isset($data['data']['transaction_date']) || empty($data['data']['transaction_date'])) {
            $data['data']['transaction_date'] = date('Y-m-d H:i:s');
        }
        return $data;
    }

    protected function updateWalletBalance(array $data)
    {
        if (isset($data['id'])) {
            $transaction = $this->find($data['id']);
            if ($transaction) {
                $walletModel = new \App\Models\WalletModel();
                
                if ($transaction['transaction_type'] === 'expense') {
                    $walletModel->updateWalletBalance(
                        $transaction['wallet_id'], 
                        $transaction['amount'], 
                        'subtract'
                    );
                } elseif ($transaction['transaction_type'] === 'add_funds') {
                    $walletModel->updateWalletBalance(
                        $transaction['wallet_id'], 
                        $transaction['amount'], 
                        'add'
                    );
                }
            }
        }
        return $data;
    }

    public function getTransactionsByUser($userId, $filters = [])
    {
        $builder = $this->select('transactions.*, wallets.walletname, wallets.amount as current_wallet_balance, categories.name as category_name')
                        ->join('wallets', 'wallets.id = transactions.wallet_id', 'left')
                        ->join('categories', 'categories.id = transactions.categoryid', 'left')
                        ->where('transactions.user_id', $userId);
        
        if (isset($filters['wallet_id'])) {
            $builder->where('transactions.wallet_id', $filters['wallet_id']);
        }
        
        if (isset($filters['transaction_type'])) {
            $builder->where('transactions.transaction_type', $filters['transaction_type']);
        }
        
        if (isset($filters['date_from'])) {
            $builder->where('transactions.transaction_date >=', $filters['date_from']);
        }
        
        if (isset($filters['date_to'])) {
            $builder->where('transactions.transaction_date <=', $filters['date_to']);
        }
        
        return $builder->orderBy('transactions.transaction_date', 'DESC')->findAll();
    }

    public function getTodaysExpenses($userId)
    {
        $today = date('Y-m-d');
        $result = $this->selectSum('amount', 'total')
                       ->where('user_id', $userId)
                       ->where('transaction_type', 'expense')
                       ->where('DATE(transaction_date)', $today)
                       ->first();
        
        return $result['total'] ?? 0;
    }

    public function getExpensesByDateRange($userId, $startDate, $endDate)
    {
        return $this->where('user_id', $userId)
                    ->where('transaction_type', 'expense')
                    ->where('transaction_date >=', $startDate)
                    ->where('transaction_date <=', $endDate)
                    ->orderBy('transaction_date', 'DESC')
                    ->findAll();
    }
}
