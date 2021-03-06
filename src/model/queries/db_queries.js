const connection = require("./../database/db_connection");

// Query for displaying all meal plans

const getAllPlans = () => {
  return connection.query(`SELECT * FROM plans;`);
};

// Query for disaplying single plan

const getSinglePlan = planId => {
  return connection.query(`SELECT * FROM plans WHERE id = ${planId};`);
};

// Query for displaying recipe info on meal plans page - query returns all recipes related to the given meal plan

const getRecipes = planId => {
  return connection.query(
    `SELECT * FROM recipes INNER JOIN junction_plans_recipes ON recipes.id = junction_plans_recipes.recipe_id WHERE plan_id = ${planId};`
  );
};

// Query for displaying recipe info on single recipe page

const getSingleRecipe = recipeId => {
  return connection.query(`SELECT * FROM recipes WHERE id = ${recipeId};`);
};

// Query for getting ingredients for individual recipes

const getIngredients = recipeId => {
  return connection.query(
    `SELECT ingredient_name FROM ingredients INNER JOIN junction_recipes_ingredients ON ingredients.id = junction_recipes_ingredients.ingredient_id WHERE recipe_id = ${recipeId};`
  );
};

// Query for getting shopping list for a specific meal plan

const getShoppingList = planId => {
  return connection.query(
    `SELECT ingredient_name FROM ingredients INNER JOIN junction_recipes_ingredients ON ingredients.id = junction_recipes_ingredients.ingredient_id INNER JOIN junction_plans_recipes ON junction_plans_recipes.recipe_id = junction_recipes_ingredients.recipe_id WHERE plan_id = ${planId};`
  );
};

// Query for getting all recipes in random order (only five to be displayed initially)

const getRandomRecipes = () => {
  return connection.query(
    `SELECT recipe_name, cooking_time FROM recipes ORDER BY RANDOM();`
  );
};

// Query for getting additional suggestions with shared getIngredients

const getSimilarRecipes = (firstPick, secondPick) => {
  return connection.query(
    `SELECT recipe_name, cooking_time, health_score FROM recipes WHERE id IN (SELECT DISTINCT recipe_id FROM junction_recipes_ingredients WHERE ingredient_id IN (SELECT ingredient_id FROM junction_recipes_ingredients WHERE recipe_id = ${firstPick} OR recipe_id = ${secondPick}));`
  );
};

// Query for adding a new plan - title and days - into 'plans' table

const addNewPlan = (planName, planDays) => {
  return connection.query(
    `INSERT INTO plans (plan_name, plan_days) VALUES ('${planName}', ${planDays});`
  );
};

// Query for adding a recipe to a plan in junction table

const addRecipeToPlan = (planName, recipeId) => {
  return connection.query(
    `INSERT INTO junction_plans_recipes (plan_id, recipe_id) VALUES ((SELECT id FROM plans WHERE plan_name = '${planName}'), ${recipeId})`
  );
};

const addIngredients = ingredientName => {
  return connection.query(
    `INSERT INTO ingredients (ingredient_name) VALUES ('${ingredientName}') ON CONFLICT DO NOTHING`
  );
};

const addRecipe = recipeObject => {
  return connection.query(
    `INSERT INTO recipes (id, recipe_name, instructions, cooking_time, health_score)
    VALUES (${recipeObject.id}, '${recipeObject.recipeName}', '${recipeObject.instructions}', ${recipeObject.cookingTime}, ${recipeObject.healthScore}) ON CONFLICT DO NOTHING`
  );
};

const addIngredientToRecipe = (recipeId, ingredientName) => {
  return connection.query(
    `INSERT INTO junction_recipes_ingredients (recipe_id, ingredient_id) VALUES (${recipeId}, (SELECT id FROM ingredients WHERE ingredient_name = '${ingredientName}'))`
  );
};

let ingredient = "black pepper";

const addPlanToDatabase = async mealPlanOb => {
  let planDaysCounter = mealPlanOb.plan_days;
  let x = 0;

  addNewPlan(mealPlanOb.plan_name, mealPlanOb.plan_days);
  while (x < planDaysCounter) {
    mealPlanOb[x].extendedIngredients.forEach(ingredient => {
      addIngredients(ingredient.name)
        .then(addIngredientToRecipe(mealPlanOb[x].id, ingredient.name))
        .catch(err => {
          console.log(err);
        });
    });

    let p1 = addRecipe(mealPlanOb[x]);
    let p2 = addRecipeToPlan(mealPlanOb.plan_name, mealPlanOb[x].id);

    Promise.all([p1, p2])
      .then(console.log)
      .catch(err => {
        console.log(err);
      });

    x++;
  }
};

module.exports = {
  getAllPlans,
  getSinglePlan,
  getRecipes,
  getSingleRecipe,
  getIngredients,
  getShoppingList,
  getRandomRecipes,
  getSimilarRecipes,
  addNewPlan,
  addRecipeToPlan,
  addPlanToDatabase
};
