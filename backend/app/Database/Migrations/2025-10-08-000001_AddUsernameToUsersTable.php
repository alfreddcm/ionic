<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddUsernameToUsersTable extends Migration
{
    public function up()
    {
        $this->forge->addColumn('users', [
            'username' => [
                'type'       => 'VARCHAR',
                'constraint' => '50',
                'unique'     => true,
                'after'      => 'name',
            ],
        ]);
    }

    public function down()
    {
        $this->forge->dropColumn('users', 'username');
    }
}