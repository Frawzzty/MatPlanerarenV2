let runApi = true;
let foodApiOffset = 0
let foodApiLimit = 10;

let allFoodItems = [{ foodId: 55, foodName: "Göstas äckelpeckel" }]
let selectedFoodItems = []
let nutritionData = []

/*  EXEMEEL FoodItem
    {
        "foodId": 1,
        "foodName": "Nöt talg"
    },
*/

const filterInput = document.getElementById('searchFilter')
const dropdown = document.getElementById('allFoodItemsDropDown')
const addButton = document.getElementById('addButton')
const foodCardContainer = document.getElementById('foodContainer')


getFood()
updateDropdownItems(allFoodItems);

function addFoodCard() {
    if (dropdown.value == null || dropdown.value == "")
        return

    foodId = dropdown.value;
    foodName = dropdown.options[dropdown.selectedIndex].text

    if (selectedFoodItems.find(item => item.foodId == foodId) != null) {
        alert(foodName + " är redan tillagt")
        dropdown.selectedIndex = 0 //reset dropdown
        return;
    }

    console.log("foodId: " + dropdown.value)
    console.log("foodName: " + dropdown.options[dropdown.selectedIndex].text)

    selectedFoodItems.push({
        foodId: foodId,
        foodName: foodName,
    })

    getNutrition(foodId)
    buildFoodCard(selectedFoodItems[selectedFoodItems.length - 1].foodId, selectedFoodItems[selectedFoodItems.length - 1].foodName)

    dropdown.selectedIndex = 0 //reset dropdown
}

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
                localStorage.setItem('foodItems', JSON.stringify(allFoodItems))
                updateDropdownItems(allFoodItems)
            })
    }
    else {
        allFoodItems = JSON.parse(localStorage.getItem("foodItems"));
        console.log("runApi is set to FALSE")
    }

    console.log("allFoodItems")
    console.log(allFoodItems)

}

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
                    nutritionData.push({
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

    console.log(nutritionData);
}

function getNutritionValueByEuroFI(data, euroFIRkod) {
    let item = data.find(x => x.euroFIRkod == euroFIRkod)
    return item.varde
}

function getNutritionValueByName(data, name) {
    let item = data.find(x => x.namn == name)
    return item.varde
}



function getSelectedGrams(foodId) {
    let sliderId = "gramSlider" + foodId

    try {
        let slider = document.getElementById(sliderId)
        //console.log(slider.value)
        return slider.value;
    }
    catch {
        console.log("Could not find slider: " + sliderId)
    }

}



function updateNutrision(foodId) {
    let card = document.querySelector('[data-food-id="' + foodId + '"]');

    let slider = card.querySelector('.slider');
    let grams = card.querySelector('.grams');

    let kcal = card.querySelector('.kcal');
    let carbs = card.querySelector('.carbs');
    let fat = card.querySelector('.fat');
    let fibers = card.querySelector('.fibers');
    let protien = card.querySelector('.protien');


    try {
        let itemNutritionData;
        itemNutritionData = nutritionData.find(item => item.foodId == foodId)
        console.log(itemNutritionData)

        let sliderValue = parseInt(slider.value)
        grams.textContent = sliderValue

        kcal.textContent = Math.round(((itemNutritionData.nutritionData.kcalValue / 100) * sliderValue)) //
        carbs.textContent = Math.round( ((itemNutritionData.nutritionData.carbsValue / 100) * sliderValue))
        fat.textContent = Math.round(((itemNutritionData.nutritionData.fatValue / 100) * sliderValue))
        fibers.textContent = Math.round(((itemNutritionData.nutritionData.fiberValue / 100) * sliderValue))
        protien.textContent = Math.round(((itemNutritionData.nutritionData.proteinValue / 100) * sliderValue))

        updateTotal(selectedFoodItems)
    }
    catch {
        console.log("Error when updating things")
    }

    //console.log(slider.value)

}



function getFoodCard(foodId) {
    let card = document.querySelector('[data-food-id="' + foodId + '"]');

    let foodName = card.querySelector('.foodName');
    let slider = card.querySelector('.slider');
    let grams = card.querySelector('.grams');

    let kcal = card.querySelector('.kcal');
    let carbs = card.querySelector('.carbs');
    let fat = card.querySelector('.fat');
    let fibers = card.querySelector('.fibers');
    let protien = card.querySelector('.protien');

    let foodCard = {
        foodName: foodName,
        slider: slider,
        grams: grams,
        kcal: kcal,
        carbs: carbs,
        fat: fat,
        fibers: fibers,
        protien: protien
    }

    return foodCard;
}

let _foodCardTemplate = {
    foodName: null,
    slider: null,
    grams: null,
    kcal: null,
    fat: null,
    fibers: null,
    protien: null,
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
    calculationDiv.innerHTML =  "<div class='variant-container'><span class='variantText'>Energi (Kcal): </span>       <span class='kcal'>0</span>     <span> Kcal</span></div>"
    calculationDiv.innerHTML += "<div class='variant-container'><span class='variantText'>Kolhydrater (g): </span>     <span class='carbs'>0</span>    <span> g</span></div>"
    calculationDiv.innerHTML += "<div class='variant-container'><span class='variantText'>Fett, totalt (g): </span>    <span class='fat'>0</span>      <span> g</span></div>"
    calculationDiv.innerHTML += "<div class='variant-container'><span class='variantText'>Fibrer (g): </span>          <span class='fibers'>0</span>   <span> g</span></div>"
    calculationDiv.innerHTML += "<div class='variant-container'><span class='variantText'>Protein (g): </span>         <span class='protien'>0</span>  <span> g</span></div>"

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
    dropdown.innerHTML = "<option value=''></option>" //Add empty row

    allFoodItemsArray.forEach(item => {
        dropdown.innerHTML += "<option value='" + item.foodId + "'>" + item.foodName + "</option>"
    });
}

function filterDropdown() {
    /* dropdown */
    /* filterInput */
    let filterText = filterInput.value

    let matchingFoodItems = []

    allFoodItems.forEach(item => {
        let result = item.foodName.toLowerCase().includes(filterText)
        if(result == true){
            matchingFoodItems.push(item)
        }
    });

    updateDropdownItems(matchingFoodItems)
}


function updateTotal(selectedFoodItems){

    let myFoodIds = selectedFoodItems.map(item => item.foodId)
    console.log("myFoodIds: " + myFoodIds)

    let totalKcal = 0;
    let totalcarbs = 0;
    let totalfat = 0;
    let totalfibers = 0;
    let totalprotien = 0;

    //Getting DATA
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

    let foodName = totalsCard.querySelector('.foodName');
    let slider = totalsCard.querySelector('.slider');
    let grams = totalsCard.querySelector('.grams');

    totalsCard.querySelector('.kcal').textContent = totalKcal;
    totalsCard.querySelector('.carbs').textContent = totalcarbs;
    totalsCard.querySelector('.fat').textContent = totalfat;
    totalsCard.querySelector('.fibers').textContent = totalfibers;
    totalsCard.querySelector('.protien').textContent = totalprotien;
    /* 
    let carbs = totalsCard.querySelector('.carbs');
    let fat = totalsCard.querySelector('.fat');
    let fibers = totalsCard.querySelector('.fibers');
    let protien = totalsCard.querySelector('.protien'); */

}



