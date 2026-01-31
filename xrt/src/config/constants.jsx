import slider1 from "../assets/images/slider.jpg";
import slider2 from "../assets/images/slider2.png";
import logo from "../assets/icons/logo.svg";
import item1 from "../assets/images/item1.png.webp";
import item2 from "../assets/images/item2.png.webp";
import item3 from "../assets/images/item3.png.webp";
import item4 from "../assets/images/item4.png.webp";
import item5 from "../assets/images/item5.png.webp";

import card1 from "../assets/images/card1.jpg.webp";
import card2 from "../assets/images/card2.jpg.webp";
import card3 from "../assets/images/card3.jpg.webp";

import product1 from "../assets/images/Menu_Items/pro-1-600x600.jpg";
import product2 from "../assets/images/Menu_Items/pro-10-600x600.jpg";
import product3 from "../assets/images/Menu_Items/pro-13-600x600.jpg";
import product4 from "../assets/images/Menu_Items/pro-34-600x600.jpg";
import product5 from "../assets/images/Menu_Items/pro-15-600x600.jpg";
import product6 from "../assets/images/Menu_Items/pro-16-600x600.jpg";
import product7 from "../assets/images/Menu_Items/pro-19-600x600.jpg";
import product8 from "../assets/images/Menu_Items/pro-20-600x600.jpg";
import product9 from "../assets/images/Menu_Items/pro-22-600x600.jpg";
import product10 from "../assets/images/Menu_Items/pro-23-600x600.jpg";
import product11 from "../assets/images/Menu_Items/pro-24-600x600.jpg";
import product12 from "../assets/images/Menu_Items/pro-26-600x600.jpg";
import product13 from "../assets/images/Menu_Items/pro-28-600x600.jpg";
import product14 from "../assets/images/Menu_Items/pro-3-600x600.jpg";
import product15 from "../assets/images/Menu_Items/pro-31-600x600.jpg";
import product16 from "../assets/images/Menu_Items/pro-32-600x600.jpg";
import product17 from "../assets/images/Menu_Items/pro-34-600x600.jpg";
import product18 from "../assets/images/Menu_Items/pro-36-600x600.jpg";
import product19 from "../assets/images/Menu_Items/pro-37-600x600.jpg";
import product20 from "../assets/images/Menu_Items/pro-38-600x600.jpg";
import product21 from "../assets/images/Menu_Items/pro-39-600x600.jpg";
import product22 from "../assets/images/Menu_Items/pro-40-600x600.jpg";
import product23 from "../assets/images/Menu_Items/pro-4-600x600.jpg";
import product24 from "../assets/images/Menu_Items/pro-5-600x600.jpg";
import product25 from "../assets/images/Menu_Items/pro-6-600x600.jpg";
import product26 from "../assets/images/Menu_Items/pro-7-600x600.jpg";
import product27 from "../assets/images/Menu_Items/pro-8-600x600.jpg";
import product28 from "../assets/images/Menu_Items/pro-9-600x600.jpg";
import product29 from "../assets/images/Menu_Items/pro-3-600x600.jpg";

import coupon1 from "../assets/images/offers/item2.png.webp";

{
  /*toprated*/
}
import topitem1 from "../assets/images/Top_Rated/item1.jpg.webp";
import topitem2 from "../assets/images/Top_Rated/item2.jpg.webp";
import topitem3 from "../assets/images/Top_Rated/item3.jpg.webp";
import topitem4 from "../assets/images/Top_Rated/item4.jpg.webp";
import topitem5 from "../assets/images/Top_Rated/item5.jpg.webp";

import Testimonial from "../assets/images/Testimonials/bg_Testimonials.jpg.webp";
import image1 from "../assets/images/Testimonials/person1.png.webp";
import image2 from "../assets/images/Testimonials/person2.png.webp";
import footer from "../assets/images/footer/imgi_134_footer_bg.png.webp"
import payment from "../assets/images/footer/footer_01-2.png.webp"

export { logo };

export const nav_links = [
  {
    name: "Home",
    path: "/",
    arrow: false,
  },
  {
    name: "Menu",
    path: "/menu",
    arrow: false,
  },
  {
    name: "Contact",
    path: "/contact",
    arrow: false,
  },
];

export const images_slider = [
  {
    src: slider1,
    title: "WEEKEND PROMOTIONS",
    description: "Happy Summer Combo Suber Discount",
    offer: "Sale 30% Off",
  },
  {
    src: slider2,
    title: "WEEKEND PROMOTIONS",
    description: "Happy Summer Combo Suber Discount",
    offer: "Sale 30% Off",
  },
];
import { COLORS } from "./colors";

