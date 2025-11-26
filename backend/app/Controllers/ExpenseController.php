<?php

namespace App\Controllers;

use App\Models\ExpenseModel;
use App\Models\BudgetModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class ExpenseController extends ResourceController
{
    protected $modelName = 'App\Models\ExpenseModel';
    protected $format    = 'json';

    public function index()
    {
        $userId = $this->request->getGet('user_id');
        
        if (!$userId) {
            return $this->fail('User ID is required');
        }

        $expenseModel = new ExpenseModel();
        $expenses = $expenseModel->getUserExpenses($userId);

        return $this->respond([
            'status' => 'success',
            'data' => $expenses
        ]);
    }

    public function show($id = null)
    {
        $expenseModel = new ExpenseModel();
        $expense = $expenseModel->find($id);

        if (!$expense) {
            return $this->failNotFound('Expense not found');
        }

        return $this->respond([
            'status' => 'success',
            'data' => $expense
        ]);
    }

    public function create()
    {
        $rules = [
            'user_id'  => 'required|integer',
            'category' => 'required|max_length[50]',
            'amount'   => 'required|decimal',
            'date'     => 'required|valid_date',
            'type'     => 'in_list[daily,other]'
        ];

        if (!$this->validate($rules)) {
            return $this->fail($this->validator->getErrors());
        }

        $expenseModel = new ExpenseModel();
        $budgetModel = new BudgetModel();

        $data = [
            'user_id'      => $this->request->getPost('user_id'),
            'category'     => $this->request->getPost('category'),
            'note'         => $this->request->getPost('note'),
            'amount'       => $this->request->getPost('amount'),
            'date'         => $this->request->getPost('date'),
            'type'         => $this->request->getPost('type') ?: 'daily',
            'is_recurring' => $this->request->getPost('is_recurring') ?: false
        ];

        $expenseId = $expenseModel->insert($data);

        if ($expenseId) {
            $budgetModel->updateBudgetSpent($data['user_id']);
            
            return $this->respond([
                'status' => 'success',
                'message' => 'Expense added successfully',
                'id' => $expenseId
            ], 201);
        } else {
            return $this->fail('Failed to add expense');
        }
    }

    public function update($id = null)
    {
        $expenseModel = new ExpenseModel();
        $budgetModel = new BudgetModel();
        
        $expense = $expenseModel->find($id);
        if (!$expense) {
            return $this->failNotFound('Expense not found');
        }

        $rules = [
            'category' => 'permit_empty|max_length[50]',
            'amount'   => 'permit_empty|decimal',
            'date'     => 'permit_empty|valid_date',
            'type'     => 'permit_empty|in_list[daily,other]'
        ];

        if (!$this->validate($rules)) {
            return $this->fail($this->validator->getErrors());
        }

        $data = $this->request->getRawInput();
        unset($data['user_id']); // Don't allow user_id updates

        $updated = $expenseModel->update($id, $data);

        if ($updated) {
            $budgetModel->updateBudgetSpent($expense['user_id']);
            
            return $this->respond([
                'status' => 'success',
                'message' => 'Expense updated successfully'
            ]);
        } else {
            return $this->fail('Failed to update expense');
        }
    }

    public function delete($id = null)
    {
        $expenseModel = new ExpenseModel();
        $budgetModel = new BudgetModel();
        
        $expense = $expenseModel->find($id);
        if (!$expense) {
            return $this->failNotFound('Expense not found');
        }

        $deleted = $expenseModel->delete($id);

        if ($deleted) {
            $budgetModel->updateBudgetSpent($expense['user_id']);
            
            return $this->respond([
                'status' => 'success',
                'message' => 'Expense deleted successfully'
            ]);
        } else {
            return $this->fail('Failed to delete expense');
        }
    }

    public function getTodayExpenses()
    {
        $userId = $this->request->getGet('user_id');
        
        if (!$userId) {
            return $this->fail('User ID is required');
        }

        $expenseModel = new ExpenseModel();
        $expenses = $expenseModel->getTodayExpenses($userId);

        return $this->respond([
            'status' => 'success',
            'data' => $expenses
        ]);
    }

    public function getMonthlyExpenses()
    {
        $userId = $this->request->getGet('user_id');
        $month = $this->request->getGet('month');
        $year = $this->request->getGet('year');
        
        if (!$userId) {
            return $this->fail('User ID is required');
        }

        $expenseModel = new ExpenseModel();
        $expenses = $expenseModel->getMonthlyExpenses($userId, $month, $year);

        return $this->respond([
            'status' => 'success',
            'data' => $expenses
        ]);
    }

    public function getSummary()
    {
        $userId = $this->request->getGet('user_id');
        
        if (!$userId) {
            return $this->fail('User ID is required');
        }

        $expenseModel = new ExpenseModel();
        $summary = $expenseModel->getExpensesSummary($userId);

        return $this->respond([
            'status' => 'success',
            'data' => $summary
        ]);
    }
}
