const API = "/recipes";

// checks which page is active
document.addEventListener("DOMContentLoaded", () => {
    const bodyId = document.body.id;
    const currentUser = JSON.parse(localStorage.getItem("sandokUser"));

    if (!currentUser && bodyId !== "login-page" && bodyId !== "signup-page") {
        window.location.href = "login.html"; 
        return;
    }

    if (bodyId === "login-page") loginPage();
    else if (bodyId === "signup-page") signupPage();
    else if (bodyId === "home-page") homePage();
    else if (bodyId === "browse-page") browsePage();
    else if (bodyId === "profile-page") profilePage();
    else if (bodyId === "add-page") addEditPage();
    else if (bodyId === "added-page") newRecipePage();
    else if (bodyId === "recipe-page") recipePage();
});

// login page
function loginPage() {
    const loginForm = document.getElementById("login-form");
    const emailInput = document.getElementById("login-email");
    const passwordInput = document.getElementById("login-password");
    const msgBox = document.getElementById("login-message");

    loginForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        const res = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (res.ok) {
            localStorage.setItem("sandokUser", JSON.stringify(data.user));
            window.location.href = "index.html";
        } else {
            msgBox.textContent = data.error || "Login failed.";
            msgBox.classList.remove("hidden");
        }
    });
}

// signup page
function signupPage() {
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

        if (password !== confirmPassword) {
            msgBox.textContent = "Passwords do not match.";
            msgBox.classList.remove("hidden");
            return; 
        }

        const res = await fetch("/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();
        if (res.ok) {
            localStorage.setItem("sandokUser", JSON.stringify(data.user));
            window.location.href = "index.html";
        } else {
            msgBox.textContent = data.error || "Signup failed.";
            msgBox.classList.remove("hidden");
        }
    });
}

// home page
async function homePage() {
    const popularList = document.getElementById("popular-list");
    if (!popularList) return;

    const res = await fetch(API);
    const recipes = await res.json();

    popularList.innerHTML = "";
    recipes.slice(0, 3).forEach(r => {
        popularList.appendChild(createRecipeCard(r));
    });
}

// browse page
async function browsePage() {
    const resultsList = document.getElementById("results-list");
    const resultsCount = document.getElementById("results-count");
    const emptyBox = document.getElementById("empty-box");
    const filterButtons = document.querySelectorAll(".filter-button"); 
    const searchForm = document.getElementById("search-form");
    const searchInput = document.getElementById("search-input");

    const urlParams = new URLSearchParams(window.location.search);
    let currentCourse = urlParams.get("course") || "";
    let currentIngredient = urlParams.get("ingredient") || "";
    let searchQuery = urlParams.get("q") || "";

    if (searchInput && searchQuery) searchInput.value = searchQuery;

    async function fetchAndDisplay() {
        let queryParams = [];
        if (currentCourse) queryParams.push(`course=${encodeURIComponent(currentCourse)}`);
        if (currentIngredient) queryParams.push(`ingredient=${encodeURIComponent(currentIngredient)}`);
        if (searchQuery) queryParams.push(`q=${encodeURIComponent(searchQuery)}`);

        let endpoint = API;
        if (queryParams.length > 0) endpoint += "?" + queryParams.join("&");
        const res = await fetch(endpoint);

        const recipes = await res.json();
        resultsList.innerHTML = "";
        resultsCount.textContent = `(${recipes.length} Recipes)`;
        if (recipes.length === 0) {
            emptyBox.classList.remove("hidden");
        } else {
            emptyBox.classList.add("hidden");
            recipes.forEach(r => resultsList.appendChild(createRecipeCard(r))); 
        }
    }

    filterButtons.forEach(button => { 
        button.addEventListener("click", (e) => {
            const type = e.target.getAttribute("data-type");
            const val = e.target.getAttribute("data-value");
            document.querySelectorAll(`.filter-button[data-type="${type}"]`).forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");

            if (type === "course") currentCourse = val;
            if (type === "ingredient") currentIngredient = val;

            fetchAndDisplay();
        });
    });

    searchForm?.addEventListener("submit", (e) => {
        e.preventDefault();
        searchQuery = searchInput.value.trim();
        fetchAndDisplay();
    });

    fetchAndDisplay();
}

