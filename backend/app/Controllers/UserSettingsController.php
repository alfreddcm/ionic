<?php

namespace App\Controllers;

use App\Models\UserSettingsModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class UserSettingsController extends ResourceController
{
    protected $modelName = 'App\Models\UserSettingsModel';
    protected $format    = 'json';

    public function index()
    {
        $userId = $this->request->getGet('user_id');
        
        if (!$userId) {
            return $this->fail('User ID is required');
        }

        $userSettingsModel = new UserSettingsModel();
        $settings = $userSettingsModel->getSettingsByUser($userId);

        if (!$settings) {
            $settings = [
                'user_id' => $userId,
                'daily_budget' => 0.00
            ];
        }

        return $this->respond([
            'status' => 'success',
            'data' => $settings
        ]);
    }

    public function create()
    {
        $input = $this->request->getJSON(true) ?: $this->request->getPost();
        
        $rules = [
            'user_id'      => 'required|integer',
            'daily_budget' => 'required|decimal'
        ];

        if (!$this->validateData($input, $rules)) {
            return $this->fail($this->validator->getErrors());
        }

        $userSettingsModel = new UserSettingsModel();
        $settingsId = $userSettingsModel->updateOrCreateSettings($input['user_id'], $input);

        if ($settingsId) {
            $settings = $userSettingsModel->getSettingsByUser($input['user_id']);
            return $this->respondCreated([
                'status' => 'success',
                'message' => 'Settings saved successfully',
                'data' => $settings
            ]);
        } else {
            return $this->fail('Failed to save settings');
        }
    }

    public function update($id = null)
    {
        $input = $this->request->getJSON(true) ?: $this->request->getPost();
        
        $userSettingsModel = new UserSettingsModel();
        $settings = $userSettingsModel->find($id);

        if (!$settings) {
            return $this->failNotFound('Settings not found');
        }

        $rules = [
            'daily_budget' => 'permit_empty|decimal'
        ];

        if (!$this->validateData($input, $rules)) {
            return $this->fail($this->validator->getErrors());
        }

        if ($userSettingsModel->update($id, $input)) {
            $updatedSettings = $userSettingsModel->find($id);
            return $this->respond([
                'status' => 'success',
                'message' => 'Settings updated successfully',
                'data' => $updatedSettings
            ]);
        } else {
            return $this->fail('Failed to update settings');
        }
    }

    public function dailyBudget()
    {
        $input = $this->request->getJSON(true) ?: $this->request->getPost();
        
        $rules = [
            'user_id'      => 'required|integer',
            'daily_budget' => 'required|decimal'
        ];

        if (!$this->validateData($input, $rules)) {
            return $this->fail($this->validator->getErrors());
        }

        $userSettingsModel = new UserSettingsModel();
        $result = $userSettingsModel->updateDailyBudget($input['user_id'], $input['daily_budget']);

        if ($result) {
            $settings = $userSettingsModel->getSettingsByUser($input['user_id']);
            return $this->respond([
                'status' => 'success',
                'message' => 'Daily budget updated successfully',
                'data' => $settings
            ]);
        } else {
            return $this->fail('Failed to update daily budget');
        }
    }
}