export const Categories_items = [
  {
    bg: COLORS.categoryMarrow,
    src: item1,
    name: "Marrow",
    products: 12,
  },
  {
    bg: COLORS.categoryFruits,
    src: item2,
    name: "Fruits",
    products: 30,
  },
  {
    bg: COLORS.categoryLeafy,
    src: item3,
    name: "leafy Green",
    products: 20,
  },
  {
    bg: COLORS.categoryCookies,
    src: item4,
    name: "Cookies",
    products: 10,
  },
  {
    bg: COLORS.categoryVegan,
    src: item5,
    name: "Vegan Cuisine",
    products: 15,
  },
  {
    bg: COLORS.categoryMarrow,
    src: item1,
    name: "Marrow",
    products: 12,
  },
  {
    bg: COLORS.categoryFruits,
    src: item2,
    name: "Fruits",
    products: 30,
  },
  {
    bg: COLORS.categoryLeafy,
    src: item3,
    name: "leafy Green",
    products: 20,
  },
  {
    bg: COLORS.categoryCookies,
    src: item4,
    name: "Cookies",
    products: 10,
  },
  {
    bg: COLORS.categoryVegan,
    src: item5,
    name: "Vegan Cuisine",
    products: 15,
  },
];
export const cards_items = [
  {
    src: card1,
    title: "Fresh Vegetables",
    offer: "- 15% OFF",
    offer_color: COLORS.white,
  },
  {
    src: card2,
    title: "Vegan Restaurants",
    offer: "- 35% OFF",
    offer_color: COLORS.offerLime,
  },
  {
    src: card3,
    title: "Every Weekend",
    offer: "- 25% OFF",
    offer_color: COLORS.offerRed,
  },
];

const modifiersList = [
    {
      title: "Cheese",
      type: "single",
      default: "Lite Cheese",
      options: [
        { label: "Extra Cheese", baseExtra: 2 },
        { label: "Feta Cheese", baseExtra: 3 },
        { label: "Lite Cheese", baseExtra: 0 },
        { label: "No Cheese", baseExtra: 0 }
      ]
    },
    {
      title: "Meats",
      type: "multiple",
      default: ["Pepperoni"],
      options: [
        { label: "Ham", baseExtra: 2, hasLevel: true, hasPlacement: true },
        { label: "Bacon", baseExtra: 2, hasLevel: false, hasPlacement: true },
        { label: "Beef Topping", baseExtra: 3, hasLevel: false, hasPlacement: true },
        { label: "Salami", baseExtra: 2, hasLevel: false, hasPlacement: true },
        { label: "Grilled Chicken", baseExtra: 4, hasLevel: false, hasPlacement: false },
        { label: "Pepperoni", baseExtra: 3, hasLevel: false, hasPlacement: false },
        { label: "Sausage", baseExtra: 3, hasLevel: false, hasPlacement: false }
      ]
    },
    {
      title: "Sauces",
      type: "multiple",
      default: ["Honey Mustard"],
      options: [
        { label: "Extra Sauce", baseExtra: 1 },
        { label: "Lite Sauce", baseExtra: 0 },
        { label: "Honey Mustard", baseExtra: 0 },
        { label: "No Sauce", baseExtra: 0 }
      ]
    },
    {
      title: "Dressing",
      type: "multiple",
      default: [],
      options: [
        { label: "Blue Cheese", baseExtra: 1 },
        { label: "Ranch", baseExtra: 1 }
      ]
    },
    {
      title: "Kitchen",
      type: "multiple",
      default: ["Well Done"],
      options: [
        { label: "Crispy", baseExtra: 0 },
        { label: "Light Done", baseExtra: 0 },
        { label: "Well Done", baseExtra: 0 },
        { label: "Oil", baseExtra: 0 },
        { label: "White Pizza", baseExtra: 0 }
      ]
    }
  ];

