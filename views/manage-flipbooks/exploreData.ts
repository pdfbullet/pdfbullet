
// FIX: Added helper function `getTenPages` and its data source `imageCollections` to resolve 'Cannot find name' errors.
const imageCollections = [
  // Collection 0: Gardening
  [
    'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800',
    'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800',
    'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800',
    'https://images.unsplash.com/photo-1587329249099-a1009943e913?w=800',
    'https://images.unsplash.com/photo-1526344927397-d8b1875a6153?w=800',
    'https://images.unsplash.com/photo-1592233292244-a65c464459a9?w=800',
    'https://images.unsplash.com/photo-1557997323-283d6e3443b7?w=800',
    'https://images.unsplash.com/photo-1604782355523-2b217dc39e76?w=800',
    'https://images.unsplash.com/photo-1587843683522-8349479b478d?w=800',
    'https://images.unsplash.com/photo-1621837571869-722c83c27b0c?w=800',
  ],
  // Collection 1: Street Photography
  [
    'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=800',
    'https://images.unsplash.com/photo-1489743342057-3448cc7c3bb9?w=800',
    'https://images.unsplash.com/photo-1517672101342-43a5792f3980?w=800',
    'https://images.unsplash.com/photo-1519011915995-6663f647c036?w=800',
    'https://images.unsplash.com/photo-1485081669829-bacb8c7bb1f3?w=800',
    'https://images.unsplash.com/photo-1506548773957-3f3d6c03975a?w=800',
    'https://images.unsplash.com/photo-1511216113915-27351154f2a5?w=800',
    'https://images.unsplash.com/photo-1508344583163-95b773024def?w=800',
    'https://images.unsplash.com/photo-1496332154546-d4b1a45452f4?w=800',
    'https://images.unsplash.com/photo-1517997903871-3c5b306b987b?w=800',
  ],
  // Collection 2: Tech
  [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726a?w=800',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800',
    'https://images.unsplash.com/photo-1504610926078-a1611febcad3?w=800',
    'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800',
    'https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?w=800',
    'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800',
    'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800',
    'https://images.unsplash.com/photo-1550009158-94ae7655244d?w=800',
  ],
  // Collection 3: Wildlife
  [
    'https://images.unsplash.com/photo-1504829823946-2d3a4b86bdef?w=800',
    'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=800',
    'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800',
    'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=800',
    'https://images.unsplash.com/photo-1516934024742-b3023241b222?w=800',
    'https://images.unsplash.com/photo-1475809913162-68a0de342117?w=800',
    'https://images.unsplash.com/photo-1570481662006-a823a0efb32e?w=800',
    'https://images.unsplash.com/photo-1557050543-4d5f4e07d7c2?w=800',
    'https://images.unsplash.com/photo-1549480017-d76466a4b3d4?w=800',
    'https://images.unsplash.com/photo-1560114928-40f1f1eb26a0?w=800',
  ],
  // Collection 4: Coastal
  [
    'https://images.unsplash.com/photo-1509305717900-84f40e786d82?w=800',
    'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800',
    'https://images.unsplash.com/photo-1507525428034-b723a996f3d1?w=800',
    'https://images.unsplash.com/photo-1493558103817-58b2924bce98?w=800',
    'https://images.unsplash.com/photo-1540206395-68808572332f?w=800',
    'https://images.unsplash.com/photo-1533109721025-d1ae7ee7c1e1?w=800',
    'https://images.unsplash.com/photo-1505881502353-a1780c103291?w=800',
    'https://images.unsplash.com/photo-1512418490861-12c3b8d7561f?w=800',
    'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800',
    'https://images.unsplash.com/photo-1513814041334-a745b40c4228?w=800',
  ],
  // Collection 5: Crafts
  [
    'https://images.unsplash.com/photo-1541696448366-262c641b6b66?w=800',
    'https://images.unsplash.com/photo-1600172152334-199343723472?w=800',
    'https://images.unsplash.com/photo-1581102693724-c15c72951e70?w=800',
    'https://images.unsplash.com/photo-1569172122372-d59993133f6e?w=800',
    'https://images.unsplash.com/photo-1596464716127-11e8139b4b88?w=800',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
    'https://images.unsplash.com/photo-1579762715939-2e11c8d415b3?w=800',
    'https://images.unsplash.com/photo-1513645313134-c48324f68593?w=800',
    'https://images.unsplash.com/photo-1524234028042-a169b359ab6c?w=800',
    'https://images.unsplash.com/photo-1563291074-2bf8677a6e5e?w=800',
  ],
  // Collection 6: Fashion
  [
    'https://ik.imagekit.io/fonepay/flipbook%20/demo-page-1.jpg?updatedAt=1762173459218',
    'https://ik.imagekit.io/fonepay/flipbook%20/demo-page-2.jpg?updatedAt=1762173459193',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800',
    'https://images.unsplash.com/photo-1499933374219-4c55b8a9c67a?w=800',
    'https://images.unsplash.com/photo-1509319117193-57bab727e09d?w=800',
    'https://images.unsplash.com/photo-1581044777550-4cfa6ce67943?w=800',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
    'https://images.unsplash.com/photo-1552668693-2be514a1b02d?w=800',
    'https://images.unsplash.com/photo-1534653299134-96a171b91856?w=800',
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800',
  ],
  // Collection 7: Minimalist
  [
    'https://ik.imagekit.io/fonepay/flipbook%20/demo-page-4.jpg?updatedAt=1762173459178',
    'https://ik.imagekit.io/fonepay/flipbook%20/demo-page-5.jpg?updatedAt=1762173459176',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    'https://images.unsplash.com/photo-1501127122-f38540143530?w=800',
    'https://images.unsplash.com/photo-1531891437562-b32b6c063b87?w=800',
    'https://images.unsplash.com/photo-1481277542470-605612bd2d61?w=800',
    'https://images.unsplash.com/photo-1528740561666-dc2479703592?w=800',
    'https://images.unsplash.com/photo-1536566482680-fca31930a085?w=800',
    'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=800',
    'https://images.unsplash.com/photo-1487700160041-bab374948432?w=800',
  ],
  // Collection 8: Urban
  [
    'https://ik.imagekit.io/fonepay/flipbook%20/demo-page-6.jpg?updatedAt=1762173459345',
    'https://ik.imagekit.io/fonepay/flipbook%20/demo-page-7.jpg?updatedAt=1762173459381',
    'https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=800',
    'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800',
    'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800',
    'https://images.unsplash.com/photo-1464817739973-0128fe77aaa1?w=800',
    'https://images.unsplash.com/photo-1486299267070-d1b4b1de15d1?w=800',
    'https://images.unsplash.com/photo-1503422177340-9e0c1b3f5422?w=800',
    'https://images.unsplash.com/photo-1490644658840-3f2e4c44c68e?w=800',
    'https://images.unsplash.com/photo-1454430690613-c3a01a3e4b39?w=800',
  ],
  // Collection 9: Literature
  [
    'https://ik.imagekit.io/fonepay/flipbook%20/demo-page-8.jpg?updatedAt=1762173459296',
    'https://ik.imagekit.io/fonepay/flipbook%20/demo-page-9.jpg?updatedAt=1762173459388',
    'https://images.unsplash.com/photo-1524995767962-b62a544a424a?w=800',
    'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800',
    'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800',
    'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800',
    'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800',
    'https://images.unsplash.com/photo-1589829085433-2895f3693583?w=800',
    'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=800',
    'https://images.unsplash.com/photo-1589998059171-988d887df646?w=800',
  ],
  // Collection 10: Space
  [
    'https://ik.imagekit.io/fonepay/flipbook%20/demo-page-10.jpg?updatedAt=1762173459325',
    'https://ik.imagekit.io/fonepay/flipbook%20/demo-page-11.jpg?updatedAt=1762173459424',
    'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800',
    'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800',
    'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800',
    'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800',
    'https://images.unsplash.com/photo-1543722530-d2c38513b19c?w=800',
    'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=800',
    'https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?w=800',
    'https://images.unsplash.com/photo-1529788295554-183d36a1801d?w=800',
  ],
  // Collection 11: Pets
  [
    'https://ik.imagekit.io/fonepay/flipbook%20/demo-page-12.jpg?updatedAt=1762173459461',
    'https://ik.imagekit.io/fonepay/flipbook%20/demo-page-13.jpg?updatedAt=1762173459416',
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800',
    'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=800',
    'https://images.unsplash.com/photo-1592194991135-29b1393a404c?w=800',
    'https://images.unsplash.com/photo-1583337130417-2346a1be28a0?w=800',
    'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800',
    'https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?w=800',
    'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=800',
    'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=800',
  ],
  // Collection 12: Recipes
  [
    'https://ik.imagekit.io/fonepay/flipbook%20/demo-page-1.jpg?updatedAt=1762173459218',
    'https://ik.imagekit.io/fonepay/flipbook%20/demo-page-2.jpg?updatedAt=1762173459193',
    'https://images.unsplash.com/photo-1490645935967-10de6ba17025?w=800',
    'https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?w=800',
    'https://images.unsplash.com/photo-1495214783159-3503fd1b572d?w=800',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800',
    'https://images.unsplash.com/photo-1484980972926-edee96e0960d?w=800',
    'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800',
    'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800',
    'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800',
  ],
];

