<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class SetupController extends ResourceController
{
    protected $format = 'json';

    public function createDatabase()
    {
        try {
            $config = \Config\Database::connect()->getConnConfig();
            $dbName = $config['database'];
            
            $tempConfig = $config;
            $tempConfig['database'] = '';
            $db = \Config\Database::connect($tempConfig);
            
            $sql = "CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci";
            $db->query($sql);
            
            return $this->respond([
                'status' => 'success',
                'message' => "Database '{$dbName}' created successfully",
                'next_step' => 'Run migrations: php spark migrate'
            ]);

        } catch (\Exception $e) {
            return $this->fail('Database creation failed: ' . $e->getMessage());
        }
    }

    public function runMigrations()
    {
        try {
            $migrate = \Config\Services::migrations();
            
            if ($migrate->latest()) {
                return $this->respond([
                    'status' => 'success',
                    'message' => 'Migrations completed successfully',
                    'version' => $migrate->getVersion()
                ]);
            } else {
                return $this->fail('Migration failed: ' . implode(', ', $migrate->getCliMessages()));
            }
        } catch (\Exception $e) {
            return $this->fail('Migration error: ' . $e->getMessage());
        }
    }

    public function migrationStatus()
    {
        try {
            $migrate = \Config\Services::migrations();
            
            return $this->respond([
                'status' => 'success',
                'current_version' => $migrate->getVersion(),
                'cli_messages' => $migrate->getCliMessages()
            ]);
        } catch (\Exception $e) {
            return $this->fail('Status check error: ' . $e->getMessage());
        }
    }

    public function rollback()
    {
        try {
            $migrate = \Config\Services::migrations();
            
            if ($migrate->regress(0)) {
                return $this->respond([
                    'status' => 'success',
                    'message' => 'Rollback completed successfully',
                    'version' => $migrate->getVersion()
                ]);
            } else {
                return $this->fail('Rollback failed: ' . implode(', ', $migrate->getCliMessages()));
            }
        } catch (\Exception $e) {
            return $this->fail('Rollback error: ' . $e->getMessage());
        }
    }
}
