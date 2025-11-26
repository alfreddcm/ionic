<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class TestController extends ResourceController
{
    protected $format = 'json';

    public function requestDebug()
    {
        $input = $this->request->getJSON(true) ?: $this->request->getPost();
        
        return $this->respond([
            'status' => 'success',
            'debug_info' => [
                'method' => $this->request->getMethod(),
                'content_type' => $this->request->getHeaderLine('Content-Type'),
                'raw_body' => $this->request->getBody(),
                'json_data' => $this->request->getJSON(true),
                'post_data' => $this->request->getPost(),
                'final_input' => $input,
                'input_type' => gettype($input),
                'input_count' => is_array($input) ? count($input) : 'N/A',
                'headers' => $this->request->getHeaders()
            ]
        ]);
    }
}
