import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

/* ── Product catalog ────────────────────────────────────────────────── */
// [name, category, shortDesc, pricePerDay, securityDeposit, stock, location, condition, image]
const products: readonly (readonly [string, string, string, number, number, number, string, string, string])[] = [
  ['Bosch GSB 120-LI Cordless Drill','Power Tools','Compact 12V cordless drill kit for everyday repair and installation work.',250,1000,5,'Navi Mumbai','Excellent','/images/products/power-tools.jpg'],
  ['Makita Angle Grinder','Power Tools','Reliable 4-inch grinder with protective guard and side handle.',320,1200,4,'Mumbai','Good','/images/products/angle-grinder.jpg'],
  ['DeWalt Circular Saw','Power Tools','Powerful circular saw for clean, accurate timber cuts.',450,1800,3,'Thane','Excellent','/images/products/circular-saw.jpg'],
  ['Rotary Hammer Drill','Power Tools','Heavy-duty hammer drill suited to concrete and masonry.',580,2500,2,'Navi Mumbai','Good','/images/products/workshop-drill.jpg'],

  ['Concrete Mixer','Construction','Portable concrete mixer for residential construction jobs.',1500,8000,2,'Mumbai','Good','/images/products/concrete-mixer.jpg'],
  ['Aluminium Scaffolding Set','Construction','Modular scaffolding tower with lockable wheels.',2200,10000,3,'Thane','Excellent','/images/products/scaffolding.jpg'],
  ['Plate Compactor','Construction','Petrol plate compactor for paving and foundation work.',1800,7000,2,'Pune','Good','/images/products/plate-compactor.jpg'],
  ['Laser Level Kit','Construction','Self-levelling cross-line laser with tripod.',550,2200,5,'Mumbai','Excellent','/images/products/laser-level.jpg'],

  ['Digital Multimeter','Electrical','Professional auto-ranging multimeter with test leads.',180,700,8,'Navi Mumbai','Excellent','/images/products/multimeter.jpg'],
  ['Cable Pulling Machine','Electrical','Portable cable puller for controlled wire installation.',950,4000,2,'Thane','Good','/images/products/workshop-drill.jpg'],
  ['Thermal Imaging Camera','Electrical','Handheld thermal camera for inspection and troubleshooting.',1200,6500,2,'Mumbai','Excellent','/images/products/thermal-camera.jpg'],
  ['Insulation Tester','Electrical','Digital insulation resistance tester for electricians.',400,1600,4,'Pune','Good','/images/products/multimeter.jpg'],

  ['Professional Pipe Cutter','Plumbing','Heavy-duty ratchet pipe cutter for PVC and CPVC pipes.',300,900,6,'Navi Mumbai','Excellent','/images/products/pipe-cutter.jpg'],
  ['Drain Cleaning Machine','Plumbing','Electric drain cleaner with flexible cable attachment.',1100,5000,2,'Mumbai','Good','/images/products/drain-cleaner.jpg'],
  ['Pressure Test Pump','Plumbing','Manual hydraulic pressure test pump with gauge.',650,2800,3,'Thane','Excellent','/images/products/pressure-test-pump.jpg'],
  ['Tile Cutter','Plumbing','Precision manual tile cutter for renovation work.',350,1400,5,'Pune','Good','/images/products/tile-cutter.jpg'],

  ['Electric Hedge Trimmer','Gardening','Corded hedge trimmer for neat garden maintenance.',380,1300,4,'Mumbai','Excellent','/images/products/hedge-trimmer.jpg'],
  ['Petrol Lawn Mower','Gardening','Self-propelled mower for medium and large lawns.',900,4500,3,'Navi Mumbai','Good','/images/products/lawn-mower.jpg'],
  ['Chainsaw','Gardening','Compact petrol chainsaw for pruning and light timber work.',650,3000,3,'Thane','Good','/images/products/chainsaw.jpg'],
  ['Leaf Blower','Gardening','Lightweight blower for clearing paths and lawns.',280,1100,6,'Pune','Excellent','/images/products/leaf-blower.jpg'],

  ['Canon EOS 1500D DSLR','Cameras','24.1MP DSLR camera with 18–55mm kit lens.',900,6000,3,'Mumbai','Excellent','/images/products/camera.jpg'],
  ['Sony A6400 Mirrorless','Cameras','Fast autofocus mirrorless camera ideal for content shoots.',1400,9000,2,'Navi Mumbai','Excellent','/images/products/camera-studio.jpg'],
  ['DJI Osmo Pocket','Cameras','Pocket gimbal camera for smooth video capture.',750,4000,3,'Thane','Excellent','/images/products/action-camera.jpg'],
  ['Godox Studio Light Kit','Cameras','Two-light softbox kit for studio portraits and products.',600,3000,4,'Pune','Good','/images/products/studio-light.jpg'],

  ['Epson Full HD Projector','Projectors','Bright Full HD projector for meetings and movie nights.',1100,7000,4,'Mumbai','Excellent','/images/products/projector-screen.jpg'],
  ['Portable Projector Screen','Projectors','100-inch pull-up projector screen.',250,1200,6,'Navi Mumbai','Good','/images/products/projector-screen.jpg'],

  ['PA Speaker System','Specialized Equipment','Portable amplified speaker system with wireless microphone.',1600,8500,2,'Thane','Excellent','/images/products/pa-speaker.jpg'],
  ['Industrial Vacuum Cleaner','Specialized Equipment','Wet and dry vacuum for workshops and post-construction cleanup.',750,3500,3,'Pune','Good','/images/products/carpet-cleaner.jpg'],

  ['Quechua 3-Person Camping Tent','Travel & Outdoors','Weather-resistant tent for weekend camping and short outdoor stays.',700,3500,4,'Mumbai','Excellent','/images/products/camping-tent.jpg'],
  ['Trekking Backpack 60L','Travel & Outdoors','Adjustable hiking pack with internal frame and rain cover.',350,1500,6,'Pune','Excellent','/images/products/trekking-backpack.jpg'],
  ['Action Camera Kit','Travel & Outdoors','Compact action camera kit for hikes, rides and travel footage.',800,4500,3,'Navi Mumbai','Good','/images/products/action-camera.jpg'],

  ['LED Party Light Bar','Events & Party','Colour-changing light bar for celebrations and small stages.',650,3000,5,'Mumbai','Excellent','/images/products/fog-machine.jpg'],
  ['Fog Machine','Events & Party','Compact smoke machine for event entrances and dance floors.',900,4500,3,'Thane','Good','/images/products/fog-machine.jpg'],
  ['Folding Event Table Set','Events & Party','Six-foot folding tables for catering, displays and gatherings.',500,1800,8,'Pune','Excellent','/images/products/pa-speaker.jpg'],

  ['DJ Controller','Audio & DJ','Two-channel controller for parties, practice sessions and live sets.',1300,7000,2,'Mumbai','Excellent','/images/products/dj-controller.jpg'],
  ['Audio Mixer 8 Channel','Audio & DJ','Compact mixer with balanced inputs for bands and events.',950,5000,3,'Navi Mumbai','Good','/images/products/audio-mixer.jpg'],
  ['Wireless Microphone Pair','Audio & DJ','Dual wireless microphones with receiver for speeches and karaoke.',650,3200,5,'Thane','Excellent','/images/products/pa-speaker.jpg'],

  ['Motorized Treadmill','Sports & Fitness','Foldable treadmill for home training and fitness events.',1000,6000,2,'Mumbai','Good','/images/products/treadmill.jpg'],
  ['Exercise Bike','Sports & Fitness','Adjustable indoor cycle for personal training and recovery.',650,3500,3,'Pune','Excellent','/images/products/exercise-bike.jpg'],
  ['Adjustable Dumbbell Set','Sports & Fitness','Space-saving weighted dumbbells for strength sessions.',450,2200,5,'Navi Mumbai','Excellent','/images/products/dumbbell.jpg'],

  ['OBD Car Diagnostic Scanner','Automotive','Handheld scanner for reading common vehicle diagnostic codes.',550,2600,4,'Thane','Excellent','/images/products/obd-scanner.jpg'],
  ['Portable Jump Starter','Automotive','Battery jump pack with safety clamps and USB power output.',600,3000,4,'Mumbai','Good','/images/products/jump-starter.jpg'],
  ['Tyre Air Compressor','Automotive','Portable compressor with digital pressure display.',350,1500,6,'Pune','Excellent','/images/products/jump-starter.jpg'],

  ['Carpet Cleaner','Home & Cleaning','Upholstery and carpet extractor for deep cleaning jobs.',850,4500,3,'Mumbai','Good','/images/products/carpet-cleaner.jpg'],
  ['Steam Cleaner','Home & Cleaning','High-temperature steam cleaner for kitchens and hard surfaces.',500,2200,4,'Navi Mumbai','Excellent','/images/products/floor-polisher.jpg'],
  ['Floor Polisher','Home & Cleaning','Single-disc polisher for restoring hard floor finishes.',1200,6500,2,'Thane','Good','/images/products/floor-polisher.jpg'],

  ['Raspberry Pi Starter Kit','Electronics','Single-board computer kit for learning, prototypes and projects.',400,2200,5,'Pune','Excellent','/images/products/raspberry-pi.svg'],
  ['Portable Power Station','Electronics','Rechargeable power station for devices, lights and small appliances.',1100,7000,3,'Mumbai','Excellent','/images/products/portable-power-station.jpg'],
  ['Soldering Station','Electronics','Temperature-controlled station for electronics repair and assembly.',450,2000,4,'Navi Mumbai','Good','/images/products/soldering-station.jpg'],

  ['Industrial Safety Harness','Safety & Industrial','Full-body fall-protection harness for elevated maintenance work.',350,1800,8,'Thane','Excellent','/images/products/safety-harness.jpg'],
  ['Digital Sound Level Meter','Safety & Industrial','Portable meter for workplace and event sound measurement.',400,1800,4,'Mumbai','Excellent','/images/products/sound-level-meter.jpg'],
  ['Portable Work Light','Safety & Industrial','Rechargeable LED work light for sites and emergency tasks.',250,1000,7,'Pune','Good','/images/products/workshop-drill.jpg'],
];

