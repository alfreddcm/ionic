<?php

namespace App\Controllers;

use App\Models\WalletModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class WalletController extends ResourceController
{
    protected $modelName = 'App\Models\WalletModel';
    protected $format    = 'json';

    public function index()
    {
        $userId = $this->request->getGet('user_id');
        
        if (!$userId) {
            return $this->fail('User ID is required');
        }

        $walletModel = new WalletModel();
        $wallets = $walletModel->getWalletsByUser($userId);

        return $this->respond([
            'status' => 'success',
            'data' => $wallets
        ]);
    }

    public function show($id = null)
    {
        $walletModel = new WalletModel();
        $wallet = $walletModel->find($id);

        if (!$wallet) {
            return $this->failNotFound('Wallet not found');
        }

        return $this->respond([
            'status' => 'success',
            'data' => $wallet
        ]);
    }

    public function create()
    {
        $input = $this->request->getJSON(true) ?: $this->request->getPost();
        
        $rules = [
            'user_id'     => 'required|integer',
            'walletname'  => 'required|min_length[2]|max_length[100]',
            'amount'      => 'required|decimal',
            'is_enabled'  => 'permit_empty|in_list[0,1]'
        ];

        if (!$this->validateData($input, $rules)) {
            return $this->fail($this->validator->getErrors());
        }

        $walletModel = new WalletModel();
        $walletId = $walletModel->insert($input);

        if ($walletId) {
            $wallet = $walletModel->find($walletId);
            return $this->respondCreated([
                'status' => 'success',
                'message' => 'Wallet created successfully',
                'data' => $wallet
            ]);
        } else {
            return $this->fail('Failed to create wallet');
        }
    }

    public function update($id = null)
    {
        $input = $this->request->getJSON(true) ?: $this->request->getPost();
        
        $walletModel = new WalletModel();
        $wallet = $walletModel->find($id);

        if (!$wallet) {
            return $this->failNotFound('Wallet not found');
        }

        $rules = [
            'walletname'  => 'permit_empty|min_length[2]|max_length[100]',
            'amount'      => 'permit_empty|decimal',
            'is_enabled'  => 'permit_empty|in_list[0,1]'
        ];

        if (!$this->validateData($input, $rules)) {
            return $this->fail($this->validator->getErrors());
        }

        if ($walletModel->update($id, $input)) {
            $updatedWallet = $walletModel->find($id);
            return $this->respond([
                'status' => 'success',
                'message' => 'Wallet updated successfully',
                'data' => $updatedWallet
            ]);
        } else {
            return $this->fail('Failed to update wallet');
        }
    }

    public function delete($id = null)
    {
        $walletModel = new WalletModel();
        $wallet = $walletModel->find($id);

        if (!$wallet) {
            return $this->failNotFound('Wallet not found');
        }

        if ($walletModel->delete($id)) {
            return $this->respond([
                'status' => 'success',
                'message' => 'Wallet deleted successfully'
            ]);
        } else {
            return $this->fail('Failed to delete wallet');
        }
    }

    public function enabled()
    {
        $userId = $this->request->getGet('user_id');
        
        if (!$userId) {
            return $this->fail('User ID is required');
        }

        $walletModel = new WalletModel();
        $wallets = $walletModel->getEnabledWalletsByUser($userId);

        return $this->respond([
            'status' => 'success',
            'data' => $wallets
        ]);
    }
}
