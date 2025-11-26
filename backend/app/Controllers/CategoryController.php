<?php

namespace App\Controllers;

use App\Models\CategoryModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class CategoryController extends ResourceController
{
    protected $modelName = 'App\Models\CategoryModel';
    protected $format    = 'json';

    public function index()
    {
        $categoryModel = new CategoryModel();
        $categories = $categoryModel->getAllCategories();

        return $this->respond([
            'status' => 'success',
            'data' => $categories
        ]);
    }

    public function show($id = null)
    {
        $categoryModel = new CategoryModel();
        $category = $categoryModel->find($id);

        if (!$category) {
            return $this->failNotFound('Category not found');
        }

        return $this->respond([
            'status' => 'success',
            'data' => $category
        ]);
    }

    public function create()
    {
        $rules = [
            'name'  => 'required|max_length[100]',
            'icon'  => 'permit_empty|max_length[50]',
            'color' => 'permit_empty|max_length[20]'
        ];

        if (!$this->validate($rules)) {
            return $this->fail($this->validator->getErrors());
        }

        $categoryModel = new CategoryModel();
        
        $data = [
            'name'  => $this->request->getPost('name'),
            'icon'  => $this->request->getPost('icon') ?: 'help-circle',
            'color' => $this->request->getPost('color') ?: '#6B7280'
        ];

        $categoryId = $categoryModel->insert($data);

        if ($categoryId) {
            return $this->respond([
                'status' => 'success',
                'data' => ['id' => $categoryId],
                'message' => 'Category created successfully'
            ], 201);
        } else {
            return $this->fail('Failed to create category');
        }
    }

    public function update($id = null)
    {
        $categoryModel = new CategoryModel();
        
        $category = $categoryModel->find($id);
        if (!$category) {
            return $this->failNotFound('Category not found');
        }

        $rules = [
            'name'  => 'permit_empty|max_length[100]',
            'icon'  => 'permit_empty|max_length[50]',
            'color' => 'permit_empty|max_length[20]'
        ];

        if (!$this->validate($rules)) {
            return $this->fail($this->validator->getErrors());
        }

        $data = $this->request->getRawInput();
        $updated = $categoryModel->update($id, $data);

        if ($updated) {
            return $this->respond([
                'status' => 'success',
                'message' => 'Category updated successfully'
            ]);
        } else {
            return $this->fail('Failed to update category');
        }
    }

    public function delete($id = null)
    {
        $categoryModel = new CategoryModel();
        
        $category = $categoryModel->find($id);
        if (!$category) {
            return $this->failNotFound('Category not found');
        }

        $deleted = $categoryModel->delete($id);

        if ($deleted) {
            return $this->respond([
                'status' => 'success',
                'message' => 'Category deleted successfully'
            ]);
        } else {
            return $this->fail('Failed to delete category');
        }
    }
}
