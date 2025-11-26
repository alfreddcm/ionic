<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class DatabaseSetup extends ResourceController
{
    protected $format = 'json';

    public function setup()
    {
        $db = \Config\Database::connect();
        
        try {
            $forge = \Config\Database::forge();
            
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
            
            if (!$db->tableExists('users')) {
                $forge->createTable('users');
                $message = 'Users table created successfully';
            } else {
                $message = 'Users table already exists';
            }
            
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
            
            if (!$db->tableExists('expenses')) {
                $forge->createTable('expenses');
                $message .= ' and Expenses table created successfully';
            } else {
                $message .= ' and Expenses table already exists';
            }
            
            return $this->respond([
                'status' => 'success',
                'message' => $message
            ]);
            
        } catch (\Exception $e) {
            return $this->fail('Database setup failed: ' . $e->getMessage());
        }
    }
}
