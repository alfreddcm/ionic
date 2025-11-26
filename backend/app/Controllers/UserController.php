<?php

namespace App\Controllers;

use App\Models\UserModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class UserController extends ResourceController
{
    protected $modelName = 'App\Models\UserModel';
    protected $format    = 'json';

    public function update($id = null)
    {
        $input = $this->request->getJSON(true) ?: $this->request->getPost();
        
        if (!$id) {
            return $this->fail('User ID is required');
        }

        $userModel = new UserModel();
        $user = $userModel->find($id);

        if (!$user) {
            return $this->failNotFound('User not found');
        }

        $rules = [
            'name'  => 'required|min_length[2]|max_length[100]',
            'email' => "required|valid_email|is_unique[users.email,id,{$id}]"
        ];

        if (!empty($input['username'])) {
            $rules['username'] = "required|min_length[3]|max_length[20]|is_unique[users.username,id,{$id}]";
        }

        if (!$this->validateData($input, $rules)) {
            return $this->fail($this->validator->getErrors());
        }

        $data = [
            'name'  => $input['name'],
            'email' => $input['email']
        ];

        if (!empty($input['username'])) {
            $data['username'] = $input['username'];
        }

        if ($userModel->update($id, $data)) {
            $updatedUser = $userModel->find($id);
            unset($updatedUser['password']);
            
            return $this->respond([
                'status' => 'success',
                'message' => 'User updated successfully',
                'data' => $updatedUser
            ]);
        } else {
            return $this->fail('Failed to update user');
        }
    }

    public function changePassword($id = null)
    {
        $input = $this->request->getJSON(true) ?: $this->request->getPost();
        
        if (!$id) {
            return $this->fail('User ID is required');
        }

        $userModel = new UserModel();
        $user = $userModel->find($id);

        if (!$user) {
            return $this->failNotFound('User not found');
        }

        $rules = [
            'current_password' => 'required',
            'new_password'     => 'required|min_length[6]'
        ];

        if (!$this->validateData($input, $rules)) {
            return $this->fail($this->validator->getErrors());
        }

        if (!password_verify($input['current_password'], $user['password'])) {
            return $this->fail('Current password is incorrect', 401);
        }

        $hashedPassword = password_hash($input['new_password'], PASSWORD_DEFAULT);

        if ($userModel->update($id, ['password' => $hashedPassword])) {
            return $this->respond([
                'status' => 'success',
                'message' => 'Password changed successfully'
            ]);
        } else {
            return $this->fail('Failed to change password');
        }
    }

    public function show($id = null)
    {
        if (!$id) {
            return $this->fail('User ID is required');
        }

        $userModel = new UserModel();
        $user = $userModel->find($id);

        if (!$user) {
            return $this->failNotFound('User not found');
        }

        unset($user['password']);
        
        return $this->respond([
            'status' => 'success',
            'data' => $user
        ]);
    }
}
