

let foodItems = [{foodId: 123, foodName: "Gås i panna"}]
let foodCardsElements = []

const foodContainer = document.getElementById('food-container')
function addFoodCard(foodItem) {

    let foodCard = document.createElement('div')
    foodCard.setAttribute("class", "food-card")

    let foodName = document.createElement('h3')
    foodName.textContent = foodItem.foodName
    foodCard.appendChild(foodName)

    foodContainer.appendChild(foodCard)



    



    let foodCardElement = {
        eFoodName: foodName
    }

    foodCardsElements.push(foodCardElement)

}

addFoodCard(foodItems[0])
foodCardsElements[0].eFoodName.textContent = "TTest"


