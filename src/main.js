import "./style.css";

// EXPENSE TRACKER
// JavaScript + LocalStorage

// GET ELEMENTS
const expenseForm = document.getElementById("expenseForm");

const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

const expenseTable = document.getElementById("expenseTable");

const totalSpend = document.getElementById("totalSpend");
const highestCategory = document.getElementById("highestCategory");

const searchInput = document.getElementById("searchInput");

const filterCategory =
    document.getElementById("filterCategory");

const filterDate =
    document.getElementById("filterDate");

const themeBtn =
    document.getElementById("themeBtn");


// LOAD EXPENSES

let expenses =
    JSON.parse(localStorage.getItem("expenses")) || [];


// EDIT ID


let editId = null;


// CHART VARIABLE


let barChart = null;


// OPEN FORM


function openExpenseForm() {

    expenseForm.classList.remove("hidden");

    expenseForm.scrollIntoView({
        behavior: "smooth"
    });

}

// CLOSE FORM

function closeExpenseForm() {

    expenseForm.classList.add("hidden");

    clearForm();

}


// CLEAR FORM


function clearForm() {

    descriptionInput.value = "";
    amountInput.value = "";
    categoryInput.value = "Food";
    dateInput.value = "";

    editId = null;

    const heading =
        expenseForm.querySelector("h2");

    if (heading) {
        heading.innerText = "Add Expense";
    }

}


// ============================================
// SAVE EXPENSE
// ============================================

function saveExpense() {

    const description =
        descriptionInput.value.trim();

    const amount =
        Number(amountInput.value);

    const category =
        categoryInput.value;

    const date =
        dateInput.value;


    // Validation

    if (
        description === "" ||
        amount <= 0 ||
        date === ""
    ) {

        alert(
            "Please enter description, amount and date."
        );

        return;

    }


    // ========================================
    // UPDATE EXPENSE
    // ========================================

    if (editId !== null) {

        expenses =
            expenses.map(function (expense) {

                if (expense.id === editId) {

                    return {

                        id: expense.id,
                        description: description,
                        amount: amount,
                        category: category,
                        date: date

                    };

                }

                return expense;

            });

        alert("Expense updated successfully.");

    }


    // ========================================
    // ADD EXPENSE
    // ========================================

    else {

        const newExpense = {

            id: Date.now(),
            description: description,
            amount: amount,
            category: category,
            date: date

        };

        expenses.push(newExpense);

        alert("Expense added successfully.");

    }


    // Save in LocalStorage

    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );


    // Refresh everything

    displayExpenses();
    calculateTotal();
    createBarChart();

    clearForm();

    expenseForm.classList.add("hidden");

}


// ============================================
// DISPLAY EXPENSES
// ============================================

