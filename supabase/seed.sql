do $$
begin
  if exists (select 1 from public.posts limit 1) then
    raise notice 'Seed skipped because posts already exist.';
    return;
  end if;
end $$;

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'matcha@pinnedbrews.demo',
    crypt('demo-password', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Matcha Mochi"}',
    now() - interval '7 days',
    now() - interval '7 days'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'boba@pinnedbrews.demo',
    crypt('demo-password', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Boba Bear"}',
    now() - interval '6 days',
    now() - interval '6 days'
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'star@pinnedbrews.demo',
    crypt('demo-password', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Star Catcher"}',
    now() - interval '5 days',
    now() - interval '5 days'
  )
on conflict (id) do nothing;

insert into public.profiles (id, handle, display_name, avatar, bio, role)
values
  ('11111111-1111-4111-8111-111111111111', 'matchamochi', 'Matcha Mochi', '🍡', 'Drawn to bright cups and fruit-forward coffees.', 'user'),
  ('22222222-2222-4222-8222-222222222222', 'bobabear', 'Boba Bear', '🧋', 'Always chasing comfort-cup blends and cozy aeropress recipes.', 'user'),
  ('33333333-3333-4333-8333-333333333333', 'starcatcher', 'Star Catcher', '🌟', 'Late-night brew tinkerer with a weakness for chocolatey roasts.', 'user')
on conflict (id) do nothing;

-- Roasters sourced from Trade's public roster pages and normalized for seeding.
insert into public.roasters (id, name, location, ethos, equipment, logo, website, created_by)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000001', 'Airship', 'Bentonville, AR', 'Airship began in the mountains of Honduras, where founder Mark Bray saw farmers struggling for a stable, fair supply chain. What started as a commitment to producers has grown into a roastery rooted in community — bringing bright, thoughtfully-sourced coffees from farm to cup.', 'Specialty roasting program', 'AI', 'https://airshipcoffee.com/', '11111111-1111-4111-8111-111111111111'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000002', 'Alma', 'Canton, GA', 'Alma Coffee was founded in Georgia in 2018. Fourth and fifth-generation coffee farmers in Honduras, Al Lopez and daughter Leticia Hutchins extended their family legacy to bring you the freshest coffee straight from their farms to your cup through sustainable practices.', 'Specialty roasting program', 'AL', 'https://myalmacoffee.com/', '22222222-2222-4222-8222-222222222222'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000003', 'Anodyne', 'Milwaukee, WI', 'This small-batch roaster proves that you don’t need state-of-the-art equipment to create perfect coffee. They’re doing something right – Matthew McClutchy’s Anodyne has been serving Milwaukee since 1999 with community-building concerts, wood-fired pizza, and of course, the city’s best coffee.', 'Specialty roasting program', 'AN', 'https://anodynecoffee.com/', '33333333-3333-4333-8333-333333333333'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000004', 'Atomic', 'Peabody, MA', 'Atomic is on a mission to spread positive energy. Led by brothers Spencer and Logan Mahoney, this second-generation family business uses coffee as a catalyst for inspiring community, relationships, and adventures.', 'Specialty roasting program', 'AT', 'https://atomicroastery.com/', '11111111-1111-4111-8111-111111111111'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000005', 'Bean & Bean', 'New York, NY', 'Amidst the 2008 economic crisis, Bean & Bean Coffee Roasters opened shop in Manhattan’s financial epicenter. Fourteen years and four locations later, this mother-daughter team is driven by a commitment to gender equality, sourcing half its coffee from female-led farms.', 'Specialty roasting program', 'BB', 'https://beannbeancoffee.com/', '22222222-2222-4222-8222-222222222222'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000006', 'Bird Rock', 'San Diego, CA', 'To be the best, you have to work with the best. Bird Rock, Roast Magazine’s 2012 Micro Roaster of the Year, is truly farm-to-cup. Since 2006, this San Diego roaster has sourced exclusively from top-tier growers and fostered supportive long-term relationships with its partners.', 'Specialty roasting program', 'BR', 'https://www.birdrockcoffee.com/', '33333333-3333-4333-8333-333333333333'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000007', 'Blueprint', 'St. Louis, MO', 'Fiercely focused and admittedly obsessed, Blueprint puts each of its coffees through a rigorous quality control process. Founded in 2013 with the co-op mentality of collaboration, Blueprint is committed to ensuring all of its coffees meet the highest standards before leaving St. Louis.', 'Specialty roasting program', 'BL', 'https://blueprintcoffee.com/', '11111111-1111-4111-8111-111111111111'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000008', 'Boxcar Coffee', 'Boulder, CO', 'Founded in 2010 by Cara and Vajra Rich, Boxcar — which is named for ''30s race cars—roasts on the front range of the Rocky Mountains. That rugged Colorado landscape comes through in its scrappy can-do attitude and its perfect high-altitude coffees.', 'Specialty roasting program', 'BC', 'https://www.boxcarcoffee.com/', '22222222-2222-4222-8222-222222222222'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000009', 'Broadcast', 'Seattle, WA', 'Idaho native Barry Faught opened Broadcast''s first location in 2008, in honor of his dad''s lifelong passion for radio. After a brief-stint following in his father''s footsteps, Barry found himself in Seattle, a city with great music, inclusive communities, eco-friendly living, and amazing coffee.', 'Specialty roasting program', 'BR', 'https://broadcastcoffeeroasters.com/', '33333333-3333-4333-8333-333333333333'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000010', 'Broadsheet', 'Cambridge, MA', 'Aaron MacDougall discovered his calling in a Honolulu coffee shop after leaving a career in finance. After years of learning, competing, and roasting, he moved back to the Boston area and founded Broadsheet Coffee Roasters in 2017.', 'Specialty roasting program', 'BR', 'https://broadsheetcoffee.com/', '11111111-1111-4111-8111-111111111111'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000011', 'Caffe Vita', 'Brooklyn, NY', 'For over 25 years, Caffe Vita has roasted extraordinary coffee in Seattle, Brooklyn, and Phoenix. Buying exclusively from trusted growers and roasting on vintage German machines, this indie roaster has one clear mission: do everything as well as possible and make great coffee.', 'Specialty roasting program', 'CV', 'https://www.caffevita.com/', '22222222-2222-4222-8222-222222222222'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000012', 'Cerberus', 'Jacksonville, OR', 'Driven by a desire to create an inclusive gathering place for rural Oregonians, founders Cody and Kristina opened Cerberus café in Jacksonville, Oregon in 2019. Within the first year, the team began small-batch roasting to extend their warm community reach even further.', 'Specialty roasting program', 'CE', 'https://www.cerberuscoffeeco.com/', '33333333-3333-4333-8333-333333333333'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000013', 'Common Voice', 'Nashville, TN', 'Common Voice Coffee Co. puts its values into action. This Nashville roaster supports farmers by purchasing beyond just their highest-scoring lots, paying five percent above green coffee cost. Every bag reinforces their commitment to community, accessibility, and caring for the earth.', 'Specialty roasting program', 'CV', null, '11111111-1111-4111-8111-111111111111'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000014', 'Cuvée', 'Austin, TX', 'Founded in 1998, US Navy Veteran Mike McKim''s Cuvée Coffee is one of Texas''s oldest roasteries. Big on Lone Star flavor and an experimental spirit, Cuvée stays ahead of the pack with an innovative nitro cold brew canning facility that keeps this Austin roaster cutting-edge.', 'Specialty roasting program', 'CE', 'https://cuveecoffee.com/', '22222222-2222-4222-8222-222222222222'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000015', 'DOMA', 'Post Falls, ID', 'Named for founders Rebecca and Terry Patano''s sons Dominic and Marco, Post Falls, Idaho’s DOMA is centered on family. The brand’s logo captures that spirit with an illustration of Terry’s father, while its sustainable packaging conveys its dual focus on environmentally friendly practices.', 'Specialty roasting program', 'DO', 'https://www.domacoffee.com/', '33333333-3333-4333-8333-333333333333'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000016', 'Drink Coffee Do Stuff', 'Lake Tahoe, CA', 'DRINK COFFEE DO STUFF is a state of mind. Sparked by co-founder Nick Visconti''s Alpine coffee obsession during his pro snowboarding career, DCDS roasts at 6,000 feet in Lake Tahoe. Driven by sustainability, this Sierra Nevada roaster merges outdoor living with specialty coffee.', 'Specialty roasting program', 'DC', 'https://drinkcoffeedostuff.com/', '11111111-1111-4111-8111-111111111111'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000017', 'Dune Coffee', 'Santa Barbara, CA', 'Married co-founders Julia Mayer and Todd Stewart travel the globe building meaningful farmer relationships, but Dune''s heart stays rooted in Santa Barbara. With equal passion for great coffee and supply chain partnerships, this duo shares their finds with a devoted local community.', 'Specialty roasting program', 'DC', 'https://www.dunecoffee.com/', '22222222-2222-4222-8222-222222222222'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000018', 'Equator', 'San Rafael, CA', 'Roasting since 1995 out of a garage, partners Brooke McDonnell, Maureen McHugh, and Helen Russell built Equator into a Certified B Corp focused on quality and social impact. From founding Panama''s Finca Sophia to partnering with World Bicycle Relief, their reach spans the globe.', 'Specialty roasting program', 'EQ', 'https://www.equatorcoffees.com/', '33333333-3333-4333-8333-333333333333'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000019', 'Feast', 'Redding, CA', 'Feast Coffee & Culture is a celebration of coffee in all its variety, dreamt up around a table on Bainbridge Island in 2016. Serving Redding, California, this craft-driven roaster thrives on cultivating local culture through popular food gatherings and open, welcoming conversation.', 'Specialty roasting program', 'FE', null, '11111111-1111-4111-8111-111111111111'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000020', 'Gimme! Coffee', 'Ithaca, NY', 'Gimme! is an industry blueprint for sourcing, roasting, and serving delicious coffee without compromise. In 20+ years, their commitment to championing equitable pay in coffee has never wavered, and they’re now one of the largest employee-owned co-ops in the US.', 'Specialty roasting program', 'GC', 'https://gimmecoffee.com/', '22222222-2222-4222-8222-222222222222'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000021', '8th and Roast', 'Nashville, TN', 'Since 2009, 8th & Roast has been crafting exceptional coffee in Nashville. They build strong relationships with farmers to source the best beans and roast with care to bring out their full potential. It’s all about quality, freshness, and a commitment to doing coffee right.', 'Specialty roasting program', '8A', 'https://www.8thandroast.com/', '33333333-3333-4333-8333-333333333333'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000022', 'Greater Goods', 'Austin, TX', 'Greater Goods sources unique coffees worldwide, but this Austin roaster''s heart stays in Texas. Founded in 2015 by Trey Cobb and Khanh Trang, it was named Texas''s best coffee by Food & Wine. Beyond great roasts, Greater Goods partners with local charities to give back with every bag.', 'Specialty roasting program', 'GG', 'https://greatergoodsroasting.com/', '11111111-1111-4111-8111-111111111111'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000023', 'Highwire', 'Oakland, CA', 'Balance is everything at Highwire Coffee. Founded in Oakland in 2011 by Rich Avella, Eric Hashimoto, and Robert Myers, this roaster is intensely focused on detail, experimenting with roast levels, and fostering the next generation of roasters through a deep commitment to education.', 'Specialty roasting program', 'HI', 'https://www.highwirecoffee.com/', '22222222-2222-4222-8222-222222222222'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000024', 'Huckleberry', 'Denver, CO', 'Huckleberry is all about people (well, coffee people). Founded in 2011 by friends Koan Goedman and Mark Mann in a backyard garage adjacent to a chicken coop, this Denver-based roaster has grown into a complex global network, turning out some equally complex flavors.', 'Specialty roasting program', 'HU', 'https://www.huckleberryroasters.com/', '33333333-3333-4333-8333-333333333333'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000025', 'Irving Farm', 'New York, NY', 'Named for its original Irving Place café, Irving Farm has grown alongside New York''s specialty coffee scene since 1996. David Elwell and Steve Leven''s Hudson Valley roastery has led the way with strong grower relationships and clean, fuel-efficient practices that set an industry standard.', 'Specialty roasting program', 'IF', 'https://irvingfarmcoffee.com/', '11111111-1111-4111-8111-111111111111'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000026', 'Joe Coffee', 'New York, NY', 'Founded in 2003 in New York’s West Village, Joe Coffee helped pioneer the city’s third-wave movement. As it has grown, Joe’s shops remain welcoming gathering places for the community, while principles of quality, integrity, collaboration, and ethics come through in everything it does.', 'Specialty roasting program', 'JC', 'https://joecoffeecompany.com/', '22222222-2222-4222-8222-222222222222'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000027', 'Klatch', 'Rancho Cucamonga, CA', 'Coffee is in the Perry family’s blood. The team behind Klatch has been bringing their flavorful coffee to SoCal since 1993. But there’s more than just innate knowledge – thanks to roastmaster and green buyer Mike Perry’s chemical engineering degree, real science goes into this team’s award-winning coffee.', 'Specialty roasting program', 'KL', 'https://www.klatchcoffee.com/', '33333333-3333-4333-8333-333333333333'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000028', 'Kuma', 'Seattle, WA', 'Named for its original owner’s bear-like rescue dog, Kuma Coffee has found a forever home in Downtown Seattle. Since 2008, this local favorite has evolved from a garage roastery to working on state-of-the-art, eco-friendly equipment and purchasing coffee direct from origin at above market price.', 'Specialty roasting program', 'KU', 'https://www.kumacoffee.com/', '11111111-1111-4111-8111-111111111111'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000029', 'Little Waves', 'Durham, NC', 'An award-winning, impact-driven roaster led by a Latina majority and shaped by a diverse, woman-forward team. Little Waves believes in coffee as a shared experience—sourcing, roasting, and brewing with care to create small, intentional waves that celebrate the beauty of coffee and life.', 'Specialty roasting program', 'LW', 'https://littlewaves.coffee/', '22222222-2222-4222-8222-222222222222'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000030', 'Methodical', 'Greenville, SC', 'Founded in Greenville, South Carolina in 2015 by three friends, Methodical Coffee blends Marco Suarez''s community spirit, Will Shurtz''s barista expertise, and David Baker''s operations know-how. Within 18 months they were roasting, and those three pillars still guide everything today.', 'Specialty roasting program', 'ME', 'https://methodicalcoffee.com/', '33333333-3333-4333-8333-333333333333'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000031', 'Metric', 'Chicago, IL', 'Metric’s name derives from the unit of measurement found on a vintage German Probat roaster that founders Xavier Alexander and Darko Arandjelovic restored from dilapidation. That reverence for tradition and self-made attitude are pillars of the locally beloved Chicago roaster.', 'Specialty roasting program', 'ME', 'https://metriccoffee.com/', '11111111-1111-4111-8111-111111111111'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000032', 'Necessary', 'Lancaster, PA', 'Launched in 2019 by the Passenger team in Lancaster, PA, Necessary Coffee lives by one belief: Strong Partners Make Rich Coffee. Thoughtfully sourced, expertly roasted, and ultra-consistent, Necessary invests in farmer-focused partnerships to build a more sustainable future, one cup at a time.', 'Specialty roasting program', 'NE', 'https://necessarycoffee.com/', '22222222-2222-4222-8222-222222222222'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000033', 'Novo', 'Denver, CO', 'Founded in 2002 by Jake, Joe, and Herb Brodsky, Novo Coffee exists to connect great producers with great drinkers. Two decades and three cafés later, that mission still drives them—buying from the same farms year after year to improve farmer pricing and elevate overall coffee quality.', 'Specialty roasting program', 'NO', 'https://novocoffee.com/', '33333333-3333-4333-8333-333333333333'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000034', 'Oren''s', 'New York, NY', 'Oren Bloostein left his corporate career in 1986 to found Oren''s Coffee in NYC, roasting on site from the start. Today, this New York institution upholds the highest freshness standards and sources with care through its Oren''s at Origin program, honoring over 35 years of dedication.', 'Specialty roasting program', 'OS', 'https://orenscoffee.com/', '11111111-1111-4111-8111-111111111111'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000035', 'PT''s', 'Topeka, KS', 'PT''s Coffee set the bar for the industry as one of the first roasters to establish a Direct Trade program. Founded in Topeka, Kansas in 1993 with a simple goal—an excellent cup—Fred Polzin and Jeff Taylor''s brand has lived up to that promise every single day for over 30 years.', 'Specialty roasting program', 'PS', 'https://ptscoffee.com/', '22222222-2222-4222-8222-222222222222'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000036', 'Panther', 'Miami, FL', 'Miami has as much to do with Panther’s success as the coffee it brews. Founded by Joel and Leticia Pollock in 2010, the roaster made its home in the city’s Wynwood neighborhood where it became a gathering spot for the local artists and embraced Southern Florida’s global tastes.', 'Specialty roasting program', 'PA', 'https://panthercoffee.com/', '33333333-3333-4333-8333-333333333333'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000037', 'Passenger', 'Lancaster, PA', 'Passenger Coffee brings drinkers along for an extraordinary ride. Once operating out of a retrofitted 1955 Airstream, this Lancaster, Pennsylvania roaster looks boldly forward—storing all unroasted coffee in deep-freeze to roast a large, diverse offering at peak freshness year round.', 'Specialty roasting program', 'PA', 'https://drinkpassenger.com/', '11111111-1111-4111-8111-111111111111'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000038', 'Pastime Coffee', 'Portland, Oregon', 'Pastime Coffee''s founders Justin Dedini and Erica Schwager have spent more than 35 years working across nearly every corner of the industry—from sourcing and roasting to quality control, education, and retail. Pastime was created to be the company they''ve always dreamt of being a part of: one that treats producers and collaborators with respect, pays well above average for great coffee, roasts with precision, and keeps its environmental footprint as light as possible.', 'Specialty roasting program', 'PC', 'https://pastime.coffee/', '22222222-2222-4222-8222-222222222222'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000039', 'Peixoto', 'Chandler, AZ', 'Julia Peixoto grew up in a Brazilian coffee farming family and wanted to do better for farmers in her region. In 2015, she and husband Jeff Peters left corporate careers to found Peixoto in Chandler, Arizona—where they produce, import, roast, and share their family''s extraordinary coffee.', 'Specialty roasting program', 'PE', 'https://peixotocoffee.com/', '33333333-3333-4333-8333-333333333333'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000040', 'PERC', 'Savannah, GA', 'PERC Coffee has roasted the world’s most colorful coffee in Savannah, Georgia, for over a decade. Their mission is simple but powerful: Share good times and amazing coffee with everyone they meet and continue to grow their business with authenticity, passion, and curiosity.', 'Specialty roasting program', 'PE', 'https://perccoffee.com/', '11111111-1111-4111-8111-111111111111'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000041', 'Portrait', 'Atlanta, GA', 'Portrait Coffee was founded in 2019 to change what people picture when they think of specialty coffee. Deeply rooted in West End Atlanta, this roaster reflects the community''s history and culture while actively rewriting the narrative—one genuine cup and one new story at a time.', 'Specialty roasting program', 'PO', 'https://portrait.coffee/', '22222222-2222-4222-8222-222222222222'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000042', 'ReAnimator', 'Philadelphia, PA', 'Philadelphia''s ReAnimator has been exploring coffee''s complexity since 2011. Owned by Mark Capriotti and Mark Corpus, this roaster embraces seasonality like few others—single-origin offerings cycle through frequently, staying on the menu for only weeks before making way for something new.', 'Specialty roasting program', 'RE', 'https://www.reanimatorcoffee.com/', '33333333-3333-4333-8333-333333333333'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000043', 'Red Rooster', 'Floyd, VA', 'Red Rooster Coffee started in the back of a Virginia bookstore when Rose McCutchan needed coffee for her café. Since 2010, Rose and Haden Polseno-Hensley have built a family-run roaster guided by sustainability, gender equality, inclusive hiring, and onsite childcare for all employees.', 'Specialty roasting program', 'RR', 'https://www.redroostercoffee.com/', '11111111-1111-4111-8111-111111111111'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000044', 'The Roasted Record', 'Stuart, FL', 'The Roasted Record began on Mike Mann''s front porch in 2013 with a small roaster and a vinyl copy of The Joshua Tree. With an analog approach to coffee and life, this Stuart, FL roaster has become a beloved gathering spot for music and coffee lovers and an award-winning small-batch roaster.', 'Specialty roasting program', 'TR', 'https://www.roastedrecord.com/', '22222222-2222-4222-8222-222222222222'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000045', 'Sightglass', 'San Francisco, CA', 'Sightglass Coffee launched in 2009 with a simple belief: coffee can be both art and connection. Named for the small window on a roasting machine, Sightglass works with like-minded growers and roasts in small batches—so every cup reflects care, precision, and genuine craft at its best.', 'Specialty roasting program', 'SI', 'https://sightglasscoffee.com/', '33333333-3333-4333-8333-333333333333'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000046', 'Sightseer', 'Austin, TX', 'Friends and roasters Kimberly and Sara noticed women were everywhere in coffee except at the top. They founded Sightseer in 2021 to change that, sourcing 100% from women producers. With every bag, they work toward a more equitable supply chain and a brighter future for the whole industry.', 'Specialty roasting program', 'SI', 'https://sightseercoffee.co/', '11111111-1111-4111-8111-111111111111'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000047', 'Small Planes', 'Washington, DC', 'Founded in 2017, Washington, DC’s Small Planes Coffee is all about connections — within its local community and with producers at origin. A roaster that works hard without taking itself too seriously, Small Planes’ menu has options for the specialty newbie and those with more adventurous palates.', 'Specialty roasting program', 'SP', 'https://smallplanescoffee.com/', '22222222-2222-4222-8222-222222222222'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000048', 'Sparrows', 'Grand Rapids, MI', 'Envisioned as a place for local creatives to meet and collaborate, Sparrows has always put people first. Roasting came next, when in 2016 Sparrows Coffee introduced its very own specialty line to its welcoming café, which features curated work from community artists.', 'Specialty roasting program', 'SP', 'https://brewsparrows.com/', '33333333-3333-4333-8333-333333333333'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000049', 'Steady State', 'Carlsbad, CA', 'Since 2015, Steady State Roasting has been raising the bar on coffee in Southern California by never settling for mediocrity. Elliot Reinecke’s hospitality-driven small-batch roaster gets as much as it gives to its Carlsbad community, owing plenty of its success to the local support while embracing the many outdoor activities this coastal city has to offer.', 'Specialty roasting program', 'SS', 'https://www.steadystateroasting.com/', '11111111-1111-4111-8111-111111111111'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000050', 'Sterling Coffee Roasters', 'Portland, OR', 'There’s an elegance to Portland’s Sterling that comes through in everything it does, from its complex coffee to its sleek black packaging. Founded in 2010 by Adam McGovern and his business partner William Aric Miller with design in mind, this detail-oriented roaster leaves no touch unconsidered.', 'Specialty roasting program', 'SC', 'https://www.sterling.coffee/', '22222222-2222-4222-8222-222222222222'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000051', 'Temple', 'Sacramento, CA', 'Armed with the dream of creating sacred gathering places like those he encountered while traveling Indonesia, Sean Kohmescher founded Temple in 2005. This California roaster continues its global mission of education from its West Coast home in Sacramento.', 'Specialty roasting program', 'TE', 'https://templecoffee.com/', '33333333-3333-4333-8333-333333333333'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000052', 'Timeless', 'Oakland, CA', 'Oakland''s Timeless Coffee is a proud vegan roaster, bakery, and café rooted in community since 2012. Partnering with importers who empower farmers and their communities, Timeless channels a passionate commitment to quality, education, and connection into every cup it pours.', 'Specialty roasting program', 'TI', 'https://timelesscoffee.com/', '11111111-1111-4111-8111-111111111111'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000053', 'Utopian Coffee', 'Fort Wayne, IN', 'Utopian Coffee was founded more than a decade ago by two cousins who share a love for coffee and the people who grow it. Built on investing and and learning from producers across the globe, they envision a more equitable supply chain that honors people and the environment.', 'Specialty roasting program', 'UC', 'https://utopiancoffee.com/', '22222222-2222-4222-8222-222222222222'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000054', 'Verve', 'Santa Cruz, CA', 'Founded in 2007 and named for the joy of making art, Verve takes coffee seriously beneath its laid-back West Coast exterior. Colby Barr and Ryan O''Donovan''s cafés now span from LA to Tokyo, yet Verve still roasts on its beloved vintage machinery in its hometown of Santa Cruz.', 'Specialty roasting program', 'VE', 'https://www.vervecoffee.com/', '33333333-3333-4333-8333-333333333333'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000055', 'Wonderstate', 'Viroqua, WI', 'Wonderstate Coffee means it when they say farmer-focused. Caleb Nicholes and TJ Semanchin''s solar-powered roastery in Viroqua—the nation''s first—centers deeply on grower relationships. Their time spent at origin builds meaningful connections that come through clearly in every cup.', 'Specialty roasting program', 'WO', 'https://wonderstate.com/', '11111111-1111-4111-8111-111111111111')
on conflict (id) do nothing;

insert into public.posts (
  id,
  user_id,
  coffee_name,
  coffee_url,
  roaster_id,
  brew_method,
  coffee_weight,
  water_weight,
  ratio,
  country,
  varietal,
  process,
  taste_notes,
  flavor_profiles,
  rating,
  ai_advice,
  color,
  likes_count,
  reports_count,
  created_at
)
values
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
    '11111111-1111-4111-8111-111111111111',
    'Honey Process',
    'https://www.drinktrade.com/collections/alma',
    'aaaaaaaa-aaaa-4aaa-8aaa-000000000002',
    'V60',
    15.0,
    240.0,
    '1:16.0',
    'Honduras',
    'Parainema',
    'Washed',
    'Stone fruit, panela sweetness, and a really polished finish.',
    '{"Chocolatey","Sweet","Fruity"}',
    4.5,
    'Try grinding slightly finer or pouring a touch slower to build even more sweetness.',
    'bg-rose-100',
    12,
    0,
    now() - interval '2 hours'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
    '22222222-2222-4222-8222-222222222222',
    'Sermon',
    'https://www.drinktrade.com/collections/verve',
    'aaaaaaaa-aaaa-4aaa-8aaa-000000000054',
    'Aeropress',
    18.0,
    250.0,
    '1:13.9',
    'Blend',
    null,
    'Washed & Natural',
    'Blueberry pie, cocoa, and heavy body. Perfect for a rainy morning.',
    '{"Chocolatey","Sweet","Fruity"}',
    5.0,
    null,
    'bg-amber-100',
    8,
    0,
    now() - interval '1 day'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3',
    '33333333-3333-4333-8333-333333333333',
    'Phantom Limb',
    'https://www.drinktrade.com/collections/huckleberry',
    'aaaaaaaa-aaaa-4aaa-8aaa-000000000024',
    'Chemex',
    30.0,
    450.0,
    '1:15.0',
    'Ethiopia',
    'Heirloom',
    'Washed',
    'Citrus and florals came through cleanly, but I wanted a touch more body.',
    '{"Chocolatey","Fruity"}',
    3.0,
    'Break the pour into slower phases to get a little more body without muting the citrus.',
    'bg-teal-100',
    24,
    0,
    now() - interval '2 days'
  )
on conflict (id) do nothing;
