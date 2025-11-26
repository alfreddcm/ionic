<?php

namespace App\Models;

use CodeIgniter\Model;

class ExpenseModel extends Model
{
    protected $table            = 'expenses';
    protected $primaryKey        = 'id';
    protected $useAutoIncrement  = true;
    protected $returnType        = 'array';
    protected $useSoftDeletes    = false;
    protected $protectFields     = true;
    protected $allowedFields     = ['user_id', 'category', 'note', 'amount', 'date', 'type', 'is_recurring'];

    protected $useTimestamps = false;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
    protected $deletedField  = 'deleted_at';

    protected $validationRules = [
        'user_id'  => 'required|integer',
        'category' => 'required|max_length[50]',
        'amount'   => 'required|decimal',
        'date'     => 'required|valid_date',
        'type'     => 'in_list[daily,other]'
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

    public function getUserExpenses($userId, $limit = null)
    {
        $builder = $this->where('user_id', $userId)
                       ->orderBy('date', 'DESC')
                       ->orderBy('created_at', 'DESC');
        
        if ($limit) {
            $builder->limit($limit);
        }
        
        return $builder->findAll();
    }

    public function getTodayExpenses($userId)
    {
        return $this->where('user_id', $userId)
                   ->where('date', date('Y-m-d'))
                   ->orderBy('created_at', 'DESC')
                   ->findAll();
    }

    public function getMonthlyExpenses($userId, $month = null, $year = null)
    {
        $month = $month ?: date('m');
        $year = $year ?: date('Y');
        
        return $this->where('user_id', $userId)
                   ->where('MONTH(date)', $month)
                   ->where('YEAR(date)', $year)
                   ->orderBy('date', 'DESC')
                   ->findAll();
    }

    public function getExpensesByCategory($userId, $category)
    {
        return $this->where('user_id', $userId)
                   ->where('category', $category)
                   ->orderBy('date', 'DESC')
                   ->findAll();
    }

    public function getExpensesSummary($userId)
    {
        $today = date('Y-m-d');
        $month = date('m');
        $year = date('Y');

        $todayTotal = $this->selectSum('amount')
                          ->where('user_id', $userId)
                          ->where('date', $today)
                          ->get()
                          ->getRow()
                          ->amount ?? 0;

        $monthlyTotal = $this->selectSum('amount')
                            ->where('user_id', $userId)
                            ->where('MONTH(date)', $month)
                            ->where('YEAR(date)', $year)
                            ->get()
                            ->getRow()
                            ->amount ?? 0;

        $categories = $this->select('category, SUM(amount) as total, COUNT(*) as count')
                          ->where('user_id', $userId)
                          ->where('MONTH(date)', $month)
                          ->where('YEAR(date)', $year)
                          ->groupBy('category')
                          ->orderBy('total', 'DESC')
                          ->findAll();

        return [
            'today_total' => $todayTotal,
            'monthly_total' => $monthlyTotal,
            'categories' => $categories
        ];
    }
}
