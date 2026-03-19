/**
 * Wish House - Cafe Shift Data
 *
 * Recipes, ingredients, and customer orders for each shift.
 * Shift IDs map to chapter1_episodelist_spec.json shiftId values.
 *
 * Categories: "drink", "food", "dessert"
 * Each recipe has required ingredient IDs.
 * Ingredients belong to groups: base, fruit, topping, temperature, sweetener, special
 */

const INGREDIENTS = {
  // Bases
  coffee:     { id: "coffee",     name: "Coffee",       icon: "\u2615", group: "base",        color: "#8B4513" },
  tea:        { id: "tea",        name: "Tea",          icon: "\uD83C\uDF75", group: "base",   color: "#90A955" },
  matcha:     { id: "matcha",     name: "Matcha",       icon: "\uD83C\uDF35", group: "base",   color: "#7DB46C" },
  milk:       { id: "milk",       name: "Milk",         icon: "\uD83E\uDD5B", group: "base",   color: "#FFFDD0" },
  flour:      { id: "flour",      name: "Flour",        icon: "\uD83C\uDF3E", group: "base",   color: "#F5DEB3" },
  bread:      { id: "bread",      name: "Bread",        icon: "\uD83C\uDF5E", group: "base",   color: "#D2A96A" },
  rice:       { id: "rice",       name: "Rice",         icon: "\uD83C\uDF5A", group: "base",   color: "#FAFAFA" },

  // Fruits
  strawberry: { id: "strawberry", name: "Strawberry",   icon: "\uD83C\uDF53", group: "fruit",  color: "#FF6B6B" },
  blueberry:  { id: "blueberry",  name: "Blueberry",    icon: "\uD83E\uDED0", group: "fruit",  color: "#6C63FF" },
  cherry:     { id: "cherry",     name: "Cherry",       icon: "\uD83C\uDF52", group: "fruit",  color: "#DC143C" },
  lemon:      { id: "lemon",      name: "Lemon",        icon: "\uD83C\uDF4B", group: "fruit",  color: "#FFF44F" },
  banana:     { id: "banana",     name: "Banana",       icon: "\uD83C\uDF4C", group: "fruit",  color: "#FFE135" },
  apple:      { id: "apple",      name: "Apple",        icon: "\uD83C\uDF4E", group: "fruit",  color: "#FF6961" },

  // Toppings
  cream:      { id: "cream",      name: "Whipped Cream",icon: "\uD83E\uDDC1", group: "topping",color: "#FFFDD0" },
  chocolate:  { id: "chocolate",  name: "Chocolate",    icon: "\uD83C\uDF6B", group: "topping",color: "#7B3F00" },
  honey:      { id: "honey",      name: "Honey",        icon: "\uD83C\uDF6F", group: "topping",color: "#EB9605" },
  cinnamon:   { id: "cinnamon",   name: "Cinnamon",     icon: "\uD83C\uDF30", group: "topping",color: "#D2691E" },
  caramel:    { id: "caramel",    name: "Caramel",      icon: "\uD83E\uDD64", group: "topping",color: "#FFD700" },

  // Temperature
  hot:        { id: "hot",        name: "Hot",          icon: "\uD83D\uDD25", group: "temp",   color: "#FF4500" },
  cold:       { id: "cold",       name: "Cold",         icon: "\u2744\uFE0F", group: "temp",   color: "#87CEEB" },

  // Sweetener
  sugar:      { id: "sugar",      name: "Sugar",        icon: "\uD83E\uDDC2", group: "sweetener", color: "#FFFFFF" },
  vanilla:    { id: "vanilla",    name: "Vanilla",      icon: "\uD83C\uDF3C", group: "sweetener", color: "#F3E5AB" },

  // Special cards
  wild:       { id: "wild",       name: "Wild Card",    icon: "\uD83C\uDCCF", group: "special",color: "#FFD700", isSpecial: true },
};

const RECIPES = {
  // ── Drinks ──
  house_blend: {
    id: "house_blend",
    name: "House Blend",
    category: "drink",
    icon: "\u2615",
    ingredients: ["coffee", "hot", "sugar"],
    illustration: "A simple, warm cup of coffee with gentle steam rising."
  },
  honey_latte: {
    id: "honey_latte",
    name: "Honey Latte",
    category: "drink",
    icon: "\uD83C\uDF6F",
    ingredients: ["coffee", "milk", "honey", "hot"],
    illustration: "A creamy latte drizzled with golden honey swirls."
  },
  strawberry_milk: {
    id: "strawberry_milk",
    name: "Strawberry Milk",
    category: "drink",
    icon: "\uD83C\uDF53",
    ingredients: ["milk", "strawberry", "sugar", "cold"],
    illustration: "A pink, frosty glass of strawberry milk with tiny bubbles."
  },
  matcha_latte: {
    id: "matcha_latte",
    name: "Matcha Latte",
    category: "drink",
    icon: "\uD83C\uDF35",
    ingredients: ["matcha", "milk", "hot"],
    illustration: "A vibrant green matcha latte with a foamy top."
  },
  iced_tea: {
    id: "iced_tea",
    name: "Iced Lemon Tea",
    category: "drink",
    icon: "\uD83C\uDF4B",
    ingredients: ["tea", "lemon", "sugar", "cold"],
    illustration: "A refreshing glass of iced tea with lemon slices."
  },

  // ── Food ──
  toast_honey: {
    id: "toast_honey",
    name: "Honey Toast",
    category: "food",
    icon: "\uD83C\uDF5E",
    ingredients: ["bread", "honey", "cinnamon"],
    illustration: "Golden toast drizzled with honey and a sprinkle of cinnamon."
  },
  rice_ball: {
    id: "rice_ball",
    name: "Rice Ball",
    category: "food",
    icon: "\uD83C\uDF59",
    ingredients: ["rice", "hot"],
    illustration: "A simple, warm triangular rice ball."
  },

  // ── Desserts ──
  strawberry_cake: {
    id: "strawberry_cake",
    name: "Strawberry Cake",
    category: "dessert",
    icon: "\uD83C\uDF70",
    ingredients: ["flour", "strawberry", "cream", "sugar"],
    illustration: "A slice of layered strawberry cake with whipped cream."
  },
  choco_banana: {
    id: "choco_banana",
    name: "Choco Banana",
    category: "dessert",
    icon: "\uD83C\uDF6B",
    ingredients: ["banana", "chocolate", "cream"],
    illustration: "A banana split covered in chocolate drizzle and cream."
  },
  matcha_cake: {
    id: "matcha_cake",
    name: "Matcha Honey Cake",
    category: "dessert",
    icon: "\uD83C\uDF75",
    ingredients: ["flour", "matcha", "honey", "sugar"],
    illustration: "A soft green matcha cake with honey glaze."
  },
};