const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const descriptionFor = (name: string, shortDesc: string, category: string) => {
  const detail: Record<string, [string, string]> = {
    'Power Tools': ['Designed for reliable workshop, repair and site tasks.', 'Balanced handling makes it practical for short-term project use.'],
    Construction: ['Built for demanding renovation and construction work.', 'Suitable for contractors, property maintenance and project teams.'],
    Electrical: ['Made for diagnostics, installation and maintenance work.', 'Clear controls support efficient use across indoor job sites.'],
    Plumbing: ['A practical choice for repair, fitting and maintenance tasks.', 'Supplied rental-ready with the standard working accessories.'],
    Gardening: ['Suitable for seasonal garden care and outdoor maintenance.', 'Easy-to-handle equipment for home, landscape and site work.'],
    Cameras: ['Suitable for photography, events and content creation.', 'Includes the essential accessories needed for a short rental.'],
    Projectors: ['Designed for presentations, classrooms and small events.', 'Connectivity supports common laptops and media devices.'],
    'Specialized Equipment': ['Suitable for professional events, workshops and specialist jobs.', 'Prepared for dependable short-term rental use.'],
    'Travel & Outdoors': ['Perfect for weekend trips, treks and outdoor adventures.', 'Lightweight and durable for travel convenience.'],
    'Events & Party': ['Ideal for celebrations, gatherings and small stage events.', 'Easy setup and teardown for event convenience.'],
    'Audio & DJ': ['Professional-grade audio for events, performances and practice.', 'Compatible with standard audio setups and venues.'],
    'Sports & Fitness': ['Quality fitness equipment for home training and events.', 'Adjustable settings for different fitness levels.'],
    Automotive: ['Practical tools for vehicle maintenance and diagnostics.', 'Compact and portable for garage or roadside use.'],
    'Home & Cleaning': ['Effective cleaning equipment for deep-cleaning projects.', 'Suitable for residential and small commercial spaces.'],
    Electronics: ['Versatile electronics for projects, learning and prototyping.', 'Comes with essential cables and accessories.'],
    'Safety & Industrial': ['Essential safety and measurement equipment for job sites.', 'Meets standard safety and compliance requirements.'],
  };
  const [second, third] = detail[category] || ['Suitable for dependable short-term rentals and project use.', 'Prepared with the essential accessories for collection or delivery.'];
  return JSON.stringify([shortDesc, second, third]);
};

