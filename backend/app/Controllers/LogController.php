<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class LogController extends ResourceController
{
    protected $format = 'json';

    public function viewErrors()
    {
        $logPath = WRITEPATH . 'logs';
        $logFiles = [];
        
        if (is_dir($logPath)) {
            $files = scandir($logPath);
            foreach ($files as $file) {
                if (strpos($file, 'log-') === 0) {
                    $filePath = $logPath . '/' . $file;
                    $content = file_get_contents($filePath);
                    $logFiles[$file] = substr($content, -2000); // Last 2000 characters
                }
            }
        }
        
        return $this->respond([
            'status' => 'success',
            'log_path' => $logPath,
            'error_log' => ini_get('error_log'),
            'log_files' => $logFiles,
            'php_errors' => error_get_last()
        ]);
    }
}
