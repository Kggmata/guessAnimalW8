let flickrkey = "d15b442cff6de7fd60d65408dbfbbb3c";
let flickrsecret = "f1bf8711c1c1e3ec";
let searchWord;
chocolat();
flickr();

function iterateSpecies(data) {
    data = data['Species'];
    if (data === undefined) {
        // console.log('undefined: '+data);
        return;
    }
    for (let i = 0; i < data.length; i++) {
        let name = data[i]['AcceptedCommonName'];
        if (name === undefined) {
            break;
        }
        $("#textDescription").append(
            $('<article class="record">').append(
                $('<h1>').text('Species name: ' + name),
                $('<a>').attr("href", "#").addClass("record-link").text("Load more related images").data("name", name)
            ),
        );
        updateRecord();
    }
}

function getSpecies(speciesUrl) {
    let data = JSON.parse(localStorage.getItem("speciesData"));
    $.ajax({
        url: speciesUrl,
        data: {
            'f': 'jsonp'
        },
        cache: true,
        // if get data successfully
        success: function (data) {
            console.log("Source: API");
            iterateSpecies(data);
        }

    });
}

function iterateFamilies(data) {
    if (data['Family'] === undefined) {
        // console.log('undefined: '+data);
        return;
    }
    data = data['Family'];
    for (let i = 0; i < data.length; i++) {
        // loadSpecies(speciesUrl);
        let name = data[i]['FamilyName'],
            kingdomCommonName = data[i]['KingdomCommonName'],
            className = data[i]['ClassName'],
            speciesUrl = data[i]['SpeciesUrl'].replace('http', 'https');
        // load data from family url
        // loadSpecies(speciesUrl);
        getSpecies(speciesUrl);
        // $("#textDescription").append(
        //     $('<article class="record">').append(
        //         $('<h1>').text('family name: ' + name),
        //         $('<h2>').text('kingdom common name: ' + kingdomCommonName),
        //         $('<h3>').text('class name: ' + className),
        //         $('<a>').attr("href", "#").addClass("record-link").text("Load more related images").data('searchItem', name),
        //     ),
        // );
    }
}

function loadFamilies(url) {
    let data = JSON.parse(localStorage.getItem("speciesData"));
    $.ajax({
        url: url,
        data: {
            'f': 'jsonp'
        },
        cache: true,
        // if get data successfully
        success: function (data) {
            console.log("Source: API");
            iterateFamilies(data);
        }

    });

}

function updateRecord() {
    // change the number of records dynamically to the lengh of record:visible
    $("#filter-count strong").text($(".record:visible").length);
}

function chocolat() {
    let chocapi = Chocolat(document.querySelectorAll('.chocolat-image')).api; // Initialize the chocolat plugin

    $("#filter-text").keyup(function () {
        // searchTerm letiable to store the input value from search textbox
        searchWord = $(this).val();
        let searchTerm = $(this).val();
        // print searchTerm in the console
        console.log('searchTerm: ' + searchTerm);
        // hide all record on the screen
        $(".record").hide();
        // Remove the chocolat class from the images so they don't open in the lightbox
        $(".record a").removeClass("chocolat-image");
        // let the record with searchTerm display on the screen
        $(".record:contains('" + searchTerm + "')").show();
        // Add the chocolat class to the images that match the search term i.e. visible records
        $(".record:contains('" + searchTerm + "') a").addClass("chocolat-image");
        // change the number of records dynamically to the lengh of record:visible
        $("#filter-count strong").text($(".record:visible").length);
        // Destroy the lightbox
        chocapi.destroy();
        // Re-initialise the lightbox
        chocapi = Chocolat(document.querySelectorAll('.chocolat-image')).api;
    });
}

let lastClick;

