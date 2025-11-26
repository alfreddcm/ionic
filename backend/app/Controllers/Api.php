<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use CodeIgniter\API\ResponseTrait;

class Api extends ResourceController
{
    use ResponseTrait;

    public function __construct()
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            exit(0);
        }
    }

    public function index()
    {
        $data = [
            'message' => 'Welcome to Ionic + CodeIgniter API',
            'version' => '1.0.0',
            'endpoints' => [
                'GET /api' => 'This endpoint',
                'GET /api/users' => 'Get all users',
                'POST /api/users' => 'Create new user',
                'GET /api/users/{id}' => 'Get specific user',
                'PUT /api/users/{id}' => 'Update specific user',
                'DELETE /api/users/{id}' => 'Delete specific user'
            ]
        ];

        return $this->respond($data);
    }

    public function users($id = null)
    {
        if ($id === null) {
             $users = [
                ['id' => 1, 'name' => 'John Doe', 'email' => 'john@example.com'],
                ['id' => 2, 'name' => 'Jane Smith', 'email' => 'jane@example.com'],
                ['id' => 3, 'name' => 'Bob Johnson', 'email' => 'bob@example.com']
            ];
            return $this->respond($users);
        } else {
             $user = ['id' => $id, 'name' => 'User ' . $id, 'email' => 'user' . $id . '@example.com'];
            return $this->respond($user);
        }
    }

    public function createUser()
    {
        $data = $this->request->getJSON();
        
        $response = [
            'message' => 'User created successfully',
            'user' => [
                'id' => rand(100, 999),
                'name' => $data->name ?? 'Unknown',
                'email' => $data->email ?? 'unknown@example.com'
            ]
        ];

        return $this->respond($response, 201);
    }
}
