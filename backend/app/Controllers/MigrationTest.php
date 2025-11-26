<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class MigrationTest extends ResourceController
{
    protected $format = 'json';

    public function migrate()
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

    public function status()
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
}
