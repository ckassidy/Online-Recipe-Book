//checks which page is active through bodyId
document.addEventListener("DOMContentLoaded", () =>{
const bodyId = document.body.id;

//redirecting to login
const currentUser = JSON.parse(localStorage.getItem("sandokUser"));
if (!currentUser && bodyId !== "login-page" && bodyId !== "signup-page"){
    window.location.href = "login.html"; return;}

if (bodyId === "login-page"){loginPage();}
else if (bodyId === "signup-page"){signupPage();}
else if (bodyId === "profile-page"){profilePage();}
else if (bodyId === "browse-page"){browsePage();}
else if (bodyId === "browse-page"){browsePage();}
else if (bodyId === "added-page"){newRecipePage();}
else if (bodyId === "recipe-page"){recipePage();}
});

//login page
function loginPage(){
    const loginForm = document.getElementById("login-form");
    const emailInput = document.getElementById("login-email");
    const passwordInput = document.getElementById("login-password");
    const msgBox = document.getElementById("login=message");

    //sends login info to server
    loginForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        const res = await fetch("/login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({email, password})
        });

        const data = await res.json();
        if (res.ok) {
            localStorage.setItem("sandokUser", JSON.stringify(data.user));
            window.location.href = "index.html"; //redirects to index if credentials are correct
        } else {
            msgBox.textContent = data.error || "Login failed."; //error message
            msgBox.classList.remove("hidden");
        }
    });
}

//signup page
function signupPage(){
    const signupForm = document.getElementById("signup-form");
    const nameInput = document.getElementById("signup-name");
    const emailInput = document.getElementById("signup-email");
    const passwordInput = document.getElementById("signup-password");
    const confirmInput = document.getElementById("signup-confirm");
    const msgBox = document.getElementById("signup-message");

    signupForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const confirmPassword = confirmInput.value.trim();

        if (password !== confirmPassword){
            msgBox.textContent = "Passwords do not match.";
            msgBox.classList.remove("hidden");
        }

        const res = await fetch("/signup", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({name, email, password})
        });

        const data = await res.json();
        if (res.ok){
            localStorage.setItem("sandokUser", JSON.stringify(data.user));
            window.localStorage.href = "index.html";
        } else {
            msgBox.textContent = data.error || "Signup failed.";
            msgBox.classList.remove("hidden");
        }
    })
}

//home page
async function homePage() {
    const popularList = document.getElementById("popular-list");
    if (!popularList) return;

    const res = await fetch(API);
    const recipes = await res.json();

    //gets the first three recipes saved in the database
    popularList.innerHTML = "";
    recipes.slice(0,3).forEach(r =>{
        popularList.appendChild(createRecipeCard(r));
    })
}

//browse page
async function browsePage() {
    const resultsList = document.getElementById("results-list");
    const resultsCount = document.getElementById(results-count);
    const emptyBox = document.getElementById("empty-box");
    const filterButtons = document.querySelectorAll("filter-button");
    const searchForm = document.getElementById("search-form");        
    const searchInput = document.getElementById("search-input");

    //getting query params from the URL
    const urlParams = new URLSearchParams(window.location.search);
    let currentCourse = urlParams.get("course") || "";
    let currentIngredient = urlParams.get("ingredient") || "";
    let searchQuery = urlParams.get("q") || "";

    //shows search item from URL params in the search input box
    if (searchInput && searchQuery) searchInput.value = searchQuery;

    //fetches info from API and displays it
    async function fetchAndDisplay() {
        let queryParams = [];
        if (currentCourse) queryParams.push(`course=${encodeURIComponent(currentCourse)}`);
        if (currentIngredient) queryParams.push(`ingredient=${encodeURIComponent(currentIngredient)}`);
        if (searchQuery) queryParams.push(`q=${encodeURIComponent(searchQuery)}`);

        let endpoint = API;
        if(queryParams.length > 0) endpoint += "?" + queryParams.join("&");
        const res = await fetch(endpoint);

        const recipes = await res.json();
        resultsList.innerHTML = "";
        resultsCount.textContent = `(${recipes.length} Recipes)`
        if (recipes.length === 0){
            emptyBox.classList.remove("hidden");
        } else {
            emptyBox.classList.add("hidden");
            reciped.forEach(r => resultsList.appendChild(createRecipeCard(r)));
        }
    }

    //loops through filter options and only marks the one clicked by user as "active"
    filterButtons.array.forEach(button => {
        button.addEventListener("click", (e) =>{
            const type = e.target.getAttribute("data-type");
            const val = e.target.getAttribute("data-value");
            document.querySelectorAll(`.filter-button[data-type="${type}"]`).forEach(b => 
                b.classList.remove("active"));
            e.target.classList.add("active");

            if (type === "course"){currentCourse = val};
            if (type === "ingredient"){currentIngredient = val};

            fetchAndDisplay();
        });
    });

    searchForm?.addEventListener("submit", (e) => { //? to avoid crashing
        e.preventDefault(); //
        searchQuery = searchInput.value.trim(); //trim for whitespace
        fetchAndDisplay();
    });
}