function displayExpenses() {

    expenseTable.innerHTML = "";


    // ========================================
    // SEARCH TEXT
    // ========================================

    const searchText =
        searchInput.value
            .toLowerCase()
            .trim();


    // ========================================
    // FILTER VALUES
    // ========================================

    const selectedCategory =
        filterCategory.value;

    const selectedDate =
        filterDate.value;


    // ========================================
    // FILTER EXPENSES
    // ========================================

    const filteredExpenses =
        expenses.filter(function (expense) {


            // Search Description OR Category

            const searchMatch =
                expense.description
                    .toLowerCase()
                    .includes(searchText)

                ||

                expense.category
                    .toLowerCase()
                    .includes(searchText);


            // Category Filter

            const categoryMatch =
                selectedCategory === "all" ||
                expense.category === selectedCategory;


            // Date Filter

            const dateMatch =
                selectedDate === "" ||
                expense.date === selectedDate;


            return (
                searchMatch &&
                categoryMatch &&
                dateMatch
            );

        });


    // ========================================
    // NO EXPENSE
    // ========================================

    if (filteredExpenses.length === 0) {

        expenseTable.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="text-center py-10 text-slate-400"
                >

                    No expenses found.

                </td>

            </tr>

        `;

        return;

    }


    // ========================================
    // CREATE TABLE ROW
    // ========================================

    filteredExpenses.forEach(function (expense) {

        const row =
            document.createElement("tr");


        row.className =
            "border-b border-slate-200 hover:bg-slate-50";


        row.innerHTML = `

            <td class="p-4 font-medium">

                ${expense.description}

            </td>


            <td class="p-4">

                <span
                    class="
                    px-3
                    py-1
                    rounded-full
                    bg-indigo-100
                    text-indigo-600
                    text-sm
                    "
                >

                    ${expense.category}

                </span>

            </td>


            <td class="p-4 font-semibold">

                $${Number(expense.amount).toFixed(2)}

            </td>


            <td class="p-4">

                ${formatDate(expense.date)}

            </td>


            <td class="p-4">

                <div class="flex gap-2">

                    <button
                        onclick="editExpense(${expense.id})"
                        class="
                        bg-blue-100
                        text-blue-600
                        px-3
                        py-2
                        rounded-lg
                        hover:bg-blue-200
                        "
                    >

                        ✏️

                    </button>


                    <button
                        onclick="deleteExpense(${expense.id})"
                        class="
                        bg-red-100
                        text-red-600
                        px-3
                        py-2
                        rounded-lg
                        hover:bg-red-200
                        "
                    >

                        🗑️

                    </button>

                </div>

            </td>

        `;


        expenseTable.appendChild(row);

    });

}


// ============================================
// EDIT EXPENSE
// ============================================

function editExpense(id) {

    const expense =
        expenses.find(function (item) {

            return item.id === id;

        });


    if (!expense) {

        return;

    }


    descriptionInput.value =
        expense.description;

    amountInput.value =
        expense.amount;

    categoryInput.value =
        expense.category;

    dateInput.value =
        expense.date;


    editId = id;


    openExpenseForm();


    const heading =
        expenseForm.querySelector("h2");


    if (heading) {

        heading.innerText =
            "Edit Expense";

    }

}


// ============================================
// DELETE EXPENSE
// ============================================

function deleteExpense(id) {

    const answer =
        confirm(
            "Are you sure you want to delete this expense?"
        );


    if (!answer) {

        return;

    }


    expenses =
        expenses.filter(function (expense) {

            return expense.id !== id;

        });


    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );


    displayExpenses();
    calculateTotal();
    createBarChart();


    alert("Expense deleted successfully.");

}


// ============================================
// TOTAL CALCULATION
// ============================================

function calculateTotal() {

    let total = 0;


    expenses.forEach(function (expense) {

        total += Number(expense.amount);

    });


    totalSpend.innerText =
        "$" + total.toFixed(2);


    // ========================================
    // HIGHEST CATEGORY
    // ========================================

    const categoryTotals = {};


    expenses.forEach(function (expense) {

        if (!categoryTotals[expense.category]) {

            categoryTotals[expense.category] = 0;

        }


        categoryTotals[expense.category] +=
            Number(expense.amount);

    });


    let highestAmount = 0;
    let highestName = "-";


    Object.entries(categoryTotals)
        .forEach(function ([category, amount]) {

            if (amount > highestAmount) {

                highestAmount = amount;
                highestName = category;

            }

        });


    highestCategory.innerText =
        highestName;

}


// ============================================
// BAR CHART
// ============================================

function createBarChart() {

    const canvas =
        document.getElementById("barChart");


    if (!canvas) {

        console.log(
            "Bar chart canvas not found."
        );

        return;

    }


    const categoryTotals = {};


    expenses.forEach(function (expense) {

        if (!categoryTotals[expense.category]) {

            categoryTotals[expense.category] = 0;

        }


        categoryTotals[expense.category] +=
            Number(expense.amount);

    });


    const labels =
        Object.keys(categoryTotals);


    const values =
        Object.values(categoryTotals);


    if (barChart !== null) {

        barChart.destroy();

    }


    barChart = new Chart(
        canvas,
        {

            type: "bar",

            data: {

                labels: labels,

                datasets: [

                    {

                        label: "Expenses",

                        data: values,

                        backgroundColor:
                            "#60a5fa",

                        borderRadius: 8,

                        barThickness: 45

                    }

                ]

            },


            options: {

                responsive: true,

                maintainAspectRatio: false,


                scales: {

                    y: {

                        beginAtZero: true,

                        ticks: {

                            callback:
                                function (value) {

                                    return "$" + value;

                                }

                        }

                    }

                },


                plugins: {

                    legend: {

                        display: true

                    }

                }

            }

        }
    );

}


// ============================================
// GLOBAL SEARCH
// ============================================

if (searchInput) {

    // Create search results box
    const searchBox = document.createElement("div");

    searchBox.id = "globalSearchResults";

    searchBox.className =
        "hidden absolute left-0 right-0 top-full mt-2 bg-white " +
        "border border-slate-200 rounded-xl shadow-xl z-50 " +
        "max-h-80 overflow-y-auto";

    // Make parent relative
    const searchParent = searchInput.parentElement;

    if (searchParent) {

        searchParent.style.position = "relative";

        searchParent.appendChild(searchBox);
    }


    // Search while typing
    searchInput.addEventListener("input", function () {

        const searchText =
            searchInput.value
                .toLowerCase()
                .trim();


        // Empty search
        if (searchText === "") {

            searchBox.innerHTML = "";

            searchBox.classList.add("hidden");

            return;
        }


        let results = [];


        // ========================================
        // SEARCH LOCAL STORAGE EXPENSES
        // ========================================

        expenses.forEach(function (expense) {

            const description =
                String(expense.description || "")
                    .toLowerCase();

            const category =
                String(expense.category || "")
                    .toLowerCase();

            const date =
                String(expense.date || "")
                    .toLowerCase();


            if (
                description.includes(searchText) ||
                category.includes(searchText) ||
                date.includes(searchText)
            ) {

                results.push({
                    type: "expense",
                    title: expense.description,
                    category: expense.category,
                    amount: expense.amount,
                    date: expense.date,
                    id: expense.id
                });

            }

        });

// ========================================
// SEARCH LOCAL STORAGE EXPENSES
// ========================================

expenses.forEach(function (expense) {

    const description = String(expense.description).toLowerCase();
    const category = String(expense.category).toLowerCase();
    const date = String(expense.date).toLowerCase();

    if (
        description.includes(searchText) ||
        category.includes(searchText) ||
        date.includes(searchText)
    ) {

        results.push({
            type: "expense",
            title: expense.description,
            icon: "💰",
            elementId: "expense-section"
        });

    }

});

        // ========================================
        // NO RESULTS
        // ========================================

        if (results.length === 0) {

            searchBox.innerHTML = `
                <div class="p-4 text-sm text-slate-500">
                    No results found for 
                    <strong>"${searchInput.value}"</strong>
                </div>
            `;

            searchBox.classList.remove("hidden");

            return;
        }


        // ========================================
        // SHOW RESULTS
        // ========================================

        searchBox.innerHTML = "";


        results.forEach(function (result) {

            const item =
                document.createElement("button");

            item.type = "button";

            item.className =
                "w-full text-left px-4 py-3 " +
                "hover:bg-indigo-50 border-b border-slate-100 " +
                "transition";


            // Expense result
            if (result.type === "expense") {

                item.innerHTML = `
                    <div class="flex items-center justify-between gap-3">

                        <div>
                            <p class="font-semibold text-slate-800">
                                ${result.title}
                            </p>

                            <p class="text-xs text-slate-500 mt-1">
                                ${result.category}
                                •
                                ${formatDate(result.date)}
                            </p>
                        </div>

                        <span class="font-semibold text-indigo-600">
                            $${Number(result.amount).toFixed(2)}
                        </span>

                    </div>
                `;


                item.addEventListener("click", function () {

                    // Put searched item in expense table
                    searchInput.value = result.title;

                    searchBox.classList.add("hidden");

                    displayExpenses();


                    // Scroll to expense history
                    const expenseSection =
                        document.getElementById("expenses");

                    if (expenseSection) {

                        expenseSection.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });

                    }

                });

            }


            // Budget result
            if (result.type === "budget") {

                item.innerHTML = `
                    <div class="flex items-center gap-3">

                        <span class="text-xl">
                            ${result.icon}
                        </span>

                        <div>
                            <p class="font-semibold text-slate-800">
                                ${result.title}
                            </p>

                            <p class="text-xs text-slate-500">
                                Budget
                            </p>
                        </div>

                    </div>
                `;


                item.addEventListener("click", function () {

                    searchInput.value = "";

                    searchBox.classList.add("hidden");


                    const budgetElement =
                        document.getElementById(
                            result.elementId
                        );


                    if (budgetElement) {

                        budgetElement.scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                        });


                        // Temporary highlight
                        budgetElement.classList.add(
                            "ring-2",
                            "ring-indigo-400",
                            "rounded-xl"
                        );


                        setTimeout(function () {

                            budgetElement.classList.remove(
                                "ring-2",
                                "ring-indigo-400",
                                "rounded-xl"
                            );

                        }, 2000);

                    }

                });

            }


            searchBox.appendChild(item);

        });


        searchBox.classList.remove("hidden");

    });


    // ========================================
    // CLOSE SEARCH WHEN CLICKING OUTSIDE
    // ========================================

    document.addEventListener("click", function (event) {

        if (
            !searchParent.contains(event.target)
        ) {

            searchBox.classList.add("hidden");

        }

    });

}
// ============================================
// CATEGORY FILTER
// ============================================

if (filterCategory) {

    filterCategory.addEventListener(
        "change",
        function () {

            displayExpenses();

        }
    );

}


// ============================================
// DATE FILTER
// ============================================

if (filterDate) {

    filterDate.addEventListener(
        "change",
        function () {

            displayExpenses();

        }
    );

}

// ============================================
// THEME TOGGLE
// ============================================

if (themeBtn) {

    themeBtn.addEventListener("click", function () {

        const currentTheme =
            localStorage.getItem("theme");

        if (currentTheme === "dark") {

            setLightTheme();

        } else {

            setDarkTheme();

        }

    });

}


// ============================================
// DARK THEME
// ============================================

function setDarkTheme() {

    // ================= BODY =================

    document.body.classList.remove(
        "bg-slate-50",
        "text-slate-800"
    );

    document.body.classList.add(
        "bg-slate-900",
        "text-white"
    );


    // ================= LOGIN SCREEN =================

    const loginScreen =
        document.getElementById("loginScreen");

    if (loginScreen) {

        loginScreen.classList.remove(
            "bg-slate-50"
        );

        loginScreen.classList.add(
            "bg-slate-900"
        );

    }


    // ================= DASHBOARD BACKGROUND =================

    const main =
        document.querySelector("main");

    if (main) {

        main.classList.remove(
            "bg-slate-50"
        );

        main.classList.add(
            "bg-slate-900"
        );

    }


    // ================= SIDEBAR =================

    const sidebar =
        document.querySelector("aside");

    if (sidebar) {

        sidebar.classList.remove(
            "bg-white",
            "border-slate-200"
        );

        sidebar.classList.add(
            "bg-slate-800",
            "border-slate-700"
        );

    }


    // ================= HEADER =================

    const header =
        document.querySelector("header");

    if (header) {

        header.classList.remove(
            "bg-white",
            "border-slate-200"
        );

        header.classList.add(
            "bg-slate-800",
            "border-slate-700"
        );

    }


    // ================= ALL WHITE CARDS =================

    document.querySelectorAll(".bg-white").forEach(
        function (element) {

            element.classList.remove(
                "bg-white"
            );

            element.classList.add(
                "bg-slate-800"
            );

        }
    );


    // ================= BORDERS =================

    document.querySelectorAll(
        ".border-slate-200"
    ).forEach(function (element) {

        element.classList.remove(
            "border-slate-200"
        );

        element.classList.add(
            "border-slate-700"
        );

    });


    // ================= HEADINGS =================

    document.querySelectorAll(
        ".text-slate-800"
    ).forEach(function (element) {

        element.classList.remove(
            "text-slate-800"
        );

        element.classList.add(
            "text-white"
        );

    });


    // ================= GRAY TEXT =================

    document.querySelectorAll(
        ".text-slate-600"
    ).forEach(function (element) {

        element.classList.remove(
            "text-slate-600"
        );

        element.classList.add(
            "text-slate-300"
        );

    });


    document.querySelectorAll(
        ".text-slate-500"
    ).forEach(function (element) {

        element.classList.remove(
            "text-slate-500"
        );

        element.classList.add(
            "text-slate-400"
        );

    });


    // ================= LIGHT BACKGROUNDS =================

    document.querySelectorAll(
        ".bg-slate-100"
    ).forEach(function (element) {

        element.classList.remove(
            "bg-slate-100"
        );

        element.classList.add(
            "bg-slate-700"
        );

    });


    document.querySelectorAll(
        ".bg-slate-50"
    ).forEach(function (element) {

        element.classList.remove(
            "bg-slate-50"
        );

        element.classList.add(
            "bg-slate-700"
        );

    });


    // ================= INDIGO LIGHT AREAS =================

    document.querySelectorAll(
        ".bg-indigo-50"
    ).forEach(function (element) {

        element.classList.remove(
            "bg-indigo-50"
        );

        element.classList.add(
            "bg-indigo-900"
        );

    });


    // ================= INDIGO 100 =================

    document.querySelectorAll(
        ".bg-indigo-100"
    ).forEach(function (element) {

        element.classList.remove(
            "bg-indigo-100"
        );

        element.classList.add(
            "bg-indigo-900"
        );

    });


    // ================= INPUTS =================

    document.querySelectorAll(
        "input, select"
    ).forEach(function (element) {

        element.classList.remove(
            "bg-white",
            "bg-slate-50",
            "border-slate-200"
        );

        element.classList.add(
            "bg-slate-700",
            "text-white",
            "border-slate-600"
        );

    });


    // ================= SEARCH BOX =================

    const searchBox =
        document.getElementById(
            "globalSearchResults"
        );

    if (searchBox) {

        searchBox.classList.remove(
            "bg-white",
            "border-slate-200"
        );

        searchBox.classList.add(
            "bg-slate-800",
            "border-slate-700"
        );

    }


    // ================= TABLE ROWS =================

    document.querySelectorAll(
        "#expenseTable tr"
    ).forEach(function (row) {

        row.classList.remove(
            "border-slate-200",
            "hover:bg-slate-50"
        );

        row.classList.add(
            "border-slate-700",
            "hover:bg-slate-700"
        );

    });


    // ================= TABLE HEADER =================

    document.querySelectorAll(
        "#expenses thead tr"
    ).forEach(function (row) {

        row.classList.remove(
            "bg-slate-100"
        );

        row.classList.add(
            "bg-slate-700"
        );

    });


    // ================= EXPENSE FORM =================

    if (expenseForm) {

        expenseForm.classList.remove(
            "bg-white",
            "border-slate-200"
        );

        expenseForm.classList.add(
            "bg-slate-800",
            "border-slate-700"
        );

    }


    // ================= SETTINGS MENU =================

    const settingsMenu =
        document.getElementById(
            "settingsMenu"
        );

    if (settingsMenu) {

        settingsMenu.classList.remove(
            "bg-white",
            "border-slate-200"
        );

        settingsMenu.classList.add(
            "bg-slate-800",
            "border-slate-700"
        );

    }


    // ================= PROFILE BORDER =================

    document.querySelectorAll(
        ".border-t.border-slate-200"
    ).forEach(function (element) {

        element.classList.remove(
            "border-slate-200"
        );

        element.classList.add(
            "border-slate-700"
        );

    });


    // ================= UPGRADE SECTION =================

    const upgrade =
        document.getElementById("upgrade");

    if (upgrade) {

        upgrade.classList.remove(
            "bg-white",
            "border-slate-200"
        );

        upgrade.classList.add(
            "bg-slate-800",
            "border-slate-700"
        );

    }


    // ================= THEME BUTTON =================

    if (themeBtn) {

        themeBtn.innerText = "☀️";

        themeBtn.classList.remove(
            "bg-indigo-100",
            "text-indigo-600"
        );

        themeBtn.classList.add(
            "bg-slate-700",
            "text-white"
        );

    }


    // ================= SAVE THEME =================

    localStorage.setItem(
        "theme",
        "dark"
    );


    // Update chart

    createBarChart();

}


// ============================================
// LIGHT THEME
// ============================================

function setLightTheme() {

    // ================= BODY =================

    document.body.classList.remove(
        "bg-slate-900",
        "text-white"
    );

    document.body.classList.add(
        "bg-slate-50",
        "text-slate-800"
    );


    // ================= LOGIN =================

    const loginScreen =
        document.getElementById("loginScreen");

    if (loginScreen) {

        loginScreen.classList.remove(
            "bg-slate-900"
        );

        loginScreen.classList.add(
            "bg-slate-50"
        );

    }


    // ================= MAIN =================

    const main =
        document.querySelector("main");

    if (main) {

        main.classList.remove(
            "bg-slate-900"
        );

        main.classList.add(
            "bg-slate-50"
        );

    }


    // ================= SIDEBAR =================

    const sidebar =
        document.querySelector("aside");

    if (sidebar) {

        sidebar.classList.remove(
            "bg-slate-800",
            "border-slate-700"
        );

        sidebar.classList.add(
            "bg-white",
            "border-slate-200"
        );

    }


    // ================= HEADER =================

    const header =
        document.querySelector("header");

    if (header) {

        header.classList.remove(
            "bg-slate-800",
            "border-slate-700"
        );

        header.classList.add(
            "bg-white",
            "border-slate-200"
        );

    }


    // ================= ALL CARDS =================

    document.querySelectorAll(
        ".bg-slate-800"
    ).forEach(function (element) {

        element.classList.remove(
            "bg-slate-800"
        );

        element.classList.add(
            "bg-white"
        );

    });


    // ================= BORDERS =================

    document.querySelectorAll(
        ".border-slate-700"
    ).forEach(function (element) {

        element.classList.remove(
            "border-slate-700"
        );

        element.classList.add(
            "border-slate-200"
        );

    });


    // ================= WHITE TEXT =================

    document.querySelectorAll(
        ".text-white"
    ).forEach(function (element) {

        element.classList.remove(
            "text-white"
        );

        element.classList.add(
            "text-slate-800"
        );

    });


    // ================= LIGHT GRAY TEXT =================

    document.querySelectorAll(
        ".text-slate-300"
    ).forEach(function (element) {

        element.classList.remove(
            "text-slate-300"
        );

        element.classList.add(
            "text-slate-600"
        );

    });


    document.querySelectorAll(
        ".text-slate-400"
    ).forEach(function (element) {

        element.classList.remove(
            "text-slate-400"
        );

        element.classList.add(
            "text-slate-500"
        );

    });


    // ================= TABLE =================

    document.querySelectorAll(
        ".bg-slate-700"
    ).forEach(function (element) {

        element.classList.remove(
            "bg-slate-700"
        );

        element.classList.add(
            "bg-slate-100"
        );

    });


    // ================= INDIGO AREAS =================

    document.querySelectorAll(
        ".bg-indigo-900"
    ).forEach(function (element) {

        element.classList.remove(
            "bg-indigo-900"
        );

        element.classList.add(
            "bg-indigo-50"
        );

    });


    // ================= INPUTS =================

    document.querySelectorAll(
        "input, select"
    ).forEach(function (element) {

        element.classList.remove(
            "bg-slate-700",
            "text-white",
            "border-slate-600"
        );

        element.classList.add(
            "bg-white",
            "text-slate-800",
            "border-slate-200"
        );

    });


    // ================= SEARCH RESULTS =================

    const searchBox =
        document.getElementById(
            "globalSearchResults"
        );

    if (searchBox) {

        searchBox.classList.remove(
            "bg-slate-800",
            "border-slate-700"
        );

        searchBox.classList.add(
            "bg-white",
            "border-slate-200"
        );

    }


    // ================= TABLE ROWS =================

    document.querySelectorAll(
        "#expenseTable tr"
    ).forEach(function (row) {

        row.classList.remove(
            "border-slate-700",
            "hover:bg-slate-700"
        );

        row.classList.add(
            "border-slate-200",
            "hover:bg-slate-50"
        );

    });


    // ================= TABLE HEADER =================

    document.querySelectorAll(
        "#expenses thead tr"
    ).forEach(function (row) {

        row.classList.remove(
            "bg-slate-700"
        );

        row.classList.add(
            "bg-slate-100"
        );

    });


    // ================= EXPENSE FORM =================

    if (expenseForm) {

        expenseForm.classList.remove(
            "bg-slate-800",
            "border-slate-700"
        );

        expenseForm.classList.add(
            "bg-white",
            "border-slate-200"
        );

    }


    // ================= SETTINGS MENU =================

    const settingsMenu =
        document.getElementById(
            "settingsMenu"
        );

    if (settingsMenu) {

        settingsMenu.classList.remove(
            "bg-slate-800",
            "border-slate-700"
        );

        settingsMenu.classList.add(
            "bg-white",
            "border-slate-200"
        );

    }


    // ================= UPGRADE =================

    const upgrade =
        document.getElementById("upgrade");

    if (upgrade) {

        upgrade.classList.remove(
            "bg-slate-800",
            "border-slate-700"
        );

        upgrade.classList.add(
            "bg-white",
            "border-slate-200"
        );

    }


    // ================= THEME BUTTON =================

    if (themeBtn) {

        themeBtn.innerText = "🌙";

        themeBtn.classList.remove(
            "bg-slate-700",
            "text-white"
        );

        themeBtn.classList.add(
            "bg-indigo-100",
            "text-indigo-600"
        );

    }


    // ================= SAVE THEME =================

    localStorage.setItem(
        "theme",
        "light"
    );


    // Update chart

    createBarChart();

}


// ============================================
// LOAD SAVED THEME
// ============================================

function loadTheme() {

    const theme =
        localStorage.getItem("theme");

    if (theme === "dark") {

        setDarkTheme();

    } else {

        setLightTheme();

    }

}

// ============================================
// DATE FORMAT
// ============================================

function formatDate(date) {

    const d =
        new Date(date);


    return d.toLocaleDateString(
        "en-US",
        {

            month: "short",
            day: "numeric",
            year: "numeric"

        }
    );

}


// ============================================
// CSV EXPORT
// ============================================

function exportCSV() {

    if (expenses.length === 0) {

        alert(
            "No expenses to export."
        );

        return;

    }


    let csv =
        "Description,Category,Amount,Date\n";


    expenses.forEach(function (expense) {

        csv +=
            `"${expense.description}",` +
            `"${expense.category}",` +
            `"${expense.amount}",` +
            `"${expense.date}"\n`;

    });


    const blob =
        new Blob(
            [csv],
            {
                type: "text/csv"
            }
        );


    downloadFile(
        blob,
        "expenses.csv"
    );

}


// ============================================
// JSON EXPORT
// ============================================

function exportJSON() {

    if (expenses.length === 0) {

        alert(
            "No expenses to export."
        );

        return;

    }


    const json =
        JSON.stringify(
            expenses,
            null,
            2
        );


    const blob =
        new Blob(
            [json],
            {
                type: "application/json"
            }
        );


    downloadFile(
        blob,
        "expenses.json"
    );

}


// ============================================
// DOWNLOAD FILE
// ============================================

function downloadFile(blob, name) {

    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download = name;


    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);


    URL.revokeObjectURL(url);

}


// ============================================
// INITIALIZE APP
// ============================================

loadTheme();

displayExpenses();

calculateTotal();

createBarChart();


// ============================================
// SETTINGS MENU
// ============================================

const settingsBtn =
    document.getElementById("settingsBtn");

const settingsMenu =
    document.getElementById("settingsMenu");


if (settingsBtn && settingsMenu) {

    settingsBtn.addEventListener(
        "click",
        function () {

            settingsMenu.classList.toggle(
                "hidden"
            );

        }
    );

}
// ============================================
// PROFILE DARK MODE BUTTON
// ============================================

const darkModeBtn =
    document.getElementById("darkModeBtn");

if (darkModeBtn) {

    darkModeBtn.addEventListener(
        "click",
        function () {

            const currentTheme =
                localStorage.getItem("theme");

            if (currentTheme === "dark") {

                setLightTheme();

            } else {

                setDarkTheme();

            }

        }
    );

}

// ============================================
// LOGIN SYSTEM
// ============================================

const loginForm =
    document.getElementById("loginForm");

const loginScreen =
    document.getElementById("loginScreen");

const dashboardScreen =
    document.getElementById("dashboardScreen");


if (loginForm && loginScreen && dashboardScreen) {

    loginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            // Hide Login
            loginScreen.classList.add("hidden");

            // Show Dashboard
            dashboardScreen.classList.remove("hidden");

        }
    );

}


// ============================================
// LOGOUT
// ============================================

const logoutBtn =
    document.getElementById("logoutBtn");


if (logoutBtn && loginScreen && dashboardScreen) {

    logoutBtn.addEventListener(
        "click",
        function () {

            // Hide Dashboard
            dashboardScreen.classList.add("hidden");

            // Show Login
            loginScreen.classList.remove("hidden");

            // Clear login fields
            const email =
                document.getElementById("loginEmail");

            const password =
                document.getElementById("loginPassword");

            if (email) {
                email.value = "";
            }

            if (password) {
                password.value = "";
            }

        }
    );

}
// ============================================
// UPGRADE
// ============================================

function upgradePlan(plan) {
    alert("You selected the " + plan + " plan.");
}

const upgradeLink = document.querySelector('a[href="#upgrade"]');
const upgradeSection = document.getElementById("upgrade");

if (upgradeLink && upgradeSection) {
    upgradeLink.addEventListener("click", function (e) {
        e.preventDefault();

        upgradeSection.classList.remove("hidden");

        upgradeSection.scrollIntoView({
            behavior: "smooth"
        });
    });
}