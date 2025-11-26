<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use App\Models\UserModel;

class DatabaseTest extends ResourceController
{
    protected $format = 'json';

    public function index()
    {
        $tests = [];
        
        try {
            $db = \Config\Database::connect();
            $tests['database_connection'] = [
                'status' => 'success',
                'message' => 'Database connection successful',
                'driver' => $db->DBDriver,
                'database' => $db->database
            ];
        } catch (\Exception $e) {
            $tests['database_connection'] = [
                'status' => 'error',
                'message' => 'Database connection failed: ' . $e->getMessage()
            ];
        }

        try {
            $db = \Config\Database::connect();
            $tables = $db->listTables();
            $tests['tables'] = [
                'status' => 'success',
                'message' => 'Tables retrieved successfully',
                'tables' => $tables,
                'count' => count($tables)
            ];
        } catch (\Exception $e) {
            $tests['tables'] = [
                'status' => 'error',
                'message' => 'Failed to retrieve tables: ' . $e->getMessage()
            ];
        }

        try {
            $db = \Config\Database::connect();
            if (in_array('users', $db->listTables())) {
                $fields = $db->getFieldData('users');
                $tests['users_table_structure'] = [
                    'status' => 'success',
                    'message' => 'Users table structure retrieved',
                    'fields' => $fields
                ];
            } else {
                $tests['users_table_structure'] = [
                    'status' => 'warning',
                    'message' => 'Users table does not exist'
                ];
            }
        } catch (\Exception $e) {
            $tests['users_table_structure'] = [
                'status' => 'error',
                'message' => 'Failed to get users table structure: ' . $e->getMessage()
            ];
        }

        try {
            $userModel = new UserModel();
            $tests['user_model'] = [
                'status' => 'success',
                'message' => 'UserModel instantiated successfully',
                'table' => $userModel->getTable(),
                'primary_key' => $userModel->getPrimaryKey(),
                'allowed_fields' => $userModel->getAllowedFields()
            ];
        } catch (\Exception $e) {
            $tests['user_model'] = [
                'status' => 'error',
                'message' => 'UserModel failed: ' . $e->getMessage()
            ];
        }

        try {
            if (in_array('users', $db->listTables())) {
                $userModel = new UserModel();
                $userCount = $userModel->countAll();
                $tests['user_count'] = [
                    'status' => 'success',
                    'message' => 'User count retrieved',
                    'count' => $userCount
                ];
            } else {
                $tests['user_count'] = [
                    'status' => 'warning',
                    'message' => 'Users table does not exist'
                ];
            }
        } catch (\Exception $e) {
            $tests['user_count'] = [
                'status' => 'error',
                'message' => 'Failed to count users: ' . $e->getMessage()
            ];
        }

        try {
            $dbPath = WRITEPATH . 'database.db';
            $tests['database_file'] = [
                'status' => 'info',
                'path' => $dbPath,
                'exists' => file_exists($dbPath),
                'writable' => is_writable(dirname($dbPath)),
                'size' => file_exists($dbPath) ? filesize($dbPath) : 0
            ];
        } catch (\Exception $e) {
            $tests['database_file'] = [
                'status' => 'error',
                'message' => 'Database file check failed: ' . $e->getMessage()
            ];
        }

        return $this->respond([
            'status' => 'success',
            'message' => 'Database tests completed',
            'tests' => $tests,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    }

    public function createDatabase()
    {
        try {
            $db = \Config\Database::connect();
            $forge = \Config\Database::forge();
            
            $results = [];

            if (!$db->tableExists('users')) {
                $fields = [
                    'id' => [
                        'type'           => 'INTEGER',
                        'auto_increment' => true
                    ],
                    'name' => [
                        'type'       => 'VARCHAR',
                        'constraint' => '100',
                    ],
                    'email' => [
                        'type'       => 'VARCHAR',
                        'constraint' => '100',
                        'unique'     => true,
                    ],
                    'password' => [
                        'type'       => 'VARCHAR',
                        'constraint' => '255',
                    ],
                    'created_at' => [
                        'type' => 'DATETIME',
                        'null' => true,
                    ],
                    'updated_at' => [
                        'type' => 'DATETIME', 
                        'null' => true,
                    ],
                ];
                
                $forge->addField($fields);
                $forge->addKey('id', true);
                $forge->createTable('users');
                $results['users_table'] = 'Created successfully';
            } else {
                $results['users_table'] = 'Already exists';
            }

            if (!$db->tableExists('expenses')) {
                $expenseFields = [
                    'id' => [
                        'type'           => 'INTEGER',
                        'auto_increment' => true
                    ],
                    'user_id' => [
                        'type'       => 'INTEGER',
                    ],
                    'amount' => [
                        'type'       => 'DECIMAL',
                        'constraint' => '10,2',
                    ],
                    'description' => [
                        'type'       => 'VARCHAR',
                        'constraint' => '255',
                    ],
                    'category' => [
                        'type'       => 'VARCHAR',
                        'constraint' => '100',
                    ],
                    'date' => [
                        'type' => 'DATE',
                    ],
                    'created_at' => [
                        'type' => 'DATETIME',
                        'null' => true,
                    ],
                    'updated_at' => [
                        'type' => 'DATETIME',
                        'null' => true,
                    ],
                ];
                
                $forge->addField($expenseFields);
                $forge->addKey('id', true);
                $forge->addKey('user_id');
                $forge->createTable('expenses');
                $results['expenses_table'] = 'Created successfully';
            } else {
                $results['expenses_table'] = 'Already exists';
            }

            if (!$db->tableExists('categories')) {
                $categoryFields = [
                    'id' => [
                        'type'           => 'INTEGER',
                        'auto_increment' => true
                    ],
                    'name' => [
                        'type'       => 'VARCHAR',
                        'constraint' => '100',
                        'unique'     => true,
                    ],
                    'icon' => [
                        'type'       => 'VARCHAR',
                        'constraint' => '50',
                        'null'       => true,
                    ],
                    'color' => [
                        'type'       => 'VARCHAR',
                        'constraint' => '7',
                        'null'       => true,
                    ],
                    'created_at' => [
                        'type' => 'DATETIME',
                        'null' => true,
                    ],
                    'updated_at' => [
                        'type' => 'DATETIME',
                        'null' => true,
                    ],
                ];
                
                $forge->addField($categoryFields);
                $forge->addKey('id', true);
                $forge->createTable('categories');
                $results['categories_table'] = 'Created successfully';

                $this->insertDefaultCategories();
                $results['default_categories'] = 'Inserted successfully';
            } else {
                $results['categories_table'] = 'Already exists';
            }

            return $this->respond([
                'status' => 'success',
                'message' => 'Database creation completed',
                'results' => $results
            ]);

        } catch (\Exception $e) {
            return $this->fail('Database creation failed: ' . $e->getMessage());
        }
    }

    private function insertDefaultCategories()
    {
        $db = \Config\Database::connect();
        $categories = [
            ['name' => 'Food & Dining', 'icon' => 'fa-utensils', 'color' => '#FF6B6B'],
            ['name' => 'Transportation', 'icon' => 'fa-car', 'color' => '#4ECDC4'],
            ['name' => 'Shopping', 'icon' => 'fa-shopping-bag', 'color' => '#45B7D1'],
            ['name' => 'Entertainment', 'icon' => 'fa-film', 'color' => '#96CEB4'],
            ['name' => 'Bills & Utilities', 'icon' => 'fa-file-invoice-dollar', 'color' => '#FFEAA7'],
            ['name' => 'Healthcare', 'icon' => 'fa-heart', 'color' => '#DDA0DD'],
            ['name' => 'Education', 'icon' => 'fa-graduation-cap', 'color' => '#98D8C8'],
            ['name' => 'Travel', 'icon' => 'fa-plane', 'color' => '#F7DC6F'],
            ['name' => 'Other', 'icon' => 'fa-ellipsis-h', 'color' => '#BDC3C7']
        ];

        $builder = $db->table('categories');
        foreach ($categories as $category) {
            $category['created_at'] = date('Y-m-d H:i:s');
            $category['updated_at'] = date('Y-m-d H:i:s');
            $builder->insert($category);
        }
    }

    public function testUser()
    {
        try {
            $userModel = new UserModel();
            
            $testData = [
                'name' => 'Test User',
                'email' => 'test' . time() . '@example.com',
                'password' => 'password123'
            ];

            $userId = $userModel->insert($testData);

            if ($userId) {
                $user = $userModel->find($userId);
                unset($user['password']);

                return $this->respond([
                    'status' => 'success',
                    'message' => 'Test user created successfully',
                    'user' => $user,
                    'user_id' => $userId
                ]);
            } else {
                return $this->fail('Failed to create test user: ' . implode(', ', $userModel->errors()));
            }

        } catch (\Exception $e) {
            return $this->fail('Test user creation failed: ' . $e->getMessage());
        }
    }

    public function clearTestData()
    {
        try {
            $db = \Config\Database::connect();
            
            $builder = $db->table('users');
            $builder->like('email', 'test')->orLike('email', 'example.com');
            $deleted = $builder->delete();

            return $this->respond([
                'status' => 'success',
                'message' => 'Test data cleared',
                'deleted_users' => $deleted
            ]);

        } catch (\Exception $e) {
            return $this->fail('Failed to clear test data: ' . $e->getMessage());
        }
    }
}