// Original products
export const products = [
  {
    id: 1,
    src: product1,
    name: "Papaya Single",
    category: "Fruits",
    basePrice: 15, sizes: [{ label: "Small", multiplier: 1 }, { label: "Medium", multiplier: 1.3 }, { label: "Large", multiplier: 1.6 }],
    modifiers: modifiersList,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Replace this text with product description from your data.",
  },
  {
    id: 2,
    src: product2,
    name: "Papaya SingleCauliflower Pack 350g",
    category: "Fruits",
    basePrice: 15, sizes: [{ label: "Small", multiplier: 1 }, { label: "Medium", multiplier: 1.3 }, { label: "Large", multiplier: 1.6 }],
    modifiers: modifiersList,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Replace this text with product description from your data.",
  },
  {
    id: 3,
    src: product3,
    name: "Kiwi Fruit Single",
    category: "Fruits",
    basePrice: 15, sizes: [{ label: "Small", multiplier: 1 }, { label: "Medium", multiplier: 1.3 }, { label: "Large", multiplier: 1.6 }],
    modifiers: modifiersList,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Replace this text with product description from your data.",
  },
  {
    id: 4,
    src: product4,
    name: "Large Queen Apple",
    category: "Fruits",
    basePrice: 15, sizes: [{ label: "Small", multiplier: 1 }, { label: "Medium", multiplier: 1.3 }, { label: "Large", multiplier: 1.6 }],
    modifiers: modifiersList,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Replace this text with product description from your data.",
  },
  {
    id: 5,
    src: product5,
    name: "Mixed Chillies Pack 500g",
    category: "leafy Green",
    basePrice: 15, sizes: [{ label: "Small", multiplier: 1 }, { label: "Medium", multiplier: 1.3 }, { label: "Large", multiplier: 1.6 }],
    modifiers: modifiersList,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Replace this text with product description from your data.",
  },
  {
    id: 6,
    src: product6,
    name: "Cauliflower Pack 350g",
    category: "leafy Green",
    basePrice: 15, sizes: [{ label: "Small", multiplier: 1 }, { label: "Medium", multiplier: 1.3 }, { label: "Large", multiplier: 1.6 }],
    modifiers: modifiersList,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Replace this text with product description from your data.",
  },
  {
    id: 7,
    src: product7,
    name: "Freshmark Cut Spinach",
    category: "leafy Green",
    basePrice: 15, sizes: [{ label: "Small", multiplier: 1 }, { label: "Medium", multiplier: 1.3 }, { label: "Large", multiplier: 1.6 }],
    modifiers: modifiersList,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Replace this text with product description from your data.",
  },
  {
    id: 8,
    src: product8,
    name: "Steers Tomato Pack 375ml",
    category: "leafy Green",
    basePrice: 15, sizes: [{ label: "Small", multiplier: 1 }, { label: "Medium", multiplier: 1.3 }, { label: "Large", multiplier: 1.6 }],
    modifiers: modifiersList,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Replace this text with product description from your data.",
  },
  {
    id: 9,
    src: product9,
    name: "Kiwi Fruit Single",
    category: "Cookies",
    basePrice: 15, sizes: [{ label: "Small", multiplier: 1 }, { label: "Medium", multiplier: 1.3 }, { label: "Large", multiplier: 1.6 }],
    modifiers: modifiersList,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Replace this text with product description from your data.",
  },
  {
    id: 10,
    src: product10,
    name: "Mixed Chillies Pack 500g",
    category: "Cookies",
    basePrice: 15, sizes: [{ label: "Small", multiplier: 1 }, { label: "Medium", multiplier: 1.3 }, { label: "Large", multiplier: 1.6 }],
    modifiers: modifiersList,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Replace this text with product description from your data.",
  },
  {
    id: 11,
    src: product11,
    name: "East Coast Small Solo Fish",
    category: "Cookies",
    basePrice: 15, sizes: [{ label: "Small", multiplier: 1 }, { label: "Medium", multiplier: 1.3 }, { label: "Large", multiplier: 1.6 }],
    modifiers: modifiersList,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Replace this text with product description from your data.",
  },
  {
    id: 12,
    src: product12,
    name: "Papaya Single",
    category: "Cookies",
    basePrice: 15, sizes: [{ label: "Small", multiplier: 1 }, { label: "Medium", multiplier: 1.3 }, { label: "Large", multiplier: 1.6 }],
    modifiers: modifiersList,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Replace this text with product description from your data.",
  },
  {
    id: 13,
    src: product13,
    name: "Large Queen Apple",
    category: "Cookies",
    basePrice: 15, sizes: [{ label: "Small", multiplier: 1 }, { label: "Medium", multiplier: 1.3 }, { label: "Large", multiplier: 1.6 }],
    modifiers: modifiersList,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Replace this text with product description from your data.",
  },
  {
    id: 14,
    src: product14,
    name: "Mixed Chillies Pack 500g",
    category: "Cookies",
    basePrice: 15, sizes: [{ label: "Small", multiplier: 1 }, { label: "Medium", multiplier: 1.3 }, { label: "Large", multiplier: 1.6 }],
    modifiers: modifiersList,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Replace this text with product description from your data.",
  },
  {
    id: 15,
    src: product15,
    name: "Freshmark Cut Spinach",
    category: "leafy Green",
    basePrice: 15, sizes: [{ label: "Small", multiplier: 1 }, { label: "Medium", multiplier: 1.3 }, { label: "Large", multiplier: 1.6 }],
    modifiers: modifiersList,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Replace this text with product description from your data.",
  },
  {
    id: 16,
    src: product16,
    name: "Steers Tomato Pack 375ml",
    category: "Vegan Cuisine",
    basePrice: 15, sizes: [{ label: "Small", multiplier: 1 }, { label: "Medium", multiplier: 1.3 }, { label: "Large", multiplier: 1.6 }],
    modifiers: modifiersList,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Replace this text with product description from your data.",
  },
  {
    id: 17,
    src: product17,
    name: "Large Queen Apple",
    category: "Vegan Cuisine",
    basePrice: 15, sizes: [{ label: "Small", multiplier: 1 }, { label: "Medium", multiplier: 1.3 }, { label: "Large", multiplier: 1.6 }],
    modifiers: modifiersList,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Replace this text with product description from your data.",
  },
  {
    id: 18,
    src: product18,
    name: "Mixed Chillies Pack 500g",
    category: "Vegan Cuisine",
    basePrice: 15, sizes: [{ label: "Small", multiplier: 1 }, { label: "Medium", multiplier: 1.3 }, { label: "Large", multiplier: 1.6 }],
    modifiers: modifiersList,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Replace this text with product description from your data.",
  },
  {
    id: 19,
    src: product19,
    name: "Mixed Chillies Pack 500g",
    category: "Vegan Cuisine",
    basePrice: 15, sizes: [{ label: "Small", multiplier: 1 }, { label: "Medium", multiplier: 1.3 }, { label: "Large", multiplier: 1.6 }],
    modifiers: modifiersList,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Replace this text with product description from your data.",
  },
  {
    id: 20,
    src: product20,
    name: "Mixed Chillies Pack 500g",
    category: "Vegan Cuisine",
    basePrice: 15, sizes: [{ label: "Small", multiplier: 1 }, { label: "Medium", multiplier: 1.3 }, { label: "Large", multiplier: 1.6 }],
    modifiers: modifiersList,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Replace this text with product description from your data.",
  },
  {
    id: 21,
    src: product21,
    name: "Mixed Chillies Pack 500g",
    category: "Vegan Cuisine",
    basePrice: 15, sizes: [{ label: "Small", multiplier: 1 }, { label: "Medium", multiplier: 1.3 }, { label: "Large", multiplier: 1.6 }],
    modifiers: modifiersList,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Replace this text with product description from your data.",
  },
  {
    id: 22,
    src: product22,
    name: "Mixed Chillies Pack 500g",
    category: "Marrow",
    basePrice: 15, sizes: [{ label: "Small", multiplier: 1 }, { label: "Medium", multiplier: 1.3 }, { label: "Large", multiplier: 1.6 }],
    modifiers: modifiersList,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Replace this text with product description from your data.",
  },
  {
    id: 23,
    src: product23,
    name: "Mixed Chillies Pack 500g",
    category: "Marrow",
    basePrice: 15, sizes: [{ label: "Small", multiplier: 1 }, { label: "Medium", multiplier: 1.3 }, { label: "Large", multiplier: 1.6 }],
    modifiers: modifiersList,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Replace this text with product description from your data.",
  },
  {
    id: 24,
    src: product24,
    name: "Mixed Chillies Pack 500g",
    category: "Marrow",
    basePrice: 15, sizes: [{ label: "Small", multiplier: 1 }, { label: "Medium", multiplier: 1.3 }, { label: "Large", multiplier: 1.6 }],
    modifiers: modifiersList,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Replace this text with product description from your data.",
  },
  {
    id: 25,
    src: product25,
    name: "Mixed Chillies Pack 500g",
    category: "Marrow",
    basePrice: 15, sizes: [{ label: "Small", multiplier: 1 }, { label: "Medium", multiplier: 1.3 }, { label: "Large", multiplier: 1.6 }],
    modifiers: modifiersList,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Replace this text with product description from your data.",
  },
  {
    id: 26,
    src: product26,
    name: "Mixed Chillies Pack 500g",
    category: "Marrow",
    basePrice: 15, sizes: [{ label: "Small", multiplier: 1 }, { label: "Medium", multiplier: 1.3 }, { label: "Large", multiplier: 1.6 }],
    modifiers: modifiersList,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Replace this text with product description from your data.",
  },
  {
    id: 27,
    src: product27,
    name: "Mixed Chillies Pack 500g",
    category: "Marrow",
    basePrice: 15, sizes: [{ label: "Small", multiplier: 1 }, { label: "Medium", multiplier: 1.3 }, { label: "Large", multiplier: 1.6 }],
    modifiers: modifiersList,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Replace this text with product description from your data.",
  },
  {
    id: 28,
    src: product28,
    name: "Mixed Chillies Pack 500g",
    category: "Vegan Cuisine",
    basePrice: 15, sizes: [{ label: "Small", multiplier: 1 }, { label: "Medium", multiplier: 1.3 }, { label: "Large", multiplier: 1.6 }],
    modifiers: modifiersList,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Replace this text with product description from your data.",
  },
  {
    id: 29,
    src: product29,
    name: "Mixed Chillies Pack 500g",
    category: "Marrow",
    basePrice: 15, sizes: [{ label: "Small", multiplier: 1 }, { label: "Medium", multiplier: 1.3 }, { label: "Large", multiplier: 1.6 }],
    modifiers: modifiersList,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Replace this text with product description from your data.",
  },
];

