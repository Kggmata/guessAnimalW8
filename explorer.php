<?php include('header.php'); ?>
<body>
<header>
    <div id="banner">
        <img id="logo" src="imgs\logo.png" alt="LOGO">
        <h1>Guess Who Am I</h1>
    </div>

    <nav>
        <ul>
            <a href="index.html">
                <li>Home</li>
            </a>
            <a href="game.html">
                <li>Game</li>
            </a>
            <a href="ranks-prizes.html">
                <li>Ranks & Prizes</li>
            </a>
            <a href="explore.html">
                <li>Explore</li>
            </a>
        </ul>
    </nav>
</header>
<?php
$classUrl = "https://apps.des.qld.gov.au//species//?op=getclassnames&kingdom=animals&f=json";
$cache_filename = "cache/id_animalDescription.json";
if (file_exists($cache_filename)) {
    $data = file_get_contents($cache_filename);
} else {
    echo "Does not exist - Cache";
    $data = file_get_contents($classUrl);
    echo '<p>' . $data . '</p>';
}
?>
<main>
    <body>
    <!--    loading animation-->
    <div id="loading"></div>
    <!--title-->
    <h1 id="animalName">
        Animal Name
    </h1>
    <!--    animal description-->
    <div id="animalDescription">
        <!--    search textbox-->
        <form id="filter">
            <div id="filterBox">
                <input id="filter-text" type="text" placeholder="Filter by Text" value="">
            </div>
            <p id="filter-count"><strong>0</strong> records displayed.</p>
        </form>
        <p>
            Gallery Images
        </p>
        <ul id="gallery" class="scrollable">
        </ul>
        <h1>
            Description
        </h1>
        <p id="description"></p>
        <hr>
        <!--    dataset api-->
        <div id="textDescription&Map">
            <section id="textDescription">
                <!--    record boxes-->
                <h1>Records from wild animal API</h1>
            </section>
            <div id="map">
                <div>Animal Distribution Map</div>
            </div>
        </div>
    </div>
    </body>
</main>

<?php include('footer.php'); ?>

