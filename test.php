<?php
$classUrl = "https://apps.des.qld.gov.au//species//?op=getclassnames&kingdom=animals&f=json";
$cache_filename = "cache/id_animalDescription.json";
if (file_exists($cache_filename)) {
    $data = file_get_contents($cache_filename);
} else {
    echo "Does not exist - Cache";
    $data = file_get_contents($classUrl);
    $data = json_decode($data);
    foreach ($data as $key => $value) {
        foreach ($value as $item) {
            echo '<p>' . print_r($item, true) . '</p>';
        }
    }
}
$query = MySQL::getInstance()->prepare("SELECT * FROM status ORDER BY id DESC LIMIT 1");
$query->execute();
return $query->fetch();
?>