const getTenPages = (collectionIndex: number): string[] => {
  return imageCollections[collectionIndex % imageCollections.length];
};

export interface DemoFlipbook {
  id: string;
  title: string;
  coverUrl: string;
  pageUrls: string[];
  issue: string;
  magazine: string;
  category: string;
}

export const exploreFlipbooks: DemoFlipbook[] = [
  {
    id: 'explore-1',
    title: 'Modern Architecture',
    coverUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400',
    pageUrls: getTenPages(2),
    issue: 'Modern Architecture Issue #32',
    magazine: 'Design Weekly',
    category: 'Art'
  },
  {
    id: 'explore-2',
    title: 'Culinary Journeys',
    coverUrl: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400',
    pageUrls: getTenPages(12),
    issue: 'Culinary Journeys Issue #35',
    magazine: 'Taste Magazine',
    category: 'Lifestyle'
  },
  {
    id: 'explore-3',
    title: "Nature's Wonders",
    coverUrl: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=400',
    pageUrls: getTenPages(3),
    issue: "Nature's Wonders Issue #12",
    magazine: 'Wild Planet',
    category: 'Lifestyle'
  },
  {
    id: 'explore-4',
    title: 'Vintage Cars',
    coverUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400',
    pageUrls: getTenPages(1),
    issue: 'Vintage Cars Issue #18',
    magazine: 'Classic Motors',
    category: 'Lifestyle'
  },
  {
    id: 'explore-5',
    title: 'Abstract Worlds',
    coverUrl: 'https://images.unsplash.com/photo-1502691879815-5095266a87c8?w=400',
    pageUrls: getTenPages(5),
    issue: 'Abstract Worlds Vol. 4',
    magazine: 'Art & Form',
    category: 'Art'
  },
  {
    id: 'explore-6',
    title: 'Travel Diaries',
    coverUrl: 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=400',
    pageUrls: getTenPages(4),
    issue: 'Travel Diaries: Bali',
    magazine: 'Wanderlust',
    category: 'Lifestyle'
  },
  {
    id: 'explore-7',
    title: 'Fashion Forward',
    coverUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400',
    pageUrls: getTenPages(6),
    issue: 'Autumn 2025 Collection',
    magazine: 'Vogue Style',
    category: 'Fashion'
  },
  {
    id: 'explore-8',
    title: 'Minimalist Living',
    coverUrl: 'https://images.unsplash.com/photo-1517842645767-c6f90415aaa1?w=400',
    pageUrls: getTenPages(7),
    issue: 'The Art of Simplicity',
    magazine: 'Home & Heart',
    category: 'Lifestyle'
  },
  {
    id: 'explore-9',
    title: 'Urban Exploration',
    coverUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400',
    pageUrls: getTenPages(8),
    issue: 'Cityscapes at Night',
    magazine: 'Metropolis Today',
    category: 'Lifestyle'
  },
  {
    id: 'explore-10',
    title: 'Classic Literature',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
    pageUrls: getTenPages(9),
    issue: 'A Reader\'s Companion',
    magazine: 'The Library',
    category: 'Education'
  },
  {
    id: 'explore-11',
    title: 'Space Odyssey',
    coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400',
    pageUrls: getTenPages(10),
    issue: 'Journey to the Stars',
    magazine: 'Cosmos Quarterly',
    category: 'Education'
  },
  {
    id: 'explore-12',
    title: 'Pet Friends',
    coverUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400',
    pageUrls: getTenPages(11),
    issue: 'Our Furry Companions',
    magazine: 'Paws & Whiskers',
    category: 'Lifestyle'
  },
  {
    id: 'explore-13',
    title: 'Healthy Recipes',
    coverUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400',
    pageUrls: getTenPages(12),
    issue: 'Fresh & Green Meals',
    magazine: 'Good Food',
    category: 'Lifestyle'
  },
  {
    id: 'explore-14',
    title: 'Gardening Guide',
    coverUrl: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400',
    pageUrls: getTenPages(0),
    issue: 'Your First Garden',
    magazine: 'The Green Thumb',
    category: 'Lifestyle'
  },
  {
    id: 'explore-15',
    title: 'Street Photography',
    coverUrl: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=400',
    pageUrls: getTenPages(1),
    issue: 'Candid Moments',
    magazine: 'Lens Life',
    category: 'Art'
  },
  {
    id: 'explore-16',
    title: 'Tech Innovations',
    coverUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
    pageUrls: getTenPages(2),
    issue: 'The Future of AI',
    magazine: 'Future Tech',
    category: 'Business'
  },
  {
    id: 'explore-17',
    title: 'Into the Wild',
    coverUrl: 'https://images.unsplash.com/photo-1504829823946-2d3a4b86bdef?w=400',
    pageUrls: getTenPages(3),
    issue: 'Jungle Adventures',
    magazine: 'Explorer',
    category: 'Lifestyle'
  },
  {
    id: 'explore-18',
    title: 'Coastal Living',
    coverUrl: 'https://images.unsplash.com/photo-1509305717900-84f40e786d82?w=400',
    pageUrls: getTenPages(4),
    issue: 'Life by the Sea',
    magazine: 'Coastal Times',
    category: 'Lifestyle'
  },
  {
    id: 'explore-19',
    title: 'Artisan Crafts',
    coverUrl: 'https://images.unsplash.com/photo-1541696448366-262c641b6b66?w=400',
    pageUrls: getTenPages(5),
    issue: 'Handmade Wonders',
    magazine: 'Craft & Co.',
    category: 'Art'
  },
  {
    id: 'explore-20',
    title: 'Mountain Peaks',
    coverUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400',
    pageUrls: getTenPages(6),
    issue: 'Conquering Summits',
    magazine: 'The Alpinist',
    category: 'Lifestyle'
  },
  {
    id: 'explore-21',
    title: 'Coffee Culture',
    coverUrl: 'https://images.unsplash.com/photo-1511920183333-6a41c2b5b7b8?w=400',
    pageUrls: getTenPages(7),
    issue: 'The Perfect Brew',
    magazine: 'Barista Monthly',
    category: 'Lifestyle'
  },
  {
    id: 'explore-22',
    title: 'Musical Notes',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    pageUrls: getTenPages(8),
    issue: 'Sounds & Rhythms',
    magazine: 'The Soundboard',
    category: 'Art'
  },
  {
    id: 'explore-23',
    title: 'The Film Reel',
    coverUrl: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=400',
    pageUrls: getTenPages(9),
    issue: 'Cinema\'s Golden Age',
    magazine: 'Reel Talk',
    category: 'Art'
  },
  {
    id: 'explore-24',
    title: 'Winter Sports',
    coverUrl: 'https://images.unsplash.com/photo-1549282329-8a39e8f15f01?w=400',
    pageUrls: getTenPages(10),
    issue: 'On the Slopes',
    magazine: 'Winter Action',
    category: 'Lifestyle'
  }
];
