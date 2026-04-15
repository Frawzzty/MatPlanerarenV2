/* VARIABLES */
/* VARIABLES */
let runApi = true;
let foodApiOffset = 0
let foodApiLimit = 202;

let allFoodItems = [] //All food from API
let selectedFoodItems = [] //User selected Items from above
let selectedItemsNutritionData = [] //Selected items nutrion data

/*  EXEMEEL FoodItem
    {
        "foodId": 1,
        "foodName": "Nöt talg"
    },
*/


/* ELEMENTS */
/* ELEMENTS */
const filterInput = document.getElementById('searchFilter')
const dropdown = document.getElementById('allFoodItemsDropDown')
const addButton = document.getElementById('addButton')
const foodCardContainer = document.getElementById('foodContainer')


/* RUN ONCE */
/* RUN ONCE */
getFood()





/* FUNCTIONS */
/* FUNCTIONS */
function addFoodCard() {
    //Return if choice is invalid
    if (dropdown.value == null || dropdown.value == "")
        return

    //Get selected dropdown item values
    foodId = dropdown.value;
    foodName = dropdown.options[dropdown.selectedIndex].text

    //Return if choice is already added
    if (selectedFoodItems.find(item => item.foodId == foodId) != null) {
        alert(foodName + " är redan tillagt")
        dropdown.selectedIndex = 0 //reset dropdown
        return;
    }

    //Add to selected items
    selectedFoodItems.push({
        foodId: foodId,
        foodName: foodName,
    })

    //Get nutrion data to nutrition array
    getNutrition(foodId)
    //Display the food card
    let selectedItem = selectedFoodItems[selectedFoodItems.length - 1];
    buildFoodCard(selectedItem.foodId, selectedItem.foodName)
    //reset dropdown
    dropdown.selectedIndex = 0
}


/* API */
function getFood() {
    let _urlApiFood = "https://dataportal.livsmedelsverket.se/livsmedel/api/v1/livsmedel?offset=" + foodApiOffset + "&limit=" + foodApiLimit + "&sprak=1"

    if (runApi == true) {
        fetch(_urlApiFood)
            .then(
                function (response) {
                    return response.json()
                }
            )
            .then(
                function (data) {
                    //console.log(data)

                    data.livsmedel.map(item => {
                        allFoodItems.push({
                            foodId: item.nummer,
                            foodName: item.namn
                        })
                    });
                }
            )
            .then(function () {
                updateDropdownItems(allFoodItems)
            })
    }
    else {
        /* allFoodItems = JSON.parse(localStorage.getItem("foodItems")); */
        console.log("runApi is set to FALSE")
    }
}


/* API */
function getNutrition(foodId) {
    let _urlApNutrition = "https://dataportal.livsmedelsverket.se/livsmedel/api/v1/livsmedel/" + foodId + "/naringsvarden?sprak=1"

    if (runApi == true) {
        fetch(_urlApNutrition)
            .then(
                function (response) {
                    return response.json()
                }
            )
            .then(
                function (data) {
                    selectedItemsNutritionData.push({
                        foodId: foodId,
                        nutritionData: {
                            kcalValue: getNutritionValueByName(data, "Energi (kcal)"), //Different method because it got the same code as Energy KJ
                            carbsValue: getNutritionValueByEuroFI(data, "CHO"),
                            fatValue: getNutritionValueByEuroFI(data, "FAT"),
                            fiberValue: getNutritionValueByEuroFI(data, "FIBT"),
                            proteinValue: getNutritionValueByEuroFI(data, "PROT"),
                        }
                    })
                }
            )
    }
    else {
        console.log("runApi is set to FALSE")
    }

    console.log(selectedItemsNutritionData);
}

function getNutritionValueByEuroFI(data, euroFIRkod) {
    let item = data.find(x => x.euroFIRkod == euroFIRkod)
    return item.varde
}

function getNutritionValueByName(data, name) {
    let item = data.find(x => x.namn == name)
    return item.varde
}

function updateNutrision(foodId) {
    let card = getFoodCard(foodId)

    try {
        let itemNutritionData;
        itemNutritionData = selectedItemsNutritionData.find(item => item.foodId == foodId)

        let sliderValue = parseInt(card.slider.value)
        card.grams.textContent = sliderValue

        card.kcal.textContent = Math.round(((itemNutritionData.nutritionData.kcalValue / 100) * sliderValue))
        card.carbs.textContent = Math.round(((itemNutritionData.nutritionData.carbsValue / 100) * sliderValue))
        card.fat.textContent = Math.round(((itemNutritionData.nutritionData.fatValue / 100) * sliderValue))
        card.fibers.textContent = Math.round(((itemNutritionData.nutritionData.fiberValue / 100) * sliderValue))
        card.protien.textContent = Math.round(((itemNutritionData.nutritionData.proteinValue / 100) * sliderValue))

        updateTotal(selectedFoodItems)
    }
    catch {
        console.log("Error when updating nutrition")
    }

}


