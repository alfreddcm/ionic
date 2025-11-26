<?php

namespace App\Models;

use CodeIgniter\Model;

class BudgetModel extends Model
{
    protected $table            = 'budgets';
    protected $primaryKey        = 'id';
    protected $useAutoIncrement  = true;
    protected $returnType        = 'array';
    protected $useSoftDeletes    = false;
    protected $protectFields     = true;
    protected $allowedFields     = ['user_id', 'total_budget', 'spent', 'remaining', 'month', 'year'];

    protected $useTimestamps = false;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
    protected $deletedField  = 'deleted_at';

    protected $validationRules = [
        'user_id'      => 'required|integer',
        'total_budget' => 'required|decimal',
        'month'        => 'required|max_length[20]',
        'year'         => 'required|integer'
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

    public function getUserBudget($userId, $month = null, $year = null)
    {
        $month = $month ?: date('F');
        $year = $year ?: date('Y');
        
        return $this->where('user_id', $userId)
                   ->where('month', $month)
                   ->where('year', $year)
                   ->first();
    }

    public function updateBudgetSpent($userId, $month = null, $year = null)
    {
        $month = $month ?: date('F');
        $year = $year ?: date('Y');

        $expenseModel = new ExpenseModel();
        $monthlyExpenses = $expenseModel->getMonthlyExpenses($userId, date('m'), $year);
        $totalSpent = array_sum(array_column($monthlyExpenses, 'amount'));

        $budget = $this->getUserBudget($userId, $month, $year);
        
        if ($budget) {
            $remaining = $budget['total_budget'] - $totalSpent;
            
            return $this->update($budget['id'], [
                'spent' => $totalSpent,
                'remaining' => $remaining
            ]);
        }
        
        return false;
    }

    public function createOrUpdateBudget($userId, $totalBudget, $month = null, $year = null)
    {
        $month = $month ?: date('F');
        $year = $year ?: date('Y');

        $existingBudget = $this->getUserBudget($userId, $month, $year);
        
        if ($existingBudget) {
            $remaining = $totalBudget - $existingBudget['spent'];
            return $this->update($existingBudget['id'], [
                'total_budget' => $totalBudget,
                'remaining' => $remaining
            ]);
        } else {
            return $this->insert([
                'user_id' => $userId,
                'total_budget' => $totalBudget,
                'spent' => 0,
                'remaining' => $totalBudget,
                'month' => $month,
                'year' => $year
            ]);
        }
    }
}
