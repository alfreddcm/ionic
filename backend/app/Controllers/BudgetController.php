<?php

namespace App\Controllers;

use App\Models\BudgetModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class BudgetController extends ResourceController
{
    protected $modelName = 'App\Models\BudgetModel';
    protected $format    = 'json';

    public function index()
    {
        $userId = $this->request->getGet('user_id');
        $month = $this->request->getGet('month');
        $year = $this->request->getGet('year');
        
        if (!$userId) {
            return $this->fail('User ID is required');
        }

        $budgetModel = new BudgetModel();
        $budget = $budgetModel->getUserBudget($userId, $month, $year);

        if (!$budget) {
            return $this->respond([
                'status' => 'success',
                'data' => null,
                'message' => 'No budget found for this period'
            ]);
        }

        return $this->respond([
            'status' => 'success',
            'data' => $budget
        ]);
    }

    public function create()
    {
        $rules = [
            'user_id'      => 'required|integer',
            'total_budget' => 'required|decimal'
        ];

        if (!$this->validate($rules)) {
            return $this->fail($this->validator->getErrors());
        }

        $budgetModel = new BudgetModel();
        
        $userId = $this->request->getPost('user_id');
        $totalBudget = $this->request->getPost('total_budget');
        $month = $this->request->getPost('month') ?: date('F');
        $year = $this->request->getPost('year') ?: date('Y');

        $result = $budgetModel->createOrUpdateBudget($userId, $totalBudget, $month, $year);

        if ($result) {
            return $this->respond([
                'status' => 'success',
                'message' => 'Budget updated successfully'
            ], 201);
        } else {
            return $this->fail('Failed to update budget');
        }
    }

    public function update($id = null)
    {
        $budgetModel = new BudgetModel();
        
        $budget = $budgetModel->find($id);
        if (!$budget) {
            return $this->failNotFound('Budget not found');
        }

        $rules = [
            'total_budget' => 'permit_empty|decimal'
        ];

        if (!$this->validate($rules)) {
            return $this->fail($this->validator->getErrors());
        }

        $data = $this->request->getRawInput();
        
        if (isset($data['total_budget'])) {
            $data['remaining'] = $data['total_budget'] - $budget['spent'];
        }

        $updated = $budgetModel->update($id, $data);

        if ($updated) {
            return $this->respond([
                'status' => 'success',
                'message' => 'Budget updated successfully'
            ]);
        } else {
            return $this->fail('Failed to update budget');
        }
    }

    public function updateSpent()
    {
        $userId = $this->request->getPost('user_id');
        $month = $this->request->getPost('month');
        $year = $this->request->getPost('year');
        
        if (!$userId) {
            return $this->fail('User ID is required');
        }

        $budgetModel = new BudgetModel();
        $updated = $budgetModel->updateBudgetSpent($userId, $month, $year);

        if ($updated) {
            return $this->respond([
                'status' => 'success',
                'message' => 'Budget spending updated successfully'
            ]);
        } else {
            return $this->fail('Failed to update budget spending');
        }
    }
}
