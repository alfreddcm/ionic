<?php

namespace App\Controllers;

use App\Models\UserModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class AuthController extends ResourceController
{
    protected $modelName = 'App\Models\UserModel';
    protected $format    = 'json';

    public function login()
    {
        $input = $this->request->getJSON(true) ?: $this->request->getPost();
        
        $rules = [
            'email'    => 'required|min_length[3]',
            'password' => 'required|min_length[6]'
        ];

        if (!$this->validateData($input, $rules)) {
            $errors = $this->validator->getErrors();
            return $this->fail($errors);
        }

        $userModel = new UserModel();
        $emailOrName = $input['email'];
        $password = $input['password'];

        $user = $userModel->verifyPassword($emailOrName, $password);
        
        if ($user) {
            unset($user['password']);
            
            $response = [
                'status' => 'success',
                'message' => 'Login successful',
                'data' => $user
            ];
            
            return $this->respond($response);
        } else {
            return $this->fail('Invalid email or password', 401);
        }
    }

    public function register()
    {
        $input = $this->request->getJSON(true) ?: $this->request->getPost();
        
        $rules = [
            'fullname' => 'required|min_length[2]|max_length[100]',
            'username' => 'required|min_length[3]|max_length[50]|is_unique[users.username]',
            'email'    => 'required|valid_email|is_unique[users.email]',
            'password' => 'required|min_length[6]'
        ];

        if (!$this->validateData($input, $rules)) {
            $errors = $this->validator->getErrors();
            return $this->fail($errors);
        }

        $userModel = new UserModel();
        
        $data = [
            'name'     => $input['fullname'],
            'username' => $input['username'],
            'email'    => $input['email'],
            'password' => $input['password']
        ];

        $userId = $userModel->insert($data);

        if ($userId) {
            $user = $userModel->find($userId);
            unset($user['password']);
            
            return $this->respond([
                'status' => 'success',
                'message' => 'User registered successfully',
                'data' => $user
            ], 201);
        } else {
            return $this->fail('Failed to register user');
        }
    }

    public function logout()
    {
        return $this->respond([
            'status' => 'success',
            'message' => 'Logged out successfully'
        ]);
    }
}