//add/edit page
async function addEditPage() {
    const form = document.getElementById("recipe-form");
    const heading = document.getElementById("form-heading");
    const titleEl = document.getElementById("title");
    const courseEl = document.getElementById("course");
    const ingredientEl = document.getElementById("ingredient"); //main ingredient
    const ingredientsEl = document.getElementById("ingredients"); //list of ingredients for the recipe
    const instructionsEl = document.getElementById("instructions");

    //editting recipe details
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get("id");
    if (editId){
        heading.textContent = "Edit Recipe";
        const res = await fetch(`${API}/${editId}`);
        const recipe = await res.json();
        titleEl.value = recipe.title;
        courseEl.value = recipe.course;
        ingredientEl.value = recipe.ingredient;
        ingredientsEl.value = recipe.ingredients;
        instructionsEl.value = recipe.instructions;
    }

    //adding new
    form?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = {
            title: titleEl.value,
            course: courseEl.value,
            ingredient: ingredientEl.value,
            image: "",
            ingredients: ingredientsEl.value,
            instructions: instructionsEl.value
        };

        let response;
        if(editId){ //for editting existing recipe
            response = await fetch(`${API}/${editId}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data)
            });
        } else { //for adding new recipe
            response = await fetch(API, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data)
            }); 
        }

        const saved = await response.json();
        window.location.href = `recipe.html?id=${saved._id}`; //redirects to new page of added recipe
    })
}

//newly added recipe page, where recipes can be deleted/edited
async function newRecipePage() {
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get("id");

    if(!recipeId){ //if there is no recipe id, redirected back to browse page
        window.localStorage.href = "browse.html";
        return;
    }
    
    const titleEl = document.getElementById("recipe-title");
    const imgEl = document.getElementById("recipe-img");
    const ingredientsListEl = document.getElementById("ingredient-list");
    const instructionsListEl = document.getElementById("instruction-list");
    const editBtn = document.getElementById("edit-btn");
    const deleteBtn = document.getElementById("delete-btn");
    const deleteModal = document.getElementById("delete-modal");
    const cancelDeleteBtn = document.getElementById("cancel-delete");
    const confirmDeleteBtn = document.getElementById("confirm-delete");

    const res = await fetch(`${API}/${recipeId}`);
    const r = await res.json();

    //gets title and attached image
    titleEl.textContent = r.title;
    if (imgEl && r.image){imgEl.src = r.image};

    //separates ingredients per line
    ingredientsListEl.innerHTML = "";
    r.ingredients.split("\n").forEach(item => {
        if(item.trim()){
            const li = document.createElement("li");
            li.textContent = item.trim();
            ingredientsEl.appendChild(li);
        }
    });

    //separates ingredients per line
    instructionsListEl.innerHTML = "";
    r.instructions.split("\n").forEach(step => {
        if (step.trim()){
            const li = document.createElement("li");
            li.textContent = step.trim();
            instructionsListEl.appendChild(li);
        }
    });

    if (editBtn){editBtn.href = `add-recipe.html?id=${r._id}`};

    deleteBtn?.addEventListener("click", () => deleteModal.classList.remove("hidden"));
    cancelDeleteBtn?.addEventListener("click", () => deleteModal.classList.add("hidden"));
    confirmDeleteBtn?.addEventListener("click", async () => {
        await fetch(`${API}/${recipeId}`, {method; "DELETE"});
        window.location.href = "profile.html";
    });
}

//recipe page, detailed view with comsec
async function recipePage() {
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get("id");

    if(!recipeId){
        window.location.href = "browse.html";
        return;
    }

    const titleEl = document.getElementById("recipe-title");
    const courseEl = document.getElementById("recipe-course");
    const ingredientEl = document.getElementById("recipe-ingredient");
    const imgEl = document.getElementById("recipe-img");
    const ingredientListEl = document.getElementById("ingredient-list");
    const instructionListEl = document.getElementById("instruction-list");
    const commentCountEl = document.getElementById("comment-count");
    const commentListEl = document.getElementById("comment-list");
    const commentForm = document.getElementById("comment-form");

    async function loadDetails() {
        const res = await fetch(`${API}/${recipeId}`);
        const r = await res.json();

        titleEl.textContent = r.title;
        if (imgEl && r.image){imgEl.src = r.image};
        if (courseEl){courseEl.textContent = r.course};
        if (ingredientEl){ingredientEl.textContent = r.ingredient};


        //separates ingredients per line
        ingredientsListEl.innerHTML = "";
        r.ingredients.split("\n").forEach(item => {
            if(item.trim()){
                const li = document.createElement("li");
                li.textContent = item.trim();
                ingredientsEl.appendChild(li);
            }
        });

        //separates ingredients per line
        instructionsListEl.innerHTML = "";
        r.instructions.split("\n").forEach(step => {
            if (step.trim()){
                const li = document.createElement("li");
                li.textContent = step.trim();
                instructionsListEl.appendChild(li);
            }
        });

        //comsec view
        commentCountEl.textContent = `(${r.comments.length})`;
        commentListEl.innerHTML = "";
        r.comments.forEach(c => {
            const commentDiv = document.createElement("div");
            commentDiv.className = "comment-item";
            commentDiv.innerHTML = `<strong>${c.name}</strong><p>${c.text}</p>`;
            commentListEl.appendChild(commentDiv);
        });
    }

    //adding comment
    commentForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("comment-name").value;
        const text = document.getElementById("comment-text").value;

        await fetch(`${API}/${recipeId}/comments`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({name, text})
        });

        commentForm.reset();
        loadDetails();
    });

    loadDetails();
}

//profile page, where users can view their added recipes
async function profilePage() {
    const currentUser = JSON.parse(localStorage.getItem("sandokUser"));
    if (!currentUser){
        window.location.href = "login.html";
        return;
    }

    document.getElementById("profile-name").textContent = currentUser.name;
    document.getElementById("profile-email").textContent = currentUser.email;

    const myRecipesList = document.getElementById("my-recipes");
    const recipeCountEl = document.getElementById("recipe-count");
    const emptyBox = document.getElementById("empty-box");
    const logoutLink = document.getElementById("logout-link");

    logoutLink?.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("sandokUser");
        window.location.href = "login.html";
    });

    const res = await fetch(`${API}?authorId=${currentUser._id}`);
    const recipes = await res.json();

    myRecipesList.innerHTML = "";
    recipeCountEl.textContent = `(${recipes.length} Recipes)`;

    if (recipes.length === 0) {
        emptyBox.classList.remove("hidden");
    } else {
        emptyBox.classList.add("hidden");
        recipes.forEach(r => {
            myRecipesList.appendChild(createRecipeCard(r, "added-recipe.html"));
        });
    }
}

//recipe cards
function createRecipeCard(r, targetPage = "recipe.html"){
    const card = document.createElement("a");
    card.className = "recipe-card-item";
    card.href = `${targetPage}?id=${r._id}`;

    card.innerHTML = `
        <img src = "${r.image || 'Placeholder.jpg'}" alt = "${r.title}">
        <div class = "card=content">
            <h3>${r.title}</h3>
            <div class = "card-tags">
                <span class = "tag">${r.course}</span>
            </div>
        </div>
    `;
    return card;
}