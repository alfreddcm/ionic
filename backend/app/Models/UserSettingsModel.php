<?php

namespace App\Models;

use CodeIgniter\Model;

class UserSettingsModel extends Model
{
    protected $table            = 'user_settings';
    protected $primaryKey        = 'id';
    protected $useAutoIncrement  = true;
    protected $returnType        = 'array';
    protected $useSoftDeletes    = false;
    protected $protectFields     = true;
    protected $allowedFields     = ['user_id', 'daily_budget', 'total_expenses'];

    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
    protected $deletedField  = 'deleted_at';

    protected $validationRules      = [
        'user_id'      => 'required|integer|is_unique[user_settings.user_id,id,{id}]',
        'daily_budget' => 'required|decimal'
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

    public function getSettingsByUser($userId)
    {
        return $this->where('user_id', $userId)->first();
    }

    public function updateOrCreateSettings($userId, $settings)
    {
        $existing = $this->where('user_id', $userId)->first();
        
        if ($existing) {
            return $this->update($existing['id'], $settings);
        } else {
            $settings['user_id'] = $userId;
            return $this->insert($settings);
        }
    }

    public function updateDailyBudget($userId, $dailyBudget)
    {
        return $this->updateOrCreateSettings($userId, ['daily_budget' => $dailyBudget]);
    }

    /**
     * Calculate and update total expenses from transactions
     */
    public function calculateTotalExpenses($userId)
    {
        $db = \Config\Database::connect();
        $builder = $db->table('transactions');
        
        $result = $builder->selectSum('amount', 'total')
            ->where('user_id', $userId)
            ->where('type', 'expense')
            ->get()
            ->getRowArray();
        
        $totalExpenses = $result['total'] ?? 0.00;
        
        return $this->updateOrCreateSettings($userId, ['total_expenses' => $totalExpenses]);
    }

    /**
     * Add amount to total expenses
     */
    public function incrementTotalExpenses($userId, $amount)
    {
        $settings = $this->getSettingsByUser($userId);
        
        if ($settings) {
            $newTotal = ($settings['total_expenses'] ?? 0) + $amount;
            return $this->update($settings['id'], ['total_expenses' => $newTotal]);
        } else {
            return $this->insert([
                'user_id' => $userId,
                'daily_budget' => 0.00,
                'total_expenses' => $amount
            ]);
        }
    }

    /**
     * Recalculate total expenses from all transactions
     * Use this only when you need to rebuild/fix the total
     */
    public function recalculateTotalExpenses($userId)
    {
        return $this->calculateTotalExpenses($userId);
    }
}