function flickr() {
    $(".record-link").click(function (e) {
        e.preventDefault();
        // let searchItem = $(this).data("searchItem");
        let searchItem = searchWord;
        // if (lastClick) {
        //     lastClick.show();
        // }
        // lastClick = $(this);
        // $(this).off().hide(); // Remove the click event from the link and hide it
        $('#animalName').text(searchItem);

        // remove elements under gallery
        $('#gallery>img').remove();
        $('#gallery>a').remove();
        $('#gallery>p').remove();
        let gallery = $('#gallery'); // Get the section we just added
        // load image from wiki
        $.ajax({
            url: "https://en.wikipedia.org/w/api.php",
            dataType: "jsonp",
            data: {
                "action": "query",
                "format": "json",
                "prop": "imageinfo",
                "iiprop": "url",
                "generator": "images",
                "titles": searchItem,
            },
            cache: true,
            success: function (results) {
                if (results.query !== undefined) {
                    $.each(results.query.pages, function (pageID, page) {
                        imageURL = page.imageinfo[0].url;
                        gallery.append($("<img>").attr("src", imageURL).attr("title", page.title)); // Add the image to the section
                    });
                }
            }
        });

        /**
         * The URL needed to search for an image - documentation at https://www.flickr.com/services/api/flickr.photos.search.html
         */
            // load image from flickr
        let flickrURL = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=" + flickrkey + "&text=" + searchItem + "&accuracy=11&format=json&nojsoncallback=1&extras=url_m,description,owner_name&per_page=10&page=1";
        console.log(1);
        $.getJSON(flickrURL, function (data) {
            console.log(data);
            $.each(data.photos.photo, function (photoKey, photoValue) {

                let flickr_image_url = "https://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=" + flickrkey + "&photo_id=" + photoValue.id + "&format=json&nojsoncallback=1";

                $.getJSON(flickr_image_url, function (data) {
                    console.log(data);

                    // Add the image to the section
                    gallery.append($("<a>").attr("href", data.photo.urls.url[0]._content).append($("<img>").attr("src", photoValue.url_m).attr("title", photoValue.title + " by " + photoValue.ownername))); // Add the image to the section

                })
            });
        })

    })
}

// input the requested data into function and process them
function iterateData(data) {
    console.log(data['Class']);
    data = data['Class'];
    // .each means iterate over each elements
    // 地图相关
    let map = L.map('map').setView([-21, 148], 7)
        , tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    // iterate through data
    for (let i = 0; i < data.length; i++) {
        // console.log(data[i]);
        let name = data[i]['KingdomName'],
            kingdomCommonName = data[i]['KingdomCommonName'],
            className = data[i]['ClassName'],
            familyNamesUrl = data[i]['FamilyNamesUrl'].replace('http', 'https');
        // load data from family url
        loadFamilies(familyNamesUrl);
        // $("#textDescription").append(
        //     $('<article class="record">').append(
        //         $('<h1>').text('family name: ' + name),
        //         $('<h2>').text('kingdom common name: ' + kingdomCommonName),
        //         $('<h3>').text('class name: ' + className),
        //         $('<a>').attr("href", "#").addClass("record-link").text("Load more related images").data('searchItem', name),
        //     ),
        // );
    }
}

$(document).ready(function () {
    // loading page
    setTimeout(function () {
        $("body").addClass("loaded");
    }, 1000);
    // load data from local cache
    let data = JSON.parse(localStorage.getItem("data"));
    //let slqData = JSON.parse(sessionStorage.getItem("slqData"));
    // if cache has data, then use cache
    if (data) {
        // if exist cache, print in console
        console.log("Source: localStorage");
        // console.log(slqData["Kingdom"][0]["KingdomName"]);
        iterateData(data);
    } else {
        $.ajax({
            url: "https://apps.des.qld.gov.au//species//?op=getclassnames&kingdom=animals",
            data: {
                'f': 'jsonp'
            },
            cache: true,
            // if get data successfully
            success: function (data) {
                console.log("Source: API");
                localStorage.setItem("data", JSON.stringify(data));
                iterateData(data);
            }
        });
    }


})
