window.onload = () => {

  const ctMeals = document.getElementById('content-meals');
  const ctModal = document.getElementById('content-modal');

  let savedMeals = JSON.parse(localStorage.getItem('savedMeals')) || [];

  const showSavedStatus = () => {
    const cardHeart = Array.from(document.getElementsByClassName('card-heart'))

    for (let i = 0; i < savedMeals.length; i++) {
      for (let j = 0; j < cardHeart.length; j++) {

        if (savedMeals[i].idMeal == cardHeart[j].dataset.id) {
          cardHeart[j].firstElementChild.style.fill = '#ffeed7';
        }

      }
    }
  }

  const showCards = (meals) => {
    let cards = '';

    for (let meal of meals) {
      cards += `
        <div class="card">
          <div class="card__heart card-heart" data-id="${meal.idMeal}">
            <svg width="23" height="23" viewBox="0 0 24 20" fill="none" stroke="#ffeed7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z">
              </path>
            </svg>
          </div>
          <img class="card__img" src="${meal.strMealThumb}" alt="${meal.strMeal}.jpg">
          <span class="card__info">${meal.strCategory} &nbsp;${meal.strArea}</span><br />
          <a class="card__title modal-open" data-id="${meal.idMeal}">${meal.strMeal}</a>
        </div>
      `;
    }
    ctMeals.innerHTML = cards;

    showSavedStatus()
  }

  const getIngredients = (meal) => {
    let ingreds = '';

    for (let i = 1; i < 20; i++) {
      if (meal['strIngredient' + i]) {
        ingreds += `• ${meal['strMeasure'+i]} ${meal['strIngredient'+i]} <br>`;
      }
    }

    return ingreds;
  }

  const showModal = (meal) => {
    const modalEl = `
    <div class="modal">
      <div class="modal__close modal-close">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="1 -2 24 24" fill="none" stroke="#81523a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-left">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </div>
      <h1 class="modal__title">${meal.strMeal}</h1>
      <img class="modal__img" src="${meal.strMealThumb}" alt="{strMeal}.jpg">
      <span class="modal__info">${meal.strCategory}</span>
      <span class="modal__info">${meal.strArea}</span>
      <h2>Ingredients</h2>
      <p>${getIngredients(meal)}</p>
      <h2>Instructions</h2>
      <p>${meal.strInstructions}</p>
    </div>
    `;

    ctModal.innerHTML = modalEl;
  }

  const ctWrapper = document.getElementById('content-wrapper');

  const showAnimLoad = () => {
    const div = document.createElement('div');
    div.className = 'lds-dual-ring';

    ctWrapper.append(div)

    setTimeout(() => div.remove(), 1300)
  }


  const showMessage = (title, content) => { 
    const boxEl = `
    <div class="box">
      <h3 class="box__heading">${title}</h3>
      <p class="box___content">${content}</p
    </div>
    `;
    ctMeals.innerHTML = boxEl;
  }
  
  const getMeals = async (value) => {
    showAnimLoad()

    try {
      const res = await fetch(
        'https://www.themealdb.com/api/json/v1/1/search.php?s=' + value
      )
      const data = await res.json()

      showCards(data.meals)
    }

    catch (err) {
      showMessage('Error!', err) 
    }

  }

  const arr = ['chicken', 'soup', 'beef', ' '];
  const random = arr[Math.floor(Math.random() * arr.length)];
  
  getMeals(random)


  const getMealsById = async (id) => {
    showAnimLoad()

    try {
      const res = await fetch(
        'https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id
      )
      const data = await res.json()

      showModal(data.meals[0])
    }

    catch (err) {  
      showMessage('Error!', err) 
    }

  }

  const handleClick = async (evt) => {
    const { classList, dataset } = evt.target;

    if (classList.contains('modal-open')) {

      getMealsById(dataset.id)
      
      ctModal.style.visibility = 'visible';
      //Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';

    }

    if (classList.contains('modal-close')) {

      ctModal.style.visibility = 'hidden';
      document.body.style.overflow = '';

    }

    if (classList.contains('card-heart')) {

      const res = await fetch(
        'https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + dataset.id
      )
      const data = await res.json()

      const svg = evt.target.firstElementChild;
      
      if (svg.style.fill == '') {

        savedMeals.unshift(data.meals[0])
        svg.style.fill = '#ffeed7';

      } else {

        const idx = savedMeals.findIndex(meal => meal.idMeal == dataset.id)
        savedMeals.splice(idx, 1)
        svg.style.fill = '';

      }

      localStorage.setItem('savedMeals', JSON.stringify(savedMeals))
    }

  }

  window.addEventListener('click', handleClick)
  
  const formInput = document.getElementById('form-input');
  const ctHeading = document.getElementById('content-heading');
  
  const formBtn = document.getElementById('form-btn');
  formBtn.addEventListener('click', async (evt) => { 
    evt.preventDefault()

    const value = formInput.value.trim()
    if (!value) return

    showAnimLoad()

    const res = await fetch(
      'https://www.themealdb.com/api/json/v1/1/search.php?s=' + formInput.value
    )
    const data = await res.json()

    ctHeading.innerText = `There is ${data.meals.length} results of ${formInput.value}`;

    showCards(data.meals)
    formInput.value = '';

  })

  const navSaved = document.getElementById('nav-saved');
  navSaved.addEventListener('click', () => {
    showAnimLoad()

    ctHeading.innerText = 'Saved Recipes';

    if (savedMeals.length != 0) {

      showCards(savedMeals)

    } else {

     showMessage(
      'No saved meals!', 
      'Click like button to add saved meals :)'
     ) 

    }
  })

}