// add/edit page
async function addEditPage() {
    const form = document.getElementById("recipe-form");
    const heading = document.getElementById("form-heading");
    const titleEl = document.getElementById("title");
    const courseEl = document.getElementById("course");
    const ingredientEl = document.getElementById("ingredient"); 
    const ingredientsEl = document.getElementById("ingredients"); 
    const instructionsEl = document.getElementById("instructions");
    const currentUser = JSON.parse(localStorage.getItem("sandokUser"));

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

    form?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = {
            title: titleEl.value,
            course: courseEl.value,
            ingredient: ingredientEl.value,
            image: "",
            ingredients: ingredientsEl.value,
            instructions: instructionsEl.value,
            authorId: currentUser._id // tells db who made it
        };

        let response;
        if(editId){ 
            response = await fetch(`${API}/${editId}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data)
            });
        } else { 
            response = await fetch(API, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data)
            }); 
        }

        const saved = await response.json();
        window.location.href = `recipe-added.html?id=${saved._id}`; 
    });
}

// newly added recipe page (edit/delete)
async function newRecipePage() {
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get("id");

    if(!recipeId){ 
        window.location.href = "browse.html";
        return;
    }
    
    const titleEl = document.getElementById("recipe-title");
    const ingredientsListEl = document.getElementById("ingredient-list");
    const instructionsListEl = document.getElementById("instruction-list");
    const editBtn = document.getElementById("edit-btn");
    const deleteBtn = document.getElementById("delete-btn");
    const deleteModal = document.getElementById("delete-modal");
    const cancelDeleteBtn = document.getElementById("cancel-delete");
    const confirmDeleteBtn = document.getElementById("confirm-delete");

    const res = await fetch(`${API}/${recipeId}`);
    const r = await res.json();

    titleEl.textContent = r.title;

    ingredientsListEl.innerHTML = "";
    r.ingredients.split("\n").forEach(item => {
        if(item.trim()){
            const li = document.createElement("li");
            li.textContent = item.trim();
            ingredientsListEl.appendChild(li);
        }
    });

    instructionsListEl.innerHTML = "";
    r.instructions.split("\n").forEach(step => {
        if (step.trim()){
            const li = document.createElement("li");
            li.textContent = step.trim();
            instructionsListEl.appendChild(li);
        }
    });

    if (editBtn){ editBtn.href = `add-recipe.html?id=${r._id}` };

    deleteBtn?.addEventListener("click", () => deleteModal.classList.remove("hidden"));
    cancelDeleteBtn?.addEventListener("click", () => deleteModal.classList.add("hidden"));
    confirmDeleteBtn?.addEventListener("click", async () => {
        await fetch(`${API}/${recipeId}`, {method: "DELETE"});
        window.location.href = "profile.html";
    });
}

// recipe page, detailed view with comsec
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
    const ingredientListEl = document.getElementById("ingredient-list");
    const instructionListEl = document.getElementById("instruction-list");
    const commentCountEl = document.getElementById("comment-count");
    const commentListEl = document.getElementById("comment-list");
    const commentForm = document.getElementById("comment-form");
    const currentUser = JSON.parse(localStorage.getItem("sandokUser"));

    if (currentUser) {
        document.getElementById("commenting-as").textContent = currentUser.name;
        document.getElementById("comment-name").value = currentUser.name;
    }

    async function loadDetails() {
        const res = await fetch(`${API}/${recipeId}`);
        const r = await res.json();

        titleEl.textContent = r.title;
        if (courseEl){ courseEl.textContent = r.course };
        if (ingredientEl){ ingredientEl.textContent = r.ingredient };

        ingredientListEl.innerHTML = "";
        r.ingredients.split("\n").forEach(item => {
            if(item.trim()){
                const li = document.createElement("li");
                li.textContent = item.trim();
                ingredientListEl.appendChild(li);
            }
        });

        instructionListEl.innerHTML = "";
        r.instructions.split("\n").forEach(step => {
            if (step.trim()){
                const li = document.createElement("li");
                li.textContent = step.trim();
                instructionListEl.appendChild(li);
            }
        });

        commentCountEl.textContent = `(${r.comments.length})`;
        commentListEl.innerHTML = "";
        r.comments.forEach(c => {
            const commentDiv = document.createElement("div");
            commentDiv.className = "comment-item";
            commentDiv.innerHTML = `<strong>${c.name}</strong><p>${c.text}</p>`;
            commentListEl.appendChild(commentDiv);
        });
    }

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
        if (currentUser) document.getElementById("comment-name").value = currentUser.name;
        loadDetails();
    });

    loadDetails();
}

// profile page
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
            myRecipesList.appendChild(createRecipeCard(r, "recipe-added.html")); 
        });
    }
}

// recipe cards
function createRecipeCard(r, targetPage = "recipe.html"){
    const card = document.createElement("a");
    card.className = "card"; 
    card.href = `${targetPage}?id=${r._id}`;

    card.innerHTML = `
        <img src="${r.image || 'images/logo.png'}" alt="${r.title}">
        <div class="card-content">
            <h3>${r.title}</h3>
            <div class="tags">
                <span class="tag">${r.course}</span>
            </div>
        </div>
    `;
    return card;
}