export const coupons = {
  ProductName: "Fresh Fruits",
  src: coupon1,
  offer: "50%",
};

export const Top_Rated_Items = [
  {
    src: topitem1,
    name: "Soup & Stew Mix Pack 1.5kg",
    basePrice: 15,
    offer: "£546.64",
  },
  {
    src: topitem2,
    name: "Kiwi Fruit Single",
    basePrice: 15,
    offer: "£546.64",
  },
  {
    src: topitem3,
    name: "Mixed Chillies Pack 500g",
    basePrice: 15,
    offer: "£546.64",
  },
  {
    src: topitem4,
    name: "Large Queen Apple",
    basePrice: 15,
    offer: "£546.64",
  },
  {
    src: topitem5,
    name: "Papaya Single",
    basePrice: 15,
    offer: "£546.64",
  },
  {
    src: topitem1,
    name: "Soup & Stew Mix Pack 1.5kg",
    basePrice: 15,
    offer: "£546.64",
  },
  {
    src: topitem2,
    name: "Kiwi Fruit Single",
    basePrice: 15,
    offer: "£546.64",
  },
  {
    src: topitem3,
    name: "Mixed Chillies Pack 500g",
    basePrice: 15,
    offer: "£546.64",
  },
  {
    src: topitem4,
    name: "Large Queen Apple",
    basePrice: 15,
    offer: "£546.64",
  },
];

