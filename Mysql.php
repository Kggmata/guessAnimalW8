<?php

class MySQL {
    private static $instance = NULL;

    private function __construct() {}
    private function __clone() {}

    public static function getInstance() {
        if (!self::$instance) {

            global $mysql_user;
            global $mysql_pass;

            self::$instance = new PDO("mysql:host=localhost;port=8889;dbname=foodtrucks", $mysql_user, $mysql_pass);
            self::$instance->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        }
        return self::$instance;
    }
}

?>