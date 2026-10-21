import type { Product } from './products';

/*
 * Seuls les produits listés ici sont affichés : aucune marque n’apparaît ailleurs dans le site.
 * Les ASIN viennent de fiches amazon.fr vues le 2026-10-21, jamais devinés ; la composition est
 * celle lue sur la fiche du fabricant, dont l’adresse est dans `sourceUrl`. Au plus deux produits
 * par type, de marques différentes, rangés par marque : l’ordre ne traduit aucun classement.
 * `validated` est la date de la proposition : Phil doit encore ouvrir et confirmer chaque lien.
 */
export const CATALOGUE: readonly Product[] = [
  // Thé vert
  {
    id: 'dammann-green-01',
    name: 'Thé vert sencha du Japon en sachets',
    brand: 'Dammann Frères',
    tea: 'green',
    asin: 'B07FPK4KS8',
    ingredients: ['Green tea (Camellia sinensis)'],
    flavoured: false,
    sourceUrl: 'https://www.dammann.fr/en/sencha-fukuyu-box-of-25-cristal-sachets.html',
    validated: '2026-10-21',
  },

  // Matcha
  {
    id: 'kusmi-matcha-01',
    name: 'Matcha cérémonial en poudre, bio',
    brand: 'Kusmi Tea',
    tea: 'matcha',
    asin: 'B0GYDY9MXN',
    ingredients: ['Organic Japanese green tea powder*'],
    flavoured: false,
    sourceUrl: 'https://www.kusmitea.com/en/products/ceremonial-matcha',
    validated: '2026-10-21',
  },
  {
    id: 'naturalebio-matcha-01',
    name: 'Matcha cérémonial en poudre, bio',
    brand: 'NaturaleBio',
    tea: 'matcha',
    asin: 'B01N7PI3SO',
    ingredients: ['Organic matcha powder'],
    flavoured: false,
    sourceUrl: 'https://naturalebio.com/products/te-matcha-ceremonial',
    validated: '2026-10-21',
  },

  // Thé blanc
  {
    id: 'valleyoftea-white-01',
    name: 'Thé blanc Bai Mu Dan en vrac',
    brand: 'Valley of Tea',
    tea: 'white',
    asin: 'B00ZXJSA82',
    ingredients: ['100% pure white tea buds, leaves and twigs'],
    flavoured: false,
    sourceUrl: 'https://www.valleyoftea.com/collections/white-tea/products/whitepeony',
    validated: '2026-10-21',
  },

  // Oolong
  {
    id: 'chabiothe-oolong-01',
    name: 'Thé oolong Tie Guan Yin en vrac, bio',
    brand: 'Chabiothé',
    tea: 'oolong',
    asin: 'B07C7YXRHZ',
    ingredients: [
      'thé Oolong Tie Guan Yin, origine Chine, province de Fujian (issu de l’agriculture biologique)',
    ],
    flavoured: false,
    sourceUrl: 'https://chabiothe.fr/oolong/49-71-the-oolong-bio',
    validated: '2026-10-21',
  },

  // Thé noir
  {
    id: 'dammann-black-01',
    name: 'Thé noir Darjeeling d’été en sachets',
    brand: 'Dammann Frères',
    tea: 'black',
    asin: 'B00FFCIFH8',
    ingredients: ['Black tea (Camellia sinensis)'],
    flavoured: false,
    sourceUrl: 'https://www.dammann.fr/en/darjeeling-24-sachets-cristal-suremballes.html',
    validated: '2026-10-21',
  },

  // Chaï
  {
    id: 'chabiothe-chai-01',
    name: 'Thé noir Assam aux épices de type chaï, bio',
    brand: 'Chabiothé',
    tea: 'chai',
    asin: 'B01DMD92UU',
    ingredients: [
      'Thé noir Assam (Inde), cannelle, gingembre, cardamome, girofle, poivre, baies roses (100% issu de l’agriculture biologique)',
    ],
    flavoured: true,
    sourceUrl: 'https://chabiothe.fr/the-noir/12-16-the-noir-chai-bio',
    validated: '2026-10-21',
  },
  {
    id: 'kusmi-chai-01',
    name: 'Thé noir aux épices de type chaï, bio',
    brand: 'Kusmi Tea',
    tea: 'chai',
    asin: 'B09NJNVXZ3',
    ingredients: [
      'Black tea* (64%)',
      'Spices* (cardamom*, cinnamon*, ginger*, aniseed*, bay leaf*, clove*, eucalyptus*) (35%)',
      'Natural flavors (spice)',
      '(*Organically grown ingredients)',
    ],
    flavoured: true,
    sourceUrl: 'https://www.kusmitea.com/en/products/kashmir-tchai',
    validated: '2026-10-21',
  },

  // Rooibos
  {
    id: 'twinings-rooibos-01',
    name: 'Rooibos nature, sachets',
    brand: 'Twinings',
    tea: 'rooibos',
    asin: 'B0051VS17W',
    ingredients: ['Rooibos'],
    flavoured: false,
    sourceUrl: 'https://twiningsusa.com/products/pure-rooibos',
    validated: '2026-10-21',
  },

  // Camomille
  {
    id: 'marmottes-chamomile-01',
    name: 'Infusion de camomille matricaire, sachets',
    brand: 'Les 2 Marmottes',
    tea: 'chamomile',
    asin: 'B00AN8NJO8',
    ingredients: ['camomille matricaire Matricaria recutita 100%'],
    flavoured: false,
    sourceUrl: 'https://www.les2marmottes.com/products/camomille-matricaire',
    validated: '2026-10-21',
  },
  {
    id: 'twinings-chamomile-01',
    name: 'Infusion de camomille pure, sachets',
    brand: 'Twinings',
    tea: 'chamomile',
    asin: 'B00HAFZUDA',
    ingredients: ['Camomille'],
    flavoured: false,
    sourceUrl: 'https://twinings.co.uk/products/pure-camomile-20-tea-bags',
    validated: '2026-10-21',
  },

  // Menthe
  {
    id: 'twinings-mint-01',
    name: 'Infusion de menthe poivrée pure, sachets',
    brand: 'Twinings',
    tea: 'mint',
    asin: 'B003UFM8HU',
    ingredients: ['Menthe poivrée'],
    flavoured: false,
    sourceUrl: 'https://twinings.co.uk/products/pure-peppermint-20-tea-bags',
    validated: '2026-10-21',
  },

  // Verveine
  {
    id: 'pages-verbena-01',
    name: 'Infusion de verveine bio, sachets',
    brand: 'Pagès',
    tea: 'verbena',
    asin: 'B072RC11FW',
    ingredients: ['100% Verveine feuilles Bio'],
    flavoured: false,
    sourceUrl: 'https://www.pages.fr/fr/infusions/86-product-3398984220383.html',
    validated: '2026-10-21',
  },

  // Fruits
  {
    id: 'marmottes-fruit-01',
    name: 'Infusion de fruits et d’hibiscus (cassis, framboise, pomme), sachets',
    brand: 'Les 2 Marmottes',
    tea: 'fruit',
    asin: 'B099X6XB1X',
    ingredients: [
      'fruits 32% (pomme 11%, cassis 10%, framboise 9%, airelle 2%)',
      'feuille de cassis',
      'fleur d’hibiscus 21,3%',
      'cynorrhodon',
      'pétale de rose',
      'feuille de stévia',
    ],
    flavoured: true,
    sourceUrl: 'https://www.les2marmottes.com/products/melee-de-fruits-cassis-framboise-pomme',
    validated: '2026-10-21',
  },
  {
    id: 'twinings-fruit-01',
    name: 'Infusion à l’hibiscus aromatisée fraise, myrtille et grenade, sachets',
    brand: 'Twinings',
    tea: 'fruit',
    asin: 'B0FD3YN7WR',
    ingredients: [
      'Hibiscus',
      'feuilles de mûre',
      'citronnelle',
      'arôme naturel (7%)',
      'réglisse',
      'arôme naturel de myrtille avec d’autres arômes naturels (4%)',
      'arôme naturel de grenade avec d’autres arômes naturels (1%)',
    ],
    flavoured: true,
    sourceUrl: 'https://twinings.fr/products/infusion-ayurveda-fraise-myrtille-grenade',
    validated: '2026-10-21',
  },
];