async function main() {
  /* ── Clear existing data ─────────────────────────────────────────── */
  await prisma.campaign.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.trackingEvent.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.seller.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash('rently123', 10);

  /* ── Admin ───────────────────────────────────────────────────────── */
  const admin = await prisma.user.create({
    data: { name: 'Rently Superadmin', email: 'admin@rently.demo', passwordHash: hash, role: 'ADMIN', city: 'Mumbai', gender: 'Male' },
  });

  /* ── Sellers ─────────────────────────────────────────────────────── */
  const sellerUsers = await Promise.all(
    [
      ['Vikram Mehta', 'vikram@apexrental.demo', 'Mumbai', 'Male'],
      ['Priya Sharma', 'priya@cinegear.demo', 'Navi Mumbai', 'Female'],
      ['Aarav Shah', 'aarav@toolhub.demo', 'Thane', 'Male'],
    ].map(([name, email, city, gender]) =>
      prisma.user.create({ data: { name, email, city, passwordHash: hash, role: 'SELLER', gender } }),
    ),
  );
  const sellers = await Promise.all(
    sellerUsers.map((user, i) =>
      prisma.seller.create({
        data: {
          userId: user.id,
          shopName: ['Apex Heavy Rentals', 'CineGear Studio', 'ToolHub Equipment'][i],
          description: ['Your one-stop shop for professional power, construction, and automotive tools.', 'Quality camera, audio, lighting and creative production rentals.', 'Industrial, safety and specialty equipment for every job.'][i],
          city: user.city!,
          state: 'Maharashtra',
          status: 'VERIFIED',
        },
      }),
    ),
  );

  /* ── Customers ───────────────────────────────────────────────────── */
  const customers = await Promise.all(
    [
      ['Aarav Sharma', 'aarav.sharma@example.com', 'Mumbai', 'Male', '1998-03-15'],
      ['Ananya Rao', 'ananya@demo.rently', 'Mumbai', 'Female', '1998-03-15'],
      ['Rohan Das', 'rohan@demo.rently', 'Pune', 'Male', '1995-07-22'],
      ['Nisha Kapoor', 'nisha@demo.rently', 'Thane', 'Female', '2000-11-08'],
    ].map(([name, email, city, gender, dob]) =>
      prisma.user.create({
        data: { name, email, city, passwordHash: hash, role: 'CUSTOMER', marketingConsent: true, gender, dateOfBirth: new Date(dob), phone: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}` },
      }),
    ),
  );

  /* ── Categories ──────────────────────────────────────────────────── */
  const categoryNames = [
    'Power Tools', 'Construction', 'Electrical', 'Plumbing', 'Gardening', 'Cameras',
    'Projectors', 'Specialized Equipment', 'Travel & Outdoors', 'Events & Party',
    'Audio & DJ', 'Sports & Fitness', 'Automotive', 'Home & Cleaning', 'Electronics', 'Safety & Industrial',
  ];
  const categories = new Map<string, { id: string }>();
  for (const name of categoryNames) {
    categories.set(
      name,
      await prisma.category.create({ data: { name, slug: slug(name), description: `Equipment for ${name.toLowerCase()}.` } }),
    );
  }

  /* ── Products ────────────────────────────────────────────────────── */
  const created = [];
  for (let i = 0; i < products.length; i++) {
    const [name, category, shortDesc, pricePerDay, securityDeposit, stock, location, condition, image] = products[i];
    created.push(
      await prisma.product.create({
        data: {
          name,
          description: descriptionFor(name, shortDesc, category),
          images: JSON.stringify([image]),
          categoryId: categories.get(category)!.id,
          sellerId: sellers[i % sellers.length].id,
          pricePerDay,
          pricePerWeek: pricePerDay * 5,
          securityDeposit,
          totalStock: stock,
          availableStock: stock,
          location,
          condition,
          specifications: JSON.stringify({
            'Rental-ready': 'Yes',
            Includes: 'Standard accessories',
            'Condition checked': 'Before each rental',
          }),
        },
      }),
    );
  }

  /* ── Demo Orders with tracking events ────────────────────────────── */
  const orderStatuses = ['COMPLETED', 'COMPLETED', 'DELIVERED', 'IN_USE', 'DISPATCHED', 'BOOKING_CONFIRMED'];
  for (let i = 0; i < 6; i++) {
    const product = created[i];
    const customer = customers[i % customers.length];
    const seller = sellers[i % sellers.length];
    const start = new Date(2026, 6, i + 1);
    const end = new Date(2026, 6, i + 3);
    const amount = product.pricePerDay * 3;
    const status = orderStatuses[i];

    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        sellerId: seller.id,
        rentalAmount: amount,
        securityDeposit: product.securityDeposit,
        commissionAmount: Math.round(amount * 0.1),
        totalAmount: amount + product.securityDeposit,
        status,
        paymentStatus: 'SUCCESS',
        trackingCode: `RNT-${String(100 + i).padStart(4, '0')}`,
        items: {
          create: {
            productId: product.id,
            name: product.name,
            quantity: 1,
            startDate: start,
            endDate: end,
            pricePerDay: product.pricePerDay,
            securityDeposit: product.securityDeposit,
          },
        },
      },
    });

    await prisma.payment.create({
      data: {
        transactionId: `TXN-RNT-${String(100 + i).padStart(4, '0')}`,
        orderId: order.id,
        customerId: customer.id,
        amount: order.totalAmount,
        method: 'UPI',
        status: 'SUCCESS',
      },
    });

    // Create tracking events for each order
    const trackingSteps = [
      { status: 'BOOKING_CONFIRMED', description: 'Order placed and confirmed', offset: 0 },
      { status: 'PAYMENT_SUCCESS', description: 'Payment received successfully', offset: 1 },
      { status: 'READY_FOR_PICKUP', description: 'Equipment prepared and ready for pickup', offset: 3 },
      { status: 'DISPATCHED', description: 'Equipment dispatched to customer', offset: 5 },
      { status: 'DELIVERED', description: 'Equipment delivered to customer', offset: 7 },
      { status: 'IN_USE', description: 'Equipment currently in use by customer', offset: 8 },
      { status: 'RETURN_INITIATED', description: 'Customer initiated return', offset: 10 },
      { status: 'RETURNED', description: 'Equipment returned to seller', offset: 11 },
      { status: 'COMPLETED', description: 'Rental completed, deposit refunded', offset: 12 },
    ];

    const statusIndex = trackingSteps.findIndex(s => s.status === status);
    for (let j = 0; j <= statusIndex; j++) {
      const ts = new Date(start);
      ts.setHours(ts.getHours() + trackingSteps[j].offset);
      await prisma.trackingEvent.create({
        data: { orderId: order.id, status: trackingSteps[j].status, description: trackingSteps[j].description, timestamp: ts },
      });
    }

    // Create notification for order
    await prisma.notification.create({
      data: {
        userId: customer.id,
        title: `Order ${order.trackingCode} — ${status.replace(/_/g, ' ').toLowerCase()}`,
        message: `Your rental for ${product.name} is ${status.replace(/_/g, ' ').toLowerCase()}.`,
        type: 'ORDER',
        orderId: order.id,
        read: status === 'COMPLETED',
      },
    });
  }

  /* ── Demo campaigns ──────────────────────────────────────────────── */
  await prisma.campaign.createMany({
    data: [
      { name: 'Welcome Offer — New Users', channel: 'EMAIL', segment: 'NEW_USERS', template: 'Welcome to Rently! Enjoy 10% off your first rental.', sentCount: 42, status: 'SENT' },
      { name: 'Weekend Special — Power Tools', channel: 'SMS', segment: 'POWER_TOOL_RENTERS', template: 'Weekend deal: rent any power tool at 20% off this Saturday & Sunday!', sentCount: 18, status: 'SENT' },
      { name: 'Festive Season Promo', channel: 'WHATSAPP', segment: 'ALL_CUSTOMERS', template: 'Celebrate this season with Rently! Flat ₹200 off on rentals above ₹1000.', sentCount: 0, status: 'DRAFT' },
    ],
  });

  console.log(`Seeded ${products.length} products, ${categories.size} categories, ${sellers.length} sellers, ${customers.length} customers, 6 demo orders. Admin: ${admin.email}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