function getFoodCard(foodId) {
    let card = document.querySelector('[data-food-id="' + foodId + '"]');

    let foodCard = {
        minimizeButton: card.querySelector('.minimizeButton'),
        foodName: card.querySelector('.foodName'),
        slider: card.querySelector('.slider'),
        grams: card.querySelector('.grams'),
        calculationDiv: card.querySelector('.calculation'),
        kcal: card.querySelector('.kcal'),
        carbs: card.querySelector('.carbs'),
        fat: card.querySelector('.fat'),
        fibers: card.querySelector('.fibers'),
        protien: card.querySelector('.protien'),
    }

    return foodCard;
}



function buildFoodCard(foodId, foodName) {
    //FoodCard
    let foodCard = document.createElement('div')
    foodCard.setAttribute("class", "food-card")
    foodCard.setAttribute("data-food-id", foodId)
    //-----------------

    //Name
    let name = document.createElement('h2')
    name.textContent = foodName
    let minimizeButton = document.createElement("button")
    minimizeButton.setAttribute("onClick","minimizeCard('"+foodId+"')" )
    minimizeButton.classList.add("minimizeButton")
    minimizeButton.textContent = "Visa mindre"
    
    foodCard.appendChild(minimizeButton)
    foodCard.appendChild(name)
    
    //-----------------

    //input div
    let inputDiv = document.createElement('div')
    inputDiv.setAttribute("class", "grams-container")

    let inputTextElement = document.createElement('span')
    inputTextElement.setAttribute("class", "variantText")
    inputTextElement.textContent = "Mängd Gram:"

    let inputGrams = document.createElement('span')
    inputGrams.setAttribute("class", "grams")
    inputGrams.textContent = "0"

    let inputUnit = document.createElement('span')
    inputUnit.textContent = "g"

    let inputSlider = document.createElement('input')
    inputSlider.setAttribute("type", "range")
    inputSlider.setAttribute("class", "slider")
    inputSlider.setAttribute("min", "0")
    inputSlider.setAttribute("max", "1000")
    inputSlider.setAttribute("step", "2")
    inputSlider.setAttribute("value", "0")
    inputSlider.setAttribute("oninput", "updateNutrision('" + foodId + "')")


    inputDiv.appendChild(inputTextElement)
    inputDiv.appendChild(inputGrams)
    inputDiv.appendChild(inputUnit)

    foodCard.appendChild(inputDiv)
    foodCard.appendChild(inputSlider)
    //-----------------

    //Calulation Div
    let calulationText = document.createElement('h3')
    calulationText.textContent = "Uträkning"
    foodCard.appendChild(calulationText)

    let calculationDiv = document.createElement('div')
    calculationDiv.setAttribute("class", "calculation")

    calculationDiv.innerHTML = getHtmlNutriotionRow("Energi (Kcal): ", "kcal", " Kcal", 0)
    calculationDiv.innerHTML += getHtmlNutriotionRow("Kolhydrater (g): ", "carbs", " g", 0)
    calculationDiv.innerHTML += getHtmlNutriotionRow("Fett, totalt (g): ", "fat", " g", 0)
    calculationDiv.innerHTML += getHtmlNutriotionRow("Fibrer (g): ", "fibers", " g", 0)
    calculationDiv.innerHTML += getHtmlNutriotionRow("Protein (g): ", "protien", " g", 0)

    foodCard.appendChild(calculationDiv)
    //-----------------

    //Remove button
    let removeButton = document.createElement("input")
    removeButton.setAttribute("type", "button")
    removeButton.setAttribute("value", "Ta bort")
    removeButton.setAttribute("class", "removeButton")
    removeButton.setAttribute("onclick", "removeCard('" + foodId + "')")

    foodCard.appendChild(removeButton)

    //Add to container
    foodCardContainer.appendChild(foodCard);
}

function getHtmlNutriotionRow(nutritionText, nutritionClass, unit, defaultValue) {
    return "<div class='variant-container'><span class='variantText'>" + nutritionText + "</span><span class='" + nutritionClass + "'>" + defaultValue + "</span><span> " + unit + "</span></div>"
}

function removeCard(foodId) {
    //Remove UI element
    let card = document.querySelector('[data-food-id="' + foodId + '"]');
    card.remove();

    //Remove stored selection
    let index = selectedFoodItems.findIndex(item => item.foodId == foodId)
    selectedFoodItems.splice(index, 1)

    //Update total caluclation
    updateTotal(selectedFoodItems)
}



