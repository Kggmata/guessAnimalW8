let flickrkey = "d15b442cff6de7fd60d65408dbfbbb3c";
let flickrsecret = "f1bf8711c1c1e3ec";
searchBox();
let recordNumber = 6;// number fo records shown in the page
let recordStack = [];// a queue to keep certain number of recordStack
let map = L.map('map').setView([-21, 148], 7)
    , tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);// initialize map
let id_animalDetails = {};
let recordTotalNum = Object.keys(id_animalDetails).length;// total number of records
let searchHistory = {};
let searchHistoryNum = 10;
let galleryHistory = {};
let galleryHistoryNum = 10;
let chocapi = Chocolat(document.querySelectorAll('.chocolat-image')).api;
// adjust style
$('#reloadRecords').click(function () {
    let classItem = $('#filterSelectionClass>option:selected').text();
    let familyItem = $('#filterSelectionFamily>option:selected').text();
    let animalItem = $('#filterSelectionAnimal>option:selected').text();
    $('.record').remove();
    loadRandomRecords(classItem, familyItem, animalItem);
});
$('#reloadAnimal').click(function () {
    let classItem = $('#filterSelectionClass>option:selected').text();
    let familyItem = $('#filterSelectionFamily>option:selected').text();
    let animalItem = $('#filterSelectionAnimal>option:selected').text();
    cleanGallery();
    loadRandomAnimal(classItem, familyItem, animalItem);
});
let $filterSelectionClass = $('#filterSelectionClass');
$filterSelectionClass.append(
    '<option>Any</option>>'
);
$filterSelectionClass.on('change', function () {
    updateFamilySelection($('#filterSelectionClass>option:selected').text());
    updateAnimalSelection($('#filterSelectionClass>option:selected').text(), $('#filterSelectionFamily>option:selected').text());

});
let $filterSelectionFamily = $('#filterSelectionFamily');
$filterSelectionFamily.append(
    '<option>Any</option>>'
);

$filterSelectionFamily.on('change', function () {
    updateAnimalSelection($('#filterSelectionClass>option:selected').text(), $('#filterSelectionFamily>option:selected').text());
});
let $filterSelectionAnimal = $('#filterSelectionAnimal');
$filterSelectionAnimal.append(
    '<option>Any</option>>'
);
let classSet = new Set(),
    familySet = new Set(),
    animalSet = new Set();

function collectClassFamilyAnimal() {
    $.each(id_animalDetails, function (key, value) {
        classSet.add(value['ClassCommonName']);
        familySet.add(value['FamilyCommonName']);
        animalSet.add(value['AcceptedCommonName']);

    });
    return {classSet, familySet, animalSet};
}


function updateSelection({classSet, familySet, animalSet}) {
    $filterSelectionClass.children().remove();
    $filterSelectionClass.append('<option>Any</option>>');
    $filterSelectionFamily.children().remove();
    $filterSelectionFamily.append('<option>Any</option>>');
    $filterSelectionAnimal.children().remove();
    $filterSelectionAnimal.append('<option>Any</option>>');
    for (let i of classSet) {
        $filterSelectionClass.append(
            '<option>' + i + '</option>>'
        );
    }
    for (let i of familySet) {
        $filterSelectionFamily.append(
            '<option>' + i + '</option>>'
        );
    }
    for (let i of animalSet) {
        $filterSelectionAnimal.append(
            '<option>' + i + '</option>>'
        );
    }
    $('#classSelectionCount').text(classSet.size + ' records');
    $('#familySelectionCount').text(familySet.size + ' records');
    $('#animalSelectionCount').text(animalSet.size + ' records');

}

function updateFamilySelection(className) {
    let familySet = new Set();
    if (className !== 'Any') {
        $.each(id_animalDetails, function (key, value) {
            if (value['ClassCommonName'] === className) {
                familySet.add(value['FamilyCommonName']);
            }
        });
    } else {
        $.each(id_animalDetails, function (key, value) {
            familySet.add(value['FamilyCommonName']);
        });
    }
    $('#filterSelectionFamily>option').remove();
    $filterSelectionFamily.append(
        '<option>Any</option>>'
    );
    for (let i of familySet) {
        $filterSelectionFamily.append(
            '<option>' + i + '</option>>'
        );
    }
    $('#familySelectionCount').text(familySet.size + ' records');
}

