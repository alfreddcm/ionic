<?php

namespace App\Models;

use CodeIgniter\Model;

class CategoryModel extends Model
{
    protected $table            = 'categories';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $protectFields    = true;
    protected $allowedFields    = ['name', 'icon', 'color'];

    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
    protected $deletedField  = 'deleted_at';

    protected $validationRules      = [
        'name'  => 'required|max_length[100]',
        'icon'  => 'permit_empty|max_length[50]',
        'color' => 'permit_empty|max_length[20]'
    ];
    protected $validationMessages   = [];
    protected $skipValidation       = false;
    protected $cleanValidationRules = true;

    protected $allowCallbacks = true;
    protected $beforeInsert   = [];
    protected $afterInsert    = [];
    protected $beforeUpdate   = [];
    protected $afterUpdate    = [];
    protected $beforeFind     = [];
    protected $afterFind      = [];
    protected $beforeDelete   = [];
    protected $afterDelete    = [];

    /**
     * Get all categories ordered by name
     */
    public function getAllCategories()
    {
        return $this->orderBy('name', 'ASC')->findAll();
    }

    /**
     * Get category by name (case insensitive)
     */
    public function getCategoryByName($name)
    {
        return $this->where('LOWER(name)', strtolower($name))->first();
    }

    /**
     * Get categories with expense counts
     */
    public function getCategoriesWithCounts($userId = null)
    {
        $builder = $this->db->table('categories c');
        $builder->select('c.*, COUNT(e.id) as expense_count');
        $builder->join('expenses e', 'e.category_id = c.id', 'left');
        
        if ($userId) {
            $builder->where('e.user_id', $userId);
        }
        
        $builder->groupBy('c.id');
        $builder->orderBy('c.name', 'ASC');
        
        return $builder->get()->getResultArray();
    }

    /**
     * Get most used categories for a user
     */
    public function getMostUsedCategories($userId, $limit = 5)
    {
        $builder = $this->db->table('categories c');
        $builder->select('c.*, COUNT(e.id) as usage_count');
        $builder->join('expenses e', 'e.category_id = c.id', 'inner');
        $builder->where('e.user_id', $userId);
        $builder->groupBy('c.id');
        $builder->orderBy('usage_count', 'DESC');
        $builder->limit($limit);
        
        return $builder->get()->getResultArray();
    }
}