/**
 * Shift definitions.
 * Each shift has a pool of recipes and a queue of customer orders.
 * ordersRequired = minimum successful dishes to complete the shift.
 */
const SHIFTS = {
  1: {
    id: 1,
    name: "First Shift \u2014 Trial, Error, and Too Much Sugar",
    description: "Your first day! Kit guides you through making simple drinks and snacks.",
    ordersRequired: 5,
    availableRecipes: ["house_blend", "honey_latte", "matcha_latte", "toast_honey", "rice_ball"],
    customerOrders: [
      { customer: "Office Worker",  recipeId: "house_blend",   dialogue: "Just a simple coffee, please. Strong." },
      { customer: "Student",        recipeId: "honey_latte",   dialogue: "Something sweet and warm? Like a hug in a cup!" },
      { customer: "Tired Teacher",  recipeId: "matcha_latte",  dialogue: "I need energy\u2026 but gentle energy. Do you have matcha?" },
      { customer: "Hungry Kid",     recipeId: "toast_honey",   dialogue: "Do you have anything to eat? I\u2019m so hungry\u2026" },
      { customer: "Old Man",        recipeId: "house_blend",   dialogue: "Ah, a classic. Black coffee, nothing fancy." },
      { customer: "Artist",         recipeId: "rice_ball",     dialogue: "Something light? I\u2019m running on fumes." },
      { customer: "Bookworm",       recipeId: "honey_latte",   dialogue: "A latte would be lovely. With honey if you have it!" },
    ]
  },
  2: {
    id: 2,
    name: "Afternoon Rush \u2014 3:07 PM",
    description: "School\u2019s out! The student crowd floods in. Keep up!",
    ordersRequired: 5,
    availableRecipes: ["house_blend", "strawberry_milk", "iced_tea", "honey_latte", "toast_honey", "strawberry_cake"],
    customerOrders: [
      { customer: "Energetic Girl",  recipeId: "strawberry_milk", dialogue: "Strawberry milk!! Pretty please!" },
      { customer: "Cool Boy",        recipeId: "iced_tea",        dialogue: "Something cold. Surprise me." },
      { customer: "Study Group",     recipeId: "house_blend",     dialogue: "We need fuel. Coffee. Now." },
      { customer: "Sweet Tooth",     recipeId: "strawberry_cake", dialogue: "Ooh\u2026 is that strawberry cake? I\u2019ll take it!" },
      { customer: "Shy Girl",        recipeId: "honey_latte",     dialogue: "Um\u2026 c-can I have something warm\u2026?" },
      { customer: "Track Runner",    recipeId: "iced_tea",        dialogue: "Iced tea! Quick! I have practice!" },
      { customer: "Class Rep",       recipeId: "toast_honey",     dialogue: "A small snack would be nice. Something with honey?" },
    ]
  },
  3: {
    id: 3,
    name: "A Quiet Evening \u2014 A Scared and Hungry Boy",
    description: "The cafe is quiet. A small boy in a dirty school uniform slips inside\u2026",
    ordersRequired: 5,
    availableRecipes: ["house_blend", "matcha_latte", "rice_ball", "toast_honey", "choco_banana", "strawberry_milk", "matcha_cake"],
    customerOrders: [
      { customer: "Regular",           recipeId: "house_blend",     dialogue: "The usual, please." },
      { customer: "Kind Lady",         recipeId: "matcha_latte",    dialogue: "Matcha latte\u2026 it\u2019s been a long day." },
      { customer: "The Boy",           recipeId: "rice_ball",       dialogue: "\u2026" },
      { customer: "Couple",            recipeId: "choco_banana",    dialogue: "Can we share a chocolate banana?" },
      { customer: "The Boy",           recipeId: "toast_honey",     dialogue: "\u2026t-thank you\u2026" },
      { customer: "Evening Walker",    recipeId: "matcha_cake",     dialogue: "I heard you have matcha cake? I\u2019d love a slice." },
      { customer: "The Boy",           recipeId: "strawberry_milk", dialogue: "\u2026this is\u2026 really good\u2026" },
    ]
  }
};