function updateAnimalSelection(className, familyName) {
    let animalSet = new Set();
    if (familyName !== 'Any') {
        $.each(id_animalDetails, function (key, value) {
            if (value['FamilyCommonName'] === familyName) {
                animalSet.add(value['AcceptedCommonName']);
            }
        });
    } else if (className !== 'Any') {
        $.each(id_animalDetails, function (key, value) {
            if (value['ClassCommonName'] === className) {
                animalSet.add(value['AcceptedCommonName']);
            }
        });
    } else {
        $.each(id_animalDetails, function (key, value) {
            animalSet.add(value['AcceptedCommonName']);
        });
    }
    $('#filterSelectionAnimal>option').remove();
    $filterSelectionAnimal.append(
        '<option>Any</option>>'
    );
    for (let i of animalSet) {
        $filterSelectionAnimal.append(
            '<option>' + i + '</option>>'
        );
    }
    $('#animalSelectionCount').text(animalSet.size + ' records');
}

function loading() {
    setTimeout(function () {
        $("body").addClass("loaded");
    }, 1000);
}

let initialLoadingState = 1;

function initialLoadingAnimal() {
    if (initialLoadingState && Object.keys(id_animalDetails).length > 500) {
        initialLoadingState = 0;
        loadRandomAnimal();
        loadRandomRecords()
    }
}

function findValidRandomIndex(classItem, familyItem, animalItem, keyIdAnimalDetails, randomKeyIndex) {
    let res = 0;
    if (classItem && familyItem && animalItem) {
        while (!res) {
            keyIdAnimalDetails.splice(randomKeyIndex, 1); // remove the random key from keyIdAnimalDetails
            randomKeyIndex = Math.floor(Math.random() * keyIdAnimalDetails.length); // get a random key
            res = 1;
            if (typeof keyIdAnimalDetails[randomKeyIndex] === 'undefined') {
                break;
            }
            if (classItem !== 'Any') {
                if (id_animalDetails[keyIdAnimalDetails[randomKeyIndex]]['ClassCommonName'] === classItem) {
                    res &= 1;
                } else {
                    res &= 0;
                }
            }
            if (familyItem !== 'Any') {
                if (id_animalDetails[keyIdAnimalDetails[randomKeyIndex]]['FamilyCommonName'] === familyItem) {
                    res &= 1;
                } else {
                    res &= 0;
                }
            }
            if (animalItem !== 'Any') {
                if (id_animalDetails[keyIdAnimalDetails[randomKeyIndex]]['AcceptedCommonName'] === animalItem) {
                    res &= 1;
                } else {
                    res &= 0;
                }
            }
        }
    }
    return randomKeyIndex;
}

function loadRandomAnimal(classItem, familyItem, animalItem) {
    let keyIdAnimalDetails = Object.keys(id_animalDetails);
    let randomKeyIndex = Math.floor(Math.random() * keyIdAnimalDetails.length);
    randomKeyIndex = findValidRandomIndex(classItem, familyItem, animalItem, keyIdAnimalDetails, randomKeyIndex);
    let randomAnimalTaxonID = keyIdAnimalDetails[randomKeyIndex]; // get a random taxonID
    let randomAnimalName = id_animalDetails[randomAnimalTaxonID]['AcceptedCommonName']; // get a random animal name

    $('#animalName').text(randomAnimalTaxonID + ' - ' + randomAnimalName.toUpperCase()); // set the random animal name to the page
    loadImagesFromFlickr(randomAnimalName); // load images from flickr
    loadSpeciesByID(randomAnimalTaxonID); // load species by id
    updateGalleryHistory(randomAnimalTaxonID, randomAnimalName);
}


// document ready function
$(document).ready(function () {
    // loading page
    loading();
    // load data from local cache
    // animal details: {taxonID: {AcceptedCommonName: 'abc', ClassCommonName: "insects", FamilyCommonName: "blues and coppers", KingdomCommonName: "animals"}}
    id_animalDetails = loadFromCache("id_animalDetails");
    searchHistory = loadFromCache("searchHistory");
    galleryHistory = loadFromCache("galleryHistory");
    if (!searchHistory) {
        searchHistory = {};
    }
    if (!galleryHistory) {
        galleryHistory = {};
    }
    if (id_animalDetails) {
        updateSelection(collectClassFamilyAnimal());
        loadRandomAnimal();
        loadRandomRecords();
    } else {
        // if cache is empty, then load data from API
        id_animalDetails = {};
        $.ajax({
            // classes of animal kingdom
            url: "https://apps.des.qld.gov.au//species//?op=getclassnames&kingdom=animals",
            data: {
                'f': 'jsonp'
            },
            cache: true,
            // if get data successfully
            success: function (data) {
                console.log("Source: API");
                // no cache then iterate class
                iterateClass(data);
            }
        });
    }
})
loadRandomRecordsState = 1;