function updateDropdownItems(allFoodItemsArray) {

    //Clear previous inputs
    let html = "";
    html += "<option value=''></option>"

    //If filter is empty limit to max to reduce lagg.
    let index = 0;
    let max = 200;
    allFoodItemsArray.slice(0, max).forEach(item => {

        html += "<option value='" + item.foodId + "'>" + item.foodName + "</option>"
        index++;
    });

    if (allFoodItemsArray.length > max)
        html += "<option value='' disabled>" + (allFoodItemsArray.length - max) + " st gömda. Skriv in filter för att se mer" + "</option>"

    dropdown.innerHTML = html


}

function filterDropdown() {
    let matchingFoodItems = []

    allFoodItems.forEach(item => {
        let match = item.foodName.toLowerCase().includes(filterInput.value)
        if (match == true) {
            matchingFoodItems.push(item)
        }
    });

    let wordsSorted = rankWordsORIGINAL(allFoodItems.map(item => item.foodName), filterInput.value)
    console.log(wordsSorted)
    updateDropdownItems(matchingFoodItems)

}

//SEARCH ALGO

let testItems = [
    { foodId: 1, foodName: "apple" },
    { foodId: 2, foodName: "pineapple" },
    { foodId: 3, foodName: "applepie" },
    { foodId: 4, foodName: "banana" },
    { foodId: 5, foodName: "bananabread" },
    { foodId: 6, foodName: "carrot" },
    { foodId: 7, foodName: "carrotcake" },
    { foodId: 8, foodName: "dragonfruit" },
    { foodId: 9, foodName: "fruitmix" },
    { foodId: 10, foodName: "eggplant" },
    { foodId: 11, foodName: "friedegg" },
    { foodId: 12, foodName: "fig" },
    { foodId: 13, foodName: "grape" },
    { foodId: 14, foodName: "grapefruit" },
    { foodId: 15, foodName: "grapesalad" },
    { foodId: 16, foodName: "honey" },
    { foodId: 17, foodName: "honeydew" },
    { foodId: 18, foodName: "kiwi" },
    { foodId: 19, foodName: "lemon" },
    { foodId: 20, foodName: "lemonade" }
];

function rankWordsORIGINAL(words, query) {
    query = query.toLowerCase();

    return words
        .map(word => {
            const w = word.toLowerCase();
            let score = 0;

            if (w === query) score += 100;
            if (w.startsWith(query)) score += 50;
            if (w.includes(query)) score += 20

            return { word, score };
        })
        .sort((a, b) => b.score - a.score)
        .map(item => item.word);
}

function rankWordsCustom(foodItems, query) {

    query = query.toLowerCase();

    return words
        .map(word => {
            const w = word.toLowerCase();
            let score = 0;

            if (w === query) score += 100;
            if (w.startsWith(query)) score += 50;
            if (w.includes(query)) score += 20

            return { word, score };
        })
        .sort((a, b) => b.score - a.score)
        .map(item => item.word);

}

console.log(rankWordsCustom(testItems, "apple"))


function updateTotal(selectedFoodItems) {

    let myFoodIds = selectedFoodItems.map(item => item.foodId)

    let totalKcal = 0;
    let totalcarbs = 0;
    let totalfat = 0;
    let totalfibers = 0;
    let totalprotien = 0;

    //Get and sum each foodcards metrics
    myFoodIds.forEach(foodId => {
        let card = document.querySelector('[data-food-id="' + foodId + '"]');

        totalKcal += parseFloat(card.querySelector('.kcal').textContent);
        totalcarbs += parseFloat(card.querySelector('.carbs').textContent);
        totalfat += parseFloat(card.querySelector('.fat').textContent);
        totalfibers += parseFloat(card.querySelector('.fibers').textContent);
        totalprotien += parseFloat(card.querySelector('.protien').textContent);
    })

    //SETTING UI
    let totalsCard = document.querySelector('[data-totals="' + "totals" + '"]');

    totalsCard.querySelector('.kcal').textContent = totalKcal;
    totalsCard.querySelector('.carbs').textContent = totalcarbs;
    totalsCard.querySelector('.fat').textContent = totalfat;
    totalsCard.querySelector('.fibers').textContent = totalfibers;
    totalsCard.querySelector('.protien').textContent = totalprotien;
}



function minimizeCard(foodId) {
    let foodCard = getFoodCard(foodId)

    if (foodCard.calculationDiv.classList.contains('hidden')) {
        foodCard.calculationDiv.classList.remove("hidden")
        foodCard.minimizeButton.textContent = "Visa mindre"
        
    }
    else {
        foodCard.calculationDiv.classList.add("hidden")
        foodCard.minimizeButton.textContent = "Visa mer"
    }


}