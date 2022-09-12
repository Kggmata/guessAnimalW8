// A game of guessing animal.
// Author: Zhongkui Ma
// Date: 25/8/2022

// This function is for the initialisation of the webpage to generate a picture and information of one animal.
// Reference: W1 Workshop
$(document).ready(loadRandomRecord());

var currentAnimalID = -1;
var kingdomCommonName = null;
var allLabels = new Array();
var choosedAnimalName = null;
var rightAnimalName = null;

// Load a random record of animals.
function loadRandomRecord() {
    var max = 3;
    var min = 0;
    var randomInt = Math.floor(Math.random() * (max - min)) + min;
    animalIDs = [789, 567, 599];
    currentAnimalID = animalIDs[randomInt];

    var data = { taxonid: currentAnimalID }
    console.log(currentAnimalID)
    // var data = { taxonid: 1275}
	$.ajax({
		url: "https://apps.des.qld.gov.au/species/?op=getspeciesbyid",
		data: data,
		dataType: "json",
		cache: true,
        success: function (record) {
			processRecord(record);
		},
        error: function(error) {
            console.log("An error when load data.");
            console.log(error)
        }
	});
}

// The function implements when click the animal labels.
function clickLabel(e) {
    choosedAnimalName = $(e).text()
}

// Change another animal.
function changeAnother() {
    loadRandomRecord();
    $("#tips").empty();
    $("#animal-cover").css("display", 'block');
    $("#animal-cover").css("width", '50%');
    $("#animal-cover").css("padding-bottom", '50%');
}

// Guess the current animal's name.
function guess() {
    var isRight = rightAnimalName === choosedAnimalName;
    $("#answer").empty();
    console.log(rightAnimalName, choosedAnimalName, isRight);
    if (isRight == false) {
        $("#answer").append($("<p>").text("Not right. Tyr again!"));
    } else {
        $("#answer").append($("<p>").text("Right. Amazing!"));
        $("#animal-cover").css("display", 'none');
    }

}

// Show some tips to help guess the current animal.
function getTips() {
    $("#tips").empty();
    $("#tips").append(
        $("<p>").text(kingdomCommonName)
    );
    $("#animal-cover").css("width", '70%');
    $("#animal-cover").css("padding-bottom", '70%');
}

// Show the name of the current animal.
function showAnswer() {
    $("#answer").empty();
    $("#answer").append(
        $("<p>").text("The answer is " + kingdomCommonName + ".")
    );
    $("#animal-cover").css("display", 'none');
}

// Process the picture and information of the current animal.
function processRecord(record) {
    var species = record["Species"];
    var scientificName = species["ScientificName"];
    var commonName = species["AcceptedCommonName"];
    kingdomCommonName = species["KingdomCommonName"];
    rightAnimalName = kingdomCommonName
    var profile = species["Profile"];
    var distribution = profile["Distribution"];
    var imageInfo = species["Image"][0];
    var imageURL = imageInfo["URL"];
    var imageTitle = imageInfo["Title"];

    $("#animal-picture").css("background-image", 'url(' + imageURL + ')')

    // $("#animal-picture").empty();
    // $("#animal-picture").append(
    //     $("<img>").attr("src", imageURL, "alt", imageTitle),
    // );

    $("#animal-info").empty();
    $("#animal-info").append(
        $("<h3>").text("ScientificName: " + scientificName),
        $("<h3>").text("CommonName: " + commonName),
        $("<p>").text("Distribution:"),
        $("<p>").text(distribution)
    )

    $("#animal-names").empty();
    var labels = ["animals", "birds", "fishes", "fishes"];
    var labelIDs = [0, 1, 2]
    for (var i = 0; i < 3; i++) {
        $("#animal-names").append('<button class="button name-lable"'
            + 'id=button-' + i
            + ' type="button" onclick="clickLabel(this)">'
            + labels[i]
            + '</button > ')
    }
}