function loadRandomRecords(classItem, familyItem, animalItem) {
    /* load 100 records for each species */
    // add records using key, value until 100 records
    if (loadRandomRecordsState) {
        loadRandomRecordsState = 0;
        let keyIdAnimalDetails = Object.keys(id_animalDetails); // get keys of id_animalDetails
        while ($(".record:visible").length < recordNumber) {
            let randomKeyIndex = Math.round(Math.random() * keyIdAnimalDetails.length); // get a random key
            let randomAnimalTaxonID = keyIdAnimalDetails[randomKeyIndex]; // get a random taxonID
            // while (!keyIdAnimalDetails[randomKeyIndex]) {
            //     randomKeyIndex++;
            // }
            if (classItem && familyItem && animalItem) {
                randomKeyIndex = findValidRandomIndex(classItem, familyItem, animalItem, keyIdAnimalDetails, randomKeyIndex);
                if (typeof keyIdAnimalDetails[randomKeyIndex] === "undefined") {
                    break;
                }
            }
            let randomAnimalName = id_animalDetails[keyIdAnimalDetails[randomKeyIndex]]['AcceptedCommonName'];
            let randomKingdomCommonName = id_animalDetails[keyIdAnimalDetails[randomKeyIndex]]['KingdomCommonName'];
            let randomClassCommonName = id_animalDetails[keyIdAnimalDetails[randomKeyIndex]]['ClassCommonName'];
            let randomFamilyCommonName = id_animalDetails[keyIdAnimalDetails[randomKeyIndex]]['FamilyCommonName'];
            keyIdAnimalDetails.splice(randomKeyIndex, 1); // remove the random key from keyIdAnimalDetails
            addRecord(randomAnimalTaxonID,
                randomAnimalName,
                randomKingdomCommonName,
                randomClassCommonName,
                randomFamilyCommonName);

        }
        loadRandomRecordsState = 1;
    }
}

function iterateClass(data) {
    $.each(data.Class, function (key, value) {
        let familyNamesUrl = value['FamilyNamesUrl'].replace('http', 'https'),
            className = value['ClassName'];
        // load family data for each class using familyNamesUrl
        loadFamilies(familyNamesUrl, className);
    })
}

function loadFamilies(familiesUrl) {
    $.ajax({
        url: familiesUrl,
        data: {
            'f': 'jsonp'
        },
        cache: true,
        success: function (data) {
            console.log("Source: API");
            iterateFamilies(data);
        }
    });
}

function iterateFamilies(data) {
    $.each(data.Family, function (key, value) {
        let speciesUrl = value['SpeciesUrl'].replace('http', 'https'),
            familyName = value['FamilyName'];
        loadSpecies(speciesUrl);
    })
}