export const Testimonials_bg = {
  src: Testimonial,
};
export const Testimonials_content = [
  {
    image: image1,
    name: "Rahab Munir",
    feedback:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Replace this text with testimonial description from your data.",
    Role: "The Body Shop",
  },
  {
    image: image2,
    name: "Rose Smith",
    feedback:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Replace this text with testimonial description from your data.",
    Role: "The Body Shop",
  },
];

export const footer_image =
{
  bg: footer,
  pay:payment
}

export const STORE_LOCATION = {
  location: "9066 Green Lake Drive Chevy Chase, MD 20815",
  mail: "contact@example.com",
  phone: "(1800)-88-66-991",
};

export const MY_ACCOUNT = ["My Account", "Contact", "Shopping Cart", "Shop"];
export const CATEGORIES_Footer = [
  "Pizza",
  "Calzones",
  "Hot Subs",
  "Cold Subs",
  "Wraps",
  "Appetizers",
  "Salads",
  "Desserts",
];
export const CATEGORIES_Footer_2 = [
  "Pasta Dinners",
  "Dinner Plates",
  "Burgers",
  "Side Orders",
  "Combos",
  "Kids’ Meals",
  "Beverages",
];


//contact page
export const CONTACT_INFO = {
  address: "272 Rodney St, Brooklyn, NY 11211 76 East Houston Street New York",
  hotline: "1900 26886",
  phone: "(1800)-88-66-991",
  email: "hello@organey.com",
  working_time:["Monday - Friday: 08:30 - 20:00","Saturday & Sunday: 09:30 - 21:30"],
}
