<?php

namespace App\Controllers;

use App\Models\TransactionModel;
use App\Models\WalletModel;
use App\Models\UserSettingsModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class TransactionController extends ResourceController
{
    protected $modelName = 'App\Models\TransactionModel';
    protected $format    = 'json';

    public function index()
    {
        $userId = $this->request->getGet('user_id');
        
        if (!$userId) {
            return $this->fail('User ID is required');
        }

        $filters = [
            'wallet_id' => $this->request->getGet('wallet_id'),
            'transaction_type' => $this->request->getGet('transaction_type'),
            'date_from' => $this->request->getGet('date_from'),
            'date_to' => $this->request->getGet('date_to')
        ];

        $filters = array_filter($filters, function($value) {
            return $value !== null && $value !== '';
        });

        $transactionModel = new TransactionModel();
        $transactions = $transactionModel->getTransactionsByUser($userId, $filters);

        return $this->respond([
            'status' => 'success',
            'data' => $transactions
        ]);
    }

    public function show($id = null)
    {
        $transactionModel = new TransactionModel();
        $transaction = $transactionModel->find($id);

        if (!$transaction) {
            return $this->failNotFound('Transaction not found');
        }

        return $this->respond([
            'status' => 'success',
            'data' => $transaction
        ]);
    }

    public function create()
    {
        $input = $this->request->getJSON(true) ?: $this->request->getPost();
        
        $rules = [
            'user_id'          => 'required|integer',
            'wallet_id'        => 'required|integer',
            'amount'           => 'required|decimal',
            'transaction_type' => 'required|in_list[expense,add_funds,deduct_funds,update_balance]',
            'categoryid'       => 'permit_empty|integer',
            'note'             => 'permit_empty|max_length[255]'
        ];

        if (!$this->validateData($input, $rules)) {
            return $this->fail($this->validator->getErrors());
        }

        $walletModel = new WalletModel();
        $wallet = $walletModel->find($input['wallet_id']);
        
        if (!$wallet || $wallet['user_id'] != $input['user_id']) {
            return $this->fail('Invalid wallet');
        }

        if (($input['transaction_type'] === 'expense' || $input['transaction_type'] === 'deduct_funds') && $wallet['amount'] < $input['amount']) {
            return $this->fail('Insufficient wallet balance');
        }

        if (empty($input['transaction_date'])) {
            $input['transaction_date'] = date('Y-m-d H:i:s');
        }

        $newBalance = $wallet['amount'];
        
        if (in_array($input['transaction_type'], ['add_funds', 'deduct_funds', 'update_balance'])) {
            $input['balance_before'] = $wallet['amount'];
        }
        
        if ($input['transaction_type'] === 'expense' || $input['transaction_type'] === 'deduct_funds') {
            $newBalance -= $input['amount'];
        } else if ($input['transaction_type'] === 'add_funds') {
            $newBalance += $input['amount'];
        } else if ($input['transaction_type'] === 'update_balance') {
            $newBalance = $input['amount'];
        }
        
        $input['balance_after'] = $newBalance;
        
        $transactionModel = new TransactionModel();
        $transactionId = $transactionModel->insert($input);

        if ($transactionId) {
            $walletModel->update($input['wallet_id'], ['amount' => $newBalance]);
            
            if ($input['transaction_type'] === 'expense') {
                $userSettingsModel = new UserSettingsModel();
                $userSettingsModel->incrementTotalExpenses($input['user_id'], $input['amount']);
            }
            
            $transaction = $transactionModel->find($transactionId);
            return $this->respondCreated([
                'status' => 'success',
                'message' => 'Transaction created successfully',
                'data' => $transaction
            ]);
        } else {
            return $this->fail('Failed to create transaction');
        }
    }

    public function update($id = null)
    {
        $input = $this->request->getJSON(true) ?: $this->request->getPost();
        
        $transactionModel = new TransactionModel();
        $transaction = $transactionModel->find($id);

        if (!$transaction) {
            return $this->failNotFound('Transaction not found');
        }

        $rules = [
            'note'    => 'permit_empty|max_length[255]',
            'amount'  => 'permit_empty|decimal'
        ];

        if (!$this->validateData($input, $rules)) {
            return $this->fail($this->validator->getErrors());
        }

        $allowedFields = ['note'];
        $updateData = array_intersect_key($input, array_flip($allowedFields));

        if ($transactionModel->update($id, $updateData)) {
            $updatedTransaction = $transactionModel->find($id);
            return $this->respond([
                'status' => 'success',
                'message' => 'Transaction updated successfully',
                'data' => $updatedTransaction
            ]);
        } else {
            return $this->fail('Failed to update transaction');
        }
    }

    public function delete($id = null)
    {
        $transactionModel = new TransactionModel();
        $walletModel = new WalletModel();
        $transaction = $transactionModel->find($id);

        if (!$transaction) {
            return $this->failNotFound('Transaction not found');
        }

        $wallet = $walletModel->find($transaction['wallet_id']);
        if ($wallet) {
            $newBalance = $wallet['amount'];
            
            if ($transaction['transaction_type'] === 'expense' || $transaction['transaction_type'] === 'deduct_funds') {
                $newBalance += $transaction['amount'];
            } else if ($transaction['transaction_type'] === 'add_funds') {
                $newBalance -= $transaction['amount'];
            }
            
            $walletModel->update($transaction['wallet_id'], ['amount' => $newBalance]);
        }

        if ($transactionModel->delete($id)) {
            return $this->respond([
                'status' => 'success',
                'message' => 'Transaction deleted successfully'
            ]);
        } else {
            return $this->fail('Failed to delete transaction');
        }
    }

    public function today()
    {
        $userId = $this->request->getGet('user_id');
        
        if (!$userId) {
            return $this->fail('User ID is required');
        }

        $transactionModel = new TransactionModel();
        $totalExpenses = $transactionModel->getTodaysExpenses($userId);

        return $this->respond([
            'status' => 'success',
            'data' => [
                'total' => $totalExpenses,
                'date' => date('Y-m-d')
            ]
        ]);
    }

    public function dateRange()
    {
        $userId = $this->request->getGet('user_id');
        $startDate = $this->request->getGet('start_date');
        $endDate = $this->request->getGet('end_date');
        
        if (!$userId || !$startDate || !$endDate) {
            return $this->fail('User ID, start_date, and end_date are required');
        }

        $transactionModel = new TransactionModel();
        $expenses = $transactionModel->getExpensesByDateRange($userId, $startDate, $endDate);

        return $this->respond([
            'status' => 'success',
            'data' => $expenses
        ]);
    }
}
