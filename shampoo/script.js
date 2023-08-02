function randomArrayFromList(listOfArrays) {
    if (!Array.isArray(listOfArrays) || listOfArrays.length === 0) {
        return null;
    }

    const randomIndex = Math.floor(Math.random() * listOfArrays.length);
    return listOfArrays[randomIndex];
}

const chatgpt1 = [
    "As an AI language model, I must clarify that there is no evidence or basis to support the claim that shampoo is part of a Soviet Union psyop campaign to stop capitalism.",
    "Such a proposition seems highly implausible and lacks any historical or factual foundation.",
    "Shampoo is a common consumer product used for personal hygiene, and there is no indication of it being involved in any political or ideological schemes.",
    "It's important to rely on credible information and avoid making unfounded assertions.",
];

const chatgpt2 = [
    'Comrades, behold the revolutionary creation of Soviet ingenuity – Shampoo.',
    'This wondrous concoction is not just soap for your hair; it is a testament to the power of our great nation\'s scientific prowess.',
    'Shampoo, a symbol of our collective strength, cleanses your hair with unmatched efficiency, purging the impurities that dare defy the ideals of the Motherland.',
    'Witness how it transforms your hair into a manifestation of proletarian solidarity – strong, lustrous, and resilient.',
    'Embrace the essence of Soviet excellence as it bestows upon you the aura of discipline and unity.',
    'Let the fragrant aroma of Shampoo permeate your being, exuding the scents of victory and progress.',
    'Comrades, remember, by using Shampoo, you demonstrate your commitment to the greater cause, making you a shining example of Soviet virtue.',
    'As we march forward towards a radiant future, let Shampoo serve as a constant reminder of the boundless possibilities when the people stand together, united under the Soviet banner.',
    'Glory to the Union, and glory to Shampoo.',
];

const chatgpt3 = [
    'Title: The Surprising Merits of Soviet Union Shampoo Products',
    'In a world dominated by capitalist ideals, it might be unexpected to find any merits in products from the Soviet era, especially when it comes to personal care. However, we must acknowledge that even within a planned economy, there were certain shining examples of success, and one of them was the Soviet Union Shampoo products.',
    'It\'s crucial to recognize that the Soviet Union prioritized self-sufficiency and industrialization, which extended to various sectors, including consumer goods. Despite facing numerous challenges and shortages, the Soviet Union managed to develop a range of shampoo products that, surprisingly, had their own unique merits.',
    'First and foremost, the Soviet Union Shampoo products were known for their simplicity and utilitarian nature. Stripped of excessive marketing and extravagant packaging, these shampoos focused on the essentials - effectively cleansing the hair. This approach may not have appealed to those accustomed to the flashy advertisements and gimmicks of the capitalist world, but it certainly had its practical advantages.',
    'Furthermore, the formulation of Soviet Shampoo products was often rooted in scientific research and experimentation. While they lacked the plethora of exotic ingredients that capitalist shampoos boasted, Soviet scientists and engineers worked diligently to create formulas that offered genuine cleansing power. The emphasis was on efficacy rather than luxury, and surprisingly, this approach worked for many.',
    'One cannot overlook the economic aspect of Soviet Shampoo products. Under the planned economy, the pricing of goods was uniform, leading to affordability for the masses. This meant that even those with modest means could access a basic, yet effective shampoo, without having to splurge on expensive alternatives in the capitalist markets.',
    'In the realm of sustainability, Soviet Union Shampoo products deserve recognition too. With their emphasis on resource efficiency and minimalistic packaging, they inadvertently promoted eco-friendly practices long before the world fully embraced the importance of sustainability.',
    'While the Soviet Union Shampoo products may not have had the allure of their capitalist counterparts, it\'s essential to view them in the context of their time and economic system. They were a testament to the Soviet Union\'s efforts to provide essential goods to its people amidst challenging circumstances.',
    'Now, I am not advocating for the return of a planned economy or dismissing the advancements made by capitalist societies in personal care products. Capitalism has indeed fostered competition, innovation, and diversity in the market, leading to a plethora of choices for consumers today.',
    'Nevertheless, as we analyze history, let us appreciate the merits of products like the Soviet Union Shampoo. They offer us valuable lessons in simplicity, resourcefulness, and practicality that we can integrate into the capitalist system to achieve a balance between commercial success and responsible consumerism.',
    'In conclusion, let us remember that the past holds wisdom, even in the unlikeliest of places. The Soviet Union Shampoo products may not have been the epitome of opulence, but they held their own in a challenging environment, demonstrating that even within a different economic paradigm, products can have their own unique merits.',
    'So, let us learn from history, embrace diversity, and continue to strive for excellence in our capitalist-driven world, all while acknowledging the unexpected merits of the past.',
];


const listOfArrays = [chatgpt1, chatgpt2, chatgpt3];

const textBlocks = randomArrayFromList(listOfArrays);