function loadSpecies(speciesUrl) {
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

function iterateSpecies(data) {
    /* iterate species */
    $.each(data.Species, function (key, value) {
        // console.log(key, value);
        if (value['KingdomCommonName'] &&
            value['AcceptedCommonName'] &&
            value['ClassCommonName'] &&
            value['FamilyCommonName']) {
            let taxonId = value['TaxonID'];
            id_animalDetails[taxonId] = {
                "KingdomCommonName": value["KingdomCommonName"],
                "ClassCommonName": value["ClassCommonName"],
                "FamilyCommonName": value["FamilyCommonName"],
                "AcceptedCommonName": value["AcceptedCommonName"]
            };
            // save data to local cache
            localStorage.setItem('id_animalDetails', JSON.stringify(id_animalDetails));
            // add records using key, value until 100 records
        }
        updateSelectionAPI();
        initialLoadingAnimal();
        updateTotalRecord();
    })
}

let updateSelectionAPIState = 1;

function updateSelectionAPI() {
    if (updateSelectionAPIState) {
        updateSelectionAPIState = 0;
        collectClassFamilyAnimal();
        if (animalSet.size % 500 === 0 || animalSet.size === 3206) {
            updateSelection({classSet, familySet, animalSet});
        }
        updateSelectionAPIState = 1;
    }

}

function updateTotalRecord() {
    recordTotalNum = Object.keys(id_animalDetails).length;
    $("#recordsTotal").text(recordTotalNum);
}

function updateRecord() {
    updateTotalRecord();
    /* change the number of records dynamically to the lengh of record:visible */
    $("#recordsDisplayed").text($(".record:visible").length);
}

function searchInDataAndAdd(searchTerm) {
    /* search in id_animalDetails */
    $.each(id_animalDetails, function (key, value) {
        let regex = new RegExp(searchTerm, 'i')
        if ((key.match(regex) ||
                value.AcceptedCommonName.match(regex) ||
                value.ClassCommonName.match(regex) ||
                value.FamilyCommonName.match(regex) ||
                value.KingdomCommonName.match(regex)) &&
            $("#dropDown").children().length < recordNumber) {
            $('#dropDown').append(
                $('<div>').text('TaxonID: ' + key).append(
                    $('<div>').text('Name: ' + value.AcceptedCommonName.toUpperCase()),
                    $('<div>').text('Class: ' + value.ClassCommonName.toUpperCase()),
                    $('<div>').text('Family: ' + value.FamilyCommonName.toUpperCase()),
                    // $('<a>').attr("href", "#").addClass("record-link").text("Show in Gallery").data("taxonID", key).data("searchItem", value.AcceptedCommonName).click(flickr)
                ).data("taxonID", key).data("searchItem", value.AcceptedCommonName).click(flickr),
            )
        }
    })
}

function sortObject() {
    let sortableSearchHistory = [];
    for (let i in searchHistory) {
        sortableSearchHistory.push([i, searchHistory[i]]);
    }
    sortableSearchHistory.sort(function (a, b) {
        return b[1] - a[1];
    });
    return sortableSearchHistory;
}

function updateSearchHistory(searchTerm) {
    $.each(searchHistory, function (key, value) {
        searchHistory[key] -= 1;
    });
    searchHistory[searchTerm] = recordNumber;
}

function updateDropDownHistory(sortedSearchHistory) {
    $('#dropDownHistory').children().remove();
    $('#dropDownHistory').append(
        $('<div>').text('Search History').css('font-weight', 'bold').css('font-size', '20px')
    )
    $.each(sortedSearchHistory, function (key, value) {
        $('#dropDownHistory').append(
            $('<div>').text(value[0]).click(function () {
                    $('#filter-text').val(value[0]);
                }
            ))
    })
}

function triggerFilterBox() {
    $('#dropDown').children().remove();
    $('#dropDown').append(
        $('<div>').text('Search Results').css('font-weight', 'bold').css('font-size', '20px')
    );
    searchWord = $(this).val();
    let searchTerm = $(this).val();
    console.log('searchTerm: ' + searchTerm);
    searchInDataAndAdd(searchTerm);
    // $(".record:contains('" + searchTerm + "')").show();
    setTimeout(function () {
        $('#dropDown > div').css('opacity', 1);
        $('#dropDownHistory > div').css('opacity', 1);
        $('#galleryHistory > div').css('opacity', 1);
        $('#dropDown').css('z-index', '9999');
        $('#dropDownHistory > div').css('z-index', '9999');
        $('#galleryHistory > div').css('z-index', '9999');
    })
    $('#searchBoxRecordsDisplayed').text($('#dropDown > div').length);
    let sortedSearchHistory = sortObject();
    if (Object.keys(searchHistory).length > searchHistoryNum) {
        delete searchHistory[sortedSearchHistory.pop()[0]];
    }
    if (searchTerm !== '') {
        updateSearchHistory(searchTerm);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }
    updateDropDownHistory(sortedSearchHistory);
    updateGalleryHistoryDropdown();
}

function searchBox() {
    $("#filter-text").keyup(triggerFilterBox);
    // $("#filter-text").keydown(triggerFilterBox);
    $("#filter-text").focus(triggerFilterBox);
    $("#filter-text").blur(function () {
        setTimeout(function () {
            $('#dropDown > div').css('opacity', 0);
            $('#dropDownHistory > div').css('opacity', 0);
            $('#galleryHistory > div').css('opacity', 0);
            setTimeout(function () {
                $('#dropDown').css('z-index', '-1');
                $('#dropDownHistory > div').css('z-index', '-1');
                $('#galleryHistory > div').css('z-index', '-1');
            }, 250);
        }, 200);
    });
}

function cleanGallery() {
    // clean gallery elements
    $('#gallery').children().remove();
}

function addRecord(taxonId, AcceptedCommonName, KingdomCommonName, ClassCommonName, FamilyCommonName) {
    let record = $('<article class="record" id="record' + taxonId + '">').append(
        $('<p class="record-text">').append(
            $('<h1>').text('TaxonID: ' + taxonId),
            $('<h1>').text('Name: ' + AcceptedCommonName.toUpperCase()),
            $('<h1>').text('Kingdom: ' + KingdomCommonName.toUpperCase()),
            $('<h1>').text('Class: ' + ClassCommonName.toUpperCase()),
            $('<h1>').text('Family: ' + FamilyCommonName.toUpperCase()),
            // $('<a>').attr("href", "#").addClass("record-link").text("Show in Gallery").data("taxonID", taxonId).data("searchItem", AcceptedCommonName).attr('z-index', '1')
            // ,
            $('<p class="record-image"' + "id=" + taxonId + ' > ')
        )
    ).data("taxonID", taxonId).data("searchItem", AcceptedCommonName).click(flickr);
    let flickrURL = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=" + flickrkey + "&text=" + AcceptedCommonName + "&accuracy=11&format=json&nojsoncallback=1&extras=url_m,description,owner_name&per_page=10&page=1&sort=relevance";
    $.getJSON(flickrURL, function (data) {
        if (data.photos.pages > 0) {
            $.each(data.photos.photo, function (photoKey, photoValue) {
                let flickr_image_url = "https://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=" + flickrkey + "&photo_id=" + photoValue.id + "&format=json&nojsoncallback=1";
                let $recordTaxonID = $('#record' + taxonId);
                $.getJSON(flickr_image_url, function (data) {
                    if ($recordTaxonID.css('background-image') === 'none') {
                        $recordTaxonID.css('background-image', 'url(' + photoValue.url_m + ')');
                    }
                    $('#' + taxonId).append($("<a>").attr("href", data.photo.urls.url[0]._content).append($("<img>").attr("src", photoValue.url_m).attr("title", photoValue.title + " by " + photoValue.ownername))); // Add the image to the section

                })
            });
        } else {
            $("#record" + taxonId + '>').css('opacity', 1);
        }
    })
    // save added record to stack
    recordStack.push(record);
    $("#textDescription").append(
        record
    );
    updateRecord();
}

function loadSpeciesByID(taxonID) {
    let speciesByIDUrl = 'https://apps.des.qld.gov.au/species/?op=getspeciesbyid&taxonid=' + taxonID;
    $.ajax({
        url: speciesByIDUrl,
        data: {
            'f': 'jsonp'
        },
        cache: true,
        // if get data successfully
        success: function (data) {
            iterateSpeciesByID(data);
        }
    });
}

function iterateSpeciesByID(data) {
    data = data["Species"];
    let description = data["Profile"],
        name = data['AcceptedCommonName'];
    if (JSON.stringify(description) !== '{}') {
        // console.log(description);
        $('#description').children().remove()
        $('#description').append('<h2>From QLD Wild Life API</h2>');
        $.each(description, function (key, value) {
            $('#description').append(
                '<p>' + key + ': ' + value + '<\p>'
            );
        })
        updateMap(description, name);
    } else {
        $.ajax({
            url: "https://en.wikipedia.org/w/api.php",
            dataType: "jsonp",
            data: {
                "action": "opensearch",
                "search": name,
                'profile': 'engine_autoselect'
            },
            cache: true,
            success: function (results) {

                if (results[1].length !== 0) {
                    let wikiUrl = results[3][0];
                    console.log(getWikiTitle(wikiUrl));
                    loadWiki(getWikiTitle(wikiUrl));
                    if (results.query !== undefined) {
                    }
                } else {
                    updateDescription('No description found', 'QLD Wildlife API and Wikipedia');
                }
            }
        });
    }
}

function updateDescription(description, source) {
    // console.log(description);
    $('#description').children().remove();
    $('#description').append(
        '<h2>From ' + source + '</h2>',
        '<p>' + description + '</p>'
    );
}

function updateMap(description, searchItem) {
    if (!description) {
        map.setView([-21, 148], 7);
        return;
    }
    let latitude = (description["MinimumLatitude"] + description["MaximumLatitude"]) / 2;
    let longitude = (description["MinimumLongitude"] + description["MaximumLongitude"]) / 2;
    if (!isNaN(longitude) && !isNaN(latitude)) {
        map.setView([latitude, longitude]);
        map.setZoom(13);
        let marker = L.marker([latitude, longitude]).addTo(map)
        popupText = searchItem
        marker.bindPopup(popupText).openPopup()
    }
}

function loadImagesFromFlickr(searchItem) {
    /**
     * The URL needed to search for an image - documentation at https://www.flickr.com/services/api/flickr.photos.search.html
     */
    // load image from flickr
    cleanGallery();
    let flickrURL = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=" + flickrkey + "&text=" + searchItem + "&accuracy=11&format=json&nojsoncallback=1&extras=url_m,description,owner_name&per_page=10&page=1&sort=relevance",
        gallery = $('#gallery');
    $.getJSON(flickrURL, function (data) {
        $.each(data.photos.photo, function (photoKey, photoValue) {

            let flickr_image_url = "https://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=" + flickrkey + "&photo_id=" + photoValue.id + "&format=json&nojsoncallback=1";

            $.getJSON(flickr_image_url, function (data) {
                // console.log(data);
                // Add the image to the section
                gallery.append(
                    $("<a>").attr("href", data.photo.urls.url[0]._content).append(
                        $("<div>").addClass("gallery-item").append(
                            $("<img>").attr("src", photoValue.url_m).attr("title", photoValue.title + " by " + photoValue.ownername).hover(function () {
                                    $(this).parent().children('p').animate({
                                        opacity: '1',
                                    }, 200);
                                    // show/hide the text
                                },
                                function () {
                                    $(this).parent().children('p').animate({opacity: '0'}, 200);
                                    // show/hide the text
                                }),
                            $("<p>").text(photoValue.title + " by " + photoValue.ownername)
                        ))
                ); // Add the image to the section

            })
        });
    })
}

function getWikiTitle(wikiUrl) {
    return wikiUrl.replace('https://en.wikipedia.org/wiki/', '');

}

function descriptionRE(data) {
    return data;
}

function iterateWikiContent(results) {
    $.each(results.query.pages, function (key, value) {
        if (value.revisions !== undefined) {
            let data = value.revisions[0]["*"];
            if (data.match(/#REDIRECT /)) {
                console.log('wiki content redirect');
                data = (/\[.*\]/).exec(data)[0].replaceAll('[', '').replaceAll(']', '');
                loadWiki(data);
            } else {
                updateDescription(descriptionRE(data), 'Wikipedia');
            }
        }
    })
}

function loadWiki(wikiTitle) {
    $.ajax({
        url: "https://en.wikipedia.org/w/api.php",
        dataType: "jsonp",
        data: {
            "action": "query",
            "prop": "revisions",
            "format": "json",
            "rvprop": "content",
            "titles": wikiTitle
        },
        cache: true,
        success: function (results) {
            if (results.query !== undefined) {
                if (!results.query.pages["-1"]) {
                    console.log("wiki load successfully")
                    iterateWikiContent(results);
                }
            }
        }
    });
}

function updateGalleryHistoryDropdown() {
    let sortedGalleryHistory = [];
    $.each(galleryHistory, function (key, value) {
        sortedGalleryHistory.push([key, galleryHistory[key]]);
    })
    sortedGalleryHistory.sort(function (a, b) {
        return b[1] - a[1];
    });
    if (sortedGalleryHistory.length > 10) {
        delete galleryHistory[sortedGalleryHistory.pop()[0]];
    }
    $('#galleryHistory').children().remove();
    $('#galleryHistory').append(
        $('<div>').text('Gallery History').css('font-weight', 'bold').css('font-size', '20px')
    )
    $.each(sortedGalleryHistory, function (key, value) {
        let taxonId = value[0].split(',')[0];
        let searchItem = value[0].split(',')[1];
        $('#galleryHistory').append(
            $('<div>').text(value[0]).data("taxonID", taxonId).data("searchItem", searchItem).click(flickr))
    })
}

function updateGalleryHistory(taxonID, searchItem) {
    $.each(galleryHistory, function (key, value) {
        galleryHistory[key] -= 1;
    })
    galleryHistory[[taxonID, searchItem]] = galleryHistoryNum;
    updateGalleryHistoryDropdown();
    localStorage.setItem("galleryHistory", JSON.stringify(galleryHistory));
}

function flickr(e) {
    e.preventDefault();
    let searchItem = $(this).data("searchItem"),
        taxonID = $(this).data("taxonID");
    updateGalleryHistory(taxonID, searchItem);
    console.log('taxonId', taxonID);
    console.log(searchItem);
    $('#animalName').text(taxonID + ' - ' + searchItem.toUpperCase());
    loadSpeciesByID(taxonID);
    cleanGallery();
    loadImagesFromFlickr(searchItem);
}

function loadFromCache(item) {
    return JSON.parse(localStorage.getItem(item));
}




